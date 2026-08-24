import React, { useRef, useState, useEffect, Component, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, ContactShadows, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Activity, 
  Navigation, Hospital, Users, Zap, Volume2, 
  RotateCcw, Play, Pause, Compass, Gauge, Radio, 
  Car, Bike, Siren, MapPin, Clock, Phone, ArrowRight, Sparkles as SparkleIcon,
  Flame, Wrench, Shield, X, AlertTriangle, Send, Share2, HeartPulse, Eye, Video, RefreshCw, Orbit
} from 'lucide-react';
import { speakEmergencyInstruction, stopAllAudio } from '../services/audio_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';

// Cross-platform WebGL Error Boundary
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
      <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-red-500/50 shadow-2xl animate-pulse">
        <img 
          src={vehicleType === 'bike' ? '/images/bike.jpg' : vehicleType === 'ambulance' ? '/images/aum.jpg' : '/images/car.jpg'} 
          alt="Vehicle" 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-black text-white">
          {simState === 'CRASHED' ? 'CRITICAL VEHICLE IMPACT DETECTED' : '2.5D Sensor Telemetry Engine'}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Sensor fusion active: {speed} km/h • {gForce}G. Real-time telemetry stream.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. Ultra-Realistic 3D Human (Visible from 360° & Rear)
// -------------------------------------------------------------
function HumanDriver({ position = [0.34, 0.38, 0.05], isCrashed, isPassenger = false }) {
  const humanRef = useRef();

  useFrame((state, delta) => {
    if (humanRef.current) {
      if (!isCrashed) {
        humanRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.005;
        humanRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.02;
        humanRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.015;
      } else {
        humanRef.current.rotation.x = THREE.MathUtils.lerp(humanRef.current.rotation.x, -0.65, delta * 8);
        humanRef.current.position.y = THREE.MathUtils.lerp(humanRef.current.position.y, position[1] - 0.08, delta * 6);
        humanRef.current.rotation.z = THREE.MathUtils.lerp(humanRef.current.rotation.z, isPassenger ? 0.35 : -0.25, delta * 4);
      }
    }
  });

  const skinColor = '#d4a574';
  const hairColor = isPassenger ? '#3b2418' : '#1a1a2e';
  const shirtColor = isPassenger ? '#0369a1' : '#1e1b4b';

  return (
    <group ref={humanRef} position={position}>
      {/* Head with Full Textured Hair */}
      <group position={[0, 0.44, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.03, -0.02]}>
          <sphereGeometry args={[0.128, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>

      {/* Shoulders & Torso */}
      <mesh position={[0, 0.20, 0]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.65} />
      </mesh>

      {/* Headrest */}
      <mesh position={[0, 0.38, -0.1]}>
        <boxGeometry args={[0.22, 0.18, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. Realistic 3D Motorcycle Rider
// -------------------------------------------------------------
function MotorcycleRider({ isCrashed }) {
  const riderRef = useRef();

  useFrame((state, delta) => {
    if (riderRef.current) {
      if (!isCrashed) {
        riderRef.current.position.y = 0.54 + Math.sin(state.clock.elapsedTime * 10) * 0.012;
        riderRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.04;
      } else {
        riderRef.current.rotation.z = THREE.MathUtils.lerp(riderRef.current.rotation.z, 1.25, delta * 5);
        riderRef.current.position.y = THREE.MathUtils.lerp(riderRef.current.position.y, 0.20, delta * 5);
      }
    }
  });

  return (
    <group ref={riderRef} position={[0, 0.54, -0.15]}>
      <group position={[0, 0.52, 0.28]} rotation={[-0.25, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshPhysicalMaterial color="#0284c7" metalness={0.85} roughness={0.08} clearcoat={1.0} />
        </mesh>
        <mesh position={[0, 0.05, -0.14]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.08]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <mesh position={[0, 0.30, 0.12]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.36, 0.24]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.38, 0.02]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.14, 0.22, 0.08]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.30, -0.01]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. Ultra-Visible Continuous High-Speed Spinning Wheel
// -------------------------------------------------------------
function SpinningWheelGroup({ position, radius = 0.35, width = 0.24, isCrashed = false }) {
  const wheelSpinRef = useRef();

  useFrame((state, delta) => {
    if (wheelSpinRef.current && !isCrashed) {
      // Rapid forward spin around the axle
      wheelSpinRef.current.rotation.x -= delta * 38;
    }
  });

  return (
    <group position={position}>
      {/* Spinning Axle Group */}
      <group ref={wheelSpinRef}>
        {/* Outer Rubber Tire */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, width, 32]} />
          <meshStandardMaterial color="#080c14" roughness={0.95} />
        </mesh>

        {/* High-Contrast White Tire Markings (makes spin extremely obvious) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
          <mesh key={`tread-${idx}`} position={[0, Math.sin(angle) * (radius * 0.96), Math.cos(angle) * (radius * 0.96)]}>
            <boxGeometry args={[width * 1.02, 0.03, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Diamond-Cut Alloy Rim with Bright Silver Sheen */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.72, radius * 0.72, width * 1.05, 24]} />
          <meshPhysicalMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} clearcoat={1.0} />
        </mesh>

        {/* 5 Distinct Chrome Spokes */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[radius * 1.35, 0.04, width * 1.06]} />
            <meshPhysicalMaterial color="#38bdf8" metalness={0.95} roughness={0.08} />
          </mesh>
        ))}

        {/* Center Hubcap with Neon Accent */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.22, radius * 0.22, width * 1.1, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Static Red Brembo Brake Caliper on Axle */}
      <mesh position={[radius * 0.42, 0.08, 0]}>
        <boxGeometry args={[0.10, 0.04, 0.16]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.8} roughness={0.2} clearcoat={1.0} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. Real 3D Sports Car with 4 Spinning Wheels & Rear Details
// -------------------------------------------------------------
function Real3DCarModel({ isCrashed }) {
  const { scene } = useGLTF('/models/car.glb');
  const groupRef = useRef();

  const carScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 3.0;
          if (child.name && (child.name.includes('body') || child.name.includes('paint') || child.name.includes('car'))) {
            child.material.color = new THREE.Color('#0284c7');
            child.material.metalness = 0.96;
            child.material.roughness = 0.06;
            child.material.clearcoat = 1.0;
          }
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!isCrashed) {
      if (groupRef.current) {
        groupRef.current.position.y = 0.08 + Math.sin(state.clock.elapsedTime * 12) * 0.008;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.012;
        groupRef.current.rotation.y = Math.PI; // Face forward (+Z)
        groupRef.current.rotation.x = 0;
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.72, delta * 4);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.PI + 1.25, delta * 3);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.45, delta * 3);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.15, delta * 4);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D GLB Model Body */}
      <primitive 
        ref={groupRef} 
        object={carScene} 
        scale={0.92} 
        position={[0, 0.08, 0]} 
        rotation={[0, Math.PI, 0]}
      />

      {/* 4 Dedicated Visible High-Speed Rotating Wheels */}
      <SpinningWheelGroup position={[-0.82, 0.34, 1.22]} radius={0.34} width={0.22} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[0.82, 0.34, 1.22]} radius={0.34} width={0.22} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[-0.82, 0.34, -1.25]} radius={0.34} width={0.24} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[0.82, 0.34, -1.25]} radius={0.34} width={0.24} isCrashed={isCrashed} />

      {/* 3D Human Crew visible from 360° */}
      <HumanDriver position={[0.34, 0.38, 0.05]} isCrashed={isCrashed} />
      <HumanDriver position={[-0.34, 0.38, 0.05]} isCrashed={isCrashed} isPassenger />

      {/* Rear High-Intensity Taillights & Exhaust */}
      {!isCrashed && (
        <group position={[0, 0, -1.85]}>
          <mesh position={[-0.62, 0.52, 0]}>
            <boxGeometry args={[0.42, 0.10, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={8} />
          </mesh>
          <mesh position={[0.62, 0.52, 0]}>
            <boxGeometry args={[0.42, 0.10, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={8} />
          </mesh>
          <mesh position={[0, 0.54, 0]}>
            <boxGeometry args={[0.84, 0.03, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={6} />
          </mesh>
          <mesh position={[0, 0.35, 0.02]}>
            <boxGeometry args={[0.36, 0.12, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          <mesh position={[-0.45, 0.18, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.98} roughness={0.08} />
          </mesh>
          <mesh position={[0.45, 0.18, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.98} roughness={0.08} />
          </mesh>
          <pointLight position={[-0.62, 0.5, -0.5]} color="#ef4444" intensity={2.5} distance={4} />
          <pointLight position={[0.62, 0.5, -0.5]} color="#ef4444" intensity={2.5} distance={4} />
        </group>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 5. High-Fidelity 3D Superbike
// -------------------------------------------------------------
function RealisticMotorbike({ isCrashed }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      if (groupRef.current) {
        groupRef.current.position.y = 0.40 + Math.sin(state.clock.elapsedTime * 10) * 0.015;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.045;
        groupRef.current.rotation.y = 0;
      }
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 1.45, delta * 5);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.85, delta * 4);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.16, delta * 5);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.40, 0]}>
      <MotorcycleRider isCrashed={isCrashed} />

      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.34, 0.48, 1.35]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.92} roughness={0.12} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 0.52, -0.55]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.55]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.93} roughness={0.10} clearcoat={1.0} />
      </mesh>
      <mesh position={[0, 0.56, -0.83]}>
        <boxGeometry args={[0.22, 0.04, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isCrashed ? 0.5 : 8} />
      </mesh>

      {/* Front & Rear Spinning Wheels */}
      <SpinningWheelGroup position={[0, 0.02, 1.15]} radius={0.36} width={0.16} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[0, 0.02, -1.05]} radius={0.36} width={0.24} isCrashed={isCrashed} />
    </group>
  );
}

// -------------------------------------------------------------
// 6. High-Fidelity 3D Ambulance
// -------------------------------------------------------------
function RealisticAmbulance({ isCrashed }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (isCrashed && groupRef.current) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.45, delta * 4);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.25, delta * 4);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      <HumanDriver position={[0.42, 0.58, 0.7]} isCrashed={isCrashed} />
      <HumanDriver position={[-0.42, 0.58, 0.7]} isCrashed={isCrashed} isPassenger />

      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[1.78, 1.25, 3.8]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.4} roughness={0.15} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.80, 0.22, 3.82]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* 4 Wheels */}
      <SpinningWheelGroup position={[-0.92, 0.02, 1.25]} radius={0.36} width={0.22} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[0.92, 0.02, 1.25]} radius={0.36} width={0.22} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[-0.92, 0.02, -1.25]} radius={0.36} width={0.22} isCrashed={isCrashed} />
      <SpinningWheelGroup position={[0.92, 0.02, -1.25]} radius={0.36} width={0.22} isCrashed={isCrashed} />
    </group>
  );
}

// -------------------------------------------------------------
// 7. Moving Highway Environment
// -------------------------------------------------------------
function RealisticHighwayEnvironment({ isCrashed }) {
  const roadStripesRef = useRef();

  useFrame((state, delta) => {
    if (!isCrashed && roadStripesRef.current) {
      roadStripesRef.current.position.z -= delta * 32;
      if (roadStripesRef.current.position.z < -6) {
        roadStripesRef.current.position.z = 0;
      }
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 10]} receiveShadow>
        <planeGeometry args={[18, 120]} />
        <meshStandardMaterial color="#030712" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.01, 10]}>
        <planeGeometry args={[0.35, 120]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.01, 10]}>
        <planeGeometry args={[0.35, 120]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <group ref={roadStripesRef}>
        {[-36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, 30, 36, 42, 48, 54].map((zPos, idx) => (
          <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, zPos]}>
            <planeGeometry args={[0.3, 3.8]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Main Vehicle3DSimulation Component (INITIAL BACK VIEW + 360° ORBIT)
// -------------------------------------------------------------
export const Vehicle3DSimulation = ({ onAccidentConfirmed, externalReset }) => {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const { queueOfflineReport, acceptedHospital: globalAcceptedHospital } = useDemo();
  const { user, familyContacts } = useAuth();

  const [vehicleType, setVehicleType] = useState('car');
  const [simState, setSimState] = useState('CRUISING');
  const [speed, setSpeed] = useState(85);
  const [gForce, setGForce] = useState(1.05);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);

  // Pre-Crash Proactive Safety Radar State
  const [preCrashAlert, setPreCrashAlert] = useState(null);
  const [autoSensorActive, setAutoSensorActive] = useState(true);
  const [hazardCountdown, setHazardCountdown] = useState(7);
  const [storyStep, setStoryStep] = useState('IDLE'); // 'IDLE' | 'CRUISING' | 'SPEEDING' | 'HAZARD_ALERT' | 'SAFE' | 'CRASHED'

  const [sensorData, setSensorData] = useState({
    ax: 0.12,
    ay: -0.05,
    az: 9.81,
    roll: 0.2,
    pitch: 1.1,
    yaw: 0.4,
    impactDetected: false,
  });

  const [countdown, setCountdown] = useState(25);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [acceptedHospital, setAcceptedHospital] = useState(null);

  // INITIAL BACK VIEW: Starts directly behind the car looking forward down the highway
  const initialCamera = { position: [0, 1.45, -3.8], fov: 45 };

  // =========================================================================
  // CINEMATIC AUTONOMOUS SCENARIO: Normal Drive -> Cross Limits -> Voice Alert -> Choice
  // =========================================================================
  const handleStartAutonomousScenario = () => {
    stopAllAudio();
    setSimState('CRUISING');
    setSpeed(65);
    setGForce(1.02);
    setPreCrashAlert(null);
    setStoryStep('CRUISING');

    // Step 1: Normal cruising at 65 km/h for 4.0s, then accelerate past limits
    setTimeout(() => {
      setStoryStep('SPEEDING');
      setSpeed(125);
      setGForce(1.85);

      setTimeout(() => {
        setStoryStep('HAZARD_ALERT');
        setHazardCountdown(15); // Ample 15-second decision window so audio plays fully and user has time to choose!

        setPreCrashAlert({
          type: 'OVERSPEED',
          title: language === 'te' ? 'హెచ్చరిక: అతివేగం మరియు ప్రమాదకర జోన్!' : language === 'hi' ? 'चेतावनी: अत्यधिक गति!' : 'PRE-CRASH WARNING: EXCESSIVE SPEED (125 km/h)',
          speed: 125,
          message: language === 'te' 
            ? 'మీరు సురక్షిత వేగ పరిమితిని దాటారు (125 km/h). దయచేసి వెంటనే వేగాన్ని తగ్గించండి!' 
            : language === 'hi' 
            ? 'आप सुरक्षित गति सीमा से अधिक (125 किमी/घंटा) चल रहे हैं। कृपया तुरंत धीमा करें!' 
            : 'Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.',
          action: 'DECISION: SLOW DOWN OR CRASH',
          severity: 'CRITICAL'
        });

        speakEmergencyInstruction(
          "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately."
        );
      }, 1000);
    }, 4000);
  };
  // Hazard Alert Countdown Timer (15 seconds to listen before auto-crash)
  useEffect(() => {
    if (storyStep !== 'HAZARD_ALERT') return;

    const timer = setInterval(() => {
      setHazardCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleIgnoreWarningAndCrash(); // User did not listen -> Trigger accident!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [storyStep]);

  // BRANCH A: USER LISTENS -> SLOW DOWN TO SAFE SPEED
  const handleUserListensSlowDown = () => {
    stopAllAudio();
    setStoryStep('SAFE');
    setPreCrashAlert(null);
    setSpeed(50);
    setGForce(1.02);

    speakEmergencyInstruction("Speed normalized. You are safe! Hazard avoided.");

    setTimeout(() => {
      setStoryStep('IDLE');
    }, 7000);
  };

  // BRANCH B: USER DOES NOT LISTEN -> TRIGGER SEVERE ACCIDENT & 25s COUNTDOWN
  const handleIgnoreWarningAndCrash = () => {
    stopAllAudio();
    setStoryStep('CRASHED');
    setPreCrashAlert(null);
    setSimState('CRASHED');
    setSpeed(0);
    setGForce(4.85);
    setSensorData({
      ax: 12.45,
      ay: -8.90,
      az: 32.10,
      roll: 68.4,
      pitch: 24.2,
      yaw: 114.8,
      impactDetected: true,
    });
    setCountdown(25); // 25-second life-critical emergency countdown
    setAlertDispatched(false);
  };

  // 1. Pre-Crash Proactive Trigger: Over-Speed Warning
  const triggerOverSpeedAlert = (testSpeed = 115) => {
    setSpeed(testSpeed);
    setStoryStep('HAZARD_ALERT');
    setHazardCountdown(15);
    setPreCrashAlert({
      type: 'OVERSPEED',
      title: language === 'te' ? 'హెచ్చరిక: అతివేగం గుర్తించబడింది!' : language === 'hi' ? 'चेतावनी: अत्यधिक गति!' : 'PRE-CRASH WARNING: EXCESSIVE SPEED',
      speed: testSpeed,
      message: language === 'te' 
        ? 'మీరు సురక్షిత వేగ పరిమితిని దాటారు (115 km/h). దయచేసి వెంటనే వేగాన్ని తగ్గించండి!' 
        : language === 'hi' 
        ? 'आप सुरक्षित गति सीमा से अधिक (115 किमी/घंटा) चल रहे हैं। कृपया तुरंत धीमा करें!' 
        : 'Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.',
      action: 'REDUCE SPEED < 60 KM/H',
      severity: 'CRITICAL'
    });

    speakEmergencyInstruction(
      "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately."
    );
  };

  // 2. Pre-Crash Proactive Trigger: Accident Blackspot Proximity
  const triggerBlackspotAlert = () => {
    setStoryStep('HAZARD_ALERT');
    setHazardCountdown(15);
    setPreCrashAlert({
      type: 'BLACKSPOT',
      title: language === 'te' ? 'జాగ్రత్త: ప్రమాదకరమైన బ్లాక్‌స్పాట్ జోన్!' : language === 'hi' ? 'సావधानी: ब्लैकस्पॉट क्षेत्र!' : 'PRE-CRASH WARNING: ACCIDENT BLACKSPOT AHEAD',
      location: 'NH-16 Gollapudi Sharp Curve (MoRTH High-Risk Zone #AP-01)',
      message: language === 'te' 
        ? 'ముందు జాతీయ రహదారి 16 పై ప్రమాదకరమైన మలుపు మరియు యాక్సిడెంట్ జోన్ ఉంది. నెమ్మదిగా నడపండి.' 
        : language === 'hi' 
        ? 'आगे राष्ट्रीय राजमार्ग 16 पर अत्यधिक दुर्घटना संभावित क्षेत्र है। कृपया वाहन धीरे चलाएं।' 
        : 'Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.',
      action: 'DRIVE SLOWLY • 40 KM/H ZONE',
      severity: 'HIGH'
    });

    speakEmergencyInstruction(
      "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly."
    );
  };

  // 3. Pre-Crash Proactive Trigger: Unsafe Swerving / Instability
  const triggerSwerveAlert = () => {
    setGForce(1.85);
    setStoryStep('HAZARD_ALERT');
    setHazardCountdown(15);
    setSensorData(prev => ({ ...prev, roll: 28.5, pitch: 8.2, ay: -3.4 }));
    setPreCrashAlert({
      type: 'SWERVE',
      title: language === 'te' ? 'జాగ్రత్త: వాహనం అస్థిరంగా ఉంది!' : language === 'hi' ? 'సావधानी: वाहन असंतुलन!' : 'PRE-CRASH WARNING: SUDDEN SWERVING DETECTED',
      message: language === 'te' 
        ? 'వాహనం అస్థిరంగా మలుపులు తిరుగుతోంది. దయచేసి లేన్ నియంత్రణ పాటించండి.' 
        : language === 'hi' 
        ? 'వాహనం అస్థిరంగా మలుపులు తిరుగుతోంది. దయచేసి లేన్ నియంత్రణ పాటించండి.' 
        : 'Caution! Sudden lane swerving detected. Please maintain vehicle stability.',
      action: 'MAINTAIN LANE STABILITY',
      severity: 'HIGH'
    });

    speakEmergencyInstruction(
      "Caution! Sudden lane swerving detected. Please maintain vehicle stability."
    );
  };

  const handleDismissPreCrashAlert = () => {
    handleUserListensSlowDown();
  };

  // Real Mobile Device Motion Auto-Detection Listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) return;

    const handleDeviceMotion = (event) => {
      if (!autoSensorActive || simState === 'CRASHED') return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2) / 9.81;
      if (totalAcc > 3.8) {
        // Sudden High impact detected automatically from physical phone accelerometer!
        handleTriggerCrash();
      } else if (totalAcc > 1.8 && !preCrashAlert) {
        // High vibration / swerve
        triggerSwerveAlert();
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [autoSensorActive, simState, preCrashAlert]);

  useEffect(() => {
    let interval = null;
    if (simState === 'CRUISING') {
      interval = setInterval(() => {
        setSensorData({
          ax: +(0.10 + (Math.random() * 0.4 - 0.2)).toFixed(2),
          ay: +(-0.05 + (Math.random() * 0.2 - 0.1)).toFixed(2),
          az: +(9.80 + (Math.random() * 0.3 - 0.15)).toFixed(2),
          roll: +(0.2 + (Math.random() * 0.6 - 0.3)).toFixed(1),
          pitch: +(1.1 + (Math.random() * 0.4 - 0.2)).toFixed(1),
          yaw: +(0.4 + (Math.random() * 0.4 - 0.2)).toFixed(1),
          impactDetected: false,
        });
        if (!preCrashAlert) {
          setGForce(+(1.02 + (Math.random() * 0.08)).toFixed(2));
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [simState, preCrashAlert]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // CRASH COUNTDOWN: TICKS FULLY FROM 25 TO 0 BEFORE SENDING NOTIFICATIONS & DISPATCH
  useEffect(() => {
    if (simState !== 'CRASHED' || alertDispatched) return;

    speakEmergencyInstruction("Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // When and only when countdown reaches 0 -> Execute Emergency SOS Broadcast & Rescue!
          handleConfirmEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [simState, alertDispatched]);

  const handleTriggerCrash = () => {
    setPreCrashAlert(null);
    setSimState('CRASHED');
    setSpeed(0);
    setGForce(4.85);
    setSensorData({
      ax: 12.45,
      ay: -8.90,
      az: 32.10,
      roll: 68.4,
      pitch: 24.2,
      yaw: 114.8,
      impactDetected: true,
    });
    setCountdown(25);
    setAlertDispatched(false);
    setAcceptedHospital(null);
  };

  const handleReset = () => {
    stopAllAudio();
    setPreCrashAlert(null);
    setSimState('CRUISING');
    setSpeed(85);
    setGForce(1.05);
    setCountdown(25);
    setAlertDispatched(false);
    setAcceptedHospital(null);
    if (externalReset) externalReset();
  };

  const handleConfirmEmergency = () => {
    stopAllAudio();
    setAlertDispatched(true);
    const targetHosp = globalAcceptedHospital || {
      name: 'Government General Hospital (GGH Vijayawada)',
      distance: '1.8 km',
      eta: '3.5 Mins',
      icuBed: 'Reserved (Bay #4)',
      ambulance: 'ALS-108 (AP-TRAUMA-99)'
    };
    setAcceptedHospital(targetHosp);

    speakEmergencyInstruction(`Emergency SOS Confirmed. ${targetHosp.name || 'GGH Vijayawada'} accepted case. Ambulance ALS 108 dispatched.`);

    const payload = {
      id: `crash-${Date.now().toString().slice(-4)}`,
      type: 'VEHICULAR_COLLISION_CRITICAL',
      victim_name: user?.name || 'Srinivas Palnati',
      blood_group: user?.blood_group || 'O-',
      vehicle_type: vehicleType,
      gForce: 4.85,
      impactSpeed: 85,
      location: 'National Highway 16, Gollapudi Corridor, Vijayawada',
      coordinates: [16.5412, 80.5843],
      family_contacts_notified: familyContacts?.length || 5,
      timestamp: new Date().toISOString()
    };

    queueOfflineReport(payload);
    if (onAccidentConfirmed) onAccidentConfirmed(payload);
  };

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-4 p-3.5 sm:p-6 relative">
      
      {/* 1. Header Bar: Vehicle Switcher & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        
        {/* Vehicle Selection Chips & Full Scenario Runner */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center space-x-2 bg-[#050A14] p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setVehicleType('car')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                vehicleType === 'car' 
                  ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/50' 
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <img src="/images/car.jpg" alt="3D Sports Car" className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0" />
              <span>Sports Car</span>
            </button>

            <button
              onClick={() => setVehicleType('bike')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                vehicleType === 'bike' 
                  ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/50' 
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <img src="/images/bike.jpg" alt="3D Superbike" className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0" />
              <span>Superbike</span>
            </button>

            <button
              onClick={() => setVehicleType('ambulance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                vehicleType === 'ambulance' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 ring-2 ring-red-400/50' 
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <img src="/images/aum.jpg" alt="3D Ambulance" className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0" />
              <span>Ambulance</span>
            </button>
          </div>

          {/* 1-Tap Full Autonomous Scenario Launcher */}
          <button
            onClick={handleStartAutonomousScenario}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-950/80 active:scale-95 transition-all"
            title="Start realistic scenario: Normal drive -> cross limits -> spoken alert -> decision -> rescue"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>🚀 Run Full Scenario: Drive → Alert → Decision</span>
          </button>
        </div>

        {/* 360° Orbit Button, Speed, G-Force */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer ${
              isAutoOrbit 
                ? 'bg-cyan-600 text-slate-950 border-cyan-400 shadow-md animate-pulse' 
                : 'bg-[#050A14] text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Continuous 360° Camera Orbit"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>360° Orbit</span>
          </button>

          <div className="bg-[#050A14] px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5 text-xs font-mono font-bold text-white">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>{speed} km/h</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-mono font-bold ${
            gForce > 3.0 
              ? 'bg-red-950/90 border-red-500 text-red-400 animate-pulse' 
              : 'bg-[#050A14] border-slate-800 text-emerald-400'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{gForce} G</span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 bg-[#050A14] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 3D Viewport - START BACK VIEW + FULL 360° ROTATION */}
      <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-800 bg-[#02050E] shadow-inner">
        <WebGLErrorBoundary fallback={<WebGLFallbackView simState={simState} vehicleType={vehicleType} speed={speed} gForce={gForce} />}>
          <Suspense fallback={
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[#02050E]">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading Real 3D Model...</span>
            </div>
          }>
            <Canvas
              shadows
              key={`back-view-360-${vehicleType}`}
              camera={initialCamera}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={1.3} />
              <directionalLight position={[0, 12, -8]} intensity={3.2} castShadow />
              <pointLight position={[-4, 3, -4]} intensity={2.0} color="#38bdf8" />
              <pointLight position={[4, 3, -4]} intensity={2.0} color="#ef4444" />
              <pointLight position={[0, 4, 6]} intensity={2.2} color="#ffffff" />

              <Environment preset="city" />

              <RealisticHighwayEnvironment isCrashed={simState === 'CRASHED'} />

              <Float 
                speed={simState === 'CRASHED' ? 0 : 2.5} 
                rotationIntensity={simState === 'CRASHED' ? 0 : 0.02} 
                floatIntensity={simState === 'CRASHED' ? 0 : 0.04}
              >
                {vehicleType === 'car' && <Real3DCarModel isCrashed={simState === 'CRASHED'} />}
                {vehicleType === 'bike' && <RealisticMotorbike isCrashed={simState === 'CRASHED'} />}
                {vehicleType === 'ambulance' && <RealisticAmbulance isCrashed={simState === 'CRASHED'} />}
              </Float>

              {simState === 'CRASHED' && (
                <Sparkles count={90} scale={4} size={6} speed={2.5} color="#ef4444" />
              )}

              <ContactShadows position={[0, 0, 0]} opacity={0.85} scale={12} blur={2.2} far={4} />
              
              {/* FULL 360° ORBIT CONTROLS - Drag freely in all directions */}
              <OrbitControls 
                enableZoom={true} 
                autoRotate={isAutoOrbit}
                autoRotateSpeed={2.5}
                enableDamping={true}
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2.05} 
                minPolarAngle={Math.PI / 6}
              />
            </Canvas>
          </Suspense>
        </WebGLErrorBoundary>

        {/* Live HUD Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              simState === 'CRASHED' 
                ? 'bg-red-500 animate-ping' 
                : storyStep === 'SAFE' 
                ? 'bg-emerald-400' 
                : preCrashAlert 
                ? 'bg-amber-400 animate-pulse' 
                : 'bg-emerald-400'
            }`} />
            <span>
              {simState === 'CRASHED' 
                ? 'CRASH DETECTED: 4.85G IMPACT' 
                : storyStep === 'SAFE'
                ? 'SAFE: HAZARD AVOIDED • SPEED NORMAL'
                : preCrashAlert 
                ? `HAZARD WARNING ACTIVE: ${speed} KM/H` 
                : '360° INTERACTIVE VIEW • PRE-CRASH RADAR ACTIVE'}
            </span>
          </div>
        </div>

        {/* USER LISTENED & SAFE BANNER */}
        {storyStep === 'SAFE' && (
          <div className="absolute top-14 left-3 right-3 sm:left-6 sm:right-6 z-20 bg-emerald-950/95 backdrop-blur-2xl border-2 border-emerald-500 rounded-3xl p-4 text-center space-y-2 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-center space-x-2 text-emerald-400 font-black text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'te' ? 'వేగం తగ్గించబడింది: మీరు సురక్షితంగా ఉన్నారు!' : 'SPEED REDUCED: YOU ARE SAFE! HAZARD AVOIDED.'}</span>
            </div>
            <p className="text-xs text-slate-300">
              Vehicle decelerated to safe 50 km/h highway cruising. MoRTH danger sector cleared without incident.
            </p>
          </div>
        )}

        {/* PRE-CRASH PROACTIVE WARNING & DECISION HUD OVERLAY */}
        {preCrashAlert && simState !== 'CRASHED' && storyStep !== 'SAFE' && (
          <div className="absolute top-12 left-2 right-2 sm:left-6 sm:right-6 z-20 bg-[#070D18]/95 backdrop-blur-2xl border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-[0_0_60px_rgba(245,158,11,0.7)] animate-in fade-in zoom-in space-y-3.5">
            
            {/* Header with Title & Live 15s Countdown Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
              <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs sm:text-sm font-black uppercase">
                <AlertTriangle className="w-5 h-5 animate-bounce text-amber-400 shrink-0" />
                <span>{preCrashAlert.title}</span>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className="bg-red-950/90 text-red-300 font-mono text-xs font-black px-3 py-1 rounded-full border border-red-500/60 animate-pulse flex items-center space-x-1.5 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>DECISION TIMER: {hazardCountdown}s</span>
                </span>
              </div>
            </div>

            {/* Countdown Progress Bar (15s Window) */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-amber-500/30">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${Math.max(0, Math.min(100, (hazardCountdown / 15) * 100))}%` }}
              />
            </div>

            {/* Spoken Alert Message */}
            <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed bg-[#0B1426] p-3 rounded-2xl border border-slate-800">
              {preCrashAlert.message}
            </p>

            <div className="text-[11px] text-slate-300 font-medium">
              💡 <span className="text-amber-300 font-bold">Action Required:</span> Choose an action below within <span className="text-white font-mono font-bold">{hazardCountdown} seconds</span>, or system will simulate crash impact.
            </div>

            {/* TWO HIGH-CONTRAST DECISION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: User Listens -> Safe */}
              <button
                onClick={handleUserListensSlowDown}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xl shadow-emerald-950/90 active:scale-95 ring-2 ring-emerald-400/50"
              >
                <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-400" />
                <span>🛑 SLOW DOWN (I WILL LISTEN)</span>
              </button>

              {/* Option B: User Doesn't Listen -> Crash & Rescue */}
              <button
                onClick={handleIgnoreWarningAndCrash}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xl shadow-red-950/90 active:scale-95 ring-2 ring-red-500/50"
              >
                <AlertOctagon className="w-5 h-5 animate-pulse text-white" />
                <span>⚠️ IGNORE / SPEED UP (TRIGGER CRASH)</span>
              </button>
            </div>

          </div>
        )}

        {/* Trigger Crash Button */}
        {simState !== 'CRASHED' && (
          <button
            onClick={handleIgnoreWarningAndCrash}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs px-4 sm:px-6 py-3 rounded-2xl shadow-xl shadow-red-950/80 flex items-center space-x-2 transition-all cursor-pointer hover:scale-105"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>TRIGGER 3D ACCIDENT (4.85G)</span>
          </button>
        )}
      </div>

      {/* 2.5 PRE-CRASH PROACTIVE RADAR TOOLBAR (Test Alerts in all languages) */}
      <div className="bg-[#050A14] p-3.5 sm:p-4 rounded-3xl border border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              AI Pre-Crash Proactive Safety Radar (Autonomous Sensor Alerts)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SENSOR RADAR ACTIVE</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal">
          Detects excessive vehicle speed, hazardous MoRTH highway blackspots, and lateral instability <strong className="text-white">before</strong> collision occurs and provides <strong className="text-amber-400">automatic spoken voice precautions in {language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिन्दी' : language === 'ta' ? 'தமிழ்' : language === 'kn' ? 'ಕನ್ನಡ' : 'English'}</strong>.
        </p>

        {/* Test Trigger Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => triggerOverSpeedAlert(115)}
            className="p-2.5 bg-[#0B1220] hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>🏎️ Test High Speed (&gt;110 km/h)</span>
          </button>

          <button
            onClick={triggerBlackspotAlert}
            className="p-2.5 bg-[#0B1220] hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>⚠️ Test NH-16 Blackspot Zone</span>
          </button>

          <button
            onClick={triggerSwerveAlert}
            className="p-2.5 bg-[#0B1220] hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 text-rose-300 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>🔄 Test Sudden Swerving</span>
          </button>
        </div>
      </div>

      {/* 3. Sensor Telemetry Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Axis Sensor Fusion Readings</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">100Hz STREAM</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">3-Axis Accelerometer</span>
            <div className="text-xs font-mono font-bold text-white space-y-0.5">
              <div>X: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.ax}</span> m/s²</div>
              <div>Y: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.ay}</span> m/s²</div>
              <div>Z: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.az}</span> m/s²</div>
            </div>
          </div>

          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">3D Gyroscope (Tilt)</span>
            <div className="text-xs font-mono font-bold text-white space-y-0.5">
              <div>Roll: <span className={sensorData.roll > 30 ? 'text-red-400' : 'text-amber-400'}>{sensorData.roll}°</span></div>
              <div>Pitch: <span className="text-amber-400">{sensorData.pitch}°</span></div>
              <div>Yaw: <span className="text-amber-400">{sensorData.yaw}°</span></div>
            </div>
          </div>

          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">Impact G-Force Magnitude</span>
            <div className={`text-xl font-mono font-black ${gForce > 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {gForce} G
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Threshold: 3.0G</span>
          </div>

          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">GPS Speed & Altitude</span>
            <div className="text-xl font-mono font-black text-cyan-400">
              {speed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Alt: 24m • NH-16 GPS</span>
          </div>
        </div>
      </div>

      {/* 4. EMERGENCY COUNTDOWN MODAL */}
      {simState === 'CRASHED' && !alertDispatched && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
          <div className="absolute inset-0 bg-radial from-red-600/30 via-transparent to-transparent pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border-2 border-red-500/90 rounded-3xl p-5 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.6)] text-center space-y-5 overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-black uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span>CRITICAL 4.85G SENSOR IMPACT DETECTED</span>
              </div>
              <span className="bg-red-500/20 text-red-300 font-mono text-[11px] font-black px-3 py-1 rounded-full border border-red-500/50">
                LIFE-CRITICAL SOS
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" className="stroke-slate-800 fill-none" strokeWidth="10" />
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

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]">
                    {countdown}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-extrabold text-red-400 uppercase tracking-widest mt-1">
                    SECONDS REMAINING
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ARE YOU INJURED OR NEED RESCUE?
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Autonomous telemetry is broadcasting live GPS coordinates (<strong className="text-cyan-400">16.5412° N, 80.5843° E</strong>) to <strong className="text-white">5 Registered Family Members</strong> and <strong className="text-white">Government General Hospital (GGH Vijayawada)</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 text-left font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Impact G-Force</span>
                <div className="text-sm font-black text-red-400">4.85 G SPIKE</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Speed Drop</span>
                <div className="text-sm font-black text-amber-400">85 → 0 km/h</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Rollover Angle</span>
                <div className="text-sm font-black text-red-400">68.4° TILT</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase">Victim Profile</span>
                <div className="text-sm font-black text-cyan-400">{user?.blood_group || 'O-'} Blood</div>
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

      {/* 5. HOSPITAL ACCEPTANCE BANNER */}
      {alertDispatched && (
        <div className="bg-emerald-950/80 border border-emerald-500 p-4 sm:p-5 rounded-3xl space-y-3 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>HOSPITAL CASE ACCEPTED & AMBULANCE DISPATCHED!</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              ICU BED ALLOCATED
            </span>
          </div>

          <div className="text-xs text-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <strong className="text-white">Lead Hospital:</strong> {acceptedHospital?.name || 'Government General Hospital (GGH Vijayawada)'}
            </div>
            <div>
              <strong className="text-white">Emergency Unit:</strong> {acceptedHospital?.ambulance || 'ALS-108 (AP-TRAUMA-99)'} • ETA: {acceptedHospital?.eta || '3.5 Mins'}
            </div>
            <div>
              <strong className="text-white">Victim GPS:</strong> 16.5412° N, 80.5843° E (NH-16 Bypass)
            </div>
            <div>
              <strong className="text-white">Family SOS Status:</strong> 5/5 Notifications Dispatched
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
