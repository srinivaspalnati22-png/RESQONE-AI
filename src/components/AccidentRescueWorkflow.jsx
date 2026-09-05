import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Hospital, Siren, MapPin, CheckCircle2, ShieldCheck, 
  Activity, Clock, Phone, Navigation, ArrowRight, HeartPulse, 
  AlertTriangle, Radio, Sparkles, UserCheck, Stethoscope, Compass, ExternalLink, RefreshCw,
  Users, Check, Award
} from 'lucide-react';
import { speakEmergencyInstruction, stopAllAudio } from '../services/audio_service';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function AccidentRescueWorkflow({ crashDetails, onReset }) {
  const { user, familyContacts } = useAuth();
  const { language, t } = useLanguage();
  
  // Rescue Stages:
  // 1. 'NOTIFYING_HOSPITALS' (Radar broadcast to 4 regional hospitals)
  // 2. 'HOSPITAL_RESPONDED' (GGH Vijayawada accepts case & allocates ICU bed)
  // 3. 'AMBULANCE_EN_ROUTE_TO_VICTIM' (Ambulance drives from Hospital to Victim)
  // 4. 'PATIENT_PICKUP' (Paramedics stabilize & board victim on scene)
  // 5. 'AMBULANCE_RETURNING_TO_HOSPITAL' (Ambulance drives back with victim to Hospital)
  // 6. 'VICTIM_SAFE_IN_HOSPITAL' (Patient safely admitted to ICU Bay • Patient Safe!)
  const [rescueStage, setRescueStage] = useState('NOTIFYING_HOSPITALS');
  const [ambulanceProgress, setAmbulanceProgress] = useState(0); // 0 to 100%

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Lifecycle audio cleanup when leaving rescue map workflow
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // 4 Real Hospitals with GPS Coordinates (Vijayawada / AP Region)
  const [hospitals, setHospitals] = useState([
    {
      id: 'hosp-1',
      name: 'Government General Hospital (GGH Vijayawada)',
      shortName: 'GGH Vijayawada',
      role: 'Trauma Lead Responded',
      distance: '1.8 km',
      eta: '3.5 Mins',
      coords: [16.5167, 80.6500],
      isResponded: true,
      icuBed: 'Bay #4 Reserved',
      ambulance: 'ALS-108 (AP-TRAUMA-99)',
      status: 'ACCEPTING CASE...'
    },
    {
      id: 'hosp-2',
      name: 'AIIMS Mangalagiri Super-Specialty',
      shortName: 'AIIMS Mangalagiri',
      role: 'Regional Tertiary Support',
      distance: '11.4 km',
      eta: '14 Mins',
      coords: [16.4419, 80.5744],
      isResponded: false,
      icuBed: 'Standby Backup',
      ambulance: 'Standby ALS Unit',
      status: 'NOTIFIED'
    },
    {
      id: 'hosp-3',
      name: 'Ramesh Cardiac & Multi-Speciality Hospitals',
      shortName: 'Ramesh Hospitals',
      role: 'Trauma ICU Partner',
      distance: '3.2 km',
      eta: '5.8 Mins',
      coords: [16.5080, 80.6400],
      isResponded: false,
      icuBed: 'Standby Backup',
      ambulance: 'Standby Unit',
      status: 'NOTIFIED'
    },
    {
      id: 'hosp-4',
      name: 'Manipal Hospital Tadepalle',
      shortName: 'Manipal Hospital',
      role: 'Emergency Casualty Center',
      distance: '6.5 km',
      eta: '8.2 Mins',
      coords: [16.4850, 80.6120],
      isResponded: false,
      icuBed: 'Standby Backup',
      ambulance: 'Standby Unit',
      status: 'NOTIFIED'
    }
  ]);

  // Real Vijayawada Road Corridor GPS Waypoints (GGH Vijayawada ↔ NH-16 Gollapudi Crash Site)
  const gpsRouteWaypoints = [
    [16.5167, 80.6500], // GGH Vijayawada Trauma Center (Start)
    [16.5185, 80.6440], // MG Road Junction
    [16.5220, 80.6350], // Besant Road Intersection
    [16.5265, 80.6270], // Prakasam Barrage Approach
    [16.5310, 80.6150], // Bhavanipuram Arterial Flyover
    [16.5360, 80.5980], // NH-16 Gollapudi High-Speed Corridor
    [16.5412, 80.5843]  // Gollapudi Crash Site (Victim Location)
  ];

  // Helper to interpolate position & heading angle along road
  const getInterpolatedGPSAndAngle = (pct) => {
    const clampedPct = Math.max(0, Math.min(100, pct));
    const isReturning = rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' || rescueStage === 'VICTIM_SAFE_IN_HOSPITAL';

    // When returning, progress 100 means at victim, 0 means back at hospital
    let effectiveProgress = clampedPct;
    if (isReturning) {
      effectiveProgress = clampedPct; // 100 -> 0 along waypoints reversed
    }

    const totalSegments = gpsRouteWaypoints.length - 1;
    const globalT = (effectiveProgress / 100) * totalSegments;
    const segIdx = Math.min(Math.floor(globalT), totalSegments - 1);
    const localT = globalT - segIdx;

    const p1 = gpsRouteWaypoints[segIdx];
    const p2 = gpsRouteWaypoints[segIdx + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * localT;
    const lng = p1[1] + (p2[1] - p1[1]) * localT;

    // Calculate heading angle in degrees
    const dLat = isReturning ? (p1[0] - p2[0]) : (p2[0] - p1[0]);
    const dLng = isReturning ? (p1[1] - p2[1]) : (p2[1] - p1[1]);
    const angleRad = Math.atan2(dLng, dLat);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { lat, lng, angle: angleDeg };
  };

  // High-Fidelity 3D Isometric Ambulance with Dual Flashing Strobe Lights & Shadow
  const create3DAmbulanceHTML = (angleDeg, isReturning) => {
    return `
      <div style="position: relative; width: 64px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <!-- Emergency Siren Pulse Rings on Road Asphalt -->
        <div style="
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle, ${isReturning ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'} 0%, rgba(59, 130, 246, 0.3) 50%, transparent 75%);
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        "></div>

        <!-- Realistic 3D Ambulance Vehicle Body (Rotates with Highway Direction) -->
        <div style="
          width: 28px; 
          height: 52px; 
          border-radius: 7px; 
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%);
          border: 1.5px solid #64748b;
          box-shadow: 0 8px 20px rgba(0,0,0,0.85), 0 0 14px ${isReturning ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'};
          transform: rotate(${angleDeg}deg); 
          transition: transform 0.1s linear;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        ">
          <!-- Front Bumper & Headlights -->
          <div style="width: 100%; height: 6px; background: #334155; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; padding: 0 2px;">
            <div style="width: 4px; height: 3px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 4px #facc15;"></div>
            <div style="width: 4px; height: 3px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 4px #facc15;"></div>
          </div>

          <!-- Windshield (Dark Tinted Glass) -->
          <div style="width: 22px; height: 10px; background: #0f172a; border-radius: 3px; margin-top: 1px; border: 1px solid #38bdf8; display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 2px; background: #38bdf8; opacity: 0.6;"></div>
          </div>

          <!-- Roof Emergency LED Strobe Lightbar (Flashing Red / Blue) -->
          <div style="
            width: 18px; 
            height: 5px; 
            background: #020617; 
            border-radius: 3px; 
            margin-top: 2px; 
            display: flex; 
            justify-content: space-between; 
            padding: 0 1px; 
            border: 1px solid #475569;
          ">
            <div style="width: 7px; height: 3px; background: #ef4444; border-radius: 1px; box-shadow: 0 0 8px #ef4444; animation: pulse 0.5s infinite alternate;"></div>
            <div style="width: 7px; height: 3px; background: #3b82f6; border-radius: 1px; box-shadow: 0 0 8px #3b82f6; animation: pulse 0.5s 0.25s infinite alternate;"></div>
          </div>

          <!-- Red Medical Cross Emblem on Roof -->
          <div style="position: relative; width: 10px; height: 10px; margin-top: 4px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 8px; height: 3px; background: #dc2626; border-radius: 1px;"></div>
            <div style="position: absolute; width: 3px; height: 8px; background: #dc2626; border-radius: 1px;"></div>
          </div>

          <!-- Side Red Emergency Stripe -->
          <div style="position: absolute; left: 0; top: 12px; bottom: 4px; width: 2px; background: #dc2626;"></div>
          <div style="position: absolute; right: 0; top: 12px; bottom: 4px; width: 2px; background: #dc2626;"></div>

          <!-- Rear Paramedic Doors & Taillights -->
          <div style="position: absolute; bottom: 0; width: 100%; height: 4px; background: #1e293b; display: flex; justify-content: space-between; padding: 0 2px;">
            <div style="width: 3px; height: 2px; background: #ef4444; box-shadow: 0 0 3px #ef4444;"></div>
            <div style="width: 3px; height: 2px; background: #ef4444; box-shadow: 0 0 3px #ef4444;"></div>
          </div>
        </div>

        <!-- Floating High-Contrast Speed & Unit Tag -->
        <div style="
          position: absolute; 
          bottom: -10px; 
          background: rgba(5, 10, 20, 0.95); 
          color: ${isReturning ? '#34d399' : '#f87171'}; 
          font-size: 8px; 
          font-family: monospace; 
          font-weight: 900; 
          padding: 2px 6px; 
          border-radius: 6px; 
          border: 1px solid ${isReturning ? '#10b981' : '#ef4444'}; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.9);
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
        ">
          ${isReturning ? 'ALS-108 • 88 km/h 🚨' : 'ALS-108 • 85 km/h 🚑'}
        </div>
      </div>
    `;
  };

  // Initialize Real OpenStreetMap / CartoDB Dark Navigation Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        mapContainerRef.current._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [16.5250, 80.6180],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Authentic Real-World Street Tiles (Free OpenStreetMap - No API Key Required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'leaflet-dark-mode',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // 1. Draw Glowing Emergency Green Corridor Polyline along Real Streets
      const polyline = L.polyline(gpsRouteWaypoints, {
        color: '#10b981',
        weight: 7,
        opacity: 0.95,
        dashArray: '12, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = polyline;

      // 2. 3D Responded Hospital Marker (GGH Vijayawada)
      const ggh3DIcon = L.divIcon({
        className: 'custom-3d-ggh-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 58px; 
              height: 58px; 
              border-radius: 18px; 
              background: linear-gradient(145deg, #064e3b, #022c22); 
              border: 2px solid #34d399; 
              box-shadow: 0 10px 25px rgba(16, 185, 129, 0.7); 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
            ">
              <div style="font-size: 22px; line-height: 1;">🏥</div>
              <div style="font-size: 8px; font-weight: 900; color: #a7f3d0; font-family: monospace; margin-top: 2px;">
                GGH ICU
              </div>
            </div>
            <div style="
              margin-top: 4px; 
              background: rgba(2, 44, 34, 0.95); 
              color: #34d399; 
              font-size: 8px; 
              font-family: monospace; 
              font-weight: 900; 
              padding: 2px 6px; 
              border-radius: 6px; 
              border: 1px solid #10b981; 
              white-space: nowrap;
            ">
              LEAD ACCEPTED
            </div>
          </div>
        `,
        iconSize: [64, 80],
        iconAnchor: [32, 40]
      });

      L.marker([16.5167, 80.6500], { icon: ggh3DIcon }).addTo(map);

      // 3. Other Regional Hospital Markers
      hospitals.slice(1).forEach((h) => {
        const hospIcon = L.divIcon({
          className: 'custom-hosp-marker',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.9); 
              border: 1px solid #64748b; 
              border-radius: 12px; 
              padding: 4px 8px; 
              display: flex; 
              align-items: center; 
              gap: 4px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.8);
            ">
              <span style="font-size: 14px;">🏥</span>
              <span style="color: #cbd5e1; font-size: 9px; font-weight: 700; font-family: monospace; white-space: nowrap;">
                ${h.shortName}
              </span>
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });
        L.marker(h.coords, { icon: hospIcon }).addTo(map);
      });

      // 4. Victim 3D Crash Marker (NH-16 Gollapudi Bypass)
      const victim3DIcon = L.divIcon({
        className: 'custom-3d-victim-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 58px; 
              height: 58px; 
              border-radius: 18px; 
              background: linear-gradient(145deg, #7f1d1d, #450a0a); 
              border: 2px solid #ef4444; 
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.8); 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              position: relative;
            ">
              <div style="font-size: 22px; line-height: 1;">📍</div>
              <div style="font-size: 8px; font-weight: 900; color: #fca5a5; font-family: monospace; margin-top: 2px;">
                CRASH SITE
              </div>
            </div>
            <div style="
              margin-top: 4px; 
              background: rgba(69, 10, 10, 0.95); 
              color: #fca5a5; 
              font-size: 8px; 
              font-family: monospace; 
              font-weight: 900; 
              padding: 2px 6px; 
              border-radius: 6px; 
              border: 1px solid #ef4444; 
              white-space: nowrap;
            ">
              VICTIM LOCATED
            </div>
          </div>
        `,
        iconSize: [64, 80],
        iconAnchor: [32, 40]
      });

      L.marker([16.5412, 80.5843], { icon: victim3DIcon }).addTo(map);

      // 5. Initial 3D Animated Ambulance Marker at Hospital Start
      const { lat: initLat, lng: initLng, angle: initAngle } = getInterpolatedGPSAndAngle(0);
      const ambIcon = L.divIcon({
        className: 'custom-3d-small-ambulance-marker',
        html: create3DAmbulanceHTML(initAngle, false),
        iconSize: [120, 120],
        iconAnchor: [60, 60]
      });

      const ambMarker = L.marker([initLat, initLng], { icon: ambIcon, zIndexOffset: 2000 }).addTo(map);
      ambulanceMarkerRef.current = ambMarker;
      mapInstanceRef.current = map;
    }

    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(t1);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Ambulance Position & 3D Orientation on Real Street Map
  useEffect(() => {
    if (ambulanceMarkerRef.current) {
      const isReturning = rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' || rescueStage === 'VICTIM_SAFE_IN_HOSPITAL';
      const { lat, lng, angle } = getInterpolatedGPSAndAngle(ambulanceProgress);
      ambulanceMarkerRef.current.setLatLng([lat, lng]);

      const updatedIcon = L.divIcon({
        className: 'custom-3d-small-ambulance-marker',
        html: create3DAmbulanceHTML(angle, isReturning),
        iconSize: [120, 120],
        iconAnchor: [60, 60]
      });
      ambulanceMarkerRef.current.setIcon(updatedIcon);
    }
  }, [ambulanceProgress, rescueStage]);

  // Initialize Stage: Ambulance Moves Towards Crash Location smoothly
  useEffect(() => {
    const t1 = setTimeout(() => {
      setHospitals((prev) =>
        prev.map((h) => ({
          ...h,
          status: h.isResponded ? 'ACCEPTED & DISPATCHED' : 'STANDBY BACKUP'
        }))
      );
      setRescueStage('AMBULANCE_EN_ROUTE_TO_VICTIM');
      speakEmergencyInstruction("Ambulance is moving towards crash location on National Highway 16.");
    }, 2800);

    return () => clearTimeout(t1);
  }, []);

  // Ambulance Movement Simulation Loop (Hospital -> Victim -> Hospital)
  useEffect(() => {
    let interval = null;

    if (rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM') {
      interval = setInterval(() => {
        setAmbulanceProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setRescueStage('PATIENT_PICKUP');
            speakEmergencyInstruction("Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.");
            return 100;
          }
          return prev + 1.2; // Smooth steady progression along NH-16 (~9.5 seconds)
        });
      }, 110);
    } else if (rescueStage === 'PATIENT_PICKUP') {
      const tPickup = setTimeout(() => {
        setAmbulanceProgress(100);
        setRescueStage('AMBULANCE_RETURNING_TO_HOSPITAL');
        speakEmergencyInstruction("Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.");
      }, 3500);
      return () => clearTimeout(tPickup);
    } else if (rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL') {
      interval = setInterval(() => {
        setAmbulanceProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setRescueStage('VICTIM_SAFE_IN_HOSPITAL');
            speakEmergencyInstruction("Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!");
            return 0;
          }
          return prev - 1.2; // Smooth steady return via green corridor (~9.5 seconds)
        });
      }, 110);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rescueStage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-6"
    >
      {/* 1. Live Multi-Agency Response Status Header */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black shadow-lg">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                {language === 'te' ? 'స్వయంచాలక రెస్క్యూ మిషన్ సక్రియం' : language === 'hi' ? 'स्वचालित बहु-एजेंसी बचाव मिशन सक्रिय' : 'AUTONOMOUS MULTI-AGENCY RESCUE ACTIVE'}
              </span>
              <h3 className="text-lg font-black text-white">
                {language === 'te' ? 'ప్రత్యక్ష 3D ఆంబులెన్స్ మిషన్ & హాస్పిటల్ టెలిమెట్రీ' : language === 'hi' ? 'लाइव 3D एम्बुलेंस मिशन एवं अस्पताल टेलीमेट्री' : 'Live 3D Ambulance Mission & Trauma Hospital Telemetry'}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{language === 'te' ? 'లైవ్ GPS ట్రాకింగ్' : language === 'hi' ? 'लाइव जीपीएस ट्रैकिंग' : 'REAL-TIME SATELLITE GPS ACTIVE'}</span>
          </div>
        </div>

        {/* 2. REAL INTERACTIVE NAVIGATION MAP WITH MOVING 3D AMBULANCE */}
        <div className="relative w-full h-[440px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Mission HUD Overlay */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 shadow-2xl space-y-1.5 pointer-events-none max-w-xs sm:max-w-md">
            <div className="text-white font-bold text-xs flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Current Rescue Phase:</span>
              <span className="text-emerald-400 font-black uppercase">
                {rescueStage.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 space-y-0.5">
              <div>📍 Corridor: <strong className="text-white">NH-16 Gollapudi ↔ GGH Vijayawada</strong></div>
              <div>⚡ Green Signal Corridors: <strong className="text-emerald-400">4 Intersections Cleared</strong></div>
              <div>🏥 Lead Hospital: <strong className="text-cyan-300">GGH Vijayawada (14 ICU Beds Ready)</strong></div>
            </div>

            {/* Mission Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-green-500 h-full transition-all duration-300"
                style={{ 
                  width: `${
                    rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' 
                      ? (ambulanceProgress * 0.5) 
                      : rescueStage === 'PATIENT_PICKUP' 
                      ? 50 
                      : rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' 
                      ? (50 + (100 - ambulanceProgress) * 0.5) 
                      : rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' 
                      ? 100 
                      : 10
                  }%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. STEP PROGRESSION STAGES BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
          <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
            rescueStage === 'HOSPITAL_RESPONDED' || rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' || rescueStage === 'PATIENT_PICKUP' || rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' || rescueStage === 'VICTIM_SAFE_IN_HOSPITAL'
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-[#050A14] border-slate-800 text-slate-400'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span>1. Hospital Accepted</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
            rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' || rescueStage === 'PATIENT_PICKUP' || rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' || rescueStage === 'VICTIM_SAFE_IN_HOSPITAL'
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-[#050A14] border-slate-800 text-slate-400'
          }`}>
            <Siren className="w-3.5 h-3.5" />
            <span>2. En Route to Victim</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
            rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' || rescueStage === 'VICTIM_SAFE_IN_HOSPITAL'
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-[#050A14] border-slate-800 text-slate-400'
          }`}>
            <Stethoscope className="w-3.5 h-3.5" />
            <span>3. Returning to ICU</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
            rescueStage === 'VICTIM_SAFE_IN_HOSPITAL'
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-black animate-pulse'
              : 'bg-[#050A14] border-slate-800 text-slate-400'
          }`}>
            <Award className="w-3.5 h-3.5" />
            <span>4. Victim Safe!</span>
          </div>
        </div>

        {/* 4. FINAL RESCUE CELEBRATION: VICTIM SAFE IN HOSPITAL! */}
        {rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#064e3b] to-emerald-950 border-2 border-emerald-400 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.5)] text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-black text-emerald-300 uppercase tracking-widest">
                MISSION ACCOMPLISHED • EMERGENCY RESOLVED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                VICTIM ARRIVED SAFELY AT HOSPITAL!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
                <strong className="text-white">{user?.name || 'Srinivas Palnati'}</strong> has been safely transported by <strong className="text-white">ALS-108 Ambulance</strong> and admitted to <strong className="text-white">Government General Hospital (GGH Vijayawada) ICU Trauma Bay #4</strong>.
              </p>
            </div>

            {/* Vitals & Family Confirmation Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#022c22]/80 p-3.5 rounded-2xl border border-emerald-500/40 text-left font-mono text-xs">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase">Patient Vitals</span>
                <div className="font-bold text-white">120/80 mmHg (Stable)</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase">SpO2 Oxygen</span>
                <div className="font-bold text-emerald-300">99% Normal</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase">Blood Group</span>
                <div className="font-bold text-cyan-300">{user?.blood_group || 'O-'} Verified</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase">5 Family Alerts</span>
                <div className="font-bold text-emerald-300">5/5 Notified Safe</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Hospital Dispatch & 5-Family SOS Notification Matrix */}
        <div className="space-y-3 pt-2">
          {/* Family SOS Delivery Status */}
          <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>5 Registered Family SOS Contacts (Live GPS & Status Transmitted):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                5/5 DELIVERED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(familyContacts || []).map((fc, idx) => (
                <div key={fc.id || idx} className="bg-[#0B1220] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white truncate max-w-[140px]">{fc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{fc.phone}</div>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    SMS Sent
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Regional Hospitals Response Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hospitals.map((hosp) => (
              <div
                key={hosp.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hosp.isResponded
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                    : 'bg-[#050A14] border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Hospital className={`w-5 h-5 ${hosp.isResponded ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <div>
                      <h5 className="text-xs font-black text-white">{hosp.shortName}</h5>
                      <p className="text-[10px] text-slate-400">{hosp.role} • {hosp.distance}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    hosp.isResponded
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {hosp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Telemetry mirrored to State Highway Police & Trauma Care Control Room (112).</span>
          </div>

          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Reset & New Simulation</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
