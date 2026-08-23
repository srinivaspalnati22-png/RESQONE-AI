import React, { useRef, useState, useEffect, Component, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, ContactShadows, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Activity, 
  Navigation, Hospital, Users, Zap, Volume2, 
  RotateCcw, Play, Pause, Compass, Gauge, Radio, 
  Car, Bike, Siren, MapPin, Clock, Phone, ArrowRight, Sparkles as SparkleIcon,
  Flame, Wrench, Shield, X, AlertTriangle, Send, Share2, HeartPulse, Eye, Video, RefreshCw
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
// 1. Realistic 3D Human Driver Component
// -------------------------------------------------------------
function HumanDriver({ position = [0.35, 0.48, 0.1], isCrashed, isPassenger = false }) {
  const humanRef = useRef();

  useFrame((state, delta) => {
    if (humanRef.current) {
      if (!isCrashed) {
        // Natural road driving head/body sway
        humanRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.005;
        humanRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.02;
        humanRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.015;
      } else {
        // Forward impact whiplash
        humanRef.current.rotation.x = THREE.MathUtils.lerp(humanRef.current.rotation.x, -0.65, delta * 8);
        humanRef.current.position.y = THREE.MathUtils.lerp(humanRef.current.position.y, position[1] - 0.08, delta * 6);
      }
    }
  });

  return (
    <group ref={humanRef} position={position}>
      {/* Head with Hair & Face */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>
      {/* Dark Hair */}
      <mesh position={[0, 0.49, -0.02]}>
        <sphereGeometry args={[0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Torso / Jacket */}
      <mesh position={[0, 0.20, 0]} castShadow>
        <boxGeometry args={[0.28, 0.32, 0.22]} />
        <meshStandardMaterial color={isPassenger ? "#0369a1" : "#1e1b4b"} roughness={0.7} />
      </mesh>

      {/* Safety Seatbelt across Chest */}
      <mesh position={[0, 0.22, 0.12]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.04, 0.38, 0.02]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* Left & Right Arms reaching towards Steering Wheel */}
      <mesh position={[-0.14, 0.16, 0.14]} rotation={[0.5, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0.14, 0.16, 0.14]} rotation={[0.5, -0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. Realistic 3D Motorcycle Rider (Aerodynamic Racing Tuck)
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
      {/* Racing Helmet with Reflective Dark Iridium Visor */}
      <group position={[0, 0.52, 0.28]} rotation={[-0.25, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshPhysicalMaterial color="#0284c7" metalness={0.8} roughness={0.1} clearcoat={1.0} />
        </mesh>
        {/* Dark Visor */}
        <mesh position={[0, 0.02, 0.11]}>
          <boxGeometry args={[0.22, 0.10, 0.12]} />
          <meshPhysicalMaterial color="#090d16" metalness={0.9} roughness={0.05} clearcoat={1.0} />
        </mesh>
      </group>

      {/* Leaning Leather Racing Suit Torso */}
      <mesh position={[0, 0.28, 0.14]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.38, 0.26]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Arms Gripping Handlebars */}
      <mesh position={[-0.20, 0.26, 0.38]} rotation={[0.6, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.32, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.20, 0.26, 0.38]} rotation={[0.6, -0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.32, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Leather Riding Legs */}
      <mesh position={[-0.14, 0.02, -0.06]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.10, 0.32, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.14, 0.02, -0.06]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.10, 0.32, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. High-Detail Spinning 3D Wheel with Alloy Rim & Disc Brake
// -------------------------------------------------------------
function SpinningWheelGroup({ position, radius = 0.36, width = 0.22, isFront = false }) {
  const wheelRef = useRef();

  useFrame((state, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x -= delta * 35; // Continuous forward rotation
    }
  });

  return (
    <group position={position}>
      <group ref={wheelRef}>
        {/* Rubber Tire */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, width, 24]} />
          <meshStandardMaterial color="#050811" roughness={0.9} />
        </mesh>

        {/* Silver Diamond-Cut Alloy Rim */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[radius * 0.74, radius * 0.74, width * 1.04, 20]} />
          <meshPhysicalMaterial color="#f8fafc" metalness={0.96} roughness={0.1} clearcoat={1.0} />
        </mesh>

        {/* 6 Visible Chrome Spokes */}
        {[0, 60, 120].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[radius * 1.38, 0.04, width * 1.06]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Ventilated Brake Disc */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[radius * 0.62, radius * 0.62, width * 0.5, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} />
        </mesh>
      </group>

      {/* Red Brembo Caliper (Stationary on axle) */}
      <mesh position={[radius * 0.42, 0.08, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.16]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.8} roughness={0.2} clearcoat={1.0} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. Authentic High-Poly 3D Sports Car with Visible Humans Inside
// -------------------------------------------------------------
function Real3DCarModel({ isCrashed }) {
  const { scene } = useGLTF('/models/car.glb');
  const groupRef = useRef();
  const wheelsRef = useRef([]);

  // Clone scene and collect all wheel nodes
  const carScene = useMemo(() => {
    const clone = scene.clone();
    const wheels = [];

    const fl = clone.getObjectByName('wheel_fl');
    const fr = clone.getObjectByName('wheel_fr');
    const rl = clone.getObjectByName('wheel_rl');
    const rr = clone.getObjectByName('wheel_rr');

    if (fl) wheels.push(fl);
    if (fr) wheels.push(fr);
    if (rl) wheels.push(rl);
    if (rr) wheels.push(rr);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        const name = (child.name || '').toLowerCase();
        if ((name.includes('wheel') || name.includes('rim') || name.includes('tire')) && !wheels.includes(child)) {
          wheels.push(child);
        }

        if (child.material) {
          child.material.envMapIntensity = 2.4;
          if (child.name && (child.name.includes('body') || child.name.includes('paint') || child.name.includes('car'))) {
            child.material.color = new THREE.Color('#0284c7');
            child.material.metalness = 0.95;
            child.material.roughness = 0.08;
            child.material.clearcoat = 1.0;
            child.material.clearcoatRoughness = 0.03;
          }
        }
      }
    });

    wheelsRef.current = wheels;
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!isCrashed) {
      const spinSpeed = 35;
      wheelsRef.current.forEach((w) => {
        w.rotation.x -= delta * spinSpeed;
      });

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
      <primitive 
        ref={groupRef} 
        object={carScene} 
        scale={0.92} 
        position={[0, 0.08, 0]} 
        rotation={[0, Math.PI, 0]}
      />

      {/* 3D Human Driver & Front Passenger inside Cockpit */}
      <HumanDriver position={[0.34, 0.38, 0.05]} isCrashed={isCrashed} />
      <HumanDriver position={[-0.34, 0.38, 0.05]} isCrashed={isCrashed} isPassenger />

      {/* Headlight beams illuminating forward down the road (+Z) */}
      {!isCrashed && (
        <>
          <spotLight position={[-0.7, 0.5, 1.8]} target-position={[-0.7, 0, 18]} angle={0.55} penumbra={0.6} intensity={10} color="#e0f2fe" distance={32} />
          <spotLight position={[0.7, 0.5, 1.8]} target-position={[0.7, 0, 18]} angle={0.55} penumbra={0.6} intensity={10} color="#e0f2fe" distance={32} />
        </>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 5. High-Fidelity 3D Superbike with Human Rider
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
      {/* 3D Human Motorcycle Rider */}
      <MotorcycleRider isCrashed={isCrashed} />

      {/* Racing Red Chassis */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.38, 0.52, 1.4]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.92} roughness={0.15} clearcoat={1.0} />
      </mesh>
      {/* Aerodynamic Blue Fairing */}
      <mesh position={[0, 0.58, 0.3]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.46, 0.36, 0.8]} />
        <meshPhysicalMaterial color={isCrashed ? '#ef4444' : '#0284c7'} metalness={0.95} roughness={0.1} clearcoat={1.0} />
      </mesh>
      {/* Handlebars */}
      <mesh position={[0, 0.76, 0.58]}>
        <boxGeometry args={[0.82, 0.05, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} />
      </mesh>
      {/* Twin Xenon Headlight */}
      <mesh position={[0, 0.68, 0.84]}>
        <boxGeometry args={[0.26, 0.16, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={isCrashed ? 0.3 : 8} />
      </mesh>

      {/* Front & Rear Spinning Wheels */}
      {!isCrashed ? (
        <>
          <SpinningWheelGroup position={[0, 0.02, 1.15]} radius={0.36} width={0.16} isFront />
          <SpinningWheelGroup position={[0, 0.02, -1.05]} radius={0.36} width={0.20} />
        </>
      ) : (
        <>
          <mesh position={[0, 0.02, 1.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.36, 0.16, 20]} />
            <meshStandardMaterial color="#090d16" />
          </mesh>
          <mesh position={[0, 0.02, -1.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.36, 0.20, 20]} />
            <meshStandardMaterial color="#090d16" />
          </mesh>
        </>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 6. High-Fidelity 3D Ambulance with Paramedic Crew Inside
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
      {/* 2 Paramedics in the Cabin */}
      <HumanDriver position={[0.42, 0.58, 0.7]} isCrashed={isCrashed} />
      <HumanDriver position={[-0.42, 0.58, 0.7]} isCrashed={isCrashed} isPassenger />

      {/* White Rescue Cabin */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[1.78, 1.25, 3.8]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.5} roughness={0.2} clearcoat={1.0} />
      </mesh>
      {/* Red Emergency Side Stripe */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.80, 0.26, 3.82]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Rooftop Emergency Strobe Lightbar */}
      <mesh position={[0, 1.46, 0.4]}>
        <boxGeometry args={[0.9, 0.16, 0.3]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={10} />
      </mesh>

      {/* 4 Spinning Wheels */}
      {!isCrashed ? (
        <>
          <SpinningWheelGroup position={[-0.92, 0.02, 1.25]} radius={0.36} width={0.22} isFront />
          <SpinningWheelGroup position={[0.92, 0.02, 1.25]} radius={0.36} width={0.22} isFront />
          <SpinningWheelGroup position={[-0.92, 0.02, -1.25]} radius={0.36} width={0.22} />
          <SpinningWheelGroup position={[0.92, 0.02, -1.25]} radius={0.36} width={0.22} />
        </>
      ) : (
        [-0.92, 0.92].map((x) => (
          <React.Fragment key={x}>
            <mesh position={[x, 0.02, 1.25]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.36, 0.36, 0.22, 20]} />
              <meshStandardMaterial color="#090d16" />
            </mesh>
            <mesh position={[x, 0.02, -1.25]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.36, 0.36, 0.22, 20]} />
              <meshStandardMaterial color="#090d16" />
            </mesh>
          </React.Fragment>
        ))
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 4. Moving Highway Environment & Surrounding Traffic
// -------------------------------------------------------------
function RealisticHighwayEnvironment({ isCrashed }) {
  const roadStripesRef = useRef();
  const trafficCarRef = useRef();

  useFrame((state, delta) => {
    if (!isCrashed) {
      if (roadStripesRef.current) {
        // Move road stripes backwards (-Z) under the forward-facing (+Z) car
        roadStripesRef.current.position.z -= delta * 28;
        if (roadStripesRef.current.position.z < -6) {
          roadStripesRef.current.position.z = 0;
        }
      }
      if (trafficCarRef.current) {
        // Highway traffic flowing smoothly
        trafficCarRef.current.position.z -= delta * 14;
        if (trafficCarRef.current.position.z < -35) {
          trafficCarRef.current.position.z = 25;
        }
      }
    }
  });

  return (
    <group>
      {/* Dark Specular Asphalt Highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 90]} />
        <meshStandardMaterial color="#030712" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* White Shoulder Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.01, 0]}>
        <planeGeometry args={[0.35, 90]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.01, 0]}>
        <planeGeometry args={[0.35, 90]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Dashed Center Stripes */}
      <group ref={roadStripesRef}>
        {[-42, -36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, 30, 36, 42].map((zPos, idx) => (
          <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, zPos]}>
            <planeGeometry args={[0.3, 3.8]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
      </group>

      {/* Surrounding Highway Traffic Vehicle in Adjacent Left Lane */}
      <group ref={trafficCarRef} position={[-2.4, 0.40, -18]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.5, 3.2]} />
          <meshPhysicalMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, -1.61]}>
          <boxGeometry args={[1.3, 0.08, 0.05]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Main Vehicle3DSimulation Component
// -------------------------------------------------------------
export const Vehicle3DSimulation = ({ onAccidentConfirmed, externalReset }) => {
  const { t } = useLanguage();
  const { queueOfflineReport } = useDemo();
  const { user, familyContacts } = useAuth();

  const [vehicleType, setVehicleType] = useState('car');
  const [cameraView, setCameraView] = useState('dynamic'); // 'dynamic' | 'side' | 'top'
  const [simState, setSimState] = useState('CRUISING'); // 'CRUISING' | 'CRASHED'
  const [speed, setSpeed] = useState(85);
  const [gForce, setGForce] = useState(1.05);

  // 3-Axis & Gyro Readings
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

  // Camera coordinates based on selected view mode
  const getCameraConfig = () => {
    switch (cameraView) {
      case 'side':
        return { position: [4.4, 1.4, 0.2], fov: 40 };
      case 'top':
        return { position: [0, 6.5, 0.5], fov: 45 };
      case 'dynamic':
      default:
        return { position: [3.4, 1.8, 3.8], fov: 40 }; // 3/4 Sports Perspective
    }
  };

  // Periodic cruising sensor telemetry fluctuations
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
        setGForce(+(1.02 + (Math.random() * 0.08)).toFixed(2));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [simState]);

  // Lifecycle audio cleanup when leaving simulation
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Robust 1-Second Countdown Timer Loop
  useEffect(() => {
    if (simState !== 'CRASHED' || alertDispatched) return;

    speakEmergencyInstruction("Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleConfirmEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopAllAudio();
    };
  }, [simState, alertDispatched]);

  const handleTriggerCrash = () => {
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
    setAcceptedHospital({
      name: 'Government General Hospital (GGH Vijayawada)',
      distance: '1.8 km',
      eta: '3.5 Mins',
      icuBed: 'Reserved (Bay #4)',
      ambulance: 'ALS-108 (AP-TRAUMA-99)'
    });

    speakEmergencyInstruction("Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.");

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

  const cameraConfig = getCameraConfig();

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-4 p-3.5 sm:p-6 relative">
      
      {/* 1. Header Bar: Vehicle Switcher & Camera Angles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        
        {/* Vehicle Selection Chips with Photo Thumbnails */}
        <div className="flex items-center space-x-2 bg-[#050A14] p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setVehicleType('car')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
              vehicleType === 'car' 
                ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/50' 
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <img src="/images/car.jpg" alt="3D Sports Car" className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0" />
            <span>3D Sports Car (Real GLB)</span>
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
            <span>3D Superbike</span>
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
            <span>3D Ambulance</span>
          </button>
        </div>

        {/* Camera Angle Switcher & Speed/G-Force */}
        <div className="flex items-center space-x-2">
          {/* Camera View Pills */}
          <div className="hidden sm:flex items-center bg-[#050A14] p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setCameraView('dynamic')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                cameraView === 'dynamic' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              3/4 Angle
            </button>
            <button
              onClick={() => setCameraView('side')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                cameraView === 'side' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side View
            </button>
            <button
              onClick={() => setCameraView('top')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                cameraView === 'top' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top View
            </button>
          </div>

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

      {/* 2. 3D Viewport with Real 3D GLB Model & Studio Environment */}
      <div className="relative w-full h-[360px] sm:h-[460px] rounded-3xl overflow-hidden border border-slate-800 bg-[#02050E] shadow-inner">
        <WebGLErrorBoundary fallback={<WebGLFallbackView simState={simState} vehicleType={vehicleType} speed={speed} gForce={gForce} />}>
          <Suspense fallback={
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[#02050E]">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading Real 3D Model...</span>
            </div>
          }>
            <Canvas
              shadows
              key={`${cameraView}-${vehicleType}`}
              camera={cameraConfig}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={1.4} />
              <directionalLight position={[8, 16, 8]} intensity={3.5} castShadow shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-6, 4, -4]} intensity={2.2} color="#38bdf8" />
              <pointLight position={[6, 4, 4]} intensity={2.0} color="#f59e0b" />

              <RealisticHighwayEnvironment isCrashed={simState === 'CRASHED'} />

              <Float 
                speed={simState === 'CRASHED' ? 0 : 2.5} 
                rotationIntensity={simState === 'CRASHED' ? 0 : 0.03} 
                floatIntensity={simState === 'CRASHED' ? 0 : 0.05}
              >
                {vehicleType === 'car' && <Real3DCarModel isCrashed={simState === 'CRASHED'} />}
                {vehicleType === 'bike' && <RealisticMotorbike isCrashed={simState === 'CRASHED'} />}
                {vehicleType === 'ambulance' && <RealisticAmbulance isCrashed={simState === 'CRASHED'} />}
              </Float>

              {simState === 'CRASHED' && (
                <Sparkles count={80} scale={4} size={6} speed={2.5} color="#ef4444" />
              )}

              <ContactShadows position={[0, 0, 0]} opacity={0.85} scale={12} blur={2.2} far={4} />
              <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minPolarAngle={Math.PI / 8} />
            </Canvas>
          </Suspense>
        </WebGLErrorBoundary>

        {/* Live HUD Badge & Drag Instructions */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
          <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              simState === 'CRASHED' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
            }`} />
            <span>
              {simState === 'CRASHED' ? 'CRASH DETECTED: 4.85G IMPACT' : 'PHYSICS: REAL 3D GLB VEHICLE ACTIVE (85 KM/H)'}
            </span>
          </div>

          <div className="hidden sm:flex bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 items-center space-x-1">
            <span>🖱️ Drag to Rotate 360°</span>
          </div>
        </div>

        {/* Trigger Crash Button (When not crashed) */}
        {simState !== 'CRASHED' && (
          <button
            onClick={handleTriggerCrash}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs px-4 sm:px-6 py-3 rounded-2xl shadow-xl shadow-red-950/80 flex items-center space-x-2 transition-all cursor-pointer hover:scale-105"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>TRIGGER 3D ACCIDENT (4.85G)</span>
          </button>
        )}
      </div>

      {/* 3. Comprehensive Sensor Telemetry Dashboard (All Sensor Readings) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Axis Sensor Fusion Readings</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">100Hz STREAM</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          {/* Accelerometer 3-Axis */}
          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">3-Axis Accelerometer</span>
            <div className="text-xs font-mono font-bold text-white space-y-0.5">
              <div>X: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.ax}</span> m/s²</div>
              <div>Y: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.ay}</span> m/s²</div>
              <div>Z: <span className={sensorData.impactDetected ? 'text-red-400' : 'text-cyan-400'}>{sensorData.az}</span> m/s²</div>
            </div>
          </div>

          {/* 3D Gyroscope */}
          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">3D Gyroscope (Tilt)</span>
            <div className="text-xs font-mono font-bold text-white space-y-0.5">
              <div>Roll: <span className={sensorData.roll > 30 ? 'text-red-400' : 'text-amber-400'}>{sensorData.roll}°</span></div>
              <div>Pitch: <span className="text-amber-400">{sensorData.pitch}°</span></div>
              <div>Yaw: <span className="text-amber-400">{sensorData.yaw}°</span></div>
            </div>
          </div>

          {/* G-Force Peak */}
          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">Impact G-Force Magnitude</span>
            <div className={`text-xl font-mono font-black ${gForce > 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {gForce} G
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Threshold: 3.0G</span>
          </div>

          {/* GPS Velocity */}
          <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">GPS Speed & Altitude</span>
            <div className="text-xl font-mono font-black text-cyan-400">
              {speed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Alt: 24m • NH-16 GPS</span>
          </div>

        </div>
      </div>

      {/* 4. FULL BIG SCREEN 25-SECOND EMERGENCY COUNTDOWN MODAL OVERLAY */}
      {simState === 'CRASHED' && !alertDispatched && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
          
          {/* Background Ambient Red Strobe Glow */}
          <div className="absolute inset-0 bg-radial from-red-600/30 via-transparent to-transparent pointer-events-none animate-pulse" />

          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border-2 border-red-500/90 rounded-3xl p-5 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.6)] text-center space-y-5 overflow-hidden">
            
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

            {/* Live Sensor Breakdown Matrix */}
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

            {/* 5 Family SOS Contacts Summary in Big Screen */}
            <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 text-left space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-red-400" />
                  <span>5 Family Contacts Targeted for SMS/WhatsApp Alert:</span>
                </span>
                <span className="text-emerald-400 font-mono">5/5 READY</span>
              </div>
              <div className="text-[10px] text-slate-400 flex flex-wrap gap-1.5 font-mono">
                {(familyContacts || []).slice(0, 5).map((fc, i) => (
                  <span key={i} className="bg-[#0B1220] px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                    {fc.name} ({fc.phone})
                  </span>
                ))}
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

      {/* 5. HOSPITAL ACCEPTANCE BANNER (Shown After Countdown / Dispatch) */}
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
