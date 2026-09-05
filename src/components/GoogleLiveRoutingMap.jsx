import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Navigation, Compass, Crosshair, Route, Clock, 
  ExternalLink, Search, RefreshCw, CheckCircle2, 
  ShieldAlert, AlertTriangle, Hospital, Car, ArrowRight, Play, Square
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getGoogleMapsApiKey, loadGoogleMapsSdk, geocodeLocation } from '../services/routing_service';
import { speakEmergencyInstruction } from '../services/audio_service';
import { DataService } from '../services/data_service';

// Google Maps Night / Dark Style JSON for tactical emergency aesthetic
const GOOGLE_DARK_MODE_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

export const GoogleLiveRoutingMap = ({ onRouteCalculated, initialDestination = null }) => {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef(null);
  const directionsPanelRef = useRef(null);

  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const hospitalMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const simIntervalRef = useRef(null);

  const [apiKey] = useState(getGoogleMapsApiKey());
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  // Live Location State
  const [currentPos, setCurrentPos] = useState({ lat: 16.5167, lng: 80.6500 });
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locationName, setLocationName] = useState('Detecting Live GPS Location...');
  const [isLocating, setIsLocating] = useState(false);

  // Routing Controls
  const [startQuery, setStartQuery] = useState('My Live GPS Location');
  const [useLiveOrigin, setUseLiveOrigin] = useState(true);
  const [endQuery, setEndQuery] = useState(initialDestination?.name || 'Government General Hospital (GGH), Vijayawada');
  const [selectedMode, setSelectedMode] = useState('DRIVING'); // DRIVING, WALKING, BICYCLING, TRANSIT
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'standard'
  const [routeSummary, setRouteSummary] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [mobileViewTab, setMobileViewTab] = useState('map'); // 'map' | 'turns'
  const [isMapTouchPan, setIsMapTouchPan] = useState(false);

  // Sync Google Maps gestureHandling with isMapTouchPan toggle
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setOptions({
        gestureHandling: isMapTouchPan ? 'greedy' : 'cooperative'
      });
    }
  }, [isMapTouchPan]);

  // 1. Load Google Maps SDK
  useEffect(() => {
    if (!apiKey) return;

    setSdkLoading(true);
    setSdkError(null);

    loadGoogleMapsSdk(apiKey)
      .then((maps) => {
        if (maps) {
          setSdkReady(true);
          setSdkLoading(false);
        } else {
          setSdkError('Unable to load Google Maps SDK. Verify API key and network.');
          setSdkLoading(false);
        }
      })
      .catch((err) => {
        setSdkError(err.message || 'Google Maps SDK failed to load.');
        setSdkLoading(false);
      });
  }, [apiKey]);

  // Reverse Geocoding helper
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      if (data) {
        const locality = data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || 'Live Location';
        const sub = data.principalSubdivision || data.countryName || '';
        const full = `${locality}, ${sub}`;
        setLocationName(full);
        if (useLiveOrigin) {
          setStartQuery(`📍 ${full} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        }
      }
    } catch {
      setLocationName(`Live GPS (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    }
  }, [useLiveOrigin]);

  // Update Hospital Markers on Google Maps
  const updateHospitalMarkers = useCallback((map, coords) => {
    if (!map || !window.google?.maps) return;
    const maps = window.google.maps;

    // Clear existing hospital markers
    hospitalMarkersRef.current.forEach(m => m.setMap(null));
    hospitalMarkersRef.current = [];

    DataService.getHospitals(coords.lat, coords.lng).then((hosps) => {
      const topHosps = hosps.slice(0, 6);
      setNearbyHospitals(topHosps);

      topHosps.forEach((h, idx) => {
        const marker = new maps.Marker({
          position: { lat: h.latitude, lng: h.longitude },
          map: map,
          title: h.name,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            const div = document.createElement('div');
            div.style.fontFamily = 'system-ui, sans-serif';
            div.style.padding = '8px';
            div.style.color = '#0f172a';
            div.style.maxWidth = '240px';
            div.innerHTML = `
              <div style="font-weight: 800; font-size: 13px; color: #dc2626;">🏥 ${h.name}</div>
              <div style="font-size: 11px; color: #475569; margin: 4px 0;">Distance: <b>${h.distanceKm} km</b> • ICU: <b style="color: #16a34a;">${h.icu_available || 10} Beds</b></div>
              <button id="google-hosp-btn-${idx}" style="background: #2563eb; color: white; border: none; border-radius: 8px; padding: 7px 12px; font-weight: 700; font-size: 11px; cursor: pointer; width: 100%; margin-top: 6px;">
                Direct Route to Hospital
              </button>
            `;

            infoWindowRef.current.setContent(div);
            infoWindowRef.current.open(map, marker);

            setTimeout(() => {
              const btn = document.getElementById(`google-hosp-btn-${idx}`);
              if (btn) {
                btn.onclick = () => {
                  setEndQuery(h.name);
                  setUseLiveOrigin(true);
                  infoWindowRef.current.close();
                  calculateAndDisplayRoute(h.name);
                };
              }
            }, 100);
          }
        });

        hospitalMarkersRef.current.push(marker);
      });
    });
  }, []);

  // 2. HTML5 Geolocation with "Pan to Current Location"
  const panToCurrentLocation = useCallback(() => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCurrentPos(coords);
        setGpsAccuracy(Math.round(pos.coords.accuracy || 5));
        setIsLocating(false);
        reverseGeocode(coords.lat, coords.lng);

        if (mapInstanceRef.current && window.google?.maps) {
          mapInstanceRef.current.panTo(coords);
          mapInstanceRef.current.setZoom(16);

          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition(coords);
          }

          updateHospitalMarkers(mapInstanceRef.current, coords);
        }
      },
      (err) => {
        console.warn('[GPS Geolocation Notice]', err.message);
        setIsLocating(false);
        // Fallback to relaxed parameters if immediate high accuracy timed out
        navigator.geolocation.getCurrentPosition(
          (pos2) => {
            const coords2 = { lat: pos2.coords.latitude, lng: pos2.coords.longitude };
            setCurrentPos(coords2);
            setGpsAccuracy(Math.round(pos2.coords.accuracy || 15));
            reverseGeocode(coords2.lat, coords2.lng);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo(coords2);
              updateHospitalMarkers(mapInstanceRef.current, coords2);
            }
          },
          null,
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [reverseGeocode, updateHospitalMarkers]);

  // 3. Initialize Google Maps, DirectionsRenderer, & Controls
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current || !window.google?.maps) return;

    const maps = window.google.maps;

    // Create Map with mobile-optimized touch gestures
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const map = new maps.Map(mapContainerRef.current, {
      zoom: 15,
      center: currentPos,
      disableDefaultUI: false,
      mapTypeControl: false, // Prevent giant dropdown box covering mobile screen
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: isMapTouchPan ? 'greedy' : (isMobile ? 'cooperative' : 'greedy'), // cooperative enables smooth page scroll on mobile
      styles: mapTheme === 'dark' ? GOOGLE_DARK_MODE_STYLE : null
    });
    mapInstanceRef.current = map;

    // Allow user to click anywhere on Google Map to fine-tune/lock exact live location
    map.addListener('click', (e) => {
      const clickedCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setCurrentPos(clickedCoords);
      if (userMarkerRef.current) userMarkerRef.current.setPosition(clickedCoords);
      reverseGeocode(clickedCoords.lat, clickedCoords.lng);
      updateHospitalMarkers(map, clickedCoords);
    });
    mapInstanceRef.current = map;

    // Create Directions Service & Renderer
    const directionsService = new maps.DirectionsService();
    const directionsRenderer = new maps.DirectionsRenderer({
      map: map,
      panel: directionsPanelRef.current,
      draggable: false,
      polylineOptions: {
        strokeColor: '#1a73e8',
        strokeWeight: 6,
        strokeOpacity: 0.9
      }
    });
    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    // InfoWindow
    infoWindowRef.current = new maps.InfoWindow();

    // User Live Location Marker (Blue pulsing circle)
    userMarkerRef.current = new maps.Marker({
      position: currentPos,
      map: map,
      title: 'Your Live Location',
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#1a73e8',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    // Custom Map Control Button: "Pan to Current Location"
    const locationButton = document.createElement('button');
    locationButton.textContent = '📍 Pan to Live GPS';
    locationButton.className = 'custom-map-control-button';
    locationButton.style.backgroundColor = '#0f172a';
    locationButton.style.border = '2px solid #3b82f6';
    locationButton.style.borderRadius = '12px';
    locationButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    locationButton.style.color = '#ffffff';
    locationButton.style.cursor = 'pointer';
    locationButton.style.fontFamily = 'system-ui, sans-serif';
    locationButton.style.fontSize = '11px';
    locationButton.style.fontWeight = '700';
    locationButton.style.margin = '8px';
    locationButton.style.padding = '6px 12px';
    locationButton.style.transition = 'all 0.2s ease';

    locationButton.addEventListener('mouseenter', () => {
      locationButton.style.backgroundColor = '#1e293b';
      locationButton.style.transform = 'scale(1.04)';
    });
    locationButton.addEventListener('mouseleave', () => {
      locationButton.style.backgroundColor = '#0f172a';
      locationButton.style.transform = 'scale(1)';
    });
    locationButton.addEventListener('click', () => {
      panToCurrentLocation();
    });

    map.controls[maps.ControlPosition.TOP_CENTER].push(locationButton);

    // Initial Geolocation Lock & Hospital Marker Plotting
    panToCurrentLocation();
    updateHospitalMarkers(map, currentPos);

    // Continuous watchPosition for live moving telemetry
    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPos(coords);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          if (userMarkerRef.current) userMarkerRef.current.setPosition(coords);
        },
        null,
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [sdkReady, mapTheme]);

  // 4. Calculate & Display Google Directions Route
  const calculateAndDisplayRoute = useCallback(async (customDestination = null) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !window.google?.maps) return;

    setIsCalculatingRoute(true);
    const maps = window.google.maps;

    const origin = useLiveOrigin ? new maps.LatLng(currentPos.lat, currentPos.lng) : startQuery;
    let destination = customDestination || endQuery;

    const executeRoute = (destTarget) => {
      directionsServiceRef.current.route(
        {
          origin: origin,
          destination: destTarget,
          travelMode: maps.TravelMode[selectedMode] || maps.TravelMode.DRIVING,
          provideRouteAlternatives: true
        },
        async (response, status) => {
          if (status === 'OK' && response?.routes?.[0]) {
            setIsCalculatingRoute(false);
            directionsRendererRef.current.setDirections(response);
            const leg = response.routes[0].legs[0];
            const summary = {
              distance: leg.distance.text,
              duration: leg.duration.text,
              startAddress: leg.start_address,
              endAddress: leg.end_address,
              stepsCount: leg.steps.length,
              overviewPath: response.routes[0].overview_path.map(p => [p.lat(), p.lng()])
            };
            setRouteSummary(summary);
            if (onRouteCalculated) onRouteCalculated(summary);

            // Multilingual Voice Guidance Announcement
            speakEmergencyInstruction(`Driving route calculated to ${endQuery.split(',')[0]}. Total distance: ${leg.distance.text}.`, language);
          } else {
            // If string destination failed, try resolving coordinates via geocoder
            if (typeof destTarget === 'string') {
              try {
                const geo = await geocodeLocation(destTarget);
                if (geo && geo.length > 0) {
                  executeRoute(new maps.LatLng(geo[0].lat, geo[0].lng));
                  return;
                }
              } catch {}
            }
            setIsCalculatingRoute(false);
          }
        }
      );
    };

    executeRoute(destination);
  }, [useLiveOrigin, currentPos, startQuery, endQuery, selectedMode, onRouteCalculated, language]);

  // Auto calculate when destination is preset
  useEffect(() => {
    if (sdkReady && endQuery) {
      calculateAndDisplayRoute();
    }
  }, [sdkReady]);

  // 5. Simulated Real GPS Driving along Google Directions Polyline
  const toggleDriveSimulation = () => {
    if (isSimulatingDrive) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatingDrive(false);
      return;
    }

    if (!routeSummary?.overviewPath || routeSummary.overviewPath.length < 2) {
      calculateAndDisplayRoute();
      return;
    }

    setIsSimulatingDrive(true);
    let stepIndex = 0;
    const path = routeSummary.overviewPath;

    simIntervalRef.current = setInterval(() => {
      if (stepIndex >= path.length) {
        clearInterval(simIntervalRef.current);
        setIsSimulatingDrive(false);
        return;
      }

      const [lat, lng] = path[stepIndex];
      const nextPos = { lat, lng };
      setCurrentPos(nextPos);

      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(nextPos);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(nextPos);
      }

      stepIndex++;
    }, 800);
  };

  return (
    <div className="w-full bg-[#070D18] border border-blue-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 font-sans text-white max-w-full overflow-hidden pb-20 sm:pb-28">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-950 shrink-0">
            <Route className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                {language === 'te' ? 'గూగుల్ మ్యాప్స్ లైవ్ రూటింగ్' : language === 'hi' ? 'गूगल मैप्स लाइव नेविगेशन' : language === 'ta' ? 'கூகுள் வரைபடம் நேரலை வழிகாட்டல்' : language === 'kn' ? 'ಗೂಗಲ್ ನಕ್ಷೆ ಲೈವ್ ಮಾರ್ಗದರ್ಶನ' : 'Google Maps Live Routing'}
              </h3>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                LIVE GPS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {locationName} {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
            </p>
          </div>
        </div>

        {/* Map Theme Toggle */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-slate-900 border border-slate-700 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[10px] sm:text-xs ${mapTheme === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapTheme('standard')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[10px] sm:text-xs ${mapTheme === 'standard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Road
            </button>
          </div>

          <button
            onClick={panToCurrentLocation}
            disabled={isLocating}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
          >
            {isLocating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
            <span>{language === 'te' ? 'లొకేట్' : language === 'hi' ? 'स्थान' : language === 'ta' ? 'கண்டறி' : language === 'kn' ? 'ಪತ್ತೆಮಾಡಿ' : 'Locate'}</span>
          </button>
        </div>
      </div>

      {/* Directions Control Panel (start, end, mode) - Fully mobile optimized */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-xs">
        {/* Start Location (Origin) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-blue-400" />
              <span>{language === 'te' ? 'ప్రారంభం (లొకేషన్)' : language === 'hi' ? 'प्रारंभ (स्थान)' : language === 'ta' ? 'தொடக்க இடம்' : language === 'kn' ? 'ಪ್ರಾರಂಭದ ಸ್ಥಳ' : 'START (ORIGIN)'}</span>
            </span>
            <button
              onClick={() => { setUseLiveOrigin(true); panToCurrentLocation(); }}
              className="text-[10px] text-blue-400 hover:underline cursor-pointer"
            >
              {language === 'te' ? 'లైవ్ GPS వాడు' : language === 'hi' ? 'लाइव GPS' : language === 'ta' ? 'நேரலை GPS' : language === 'kn' ? 'ಲೈವ್ GPS' : 'Use Live GPS'}
            </button>
          </label>
          <input
            id="start"
            type="text"
            value={startQuery}
            onChange={(e) => { setStartQuery(e.target.value); setUseLiveOrigin(false); }}
            placeholder="Starting location or 'My Live GPS Location'"
            className="w-full bg-[#080E1C] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none text-xs"
          />
        </div>

        {/* End Location (Destination) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>{language === 'te' ? 'గమ్యస్థానం (ఆసుపత్రి)' : language === 'hi' ? 'गंतव्य (अस्पताल)' : language === 'ta' ? 'சேருமிடம் (மருத்துவமனை)' : language === 'kn' ? 'ಗಮ್ಯಸ್ಥಾನ (ಆಸ್ಪತ್ರೆ)' : 'DESTINATION (HOSPITAL)'}</span>
          </label>
          <input
            id="end"
            type="text"
            value={endQuery}
            onChange={(e) => setEndQuery(e.target.value)}
            placeholder="Hospital name or address..."
            className="w-full bg-[#080E1C] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none text-xs"
          />
        </div>

        {/* Travel Mode & Route Trigger */}
        <div className="flex flex-col justify-end">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            {language === 'te' ? 'ప్రయాణ మార్గం & చర్య' : language === 'hi' ? 'यात्रा मोड एवं क्रिया' : language === 'ta' ? 'பயண முறை' : language === 'kn' ? 'ಪ್ರಯಾಣ ವಿಧಾನ' : 'TRAVEL MODE & ACTION'}
          </label>
          <div className="flex gap-1.5">
            <select
              id="mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#080E1C] border border-slate-700 rounded-xl px-2.5 py-2 text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="DRIVING">{language === 'te' ? 'డ్రైవింగ్ (ఎమర్జెన్సీ)' : language === 'hi' ? 'ड्राइविंग (आपातकालीन)' : language === 'ta' ? 'வாகனம் (அவசரம்)' : language === 'kn' ? 'ಡ್ರೈವಿಂಗ್ (ತುರ್ತು)' : 'Driving (Emergency)'}</option>
              <option value="WALKING">{language === 'te' ? 'నడక' : language === 'hi' ? 'पैदल' : language === 'ta' ? 'நடை' : language === 'kn' ? 'ನಡಿಗೆ' : 'Walking'}</option>
              <option value="BICYCLING">{language === 'te' ? 'సైకిల్' : language === 'hi' ? 'साइकिल' : language === 'ta' ? 'மிதிவண்டி' : language === 'kn' ? 'ಸೈಕಲ್' : 'Bicycling'}</option>
              <option value="TRANSIT">{language === 'te' ? 'రవాణా' : language === 'hi' ? 'ट्रांजिट' : language === 'ta' ? 'பேருந்து/ரயில்' : language === 'kn' ? 'ಸಾರಿಗೆ' : 'Transit'}</option>
            </select>
            <button
              onClick={() => calculateAndDisplayRoute()}
              disabled={isCalculatingRoute || !sdkReady}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-3 py-2 text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-950"
            >
              <Route className="w-3.5 h-3.5" />
              <span>{isCalculatingRoute ? (language === 'te' ? 'గణన...' : language === 'hi' ? 'खोज...' : 'Routing...') : (language === 'te' ? 'రూట్' : language === 'hi' ? 'मार्ग' : language === 'ta' ? 'வழி' : language === 'kn' ? 'ಮಾರ್ಗ' : 'Route')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Nearby Hospitals Quick Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[10px] text-slate-400 font-bold shrink-0">🏥 {language === 'te' ? 'సమీప ఆసుపత్రులు:' : language === 'hi' ? 'निकटतम अस्पताल:' : language === 'ta' ? 'அருகிலுள்ள மருத்துவமனைகள்:' : language === 'kn' ? 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು:' : 'Nearby Hospitals:'}</span>
        {nearbyHospitals.map((hosp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setEndQuery(hosp.name);
              setUseLiveOrigin(true);
              calculateAndDisplayRoute(hosp.name);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white text-[10px] sm:text-[11px] font-medium shrink-0 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span className="text-red-400 font-bold">🏥</span>
            <span className="truncate max-w-[130px] sm:max-w-[170px]">{hosp.name.split(',')[0]}</span>
            <span className="text-[9px] text-emerald-400 font-mono">({hosp.distanceKm}km)</span>
          </button>
        ))}
      </div>

      {/* Route Metadata Bar & Drive Simulation Action */}
      {routeSummary && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 font-black text-xs">
              {routeSummary.distance}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>Google ETA: <span className="text-emerald-400">{routeSummary.duration}</span></span>
                <span className="text-[10px] text-slate-400">({routeSummary.stepsCount} turns)</span>
              </div>
              <div className="text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
                To: {routeSummary.endAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleDriveSimulation}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all ${
                isSimulatingDrive
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950'
              }`}
            >
              {isSimulatingDrive ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSimulatingDrive ? (language === 'te' ? 'డ్రైవ్ ఆపు' : language === 'hi' ? 'ड्राइव रोकें' : language === 'ta' ? 'நிறுத்து' : language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop Drive') : (language === 'te' ? 'లైవ్ డ్రైవ్ అనుకరణ' : language === 'hi' ? 'लाइव ड्राइव सिमुलेशन' : language === 'ta' ? 'பயண உருவகப்படுத்துதல்' : language === 'kn' ? 'ಲೈವ್ ಡ್ರೈವ್ ಸಿಮ್ಯುಲೇಶನ್' : 'Simulate Live Drive')}</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${currentPos.lat},${currentPos.lng}&destination=${encodeURIComponent(endQuery)}&travelmode=${selectedMode.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps App</span>
            </a>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on mobile screens) */}
      <div className="flex lg:hidden bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-bold w-full">
        <button
          onClick={() => setMobileViewTab('map')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileViewTab === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{language === 'te' ? 'ఇంటరాక్టివ్ మ్యాప్' : language === 'hi' ? 'इंटरैक्टिव मानचित्र' : language === 'ta' ? 'நேரலை வரைபடம்' : language === 'kn' ? 'ಲೈವ್ ನಕ್ಷೆ' : 'Interactive Map'}</span>
        </button>
        <button
          onClick={() => setMobileViewTab('turns')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileViewTab === 'turns' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>{language === 'te' ? `మలుపుల వివరాలు (${routeSummary?.stepsCount || 0})` : language === 'hi' ? `नेविगेशन चरण (${routeSummary?.stepsCount || 0})` : language === 'ta' ? `வழிமுறைகள் (${routeSummary?.stepsCount || 0})` : language === 'kn' ? `ಮಾರ್ಗದ ಹಂತಗಳು (${routeSummary?.stepsCount || 0})` : `Turn Steps (${routeSummary?.stepsCount || 0})`}</span>
        </button>
      </div>

      {/* Main Map & Step-by-Step Directions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Google Maps Canvas */}
        <div className={`lg:col-span-2 relative w-full h-[290px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner ${
          mobileViewTab === 'turns' ? 'hidden lg:block' : 'block'
        }`}>
          <div ref={mapContainerRef} className="w-full h-full" style={{ touchAction: isMapTouchPan ? 'none' : 'pan-y' }} />

          {/* Mobile Floating 1-Finger Gesture Toggle */}
          <button
            onClick={() => setIsMapTouchPan(!isMapTouchPan)}
            className={`absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-2xl backdrop-blur-md transition-all sm:hidden cursor-pointer ${
              isMapTouchPan
                ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-amber-300'
                : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <span>{isMapTouchPan ? '🗺️ 1-Finger: Pan Map' : '📜 1-Finger: Scroll Page'}</span>
          </button>
          
          {/* Loading Indicator */}
          {(sdkLoading || isLocating) && (
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-blue-500/40 text-blue-300 text-xs px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>{sdkLoading ? 'Loading Google Maps...' : 'Locking Live GPS...'}</span>
            </div>
          )}
        </div>

        {/* Google Directions Sidebar Panel */}
        <div className={`relative w-full h-[320px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-3 sm:p-4 flex flex-col space-y-2 ${
          mobileViewTab === 'map' ? 'hidden lg:flex' : 'flex'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
            <span>{language === 'te' ? 'మలుపుల వారీగా నావిగేషన్' : language === 'hi' ? 'चरण-दर-चरण नेविगेशन' : language === 'ta' ? 'வழிகாட்டல் படிகள்' : language === 'kn' ? 'ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶನ' : 'Turn-by-Turn Navigation'}</span>
            <span className="text-[10px] text-blue-400 font-mono">DirectionsRenderer</span>
          </h4>
          <div 
            id="sidebar" 
            ref={directionsPanelRef} 
            className="flex-1 overflow-y-auto pr-1 text-xs text-slate-300 google-directions-panel scrollbar-thin scrollbar-thumb-slate-800"
          >
            {!routeSummary && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                <Route className="w-8 h-8 text-slate-700" />
                <p className="text-xs">Click "Route" above or select a hospital to calculate official Google Maps street navigation steps.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default GoogleLiveRoutingMap;
