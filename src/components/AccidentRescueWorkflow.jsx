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

  // Helper function to generate Real 3D Small Ambulance HTML
  const create3DAmbulanceHTML = (angleDeg = 0, isReturning = false) => {
    return `
      <div id="ambulance-3d-wrapper" style="
        position: relative; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        transform: rotate(${angleDeg}deg); 
        transform-origin: center center;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <!-- Forward Headlight Cones (Beams shining onto the road) -->
        <div style="
          position: absolute; 
          top: -45px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 60px; 
          height: 50px; 
          background: radial-gradient(ellipse at bottom, rgba(254, 240, 138, 0.7) 0%, rgba(254, 240, 138, 0) 80%);
          pointer-events: none;
          filter: blur(2px);
          z-index: 1;
        "></div>

        <!-- 3D Isometric Styled Paramedic Vehicle Body -->
        <div style="
          position: relative;
          width: 52px; 
          height: 84px; 
          border-radius: 14px; 
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 40%, #e2e8f0 100%); 
          border: 2.5px solid #0f172a; 
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255,255,255,0.9); 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          overflow: hidden;
          z-index: 2;
        ">
          <!-- Front Hood & Windshield -->
          <div style="
            width: 40px; 
            height: 18px; 
            background: linear-gradient(180deg, #0284c7, #0369a1); 
            border-radius: 6px 6px 3px 3px; 
            margin-top: 4px; 
            border: 1.5px solid #075985;
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
          "></div>

          <!-- Dual Alternating Strobe Emergency Lightbar -->
          <div style="
            width: 32px; 
            height: 8px; 
            border-radius: 4px; 
            background: #0f172a; 
            display: flex; 
            justify-content: space-between; 
            padding: 1px 2px; 
            margin-top: 3px;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
          ">
            <span style="width: 12px; height: 6px; border-radius: 2px; background: #ef4444; box-shadow: 0 0 12px #ef4444; animation: ping 0.6s infinite;"></span>
            <span style="width: 12px; height: 6px; border-radius: 2px; background: #3b82f6; box-shadow: 0 0 12px #3b82f6; animation: ping 0.6s infinite 0.3s;"></span>
          </div>

          <!-- Paramedic Medical Cross Emblem & Text -->
          <div style="
            margin-top: 6px; 
            font-size: 16px; 
            line-height: 1; 
            filter: drop-shadow(0 0 4px #ef4444);
          ">
            🚑
          </div>
          <div style="
            font-size: 7px; 
            font-weight: 900; 
            color: #0f172a; 
            font-family: monospace; 
            letter-spacing: 0.5px;
            margin-top: 1px;
          ">
            ALS 108
          </div>

          <!-- High-Vis Battenburg Reflective Stripes on Rear -->
          <div style="
            position: absolute; 
            bottom: 0; 
            left: 0; 
            width: 100%; 
            height: 10px; 
            background: repeating-linear-gradient(45deg, #dc2626, #dc2626 6px, #facc15 6px, #facc15 12px);
          "></div>
        </div>

        <!-- Dynamic Floating Speed & Status Badge -->
        <div style="
          position: absolute; 
          bottom: -32px; 
          background: rgba(5, 10, 20, 0.95); 
          color: #34d399; 
          font-size: 9px; 
          font-family: monospace; 
          font-weight: 900; 
          padding: 3px 8px; 
          border-radius: 8px; 
          border: 1px solid #10b981; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.9);
          white-space: nowrap;
          transform: rotate(-${angleDeg}deg);
          pointer-events: none;
          z-index: 10;
        ">
          ${isReturning ? '🚨 RETURNING TO ICU (88 km/h)' : '🚑 EN ROUTE TO VICTIM (85 km/h)'}
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

      // Authentic Real-World Street & Satellite Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
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

      // 5. Ultra-Realistic 3D Small Animated Ambulance Marker on Real Map
      const initialCoords = gpsRouteWaypoints[0];
      const ambulance3DIcon = L.divIcon({
        className: 'custom-3d-small-ambulance-marker',
        html: create3DAmbulanceHTML(0, false),
        iconSize: [120, 120],
        iconAnchor: [60, 60]
      });

      const ambulanceMarker = L.marker(initialCoords, { icon: ambulance3DIcon, zIndexOffset: 1000 }).addTo(map);
      ambulanceMarkerRef.current = ambulanceMarker;

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

      // Update the 3D Ambulance HTML with dynamic angle rotation and state
      const updatedIcon = L.divIcon({
        className: 'custom-3d-small-ambulance-marker',
        html: create3DAmbulanceHTML(angle, isReturning),
        iconSize: [120, 120],
        iconAnchor: [60, 60]
      });
      ambulanceMarkerRef.current.setIcon(updatedIcon);
    }
  }, [ambulanceProgress, rescueStage]);

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
          return prev + 3; // takes ~6 seconds smoothly
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
          return prev - 3; // takes ~6 seconds smoothly
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
      {/* 1. Live Multi-Agency Response Status Header */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black shadow-lg">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                AUTONOMOUS MULTI-AGENCY RESCUE ACTIVE
              </span>
              <h3 className="text-lg font-black text-white">
                Live 3D Ambulance Mission & Trauma Hospital Telemetry
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>REAL-TIME SATELLITE GPS ACTIVE</span>
          </div>
        </div>

        {/* 2. REAL INTERACTIVE NAVIGATION MAP WITH MOVING 3D AMBULANCE */}
        <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Mission HUD Overlay */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 shadow-2xl space-y-1.5 pointer-events-none">
            <div className="text-white font-bold text-xs flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Rescue Stage:</span>
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

        {/* 3. Hospital Dispatch Cards Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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

        {/* 4. Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Telemetry automatically mirrored to State Highway Police Control Room (112).</span>
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
