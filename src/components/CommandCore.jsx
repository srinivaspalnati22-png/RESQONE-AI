import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { 
  ShieldAlert, Activity, Navigation, Hospital, Droplet, 
  Users, CheckCircle2, AlertTriangle, Radio, Sparkles as SparkleIcon,
  Phone, Clock, ArrowRight, Zap, Volume2, RefreshCw, Eye
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

// Resource node configurations
const RESOURCE_NODES = [
  { 
    id: 'HOSPITAL', 
    label: 'Trauma & ICU Command', 
    shortLabel: 'ICU & Trauma',
    icon: Hospital, 
    angle: 0, 
    radius: 3.0, 
    color: '#3B5BFF',
    status: '14 Beds Available • Level-1 Trauma Ready',
    detail: 'Surgeon and resuscitation bay on high-alert standby with pre-warmed fluids.'
  },
  { 
    id: 'AMBULANCE', 
    label: 'ALS Rescue 101 Unit', 
    shortLabel: 'ALS Rescue',
    icon: Navigation, 
    angle: (2 * Math.PI) / 5, 
    radius: 3.0, 
    color: '#FF3B4D',
    status: 'En Route • 74 km/h • GPS Locked',
    detail: 'Equipped with defibrillator, ventilator, intubation kit, and live telemetry uplink.'
  },
  { 
    id: 'BLOOD', 
    label: 'Universal Blood Matrix', 
    shortLabel: 'Blood Matrix',
    icon: Droplet, 
    angle: (4 * Math.PI) / 5, 
    radius: 3.0, 
    color: '#FFB020',
    status: '12 O- Universal Units Matched',
    detail: 'Hard-rule compatibility verified with cold-chain courier dispatch.'
  },
  { 
    id: 'VOLUNTEER', 
    label: 'First Responder Mesh', 
    shortLabel: 'Volunteer Mesh',
    icon: Users, 
    angle: (6 * Math.PI) / 5, 
    radius: 3.0, 
    color: '#20E3A2',
    status: '8 Responders Alerted in 1.5km',
    detail: 'BLS certified volunteers equipped with AED and bleed control kits.'
  },
  { 
    id: 'SNAKE_MEDICAL', 
    label: 'AVS Toxicology Center', 
    shortLabel: 'AVS Toxicology',
    icon: Activity, 
    angle: (8 * Math.PI) / 5, 
    radius: 3.0, 
    color: '#00D9FF',
    status: '150 Polyvalent Vials Verified',
    detail: 'Real-time species identification and antivenom dosage protocol ready.'
  }
];

// Inner 3D Neural Network Core Sphere & Gyroscope
function NeuralCore({ isScanning, severityColor, activeNodes = [] }) {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const ringXRef = useRef();
  const ringYRef = useRef();
  const ringZRef = useRef();
  const shockwaveRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isScanning ? 1.8 : 0.4);
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * (isScanning ? 1.5 : 0.3);
      wireframeRef.current.rotation.z += delta * 0.15;
    }
    if (ringXRef.current) {
      ringXRef.current.rotation.x += delta * (isScanning ? 2.5 : 0.8);
      ringXRef.current.rotation.y += delta * 0.3;
    }
    if (ringYRef.current) {
      ringYRef.current.rotation.y += delta * (isScanning ? 2.0 : 0.6);
      ringYRef.current.rotation.z += delta * 0.4;
    }
    if (ringZRef.current) {
      ringZRef.current.rotation.z += delta * (isScanning ? 3.0 : 1.0);
    }
    if (shockwaveRef.current && isScanning) {
      shockwaveRef.current.scale.x = 1 + (Math.sin(state.clock.elapsedTime * 4) * 0.3);
      shockwaveRef.current.scale.y = 1 + (Math.sin(state.clock.elapsedTime * 4) * 0.3);
    }
  });

  return (
    <group>
      {/* Translucent Neural Core Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshStandardMaterial
          color="#0B1220"
          emissive={severityColor}
          emissiveIntensity={isScanning ? 1.4 : 0.5}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Inner Lattice Core */}
      <mesh>
        <octahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial
          color={severityColor}
          wireframe
          transparent
          opacity={isScanning ? 0.9 : 0.4}
        />
      </mesh>

      {/* Outer Wireframe Neural Cage */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshBasicMaterial
          color="#00D9FF"
          wireframe
          transparent
          opacity={isScanning ? 0.7 : 0.3}
        />
      </mesh>

      {/* Triple Holographic Gyro Rings */}
      <mesh ref={ringXRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.75, 0.025, 16, 64]} />
        <meshBasicMaterial color={severityColor} transparent opacity={0.8} />
      </mesh>

      <mesh ref={ringYRef} rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[1.9, 0.02, 16, 64]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} />
      </mesh>

      <mesh ref={ringZRef} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[2.05, 0.02, 16, 64]} />
        <meshBasicMaterial color="#3B5BFF" transparent opacity={0.6} />
      </mesh>

      {/* 360° Scan Shockwave Wave */}
      {isScanning && (
        <group ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.05, 64]} />
          <meshBasicMaterial
            color="#00D9FF"
            side={THREE.DoubleSide}
            transparent
            opacity={0.75}
          />
        </group>
      )}

      {/* Synaptic Particle Cloud */}
      <Sparkles
        count={80}
        scale={4.5}
        size={3.5}
        speed={isScanning ? 2.0 : 0.6}
        color={severityColor}
      />
    </group>
  );
}

// Synaptic Laser Line Connecting Center Core to Node
function SynapticLaser({ startPos = [0, 0, 0], endPos, isActive, color }) {
  const points = useMemo(() => [
    new THREE.Vector3(...startPos),
    new THREE.Vector3(...endPos)
  ], [startPos, endPos]);

  return (
    <group>
      <Line
        points={points}
        color={isActive ? color : '#1e293b'}
        lineWidth={isActive ? 2.5 : 1}
        transparent
        opacity={isActive ? 0.75 : 0.2}
      />
    </group>
  );
}

// Orbiting Resource Node in 3D Space
function ResourceOrbiter({ node, isActive, isSelected, onSelect, severityColor }) {
  const groupRef = useRef();
  const [nodePosition, setNodePosition] = useState([0, 0, 0]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.35;
      const curAngle = node.angle + t;
      const x = Math.cos(curAngle) * node.radius;
      const z = Math.sin(curAngle) * node.radius;
      const y = Math.sin(curAngle * 2) * 0.35;
      groupRef.current.position.set(x, y, z);
      setNodePosition([x, y, z]);
    }
  });

  return (
    <>
      {/* Dynamic Synaptic Line from Center Core to Node */}
      <SynapticLaser
        endPos={nodePosition}
        isActive={isActive}
        color={node.color}
      />

      <group ref={groupRef}>
        {/* Node Central Sphere */}
        <mesh onClick={(e) => { e.stopPropagation(); onSelect(node); }}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial
            color={isActive ? node.color : '#1e293b'}
            emissive={isActive ? node.color : '#0f172a'}
            emissiveIntensity={isActive ? 1.5 : 0.2}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>

        {/* Orbiting Mini Satellite */}
        <mesh position={[0.4, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={node.color}
            emissiveIntensity={1.8}
          />
        </mesh>

        {/* Glowing Wireframe Halo when Active or Selected */}
        {(isActive || isSelected) && (
          <mesh>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshBasicMaterial
              color={node.color}
              wireframe
              transparent
              opacity={isSelected ? 0.95 : 0.6}
            />
          </mesh>
        )}

        {/* 3D Floating HTML Tag */}
        <Html distanceFactor={9} position={[0, 0.48, 0]} center>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(node); }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-xl flex items-center space-x-1.5 backdrop-blur-md border cursor-pointer ${
              isSelected
                ? 'bg-cyan-950/95 text-cyan-200 border-cyan-300 scale-110 shadow-cyan-950/90 ring-2 ring-cyan-400'
                : isActive
                ? 'bg-slate-900/90 text-white border-cyan-400/80 shadow-cyan-950/70 hover:scale-105'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 opacity-70 hover:opacity-100'
            }`}
          >
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: isActive ? node.color : '#64748b' }} 
            />
            <span>{node.shortLabel}</span>
          </button>
        </Html>
      </group>
    </>
  );
}

// Main 3D CommandCore Component
export function CommandCore({
  activeEmergency = null,
  ambulanceState = 'AVAILABLE',
  onDispatch = null
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Derive relevant active resource nodes based on emergency type
  const activeNodeIds = useMemo(() => {
    if (!activeEmergency) return ['HOSPITAL', 'AMBULANCE', 'VOLUNTEER'];
    const type = (activeEmergency.type || '').toUpperCase();
    if (type.includes('SNAKE')) return ['HOSPITAL', 'AMBULANCE', 'SNAKE_MEDICAL'];
    if (type.includes('BLOOD')) return ['HOSPITAL', 'BLOOD', 'VOLUNTEER'];
    return ['HOSPITAL', 'AMBULANCE', 'VOLUNTEER', 'BLOOD'];
  }, [activeEmergency]);

  // Severity color calculation
  const severityColor = useMemo(() => {
    const sev = (activeEmergency?.severity || 'HIGH').toUpperCase();
    if (sev === 'CRITICAL') return '#FF3B4D'; // Red
    if (sev === 'HIGH') return '#FFB020';     // Amber
    return '#00D9FF';                        // Cyan
  }, [activeEmergency]);

  // Trigger 360° scan on emergency changes
  useEffect(() => {
    if (activeEmergency) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeEmergency]);

  // Manual Trigger Radar Pulse
  const handlePulseScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  // Voice Briefing Audio Synthesizer
  const handleAudioBriefing = () => {
    const title = activeEmergency?.title || "Continuous AI Emergency Telemetry Grid";
    const reason = activeEmergency?.reason || "Neural orchestrator scanning live AP and Bengaluru trauma corridors. All resource orbits synchronized.";
    const text = `CommandCore Orchestrator Report: ${title}. ${reason}`;
    setIsSpeaking(true);
    speakEmergencyInstruction(text);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/40 shadow-2xl p-4 sm:p-6 space-y-4 overflow-hidden relative">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/40 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-950/60">
            <Radio className="w-5 h-5 animate-pulse stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <span>CommandCore 3D Neural Orchestrator</span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase font-mono font-bold">
                Real-Time 5-Orbit Telemetry
              </span>
            </h3>
            <p className="text-xs text-slate-300">Continuous AI Incident Triage, Synaptic Node Dispatch & Resource Telemetry</p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAudioBriefing}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer min-h-[38px] ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                : 'bg-[#050A14] text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
            }`}
            title="Listen to AI Telemetry Briefing"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Briefing...' : 'Audio Brief'}</span>
          </button>

          <button
            onClick={handlePulseScan}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>360° Scan</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-[#050A14] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Subtle Background Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 opacity-50"
          style={{
            background: `radial-gradient(circle at center, ${severityColor}28 0%, transparent 70%)`
          }}
        />

        <Canvas camera={{ position: [0, 2.2, 6.2], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.4} />
          <pointLight position={[-10, -10, -10]} color="#00D9FF" intensity={0.9} />

          <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.5}>
            <NeuralCore
              isScanning={isScanning}
              severityColor={severityColor}
              activeNodes={activeNodeIds}
            />

            {RESOURCE_NODES.map(node => (
              <ResourceOrbiter
                key={node.id}
                node={node}
                isActive={activeNodeIds.includes(node.id)}
                isSelected={selectedNode?.id === node.id}
                onSelect={(n) => setSelectedNode(n)}
                severityColor={severityColor}
              />
            ))}
          </Float>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={!isScanning} 
            autoRotateSpeed={0.6} 
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 3.2}
          />
        </Canvas>

        {/* Top Left Active Orbits Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center space-x-2 shadow-lg pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Synchronized Orbits: {activeNodeIds.length}/5</span>
        </div>

        {/* Top Right Severity Tier Badge */}
        <div 
          className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider shadow-lg pointer-events-none" 
          style={{ borderColor: `${severityColor}80`, color: severityColor }}
        >
          Priority Tier: {activeEmergency?.severity || 'HIGH'}
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="text-[10px] text-slate-400 bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800/80 backdrop-blur-sm">
            💡 Drag to rotate 3D view • Tap any node orbiter for live capacity telemetry
          </span>
        </div>
      </div>

      {/* Selected Node Telemetry Detail Drawer (if clicked) */}
      {selectedNode && (
        <div className="p-4 bg-[#050A14] rounded-2xl border border-cyan-400/50 shadow-xl space-y-2 relative animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <h4 className="text-xs font-black text-white">{selectedNode.label}</h4>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                TELEMETRY LIVE
              </span>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 bg-slate-800 rounded-md"
            >
              Close
            </button>
          </div>
          <p className="text-xs font-mono font-bold text-cyan-300">{selectedNode.status}</p>
          <p className="text-xs text-slate-300">{selectedNode.detail}</p>
        </div>
      )}

      {/* Mission Decision Support HUD Card */}
      <div className="bg-[#050A14]/90 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Emergency Decision Support Telemetry</span>
            </div>
            <h4 className="text-sm font-black text-white mt-1">
              {activeEmergency?.title || 'Continuous Autonomous Emergency Telemetry Grid'}
            </h4>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">Target ETA:</span>
            <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-1 rounded-lg border border-cyan-500/40">
              {activeEmergency?.eta || '3-5 MINS'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1220] p-3.5 rounded-xl border border-slate-800">
          <span className="font-bold text-slate-100">AI Priority Rationale: </span>
          {activeEmergency?.reason || "Neural orchestrator scanning live AP and Bengaluru trauma corridors. Real-time antivenom inventory, ICU beds, and ALS ambulance units ready for zero-latency dispatch."}
        </p>

        {/* 5 Orbit Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {RESOURCE_NODES.map((node) => {
            const isActive = activeNodeIds.includes(node.id);
            const Icon = node.icon;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                  <span className="text-[10px] font-bold text-white truncate">{node.shortLabel}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate">
                  {isActive ? '● SYNCHRONIZED' : 'STANDBY'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <p className="text-[10px] text-slate-400 italic">
          * Notice: Provided strictly for emergency decision support. Not a substitute for clinical diagnosis.
        </p>
      </div>

    </div>
  );
}
