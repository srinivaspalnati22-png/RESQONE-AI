import { supabase } from '../lib/supabaseClient';
import hospitalsSeed from '../data/hospitals.json';
import bloodBanksSeed from '../data/blood_banks.json';
import snakeSpeciesSeed from '../data/snake_species.json';
import accidentRecordsSeed from '../data/accident_records.json';

// Standard ABO & Rh blood compatibility matrix
export const BLOOD_COMPATIBILITY_MATRIX = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

// Haversine distance calculation in kilometers
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export const DataService = {
  // Fetch hospitals from Supabase or fallback
  async getHospitals(userLat = 16.5167, userLng = 80.6500, filters = {}) {
    let data = null;
    try {
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('hospitals')
          .select('*');
        if (!error && dbData && dbData.length > 0) {
          data = dbData;
        }
      }
    } catch (e) {
      console.warn('[DataService] Supabase hospitals query fallback to seed:', e);
    }

    if (!data || data.length === 0) {
      data = hospitalsSeed;
    }

    let results = data.map(h => {
      const lat = h.latitude || h.location_lat || 16.5167;
      const lng = h.longitude || h.location_lng || 80.6500;
      const dist = calculateHaversineKm(userLat, userLng, lat, lng);
      return {
        ...h,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
        antivenom_available: h.antivenom_available ?? (h.antivenom_stock > 0),
        icu_available: h.icu_available ?? 10
      };
    });

    if (filters.requiresAntivenom) {
      results = results.filter(h => h.antivenom_available);
    }
    if (filters.requiresIcu) {
      results = results.filter(h => h.icu_available > 0);
    }

    return results.sort((a, b) => a.distanceKm - b.distanceKm);
  },

  // Fetch blood banks & match with hard rules
  async matchBloodResources(recipientBloodGroup, unitsNeeded = 1, userLat = 16.5167, userLng = 80.6500) {
    const compatibleGroups = BLOOD_COMPATIBILITY_MATRIX[recipientBloodGroup.toUpperCase()] || [recipientBloodGroup];

    let banks = null;
    try {
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('blood_banks')
          .select('*');
        if (!error && dbData && dbData.length > 0) {
          banks = dbData;
        }
      }
    } catch (e) {
      console.warn('[DataService] Supabase blood banks fallback to seed:', e);
    }

    if (!banks || banks.length === 0) {
      banks = bloodBanksSeed;
    }

    const rankedBanks = banks.map(b => {
      const lat = b.latitude || 16.5167;
      const lng = b.longitude || 80.6500;
      const dist = calculateHaversineKm(userLat, userLng, lat, lng);
      
      const stock = b.blood_stock || {};
      let totalCompatibleUnits = 0;
      const stockBreakdown = {};

      compatibleGroups.forEach(grp => {
        const count = stock[grp] || 0;
        stockBreakdown[grp] = count;
        totalCompatibleUnits += count;
      });

      const isExactMatchAvailable = (stock[recipientBloodGroup] || 0) >= unitsNeeded;
      const isCompatibleAvailable = totalCompatibleUnits >= unitsNeeded;

      // Score based on distance & exact vs compatible availability
      let matchScore = 100 - (dist * 1.5);
      if (isExactMatchAvailable) matchScore += 15;
      else if (isCompatibleAvailable) matchScore += 5;
      else matchScore -= 30;

      return {
        ...b,
        distanceKm: dist,
        totalCompatibleUnits,
        stockBreakdown,
        isExactMatchAvailable,
        isCompatibleAvailable,
        matchScore: Math.max(10, Math.min(100, parseFloat(matchScore.toFixed(1)))),
        reason: isExactMatchAvailable
          ? `Exact ${recipientBloodGroup} stock available (${stock[recipientBloodGroup]} units)`
          : isCompatibleAvailable
          ? `Compatible donor groups available (${totalCompatibleUnits} units: ${compatibleGroups.filter(g => stock[g] > 0).join(', ')})`
          : `Critically low stock for ${recipientBloodGroup}; alert dispatched to mobile network`
      };
    });

    return {
      recipientBloodGroup,
      compatibleGroups,
      unitsNeeded,
      results: rankedBanks.sort((a, b) => b.matchScore - a.matchScore)
    };
  },

  // Snakebite symptom risk triage & species lookup
  async assessSnakebite(inputQuery, symptoms = [], userLat = 16.5167, userLng = 80.6500) {
    let speciesList = null;
    try {
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('snake_species')
          .select('*');
        if (!error && dbData && dbData.length > 0) {
          speciesList = dbData;
        }
      }
    } catch (e) {
      console.warn('[DataService] Supabase snake species fallback to seed:', e);
    }

    if (!speciesList || speciesList.length === 0) {
      speciesList = snakeSpeciesSeed;
    }

    const queryLower = (inputQuery || '').toLowerCase();
    
    // Find best matching species
    let matchedSpecies = speciesList.find(s => 
      queryLower.includes(s.common_name.toLowerCase()) || 
      queryLower.includes(s.scientific_name.toLowerCase()) ||
      (s.identifying_markers && s.identifying_markers.some(m => queryLower.includes(m.toLowerCase())))
    );

    if (!matchedSpecies) {
      if (queryLower.includes('cobra') || queryLower.includes('hood')) {
        matchedSpecies = speciesList[0];
      } else if (queryLower.includes('viper') || queryLower.includes('spot') || queryLower.includes('triangle')) {
        matchedSpecies = speciesList[1];
      } else if (queryLower.includes('krait') || queryLower.includes('band') || queryLower.includes('night')) {
        matchedSpecies = speciesList[2];
      } else {
        matchedSpecies = speciesList[0]; // Default decision support archetype
      }
    }

    // Risk and urgency determination
    let riskTier = matchedSpecies.urgency || 'CRITICAL';
    let isNeurotoxic = (matchedSpecies.venom_type || '').includes('NEUROTOXIC');
    let isHemotoxic = (matchedSpecies.venom_type || '').includes('HEMOTOXIC');

    // Fetch nearest antivenom hospital
    const hospitals = await this.getHospitals(userLat, userLng, { requiresAntivenom: true });
    const nearestHospital = hospitals[0] || null;

    return {
      species: matchedSpecies,
      riskTier,
      isNeurotoxic,
      isHemotoxic,
      antivenomRequired: matchedSpecies.antivenom_required ?? true,
      nearestAvsFacility: nearestHospital,
      allAvsFacilities: hospitals.slice(0, 3),
      disclaimer: "DECISION SUPPORT ONLY — Not a clinical diagnosis. Immediately transport patient to the nearest antivenom-equipped emergency hospital."
    };
  },

  // Accident records lookup for hot-spot risk analysis
  async getAccidentRecords(district = '') {
    let records = null;
    try {
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('accident_records')
          .select('*');
        if (!error && dbData && dbData.length > 0) {
          records = dbData;
        }
      }
    } catch (e) {
      console.warn('[DataService] Supabase accident records fallback to seed:', e);
    }

    if (!records || records.length === 0) {
      records = accidentRecordsSeed;
    }

    if (district) {
      return records.filter(r => r.district.toLowerCase() === district.toLowerCase());
    }
    return records;
  }
};
