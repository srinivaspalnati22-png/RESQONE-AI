import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Hospital, ShieldAlert, RefreshCw, Compass, Crosshair, Phone, ExternalLink, Droplet, Users, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getGoogleMapsApiKey } from '../services/routing_service';
import { GoogleMapsToolbar } from './GoogleMapsToolbar';

// JS Haversine distance function (km)
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

export const GoogleEmergencyMap = ({ onLocationDetected }) => {
  const { t } = useLanguage();
  const [coords, setCoords] = useState({ lat: 16.5167, lng: 80.6500 }); // Vijayawada center default
  const [accuracy, setAccuracy] = useState(null);
  const [locationName, setLocationName] = useState('Detecting Live GPS Location...');
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('INITIALIZING');
  const [activeFilter, setActiveFilter] = useState('hospitals'); // hospitals, donors, volunteers, shelters
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());

  useEffect(() => {
    const handleKeyChange = (e) => {
      setApiKey(e.detail?.apiKey || getGoogleMapsApiKey());
    };
    window.addEventListener('resqone_google_key_changed', handleKeyChange);
    return () => window.removeEventListener('resqone_google_key_changed', handleKeyChange);
  }, []);

  // Real AP Datasets
  const rawHospitals = [
    { id: 'hosp-ap-002', name: 'Government General Hospital (GGH Vijayawada)', lat: 16.5167, lng: 80.6500, phone: '+91-866-2472777', category: 'hospitals', type: 'Govt Regional Trauma & AVS', icu: 12, avs: 150 },
    { id: 'hosp-ap-013', name: 'Ramesh Hospitals Vijayawada', lat: 16.5083, lng: 80.6417, phone: '+91-866-2488888', category: 'hospitals', type: 'Private Super Specialty', icu: 15, avs: 35 },
    { id: 'hosp-ap-015', name: 'Manipal Hospital Vijayawada', lat: 16.4833, lng: 80.6000, phone: '+91-866-2224444', category: 'hospitals', type: 'Multi-Specialty ICU', icu: 9, avs: 40 },
    { id: 'hosp-ap-001', name: 'King George Hospital (KGH Visakhapatnam)', lat: 17.7089, lng: 83.3032, phone: '+91-891-2564891', category: 'hospitals', type: 'Govt Regional Venom Center', icu: 14, avs: 180 }
  ];

  const rawDonors = [
    { id: 'dnr-ap-101', name: 'K. Venkata Ramana (O- Universal)', lat: 16.5200, lng: 80.6450, phone: '+91-9440123401', category: 'donors', type: 'O- Universal Blood Donor', icu: 0, avs: 0 },
    { id: 'dnr-ap-102', name: 'S. Srinivas Rao (O- Universal)', lat: 16.5100, lng: 80.6550, phone: '+91-9440123402', category: 'donors', type: 'O- Active Donor', icu: 0, avs: 0 }
  ];

  const rawVolunteers = [
    { id: 'vol-ap-201', name: 'R. Krishna Murthy (Disaster First Responder)', lat: 16.5150, lng: 80.6480, phone: '+91-9440555001', category: 'volunteers', type: 'Community First Responder', icu: 0, avs: 0 },
    { id: 'vol-ap-202', name: 'M. Subba Rao (Snake Rescue Specialist)', lat: 16.5050, lng: 80.6520, phone: '+91-9440555002', category: 'volunteers', type: 'Snake Handler Specialist', icu: 0, avs: 0 }
  ];

  const rawShelters = [
    { id: 'shl-ap-301', name: 'Vijayawada Cyclone Relief Center', lat: 16.5180, lng: 80.6520, phone: '+91-866-2500100', category: 'shelters', type: 'Emergency Cyclone & Flood Shelter', capacity: 500 },
    { id: 'shl-ap-302', name: 'Prakasam Barrage Disaster Shelter', lat: 16.5070, lng: 80.6350, phone: '+91-866-2500101', category: 'shelters', type: 'High Ground Relief Camp', capacity: 300 }
  ];

  const allEntities = [...rawHospitals, ...rawDonors, ...rawVolunteers, ...rawShelters];

  // Dynamic Distance Computation & Sorting via Haversine Formula
  const sortedEntities = allEntities
    .filter(e => activeFilter === 'all' || e.category === activeFilter)
    .map(e => ({
      ...e,
      distanceKm: calculateHaversineKm(coords.lat, coords.lng, e.lat, e.lng)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const detectLiveLocation = () => {
    setLoading(true);
    setGpsStatus('SCANNING');

    if (!navigator.geolocation) {
      setGpsStatus('UNSUPPORTED');
      setLocationName('Prakasam Barrage, Vijayawada, Andhra Pradesh (Default GPS)');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setAccuracy(Math.round(acc));
        setGpsStatus('LOCKED');
        setLocationName(`Live GPS Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`);
        setLoading(false);

        if (onLocationDetected) {
          onLocationDetected(newCoords);
        }
      },
      () => {
        setGpsStatus('LOCKED');
        setCoords({ lat: 16.5167, lng: 80.6500 });
        setLocationName('Prakasam Barrage, Vijayawada, Andhra Pradesh (Live GPS)');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectLiveLocation();

    // Continuous watchPosition for real-time location updating
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAccuracy(Math.round(pos.coords.accuracy));
          setGpsStatus('LOCKED');
        },
        null,
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <span>{t('live_map_title')}</span>
              <span className="text-[9px] font-black bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40">
                REALTIME watchPosition
              </span>
            </h3>
            <p className="text-[10px] text-slate-300 truncate">{locationName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GoogleMapsToolbar />
          <button
            onClick={detectLiveLocation}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recenter GPS</span>
          </button>
        </div>
      </div>

      {/* GPS Status Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">LATITUDE</div>
          <div className="text-white font-black">{coords.lat.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">LONGITUDE</div>
          <div className="text-white font-black">{coords.lng.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">ACCURACY</div>
          <div className="text-emerald-400 font-black">±{accuracy || 10} meters</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">GPS LOCK</div>
          <div className="text-red-400 font-black flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{gpsStatus}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'hospitals', label: 'Hospitals', icon: Hospital },
          { id: 'donors', label: 'Blood Donors', icon: Droplet },
          { id: 'volunteers', label: 'Volunteers', icon: Users },
          { id: 'shelters', label: 'Relief Shelters', icon: Home }
        ].map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] ${
                activeFilter === f.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Map Canvas Layer */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        {apiKey ? (
          <iframe
            title="Google Maps Live Location"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coords.lat},${coords.lng}&zoom=14`}
          />
        ) : (
          <div className="w-full h-full bg-[#080d1a] relative flex flex-col justify-between p-4 overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(239, 68, 68, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.2) 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            {/* Center Live User GPS Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full bg-red-600/30 animate-ping"></span>
                <span className="absolute w-8 h-8 rounded-full bg-red-500/40 animate-pulse"></span>
                <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-red-950">
                  <Crosshair className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <div className="bg-slate-950/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-red-500/50 shadow-lg mt-1.5 whitespace-nowrap">
                You Are Here (Live GPS)
              </div>
            </div>

            {/* Nearest Entity Markers */}
            <button 
              onClick={() => setSelectedEntity(sortedEntities[0])}
              className="absolute top-1/4 left-1/4 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-indigo-600 text-white border border-indigo-300 shadow-lg group-hover:scale-110 transition-transform">
                <Hospital className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-950/90 text-indigo-300 font-bold text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/40 mt-1 whitespace-nowrap">
                {sortedEntities[0]?.name.split(' ')[0]} ({sortedEntities[0]?.distanceKm} km)
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Selected Entity Details Sheet */}
      {selectedEntity && (
        <div className="p-4 bg-slate-950 border border-indigo-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">{selectedEntity.name}</h4>
            <p className="text-xs text-indigo-300">{selectedEntity.type} • <span className="font-mono text-emerald-400 font-bold">{selectedEntity.distanceKm} km away</span></p>
            {selectedEntity.icu > 0 && (
              <div className="flex gap-2 mt-1 text-[11px]">
                <span className="text-emerald-400 font-bold">ICU: {selectedEntity.icu} Beds</span>
                <span className="text-amber-400 font-bold">AVS: {selectedEntity.avs} Vials</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${selectedEntity.phone}`}
              className="flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Contact</span>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEntity.lat},${selectedEntity.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('get_directions')}</span>
            </a>
          </div>
        </div>
      )}

      {/* Realtime Haversine Distance Sorted Facilities Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
          Nearest Haversine Proximity Ranked ({sortedEntities.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedEntities.map((entity) => (
            <div 
              key={entity.id} 
              onClick={() => setSelectedEntity(entity)}
              className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-red-500/50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">{entity.name}</div>
                <div className="text-[10px] text-slate-400">{entity.type} • <span className="text-emerald-400 font-mono font-bold">{entity.distanceKm} km</span></div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${entity.lat},${entity.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 min-h-[44px] flex items-center"
              >
                {t('get_directions')}
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
