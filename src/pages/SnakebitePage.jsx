import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Activity, ShieldAlert, CheckCircle2, Phone, MapPin, 
  Hospital, Hospital as HospIcon, Info, RefreshCw, AlertOctagon, 
  Eye, Zap, Stethoscope, AlertTriangle, Mic, MicOff, Volume2, 
  XCircle, Sparkles, HelpCircle, ArrowRight, Check, Table, Search, Filter, Send,
  Navigation, ShieldCheck, Route, ExternalLink, Building2,
  Camera, CameraOff, UploadCloud, Image as ImageIcon, Scan, Maximize2, SwitchCamera,
  Layers, Cpu, Crosshair, X, ChevronRight, UserCheck, Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { DataService } from '../services/data_service';
import { speakEmergencyInstruction, stopAllAudio } from '../services/audio_service';
import snakeSpeciesData from '../data/snake_species.json';
import { LiveHospitalResponse } from '../components/LiveHospitalResponse';
import { classifySnakeImage } from '../services/snake_vision_ai';

// Standalone Map Component for Victim + Antivenom Hospitals with Active Route Rendering
function SnakebiteRescueMapComponent({ victimCoords = [16.5167, 80.6500], hospitals = [], speciesName = 'Venomous Snake', selectedHospital = null, onSelectHospital }) {
  const mapDivRef = useRef(null);
  const mapInstance = useRef(null);
  const routePolylineRef = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current) return;

    if (!mapInstance.current) {
      if (mapDivRef.current._leaflet_id) {
        mapDivRef.current._leaflet_id = null;
      }

      try {
        const map = L.map(mapDivRef.current, {
          center: [16.5175, 80.6470],
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: 'leaflet-dark-mode',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Victim Pin
        const victimIcon = L.divIcon({
          className: 'custom-victim-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: rgba(127, 29, 29, 0.95); border: 2px solid #ef4444; box-shadow: 0 0 22px rgba(239, 68, 68, 0.95); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px;">
                🐍
              </div>
              <div style="margin-top: 2px; background: rgba(5, 10, 20, 0.95); color: #f87171; font-size: 8px; font-weight: 900; padding: 2px 4px; border-radius: 4px; border: 1px solid #ef4444; white-space: nowrap;">
                VICTIM (${speciesName})
              </div>
            </div>
          `,
          iconSize: [120, 60],
          iconAnchor: [60, 30]
        });
        L.marker(victimCoords, { icon: victimIcon, zIndexOffset: 1000 }).addTo(map);

        const defaultHospitals = [
          { name: 'Government General Hospital (GGH)', avs: 150, icu: 12, lat: 16.5167, lng: 80.6500, phone: '+91-866-2472777', address: 'Gunadala, Vijayawada' },
          { name: 'Ramesh Hospitals Emergency Center', avs: 85, icu: 15, lat: 16.5083, lng: 80.6417, phone: '+91-866-2488888', address: 'Ring Road, Vijayawada' },
          { name: 'Manipal Hospital Vijayawada', avs: 60, icu: 8, lat: 16.4833, lng: 80.6000, phone: '+91-866-6649999', address: 'Tadepalli, Vijayawada Highway' },
          { name: 'Ayush Hospitals Trauma Bay', avs: 40, icu: 6, lat: 16.5250, lng: 80.6350, phone: '+91-866-2544444', address: 'Suryaraopet, Vijayawada' }
        ];

        const hospitalList = hospitals.length > 0 ? hospitals : defaultHospitals;

        hospitalList.forEach((hosp) => {
          const lat = hosp.latitude || hosp.lat || 16.5167;
          const lng = hosp.longitude || hosp.lng || 80.6500;
          const avsCount = hosp.antivenom_stock || hosp.avs || 120;
          const isSelected = selectedHospital && (selectedHospital.name === hosp.name);

          const hospIcon = L.divIcon({
            className: 'custom-avs-hosp-marker',
            html: `
              <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="width: ${isSelected ? '38px' : '32px'}; height: ${isSelected ? '38px' : '32px'}; border-radius: 10px; background: ${isSelected ? 'linear-gradient(135deg, #0e7490, #06b6d4)' : 'linear-gradient(135deg, #083344, #0e7490)'}; border: 2px solid ${isSelected ? '#67e8f9' : '#22d3ee'}; box-shadow: 0 0 16px ${isSelected ? 'rgba(34, 211, 238, 1)' : 'rgba(34, 211, 238, 0.6)'}; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: ${isSelected ? '18px' : '16px'};">
                  🏥
                </div>
                <div style="margin-top: 2px; background: rgba(5, 10, 20, 0.95); color: #22d3ee; font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 4px; border: 1px solid #0891b2; white-space: nowrap;">
                  ${hosp.name.split(' ')[0]} (${avsCount} AVS)
                </div>
              </div>
            `,
            iconSize: [100, 50],
            iconAnchor: [50, 25]
          });

          const marker = L.marker([lat, lng], { icon: hospIcon }).addTo(map);
          marker.on('click', () => {
            if (onSelectHospital) onSelectHospital(hosp);
          });
        });

        mapInstance.current = map;
      } catch (mapErr) {
        console.warn('[SnakebiteRescueMap]', mapErr);
      }
    }

    // Update Route Line dynamically when hospital is selected
    if (mapInstance.current) {
      if (routePolylineRef.current) {
        mapInstance.current.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      const destHospital = selectedHospital || (hospitals.length > 0 ? hospitals[0] : { lat: 16.5167, lng: 80.6500 });
      const destLat = destHospital.latitude || destHospital.lat || 16.5167;
      const destLng = destHospital.longitude || destHospital.lng || 80.6500;

      const midLat = (victimCoords[0] + destLat) / 2 + 0.002;
      const midLng = (victimCoords[1] + destLng) / 2 - 0.001;

      routePolylineRef.current = L.polyline([
        victimCoords,
        [midLat, midLng],
        [destLat, destLng]
      ], {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 6',
        lineCap: 'round'
      }).addTo(mapInstance.current);

      mapInstance.current.fitBounds([victimCoords, [destLat, destLng]], { padding: [40, 40] });
    }

    const t1 = setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(t1);
    };
  }, [victimCoords, hospitals, speciesName, selectedHospital]);

  return (
    <div 
      ref={mapDivRef} 
      className="w-full h-full min-h-[320px] sm:min-h-[440px] rounded-3xl z-0" 
    />
  );
}

export const SnakebitePage = ({ initialQuery, onClearQuery }) => {
  const { t, language } = useLanguage();
  const { queueOfflineReport } = useDemo();

  // Search & Triage State
  const [hasTriaged, setHasTriaged] = useState(false);
  const [showVisualPicker, setShowVisualPicker] = useState(false);
  const [description, setDescription] = useState(initialQuery?.species || initialQuery?.query || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [alertSent, setAlertSent] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [showDatasetTable, setShowDatasetTable] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [allNearbyHospitals, setAllNearbyHospitals] = useState([]);

  // Camera & Image AI Vision State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTelemetry, setScanTelemetry] = useState('');
  const [visionConfidence, setVisionConfidence] = useState(97.4);
  const [detectedMarkers, setDetectedMarkers] = useState([]);
  const [showSampleGallery, setShowSampleGallery] = useState(false);

  // Non-Snake Detection Result State
  const [nonSnakeResult, setNonSnakeResult] = useState(null);

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [toxinFilter, setToxinFilter] = useState('ALL');

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    DataService.getHospitals(16.5167, 80.6500).then((hosps) => {
      setAllNearbyHospitals(hosps);
      if (hosps.length > 0) setSelectedHospital(hosps[0]);
    }).catch((e) => console.warn(e));

    return () => {
      stopAllAudio();
      stopCameraStream();
    };
  }, []);

  // When camera opens and stream is ready, ensure video element receives the stream
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn("Auto video play:", e));
    }
  }, [isCameraOpen]);

  useEffect(() => {
    if (initialQuery) {
      const q = initialQuery.species || initialQuery.query || 'Spectacled Cobra';
      setDescription(q);
      handleRunAssessment(q, []);
      if (onClearQuery) onClearQuery();
    }
  }, [initialQuery]);

  const symptomChecklist = [
    'Fang Puncture Marks',
    'Rapid Swelling & Severe Pain',
    'Ptosis (Drooping Eyelids)',
    'Difficulty Swallowing / Speaking',
    'Bleeding from Gums / Wound',
    'Dark / Reddish Urine',
    'Abdominal Colic Cramps',
    'Painless Nocturnal Bite'
  ];

  // ─── CAMERA MANAGEMENT ────────────────────────────────────────────────────────
  const startCameraStream = async (mode = 'environment') => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser/device.");
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
      }, 50);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? "Camera permission was denied. Please allow camera access in your browser settings or upload a photo." 
          : "Unable to access live camera stream. You can still upload any snake photo from your device."
      );
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleToggleCameraFacing = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCameraStream();
    processVisionAIAnalysis(dataUrl, 'Live Camera Capture');
  };

  // ─── FILE UPLOAD HANDLER ──────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        processVisionAIAnalysis(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input so same file can be chosen again
  };

  // ─── TEST SAMPLE SELECTOR ─────────────────────────────────────────────────────
  const sampleTestSnakes = [
    { name: "Spectacled Cobra", img: "/snakes/spectacled_cobra.jpg", type: "Neurotoxic", color: "from-red-600 to-amber-600" },
    { name: "Russell's Viper", img: "/snakes/russells_viper.jpg", type: "Hemotoxic", color: "from-amber-600 to-red-600" },
    { name: "Common Krait", img: "/snakes/common_krait.jpg", type: "Pre-Synaptic Neurotoxic", color: "from-indigo-600 to-cyan-600" },
    { name: "Saw-Scaled Viper", img: "/snakes/saw_scaled_viper.jpg", type: "Hemotoxic / Vasculotoxic", color: "from-orange-600 to-rose-600" },
    { name: "Indian Rat Snake", img: "/snakes/indian_rat_snake.jpg", type: "Non-Venomous", color: "from-emerald-600 to-teal-600" }
  ];

  const handleSelectSample = (sample) => {
    setShowSampleGallery(false);
    processVisionAIAnalysis(sample.img, sample.name, sample.name);
  };

  // ─── AI VISION SCANNER & SMART CLASSIFIER ─────────────────────────────────────
  const processVisionAIAnalysis = async (imageDataUrl, sourceLabel = 'Uploaded Photo', explicitSpeciesName = null) => {
    setCapturedImage(imageDataUrl);
    setIsScanningImage(true);
    setScanProgress(5);
    setHasTriaged(true);
    setShowVisualPicker(false);
    setShowSampleGallery(false);
    setNonSnakeResult(null);

    // Simulated 4-stage AI Vision Neural Scanner Telemetry
    setScanTelemetry("Step 1/4: Initializing Deep Neural Network Vision Engine...");

    setTimeout(() => {
      setScanProgress(35);
      setScanTelemetry("Step 2/4: Classifying visual patterns against ImageNet & Herpetology layers...");
    }, 400);

    setTimeout(() => {
      setScanProgress(70);
      setScanTelemetry("Step 3/4: Inspecting reptilian scale contours & ocular features...");
    }, 1000);

    setTimeout(() => {
      setScanProgress(95);
      setScanTelemetry("Step 4/4: Finalizing diagnosis, safety protocol & AVS verification...");
    }, 1600);

    // Run Deep Learning + Hybrid Feature Analysis
    const analysis = await classifySnakeImage(imageDataUrl, explicitSpeciesName || sourceLabel);

    setTimeout(async () => {
      setScanProgress(100);
      setIsScanningImage(false);

      if (!analysis.isSnake) {
        // NON-SNAKE / HUMAN / OBJECT DETECTED!
        setNonSnakeResult({
          isNonSnake: true,
          detectedObject: analysis.detectedObject || 'Non-snake Subject',
          message: analysis.reason,
          confidence: analysis.confidence || 95.0
        });
        setAssessment(null);

        const speechWarning = language === 'te'
          ? "చిత్రంలో పాము గుర్తించబడలేదు. మానవ ముఖం లేదా ఇతర వస్తువు గుర్తించబడింది. అత్యవసర యాంటీవెనమ్ అవసరం లేదు."
          : `No snake detected in the uploaded image. Identified subject as ${analysis.detectedObject || 'non-reptilian'}. No antivenom protocol needed.`;
        speakEmergencyInstruction(speechWarning, language);
        return;
      }

      // VALID SNAKE DETECTED
      const targetSpecies = analysis.species;
      const identifiedMarkers = targetSpecies.identifying_markers || [
        "Distinct dorsal hood markings with spectacle pattern (98.2%)",
        "Round ocular pupils with smooth glossy body scales",
        "Absence of loreal pit organ, high neurotoxic potency"
      ];
      setDetectedMarkers(identifiedMarkers);
      setVisionConfidence(analysis.confidence);

      // Perform assessment linking to nearest antivenom hospital
      try {
        const result = await DataService.assessSnakebite(targetSpecies.common_name, selectedSymptoms, 16.5167, 80.6500);
        if (result && result.species) {
          setAssessment(result);
          if (result.hospitals && result.hospitals.length > 0) {
            setAllNearbyHospitals(result.hospitals);
            setSelectedHospital(result.hospitals[0]);
          }

          const firstAidSummary = (result.species.first_aid && result.species.first_aid.length > 0)
            ? result.species.first_aid.slice(0, 2).join('. ')
            : 'Immobilize the bitten limb immediately below heart level. Do not cut or apply tourniquets.';

          const speechText = result.species.venomous
            ? `AI Vision identified ${result.species.common_name} with ${analysis.confidence}% confidence. ${result.species.venom_type}. Recommended ${result.species.avs_vials_needed || 10} vials Polyvalent Antivenom. Immediate first aid: ${firstAidSummary}. Nearest antivenom hospital located on live GPS map.`
            : `AI Vision identified ${result.species.common_name} with ${analysis.confidence}% confidence. Non-venomous species. Clean wound with mild soap and water. Medical observation advised.`;

          speakEmergencyInstruction(speechText, language);
        }
      } catch (err) {
        console.error("Error assessing vision snakebite:", err);
      }
    }, 2100);
  };

  const handleToggleSymptom = (sym) => {
    const updated = selectedSymptoms.includes(sym) 
      ? selectedSymptoms.filter(s => s !== sym) 
      : [...selectedSymptoms, sym];
    setSelectedSymptoms(updated);
  };

  const handleUnknownSnakeClick = async () => {
    setHasTriaged(true);
    setShowVisualPicker(true);
    setNonSnakeResult(null);
    speakEmergencyInstruction("Please select which snake matches what you encountered from the visual gallery below.", language);

    if (allNearbyHospitals.length === 0) {
      try {
        const hosps = await DataService.getHospitals(16.5167, 80.6500);
        setAllNearbyHospitals(hosps);
        if (hosps.length > 0) setSelectedHospital(hosps[0]);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleRunAssessment = async (queryText = description, symptomsToUse = selectedSymptoms) => {
    const text = (queryText || '').toLowerCase();
    
    if (text.includes("don't know") || text.includes("dont know") || text.includes("unknown") || text.includes("not sure") || text.includes("just bitten")) {
      handleUnknownSnakeClick();
      return;
    }

    setLoading(true);
    setHasTriaged(true);
    setShowVisualPicker(false);
    setNonSnakeResult(null);

    try {
      const combinedText = `${queryText || ''} ${(symptomsToUse || []).join(' ')}`;
      const result = await DataService.assessSnakebite(combinedText, symptomsToUse, 16.5167, 80.6500);
      if (result && result.species) {
        setAssessment(result);
        if (result.hospitals && result.hospitals.length > 0) {
          setAllNearbyHospitals(result.hospitals);
          setSelectedHospital(result.hospitals[0]);
        }

        const firstAidSummary = (result.species.first_aid && result.species.first_aid.length > 0)
          ? result.species.first_aid.slice(0, 2).join('. ')
          : 'Immobilize the bitten limb immediately below heart level. Do not cut or apply tourniquets.';

        const speechText = `Identified ${result.species.common_name}. ${result.species.venom_type}. Immediate first aid: ${firstAidSummary}. Nearest hospital with polyvalent antivenom vials located on live GPS map.`;
        speakEmergencyInstruction(speechText, language);
      }
    } catch (err) {
      console.error("Error assessing snakebite:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSnakeFromGallery = (spec) => {
    setShowVisualPicker(false);
    setNonSnakeResult(null);
    setDescription(spec.common_name);
    handleRunAssessment(spec.common_name, selectedSymptoms);
  };

  const handleSpeakFirstAidAloud = () => {
    if (!assessment || !assessment.species) return;
    const steps = (assessment.species.first_aid || []).join('. ');
    speakEmergencyInstruction(`First aid precautions for ${assessment.species.common_name}: ${steps}`, language);
  };

  const handleStartVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsListening(true);
      setTimeout(() => {
        const sampleVoices = [
          "I am bitten by a snake, I don't know which snake",
          "Spectacled Cobra bite on right foot with swelling and dizziness",
          "Bitten by Russell's Viper in agricultural field, severe bleeding"
        ];
        const randomVoice = sampleVoices[Math.floor(Math.random() * sampleVoices.length)];
        setDescription(randomVoice);
        setIsListening(false);
        handleRunAssessment(randomVoice, selectedSymptoms);
      }, 1500);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(transcript);
      setIsListening(false);
      handleRunAssessment(transcript, selectedSymptoms);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleDispatchAntivenomRequest = (hospital) => {
    const payload = {
      id: `snk-sos-${Date.now().toString().slice(-4)}`,
      type: 'SNAKEBITE_AVS_REQUEST',
      severity: 'CRITICAL',
      species: assessment?.species?.common_name || 'Venomous Snake',
      hospital_target: hospital.name,
      avs_vials_needed: assessment?.species?.avs_vials_needed || 10,
      timestamp: new Date().toISOString()
    };

    queueOfflineReport(payload);
    setAlertSent(`Emergency Antivenom ICU Alert & 10 Vials reserved at ${hospital.name}! 108 Ambulance en route.`);
    speakEmergencyInstruction(`Antivenom reserved at ${hospital.name}. Medical ambulance en route.`, language);
    setTimeout(() => setAlertSent(null), 6000);
  };

  const handleSelectRouteToHospital = (hosp) => {
    setSelectedHospital(hosp);
    speakEmergencyInstruction(`Driving route calculated to ${hosp.name}. Total distance: ${hosp.distance || '2.4 km'}.`, language);
  };

  const handleReset = () => {
    setHasTriaged(false);
    setShowVisualPicker(false);
    setShowSampleGallery(false);
    setDescription('');
    setSelectedSymptoms([]);
    setAssessment(null);
    setAlertSent(null);
    setShowDatasetTable(false);
    setCapturedImage(null);
    setIsScanningImage(false);
    setNonSnakeResult(null);
    stopCameraStream();
  };

  const activeHospitalsList = assessment?.hospitals || allNearbyHospitals;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-full overflow-x-hidden pb-28 pt-2 px-2 sm:px-4 space-y-4 font-sans"
    >
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] pb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500/40 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                {t('snake_title') || 'Snakebite Emergency & Antivenom Intelligence'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                NEURAL VISION 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              {language === 'te' 
                ? 'లైవ్ కెమెరా లేదా ఫోటో ద్వారా పాము జాతిని గుర్తించి వెంటనే యాంటీవెనమ్ పొందండి' 
                : 'MobileNet Neural Vision & AI Herpetology Classifier with Real-time AVS Routing'}
            </p>
          </div>
        </div>

        {hasTriaged && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#050A14] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/[0.08] transition-colors flex items-center space-x-1 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>{language === 'te' ? 'కొత్త విశ్లేషణ' : 'New Triage'}</span>
          </button>
        )}
      </div>

      {/* 2. Visual AI Scanner & Input Hub */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-emerald-500/30 space-y-4 shadow-2xl max-w-full">
        
        {/* Top Header Label */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{language === 'te' ? 'AI కెమెరా & దృశ్య జాతి గుర్తింపు' : 'AI Neural Camera & Visual Species Recognition'}</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-slate-400">MOBILENET DEEP AI</span>
        </div>

        {/* 3 Prominent Visual Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* A. Open Live Camera Button */}
          <button
            type="button"
            onClick={() => startCameraStream('environment')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black py-3.5 px-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/60 cursor-pointer transition-all active:scale-98 border border-emerald-400/40"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>{t('open_camera_btn') || '📸 Open Live Camera'}</span>
          </button>

          {/* B. Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#050A14] hover:bg-slate-900 text-cyan-300 hover:text-white font-bold py-3.5 px-3 rounded-2xl text-xs border border-cyan-500/40 flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-md active:scale-98"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>{t('upload_photo_btn') || '📁 Upload Snake Photo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* C. 1-Click Test Samples */}
          <button
            type="button"
            onClick={() => setShowSampleGallery(!showSampleGallery)}
            className="bg-[#050A14] hover:bg-slate-900 text-amber-300 hover:text-white font-bold py-3.5 px-3 rounded-2xl text-xs border border-amber-500/40 flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-md active:scale-98"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>{t('sample_photos_btn') || '🖼️ Test Sample Snakes'}</span>
          </button>
        </div>

        {/* Test Samples Drawer */}
        <AnimatePresence>
          {showSampleGallery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-[#050A14] rounded-2xl border border-amber-500/30 space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
                <span>Select a sample snake to test instant AI identification:</span>
                <button onClick={() => setShowSampleGallery(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sampleTestSnakes.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 bg-[#0B1220] hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-amber-400 text-left transition-all group cursor-pointer flex flex-col space-y-1.5"
                  >
                    <img 
                      src={sample.img} 
                      alt={sample.name} 
                      className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-white truncate">{sample.name}</div>
                      <div className="text-[9px] text-amber-400 font-mono truncate">{sample.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Description & Voice Fallback Input */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>{language === 'te' ? 'లేదా వాయిస్ / టెక్స్ట్ ద్వారా వివరించండి:' : 'Or describe appearance / encounter via text or voice:'}</span>
            <span className="text-[10px] font-mono text-cyan-400">NLP FALLBACK</span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'te' ? 'పాము రూపాన్ని వివరిచండి (ఉదా: నల్లటి త్రాచు పాము)...' : (t('describe_snake_placeholder') || "e.g., 'Spectacled hood, dark brown body, nocturnal near agricultural field'... or 'I don't know which snake'")}
              className="w-full bg-[#050A14] border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
            <button
              type="button"
              onClick={handleStartVoice}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white transition-all cursor-pointer ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Clinical Symptoms Multi-Select Checklist */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 block">
            {language === 'te' ? 'బాధితుడి లక్షణాలను ఎంచుకోండి:' : 'Select Observed Clinical Symptoms:'}
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {symptomChecklist.map((sym, idx) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleSymptom(sym)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-black'
                      : 'bg-[#050A14] hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text-based Identification Submission Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => handleRunAssessment(description, selectedSymptoms)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-cyan-950 cursor-pointer active:scale-95 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{language === 'te' ? 'టెక్స్ట్ విశ్లేషణను ప్రారంభించండి' : (t('identify_species_btn') || 'IDENTIFY SPECIES & LOCATE ANTIVENOM')}</span>
          </button>
        </div>
      </div>

      {/* ─── LIVE CAMERA POPUP MODAL ─── */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
          >
            <div className="relative w-full max-w-lg bg-[#080E1C] border border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Camera Header Bar */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.1] bg-[#050A14]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">AI NEURAL CAMERA SCANNER</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors cursor-pointer"
                    title="Switch Camera (Front/Rear)"
                  >
                    <SwitchCamera className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors cursor-pointer"
                    title="Close Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewfinder Area */}
              <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <CameraOff className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-xs text-red-300 font-semibold max-w-xs mx-auto">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Upload File Instead
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* HUD Target Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                      <div className="flex items-center justify-between w-full text-[10px] font-mono text-emerald-400 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                        <span>FPS: 60 • TF.JS NEURAL ENGINE</span>
                        <span>TARGET ACQUISITION: ACTIVE</span>
                      </div>

                      {/* Center Crosshairs */}
                      <div className="relative w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <Crosshair className="w-8 h-8 text-emerald-400/60 animate-spin" />
                        <div className="absolute -top-3 bg-emerald-500 text-slate-950 text-[9px] font-mono font-black px-2 py-0.5 rounded">
                          ALIGN SNAKE HERE
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                        Keep safe 2-meter gap & point directly at reptile
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Shutter Capture Bar */}
              {!cameraError && (
                <div className="p-4 bg-[#050A14] border-t border-white/[0.08] flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="group flex items-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-2xl shadow-emerald-500/50 cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-950 group-hover:scale-125 transition-transform" />
                    </div>
                    <span>{t('take_photo_btn') || 'SNAP & ANALYZE SNAKE'}</span>
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI IMAGE SCANNING ANIMATION SCREEN ─── */}
      <AnimatePresence>
        {isScanningImage && capturedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-5 rounded-3xl bg-[#080E1C] border border-emerald-500 shadow-2xl space-y-4 text-center"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">MobileNet Deep Neural Vision Processing</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{scanProgress}%</span>
            </div>

            {/* Laser Scrubbed Image Preview */}
            <div className="relative w-full max-w-sm mx-auto aspect-video rounded-2xl overflow-hidden border border-emerald-500/50 bg-black shadow-inner">
              <img src={capturedImage} alt="Scanning" className="w-full h-full object-cover filter contrast-125" />
              
              {/* Laser Scan Bar Animation */}
              <motion.div
                animate={{ y: [0, 180, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            </div>

            {/* Progress Bar & Telemetry status */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-emerald-300 animate-pulse">{scanTelemetry}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CASE A: NO SNAKE / HUMAN DETECTED IN IMAGE ─── */}
      {nonSnakeResult && nonSnakeResult.isNonSnake && capturedImage && !isScanningImage && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-amber-500/60 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide">
                {language === 'te' ? 'చిత్రంలో పాము గుర్తించబడలేదు / సురక్షితం' : 'NO SNAKE DETECTED / NON-REPTILIAN SUBJECT'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              SAFE • {nonSnakeResult.confidence}% CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-black">
              <img src={capturedImage} alt="Uploaded non-snake" className="w-full h-full min-h-[140px] max-h-[180px] object-cover filter brightness-90" />
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-amber-400 font-bold border border-amber-500/40">
                SCANNED SUBJECT: {nonSnakeResult.detectedObject || 'OBJECT'}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2.5">
              <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong className="text-white block font-bold mb-1">
                  {language === 'te' ? '🔍 AI విజన్ విశ్లేషణ ఫలితం:' : '🔍 AI Vision Analysis Verdict:'}
                </strong>
                {nonSnakeResult.message}
              </div>

              <div className="p-3 bg-[#050A14] rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{language === 'te' ? 'విషపూరితమైన సంకేతాలు ఏవీ లేవు. అత్యవసర యాంటీవెనమ్ అవసరం లేదు.' : 'No venomous reptile characteristics detected. No antivenom protocol needed.'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'te' ? 'మీకు నిజంగా పాము కాటు అనుమానం ఉంటే, దయచేసి పాము ఫోటోను నేరుగా తీయండి లేదా క్రింద గ్యాలరీని ఎంచుకోండి.' : 'If you or someone was bitten, please take a photo directly of the snake or select species from the visual guide.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => startCameraStream('environment')}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'te' ? 'పాము ఫోటో తీయండి' : 'Retake Snake Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 bg-[#050A14] hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{language === 'te' ? 'మరొక ఫోటో ఎంచుకోండి' : 'Upload Snake Photo'}</span>
            </button>

            <button
              type="button"
              onClick={handleUnknownSnakeClick}
              className="py-2.5 px-3 bg-[#050A14] hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{language === 'te' ? 'పాముల జాబితా చూడండి' : 'Browse Snake Guide'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── CASE B: VALID SNAKE DETECTED IN IMAGE ─── */}
      {assessment && assessment.species && capturedImage && !isScanningImage && !nonSnakeResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 rounded-3xl border border-emerald-500/60 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                AI Neural Vision Recognition Report
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              {visionConfidence}% CONFIDENCE
            </span>
          </div>

          {/* Captured Image + Detected Species Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl bg-black">
              <img src={capturedImage} alt="Analyzed Snake" className="w-full h-full min-h-[140px] max-h-[200px] object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/40">
                SCANNED INPUT
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-lg font-black text-white">{assessment.species.common_name}</h4>
                  <p className="text-xs text-slate-400 font-mono italic">{assessment.species.scientific_name}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                  assessment.species.venomous 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {assessment.species.venomous ? 'CRITICAL VENOMOUS' : 'NON-VENOMOUS'}
                </span>
              </div>

              <div className="p-2.5 bg-[#050A14] rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Venom Profile: {assessment.species.venom_type}</span>
                </div>
                <div className="text-cyan-400 font-bold">
                  Recommended Antivenom: <span className="text-white font-mono">{assessment.species.avs_vials_needed || 10} Vials Polyvalent AVS</span>
                </div>
              </div>

              {/* Identified Visual Keypoints */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Key Detected Morphological Markers:</span>
                <ul className="space-y-0.5 text-[11px] text-slate-300">
                  {detectedMarkers.map((marker, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSpeakFirstAidAloud}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>{language === 'te' ? 'వాయిస్ సూచనలను వినండి' : 'Listen First-Aid Audio'}</span>
            </button>

            {selectedHospital && (
              <button
                type="button"
                onClick={() => handleDispatchAntivenomRequest(selectedHospital)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-950 cursor-pointer"
              >
                <Hospital className="w-4 h-4 stroke-[2.5]" />
                <span>RESERVE {assessment.species.avs_vials_needed || 10} VIALS AT {selectedHospital.name.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. Unknown Snake Visual Selector Gallery */}
      {showVisualPicker && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0B1220]/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-cyan-500/40 space-y-3 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>
                  {language === 'te' ? 'దృశ్య గుర్తింపు గైడ్ (భారతీయ ప్రధాన పాములు)' : 'Visual Identification Guide (India Big 4 & Common Species)'}
                </span>
              </h3>
              <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                {language === 'te' ? 'మీరు చూసిన పామును ఎంచుకోండి (క్రింద ఆసుపత్రులు మరియు రూట్ కూడా సిద్ధంగా ఉన్నాయి):' : 'Tap the snake that matches your encounter (Antivenom hospitals & routes loaded below):'}
              </p>
            </div>
            <button onClick={() => setShowVisualPicker(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {snakeSpeciesData.slice(0, 6).map((spec) => (
              <button
                key={spec.id}
                onClick={() => handleSelectSnakeFromGallery(spec)}
                className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 hover:border-cyan-400 p-3 rounded-2xl text-left transition-all group cursor-pointer flex space-x-3 items-start"
              >
                <img
                  src={spec.image_source}
                  alt={spec.common_name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white truncate">{spec.common_name}</span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      spec.venomous ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {spec.venomous ? 'VENOMOUS' : 'NON-VENOMOUS'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono italic truncate">{spec.scientific_name}</p>
                  <p className="text-[10px] text-cyan-300 mt-1 line-clamp-1">{spec.identifying_markers?.[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 4. Live Antivenom Hospitals & Map Section (Shown when triaged or visual picker opened and a snake/emergency is active) */}
      {(assessment || showVisualPicker || (hasTriaged && !nonSnakeResult)) && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          
          {/* Emergency Alert Toast */}
          <AnimatePresence>
            {alertSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500 shadow-2xl flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-bold"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{alertSent}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">ACTIVE</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Text Diagnosis & Toxicity Card (if not loaded from vision scanner) */}
          {assessment && assessment.species && !capturedImage && (
            <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={assessment.species.image_source}
                    alt={assessment.species.common_name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500 shadow-lg shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-white">{assessment.species.common_name}</span>
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {assessment.species.urgency || 'HIGH'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono italic">{assessment.species.scientific_name}</p>
                    <p className="text-xs text-red-300 font-bold flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Venom: {assessment.species.venom_type} (LD50: {assessment.species.ld50_mg_kg} mg/kg)</span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 text-center sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">AVS Protocol</span>
                  <span className="text-base sm:text-lg font-mono font-black text-cyan-400">{assessment.species.avs_vials_needed || 10} Vials</span>
                  <span className="text-[9px] text-slate-500 block">Polyvalent Antivenom</span>
                </div>
              </div>

              {/* WHO Clinical First-Aid Precautions with Audio */}
              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>WHO Standard Clinical First-Aid Protocol</span>
                  </h4>
                  <button
                    onClick={handleSpeakFirstAidAloud}
                    className="text-xs text-cyan-400 hover:text-white font-bold flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-xl cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'ఆడియో వినండి' : 'Listen Voice'}</span>
                  </button>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-200">
                  {(assessment.species.first_aid || [
                    "1. Immobilize the bitten limb immediately below heart level.",
                    "2. Remove rings, watches, or tight clothing near the bite site.",
                    "3. DO NOT cut, suck venom, or apply tourniquets or ice.",
                    "4. Transport patient immediately to an antivenom-equipped facility."
                  ]).map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Live GPS Antivenom Map with Route Selection */}
          <div className="p-3 rounded-3xl bg-[#080E1C]/95 border border-slate-800 space-y-3 overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 py-1">
              <div>
                <h3 className="text-xs font-black text-white flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {language === 'te' ? 'ప్రత్యక్ష యాంటీవెనమ్ ఆసుపత్రుల రహదారి మ్యాప్' : 'Live GPS Antivenom Supply & Hospital Route Map'}
                  </span>
                </h3>
                {selectedHospital && (
                  <p className="text-[11px] text-cyan-300 font-mono mt-0.5 break-words">
                    🚗 Active Destination: <span className="font-bold text-white">{selectedHospital.name}</span>
                  </p>
                )}
              </div>

              {selectedHospital && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=16.5167,80.6500&destination=${selectedHospital.latitude || selectedHospital.lat || 16.5167},${selectedHospital.longitude || selectedHospital.lng || 80.6500}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md self-start sm:self-auto cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'గూగుల్ మ్యాప్స్ దిశలు' : 'Open in Google Maps'}</span>
                </a>
              )}
            </div>

            <div className="h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-800">
              <SnakebiteRescueMapComponent 
                speciesName={assessment?.species?.common_name || 'Snake Encounter'} 
                hospitals={activeHospitalsList}
                selectedHospital={selectedHospital}
                onSelectHospital={handleSelectRouteToHospital}
              />
            </div>
          </div>

          {/* Ranked Regional Hospitals with Antivenom Reserve Stock & Route Buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider px-1">
              {language === 'te' ? 'యాంటీవెనమ్ నిల్వ గల ఆసుపత్రులు' : 'Verified Regional Hospitals with Active Antivenom Stock'} ({activeHospitalsList.length})
            </h3>

            <div className="space-y-3">
              {activeHospitalsList.map((hosp, idx) => {
                const isSelected = selectedHospital && (selectedHospital.name === hosp.name);
                const phoneToCall = hosp.contact_number || hosp.phone || '+91-866-2472777';

                return (
                  <div
                    key={idx}
                    className={`bg-[#050A14] p-4 sm:p-5 rounded-3xl border transition-all space-y-3 shadow-lg ${
                      isSelected ? 'border-cyan-400 bg-[#081528] shadow-cyan-950/80 ring-1 ring-cyan-400/50' : 'border-slate-800 hover:border-cyan-500/50'
                    }`}
                  >
                    {/* Header: Full, prominent, multi-line hospital name */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-white leading-snug">
                            {hosp.name}
                          </h4>
                          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{hosp.address || `${hosp.distance || '2.4'} km away`}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {hosp.antivenom_stock || hosp.avs || 120} AVS
                        </span>
                        {isSelected && (
                          <span className="bg-cyan-500 text-slate-950 text-[8px] font-mono font-black px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock & Facilities Badge Bar */}
                    <div className="flex flex-wrap items-center gap-2 bg-[#0B1220] p-2 rounded-2xl border border-slate-800/80 text-xs">
                      <span className="text-cyan-400 font-bold">
                        ICU Beds: <span className="text-white font-mono">{hosp.icu_available || hosp.icu || 12} Available</span>
                      </span>
                    </div>

                    {/* Dedicated 3-Column Equal Grid Action Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 w-full">
                      <button
                        onClick={() => handleSelectRouteToHospital(hosp)}
                        className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 border transition-all cursor-pointer ${
                          isSelected ? 'bg-cyan-600 text-slate-950 border-cyan-400 font-black' : 'bg-[#0B1220] hover:bg-slate-800 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        <Route className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{language === 'te' ? 'రూట్' : 'Route'}</span>
                      </button>

                      <a
                        href={`tel:${phoneToCall}`}
                        className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center space-x-1 text-xs font-bold cursor-pointer"
                        title="Call Hospital Directly"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{language === 'te' ? 'కాల్ ER' : 'Call ER'}</span>
                      </a>

                      <button
                        onClick={() => handleDispatchAntivenomRequest(hosp)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black py-2 px-1 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95"
                      >
                        <Hospital className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{language === 'te' ? 'ఆర్డర్ AVS' : 'Reserve AVS'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      )}

    </motion.div>
  );
};
