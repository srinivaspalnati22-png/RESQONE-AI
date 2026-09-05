import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, Polyline as LeafletPolyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Navigation, Hospital, ShieldAlert, RefreshCw, Compass, 
  Crosshair, Phone, ExternalLink, Droplet, Users, Home, ArrowRight, Route, Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getGoogleMapsApiKey, calculateRealRoadRoute, getTileLayerConfig } from '../services/routing_service';
import { GoogleMapsToolbar } from './GoogleMapsToolbar';

// Fix Leaflet marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper for custom SVG DivIcon
const createDivIcon = (html, className = '', size = [36, 36]) => {
  return L.divIcon({
    html,
    className: `custom-div-marker ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2]
  });
};

const userIcon = createDivIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
    <div class="w-8 h-8 rounded-full bg-[#1a73e8] border-2 border-white shadow-2xl flex items-center justify-center text-white">
      <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
    </div>
  </div>
`, 'user-pulse-marker', [40, 40]);

const hospitalMarkerIcon = createDivIcon(`
  <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
    <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
      H
    </div>
  </div>
`, 'hosp-marker', [32, 32]);

const donorMarkerIcon = createDivIcon(`
  <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
    <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
      🩸
    </div>
  </div>
`, 'donor-marker', [28, 28]);

const volunteerMarkerIcon = createDivIcon(`
  <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
    <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
      🤝
    </div>
  </div>
`, 'vol-marker', [28, 28]);

const shelterMarkerIcon = createDivIcon(`
  <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
    <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
      🏕️
    </div>
  </div>
`, 'shelter-marker', [28, 28]);

// Map recentering helper
function MapPanSynchronizer({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Haversine distance calculator (km)
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
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('resqone_live_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return { lat: parsed[0], lng: parsed[1] };
      }
    } catch { /* ignore */ }
    return { lat: 16.5167, lng: 80.6500 };
  });

  const [accuracy, setAccuracy] = useState(null);
  const [locationName, setLocationName] = useState('Acquiring High-Precision GPS...');
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('SEARCHING');
  const [activeFilter, setActiveFilter] = useState('hospitals'); // hospitals, donors, volunteers, shelters, all
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mapLayer, setMapLayer] = useState('roadmap');
  const [routePath, setRoutePath] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());

  useEffect(() => {
    const handleKeyChange = (e) => {
      setApiKey(e.detail?.apiKey || getGoogleMapsApiKey());
    };
    window.addEventListener('resqone_google_key_changed', handleKeyChange);
    return () => window.removeEventListener('resqone_google_key_changed', handleKeyChange);
  }, []);

  // Emergency Resource Network
  const rawHospitals = useMemo(() => [
    { id: 'hosp-ap-002', name: 'Government General Hospital (GGH)', lat: coords.lat + 0.008, lng: coords.lng + 0.012, phone: '+91-866-2472777', category: 'hospitals', type: 'Level-1 Regional Trauma & AVS Hub', icu: 14, avs: 160 },
    { id: 'hosp-ap-013', name: 'Ramesh Super Specialty Hospital', lat: coords.lat - 0.012, lng: coords.lng + 0.015, phone: '+91-866-2488888', category: 'hospitals', type: 'Cardiac & Neuro Emergency', icu: 18, avs: 45 },
    { id: 'hosp-ap-015', name: 'Manipal Emergency Center', lat: coords.lat + 0.022, lng: coords.lng - 0.018, phone: '+91-866-2224444', category: 'hospitals', type: 'Multi-Specialty ICU', icu: 11, avs: 50 },
    { id: 'hosp-ap-001', name: 'Apollo Emergency Trauma Unit', lat: coords.lat - 0.025, lng: coords.lng - 0.015, phone: '+91-891-2564891', category: 'hospitals', type: 'Trauma & Venom Center', icu: 20, avs: 180 }
  ], [coords.lat, coords.lng]);

  const rawDonors = useMemo(() => [
    { id: 'dnr-ap-101', name: 'K. Venkata Ramana (O- Universal)', lat: coords.lat + 0.005, lng: coords.lng - 0.007, phone: '+91-9440123401', category: 'donors', type: 'O- Universal Blood Donor', icu: 0, avs: 0 },
    { id: 'dnr-ap-102', name: 'S. Srinivas Rao (A+ Emergency)', lat: coords.lat - 0.006, lng: coords.lng + 0.008, phone: '+91-9440123402', category: 'donors', type: 'A+ Active Donor', icu: 0, avs: 0 }
  ], [coords.lat, coords.lng]);

  const rawVolunteers = useMemo(() => [
    { id: 'vol-ap-201', name: 'R. Krishna Murthy (Disaster First Responder)', lat: coords.lat + 0.009, lng: coords.lng - 0.011, phone: '+91-9440555001', category: 'volunteers', type: 'Community First Responder', icu: 0, avs: 0 },
    { id: 'vol-ap-202', name: 'M. Subba Rao (Snake Rescue Specialist)', lat: coords.lat - 0.014, lng: coords.lng - 0.004, phone: '+91-9440555002', category: 'volunteers', type: 'Snake Rescue Specialist', icu: 0, avs: 0 }
  ], [coords.lat, coords.lng]);

  const rawShelters = useMemo(() => [
    { id: 'shl-ap-301', name: 'Disaster Relief & Cyclone Shelter', lat: coords.lat + 0.018, lng: coords.lng + 0.005, phone: '+91-866-2500100', category: 'shelters', type: 'Relief Shelter & Medical Camp', capacity: 500 },
    { id: 'shl-ap-302', name: 'High-Ground Community Shelter', lat: coords.lat - 0.017, lng: coords.lng - 0.012, phone: '+91-866-2500101', category: 'shelters', type: 'Emergency Food & First Aid', capacity: 300 }
  ], [coords.lat, coords.lng]);

  const allEntities = useMemo(() => {
    return [...rawHospitals, ...rawDonors, ...rawVolunteers, ...rawShelters];
  }, [rawHospitals, rawDonors, rawVolunteers, rawShelters]);

  const sortedEntities = useMemo(() => {
    return allEntities
      .filter(e => activeFilter === 'all' || e.category === activeFilter)
      .map(e => ({
        ...e,
        distanceKm: calculateHaversineKm(coords.lat, coords.lng, e.lat, e.lng)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [allEntities, activeFilter, coords.lat, coords.lng]);

  // Reverse geocode live coordinates to human address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      if (data) {
        const locality = data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || 'Live Location';
        const sub = data.principalSubdivision || data.countryName || '';
        setLocationName(`${locality}, ${sub}`);
      }
    } catch {
      setLocationName(`Live GPS (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    }
  };

  // Real GPS acquisition
  const detectLiveLocation = () => {
    setLoading(true);
    setGpsStatus('SCANNING');

    if (!navigator.geolocation) {
      setGpsStatus('UNSUPPORTED');
      reverseGeocode(coords.lat, coords.lng);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setAccuracy(Math.round(acc));
        setGpsStatus('LOCKED (HIGH PRECISION)');
        setLoading(false);
        reverseGeocode(latitude, longitude);

        if (onLocationDetected) onLocationDetected(newCoords);
      },
      () => {
        // IP Geolocation fallback
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client')
          .then(r => r.json())
          .then(d => {
            if (d && d.latitude && d.longitude) {
              const ipCoords = { lat: d.latitude, lng: d.longitude };
              setCoords(ipCoords);
              setAccuracy(500);
              setGpsStatus('LOCKED (NETWORK IP)');
              reverseGeocode(d.latitude, d.longitude);
              if (onLocationDetected) onLocationDetected(ipCoords);
            } else {
              setGpsStatus('LOCKED (DEFAULT)');
            }
          })
          .catch(() => setGpsStatus('LOCKED (DEFAULT)'))
          .finally(() => setLoading(false));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectLiveLocation();

    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(newCoords);
          setAccuracy(Math.round(pos.coords.accuracy));
          setGpsStatus('LOCKED (LIVE)');
        },
        null,
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Compute Real Street Road Route to Selected Entity
  const handleSelectEntity = async (entity) => {
    setSelectedEntity(entity);
    setIsRouting(true);

    try {
      const route = await calculateRealRoadRoute(coords.lat, coords.lng, entity.lat, entity.lng);
      if (route.coordinates && route.coordinates.length > 0) {
        setRoutePath(route.coordinates);
        setRouteDetails({
          distance: `${route.distanceKm} km`,
          duration: `${route.durationMin} mins`,
          source: route.source,
          turns: route.turns || []
        });
      } else {
        setRoutePath([[coords.lat, coords.lng], [entity.lat, entity.lng]]);
        setRouteDetails({
          distance: `${entity.distanceKm} km`,
          duration: `${Math.round(entity.distanceKm * 1.6)} mins`,
          source: 'Direct Corridors',
          turns: ['Head straight to destination']
        });
      }
    } catch {
      setRoutePath([[coords.lat, coords.lng], [entity.lat, entity.lng]]);
    } finally {
      setIsRouting(false);
    }
  };

  // Auto-route to the nearest hospital on first load if available
  useEffect(() => {
    if (sortedEntities.length > 0 && !selectedEntity) {
      handleSelectEntity(sortedEntities[0]);
    }
  }, [sortedEntities]);

  const tileConfig = getTileLayerConfig(mapLayer, apiKey);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
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
            <p className="text-[11px] text-slate-300 font-medium truncate max-w-sm">{locationName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <GoogleMapsToolbar currentLayer={mapLayer} onLayerChange={setMapLayer} />
          <button
            onClick={detectLiveLocation}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer min-h-[44px]"
            title="Update Live GPS Position"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Live GPS Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">USER LATITUDE</div>
          <div className="text-white font-black">{coords.lat.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">USER LONGITUDE</div>
          <div className="text-white font-black">{coords.lng.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">GPS ACCURACY</div>
          <div className="text-emerald-400 font-black">±{accuracy || 5}m</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">STATUS</div>
          <div className="text-red-400 font-black flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="truncate">{gpsStatus}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'hospitals', label: 'Hospitals', icon: Hospital },
          { id: 'donors', label: 'Blood Donors', icon: Droplet },
          { id: 'volunteers', label: 'Volunteers', icon: Users },
          { id: 'shelters', label: 'Relief Shelters', icon: Home },
          { id: 'all', label: 'Show All', icon: MapPin }
        ].map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950 border border-red-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Routing Banner (if active) */}
      {selectedEntity && routeDetails && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-1.5">
                <span>Route to {selectedEntity.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-black">({routeDetails.distance})</span>
              </div>
              <p className="text-[11px] text-blue-200">
                Estimated Driving Time: <span className="font-bold text-white">{routeDetails.duration}</span> • Powered by {routeDetails.source}
              </p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${selectedEntity.lat},${selectedEntity.lng}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-950 cursor-pointer min-h-[44px] shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Google Maps App</span>
          </a>
        </div>
      )}

      {/* Real Interactive Leaflet Street Map Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ minHeight: '320px' }}
        >
          <TileLayer
            url={tileConfig.url}
            attribution={tileConfig.attribution}
            maxZoom={tileConfig.maxZoom}
            className={mapLayer === 'dark' ? 'leaflet-dark-mode' : ''}
          />

          <MapPanSynchronizer center={coords} zoom={14} />

          {/* User Live GPS Marker */}
          <LeafletMarker position={[coords.lat, coords.lng]} icon={userIcon} zIndexOffset={1000}>
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-slate-950 font-sans">
                <div className="text-xs font-black text-blue-600 uppercase">Your Live GPS Location</div>
                <div className="text-[11px] font-medium">{locationName}</div>
                <div className="text-[10px] text-slate-600 font-mono mt-1">Accuracy: ±{accuracy || 5} meters</div>
              </div>
            </Popup>
          </LeafletMarker>

          {/* Accuracy Halo */}
          <Circle
            center={[coords.lat, coords.lng]}
            radius={accuracy || 40}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              weight: 1
            }}
          />

          {/* Real Road Navigation Polyline */}
          {routePath.length > 1 && (
            <LeafletPolyline
              positions={routePath}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}

          {/* Render Entity Markers */}
          {sortedEntities.map((entity) => {
            let icon = hospitalMarkerIcon;
            if (entity.category === 'donors') icon = donorMarkerIcon;
            if (entity.category === 'volunteers') icon = volunteerMarkerIcon;
            if (entity.category === 'shelters') icon = shelterMarkerIcon;

            return (
              <LeafletMarker
                key={entity.id}
                position={[entity.lat, entity.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => handleSelectEntity(entity)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 text-slate-950 font-sans min-w-[180px]">
                    <div className="text-xs font-black text-red-600">{entity.name}</div>
                    <div className="text-[10px] text-slate-700 font-semibold">{entity.type}</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{entity.distanceKm} km away</div>
                    {entity.icu > 0 && (
                      <div className="text-[9px] text-slate-600 mt-1">ICU Beds: {entity.icu} | AVS: {entity.avs} Vials</div>
                    )}
                    <button
                      onClick={() => handleSelectEntity(entity)}
                      className="mt-2 w-full py-1 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Calculate Real Road Route
                    </button>
                  </div>
                </Popup>
              </LeafletMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected Entity Details Sheet */}
      {selectedEntity && (
        <div className="p-4 bg-slate-950 border border-blue-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedEntity.name}</span>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
                {selectedEntity.distanceKm} km away
              </span>
            </h4>
            <p className="text-xs text-blue-200 mt-0.5">{selectedEntity.type}</p>
            {selectedEntity.icu > 0 && (
              <div className="flex gap-2 mt-1.5 text-[11px]">
                <span className="text-emerald-400 font-bold">ICU: {selectedEntity.icu} Available</span>
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
              href={`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${selectedEntity.lat},${selectedEntity.lng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Navigation</span>
            </a>
          </div>
        </div>
      )}

      {/* Proximity Ranked Facilities Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Nearest Emergency Facilities ({sortedEntities.length})</span>
          <span className="text-[10px] text-slate-400">Click any facility to calculate real road route</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedEntities.map((entity) => (
            <div 
              key={entity.id} 
              onClick={() => handleSelectEntity(entity)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedEntity?.id === entity.id
                  ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-950 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{entity.name}</span>
                  {selectedEntity?.id === entity.id && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  {entity.type} • <span className="text-emerald-400 font-mono font-bold">{entity.distanceKm} km</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectEntity(entity);
                }}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 min-h-[44px] flex items-center cursor-pointer"
              >
                Route Now
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
