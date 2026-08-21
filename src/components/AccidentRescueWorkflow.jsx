import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Hospital, Siren, MapPin, CheckCircle2, ShieldCheck, 
  Activity, Clock, Phone, Navigation, ArrowRight, HeartPulse, 
  AlertTriangle, Radio, Sparkles, UserCheck, Stethoscope, Compass, ExternalLink, RefreshCw
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

export function AccidentRescueWorkflow({ crashDetails, onReset }) {
  // Rescue Stages:
  // 1. 'NOTIFYING_HOSPITALS' (Radar broadcasting to 4 nearby hospitals)
  // 2. 'HOSPITAL_RESPONDED' (GGH Vijayawada accepts & dispatches ALS 108)
  // 3. 'AMBULANCE_EN_ROUTE_TO_VICTIM' (Ambulance drives from Hospital to Victim)
  // 4. 'PATIENT_PICKUP' (Paramedics stabilize & board patient on scene)
  // 5. 'AMBULANCE_RETURNING_TO_HOSPITAL' (Ambulance drives rapidly back to Hospital)
  // 6. 'VICTIM_SAFE_IN_HOSPITAL' (Patient safely admitted to ICU Bay)
  const [rescueStage, setRescueStage] = useState('NOTIFYING_HOSPITALS');
  const [ambulanceProgress, setAmbulanceProgress] = useState(0); // 0 to 100%

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // 4 Real Hospitals with GPS Coordinates (Vijayawada / AP Region)
  const [hospitals, setHospitals] = useState([
    {
      id: 'hosp-1',
      name: 'Government General Hospital (GGH Vijayawada)',
      shortName: 'GGH Vijayawada',
      role: 'Trauma Lead Responded',
      distance: '1.8 km',
      eta: '3.5 Mins',
      icu: 14,
      status: 'TRANSMITTING',
      isResponded: true,
      lat: 16.5167,
      lng: 80.6500
    },
    {
      id: 'hosp-2',
      name: 'AIIMS Mangalagiri Apex Trauma Center',
      shortName: 'AIIMS Mangalagiri',
      role: 'Level-1 Backup Center',
      distance: '4.2 km',
      eta: '7.0 Mins',
      icu: 26,
      status: 'TRANSMITTING',
      isResponded: false,
      lat: 16.4389,
      lng: 80.5606
    },
    {
      id: 'hosp-3',
      name: 'Ramesh Hospitals Emergency Center',
      shortName: 'Ramesh Super Specialty',
      role: 'Cardiac & Neuro Backup',
      distance: '3.1 km',
      eta: '5.5 Mins',
      icu: 16,
      status: 'TRANSMITTING',
      isResponded: false,
      lat: 16.5083,
      lng: 80.6417
    },
    {
      id: 'hosp-4',
      name: 'Manipal Hospital Vijayawada',
      shortName: 'Manipal Emergency ICU',
      role: 'Critical Care Standby',
      distance: '4.8 km',
      eta: '8.2 Mins',
      icu: 9,
      status: 'TRANSMITTING',
      isResponded: false,
      lat: 16.4833,
      lng: 80.6000
    }
  ]);

  // Real GPS Waypoints along NH-16 connecting GGH Vijayawada to Gollapudi Crash Site
  const gpsRouteWaypoints = [
    [16.5167, 80.6500], // GGH Vijayawada (Hospital Base)
    [16.5195, 80.6390], // Eluru Road / Governorpet
    [16.5240, 80.6220], // Bhavanipuram Main Corridor
    [16.5335, 80.6020], // NH-16 Flyover Junction
    [16.5412, 80.5843]  // Gollapudi Highway Crash Site (Victim)
  ];

  // Helper to interpolate along GPS waypoints and calculate rotation angle
  const getInterpolatedGPSAndAngle = (tPercent) => {
    const t = Math.max(0, Math.min(100, tPercent)) / 100;
    const numSegments = gpsRouteWaypoints.length - 1;
    const scaledT = t * numSegments;
    const segmentIndex = Math.min(Math.floor(scaledT), numSegments - 1);
    const segmentT = scaledT - segmentIndex;

    const p0 = gpsRouteWaypoints[segmentIndex];
    const p1 = gpsRouteWaypoints[segmentIndex + 1];

    const lat = p0[0] + (p1[0] - p0[0]) * segmentT;
    const lng = p0[1] + (p1[1] - p0[1]) * segmentT;

    // Angle calculation for 3D vehicle orientation on real map
    const dLat = p1[0] - p0[0];
    const dLng = p1[1] - p0[1];
    let angleDeg = Math.atan2(dLng, dLat) * (180 / Math.PI);
    if (rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL') {
      angleDeg += 180; // Reverse heading when driving back
    }

    return { lat, lng, angle: angleDeg };
  };

  // Initialize Real OpenStreetMap / CartoDB Dark Navigation Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.5250, 80.6180],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Authentic Real-World Street & Satellite Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // 1. Draw Glowing Emergency Green Corridor Polyline along Real Streets
      const polyline = L.polyline(gpsRouteWaypoints, {
        color: '#10b981',
        weight: 6,
        opacity: 0.9,
        dashArray: '10, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = polyline;

      // 2. 3D Responded Hospital Marker (GGH Vijayawada)
      const ggh3DIcon = L.divIcon({
        className: 'custom-3d-ggh-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; perspective: 600px;">
            <!-- 3D Hospital Isometric Model -->
            <div style="
              width: 58px; 
              height: 58px; 
              border-radius: 18px; 
              background: linear-gradient(145deg, #064e3b, #022c22); 
              border: 2px solid #34d399; 
              box-shadow: 0 10px 25px rgba(16, 185, 129, 0.7), inset 0 2px 4px rgba(255,255,255,0.2); 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              transform: rotateX(15deg);
              position: relative;
            ">
              <!-- Rotating Red Cross -->
              <div style="font-size: 22px; line-height: 1; filter: drop-shadow(0 0 6px #ef4444);">
                🏥
              </div>
              <div style="font-size: 8px; font-weight: 900; color: #a7f3d0; font-family: monospace; margin-top: 2px;">
                GGH ICU
              </div>
            </div>

            <!-- Pulsing Green Radar Wave -->
            <div style="
              position: absolute; 
              top: -6px; 
              left: 50%; 
              transform: translateX(-50%); 
              width: 70px; 
              height: 70px; 
              border: 2px solid #10b981; 
              border-radius: 50%; 
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              pointer-events: none;
            "></div>

            <!-- Responded Status Badge -->
            <div style="
              margin-top: 6px; 
              background: rgba(2, 44, 34, 0.95); 
              color: #34d399; 
              font-size: 10px; 
              font-weight: 900; 
              padding: 3px 8px; 
              border-radius: 8px; 
              border: 1px solid #10b981; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.8);
              white-space: nowrap;
            ">
              🟢 GGH VIJAYAWADA (ACCEPTED LEAD)
            </div>
          </div>
        `,
        iconSize: [160, 90],
        iconAnchor: [80, 45]
      });
      L.marker([16.5167, 80.6500], { icon: ggh3DIcon, zIndexOffset: 500 }).addTo(map);

      // 3. 3D Standby Hospitals Markers on Real Map
      const standbyHospitals = [
        { name: 'AIIMS Mangalagiri (Standby)', lat: 16.4389, lng: 80.5606, dist: '4.2 km' },
        { name: 'Ramesh Super Specialty (Standby)', lat: 16.5083, lng: 80.6417, dist: '3.1 km' },
        { name: 'Manipal Emergency ICU (Standby)', lat: 16.4833, lng: 80.6000, dist: '4.8 km' }
      ];

      standbyHospitals.forEach((h) => {
        const standby3DIcon = L.divIcon({
          className: 'custom-3d-standby-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; opacity: 0.85;">
              <div style="
                width: 40px; 
                height: 40px; 
                border-radius: 12px; 
                background: linear-gradient(145deg, #0f172a, #020617); 
                border: 1.5px solid #0284c7; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 18px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.6);
              ">
                🏥
              </div>
              <div style="
                margin-top: 3px; 
                background: rgba(15, 23, 42, 0.95); 
                color: #94a3b8; 
                font-size: 9px; 
                font-weight: bold; 
                padding: 2px 6px; 
                border-radius: 6px; 
                border: 1px solid #334155; 
                white-space: nowrap;
              ">
                ${h.name} (${h.dist})
              </div>
            </div>
          `,
          iconSize: [120, 60],
          iconAnchor: [60, 30]
        });
        L.marker([h.lat, h.lng], { icon: standby3DIcon }).addTo(map);
      });

      // 4. 3D Victim Crash Location Marker on Real Map
      const crash3DIcon = L.divIcon({
        className: 'custom-3d-crash-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 56px; 
              height: 56px; 
              border-radius: 18px; 
              background: linear-gradient(145deg, #7f1d1d, #450a0a); 
              border: 2px solid #ef4444; 
              box-shadow: 0 0 25px rgba(239, 68, 68, 0.9); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 26px;
              animation: bounce 1.2s infinite;
            ">
              🚨
            </div>
            <div style="
              position: absolute; 
              top: -6px; 
              right: 14px; 
              width: 14px; 
              height: 14px; 
              background: #ef4444; 
              border-radius: 50%; 
              animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              margin-top: 5px; 
              background: rgba(5, 10, 20, 0.95); 
              color: #f87171; 
              font-size: 10px; 
              font-weight: 900; 
              padding: 2px 8px; 
              border-radius: 6px; 
              border: 1px solid #ef4444; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.8);
              white-space: nowrap;
            ">
              🚨 VICTIM CRASH (NH-16 Gollapudi)
            </div>
          </div>
        `,
        iconSize: [160, 80],
        iconAnchor: [80, 40]
      });
      L.marker([16.5412, 80.5843], { icon: crash3DIcon, zIndexOffset: 600 }).addTo(map);

      // 5. Ultra-Realistic 3D Isometric Moving Ambulance Marker on Real Map
      const ambulance3DIcon = L.divIcon({
        className: 'custom-3d-ambulance-marker',
        html: `
          <div id="ambulance-3d-card" style="
            position: relative; 
            display: flex; 
            align-items: center; 
            background: linear-gradient(135deg, #050a14, #0f172a); 
            border: 2px solid #f59e0b; 
            border-radius: 16px; 
            padding: 6px 12px; 
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.8), 0 0 15px rgba(239, 68, 68, 0.5); 
            gap: 8px; 
            white-space: nowrap;
            transform-origin: center center;
            transition: transform 0.15s ease-out;
          ">
            <!-- 3D Ambulance Vehicle Graphic with Spinning Light -->
            <div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.9));">
              🚑
            </div>

            <div style="display: flex; flex-direction: column;">
              <div style="color: #ffffff; font-size: 11px; font-weight: 900; display: flex; items-center; gap: 4px;">
                <span>ALS 108-AP</span>
                <span style="background: #ef4444; color: #fff; font-size: 8px; padding: 1px 4px; border-radius: 4px;">SIREN ON</span>
              </div>
              <span style="color: #fbbf24; font-size: 9px; font-family: monospace; font-weight: bold;">
                85 km/h • GREEN CORRIDOR
              </span>
            </div>

            <!-- Roof Flashing Beacons -->
            <div style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px;">
              <span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; display: inline-block;"></span>
              <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 8px #3b82f6; display: inline-block;"></span>
            </div>
          </div>
        `,
        iconSize: [170, 50],
        iconAnchor: [85, 25]
      });

      const ambulanceMarker = L.marker([16.5167, 80.6500], { icon: ambulance3DIcon, zIndexOffset: 1000 }).addTo(map);
      ambulanceMarkerRef.current = ambulanceMarker;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Ambulance Position on Real Street Map
  useEffect(() => {
    if (ambulanceMarkerRef.current) {
      const { lat, lng } = getInterpolatedGPSAndAngle(ambulanceProgress);
      ambulanceMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [ambulanceProgress]);

  // Stage 1: Notify Hospitals & Acknowledge GGH Acceptance
  useEffect(() => {
    const t1 = setTimeout(() => {
      setHospitals((prev) =>
        prev.map((h) => ({
          ...h,
          status: h.isResponded ? 'ACCEPTED & DISPATCHED' : 'STANDBY BACKUP'
        }))
      );
      setRescueStage('HOSPITAL_RESPONDED');
      speakEmergencyInstruction("Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.");
    }, 2200);

    return () => clearTimeout(t1);
  }, []);

  // Stage 2 to 3: Ambulance En Route
  useEffect(() => {
    if (rescueStage === 'HOSPITAL_RESPONDED') {
      const t2 = setTimeout(() => {
        setRescueStage('AMBULANCE_EN_ROUTE_TO_VICTIM');
        speakEmergencyInstruction("Ambulance is moving towards crash location on National Highway 16.");
      }, 1800);
      return () => clearTimeout(t2);
    }
  }, [rescueStage]);

  // Ambulance Movement Simulation Loop
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
          return prev + 4; // takes ~5 seconds
        });
      }, 180);
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
            speakEmergencyInstruction("Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe.");
            return 0;
          }
          return prev - 4; // takes ~5 seconds
        });
      }, 180);
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
      
      {/* 1. Multi-Hospital Autonomous Notification & Response Radar */}
      <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Nearby Hospitals Broadcast & Response Triage</span>
                <span className="bg-red-600/20 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  4 HOSPITALS EVALUATED
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Live radar screening showing <strong className="text-emerald-400">GGH Vijayawada (Responded & Accepted)</strong> and <strong className="text-slate-300">3 Standby Trauma Centers</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>INCIDENT ID: {crashDetails?.incidentId || 'INC-849201'}</span>
          </div>
        </div>

        {/* 4 Hospital Response Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hospitals.map((hosp) => (
            <div 
              key={hosp.id}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                hosp.status.includes('ACCEPTED')
                  ? 'bg-gradient-to-b from-emerald-950/90 to-[#050A14] border-emerald-400 shadow-2xl shadow-emerald-950/80 ring-2 ring-emerald-500/50'
                  : hosp.status === 'STANDBY BACKUP'
                  ? 'bg-[#050A14] border-slate-800 opacity-80'
                  : 'bg-[#050A14] border-amber-500/40 animate-pulse'
              }`}
            >
              <div className="flex items-center justify-between">
                <Hospital className={`w-4 h-4 ${hosp.status.includes('ACCEPTED') ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono text-slate-400">{hosp.distance} • ETA: {hosp.eta}</span>
              </div>

              <div>
                <h4 className="text-xs font-black text-white line-clamp-1">{hosp.shortName}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{hosp.role}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400">ICU: <strong className="text-white">{hosp.icu} Beds</strong></span>
                <span className={`font-black ${
                  hosp.status.includes('ACCEPTED') ? 'text-emerald-400' : hosp.status === 'STANDBY BACKUP' ? 'text-slate-400' : 'text-amber-400'
                }`}>
                  {hosp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. UNIFIED REAL STREET MAP: 3D HOSPITALS + 3D MOVING AMBULANCE DIRECTLY ON REAL OPENSTREETMAP TILES */}
      <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4">
        
        {/* Map Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="text-base font-black text-white">
                Live Real-World Street Map with 3D Hospitals & 3D Moving Ambulance
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Directly on the authentic <strong className="text-white">OpenStreetMap GPS navigation layer</strong> of Vijayawada and NH-16:
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#050A14] px-4 py-2 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-md">
            <Siren className="w-4 h-4 text-red-500 animate-bounce" />
            <span className="text-xs font-mono font-bold text-white uppercase">
              {rescueStage === 'NOTIFYING_HOSPITALS' && 'MULTICASTING SOS TO ALL HOSPITALS...'}
              {rescueStage === 'HOSPITAL_RESPONDED' && 'GGH VIJAYAWADA ACCEPTED • DISPATCHING ALS-108'}
              {rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' && 'ALS AMBULANCE EN ROUTE TO VICTIM (85 km/h)'}
              {rescueStage === 'PATIENT_PICKUP' && '🩺 PARAMEDICS STABILIZING VICTIM'}
              {rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' && '🚑 RAPID RETURN TO GGH ICU BAY'}
              {rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' && '🎉 VICTIM SAFELY ADMITTED TO ICU'}
            </span>
          </div>
        </div>

        {/* Full-Width Real Leaflet Map Container */}
        <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top-Left: Live GPS Telemetry Badge */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 pointer-events-none shadow-xl space-y-0.5">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>REAL-TIME GPS MISSION ACTIVE</span>
            </div>
            <div className="text-[10px] text-slate-400">Corridor: NH-16 Gollapudi ⟷ GGH Vijayawada</div>
          </div>

          {/* Patient On-Scene Pickup Overlay Modal */}
          {rescueStage === 'PATIENT_PICKUP' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0B1220]/95 border-2 border-amber-500 rounded-3xl p-5 text-center max-w-sm shadow-2xl space-y-2 backdrop-blur-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500 mx-auto flex items-center justify-center">
                <Stethoscope className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-white">Paramedics On Scene • Patient Boarded</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paramedics applied cervical collar immobilization & boarded victim onto stretcher with active oxygen support. ALS Unit returning to GGH Trauma Bay.
              </p>
            </motion.div>
          )}

          {/* Mission Progress Indicator Bar across Bottom of Map */}
          <div className="absolute bottom-3 left-4 right-4 z-[1000] bg-[#0B1220]/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 shrink-0">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Mission Progress:</span>
              <span className="text-amber-400 font-mono text-xs">
                {rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' && '🚗 Driving to Crash Site (85 km/h)'}
                {rescueStage === 'PATIENT_PICKUP' && '🩺 On Scene (Boarding Patient)'}
                {rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL' && '🏥 Transporting to GGH Trauma Bay'}
                {rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' && '✅ Patient Admitted into ICU'}
              </span>
            </div>

            <div className="flex-1 w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 h-full transition-all duration-300"
                style={{ 
                  width: rescueStage === 'AMBULANCE_EN_ROUTE_TO_VICTIM' 
                    ? `${ambulanceProgress * 0.5}%` 
                    : rescueStage === 'PATIENT_PICKUP'
                    ? '50%'
                    : rescueStage === 'AMBULANCE_RETURNING_TO_HOSPITAL'
                    ? `${50 + ((100 - ambulanceProgress) * 0.5)}%`
                    : rescueStage === 'VICTIM_SAFE_IN_HOSPITAL'
                    ? '100%'
                    : '10%'
                }}
              />
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
              {rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' ? '100% COMPLETE' : `${Math.round(ambulanceProgress)}% PROGRESS`}
            </span>
          </div>
        </div>

      </div>

      {/* 3. VICTIM IS SAFE CELEBRATORY STATUS CARD (Rendered upon Hospital Arrival) */}
      {rescueStage === 'VICTIM_SAFE_IN_HOSPITAL' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-b from-emerald-950/90 via-[#0B1220] to-[#050A14] p-6 sm:p-7 rounded-3xl border-2 border-emerald-500 shadow-2xl shadow-emerald-950/80 space-y-5 text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950 font-black">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/60 px-3 py-1 rounded-full uppercase tracking-wider">
              RESCUE MISSION SUCCESSFUL
            </span>
            <h2 className="text-2xl font-black text-white">
              VICTIM IS SAFE & ADMITTED TO ICU TRAUMA BAY!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Patient safely transported within the critical Golden Hour to <strong className="text-white">Government General Hospital (GGH Vijayawada)</strong>. Advanced life support team and trauma surgeons have stabilized all vitals.
            </p>
          </div>

          {/* Vitals Stabilization Report */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2 max-w-2xl mx-auto">
            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                <span>Heart Rate</span>
              </div>
              <div className="text-sm font-black font-mono text-white">78 BPM <span className="text-emerald-400 text-xs font-normal">● Stable</span></div>
            </div>

            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Blood Pressure</span>
              </div>
              <div className="text-sm font-black font-mono text-white">120/80 <span className="text-emerald-400 text-xs font-normal">● Normal</span></div>
            </div>

            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Oxygen (SpO2)</span>
              </div>
              <div className="text-sm font-black font-mono text-white">98% <span className="text-emerald-400 text-xs font-normal">● Optimal</span></div>
            </div>

            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Attending Lead</span>
              </div>
              <div className="text-xs font-bold text-white truncate">Dr. K. Sharma (GGH)</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onReset}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-7 py-3 rounded-2xl text-xs transition-all shadow-xl shadow-emerald-950 cursor-pointer"
            >
              RESET TO 3D VEHICLE HIGHWAY SIMULATION
            </button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
