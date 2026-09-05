import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, Gauge, Activity, Compass, AlertTriangle, 
  ShieldAlert, Siren, CheckCircle2, AlertOctagon, 
  MapPin, Radio, Zap, Shield, Car, Volume2, 
  VolumeX, ArrowRight, ShieldCheck, Flame, ExternalLink,
  Search, CornerUpRight, Clock, Milestone, Sparkles,
  X, Loader2, LocateFixed, Route, Play, StopCircle,
  TrendingUp, Navigation2, Check, Edit3, Target,
  Pause, Power, Hand, Crosshair
} from 'lucide-react';
import { speakEmergencyInstruction, stopAllAudio } from '../services/audio_service';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { calculateRealRoadRoute, getTileLayerConfig } from '../services/routing_service';
import { GoogleMapsToolbar } from './GoogleMapsToolbar';
import { DataService } from '../services/data_service';

// Default fallback coords for Pathanaguluru, AP (16.8118° N, 80.7045° E)
const DEFAULT_PATHANAGULURU_COORDS = [16.8118, 80.7045];

// Popular Indian Quick Search Suggestions
const SEARCH_SUGGESTIONS = [
  { name: 'Government General Hospital (GGH), Vijayawada', lat: 16.5167, lng: 80.6500, type: 'hospital' },
  { name: 'AIIMS Super-Specialty Medical Center, Mangalagiri', lat: 16.4420, lng: 80.5750, type: 'hospital' },
  { name: 'Apollo Emergency Medical Hospital, Hyderabad', lat: 17.4156, lng: 78.4125, type: 'hospital' },
  { name: 'Benz Circle Traffic Corridor, Vijayawada', lat: 16.5235, lng: 80.6720, type: 'landmark' },
  { name: 'Vijayawada International Airport, Gannavaram', lat: 16.5290, lng: 80.7970, type: 'airport' },
  { name: 'Guntur Government Hospital & Trauma Care', lat: 16.3067, lng: 80.4365, type: 'hospital' }
];

export const LiveAccidentDetector = ({ onAccidentConfirmed, externalReset }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Navigation & Route Selection State
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isDriveActive, setIsDriveActive] = useState(false);
  const [isSimulatedDriving, setIsSimulatedDriving] = useState(false);

  // Exact Live Location
  const [liveCoords, setLiveCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('resqone_live_coords');
      return saved ? JSON.parse(saved) : DEFAULT_PATHANAGULURU_COORDS;
    } catch {
      return DEFAULT_PATHANAGULURU_COORDS;
    }
  });

  const [liveAddress, setLiveAddress] = useState(() => {
    return localStorage.getItem('resqone_live_address') || 'Pathanaguluru, Andhra Pradesh';
  });

  const [gpsAccuracy, setGpsAccuracy] = useState(3.0);
  const [gpsLocked, setGpsLocked] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSettingCustomOrigin, setIsSettingCustomOrigin] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState('');
  const [originResults, setOriginResults] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  // Live Telemetry Readings
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [speedLimit, setSpeedLimit] = useState(80); // km/h
  const [gForceTotal, setGForceTotal] = useState(1.00); // G
  const [accelX, setAccelX] = useState(0.01);
  const [accelY, setAccelY] = useState(0.04);
  const [accelZ, setAccelZ] = useState(0.99);
  const [gyroRoll, setGyroRoll] = useState(0.4);
  const [gyroPitch, setGyroPitch] = useState(1.1);
  const [gyroYaw, setGyroYaw] = useState(52.0);

  // Destination Search & Road Routing
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [nextTurnText, setNextTurnText] = useState('Proceed along highlighted route');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Safety & Crash Alerts
  const [activeAlert, setActiveAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crashModalOpen, setCrashModalOpen] = useState(false);
  const [crashCountdown, setCrashCountdown] = useState(10);
  const [impactG, setImpactG] = useState(4.85);

  // References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const breadcrumbRef = useRef(null);
  const lastPosRef = useRef(null);
  const simIndexRef = useRef(0);
  const simIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const [mapLayer, setMapLayer] = useState('roadmap');
  const tileLayerRef = useRef(null);
  const hospitalMarkersRef = useRef([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  const handleLayerChange = (layer) => {
    setMapLayer(layer);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const conf = getTileLayerConfig(layer);
      const newTileLayer = L.tileLayer(conf.url, {
        maxZoom: conf.maxZoom,
        className: layer === 'dark' ? 'leaflet-dark-mode' : '',
        attribution: conf.attribution
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTileLayer;
    }
  };

  // Determine if user is moving
  const isUserMoving = currentSpeed >= 5 || isSimulatedDriving;

  // Multilingual UI Dictionary Helpers
  const locLabel = language === 'te' ? 'ప్రత్యక్ష లొకేషన్' : language === 'hi' ? 'लाइव स्थान' : language === 'ta' ? 'நேரலை இடம்' : language === 'kn' ? 'ಲೈವ್ ಸ್ಥಳ' : 'Live Location';
  const notDrivingLabel = language === 'te' ? '🅿️ మీరు ప్రస్తుతం డ్రైవింగ్ చేయడం లేదు (వాహనం ఆగింది)' : language === 'hi' ? '🅿️ आप वर्तमान में ड्राइविंग नहीं कर रहे हैं (वाहन रुका हुआ है)' : language === 'ta' ? '🅿️ நீங்கள் தற்போது ஓட்டவில்லை' : '🅿️ YOU ARE NOT CURRENTLY DRIVING (STATIONARY)';
  const movingLabel = (spd) => language === 'te' ? `🟢 ప్రయాణిస్తున్నారు (${spd} KM/H)` : language === 'hi' ? `🟢 वाहन चल रहा है (${spd} KM/H)` : `🟢 USER IS MOVING (${spd} KM/H)`;

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      if (data && (data.locality || data.city || data.principalSubdivision)) {
        const locality = data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || 'Pathanaguluru';
        const sub = data.principalSubdivision || 'Andhra Pradesh';
        const addr = `${locality}, ${sub}`;
        setLiveAddress(addr);
        localStorage.setItem('resqone_live_address', addr);
        localStorage.setItem('resqone_live_coords', JSON.stringify([lat, lng]));
      }
    } catch {
      // Retain existing address
    }
  };

  // ================= 1. REAL DEVICE HARDWARE GEOLOCATION =================
  const fetchLiveGPS = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      setIsLocating(false);
      reverseGeocode(liveCoords[0], liveCoords[1]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 3);
        setLiveCoords([lat, lng]);
        setGpsAccuracy(acc);
        setGpsLocked(true);
        setIsLocating(false);
        reverseGeocode(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
          mapInstanceRef.current.invalidateSize();
        }
      },
      () => {
        // Fallback to relaxed accuracy
        navigator.geolocation.getCurrentPosition(
          (pos2) => {
            const lat = pos2.coords.latitude;
            const lng = pos2.coords.longitude;
            setLiveCoords([lat, lng]);
            setGpsAccuracy(Math.round(pos2.coords.accuracy || 15));
            setGpsLocked(true);
            setIsLocating(false);
            reverseGeocode(lat, lng);

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
              mapInstanceRef.current.invalidateSize();
            }
          },
          (err) => {
            console.warn('[GPS Error]', err.message);
            setIsLocating(false);
            reverseGeocode(liveCoords[0], liveCoords[1]);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchLiveGPS();

    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLiveCoords([lat, lng]);
          setGpsAccuracy(Math.round(pos.coords.accuracy || 3));
          setGpsLocked(true);

          let detectedSpeed = 0;
          if (pos.coords.speed !== null && pos.coords.speed > 0) {
            detectedSpeed = Math.round(pos.coords.speed * 3.6);
          } else if (lastPosRef.current) {
            const distM = calculateDistanceM(lastPosRef.current[0], lastPosRef.current[1], lat, lng);
            const dtSec = (pos.timestamp - lastPosRef.current[2]) / 1000;
            if (dtSec > 0 && dtSec < 10) {
              detectedSpeed = Math.round((distM / dtSec) * 3.6);
            }
          }
          lastPosRef.current = [lat, lng, pos.timestamp];

          if (!isSimulatedDriving) {
            setCurrentSpeed(detectedSpeed);
            if (detectedSpeed > speedLimit && isDriveActive) {
              triggerHazardAlert('OVER_SPEED', `⚠️ Speed limit exceeded! Driving at ${detectedSpeed} km/h.`);
            }
          }
        },
        (err) => console.warn('[GPS Watch]', err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
      );
    }

    // Accelerometer & Gyroscope
    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (acc && acc.x !== null) {
        const ax = parseFloat((acc.x / 9.81).toFixed(2));
        const ay = parseFloat((acc.y / 9.81).toFixed(2));
        const az = parseFloat((acc.z / 9.81).toFixed(2));
        const total = parseFloat(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(2));

        setAccelX(ax);
        setAccelY(ay);
        setAccelZ(az);
        setGForceTotal(total);

        if (total >= 3.5 && (isDriveActive || isSimulatedDriving)) {
          triggerCrashSequence(total);
        } else if (Math.abs(ay) > 0.65 && isDriveActive) {
          triggerHazardAlert('HARSH_BRAKE', '⚠️ Harsh braking detected!');
        }
      }
    };

    if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleMotion);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (window.DeviceMotionEvent) window.removeEventListener('devicemotion', handleMotion);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isDriveActive, isSimulatedDriving, speedLimit]);

  const calculateDistanceM = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ================= 2. INITIALIZE LEAFLET MAP =================
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: liveCoords,
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      });

      const conf = getTileLayerConfig(mapLayer);
      const tiles = L.tileLayer(conf.url, {
        maxZoom: conf.maxZoom,
        className: mapLayer === 'dark' ? 'leaflet-dark-mode' : '',
        attribution: conf.attribution
      }).addTo(map);
      tileLayerRef.current = tiles;

      const userDotIcon = L.divIcon({
        className: 'google-user-live-dot',
        html: `
          <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div class="w-12 h-12 rounded-full bg-blue-500/30 animate-ping absolute"></div>
            <div class="w-6 h-6 rounded-full bg-[#1a73e8] border-2 border-white shadow-2xl flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const userMarker = L.marker(liveCoords, { 
        icon: userDotIcon,
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      userMarker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setLiveCoords([lat, lng]);
        reverseGeocode(lat, lng);
      });

      userMarkerRef.current = userMarker;

      const accuracyCircle = L.circle(liveCoords, {
        radius: gpsAccuracy,
        color: '#1a73e8',
        fillColor: '#1a73e8',
        fillOpacity: 0.12,
        weight: 1
      }).addTo(map);
      accuracyCircleRef.current = accuracyCircle;

      const breadcrumb = L.polyline([liveCoords], {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.7,
        dashArray: '4, 8'
      }).addTo(map);
      breadcrumbRef.current = breadcrumb;

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLiveCoords([lat, lng]);
        userMarker.setLatLng([lat, lng]);
        accuracyCircle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.setView(liveCoords, 17);
        }
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Live Location onto Map
  useEffect(() => {
    if (userMarkerRef.current) userMarkerRef.current.setLatLng(liveCoords);
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(liveCoords);
      accuracyCircleRef.current.setRadius(gpsAccuracy);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(liveCoords, { animate: true, duration: 0.5 });
      if (isDriveActive && isUserMoving && breadcrumbRef.current) {
        const pts = breadcrumbRef.current.getLatLngs();
        pts.push(liveCoords);
        breadcrumbRef.current.setLatLngs(pts);
      }
    }
  }, [liveCoords, gpsAccuracy, isDriveActive, isUserMoving]);

  // Load and plot nearby real hospitals around live location
  useEffect(() => {
    let isMounted = true;
    DataService.getHospitals(liveCoords[0], liveCoords[1]).then((hosps) => {
      if (!isMounted) return;
      const topHosps = hosps.slice(0, 6);
      setNearbyHospitals(topHosps);

      if (mapInstanceRef.current) {
        // Clear previous hospital markers
        hospitalMarkersRef.current.forEach(m => m.remove());
        hospitalMarkersRef.current = [];

        topHosps.forEach((h) => {
          const hospIcon = L.divIcon({
            className: 'hospital-map-pin',
            html: `
              <div class="relative flex flex-col items-center group cursor-pointer">
                <div class="w-6 h-6 rounded-lg bg-red-600 border border-white text-white flex items-center justify-center shadow-lg text-xs font-black">
                  🏥
                </div>
                <div class="bg-slate-900/90 text-white font-bold text-[9px] px-1 py-0.5 rounded border border-white/20 whitespace-nowrap mt-0.5 shadow-md">
                  ${h.distanceKm}km
                </div>
              </div>
            `,
            iconSize: [28, 38],
            iconAnchor: [14, 19]
          });

          const marker = L.marker([h.latitude, h.longitude], { icon: hospIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a; min-width: 170px;">
                <b style="color: #dc2626; font-size: 12px;">🏥 ${h.name}</b><br/>
                <span style="font-size: 11px; color: #475569;">Distance: <b>${h.distanceKm} km</b></span><br/>
                <span style="font-size: 11px; color: #16a34a;">ICU Beds: <b>${h.icu_available || 10}</b></span>
              </div>
            `);

          marker.on('click', () => {
            handleSelectDestination({
              name: h.name,
              lat: h.latitude,
              lng: h.longitude,
              type: 'hospital'
            });
          });

          hospitalMarkersRef.current.push(marker);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [liveCoords]);

  const handleRecenter = () => {
    fetchLiveGPS();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(liveCoords, 18, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // ================= 3. SET EXACT ORIGIN =================
  const handleOriginSearch = async (e) => {
    e.preventDefault();
    if (!originSearchQuery.trim()) return;
    setIsSearchingOrigin(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originSearchQuery + ' Andhra Pradesh')}&limit=5&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        setOriginResults(data.map(item => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        })));
      } else {
        setOriginResults([{
          name: 'Pathanaguluru, Reddigudem, NTR District, Andhra Pradesh',
          lat: 16.8118,
          lng: 80.7045
        }]);
      }
    } catch {
      setOriginResults([{
        name: 'Pathanaguluru, Reddigudem, NTR District, Andhra Pradesh',
        lat: 16.8118,
        lng: 80.7045
      }]);
    } finally {
      setIsSearchingOrigin(false);
    }
  };

  const handleSelectOrigin = (orig) => {
    const coords = [orig.lat, orig.lng];
    setLiveCoords(coords);
    const cleanName = orig.name.split(',')[0] + ', Andhra Pradesh';
    setLiveAddress(cleanName);
    localStorage.setItem('resqone_live_address', cleanName);
    localStorage.setItem('resqone_live_coords', JSON.stringify(coords));

    setIsSettingCustomOrigin(false);
    setOriginSearchQuery('');
    setOriginResults([]);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, 17, { animate: true });
    }
  };

  // ================= 4. DESTINATION SEARCH & OSRM ROAD DIRECTIONS =================
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const filtered = SEARCH_SUGGESTIONS.filter(s => s.name.toLowerCase().includes(val.toLowerCase()));
    setSearchResults(filtered);
    setSearchOpen(true);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place'
        }));
        setSearchResults(formatted);
        setSearchOpen(true);
      } else {
        const filtered = SEARCH_SUGGESTIONS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchResults(filtered);
        setSearchOpen(true);
      }
    } catch {
      const filtered = SEARCH_SUGGESTIONS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(filtered);
      setSearchOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectDestination = async (dest) => {
    setSearchOpen(false);
    setSearchQuery(dest.name);
    setIsCalculatingRoute(true);

    const [originLat, originLng] = liveCoords;
    const destLat = dest.lat;
    const destLng = dest.lng;

    if (mapInstanceRef.current) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destLat, destLng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'dest-pin-marker',
          html: `
            <div class="relative flex flex-col items-center">
              <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-2xl font-bold text-xs animate-bounce">
                📍
              </div>
              <div class="w-2 h-2 bg-red-600 rounded-full mt-0.5 shadow-md"></div>
            </div>
          `,
          iconSize: [32, 40],
          iconAnchor: [16, 40]
        });
        destMarkerRef.current = L.marker([destLat, destLng], { icon: pinIcon }).addTo(mapInstanceRef.current);
      }
    }

    try {
      const route = await calculateRealRoadRoute(originLat, originLng, destLat, destLng);

      if (route.coordinates && route.coordinates.length > 0) {
        const roadPoints = route.coordinates;
        setRouteCoordinates(roadPoints);

        if (mapInstanceRef.current) {
          if (routePolylineRef.current) {
            routePolylineRef.current.setLatLngs(roadPoints);
          } else {
            routePolylineRef.current = L.polyline(roadPoints, {
              color: '#1a73e8',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(mapInstanceRef.current);
          }

          const bounds = L.latLngBounds([liveCoords, [destLat, destLng], ...roadPoints]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        const distKm = `${route.distanceKm} km`;
        const durMin = `${route.durationMin} min`;

        let turn = route.turns?.[0] ? `In 150m, ${route.turns[0]}` : `Head towards ${dest.name.split(',')[0]}`;
        setNextTurnText(turn);

        setSelectedRoute({
          name: dest.name.split(',')[0],
          fullName: dest.name,
          lat: destLat,
          lng: destLng,
          distance: distKm,
          duration: durMin,
          source: route.source
        });
      } else {
        throw new Error('No route');
      }
    } catch {
      const fallbackPts = [liveCoords, [destLat, destLng]];
      setRouteCoordinates(fallbackPts);
      if (routePolylineRef.current) routePolylineRef.current.setLatLngs(fallbackPts);
      const dist = (calculateDistanceM(originLat, originLng, destLat, destLng) / 1000).toFixed(1) + ' km';
      setSelectedRoute({
        name: dest.name.split(',')[0],
        fullName: dest.name,
        lat: destLat,
        lng: destLng,
        distance: dist,
        duration: Math.round(parseFloat(dist) * 1.5) + ' min'
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleRouteToNearestHospital = async () => {
    try {
      const hospitals = await DataService.getHospitals(liveCoords[0], liveCoords[1]);
      if (hospitals && hospitals.length > 0) {
        const nearest = hospitals[0];
        handleSelectDestination({
          name: nearest.name,
          lat: nearest.latitude,
          lng: nearest.longitude,
          type: 'hospital'
        });
        return;
      }
    } catch (err) {
      console.warn('[Nearest Hospital Error]', err);
    }

    // High quality emergency fallback
    handleSelectDestination({
      name: 'Government General Hospital (GGH), Vijayawada',
      lat: 16.5167,
      lng: 80.6500,
      type: 'hospital'
    });
  };

  // ================= 5. START DRIVE & STOP DRIVE CONTROLS =================
  const handleStartDrive = () => {
    setIsDriveActive(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(liveCoords, 18, { animate: true });
    }
  };

  const handleStopDrive = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsDriveActive(false);
    setIsSimulatedDriving(false);
    setCurrentSpeed(0);
    setSelectedRoute(null);
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    setSearchQuery('');
    handleRecenter();
  };

  const toggleSimulatedMovement = () => {
    if (isSimulatedDriving) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatedDriving(false);
      setCurrentSpeed(0);
    } else {
      setIsDriveActive(true);
      setIsSimulatedDriving(true);
      setCurrentSpeed(64);
      simIndexRef.current = 0;

      const testTrack = routeCoordinates.length > 0 ? routeCoordinates : [
        [liveCoords[0], liveCoords[1]],
        [liveCoords[0] + 0.003, liveCoords[1] + 0.004],
        [liveCoords[0] + 0.007, liveCoords[1] + 0.009],
        [liveCoords[0] + 0.012, liveCoords[1] + 0.015],
        [liveCoords[0] + 0.018, liveCoords[1] + 0.022],
        [liveCoords[0] + 0.025, liveCoords[1] + 0.030]
      ];

      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simIntervalRef.current = setInterval(() => {
        simIndexRef.current = (simIndexRef.current + 1) % testTrack.length;
        const nextCoord = testTrack[simIndexRef.current];
        setLiveCoords(nextCoord);

        setCurrentSpeed(prev => {
          const jitter = Math.floor(Math.random() * 7) - 3;
          const s = Math.max(52, Math.min(95, prev + jitter));
          if (s > speedLimit) {
            triggerHazardAlert('OVER_SPEED', `⚠️ Speed limit exceeded! Driving at ${s} km/h.`);
          }
          return s;
        });

        setGForceTotal(parseFloat((1.0 + (Math.random() * 0.28 - 0.1)).toFixed(2)));
        setAccelX(parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)));
        setAccelY(parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)));
      }, 1200);
    }
  };

  const openInGoogleMapsApp = () => {
    if (!selectedRoute) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${liveCoords[0]},${liveCoords[1]}&destination=${selectedRoute.lat},${selectedRoute.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // ================= 6. HAZARD & CRASH DETECTION =================
  const triggerHazardAlert = (alertType, text) => {
    setActiveAlert(alertType);
    if (soundEnabled) speakEmergencyInstruction(text, language);
    setTimeout(() => setActiveAlert(null), 3800);
  };

  const triggerCrashSequence = (force = 4.85) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setImpactG(force);
    setCurrentSpeed(0);
    setCrashModalOpen(true);
    setCrashCountdown(10);

    speakEmergencyInstruction("Emergency! High impact vehicle crash detected! Dispatching rescue teams.", language);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCrashCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleConfirmEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmEmergency = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCrashModalOpen(false);

    const crashData = {
      timestamp: new Date().toLocaleTimeString(),
      coords: liveCoords,
      impactG: impactG,
      speedBeforeImpact: 76,
      locationName: liveAddress || 'Pathanaguluru Highway Corridor',
      vehicleType: 'Car',
      severity: 'CRITICAL',
      medicalTelemetry: {
        bloodGroup: user?.blood_group || 'O-',
        pulse: '138 bpm (Tachycardia)',
        consciousness: 'Unresponsive / Stunned'
      }
    };

    if (onAccidentConfirmed) {
      onAccidentConfirmed(crashData);
    }
  };

  const handleCancelCrash = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCrashModalOpen(false);
    if (externalReset) externalReset();
    speakEmergencyInstruction("SOS Cancelled. Stay safe.", language);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3 font-sans">

      {/* 1. TOP LIVE LOCATION BAR (RESPONSIVE ON MOBILE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#080E1C] border border-white/10 shadow-xl">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shrink-0 ${
            isDriveActive 
              ? isUserMoving 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-950/80 animate-pulse'
                : 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-950/80'
              : 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-950/80'
          }`}>
            {isDriveActive ? <Car className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-none">
                {isDriveActive ? (isUserMoving ? movingLabel(currentSpeed) : notDrivingLabel) : `📍 ${liveAddress}`}
              </span>
              <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                isDriveActive 
                  ? isUserMoving 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {isDriveActive ? (isUserMoving ? 'DRIVING' : '0 KM/H') : 'GPS LOCKED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {selectedRoute 
                ? `${selectedRoute.name} (${selectedRoute.distance} • ${selectedRoute.duration})`
                : `${liveAddress} (${liveCoords[0].toFixed(4)}°N, ${liveCoords[1].toFixed(4)}°E)`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          <GoogleMapsToolbar currentLayer={mapLayer} onLayerChange={handleLayerChange} />

          <button
            onClick={() => setIsSettingCustomOrigin(!isSettingCustomOrigin)}
            className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3 text-cyan-400" />
            <span className="truncate">{language === 'te' ? 'లొకేషన్ మార్చు' : language === 'hi' ? 'स्थान बदलें' : 'Set Location'}</span>
          </button>
          
          <button
            onClick={handleRecenter}
            disabled={isLocating}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-blue-600 text-white cursor-pointer shadow-md flex items-center justify-center gap-1 text-xs font-bold shrink-0"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
            <span>{language === 'te' ? 'లొకేట్' : language === 'hi' ? 'स्थान' : 'Locate'}</span>
          </button>
        </div>
      </div>

      {/* CHANGE ORIGIN MODAL */}
      <AnimatePresence>
        {isSettingCustomOrigin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-[#0B1220] border border-cyan-500/30 shadow-2xl space-y-2.5 max-w-full overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>{language === 'te' ? 'మీ సరైన ఊరు / ప్రాంతం ఎంచుకోండి' : language === 'hi' ? 'अपना गाँव / स्थान चुनें' : 'Search & Lock Starting Point'}</span>
              </span>
              <button onClick={() => setIsSettingCustomOrigin(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOriginSearch} className="flex gap-2">
              <input
                type="text"
                value={originSearchQuery}
                onChange={(e) => setOriginSearchQuery(e.target.value)}
                placeholder="Type village (e.g. Pathanaguluru, Reddigudem)..."
                className="flex-1 bg-[#050A14] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                {isSearchingOrigin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find</span>
              </button>
            </form>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                onClick={() => handleSelectOrigin({ name: 'Pathanaguluru, Reddigudem, NTR District, Andhra Pradesh', lat: 16.8118, lng: 80.7045 })}
                className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-500/40 text-cyan-300 font-bold text-[11px] hover:bg-blue-900 cursor-pointer"
              >
                📍 Pathanaguluru
              </button>
              <button
                onClick={() => handleSelectOrigin({ name: 'Vijayawada Central, Andhra Pradesh', lat: 16.5062, lng: 80.6480 })}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] hover:text-white cursor-pointer"
              >
                Vijayawada
              </button>
              <button
                onClick={() => handleSelectOrigin({ name: 'Guntur, Andhra Pradesh', lat: 16.3067, lng: 80.4365 })}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] hover:text-white cursor-pointer"
              >
                Guntur
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DESTINATION SEARCH BAR */}
      <div className="relative z-30 space-y-2">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a73e8]">
            {isSearching || isCalculatingRoute ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
            placeholder={language === 'te' ? 'గమ్యస్థానాన్ని వెతకండి (ఉదా: GGH విజయవాడ, AIIMS)...' : language === 'hi' ? 'गंतव्य खोजें (उदा: GGH विजयवाड़ा, AIIMS)...' : "Search destination route (e.g. GGH Vijayawada, AIIMS)..."}
            className="w-full bg-[#080E1C] border-2 border-[#1a73e8]/50 focus:border-[#1a73e8] rounded-2xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 shadow-2xl focus:outline-none transition-all"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="submit"
              className="bg-[#1a73e8] hover:bg-blue-600 text-white font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <Route className="w-3 h-3" />
              <span>{language === 'te' ? 'రూట్' : language === 'hi' ? 'मार्ग' : 'Route'}</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={handleRouteToNearestHospital}
            className="px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1"
            title="Auto-route to closest emergency trauma hospital"
          >
            <span>🏥</span>
            <span>{language === 'te' ? 'సమీప ఆసుపత్రి రూట్' : language === 'hi' ? 'निकटतम अस्पताल रूट' : 'Route to Nearest Hospital'}</span>
          </button>
          
          {nearbyHospitals.length > 0 ? (
            nearbyHospitals.map((hosp, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDestination({ name: hosp.name, lat: hosp.latitude, lng: hosp.longitude, type: 'hospital' })}
                className="px-2.5 py-1 rounded-xl bg-[#080E1C] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-white text-[11px] font-medium shrink-0 transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>🏥</span>
                <span className="truncate max-w-[130px]">{hosp.name.split(',')[0]}</span>
                <span className="text-[9px] text-emerald-400 font-mono">({hosp.distanceKm}km)</span>
              </button>
            ))
          ) : (
            SEARCH_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDestination(s)}
                className="px-2.5 py-1 rounded-xl bg-[#080E1C] hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>{s.type === 'hospital' ? '🏥' : '📍'}</span>
                <span className="truncate max-w-[120px]">{s.name.split(',')[0]}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 🌟 3. PROMINENT "START DRIVE" ACTION BAR (APPEARS AFTER SELECTED ROUTE) 🌟 */}
      {selectedRoute && !isDriveActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-[#080E1C] via-[#0D1B2A] to-[#080E1C] border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.35)] space-y-3 max-w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Route className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                    {language === 'te' ? 'రూట్ సిద్ధం' : language === 'hi' ? 'मार्ग तैयार' : 'ROUTE READY'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded">
                    {selectedRoute.distance} • {selectedRoute.duration}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white truncate">{selectedRoute.name}</h3>
              </div>
            </div>

            <button
              onClick={() => { setSelectedRoute(null); if (routePolylineRef.current) routePolylineRef.current.remove(); }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer shrink-0"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full">
            <button
              onClick={handleStartDrive}
              className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-2xl shadow-emerald-950/90 cursor-pointer transition-all active:scale-95 ring-2 ring-emerald-400/50"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
              <span className="truncate">
                {language === 'te' ? `${selectedRoute.name} వైపు డ్రైవ్ ప్రారంభించండి` : language === 'hi' ? `${selectedRoute.name} के लिए ड्राइव शुरू करें` : `START DRIVE TO ${selectedRoute.name.toUpperCase()}`}
              </span>
            </button>

            <button
              onClick={openInGoogleMapsApp}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. ACTIVE DRIVING TURN-BY-TURN HEADER */}
      <AnimatePresence>
        {isDriveActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between max-w-full"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center font-bold shrink-0">
                <CornerUpRight className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black tracking-wide truncate">{nextTurnText}</div>
                <div className="text-[10px] text-emerald-100 flex items-center gap-1.5 font-bold truncate">
                  <span>{selectedRoute?.name || 'Active Road Drive'}</span>
                  {selectedRoute && <span>• {selectedRoute.distance}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={handleStopDrive}
              className="bg-black/30 hover:bg-black/50 text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ml-2 cursor-pointer flex items-center space-x-1"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ఆపు' : language === 'hi' ? 'रोकें' : 'Stop'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN MAP CONTAINER */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Recenter & Locate Me Button */}
        <button
          onClick={handleRecenter}
          disabled={isLocating}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-2xl bg-[#080E1C]/95 backdrop-blur-md border border-white/15 text-blue-400 hover:text-white flex items-center justify-center shadow-2xl cursor-pointer active:scale-95 transition-all"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Crosshair className="w-4 h-4" />}
        </button>

        {/* Route Select Prompt */}
        {!selectedRoute && !isDriveActive && (
          <div className="absolute bottom-2 left-2 right-2 z-10 bg-[#080E1C]/95 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-lg text-center">
            <p className="text-[11px] text-slate-300 font-bold">
              🔍 {language === 'te' ? 'డ్రైవ్ ప్రారంభించడానికి పైనున్న గమ్యస్థానాన్ని ఎంచుకోండి' : language === 'hi' ? 'ड्राइव शुरू करने के लिए ऊपर दिए गए गंतव्य का चयन करें' : 'Select a destination route above to begin drive'}
            </p>
          </div>
        )}
      </div>

      {/* 6. MOTION SENSING & TELEMETRY CONTROLS */}
      {isDriveActive ? (
        isUserMoving ? (
          /* ACTIVE SENSOR READINGS HUD */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 sm:p-4 rounded-3xl bg-[#080E1C]/95 border border-emerald-500/30 shadow-2xl space-y-3 max-w-full overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-2">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider truncate">
                  {language === 'te' ? `వాహన సెన్సార్లు • వేగం: ${currentSpeed} KM/H` : language === 'hi' ? `सक्रिय सेंसर • गति: ${currentSpeed} KM/H` : `LIVE VEHICLE SENSOR FUSION • ${currentSpeed} KM/H`}
                </span>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>

            {/* Speedometer & Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-1">
              <div className="text-center sm:border-r sm:border-white/8">
                <div className="text-4xl sm:text-5xl font-mono font-black text-white">
                  <span className={currentSpeed > speedLimit ? 'text-red-400 animate-pulse' : 'text-white'}>{currentSpeed}</span>
                  <span className="text-xs text-slate-400 ml-1">KM/H</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Limit: {speedLimit} km/h</div>
              </div>

              <div className="text-center sm:border-r sm:border-white/8">
                <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-400">
                  {gForceTotal.toFixed(2)}<span className="text-xs text-slate-400 ml-1">G</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Crash Trigger: 3.50G</div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={toggleSimulatedMovement}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                    isSimulatedDriving ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSimulatedDriving ? 'Pause Move' : 'Test Move (64 km/h)'}</span>
                </button>

                <button
                  onClick={() => triggerCrashSequence(4.85)}
                  className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white py-2 px-3 rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center justify-center space-x-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'క్రాష్ అనుకరణ (4.85G)' : language === 'hi' ? 'क्रैश सिमुलेशन' : 'Simulate Crash (4.85G)'}</span>
                </button>
              </div>
            </div>

            {/* 3-Axis Accelerometer */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-2 border-t border-white/8 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Ax (Lat)</div>
                <div className="font-mono font-black text-cyan-300">{accelX > 0 ? `+${accelX}` : accelX}G</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Ay (Long)</div>
                <div className="font-mono font-black text-emerald-300">{accelY > 0 ? `+${accelY}` : accelY}G</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Az (Vert)</div>
                <div className="font-mono font-black text-amber-300">{accelZ}G</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Roll</div>
                <div className="font-mono font-bold text-white">{gyroRoll}°</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Pitch</div>
                <div className="font-mono font-bold text-white">{gyroPitch}°</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#040812] border border-white/6">
                <div className="text-slate-400 font-bold">Heading</div>
                <div className="font-mono font-bold text-white">{gyroYaw}°</div>
              </div>
            </div>

          </motion.div>
        ) : (
          /* STATIONARY DISPLAY */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-[#080E1C]/95 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left max-w-full"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                🅿️
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white">{notDrivingLabel}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'te' ? 'వాహనం కదలడం ప్రారంభించగానే లైవ్ సెన్సార్లు ఆటోమేటిక్‌గా ప్రారంభమవుతాయి.' : 'Speed is 0 km/h. Live sensor readings will activate once your vehicle moves.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={toggleSimulatedMovement}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Move (64 km/h)</span>
              </button>

              <button
                onClick={handleStopDrive}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
              >
                {language === 'te' ? 'రద్దు' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        )
      ) : null}

      {/* CRASH CONFIRMATION COUNTDOWN MODAL */}
      <AnimatePresence>
        {crashModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-sm sm:max-w-md bg-[#0A0F1D] border-2 border-red-500 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(239,68,68,0.7)] text-center space-y-3"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-red-600/20 border-2 border-red-500 text-red-400 mx-auto flex items-center justify-center animate-bounce shadow-xl">
                <Siren className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black tracking-widest text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                  {impactG}G IMPACT DETECTED
                </span>
                <h2 className="text-base sm:text-xl font-black text-white">
                  {language === 'te' ? 'ప్రమాదం గుర్తించబడింది!' : language === 'hi' ? 'दुर्घटना का पता चला!' : 'HIGH-G CRASH DETECTED!'}
                </h2>
                <p className="text-[11px] text-slate-300">
                  {language === 'te' ? 'మీరు సురక్షితంగా ఉన్నారా? రెస్క్యూ పంపమంటారా?' : 'Are you injured or in need of emergency rescue?'}
                </p>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-950/60 border-4 border-red-500 mx-auto flex flex-col items-center justify-center shadow-lg shadow-red-950">
                <span className="text-3xl sm:text-4xl font-mono font-black text-white">{crashCountdown}</span>
                <span className="text-[8px] font-bold text-red-300">SEC</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleConfirmEmergency}
                  className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-xl cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Siren className="w-4 h-4 animate-spin" />
                  <span>{language === 'te' ? 'అత్యవసర రెస్క్యూ పంపండి' : language === 'hi' ? 'आपातकालीन बचाव भेजें' : 'DISPATCH RESCUE NOW'}</span>
                </button>
                <button
                  onClick={handleCancelCrash}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 py-2.5 px-4 rounded-2xl text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  {language === 'te' ? 'నేను సురక్షితంగా ఉన్నాను (రద్దు)' : language === 'hi' ? 'मैं सुरक्षित हूँ (रद्द करें)' : 'I AM SAFE (CANCEL SOS)'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
