import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hospital, Navigation, Phone, CheckCircle2, Clock, 
  ShieldAlert, Play, Pause, Volume2, VolumeX, Maximize2, 
  ExternalLink, Activity, Droplet, Zap, Radio
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

export const LiveHospitalResponse = ({
  emergencyType = 'ACCIDENT_RESCUE',
  hospitalName = 'Government General Hospital (GGH Vijayawada)',
  hospitalPhone = '+91-866-2472777',
  etaMinutes = 4,
  distanceKm = 1.8,
  onClose = null
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  // Map emergency type to the 3 newly added realistic videos
  const videoConfig = React.useMemo(() => {
    const type = (emergencyType || '').toUpperCase();
    if (type.includes('SNAKE')) {
      return {
        src: '/videos/farmer_antivenom_rescue.mp4',
        title: 'Farmer Emergency Antivenom Rescue & Medical Treatment',
        badge: 'AVS TOXICOLOGY DISPATCH',
        resources: '150 Polyvalent Antivenom Vials Verified • Infusion Bay #2 Ready • Cold-Chain Courier En Route',
        team: 'Toxicology On-Call: Dr. R. Verma • Rapid Response Paramedics',
        color: '#00D9FF'
      };
    }
    if (type.includes('BLOOD')) {
      return {
        src: '/videos/donor_blood_hospital_delivery.mp4',
        title: 'Emergency Donor Matching & Hospital Blood Delivery',
        badge: 'UNIVERSAL BLOOD MATRIX',
        resources: '12 Compatible O- Units Matched • Cryo-Storage Verified • Direct Delivery to Operating Theatre',
        team: 'Blood Bank Director: Dr. M. Rao • Certified Cryo-Courier',
        color: '#FFB020'
      };
    }
    return {
      src: '/videos/motorbike_accident_rescue.mp4',
      title: 'Motorbike Accident Emergency Rescue & Trauma Bay Intake',
      badge: 'ALS TRAUMA DISPATCH',
      resources: 'Trauma Bay #1 Reserved • ICU Ventilator Bed #4 Ready • Hydraulic Rescue Extraction ALS 101 Dispatched',
      team: 'Trauma ICU Lead: Dr. Sarah Jenkins, MD • 2 ALS Flight Paramedics',
      color: '#FF3B4D'
    };
  }, [emergencyType]);

  // Voice announcement on response mount
  useEffect(() => {
    speakEmergencyInstruction(`Hospital dispatch accepted by ${hospitalName}. Live rescue mission in progress.`);
  }, [hospitalName]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className="w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border border-emerald-500/50 shadow-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden animate-in fade-in slide-in-from-top-3">
      
      {/* Background Pulse Glow */}
      <div 
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: videoConfig.color }}
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
            <Hospital className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                HOSPITAL DISPATCH CONFIRMED & ACCEPTED
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              {hospitalName}
            </h3>
          </div>
        </div>

        {/* Live ER Contact & Navigation */}
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${hospitalPhone}`}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-red-950/60 min-h-[38px] cursor-pointer transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call ER Direct</span>
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=16.5167,80.6500`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#050A14] hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 min-h-[38px] cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Route GPS</span>
          </a>
        </div>
      </div>

      {/* Hospital Real-Time Allocation Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 text-xs">
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Allocated Critical Resources:</div>
          <p className="font-bold text-emerald-300 leading-relaxed">{videoConfig.resources}</p>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Assigned Medical Response Team:</div>
          <p className="font-bold text-cyan-300 leading-relaxed">{videoConfig.team}</p>
        </div>
      </div>

      {/* Realistic Live Video Stream Player (Matching the 3 Added Videos) */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl group">
        
        {/* Top Video HUD Badge */}
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-[10px] font-mono font-black text-white flex items-center space-x-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span style={{ color: videoConfig.color }}>{videoConfig.badge}</span>
        </div>

        <div className="absolute top-3 right-3 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-cyan-300 flex items-center space-x-1 shadow-lg">
          <Clock className="w-3 h-3" />
          <span>ETA: {etaMinutes} MINS ({distanceKm} km)</span>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoConfig.src}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-64 sm:h-80 object-cover"
        />

        {/* Bottom Playback Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-white border border-slate-700 cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-white border border-slate-700 cursor-pointer transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">
              {videoConfig.title}
            </span>
          </div>

          <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE RESCUE STREAM</span>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-30">
          <div 
            className="h-full transition-all duration-100" 
            style={{ width: `${videoProgress}%`, backgroundColor: videoConfig.color }} 
          />
        </div>
      </div>

    </div>
  );
};
