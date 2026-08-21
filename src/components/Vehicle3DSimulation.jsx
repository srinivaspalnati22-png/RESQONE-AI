import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Activity, 
  Navigation, Hospital, Users, Zap, Volume2, 
  RotateCcw, Play, Pause, Compass, Gauge, Radio, 
  Car, Bike, Siren, MapPin, Clock, Phone, ArrowRight, Sparkles as SparkleIcon
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';

// -------------------------------------------------------------
// 1. Photorealistic Multi-Layered Alloy Wheel with Brembo Caliper
// -------------------------------------------------------------
function RealisticWheel({ position, rotation = [0, 0, Math.PI / 2], radius = 0.32, width = 0.18, isRear = false }) {
  const wheelGroupRef = useRef();

  return (
    <group ref={wheelGroupRef} position={position} rotation={rotation}>
      {/* Outer Black Rubber Tire with Detailed Sidewall */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 36]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Silver / Diamond-Cut Chrome 5-Twin-Spoke Alloy Rim */}
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[radius * 0.74, radius * 0.74, width * 1.02, 28]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Dark Rim Barrel Inset */}
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[radius * 0.68, radius * 0.68, width * 1.01, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Center Hubcap Badge with Lug Nuts */}
      <mesh position={[0, (width / 2) + 0.012, 0]}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, 0.02, 18]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ventilated Drilled Disc Brake Rotor (Behind Rim) */}
      <mesh position={[0, -(width / 2) - 0.006, 0]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.015, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.98} roughness={0.2} />
      </mesh>

      {/* Red High-Performance Brembo Brake Caliper */}
      <mesh position={[radius * 0.42, -(width / 2) - 0.01, 0]}>
        <boxGeometry args={[0.08, 0.03, 0.14]} />
        <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. Ultra-Realistic 3D Sports Sedan Car Model
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
      // Crashed state: severe rollover tilt, spin, and ground impact
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.65, delta * 4);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 1.15, delta * 3);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.42, delta * 3);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.24, delta * 4);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.38, 0]}>
      
      {/* 1. Main Aerodynamic Lower Body Chassis with Automotive Clearcoat */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.42, 0.46, 3.1]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#dc2626' : '#2563eb'} 
          metalness={0.92} 
          roughness={0.14} 
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* Front Aggressive Splitter & Lower Air Dam */}
      <mesh position={[0, 0.08, 1.58]} castShadow>
        <boxGeometry args={[1.38, 0.06, 0.18]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Honeycomb Radiator Air Intake Grille */}
      <mesh position={[0, 0.18, 1.56]} castShadow>
        <boxGeometry args={[1.1, 0.22, 0.08]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Sculpted Aerodynamic Front Hood */}
      <mesh position={[0, 0.42, 0.98]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.36, 0.12, 1.15]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#b91c1c' : '#1d4ed8'} 
          metalness={0.92} 
          roughness={0.14} 
          clearcoat={1.0}
        />
      </mesh>

      {/* 2. Sleek Passenger Cabin & Fastback Roofline */}
      <mesh position={[0, 0.68, -0.12]} castShadow>
        <boxGeometry args={[1.18, 0.44, 1.62]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#b91c1c' : '#1d4ed8'} 
          metalness={0.92} 
          roughness={0.14} 
          clearcoat={1.0}
        />
      </mesh>

      {/* Front Windshield (Deep Tinted Automotive Glass) */}
      <mesh position={[0, 0.64, 0.66]} rotation={[-0.56, 0, 0]}>
        <planeGeometry args={[1.14, 0.56]} />
        <meshPhysicalMaterial 
          color="#0369a1" 
          transmission={0.65} 
          opacity={0.88} 
          transparent 
          roughness={0.04} 
          metalness={0.95} 
        />
      </mesh>

      {/* Rear Fastback Windshield */}
      <mesh position={[0, 0.64, -0.92]} rotation={[0.54, 0, 0]}>
        <planeGeometry args={[1.12, 0.52]} />
        <meshPhysicalMaterial 
          color="#0369a1" 
          transmission={0.65} 
          opacity={0.88} 
          transparent 
          roughness={0.04} 
          metalness={0.95} 
        />
      </mesh>

      {/* Side Windows with Tint */}
      <mesh position={[-0.60, 0.68, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 0.36]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.6} transparent opacity={0.88} roughness={0.05} />
      </mesh>
      <mesh position={[0.60, 0.68, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 0.36]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.6} transparent opacity={0.88} roughness={0.05} />
      </mesh>

      {/* Aerodynamic Wing Mirrors */}
      <mesh position={[-0.76, 0.56, 0.46]}>
        <boxGeometry args={[0.16, 0.08, 0.18]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0.76, 0.56, 0.46]}>
        <boxGeometry args={[0.16, 0.08, 0.18]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* 3. Projector Lens LED Headlights with Halo DRL Rings */}
      <mesh position={[-0.52, 0.32, 1.54]}>
        <boxGeometry args={[0.28, 0.14, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4.5} />
      </mesh>
      <mesh position={[0.52, 0.32, 1.54]}>
        <boxGeometry args={[0.28, 0.14, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4.5} />
      </mesh>

      {/* Forward Headlight Cones (Three.js SpotLights) */}
      {!isCrashed && (
        <>
          <spotLight 
            position={[-0.5, 0.38, 1.6]} 
            target-position={[-0.5, 0, 12]} 
            angle={0.42} 
            penumbra={0.5} 
            intensity={6} 
            color="#e0f2fe" 
            distance={20} 
          />
          <spotLight 
            position={[0.5, 0.38, 1.6]} 
            target-position={[0.5, 0, 12]} 
            angle={0.42} 
            penumbra={0.5} 
            intensity={6} 
            color="#e0f2fe" 
            distance={20} 
          />
        </>
      )}

      {/* 4. Rear Full-Width Continuous LED Taillight Lightbar */}
      <mesh position={[0, 0.36, -1.56]}>
        <boxGeometry args={[1.34, 0.1, 0.06]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
      </mesh>

      {/* Rear Sport Carbon Spoiler Wing */}
      <mesh position={[0, 0.58, -1.48]}>
        <boxGeometry args={[1.28, 0.04, 0.22]} />
        <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Rear Quad Chrome Exhaust Tips */}
      <mesh position={[-0.42, 0.12, -1.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[-0.32, 0.12, -1.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.32, 0.12, -1.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.42, 0.12, -1.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* 5. 4 Ultra-Realistic Alloy Wheels */}
      <group ref={wheelFL} position={[-0.76, 0.02, 0.95]}>
        <RealisticWheel position={[0, 0, 0]} />
      </group>
      <group ref={wheelFR} position={[0.76, 0.02, 0.95]}>
        <RealisticWheel position={[0, 0, 0]} />
      </group>
      <group ref={wheelRL} position={[-0.76, 0.02, -0.95]}>
        <RealisticWheel position={[0, 0, 0]} isRear />
      </group>
      <group ref={wheelRR} position={[0.76, 0.02, -0.95]}>
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
      
      {/* 1. Red Exposed Racing Trellis Frame */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.28, 0.44, 1.1]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.9} roughness={0.2} clearcoat={1.0} />
      </mesh>

      {/* Metallic V-Twin Engine Block & Cooling Fins */}
      <mesh position={[0, 0.12, 0.02]} castShadow>
        <boxGeometry args={[0.34, 0.32, 0.48]} />
        <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* 2. Sculpted Fuel Tank (Cyan/Teal Racing Livery) */}
      <mesh position={[0, 0.48, 0.24]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.36, 0.28, 0.65]} />
        <meshPhysicalMaterial 
          color={isCrashed ? '#ef4444' : '#06b6d4'} 
          metalness={0.92} 
          roughness={0.12} 
          clearcoat={1.0} 
        />
      </mesh>

      {/* Stepped Rider & Pillion Seat */}
      <mesh position={[0, 0.44, -0.32]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.26, 0.12, 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Front Aerodynamic Fairing & Smoked Windshield */}
      <mesh position={[0, 0.58, 0.72]} rotation={[-0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.38, 0.34, 0.45]} />
        <meshPhysicalMaterial color={isCrashed ? '#ef4444' : '#0891b2'} metalness={0.9} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 0.72, 0.74]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[0.28, 0.26]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.7} transparent opacity={0.85} />
      </mesh>

      {/* Dual Twin Projector Headlights */}
      <mesh position={[-0.1, 0.48, 0.94]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 5} />
      </mesh>
      <mesh position={[0.1, 0.48, 0.94]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 5} />
      </mesh>
      {!isCrashed && (
        <spotLight 
          position={[0, 0.5, 0.95]} 
          target-position={[0, 0, 10]} 
          angle={0.4} 
          penumbra={0.6} 
          intensity={5.5} 
          color="#e0f2fe" 
          distance={16} 
        />
      )}

      {/* Gold Inverted Telescopic Front Suspension Forks */}
      <mesh position={[-0.12, 0.22, 0.82]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.65, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.12, 0.22, 0.82]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.65, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Swept-up Titanium Exhaust Pipe */}
      <mesh position={[0.24, 0.22, -0.38]} rotation={[0.42, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.6, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Wheels */}
      <group ref={wheelF} position={[0, 0.02, 1.05]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.12} />
      </group>
      <group ref={wheelR} position={[0, 0.02, -0.9]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.18} isRear />
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
      <mesh position={[0, 0.68, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 1.05, 2.95]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.3} roughness={0.2} clearcoat={0.9} />
      </mesh>

      {/* Front Driver Cab Section */}
      <mesh position={[0, 0.42, 1.2]} castShadow>
        <boxGeometry args={[1.48, 0.68, 1.15]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.3} roughness={0.2} clearcoat={0.9} />
      </mesh>

      {/* Front Large Windshield */}
      <mesh position={[0, 0.68, 1.48]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[1.32, 0.55]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.65} transparent opacity={0.85} />
      </mesh>

      {/* High-Vis Red & Yellow Battenburg Reflective Side Decals */}
      <mesh position={[0, 0.55, -0.2]}>
        <boxGeometry args={[1.54, 0.32, 2.85]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, -0.2]}>
        <boxGeometry args={[1.54, 0.12, 2.85]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>

      {/* Emergency Roof Strobe Light Bar (Alternating Red/Blue Flasher) */}
      <group position={[0, 1.28, 0.4]}>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.45, 0.14, 0.25]} />
          <meshStandardMaterial emissive="#ef4444" emissiveIntensity={isCrashed ? 1 : 6} color="#ef4444" />
        </mesh>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.45, 0.14, 0.25]} />
          <meshStandardMaterial emissive="#3b82f6" emissiveIntensity={isCrashed ? 1 : 6} color="#3b82f6" />
        </mesh>
      </group>
      <pointLight position={[0, 1.4, 0.4]} color="#ef4444" intensity={isCrashed ? 1.5 : 6} distance={12} />

      {/* Front Headlights */}
      <mesh position={[-0.54, 0.34, 1.78]}>
        <boxGeometry args={[0.26, 0.16, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4} />
      </mesh>
      <mesh position={[0.54, 0.34, 1.78]}>
        <boxGeometry args={[0.26, 0.16, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#bae6fd" emissiveIntensity={isCrashed ? 0.3 : 4} />
      </mesh>
      {!isCrashed && (
        <spotLight position={[0, 0.4, 1.8]} target-position={[0, 0, 10]} angle={0.5} penumbra={0.6} intensity={5} color="#e0f2fe" distance={18} />
      )}

      {/* Rear Double Doors & Ambulance Red Cross Emblem */}
      <mesh position={[0, 0.72, -1.7]}>
        <boxGeometry args={[0.42, 0.42, 0.02]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.72, -1.71]}>
        <boxGeometry args={[0.14, 0.34, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.72, -1.71]}>
        <boxGeometry args={[0.34, 0.14, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 4 Heavy-Duty Wheels */}
      <group ref={wheelFL} position={[-0.78, 0.02, 1.05]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.19} />
      </group>
      <group ref={wheelFR} position={[0.78, 0.02, 1.05]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.19} />
      </group>
      <group ref={wheelRL} position={[-0.78, 0.02, -0.9]}>
        <RealisticWheel position={[0, 0, 0]} radius={0.34} width={0.24} isRear />
      </group>
      <group ref={wheelRR} position={[0.78, 0.02, -0.9]}>
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

      {/* Double Steel Guardrails */}
      <mesh position={[-4.6, 0.45, 0]}>
        <boxGeometry args={[0.18, 0.45, 60]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[4.6, 0.45, 0]}>
        <boxGeometry args={[0.18, 0.45, 60]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Moving Overhead Streetlights & Roadside Milestone Posts */}
      <group ref={sceneryRef}>
        {[-30, -10, 10, 30].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Streetlight Post */}
            <mesh position={[-5.6, 2.2, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 4.4, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh position={[-4.6, 4.3, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh position={[-3.8, 4.2, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial emissive="#fed7aa" emissiveIntensity={3.5} color="#ffedd5" />
            </mesh>
            <pointLight position={[-3.8, 3.8, 0]} color="#fed7aa" intensity={2.2} distance={16} />

            {/* Milestone Post */}
            <mesh position={[5.4, 0.6, 0]}>
              <boxGeometry args={[0.3, 1.2, 0.3]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[5.4, 1.0, 0]}>
              <boxGeometry args={[0.32, 0.35, 0.32]} />
              <meshStandardMaterial color="#22c55e" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Skid Marks on Road when Crashed */}
      {isCrashed && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0.25, 0]} position={[-0.3, 0, 0.4]}>
            <planeGeometry args={[0.28, 4.5]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0.25, 0]} position={[0.4, 0, 0.2]}>
            <planeGeometry args={[0.28, 4.5]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 6. Main 3D Vehicle Simulation & Telemetry HUD Component
// -------------------------------------------------------------
export function Vehicle3DSimulation({ onAccidentConfirmed = null, externalReset = null }) {
  const { t, language } = useLanguage();
  const { setActiveDispatch } = useDemo();

  const [vehicleType, setVehicleType] = useState('car'); // 'car' | 'bike' | 'ambulance'
  const [simState, setSimState] = useState('DRIVING'); // 'DRIVING' | 'CRASHED' | 'DISPATCHED' | 'SAFE'
  const [speed, setSpeed] = useState(78);
  const [gForce, setGForce] = useState(1.02);
  const [gyroTilt, setGyroTilt] = useState({ roll: 1.8, pitch: 0.7, yaw: 0 });
  const [countdown, setCountdown] = useState(25);
  const [dispatchDetails, setDispatchDetails] = useState(null);

  const countdownTimerRef = useRef(null);

  // Sync with external reset
  useEffect(() => {
    if (externalReset === false) {
      handleResetSim();
    }
  }, [externalReset]);

  // Normal Driving Telemetry Flutter
  useEffect(() => {
    let interval = null;
    if (simState === 'DRIVING') {
      interval = setInterval(() => {
        setSpeed((prev) => 74 + Math.floor(Math.random() * 8));
        setGForce((prev) => +(0.98 + Math.random() * 0.12).toFixed(2));
        setGyroTilt({
          roll: +(Math.sin(Date.now() / 600) * 2.8).toFixed(1),
          pitch: +(Math.cos(Date.now() / 800) * 1.4).toFixed(1),
          yaw: +(Math.sin(Date.now() / 1200) * 1.8).toFixed(1)
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [simState]);

  // Trigger Crash Simulation Handler
  const handleSimulateCrash = () => {
    setSimState('CRASHED');
    setSpeed(0);
    setGForce(4.85); // Critical impact spike
    setGyroTilt({ roll: 68.4, pitch: 24.2, yaw: 142.0 });
    setCountdown(25);

    // Audio Voice Alert
    speakEmergencyInstruction(
      "High impact crash detected. Multi-sensor fusion activated. Are you safe? Emergency SOS dispatching in 25 seconds."
    );

    // Start 25s Countdown
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleTriggerAutonomousDispatch('AUTO_TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // User Clicks "I AM SAFE (CANCEL)"
  const handleMarkSafe = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setSimState('SAFE');
    speakEmergencyInstruction("Accident alert cancelled. User confirmed safe.");
    setTimeout(() => {
      setSimState('DRIVING');
      setSpeed(76);
      setGForce(1.02);
    }, 2500);
  };

  // Autonomous Rescue Dispatch Trigger (Timeout or "I NEED HELP")
  const handleTriggerAutonomousDispatch = (triggerSource = 'USER_CONFIRMED') => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setSimState('DISPATCHED');

    const details = {
      incidentId: `INC-${Math.floor(100000 + Math.random() * 900000)}`,
      location: 'NH-16 Highway, Vijayawada Bypass (KM 42.8)',
      coordinates: { lat: 16.5180, lng: 80.6520 },
      severity: 'CRITICAL (Level-1 Trauma)',
      sensors: {
        maxGForce: '4.85 G (Severe Deceleration)',
        speedDrop: '78 km/h -> 0 km/h in 0.6s',
        angularTilt: '68.4° Roll Over',
        postImpactStillness: 'CONFIRMED (Zero Movement)'
      },
      hospital: {
        name: 'Government General Hospital (GGH Vijayawada)',
        distanceKm: 2.1,
        etaMin: 3.8,
        icuBedReserved: 'Trauma Bay-04',
        phone: '+91-866-2472777'
      }
    };

    setDispatchDetails(details);

    setActiveDispatch({
      active: true,
      hospitalCoords: details.coordinates,
      userCoords: details.coordinates
    });

    if (onAccidentConfirmed) {
      onAccidentConfirmed(details);
    }

    speakEmergencyInstruction(
      "Emergency rescue confirmed. ALS Ambulance 108 and trauma hospital notified."
    );
  };

  // Reset Simulation
  const handleResetSim = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setSimState('DRIVING');
    setSpeed(78);
    setGForce(1.02);
    setCountdown(25);
    setDispatchDetails(null);
  };

  return (
    <div className="w-full bg-[#070D1A] rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-5 overflow-hidden relative">
      
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-amber-600 border border-red-400/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {t('sim_title') || '3D Real-Time Vehicle Crash & Multi-Sensor Screening'}
              </h3>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                THREE.JS PHOTOREALISTIC
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Live multi-sensor screening evaluating Accelerometer G-Force, 3D Gyroscope tilt, and GPS Speed drop.
            </p>
          </div>
        </div>

        {/* Vehicle Selection & Reset */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#050A14] p-1 rounded-xl border border-slate-800 flex space-x-1">
            <button
              onClick={() => setVehicleType('car')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                vehicleType === 'car' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
              title="Sports Sedan Car"
            >
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Sports Car</span>
            </button>
            <button
              onClick={() => setVehicleType('bike')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                vehicleType === 'bike' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
              title="Sports Motorbike"
            >
              <Bike className="w-4 h-4" />
              <span className="hidden sm:inline">Superbike</span>
            </button>
            <button
              onClick={() => setVehicleType('ambulance')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                vehicleType === 'ambulance' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
              title="ALS Emergency Ambulance"
            >
              <Siren className="w-4 h-4" />
              <span className="hidden sm:inline">ALS Rescue</span>
            </button>
          </div>

          <button
            onClick={handleResetSim}
            className="p-2.5 bg-[#050A14] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Telemetry Gauge HUD Overlay */}
      <div className="relative w-full h-84 sm:h-[440px] rounded-2xl bg-[#030712] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* 3D Three.js Viewport */}
        <Canvas shadows camera={{ position: [0, 2.6, 5.8], fov: 48 }}>
          <ambientLight intensity={0.75} />
          <directionalLight 
            position={[8, 14, 8]} 
            intensity={1.8} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          <directionalLight position={[-8, 6, -8]} color="#38bdf8" intensity={0.8} />

          <RealisticHighwayEnvironment isCrashed={simState !== 'DRIVING'} />

          {/* Render Selected Ultra-Realistic Vehicle */}
          {vehicleType === 'bike' && <RealisticMotorbike isCrashed={simState !== 'DRIVING'} />}
          {vehicleType === 'ambulance' && <RealisticAmbulance isCrashed={simState !== 'DRIVING'} />}
          {vehicleType === 'car' && <RealisticCar isCrashed={simState !== 'DRIVING'} />}

          {/* Realistic Ground Contact Shadow under Vehicle */}
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.8} 
            scale={7} 
            blur={1.6} 
            far={3.5} 
            color="#000000" 
          />

          {/* Crash Collision Particles / Sparks */}
          {simState === 'CRASHED' && (
            <Sparkles count={120} scale={4} size={6} speed={3} color="#ef4444" />
          )}

          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2.05} 
            minPolarAngle={Math.PI / 4} 
          />
        </Canvas>

        {/* Top-Left: Live Sensor Fusion Gauges HUD */}
        <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 space-y-2 pointer-events-none shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Multi-Sensor Screening</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Speed Gauge */}
            <div className="bg-[#0B1220] p-2 rounded-xl border border-slate-800/80 text-center min-w-[72px]">
              <div className="text-[9px] text-slate-400 font-bold">GPS SPEED</div>
              <div className={`text-base font-black font-mono ${speed > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {speed} <span className="text-[9px] text-slate-400">km/h</span>
              </div>
            </div>

            {/* G-Force Gauge */}
            <div className="bg-[#0B1220] p-2 rounded-xl border border-slate-800/80 text-center min-w-[72px]">
              <div className="text-[9px] text-slate-400 font-bold">G-FORCE</div>
              <div className={`text-base font-black font-mono ${gForce > 2.5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                {gForce} <span className="text-[9px] text-slate-400">g</span>
              </div>
            </div>

            {/* Gyroscope Tilt */}
            <div className="bg-[#0B1220] p-2 rounded-xl border border-slate-800/80 text-center min-w-[72px]">
              <div className="text-[9px] text-slate-400 font-bold">GYRO TILT</div>
              <div className={`text-base font-black font-mono ${Math.abs(gyroTilt.roll) > 40 ? 'text-red-400' : 'text-amber-400'}`}>
                {gyroTilt.roll}°
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 pt-0.5">
            <span className={`w-2 h-2 rounded-full ${simState === 'DRIVING' ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
            <span>Telemetry: <strong className="text-white">{simState === 'DRIVING' ? 'MONITORING CRASH VECTORS' : 'COLLISION SPIKE LOGGED'}</strong></span>
          </div>
        </div>

        {/* Top-Right: Highway Location Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center space-x-1.5 shadow-lg pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>NH-16 Vijayawada Bypass</span>
        </div>

        {/* 25-Second Safety Countdown Modal Overlay (When Crashed) */}
        {simState === 'CRASHED' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-30">
            <div className="max-w-md w-full bg-[#0B1220] border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              
              <div className="w-14 h-14 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-500 animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>

              <div>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/40 uppercase">
                  High-G Collision Impact ({gForce}G)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {t('sim_countdown_title') || 'ARE YOU SAFE?'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t('sim_countdown_desc') || 'Multi-sensor impact detected. Alerting emergency hospital & volunteer rescue in:'}
                </p>
              </div>

              {/* Big 25s Countdown Dial */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/40 animate-ping" />
                <div className="w-24 h-24 rounded-full bg-red-950/80 border-4 border-red-500 flex items-center justify-center shadow-lg shadow-red-950">
                  <span className="text-4xl font-black text-red-400 font-mono">{countdown}s</span>
                </div>
              </div>

              {/* Interactive Safety Response Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleMarkSafe}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition-all min-h-[48px] cursor-pointer"
                >
                  {t('sim_safe_btn') || "I'M SAFE (CANCEL)"}
                </button>

                <button
                  onClick={() => handleTriggerAutonomousDispatch('USER_CONFIRMED')}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs shadow-lg shadow-red-950 transition-all min-h-[48px] cursor-pointer"
                >
                  {t('sim_help_btn') || 'I NEED HELP NOW'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* "I'm Safe" Banner */}
        {simState === 'SAFE' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-30">
            <div className="bg-emerald-950/90 border border-emerald-500 p-6 rounded-3xl text-center space-y-2 max-w-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-black text-white">Emergency Alert Cancelled</h4>
              <p className="text-xs text-emerald-200">User confirmed safe. No rescue services dispatched.</p>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Action Bar (Cruise vs Trigger Crash) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#050A14] p-4 rounded-2xl border border-slate-800">
        <div className="text-xs text-slate-300">
          <strong className="text-white">Live 3D Testing: </strong>
          <span>Vehicle is cruising smoothly on highway with live sensor screening. Click "Simulate Highway Crash" to trigger impact.</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {simState === 'DRIVING' ? (
            <button
              onClick={handleSimulateCrash}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs shadow-xl shadow-red-950 transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>{t('sim_trigger_crash') || 'SIMULATE HIGHWAY CRASH (4.8G)'}</span>
            </button>
          ) : (
            <button
              onClick={handleResetSim}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('sim_reset') || 'RESET DRIVING MODE'}</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
