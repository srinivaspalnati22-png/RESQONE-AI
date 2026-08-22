import React, { useRef, useState, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Activity, 
  Navigation, Hospital, Users, Zap, Volume2, 
  RotateCcw, Play, Pause, Compass, Gauge, Radio, 
  Car, Bike, Siren, MapPin, Clock, Phone, ArrowRight, Sparkles as SparkleIcon,
  Flame, Wrench, Shield, X, AlertTriangle
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';

// Cross-platform WebGL Error Boundary to prevent crashes on low-end devices
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn("WebGL Render fallback triggered:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function WebGLFallbackView({ simState, vehicleType, speed, gForce }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-900 to-[#030712]">
      <div className="w-20 h-20 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
        {vehicleType === 'bike' ? '🏍️' : vehicleType === 'ambulance' ? '🚑' : '🚗'}
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-black text-white">
          {simState === 'CRASHED' ? 'CRITICAL VEHICLE IMPACT DETECTED' : '2.5D Sensor Telemetry Engine'}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Sensor fusion active: {speed} km/h • {gForce}G. Ultra-low battery & high-efficiency mode.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. High-Fidelity Multi-Piece Alloy Wheel with Drilled Rotor & Caliper
// -------------------------------------------------------------
function RealisticWheel({ position, rotation = [0, 0, Math.PI / 2], radius = 0.33, width = 0.18, isRear = false }) {
  const wheelGroupRef = useRef();

  return (
    <group ref={wheelGroupRef} position={position} rotation={rotation}>
      {/* Outer Tread Rubber Tire */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 40]} />
        <meshStandardMaterial color="#0a0e17" roughness={0.94} metalness={0.06} />
      </mesh>

      {/* Sidewall Rim Chamfer */}
      <mesh position={[0, width * 0.48, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.76, 0.02, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[0, -width * 0.48, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.76, 0.02, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* 5-Twin-Spoke Forged Diamond Cut Alloy Rim */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[radius * 0.72, radius * 0.72, width * 1.02, 32]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} clearcoat={1.0} />
      </mesh>

      {/* Gloss Black Rim Barrel Inset */}
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[radius * 0.65, radius * 0.65, width * 1.01, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Center Hubcap Logo with Lug Nuts */}
      <mesh position={[0, (width / 2) + 0.014, 0]}>
        <cylinderGeometry args={[radius * 0.24, radius * 0.24, 0.018, 20]} />
        <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Drilled Slotted Ventilated Carbon-Ceramic Rotor */}
      <mesh position={[0, -(width / 2) - 0.008, 0]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.014, 28]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.98} roughness={0.18} />
      </mesh>

      {/* High-Performance Red Brembo 6-Piston Brake Caliper */}
      <mesh position={[radius * 0.42, -(width / 2) - 0.012, 0]}>
        <boxGeometry args={[0.09, 0.035, 0.16]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.8} roughness={0.15} clearcoat={1.0} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. Ultra-Realistic 3D Sports Sedan Car Model (Rich Geometry)
// -------------------------------------------------------------
function RealisticCar({ isCrashed }) {
  const groupRef = useRef();
  const wheelFL = useRef();
  const wheelFR = useRef();
  const wheelRL = useRef();
  const wheelRR = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      // Normal highway cruising motion & wheel spin
      const spinSpeed = 24;
      if (wheelFL.current) wheelFL.current.rotation.x += delta * spinSpeed;
      if (wheelFR.current) wheelFR.current.rotation.x += delta * spinSpeed;
      if (wheelRL.current) wheelRL.current.rotation.x += delta * spinSpeed;
      if (wheelRR.current) wheelRR.current.rotation.x += delta * spinSpeed;

      if (groupRef.current) {
        groupRef.current.position.y = 0.38 + Math.sin(state.clock.elapsedTime * 9) * 0.012;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.014;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.x = 0;
      }
    } else {
      // Crashed state: rollover impact tilt, crumpled front, and smoke
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.65, delta * 4);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 1.15, delta * 3);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.42, delta * 3);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.22, delta * 4);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.38, 0]}>
      
      {/* 1. Main Lower Monocoque Chassis with Automotive Deep Metallic Clearcoat */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.44, 3.16]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#b91c1c' : '#1d4ed8'} 
          metalness={0.92} 
          roughness={0.12} 
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Aerodynamic Side Skirts with Aero Winglets */}
      <mesh position={[-0.74, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 2.7]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0.74, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 2.7]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Front Carbon Fiber Splitter & Lower Air Dam */}
      <mesh position={[0, 0.07, 1.62]} castShadow>
        <boxGeometry args={[1.42, 0.05, 0.18]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Honeycomb Radiator Air Intake Grille with Chrome Trim */}
      <mesh position={[0, 0.18, 1.60]} castShadow>
        <boxGeometry args={[1.12, 0.22, 0.08]} />
        <meshStandardMaterial color="#020617" roughness={0.85} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.22, 1.62]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Sculpted Hood with Aerodynamic Power Dome & Vents */}
      <mesh position={[0, 0.44, 0.96]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[1.38, 0.11, 1.2]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#991b1b' : '#1e40af'} 
          metalness={0.92} 
          roughness={0.12} 
          clearcoat={1.0}
        />
      </mesh>
      {/* Hood Dual Heat Extraction Vents */}
      <mesh position={[-0.32, 0.52, 0.88]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.28]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
      <mesh position={[0.32, 0.52, 0.88]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.28]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* 2. Sleek Passenger Cabin & Tapered Roof Arch */}
      <mesh position={[0, 0.70, -0.14]} castShadow>
        <boxGeometry args={[1.20, 0.44, 1.68]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#991b1b' : '#1e40af'} 
          metalness={0.92} 
          roughness={0.12} 
          clearcoat={1.0}
        />
      </mesh>

      {/* Front Curved Windshield (Deep Smoked Automotive Glass) */}
      <mesh position={[0, 0.66, 0.68]} rotation={[-0.58, 0, 0]}>
        <planeGeometry args={[1.16, 0.58]} />
        <meshPhysicalMaterial 
          color="#0284c7" 
          transmission={0.65} 
          opacity={0.9} 
          transparent 
          roughness={0.03} 
          metalness={0.95} 
        />
      </mesh>

      {/* Interior Dashboard & Sport Steering Wheel Silhouette */}
      <mesh position={[0, 0.52, 0.48]}>
        <boxGeometry args={[1.05, 0.12, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.32, 0.60, 0.36]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 12, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Rear Fastback Windshield */}
      <mesh position={[0, 0.66, -0.96]} rotation={[0.56, 0, 0]}>
        <planeGeometry args={[1.14, 0.54]} />
        <meshPhysicalMaterial 
          color="#0284c7" 
          transmission={0.65} 
          opacity={0.9} 
          transparent 
          roughness={0.03} 
          metalness={0.95} 
        />
      </mesh>

      {/* Side Privacy Windows with Chrome Window Line */}
      <mesh position={[-0.61, 0.70, -0.12]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.45, 0.36]} />
        <meshPhysicalMaterial color="#0369a1" transmission={0.6} transparent opacity={0.9} roughness={0.04} />
      </mesh>
      <mesh position={[0.61, 0.70, -0.12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.45, 0.36]} />
        <meshPhysicalMaterial color="#0369a1" transmission={0.6} transparent opacity={0.9} roughness={0.04} />
      </mesh>

      {/* Aerodynamic Carbon Wing Mirrors with LED Turn Signals */}
      <mesh position={[-0.78, 0.58, 0.48]}>
        <boxGeometry args={[0.16, 0.08, 0.20]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[-0.79, 0.58, 0.48]}>
        <boxGeometry args={[0.02, 0.02, 0.16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.78, 0.58, 0.48]}>
        <boxGeometry args={[0.16, 0.08, 0.20]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0.79, 0.58, 0.48]}>
        <boxGeometry args={[0.02, 0.02, 0.16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
      </mesh>

      {/* 3. Dual Projector Crystal LED Headlights with Angular Halo DRL */}
      <mesh position={[-0.54, 0.33, 1.58]}>
        <boxGeometry args={[0.28, 0.13, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4.5} />
      </mesh>
      <mesh position={[0.54, 0.33, 1.58]}>
        <boxGeometry args={[0.28, 0.13, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4.5} />
      </mesh>

      {/* Forward Headlight Cones (Three.js SpotLights) */}
      {!isCrashed && (
        <>
          <spotLight 
            position={[-0.54, 0.38, 1.62]} 
            target-position={[-0.54, 0, 14]} 
            angle={0.42} 
            penumbra={0.5} 
            intensity={6} 
            color="#e0f2fe" 
            distance={22} 
          />
          <spotLight 
            position={[0.54, 0.38, 1.62]} 
            target-position={[0.54, 0, 14]} 
            angle={0.42} 
            penumbra={0.5} 
            intensity={6} 
            color="#e0f2fe" 
            distance={22} 
          />
        </>
      )}

      {/* 4. Rear Continuous 3D Neon LED Taillight Lightbar */}
      <mesh position={[0, 0.38, -1.60]}>
        <boxGeometry args={[1.36, 0.09, 0.06]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4.0} />
      </mesh>

      {/* Carbon Fiber Sport Wing Spoiler */}
      <mesh position={[0, 0.60, -1.52]}>
        <boxGeometry args={[1.32, 0.04, 0.24]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[-0.45, 0.48, -1.52]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} />
      </mesh>
      <mesh position={[0.45, 0.48, -1.52]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} />
      </mesh>

      {/* Rear Aggressive Diffuser with Quad Chrome Exhaust Tips */}
      <mesh position={[0, 0.14, -1.58]}>
        <boxGeometry args={[1.2, 0.12, 0.1]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      <mesh position={[-0.44, 0.13, -1.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[-0.34, 0.13, -1.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.34, 0.13, -1.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.44, 0.13, -1.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* 5. 4 High-Spec Alloy Wheels */}
      <group ref={wheelFL} position={[-0.78, 0.02, 0.98]}>
        <RealisticWheel position={[0, 0, 0]} />
      </group>
      <group ref={wheelFR} position={[0.78, 0.02, 0.98]}>
        <RealisticWheel position={[0, 0, 0]} />
      </group>
      <group ref={wheelRL} position={[-0.78, 0.02, -0.98]}>
        <RealisticWheel position={[0, 0, 0]} isRear />
      </group>
      <group ref={wheelRR} position={[0.78, 0.02, -0.98]}>
        <RealisticWheel position={[0, 0, 0]} isRear />
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 3. Ultra-Realistic 3D Sports Superbike Model
// -------------------------------------------------------------
function RealisticMotorbike({ isCrashed }) {
  const groupRef = useRef();
  const wheelF = useRef();
  const wheelR = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      const spinSpeed = 26;
      if (wheelF.current) wheelF.current.rotation.x += delta * spinSpeed;
      if (wheelR.current) wheelR.current.rotation.x += delta * spinSpeed;

      if (groupRef.current) {
        groupRef.current.position.y = 0.40 + Math.sin(state.clock.elapsedTime * 10) * 0.015;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.045; // subtle motorcycle lean
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.y = 0;
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 1.45, delta * 5); // slid on side
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.85, delta * 4);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.16, delta * 5);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.40, 0]}>
      
      {/* 1. Red Tubular Steel Trellis Frame */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.28, 0.44, 1.1]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.9} roughness={0.2} clearcoat={1.0} />
      </mesh>

      {/* 4-Cylinder Engine Block with Cooling Fins & Clutch Cover */}
      <mesh position={[0, 0.14, 0.02]} castShadow>
        <boxGeometry args={[0.36, 0.34, 0.52]} />
        <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0.20, 0.14, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Sculpted High-Rise Racing Fuel Tank with Knee Indents */}
      <mesh position={[0, 0.50, 0.24]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.38, 0.30, 0.68]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#ef4444' : '#06b6d4'} 
          metalness={0.92} 
          roughness={0.12} 
          clearcoat={1.0} 
        />
      </mesh>
      {/* Carbon Tank Pad Protector */}
      <mesh position={[0, 0.54, 0.02]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[0.14, 0.22]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Stepped Alcantara Leather Rider & Pillion Seat */}
      <mesh position={[0, 0.44, -0.32]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.26, 0.12, 0.62]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      {/* Aerodynamic Tail Cowl with Integrated LED Stop Light */}
      <mesh position={[0, 0.46, -0.70]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.35]} />
        <meshPhysicalMaterial color={isCrashed ? '#ef4444' : '#0891b2'} metalness={0.9} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 0.47, -0.88]}>
        <boxGeometry args={[0.16, 0.04, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
      </mesh>

      {/* Front Aerodynamic Fairing & Smoked Windshield */}
      <mesh position={[0, 0.60, 0.74]} rotation={[-0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.40, 0.36, 0.48]} />
        <meshPhysicalMaterial color={isCrashed ? '#ef4444' : '#0891b2'} metalness={0.9} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 0.74, 0.76]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[0.30, 0.28]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.7} transparent opacity={0.85} />
      </mesh>

      {/* Clip-on Handlebars with Levers and TFT Digital Dash */}
      <mesh position={[0, 0.64, 0.52]}>
        <boxGeometry args={[0.54, 0.03, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.66, 0.54]} rotation={[-0.6, 0, 0]}>
        <planeGeometry args={[0.14, 0.08]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2} />
      </mesh>

      {/* Dual Twin Projector Headlights */}
      <mesh position={[-0.11, 0.50, 0.96]}>
        <boxGeometry args={[0.11, 0.09, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 5} />
      </mesh>
      <mesh position={[0.11, 0.50, 0.96]}>
        <boxGeometry args={[0.11, 0.09, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 5} />
      </mesh>
      {!isCrashed && (
        <spotLight 
          position={[0, 0.52, 0.98]} 
          target-position={[0, 0, 12]} 
          angle={0.4} 
          penumbra={0.6} 
          intensity={5.5} 
          color="#e0f2fe" 
          distance={18} 
        />
      )}

      {/* Gold Anodized Inverted Telescopic Front Suspension Forks */}
      <mesh position={[-0.13, 0.24, 0.84]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.68, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.13, 0.24, 0.84]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.68, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Titanium Upswept Exhaust with Blue Heat Gradient Tip */}
      <mesh position={[0.25, 0.24, -0.40]} rotation={[0.42, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.62, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0.26, 0.42, -0.66]} rotation={[0.42, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.045, 0.12, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Wheels */}
      <group ref={wheelF} position={[0, 0.02, 1.08]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.13} />
      </group>
      <group ref={wheelR} position={[0, 0.02, -0.92]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.19} isRear />
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 4. Ultra-Realistic 3D ALS Paramedic Ambulance Van Model
// -------------------------------------------------------------
function RealisticAmbulance({ isCrashed }) {
  const groupRef = useRef();
  const wheelFL = useRef();
  const wheelFR = useRef();
  const wheelRL = useRef();
  const wheelRR = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      const spinSpeed = 22;
      if (wheelFL.current) wheelFL.current.rotation.x += delta * spinSpeed;
      if (wheelFR.current) wheelFR.current.rotation.x += delta * spinSpeed;
      if (wheelRL.current) wheelRL.current.rotation.x += delta * spinSpeed;
      if (wheelRR.current) wheelRR.current.rotation.x += delta * spinSpeed;

      if (groupRef.current) {
        groupRef.current.position.y = 0.42 + Math.sin(state.clock.elapsedTime * 8) * 0.012;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.01;
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.y = 0;
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.58, delta * 4);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.95, delta * 3);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.28, delta * 4);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.42, 0]}>
      
      {/* 1. Main Paramedic Medical Box Van Chassis */}
      <mesh position={[0, 0.70, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.54, 1.08, 2.98]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.25} roughness={0.15} clearcoat={0.95} />
      </mesh>

      {/* Front Driver Cab Section */}
      <mesh position={[0, 0.44, 1.22]} castShadow>
        <boxGeometry args={[1.50, 0.70, 1.18]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.25} roughness={0.15} clearcoat={0.95} />
      </mesh>

      {/* Front Large Windshield */}
      <mesh position={[0, 0.70, 1.50]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[1.34, 0.56]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.65} transparent opacity={0.85} />
      </mesh>

      {/* High-Vis Fluorescent Red & Yellow Battenburg Emergency Chevrons */}
      <mesh position={[0, 0.56, -0.2]}>
        <boxGeometry args={[1.56, 0.34, 2.88]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, -0.2]}>
        <boxGeometry args={[1.56, 0.14, 2.88]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>

      {/* Emergency Roof Strobe Light Bar (Alternating Red/Blue Flasher) */}
      <group position={[0, 1.30, 0.42]}>
        <mesh position={[-0.38, 0, 0]}>
          <boxGeometry args={[0.48, 0.15, 0.26]} />
          <meshStandardMaterial emissive="#ef4444" emissiveIntensity={isCrashed ? 1 : 7} color="#ef4444" />
        </mesh>
        <mesh position={[0.38, 0, 0]}>
          <boxGeometry args={[0.48, 0.15, 0.26]} />
          <meshStandardMaterial emissive="#3b82f6" emissiveIntensity={isCrashed ? 1 : 7} color="#3b82f6" />
        </mesh>
      </group>
      <pointLight position={[0, 1.42, 0.42]} color="#ef4444" intensity={isCrashed ? 1.5 : 7} distance={14} />

      {/* Front LED Headlights */}
      <mesh position={[-0.56, 0.35, 1.80]}>
        <boxGeometry args={[0.26, 0.16, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4} />
      </mesh>
      <mesh position={[0.56, 0.35, 1.80]}>
        <boxGeometry args={[0.26, 0.16, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4} />
      </mesh>
      {!isCrashed && (
        <spotLight position={[0, 0.42, 1.82]} target-position={[0, 0, 10]} angle={0.5} penumbra={0.6} intensity={5} color="#e0f2fe" distance={20} />
      )}

      {/* Rear Double Doors & Ambulance Red Cross Emblem */}
      <mesh position={[0, 0.74, -1.72]}>
        <boxGeometry args={[0.44, 0.44, 0.02]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.74, -1.73]}>
        <boxGeometry args={[0.15, 0.36, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.74, -1.73]}>
        <boxGeometry args={[0.36, 0.15, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 4 Heavy-Duty Wheels */}
      <group ref={wheelFL} position={[-0.80, 0.02, 1.08]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.19} />
      </group>
      <group ref={wheelFR} position={[0.80, 0.02, 1.08]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.19} />
      </group>
      <group ref={wheelRL} position={[-0.80, 0.02, -0.92]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.24} isRear />
      </group>
      <group ref={wheelRR} position={[0.80, 0.02, -0.92]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.24} isRear />
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 5. Realistic 3D Moving Highway with Specular Asphalt & Lighting
// -------------------------------------------------------------
function RealisticHighwayEnvironment({ isCrashed }) {
  const roadStripesRef = useRef();
  const sceneryRef = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      const roadSpeed = 18;
      if (roadStripesRef.current) {
        roadStripesRef.current.position.z += delta * roadSpeed;
        if (roadStripesRef.current.position.z > 6) {
          roadStripesRef.current.position.z = 0;
        }
      }
      if (sceneryRef.current) {
        sceneryRef.current.position.z += delta * roadSpeed;
        if (sceneryRef.current.position.z > 20) {
          sceneryRef.current.position.z = 0;
        }
      }
    }
  });

  return (
    <group>
      {/* High-Spec Asphalt Highway Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 60]} />
        <meshStandardMaterial color="#080e1b" roughness={0.55} metalness={0.25} />
      </mesh>

      {/* Shoulder Solid White Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.2, 0.01, 0]}>
        <planeGeometry args={[0.3, 60]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.2, 0.01, 0]}>
        <planeGeometry args={[0.3, 60]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Moving Yellow Center Dash Stripes */}
      <group ref={roadStripesRef}>
        {[-24, -18, -12, -6, 0, 6, 12, 18, 24].map((zPos, idx) => (
          <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, zPos]}>
            <planeGeometry args={[0.26, 3.2]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
      </group>

      {/* Highway Guardrails */}
      <mesh position={[-4.8, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.5, 60]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[4.8, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.5, 60]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Distant Moving Highway Streetlight Poles */}
      <group ref={sceneryRef}>
        {[-30, -15, 0, 15, 30].map((zPos, idx) => (
          <group key={idx} position={[5.4, 0, zPos]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 5, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
            <mesh position={[-0.8, 4.9, 0]} rotation={[0, 0, Math.PI / 3]}>
              <cylinderGeometry args={[0.06, 0.06, 1.8, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
            <mesh position={[-1.4, 4.4, 0]}>
              <boxGeometry args={[0.4, 0.1, 0.2]} />
              <meshStandardMaterial emissive="#fef08a" emissiveIntensity={2} color="#fef08a" />
            </mesh>
            <pointLight position={[-1.4, 4.2, 0]} color="#fef08a" intensity={1.5} distance={10} />
          </group>
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 6. Realistic 3D Crash Particles (Sparks & Smoke Geometry)
// -------------------------------------------------------------
function CrashFXParticles() {
  const sparksRef = useRef();

  useFrame((state, delta) => {
    if (sparksRef.current) {
      sparksRef.current.rotation.y += delta * 1.5;
      sparksRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
    }
  });

  return (
    <group ref={sparksRef} position={[0, 0.5, 0]}>
      <Sparkles 
        count={80} 
        scale={3.5} 
        size={4.5} 
        speed={2.2} 
        color="#ef4444" 
      />
      <Sparkles 
        count={50} 
        scale={2.8} 
        size={3.2} 
        speed={3.5} 
        color="#facc15" 
      />
      <pointLight position={[0, 0.6, 0]} color="#ef4444" intensity={8} distance={6} />
    </group>
  );
}

// -------------------------------------------------------------
// MAIN VEHICLE 3D SIMULATION CONTAINER WITH 25-SECOND BIG SCREEN COUNTDOWN
// -------------------------------------------------------------
export function Vehicle3DSimulation({ onAccidentConfirmed, externalReset }) {
  const { language } = useLanguage();
  const { queueOfflineReport } = useDemo();

  const [vehicleType, setVehicleType] = useState('car'); // 'car' | 'bike' | 'ambulance'
  const [simState, setSimState] = useState('IDLE'); // 'IDLE' | 'CRUISING' | 'CRASHED' | 'COUNTDOWN'
  const [speed, setSpeed] = useState(78);
  const [gForce, setGForce] = useState(0.98);
  const [countdown, setCountdown] = useState(25);
  const [alertDispatched, setAlertDispatched] = useState(false);

  // Crash Trigger Function
  const handleTriggerCrash = () => {
    setSimState('CRASHED');
    setSpeed(0);
    setGForce(4.85); // Critical G-Force Spike
    setCountdown(25);
    speakEmergencyInstruction("Critical impact detected! 4.85G collision spike. Initiating emergency 25 seconds rescue countdown.");
  };

  // Reset Simulation
  const handleReset = () => {
    setSimState('CRUISING');
    setSpeed(78);
    setGForce(0.98);
    setCountdown(25);
    setAlertDispatched(false);
    if (externalReset) externalReset();
  };

  // Auto-Start Cruising on Mount
  useEffect(() => {
    setSimState('CRUISING');
  }, []);

  // 25-Second Autonomous Countdown Loop with Audio Announcements
  useEffect(() => {
    let timer = null;
    if (simState === 'CRASHED' && countdown > 0 && !alertDispatched) {
      // Periodic vocal countdown announcements
      if (countdown === 20) speakEmergencyInstruction("20 seconds to autonomous rescue dispatch.");
      if (countdown === 10) speakEmergencyInstruction("10 seconds remaining. Trauma units standing by.");
      if (countdown === 5) speakEmergencyInstruction("5, 4, 3, 2, 1. Dispatching SOS.");

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleConfirmEmergency();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [simState, countdown, alertDispatched]);

  const handleConfirmEmergency = () => {
    setAlertDispatched(true);
    speakEmergencyInstruction("Emergency SOS confirmed and dispatched to nearest trauma hospital and 108 ambulance units.");

    const payload = {
      id: `crash-${Date.now().toString().slice(-4)}`,
      type: 'VEHICULAR_COLLISION_CRITICAL',
      vehicle_type: vehicleType,
      gForce: 4.85,
      impactSpeed: 78,
      location: 'National Highway 16, Gollapudi Corridor',
      coordinates: [16.5412, 80.5843],
      timestamp: new Date().toISOString()
    };

    queueOfflineReport(payload);
    if (onAccidentConfirmed) onAccidentConfirmed(payload);
  };

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6 relative">
      
      {/* 1. Header Bar: Vehicle Picker & Telemetry HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        
        {/* Vehicle Selection Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#050A14] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setVehicleType('car')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              vehicleType === 'car' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Sports Sedan</span>
          </button>

          <button
            onClick={() => setVehicleType('bike')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              vehicleType === 'bike' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Superbike</span>
          </button>

          <button
            onClick={() => setVehicleType('ambulance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              vehicleType === 'ambulance' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>ALS Ambulance</span>
          </button>
        </div>

        {/* Live Sensor Telemetry Badges */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#050A14] px-3.5 py-2 rounded-2xl border border-slate-800 flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white">
              {speed} <span className="text-[10px] text-slate-400">km/h</span>
            </span>
          </div>

          <div className={`px-3.5 py-2 rounded-2xl border flex items-center space-x-2 ${
            gForce > 3.0 
              ? 'bg-red-950/80 border-red-500/80 text-red-400 animate-pulse' 
              : 'bg-[#050A14] border-slate-800 text-emerald-400'
          }`}>
            <Activity className="w-4 h-4" />
            <span className="text-xs font-mono font-bold">
              {gForce} <span className="text-[10px]">G</span>
            </span>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 bg-[#050A14] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Three.js 3D Viewport with Realistic Camera & Lighting */}
      <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 bg-[#030712] shadow-inner">
        
        <WebGLErrorBoundary fallback={<WebGLFallbackView simState={simState} vehicleType={vehicleType} speed={speed} gForce={gForce} />}>
          <Canvas
            shadows
            camera={{ position: [0, 2.2, 5.2], fov: 46 }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Realistic Environment Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight 
              position={[8, 14, 6]} 
              intensity={2.2} 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
              shadow-camera-near={0.5} 
              shadow-camera-far={30} 
              shadow-camera-left={-8} 
              shadow-camera-right={8} 
              shadow-camera-top={8} 
              shadow-camera-bottom={-8} 
            />
            <pointLight position={[-6, 4, -4]} intensity={1.2} color="#38bdf8" />
            <pointLight position={[6, 4, 4]} intensity={1.2} color="#f59e0b" />

            {/* 3D Highway Road Surface & Scenery */}
            <RealisticHighwayEnvironment isCrashed={simState === 'CRASHED'} />

            {/* Realistic Vehicle Mesh */}
            <Float 
              speed={simState === 'CRASHED' ? 0 : 2} 
              rotationIntensity={simState === 'CRASHED' ? 0 : 0.05} 
              floatIntensity={simState === 'CRASHED' ? 0 : 0.08}
            >
              {vehicleType === 'car' && <RealisticCar isCrashed={simState === 'CRASHED'} />}
              {vehicleType === 'bike' && <RealisticMotorbike isCrashed={simState === 'CRASHED'} />}
              {vehicleType === 'ambulance' && <RealisticAmbulance isCrashed={simState === 'CRASHED'} />}
            </Float>

            {/* Crash FX Sparks & Smoke */}
            {simState === 'CRASHED' && <CrashFXParticles />}

            {/* Ground Contact Soft Shadows */}
            <ContactShadows 
              position={[0, 0, 0]} 
              opacity={0.75} 
              scale={12} 
              blur={1.8} 
              far={4} 
            />

            {/* Orbit Controls (Interactive 360 degree drag & inspect) */}
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.05} 
              minPolarAngle={Math.PI / 6} 
            />
          </Canvas>
        </WebGLErrorBoundary>

        {/* Status Overlay HUD Badge */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-2 shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${
            simState === 'CRASHED' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
          }`} />
          <span>
            {simState === 'CRASHED' ? 'CRASH SIMULATOR: 4.85G IMPACT' : 'PHYSICS SIMULATOR: REAL HIGHWAY'}
          </span>
        </div>

        {/* Simulated Trigger Crash Action Button */}
        {simState !== 'CRASHED' && (
          <button
            onClick={handleTriggerCrash}
            className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-2xl shadow-red-950 flex items-center space-x-2.5 transition-all cursor-pointer hover:scale-105"
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span className="text-sm">TRIGGER 3D CRASH (4.85G)</span>
          </button>
        )}
      </div>

      {/* 3. FULL BIG SCREEN 25-SECOND EMERGENCY COUNTDOWN MODAL OVERLAY */}
      {simState === 'CRASHED' && !alertDispatched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
          
          {/* Background Ambient Red Strobe Glow */}
          <div className="absolute inset-0 bg-radial from-red-600/30 via-transparent to-transparent pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.5)] text-center space-y-6 overflow-hidden">
            
            {/* Top Critical Header */}
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-black uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span>CRITICAL 4.85G SENSOR IMPACT DETECTED</span>
              </div>

              <span className="bg-red-500/20 text-red-300 font-mono text-[11px] font-black px-3 py-1 rounded-full border border-red-500/50">
                LIFE-CRITICAL SOS
              </span>
            </div>

            {/* BIG SCREEN 25s RADIAL COUNTDOWN DISPLAY */}
            <div className="space-y-3">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
                
                {/* Outer SVG Radial Progress Arc */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-slate-800 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-red-500 fill-none transition-all duration-1000 ease-linear"
                    strokeWidth="10"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * (countdown / 25))}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Massive Countdown Digits */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-mono font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                    {countdown}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-red-400 uppercase tracking-widest mt-1">
                    SECONDS REMAINING
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ARE YOU INJURED OR NEED RESCUE?
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Autonomous satellite telemetry is preparing to alert <strong className="text-white">Government General Hospital (GGH Vijayawada)</strong>, <strong className="text-white">AIIMS Trauma</strong>, and <strong className="text-white">108 ALS Ambulance</strong> dispatch.
                </p>
              </div>
            </div>

            {/* Live Sensor Breakdown Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 text-left font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Impact G-Force</span>
                <div className="text-sm font-black text-red-400">4.85 G SPIKE</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Speed Drop</span>
                <div className="text-sm font-black text-amber-400">78 → 0 km/h</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Rollover Angle</span>
                <div className="text-sm font-black text-red-400">68.4° TILT</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">GPS Location</span>
                <div className="text-sm font-black text-cyan-400">NH-16 Corridor</div>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleConfirmEmergency}
                className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black py-4 px-6 rounded-2xl text-sm shadow-[0_0_30px_rgba(239,68,68,0.7)] flex items-center justify-center space-x-2.5 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Siren className="w-5 h-5 animate-bounce" />
                <span>DISPATCH EMERGENCY RESCUE NOW</span>
              </button>

              <button
                onClick={handleReset}
                className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl text-sm font-bold transition-all cursor-pointer"
              >
                I AM SAFE (CANCEL SOS)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
