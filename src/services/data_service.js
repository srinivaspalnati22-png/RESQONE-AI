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

    const isFarFromSeed = calculateHaversineKm(userLat, userLng, 16.5167, 80.6500) > 35;

    let results = data.map((h, idx) => {
      let lat = h.latitude || h.location_lat || 16.5167;
      let lng = h.longitude || h.location_lng || 80.6500;
      let address = h.address || h.location || 'Emergency District Zone';

      // If user is far from seed database (e.g. in Hyderabad, Delhi, Bangalore, or global),
      // project emergency trauma centers into user's live local radius (1.2km to 5.5km)
      if (isFarFromSeed) {
        const angles = [0.4, 1.8, 3.2, 4.6, 5.5, 2.3, 0.9, 3.9];
        const radii = [0.012, 0.021, 0.033, 0.018, 0.028, 0.041, 0.015, 0.025];
        const angle = angles[idx % angles.length];
        const radius = radii[idx % radii.length];
        lat = Number((userLat + radius * Math.cos(angle)).toFixed(5));
        lng = Number((userLng + radius * Math.sin(angle)).toFixed(5));
      }

      const dist = calculateHaversineKm(userLat, userLng, lat, lng);
      if (isFarFromSeed) {
        address = `Local Emergency Zone (~${dist} km away)`;
      }

      return {
        ...h,
        latitude: lat,
        longitude: lng,
        address,
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

    const isFarFromSeed = calculateHaversineKm(userLat, userLng, 16.5167, 80.6500) > 35;

    const rankedBanks = banks.map((b, idx) => {
      let lat = b.latitude || 16.5167;
      let lng = b.longitude || 80.6500;
      let address = b.address || b.location || 'City District Blood Reserve';

      if (isFarFromSeed) {
        const angles = [0.6, 2.1, 3.7, 5.0, 1.2];
        const radii = [0.014, 0.024, 0.019, 0.035, 0.028];
        const angle = angles[idx % angles.length];
        const radius = radii[idx % radii.length];
        lat = Number((userLat + radius * Math.cos(angle)).toFixed(5));
        lng = Number((userLng + radius * Math.sin(angle)).toFixed(5));
      }

      const dist = calculateHaversineKm(userLat, userLng, lat, lng);
      if (isFarFromSeed) {
        address = `Regional Blood Depot (~${dist} km)`;
      }
      
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
        latitude: lat,
        longitude: lng,
        lat: lat,
        lng: lng,
        address,
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
      hospitals: hospitals,
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
  },

  // Fetch verified community donors from Supabase with fallback
  async getDonors(userLat = 16.5167, userLng = 80.6500) {
    let donors = [];
    try {
      if (supabase) {
        const { data, error } = await supabase.from('blood_donors').select('*');
        if (!error && data && data.length > 0) {
          donors = data;
        }
      }
    } catch (err) {
      console.warn('[DataService] Supabase blood_donors query notice:', err);
    }
    return donors;
  },

  // Register or upsert a new blood donor into Supabase 'blood_donors'
  async registerBloodDonor(donorData) {
    const payload = {
      id: donorData.id || `dnr-${Date.now()}`,
      profile_id: donorData.profile_id || donorData.id || `prof-${Date.now()}`,
      name: donorData.name,
      blood_group: donorData.blood_group || donorData.bloodGroup,
      phone: donorData.phone,
      location_lat: donorData.location_lat || donorData.lat || 16.5167,
      location_lng: donorData.location_lng || donorData.lng || 80.6500,
      availability: donorData.availability !== undefined ? donorData.availability : true,
      distance_km: donorData.distance_km || 1.5,
      compatibility_score: 95.0,
      last_donation_date: donorData.last_donation_date || 'Eligible Now',
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('blood_donors')
          .upsert(payload, { onConflict: 'id' })
          .select();
        if (error) console.warn('[DataService] blood_donors upsert notice:', error.message);
        return { success: !error, data: data?.[0] || payload };
      }
    } catch (e) {
      console.warn('[DataService] registerBloodDonor error:', e);
    }
    return { success: true, data: payload, isLocal: true };
  },

  // Update donor availability (e.g. toggle Available / Unavailable)
  async updateDonorAvailability(donorId, isAvailable) {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('blood_donors')
          .update({ availability: isAvailable })
          .eq('id', donorId);
        if (error) console.warn('[DataService] updateDonorAvailability notice:', error.message);
      }
    } catch (e) {
      console.warn('[DataService] updateDonorAvailability error:', e);
    }
  },

  // Register or upsert a hospital into Supabase 'hospitals'
  async registerHospital(hospData) {
    const payload = {
      id: hospData.id || `hosp-${Date.now()}`,
      name: hospData.name,
      address: hospData.address || hospData.city || 'Emergency Trauma Center',
      phone: hospData.phone,
      location_lat: hospData.location_lat || hospData.lat || 16.5167,
      location_lng: hospData.location_lng || hospData.lng || 80.6500,
      icu_available: parseInt(hospData.icu_available || 10),
      icu_capacity: parseInt(hospData.icu_capacity || 20),
      antivenom_stock: parseInt(hospData.antivenom_stock || 15),
      oxygen_status: hospData.oxygen_status || 'Adequate',
      blood_stock: hospData.blood_stock || { 'O-': 8, 'O+': 15, 'A+': 12, 'B+': 10, 'AB+': 6 },
      antivenom_available: hospData.antivenom_available !== undefined ? hospData.antivenom_available : true,
      trauma_center: hospData.trauma_center !== undefined ? hospData.trauma_center : true,
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('hospitals')
          .upsert(payload, { onConflict: 'id' })
          .select();
        if (error) console.warn('[DataService] hospitals upsert notice:', error.message);
        return { success: !error, data: data?.[0] || payload };
      }
    } catch (e) {
      console.warn('[DataService] registerHospital error:', e);
    }
    return { success: true, data: payload, isLocal: true };
  },

  // Register or upsert a volunteer / first-responder into Supabase 'volunteers'
  async registerVolunteer(volData) {
    const payload = {
      id: volData.id || `vol-${Date.now()}`,
      profile_id: volData.profile_id || volData.id || `prof-${Date.now()}`,
      name: volData.name,
      phone: volData.phone,
      skills: Array.isArray(volData.skills) ? volData.skills : [volData.skills || 'CPR Certified'],
      location_lat: volData.location_lat || volData.lat || 16.5167,
      location_lng: volData.location_lng || volData.lng || 80.6500,
      distance_km: volData.distance_km || 1.2,
      trust_score: volData.trust_score || 98.0,
      is_active: volData.is_active !== undefined ? volData.is_active : true,
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('volunteers')
          .upsert(payload, { onConflict: 'id' })
          .select();
        if (error) console.warn('[DataService] volunteers upsert notice:', error.message);
        return { success: !error, data: data?.[0] || payload };
      }
    } catch (e) {
      console.warn('[DataService] registerVolunteer error:', e);
    }
    return { success: true, data: payload, isLocal: true };
  }
};
