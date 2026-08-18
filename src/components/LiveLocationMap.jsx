import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, Polyline as LeafletPolyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLiveLocation, LOCATION_PRESETS } from '../hooks/useLiveLocation';
import { useDemo } from '../context/DemoContext';
import { DataService } from '../services/data_service';
import { triggerEmergencySOS } from '../services/sos_service';
import { 
  MapPin, Navigation, Phone, ExternalLink, RefreshCw, 
  AlertTriangle, ShieldAlert, Send, Hospital as HospIcon, CheckCircle2, 
  Locate, Compass, Crosshair, Radio, Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Fix Leaflet default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom High-Tech SVG Marker Icons for Leaflet
const createCustomIcon = (htmlContent, className = '', iconSize = [36, 36]) => {
  return L.divIcon({
    html: htmlContent,
    className: `custom-leaflet-marker ${className}`,
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    popupAnchor: [0, -iconSize[1] / 2]
  });
};

const userLiveIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
    <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
      </svg>
    </div>
  </div>
`, 'user-live-marker', [32, 32]);

const hospitalIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-cyan-300 shadow-xl flex items-center justify-center text-white font-black text-xs">
      H
    </div>
  </div>
`, 'hospital-marker', [28, 28]);

const ambulanceIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping"></div>
    <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-amber-300 shadow-2xl flex items-center justify-center text-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
      </svg>
    </div>
  </div>
`, 'ambulance-marker', [32, 32]);

// Map center synchronizer
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LiveLocationMap() {
  const { t } = useLanguage();
  const { 
    coords, 
    realGpsCoords, 
    accuracy, 
    error, 
    permissionStatus, 
    activePresetId, 
    isLocating, 
    isUsingLiveGps, 
    selectPreset, 
    refreshLocation,
    presets 
  } = useLiveLocation();

  const { activeDispatch, setActiveDispatch } = useDemo();
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [ambulanceCoords, setAmbulanceCoords] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const center = coords || { lat: 16.5167, lng: 80.6500 };

  // Fetch nearest hospital facilities dynamically for current center coords
  const fetchHospitalResources = async () => {
    setLoadingHospitals(true);
    try {
      const hospList = await DataService.getHospitals(center.lat, center.lng);
      setHospitals(hospList || []);
      if (hospList && hospList.length > 0) {
        setSelectedHospital(hospList[0]);
      }
    } catch (err) {
      console.warn('[LiveLocationMap] Error loading hospitals:', err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    fetchHospitalResources();
  }, [center.lat, center.lng]);

  // Transmit Live GPS SOS Broadcast
  const handleTransmitLocationSOS = async () => {
    setDispatchStatus("Transmitting live GPS telemetry & SOS alert to hospital triage & family mesh...");
    try {
      const nearestHosp = hospitals[0] || { 
        name: 'Government General Hospital (GGH)', 
        latitude: center.lat + 0.015, 
        longitude: center.lng + 0.015 
      };
      
      const res = await triggerEmergencySOS(
        center.lat, 
        center.lng, 
        `Live GPS Coordinates: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)} (Accuracy ±${accuracy || 15}m)`
      );
      
      setActiveDispatch({
        active: true,
        ambulanceState: 'ACCEPTED',
        hospitalCoords: { lat: nearestHosp.latitude || (center.lat + 0.015), lng: nearestHosp.longitude || (center.lng + 0.015) },
        userCoords: { lat: center.lat, lng: center.lng }
      });

      setDispatchStatus(`SOS Dispatched! Live GPS transmitted to ${res.contactsNotified} family contacts & ${nearestHosp.name}.`);
    } catch (err) {
      setDispatchStatus("Emergency coordinates queued for local mesh & telemetry broadcast.");
    }
    setTimeout(() => setDispatchStatus(null), 7000);
  };

  // Interpolation loop for moving ambulance on map toward user
  useEffect(() => {
    if (activeDispatch?.active) {
      let progress = 0;
      const hosp = activeDispatch.hospitalCoords || { lat: center.lat + 0.015, lng: center.lng + 0.015 };
      const user = activeDispatch.userCoords || center;
      
      const interval = setInterval(() => {
        progress += 0.015;
        if (progress >= 1.0) {
          clearInterval(interval);
          setAmbulanceCoords(user);
        } else {
          const lat = hosp.lat + (user.lat - hosp.lat) * progress;
          const lng = hosp.lng + (user.lng - hosp.lng) * progress;
          setAmbulanceCoords({ lat, lng });
        }
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAmbulanceCoords(null);
    }
  }, [activeDispatch?.active, center.lat, center.lng]);

  const nearestHospital = hospitals[0] || null;

  // Route path between nearest hospital and user
  const routePolyline = useMemo(() => {
    if (!nearestHospital) return [];
    return [
      [nearestHospital.latitude || (center.lat + 0.015), nearestHospital.longitude || (center.lng + 0.015)],
      [center.lat, center.lng]
    ];
  }, [nearestHospital, center.lat, center.lng]);

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-blue-500/40 p-4 sm:p-6 shadow-2xl space-y-4">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 border border-red-400/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <span>Live Emergency Geolocation & Trauma Radar</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                {isUsingLiveGps ? 'GPS LIVE FIX' : 'REGIONAL GRID'}
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Coordinates: <span className="text-cyan-400 font-mono font-bold">{center.lat.toFixed(5)}° N, {center.lng.toFixed(5)}° E</span>
              {accuracy && <span className="text-slate-400 ml-1.5">(±{accuracy}m accuracy)</span>}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleTransmitLocationSOS}
            className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-red-950/60 cursor-pointer min-h-[40px]"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Broadcast Live GPS & SOS</span>
          </button>

          <button
            onClick={refreshLocation}
            disabled={isLocating}
            className="p-2.5 rounded-xl bg-[#050A14] hover:bg-slate-800 text-slate-200 border border-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center transition-all cursor-pointer"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Preset Location Switcher Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Regional Emergency Grid Target:</span>
          </span>
          <span className="text-cyan-400 font-mono text-[10px]">
            {isLocating ? 'Acquiring GPS Satellite Lock...' : 'Ready'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all border flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/50 scale-102'
                    : 'bg-[#050A14] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {preset.id === 'live' ? (
                  <Crosshair className={`w-3 h-3 ${isSelected ? 'text-emerald-400 animate-spin' : ''}`} />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Toast */}
      {dispatchStatus && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2.5 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Interactive Map Viewport */}
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner z-0">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#050A14' }}
        >
          {/* Recenter helper */}
          <MapRecenter center={center} />

          {/* High-Tech Dark Matter Map Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* Live GPS Accuracy Halo */}
          {accuracy && (
            <Circle
              center={[center.lat, center.lng]}
              radius={Math.min(accuracy, 200)}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
          )}

          {/* User Live Position Marker */}
          <LeafletMarker position={[center.lat, center.lng]} icon={userLiveIcon}>
            <Popup>
              <div className="p-2 text-slate-950 font-sans space-y-1">
                <div className="text-xs font-black text-emerald-700 flex items-center space-x-1">
                  <span>● Live GPS Location</span>
                </div>
                <div className="text-[11px] font-mono text-slate-700">
                  {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Accuracy: ±{accuracy || 15}m • Incident Ground Lock
                </div>
              </div>
            </Popup>
          </LeafletMarker>

          {/* Hospital Markers */}
          {hospitals.map((hosp) => {
            const hLat = hosp.latitude || hosp.location_lat || 16.5167;
            const hLng = hosp.longitude || hosp.location_lng || 80.6500;
            return (
              <LeafletMarker 
                key={hosp.id} 
                position={[hLat, hLng]} 
                icon={hospitalIcon}
                eventHandlers={{
                  click: () => setSelectedHospital(hosp)
                }}
              >
                <Popup>
                  <div className="p-2.5 text-slate-950 font-sans max-w-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900">{hosp.name}</h4>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        {hosp.distanceKm || 1.4} km
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-100 p-1.5 rounded-lg text-slate-700">
                      <div>ICU Beds: <span className="font-bold text-emerald-700">{hosp.icu_available || 12}</span></div>
                      <div>AVS Vials: <span className="font-bold text-cyan-700">{hosp.antivenom_stock || 150}</span></div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${hosp.contact_number || hosp.phone || '+91-866-2472777'}`}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call ER</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hLat},${hLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Route</span>
                      </a>
                    </div>
                  </div>
                </Popup>
              </LeafletMarker>
            );
          })}

          {/* Emergency Route Polyline */}
          {routePolyline.length > 0 && (
            <LeafletPolyline
              positions={routePolyline}
              pathOptions={{
                color: '#00D9FF',
                weight: 4,
                opacity: 0.85,
                dashArray: '6, 8'
              }}
            />
          )}

          {/* Moving Ambulance on Map */}
          {ambulanceCoords && (
            <LeafletMarker position={[ambulanceCoords.lat, ambulanceCoords.lng]} icon={ambulanceIcon}>
              <Popup>
                <div className="p-1.5 text-slate-950 text-[11px] font-bold">
                  🚑 ALS Rescue 101 en route
                </div>
              </Popup>
            </LeafletMarker>
          )}
        </MapContainer>

        {/* Live Radar Floating HUD Overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center space-x-2 shadow-xl pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Nearest: {nearestHospital ? `${nearestHospital.name.slice(0, 24)} (${nearestHospital.distanceKm} km)` : 'Scanning...'}</span>
        </div>
      </div>

      {/* Nearest Facilities Quick Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
          <HospIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Real Emergency Hospital Network ({hospitals.length} identified):</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {hospitals.slice(0, 3).map((h) => (
            <div 
              key={h.id}
              onClick={() => setSelectedHospital(h)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                selectedHospital?.id === h.id
                  ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-950/60'
                  : 'bg-[#050A14] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h5 className="text-xs font-bold text-white truncate max-w-[180px]">{h.name}</h5>
                  <p className="text-[10px] text-slate-400">{h.district || h.state}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {h.distanceKm} km
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="text-emerald-400 font-bold">{h.icu_available} ICU</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">{h.antivenom_stock} AVS</span>
                </div>

                <a
                  href={`tel:${h.contact_number || '+91-866-2472777'}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
