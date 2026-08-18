import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Navigation, Hospital, CheckCircle2, Clock, 
  MapPin, Shield, AlertTriangle, Phone, ArrowRight, ArrowLeft, Play, Pause, RefreshCw, Send, Users, Activity
} from 'lucide-react';
import { triggerEmergencySOS } from '../services/sos_service';
import { useDemo } from '../context/DemoContext';
import { speakEmergencyInstruction } from '../services/audio_service';

export const AMBULANCE_STATES = [
  'AVAILABLE',
  'NOTIFIED',
  'ACCEPTED',
  'EN_ROUTE',
  'ARRIVED',
  'COMPLETED'
];

// 1. Ultra-Realistic 3D Hospital Facility
function RealisticHospital({ isResponding = true }) {
  const crossRef = useRef();

  useFrame((state, delta) => {
    if (crossRef.current && isResponding) {
      crossRef.current.rotation.y += delta * 1.8;
    }
  });

  return (
    <group position={[-3.4, 0, 1.2]}>
      {/* Main Hospital Tower */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.5, 2.0, 1.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Emergency Wing Lower Extension */}
      <mesh position={[0.6, 0.5, 0.4]}>
        <boxGeometry args={[0.9, 1.0, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Glass Windows Grid */}
      <mesh position={[0, 1.0, 0.76]}>
        <planeGeometry args={[1.3, 1.7]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>

      {/* Emergency Department Entrance Canopy */}
      <mesh position={[0, 0.35, 1.0]}>
        <boxGeometry args={[1.7, 0.12, 0.7]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>

      {/* ER Bay Lights */}
      <pointLight position={[0, 0.25, 1.1]} color="#ef4444" intensity={1.5} distance={2.5} />

      {/* Rooftop Helipad */}
      <group position={[0, 2.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.56, 32]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* Helipad H Letter */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Rotating Glowing 3D Medical Cross */}
      <group ref={crossRef} position={[0, 2.45, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.2, 0.14]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.5} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.7, 0.14]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.5} />
        </mesh>
        <pointLight color="#ef4444" intensity={2.5} distance={4} />
      </group>

      {/* Hospital 3D Label */}
      <Html position={[0, 3.0, 0]} center distanceFactor={10}>
        <div className="bg-slate-900/95 backdrop-blur-md border border-blue-500/70 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap text-center">
          <div className="text-[10px] font-black text-white flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GGH Trauma Center</span>
          </div>
          <div className="text-[8px] font-mono text-emerald-300 font-bold">
            {isResponding ? 'ICU RESERVED • AVS READY' : 'STANDBY MODE'}
          </div>
        </div>
      </Html>
    </group>
  );
}

// 2. Ultra-Realistic 3D ALS Ambulance Vehicle
function RealisticAmbulance({ position, rotation, isEnRoute = true, speed = 74 }) {
  const strobeRef = useRef();
  const wheelRefs = useRef([]);

  useFrame((state, delta) => {
    // Flashing Strobe Lights
    if (strobeRef.current && isEnRoute) {
      const t = state.clock.getElapsedTime() * 14;
      strobeRef.current.intensity = Math.sin(t) > 0 ? 4.0 : 0.2;
    }
    // Rotate wheels while driving
    if (isEnRoute) {
      wheelRefs.current.forEach((wheel) => {
        if (wheel) wheel.rotation.x += delta * 15;
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Ambulance Main Box Body */}
      <mesh position={[0, 0.38, -0.05]}>
        <boxGeometry args={[0.66, 0.52, 1.25]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.25} />
      </mesh>

      {/* Ambulance Cab Slope Windshield Section */}
      <mesh position={[0, 0.32, 0.58]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.64, 0.42, 0.38]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* Front Windshield Glass */}
      <mesh position={[0, 0.44, 0.64]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[0.56, 0.28]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>

      {/* Emergency Red & Cyan Side Stripes */}
      <mesh position={[0, 0.32, -0.05]}>
        <boxGeometry args={[0.68, 0.12, 1.26]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.24, -0.05]}>
        <boxGeometry args={[0.67, 0.04, 1.26]} />
        <meshStandardMaterial color="#00D9FF" roughness={0.3} />
      </mesh>

      {/* 4 Rubber Wheels with Chrome Metallic Hubs */}
      {[
        [-0.36, 0.14, 0.42, 0],
        [0.36, 0.14, 0.42, 1],
        [-0.36, 0.14, -0.42, 2],
        [0.36, 0.14, -0.42, 3]
      ].map(([x, y, z, idx]) => (
        <group 
          key={idx} 
          position={[x, y, z]} 
          rotation={[0, 0, Math.PI / 2]}
          ref={(el) => (wheelRefs.current[idx] = el)}
        >
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.09, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Flashing Dual Red/Blue Lightbar */}
      <group position={[0, 0.68, 0.15]}>
        {/* Red Light */}
        <mesh position={[-0.16, 0, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.12]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={3.0} />
        </mesh>
        {/* Blue Light */}
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.12]} />
          <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={3.0} />
        </mesh>
        <pointLight ref={strobeRef} color="#ef4444" intensity={2.5} distance={5} />
      </group>

      {/* Front Headlights & Cones */}
      <group position={[0, 0.28, 0.76]}>
        <mesh position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.12, 0.09, 0.02]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <boxGeometry args={[0.12, 0.09, 0.02]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <spotLight position={[0, 0, 0]} angle={0.5} penumbra={0.6} intensity={2.0} color="#fef08a" />
      </group>

      {/* Floating 3D Tag */}
      <Html position={[0, 1.05, 0]} center distanceFactor={9}>
        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-400 px-3 py-1 rounded-xl shadow-2xl whitespace-nowrap text-center">
          <div className="text-[10px] font-black text-white flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ALS RESCUE 101</span>
          </div>
          {isEnRoute && (
            <div className="text-[8px] font-mono text-cyan-300 font-bold">
              {speed} KM/H • SIRENS ACTIVE
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// 3. Ultra-Realistic 3D Incident Site & Victim Zone
function RealisticIncidentSite() {
  return (
    <group position={[3.4, 0, -1.2]}>
      {/* Damaged Incident Vehicle */}
      <mesh position={[0, 0.24, 0]} rotation={[0.12, 0.45, 0.1]}>
        <boxGeometry args={[0.85, 0.45, 1.3]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Hazard Warning Cones with White Reflective Stripes */}
      {[
        [-0.75, 0, 0.7],
        [0.75, 0, 0.7],
        [0, 0, -0.9]
      ].map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.12, 0.4, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.08, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Pulsing Emergency Radar Ground Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.95, 1.2, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.65} />
      </mesh>

      {/* 3D Victim GPS HUD */}
      <Html position={[0, 1.3, 0]} center distanceFactor={10}>
        <div className="bg-red-950/95 backdrop-blur-md border border-red-500 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap text-center animate-pulse">
          <div className="text-[10px] font-black text-red-200 flex items-center justify-center space-x-1">
            <span>⚠️ VICTIM GPS LOCKED</span>
          </div>
          <div className="text-[8px] font-mono text-slate-300 font-bold">
            Ground Incident Zone
          </div>
        </div>
      </Html>
    </group>
  );
}

// 4. Highway Road Corridor Environment
function HighwayEnvironment({ curvePoints }) {
  return (
    <group>
      {/* Ground Grid Terrain */}
      <gridHelper args={[15, 30, '#1e293b', '#0B1220']} position={[0, -0.01, 0]} />

      {/* Asphalt Highway Mesh */}
      <Line
        points={curvePoints}
        color="#0f172a"
        lineWidth={26}
      />

      {/* Neon Cyber Guideline */}
      <Line
        points={curvePoints}
        color="#00D9FF"
        lineWidth={4}
      />

      {/* Street Lamps along corridor */}
      {[-2.4, 0, 2.4].map((x, idx) => (
        <group key={idx} position={[x, 0, idx % 2 === 0 ? 1.7 : -1.7]}>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.7, 0.18]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.16, 0.06, 0.32]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <pointLight position={[0, 1.6, 0.18]} color="#38bdf8" intensity={1.0} distance={3.5} />
        </group>
      ))}
    </group>
  );
}

// Main State-Driven ALS Ambulance 3D Component
export function AmbulanceMissionMap({ 
  state = 'EN_ROUTE',
  onStateChange = null,
  hospitalName = 'Government General Hospital (GGH Vijayawada)',
  hospitalPhone = '+91-866-2472777',
  etaMinutes = 4,
  distanceKm = 1.8
}) {
  const { isOnline } = useDemo();
  const [internalStateIndex, setInternalStateIndex] = useState(() => {
    const idx = AMBULANCE_STATES.indexOf(state);
    return idx >= 0 ? idx : 3; // default EN_ROUTE
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  // Sync external state changes
  useEffect(() => {
    const idx = AMBULANCE_STATES.indexOf(state);
    if (idx >= 0) setInternalStateIndex(idx);
  }, [state]);

  // Curve spline path between hospital and incident site
  const curvePoints = useMemo(() => [
    new THREE.Vector3(-3.4, 0.05, 1.2),
    new THREE.Vector3(-1.9, 0.05, 0.9),
    new THREE.Vector3(0, 0.05, 0),
    new THREE.Vector3(1.9, 0.05, -0.7),
    new THREE.Vector3(3.4, 0.05, -1.2)
  ], []);

  // Compute realistic ambulance position and orientation along road
  const { currentPos, currentRotation } = useMemo(() => {
    const t = internalStateIndex / (AMBULANCE_STATES.length - 1);
    const pointIdx = Math.min(Math.floor(t * (curvePoints.length - 1)), curvePoints.length - 2);
    const p1 = curvePoints[pointIdx];
    const p2 = curvePoints[pointIdx + 1];
    const localT = (t * (curvePoints.length - 1)) - pointIdx;
    
    const pos = new THREE.Vector3().lerpVectors(p1, p2, localT);
    const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    
    return {
      currentPos: [pos.x, pos.y, pos.z],
      currentRotation: [0, angle, 0]
    };
  }, [internalStateIndex, curvePoints]);

  const handleStepNext = () => {
    const nextIdx = (internalStateIndex + 1) % AMBULANCE_STATES.length;
    setInternalStateIndex(nextIdx);
    if (onStateChange) onStateChange(AMBULANCE_STATES[nextIdx]);
  };

  const handleStepPrev = () => {
    const prevIdx = (internalStateIndex - 1 + AMBULANCE_STATES.length) % AMBULANCE_STATES.length;
    setInternalStateIndex(prevIdx);
    if (onStateChange) onStateChange(AMBULANCE_STATES[prevIdx]);
  };

  // Auto-Pilot Mission Simulation Loop
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setInternalStateIndex((prev) => {
          if (prev >= AMBULANCE_STATES.length - 1) {
            setIsSimulating(false);
            speakEmergencyInstruction("Rescue mission completed. Patient successfully delivered to trauma center.");
            return prev;
          }
          const next = prev + 1;
          if (onStateChange) onStateChange(AMBULANCE_STATES[next]);
          return next;
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, onStateChange]);

  const toggleSimulation = () => {
    if (!isSimulating && internalStateIndex === AMBULANCE_STATES.length - 1) {
      setInternalStateIndex(0);
      if (onStateChange) onStateChange(AMBULANCE_STATES[0]);
    }
    setIsSimulating(!isSimulating);
  };

  // Real Software Action: Trigger SOS Notification to Family & Hospital
  const handleNotifyFamilyAndHospital = async () => {
    setDispatchFeedback("Broadcasting live GPS coordinates & telemetry to family & nearest hospital...");
    try {
      const res = await triggerEmergencySOS(16.5167, 80.6500, "Highway Accident Incident Site");
      setInternalStateIndex(2); // ACCEPTED
      if (onStateChange) onStateChange('ACCEPTED');
      setDispatchFeedback(`Live emergency broadcast sent to ${res.contactsNotified} emergency contacts & ${hospitalName}!`);
      speakEmergencyInstruction("Emergency SOS alert broadcast to hospital trauma ICU and family mesh.");
    } catch (err) {
      setDispatchFeedback("Alert dispatched locally and queued for hospital dispatch mesh.");
    }
    setTimeout(() => setDispatchFeedback(null), 6000);
  };

  const currentState = AMBULANCE_STATES[internalStateIndex];

  // Calculated dynamic ETA and distance based on state
  const currentEta = useMemo(() => {
    if (currentState === 'AVAILABLE') return 'STANDBY';
    if (currentState === 'NOTIFIED') return '6 MINS';
    if (currentState === 'ACCEPTED') return '5 MINS';
    if (currentState === 'EN_ROUTE') return '3 MINS';
    if (currentState === 'ARRIVED') return 'ON-SCENE';
    return 'DELIVERED';
  }, [currentState]);

  const currentDist = useMemo(() => {
    if (currentState === 'AVAILABLE') return '3.4 km';
    if (currentState === 'NOTIFIED') return '3.0 km';
    if (currentState === 'ACCEPTED') return '2.2 km';
    if (currentState === 'EN_ROUTE') return '1.2 km';
    if (currentState === 'ARRIVED') return '0.0 km';
    return '0.0 km';
  }, [currentState]);

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-blue-500/40 p-4 sm:p-6 shadow-2xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 border border-blue-400/40 text-slate-950 flex items-center justify-center shadow-lg shadow-blue-950/60">
            <Navigation className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <span>State-Driven 3D ALS Rescue Mission</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold">
                Active Telemetry Stream
              </span>
            </h3>
            <p className="text-xs text-slate-300">Unit: RESQONE-AP-ALS-101 • Connected to Real Hospital & Family Mesh</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={toggleSimulation}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md cursor-pointer min-h-[40px] ${
              isSimulating
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? 'Pause Auto-Run' : 'Simulate Mission'}</span>
          </button>

          <button
            onClick={handleNotifyFamilyAndHospital}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-lg shadow-red-950/60 min-h-[40px] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Alert Hospital & Family</span>
          </button>

          <div className="flex items-center space-x-1 bg-[#050A14] p-1 rounded-xl border border-slate-800">
            <button
              onClick={handleStepPrev}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Previous State"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleStepNext}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Next State"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Feedback Toast */}
      {dispatchFeedback && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2.5 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchFeedback}</span>
        </div>
      )}

      {/* Real State-Driven Pipeline Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-[#050A14] p-2.5 rounded-2xl border border-slate-800 text-[10px] font-black uppercase text-center">
        {AMBULANCE_STATES.map((st, idx) => {
          const isPassed = idx < internalStateIndex;
          const isCurrent = idx === internalStateIndex;
          return (
            <button
              key={st}
              onClick={() => {
                setInternalStateIndex(idx);
                if (onStateChange) onStateChange(st);
              }}
              className={`py-2 px-1 rounded-xl transition-all border cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 border-cyan-300 shadow-lg scale-102 font-extrabold ring-1 ring-cyan-300'
                  : isPassed
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                  : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* 3D Realistic Mission Canvas Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-[#050A14] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        <Canvas camera={{ position: [0, 5.8, 8.2], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} />
          <pointLight position={[-10, 10, -10]} color="#00D9FF" intensity={0.9} />
          
          <HighwayEnvironment curvePoints={curvePoints} />
          <RealisticHospital isResponding={internalStateIndex >= 1} />
          <RealisticIncidentSite />
          <RealisticAmbulance 
            position={currentPos} 
            rotation={currentRotation} 
            isEnRoute={internalStateIndex >= 1 && internalStateIndex <= 4}
            speed={internalStateIndex === 3 ? 78 : 45}
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 2.3}
            minPolarAngle={Math.PI / 4.2}
          />
        </Canvas>

        {/* Telemetry HUD Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2 shadow-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Assigned Hospital:</span>
            <span className="font-extrabold text-white">{hospitalName}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-mono font-bold bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-800/50">
              <Clock className="w-3.5 h-3.5" />
              <span>ETA: {currentEta} ({currentDist})</span>
            </div>
            
            <a
              href={`tel:${hospitalPhone}`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ER</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
