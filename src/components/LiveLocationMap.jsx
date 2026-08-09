import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { useDemo } from '../context/DemoContext';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Navigation, Phone, ExternalLink, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const mapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#334155' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] }
  ],
  disableDefaultUI: false,
  zoomControl: true
};

const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
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
};

export default function LiveLocationMap() {
  const { t } = useLanguage();
  const { coords, accuracy, error, permissionStatus } = useLiveLocation();
  const { activeDispatch, setActiveDispatch } = useDemo();
  const [resources, setResources] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ambulanceCoords, setAmbulanceCoords] = useState(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  const center = coords || { lat: 16.5167, lng: 80.6500 }; // Default to Vijayawada

  const fetchResources = async () => {
    setLoading(true);
    let allData = [];

    try {
      if (supabase) {
        // 1. Fetch hospitals
        const { data: hosp } = await supabase.from('hospitals').select('*');
        if (hosp) {
          allData.push(...hosp.map(h => ({
            id: h.id,
            name: h.name,
            lat: h.location_lat || 16.5167,
            lng: h.location_lng || 80.6500,
            type: 'hospital',
            phone: h.phone,
            details: `ICU Beds: ${h.icu_available || 0} | AVS Vials: ${h.antivenom_stock || 0}`
          })));
        }

        // 2. Fetch blood donors
        const { data: donors } = await supabase.from('blood_donors').select('*').eq('availability', true);
        if (donors) {
          allData.push(...donors.map(d => ({
            id: d.id,
            name: d.name,
            lat: d.location_lat || 16.5167,
            lng: d.location_lng || 80.6500,
            type: 'donor',
            phone: d.phone,
            details: `Blood Group: ${d.blood_group}`
          })));
        }

        // 3. Fetch disaster resources
        const { data: shelters } = await supabase.from('disaster_resources').select('*');
        if (shelters) {
          allData.push(...shelters.map(s => ({
            id: s.id,
            name: s.name,
            lat: s.location_lat || 16.5167,
            lng: s.location_lng || 80.6500,
            type: 'shelter',
            phone: s.contact_phone || '+91-866-2500100',
            details: `Resource Type: ${s.type} | Status: ${s.status || 'Active'}`
          })));
        }
      }
    } catch (e) {
      console.warn('[LiveLocationMap] Error fetching Supabase resources:', e);
    }

    // Fallback if local/mock data needed
    if (allData.length === 0) {
      allData = [
        { id: 'h1', name: 'GGH Vijayawada (Trauma Center)', lat: 16.5167, lng: 80.6500, type: 'hospital', phone: '+91-866-2472777', details: 'ICU Beds: 12 | AVS Vials: 150' },
        { id: 'd1', name: 'K. Venkata Ramana', lat: 16.5200, lng: 80.6450, type: 'donor', phone: '+91-9440123401', details: 'Blood Group: O-' },
        { id: 's1', name: 'Vijayawada Cyclone Relief Center', lat: 16.5180, lng: 80.6520, type: 'shelter', phone: '+91-866-2500100', details: 'Resource Type: Cyclone Shelter | Active' }
      ];
    }

    // Compute distance if coords available
    if (coords) {
      allData = allData.map(r => ({
        ...r,
        distance: calculateHaversineKm(coords.lat, coords.lng, r.lat, r.lng)
      })).sort((a, b) => a.distance - b.distance).slice(0, 30);
    }

    setResources(allData);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [coords]);

  // Ambulance Interpolation Loop
  useEffect(() => {
    if (activeDispatch?.active) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02; // smooth translation step
        if (progress >= 1.0) {
          clearInterval(interval);
          setAmbulanceCoords(activeDispatch.userCoords);
          setTimeout(() => {
            // Keep final location on map
          }, 3000);
        } else {
          const lat = activeDispatch.hospitalCoords.lat + (activeDispatch.userCoords.lat - activeDispatch.hospitalCoords.lat) * progress;
          const lng = activeDispatch.hospitalCoords.lng + (activeDispatch.userCoords.lng - activeDispatch.hospitalCoords.lng) * progress;
          setAmbulanceCoords({ lat, lng });
        }
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAmbulanceCoords(null);
    }
  }, [activeDispatch?.active]);

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'hospital':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'donor':
        return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'shelter':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  if (permissionStatus === 'denied') {
    return (
      <div className="p-6 bg-slate-900/90 border border-red-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-extrabold text-white">Location Access Denied</h3>
        <p className="text-xs text-slate-300 max-w-sm mx-auto">
          ResQOne needs GPS location access to display nearest hospitals, active blood donors, and local disaster shelters. Please enable location permissions in your browser or device settings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-white">Live Geolocation Tracker</h3>
        </div>
        <button
          onClick={fetchResources}
          className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-800"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {activeDispatch?.active && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-2xl flex items-center gap-2.5 animate-pulse text-xs text-red-400 font-extrabold">
          <ShieldAlert className="w-5 h-5 text-red-500 animate-spin" />
          <span>🚑 EMERGENCY ACTIVE: Ambulance dispatched from GGH Vijayawada. Transit to crash site in progress... (ETA: 4 mins)</span>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-slate-800 relative z-10">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            options={mapOptions}
          >
            {/* User current live marker (distinct green pin) */}
            {coords && (
              <Marker
                position={coords}
                icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                title="Your Current Live Position"
              />
            )}

            {/* Plot resource markers */}
            {resources.map((res) => (
              <Marker
                key={res.id}
                position={{ lat: res.lat, lng: res.lng }}
                icon={getMarkerIcon(res.type)}
                onClick={() => setSelectedMarker(res)}
              />
            ))}

            {/* Active Dispatch Moving Ambulance Polyline Route & Marker */}
            {activeDispatch?.active && ambulanceCoords && (
              <>
                <Polyline
                  path={[activeDispatch.hospitalCoords, activeDispatch.userCoords]}
                  options={{
                    strokeColor: '#ef4444',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    geodesic: true
                  }}
                />
                <Marker
                  position={ambulanceCoords}
                  icon="https://cdn-icons-png.flaticon.com/32/3448/3448339.png" // ambulance transparent png pin
                  title="Ambulance in Route"
                />
              </>
            )}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 text-slate-950 font-sans max-w-xs space-y-1.5">
                  <h4 className="font-extrabold text-xs">{selectedMarker.name}</h4>
                  <p className="text-[10px] text-slate-600">{selectedMarker.details}</p>
                  {selectedMarker.distance !== undefined && (
                    <p className="text-[10px] font-bold text-emerald-600">{selectedMarker.distance} km away</p>
                  )}
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={`tel:${selectedMarker.phone}`}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold flex items-center gap-1 min-h-[32px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold flex items-center gap-1 min-h-[32px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="h-[400px] w-full bg-slate-950 flex items-center justify-center text-slate-400">
            Loading Google Map Canvas...
          </div>
        )}
      </div>
    </div>
  );
}
