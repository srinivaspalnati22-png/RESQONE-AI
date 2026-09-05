import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Navigation, Compass, Crosshair, Route, Clock, 
  ExternalLink, Key, Search, RefreshCw, CheckCircle2, 
  ShieldAlert, AlertTriangle, Hospital, Car, ArrowRight, Play, Square
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getGoogleMapsApiKey, setGoogleMapsApiKey, loadGoogleMapsSdk } from '../services/routing_service';

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

const EMERGENCY_PRESETS = [
  { name: 'Government General Hospital (GGH), Vijayawada', lat: 16.5167, lng: 80.6500 },
  { name: 'AIIMS Super-Specialty Medical Hub, Mangalagiri', lat: 16.4420, lng: 80.5750 },
  { name: 'Ramesh Hospitals Trauma Center, Vijayawada', lat: 16.5083, lng: 80.6417 },
  { name: 'Manipal Hospital ICU, Vijayawada', lat: 16.4833, lng: 80.6000 }
];

export const GoogleLiveRoutingMap = ({ onRouteCalculated, initialDestination = null }) => {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef(null);
  const directionsPanelRef = useRef(null);

  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const userMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const simIntervalRef = useRef(null);

  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());
  const [keyInput, setKeyInput] = useState('');
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
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'standard' | 'hybrid'
  const [routeSummary, setRouteSummary] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);

  // Sync API Key changes from global events
  useEffect(() => {
    const handleKeyChange = (e) => {
      const newKey = e.detail?.apiKey || getGoogleMapsApiKey();
      setApiKey(newKey);
    };
    window.addEventListener('resqone_google_key_changed', handleKeyChange);
    return () => window.removeEventListener('resqone_google_key_changed', handleKeyChange);
  }, []);

  // 1. Load Google Maps SDK
  useEffect(() => {
    if (!apiKey) {
      setSdkReady(false);
      return;
    }

    setSdkLoading(true);
    setSdkError(null);

    loadGoogleMapsSdk(apiKey)
      .then((maps) => {
        if (maps) {
          setSdkReady(true);
          setSdkLoading(false);
        } else {
          setSdkError('Unable to load Google Maps SDK with this API key. Verify key permissions.');
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

  // 2. HTML5 Geolocation with "Pan to Current Location"
  const panToCurrentLocation = useCallback(() => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      if (infoWindowRef.current && mapInstanceRef.current) {
        infoWindowRef.current.setPosition(currentPos);
        infoWindowRef.current.setContent('Geolocation is not supported by your browser.');
        infoWindowRef.current.open(mapInstanceRef.current);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCurrentPos(coords);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setIsLocating(false);
        reverseGeocode(coords.lat, coords.lng);

        if (mapInstanceRef.current && window.google?.maps) {
          mapInstanceRef.current.setCenter(coords);
          mapInstanceRef.current.setZoom(16);

          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition(coords);
          } else {
            userMarkerRef.current = new window.google.maps.Marker({
              position: coords,
              map: mapInstanceRef.current,
              title: 'Your Live Location',
              animation: window.google.maps.Animation.DROP,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: '#1a73e8',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
              }
            });
          }

          if (infoWindowRef.current) {
            infoWindowRef.current.setPosition(coords);
            infoWindowRef.current.setContent(`
              <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
                <b style="color: #1a73e8; font-size: 13px;">📍 Live GPS Locked</b><br/>
                <span style="font-size: 11px;">Accuracy: ±${Math.round(pos.coords.accuracy)}m</span><br/>
                <span style="font-size: 11px; color: #475569;">${locationName}</span>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, userMarkerRef.current);
          }
        }
      },
      () => {
        setIsLocating(false);
        if (infoWindowRef.current && mapInstanceRef.current) {
          infoWindowRef.current.setPosition(currentPos);
          infoWindowRef.current.setContent('Geolocation failed or permission denied.');
          infoWindowRef.current.open(mapInstanceRef.current);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [currentPos, locationName, reverseGeocode]);

  // 3. Initialize Google Maps, DirectionsRenderer, & Custom Controls
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current || !window.google?.maps) return;

    const maps = window.google.maps;

    // Create Map
    const map = new maps.Map(mapContainerRef.current, {
      zoom: 14,
      center: currentPos,
      disableDefaultUI: false,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: mapTheme === 'dark' ? GOOGLE_DARK_MODE_STYLE : null
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

    // Create InfoWindow
    infoWindowRef.current = new maps.InfoWindow();

    // Create Native Map Control Button: "Pan to Current Location"
    const locationButton = document.createElement('button');
    locationButton.textContent = '📍 Pan to Current Location';
    locationButton.className = 'custom-map-control-button';
    locationButton.style.backgroundColor = '#0f172a';
    locationButton.style.border = '2px solid #3b82f6';
    locationButton.style.borderRadius = '12px';
    locationButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    locationButton.style.color = '#ffffff';
    locationButton.style.cursor = 'pointer';
    locationButton.style.fontFamily = 'system-ui, sans-serif';
    locationButton.style.fontSize = '12px';
    locationButton.style.fontWeight = '700';
    locationButton.style.margin = '10px';
    locationButton.style.padding = '8px 14px';
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

    // Initial Geolocation Lock
    panToCurrentLocation();

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
  const calculateAndDisplayRoute = useCallback(() => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !window.google?.maps) return;

    setIsCalculatingRoute(true);
    const maps = window.google.maps;

    // Origin: Live GPS Coordinates object or text query
    const origin = useLiveOrigin ? new maps.LatLng(currentPos.lat, currentPos.lng) : startQuery;
    const destination = endQuery;

    directionsServiceRef.current.route(
      {
        origin: origin,
        destination: destination,
        travelMode: maps.TravelMode[selectedMode] || maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (response, status) => {
        setIsCalculatingRoute(false);
        if (status === 'OK' && response?.routes?.[0]) {
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
        } else {
          window.alert('Google Maps directions request failed due to: ' + status);
        }
      }
    );
  }, [useLiveOrigin, currentPos, startQuery, endQuery, selectedMode, onRouteCalculated]);

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

  const handleSaveCustomKey = () => {
    if (!keyInput.trim()) return;
    setGoogleMapsApiKey(keyInput.trim());
    setApiKey(keyInput.trim());
  };

  return (
    <div className="w-full bg-[#070D18] border border-blue-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 font-sans text-white">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-950">
            <Route className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Google Maps Live Location & Directions Engine
              </h3>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
                Official JS SDK
              </span>
            </div>
            <p className="text-xs text-slate-400">
              HTML5 Geolocation `watchPosition` • `DirectionsService` • `DirectionsRenderer`
            </p>
          </div>
        </div>

        {/* Map Theme Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${mapTheme === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cyber Dark
            </button>
            <button
              onClick={() => setMapTheme('standard')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${mapTheme === 'standard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Standard Road
            </button>
          </div>
        </div>
      </div>

      {/* API Key Missing Overlay Prompt */}
      {!apiKey && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border-2 border-amber-500/50 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm">
            <Key className="w-5 h-5" />
            <span>Google Maps API Key Required for Official Google SDK Rendering</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To render the official Google Maps JavaScript map, live satellite overlays, and use Google's native DirectionsService, enter your Google Cloud API key below:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste AIzaSy... Google Maps API Key here"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveCustomKey}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activate Google Engine</span>
            </button>
          </div>
        </div>
      )}

      {/* Directions Floating Control Panel (start, end, mode) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
        {/* Start Location (Origin) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-blue-400" />
              <span>START (ORIGIN)</span>
            </span>
            <button
              onClick={() => { setUseLiveOrigin(true); panToCurrentLocation(); }}
              className="text-[10px] text-blue-400 hover:underline cursor-pointer"
            >
              Use Live GPS
            </button>
          </label>
          <input
            id="start"
            type="text"
            value={startQuery}
            onChange={(e) => { setStartQuery(e.target.value); setUseLiveOrigin(false); }}
            placeholder="Starting location or 'My Live GPS Location'"
            className="w-full bg-[#080E1C] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
          />
        </div>

        {/* End Location (Destination) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>DESTINATION (HOSPITAL / ADDRESS)</span>
          </label>
          <input
            id="end"
            type="text"
            value={endQuery}
            onChange={(e) => setEndQuery(e.target.value)}
            placeholder="Destination address or hospital name..."
            className="w-full bg-[#080E1C] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
          />
        </div>

        {/* Travel Mode & Route Trigger */}
        <div className="flex flex-col justify-end">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            TRAVEL MODE & ACTION
          </label>
          <div className="flex gap-2">
            <select
              id="mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#080E1C] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="DRIVING">Driving (Emergency)</option>
              <option value="WALKING">Walking</option>
              <option value="BICYCLING">Bicycling</option>
              <option value="TRANSIT">Transit</option>
            </select>
            <button
              onClick={calculateAndDisplayRoute}
              disabled={isCalculatingRoute || !sdkReady}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-3 py-2 text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-950"
            >
              <Route className="w-3.5 h-3.5" />
              <span>{isCalculatingRoute ? 'Calculating...' : 'Route'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Preset Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] text-slate-400 font-bold shrink-0">Quick Destinations:</span>
        {EMERGENCY_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setEndQuery(preset.name);
              setTimeout(() => calculateAndDisplayRoute(), 100);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-[11px] font-medium shrink-0 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>🏥</span>
            <span className="truncate max-w-[150px]">{preset.name.split(',')[0]}</span>
          </button>
        ))}
      </div>

      {/* Route Metadata Bar & Drive Simulation Action */}
      {routeSummary && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 font-black">
              {routeSummary.distance}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Google Driving ETA: <span className="text-emerald-400">{routeSummary.duration}</span></span>
                <span className="text-[10px] text-slate-400">({routeSummary.stepsCount} turns)</span>
              </div>
              <div className="text-[11px] text-slate-300 truncate max-w-md">
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
              <span>{isSimulatingDrive ? 'Stop Drive' : 'Simulate Live Drive'}</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${currentPos.lat},${currentPos.lng}&destination=${encodeURIComponent(endQuery)}&travelmode=${selectedMode.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps App</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Map & Step-by-Step Directions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Google Maps Canvas */}
        <div className="lg:col-span-2 relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Loading Indicator */}
          {(sdkLoading || isLocating) && (
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>{sdkLoading ? 'Loading Google Maps SDK...' : 'Locking Live GPS Location...'}</span>
            </div>
          )}
        </div>

        {/* Google Directions Sidebar Panel */}
        <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 flex flex-col space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Turn-by-Turn Navigation</span>
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
                <p className="text-xs">Click "Route" above to calculate official Google Maps street turns and navigation steps.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default GoogleLiveRoutingMap;
