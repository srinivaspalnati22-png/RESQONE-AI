/**
 * RESQONE-AI+ Dynamic Real Road Routing & Google Maps Service
 * - Supports Google Maps Directions API & Google Maps JS SDK (when VITE_GOOGLE_MAPS_API_KEY is configured)
 * - Seamless fallback to high-precision OSRM (Open Source Routing Machine) real-world road networks
 * - Supports Google Maps Roadmap, Satellite, and Hybrid tile overlays
 */

const STORAGE_KEY = 'GOOGLE_MAPS_API_KEY';

export const getGoogleMapsApiKey = () => {
  const envKey = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  if (envKey) {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, envKey);
    return envKey;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  }
  return 'AIzaSyCiBYqsfwvsP72VWyKzC6BuwTBXcvngYyQ';
};

export const resetGoogleMapsSdk = () => {
  googleScriptLoadingPromise = null;
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('google-maps-sdk-script');
    if (existing) existing.remove();
  }
};

export const setGoogleMapsApiKey = (key) => {
  if (typeof window !== 'undefined') {
    resetGoogleMapsSdk();
    if (key && key.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('resqone_google_key_changed', { detail: { apiKey: key } }));
  }
};

let googleScriptLoadingPromise = null;

export const loadGoogleMapsSdk = (apiKey = getGoogleMapsApiKey()) => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  if (!apiKey) return Promise.resolve(null);

  if (googleScriptLoadingPromise) return googleScriptLoadingPromise;

  googleScriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = 'google-maps-sdk-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google ? window.google.maps : null);
    script.onerror = (err) => {
      console.warn('[GoogleMapsSdk] Failed to load Google Maps SDK script:', err);
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return googleScriptLoadingPromise;
};

/**
 * Compute real-world street routing between two GPS points
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {Promise<{ coordinates: [number, number][], distanceKm: number, durationMin: number, turns: string[] }>}
 */
export async function calculateRealRoadRoute(originLat, originLng, destLat, destLng) {
  const apiKey = getGoogleMapsApiKey();

  // 1. Try Google Maps DirectionsService if SDK is active
  if (apiKey && typeof window !== 'undefined') {
    try {
      const maps = await loadGoogleMapsSdk(apiKey);
      if (maps && maps.DirectionsService) {
        const directionsService = new maps.DirectionsService();
        const googleRoute = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: new maps.LatLng(originLat, originLng),
              destination: new maps.LatLng(destLat, destLng),
              travelMode: maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === 'OK' && result?.routes?.[0]) {
                resolve(result.routes[0]);
              } else {
                reject(new Error(`Google Directions status: ${status}`));
              }
            }
          );
        });

        if (googleRoute && googleRoute.overview_path) {
          const coordinates = googleRoute.overview_path.map((latLng) => [latLng.lat(), latLng.lng()]);
          const leg = googleRoute.legs?.[0];
          const distKm = leg?.distance?.value ? parseFloat((leg.distance.value / 1000).toFixed(2)) : 0;
          const durMin = leg?.duration?.value ? Math.round(leg.duration.value / 60) : 0;
          const turns = (leg?.steps || []).map((s) => s.instructions?.replace(/<[^>]*>/g, '') || '');

          return {
            source: 'Google Maps Directions API',
            coordinates,
            distanceKm: distKm,
            durationMin: durMin,
            turns
          };
        }
      }
    } catch (e) {
      console.warn('[RoutingService] Google Directions fallback to OSRM:', e.message);
    }
  }

  // 2. High-precision Real Road Routing via OSRM (100% Free, Zero Key, Real Streets)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((pt) => [pt[1], pt[0]]);
        const distKm = parseFloat((route.distance / 1000).toFixed(2));
        const durMin = Math.max(1, Math.round(route.duration / 60));
        const turns = [];

        if (route.legs?.[0]?.steps) {
          for (const s of route.legs[0].steps) {
            const maneuver = s.maneuver?.type || 'turn';
            const name = s.name ? ` onto ${s.name}` : '';
            turns.push(`${maneuver}${name}`);
          }
        }

        return {
          source: 'OSRM Real Street Network',
          coordinates,
          distanceKm: distKm,
          durationMin: durMin,
          turns
        };
      }
    }
  } catch (err) {
    console.warn('[RoutingService] OSRM network error, using kinematic interpolation:', err.message);
  }

  // 3. Mathematical Kinematic Interpolation Fallback
  const steps = 24;
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add subtle realistic roadway curve
    const arc = Math.sin(t * Math.PI) * 0.003;
    const lat = originLat + (destLat - originLat) * t + arc;
    const lng = originLng + (destLng - originLng) * t + arc * 0.5;
    coordinates.push([lat, lng]);
  }

  const dLat = (destLat - originLat) * 111;
  const dLng = (destLng - originLng) * 111 * Math.cos((originLat * Math.PI) / 180);
  const distKm = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2));

  return {
    source: 'Kinematic Interpolation Fallback',
    coordinates,
    distanceKm: distKm,
    durationMin: Math.max(1, Math.round(distKm * 1.6)),
    turns: ['Head towards destination']
  };
}

/**
 * Returns Google Map Tile URL or OpenStreetMap fallback
 * @param {'hybrid' | 'roadmap' | 'satellite' | 'dark'} layerType
 * @param {string} apiKey
 */
export function getTileLayerConfig(layerType = 'hybrid', apiKey = getGoogleMapsApiKey()) {
  const keyParam = apiKey ? `&key=${apiKey}` : '';

  if (layerType === 'satellite') {
    return {
      url: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}${keyParam}`,
      attribution: '&copy; Google Maps Satellite',
      maxZoom: 20
    };
  }

  if (layerType === 'hybrid') {
    return {
      url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${keyParam}`,
      attribution: '&copy; Google Maps Satellite & Streets Hybrid',
      maxZoom: 20
    };
  }

  if (layerType === 'roadmap') {
    return {
      url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`,
      attribution: '&copy; Google Maps Standard Road Network',
      maxZoom: 20
    };
  }

  if (layerType === 'dark') {
    return {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB & OpenStreetMap',
      maxZoom: 19
    };
  }

  // Default clean OpenStreetMap
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  };
}

/**
 * Universal, CORS-friendly geocoding helper using Google Geocoder + Photon OpenStreetMap
 * @param {string} query
 * @returns {Promise<Array<{ name: string, shortName: string, lat: number, lng: number, type: string }>>}
 */
export async function geocodeLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];
  const cleanQuery = query.trim();

  // 1. Try Google Maps Geocoder if SDK is available
  if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await new Promise((resolve) => {
        geocoder.geocode({ address: cleanQuery }, (res, status) => {
          if (status === 'OK' && res?.length > 0) resolve(res);
          else resolve(null);
        });
      });
      if (results && results.length > 0) {
        return results.slice(0, 6).map((item) => ({
          name: item.formatted_address || cleanQuery,
          shortName: item.address_components?.[0]?.long_name || cleanQuery,
          lat: item.geometry.location.lat(),
          lng: item.geometry.location.lng(),
          type: 'google'
        }));
      }
    } catch (e) {
      console.warn('[RoutingService] Google geocoder failed, falling back to Photon:', e.message);
    }
  }

  // 2. High-speed, CORS-friendly Photon OpenStreetMap Geocoding API (100% free, zero rate limit 403)
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features.map((f) => {
          const props = f.properties || {};
          const title = props.name || props.street || cleanQuery;
          const locParts = [props.street, props.city || props.town || props.locality, props.state, props.country].filter(Boolean);
          const fullName = locParts.length > 0 ? `${title}, ${locParts.join(', ')}` : title;
          return {
            name: fullName,
            shortName: title,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            type: props.osm_value === 'hospital' ? 'hospital' : props.type || 'place'
          };
        });
      }
    }
  } catch (err) {
    console.warn('[RoutingService] Photon geocoding network error:', err.message);
  }

  return [];
}

