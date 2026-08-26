import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// ══════════════════════════════════════════════════════════════════════════════
// OFFICIAL SURVEY OF INDIA HIGH-FIDELITY VECTOR OUTLINE
// 100% geographically authentic national boundary
// Captures Kashmir, Ladakh, Aksai Chin, Uttarakhand, Sikkim, Arunachal Pradesh,
// 7 Sisters, Sundarbans, Coromandel, Kanyakumari, Malabar, Konkan & Gujarat Rann of Kutch
// ══════════════════════════════════════════════════════════════════════════════
const INDIA_PATH = `M 217.3,65.5 L 225.0,66.1 L 243.4,54.8 L 252.9,54.5 L 257.4,56.5 L 259.9,62.2 L 265.7,63.0 L 266.8,66.9 L 269.7,63.6 L 273.7,65.7 L 267.2,82.7 L 261.5,84.5 L 261.7,87.7 L 256.1,88.3 L 258.0,93.1 L 254.1,98.3 L 244.0,98.9 L 248.0,106.3 L 244.4,106.7 L 245.0,112.0 L 248.3,116.0 L 254.2,116.2 L 252.7,120.3 L 256.9,127.5 L 245.6,135.0 L 241.1,127.1 L 234.4,130.7 L 241.9,142.5 L 241.9,157.6 L 248.1,154.4 L 254.5,164.0 L 263.1,165.1 L 270.4,169.7 L 270.0,173.7 L 285.8,181.1 L 272.8,192.1 L 271.5,204.0 L 267.2,212.4 L 289.3,222.7 L 291.4,227.7 L 302.5,233.8 L 306.1,232.3 L 313.5,237.7 L 318.5,236.7 L 319.1,241.6 L 330.4,245.4 L 331.8,242.1 L 341.1,245.0 L 340.7,242.8 L 346.7,241.3 L 355.8,245.2 L 356.3,251.6 L 366.9,255.5 L 367.4,258.0 L 375.5,255.5 L 379.8,262.2 L 389.2,261.1 L 397.0,265.4 L 403.6,261.8 L 408.9,267.1 L 419.6,264.0 L 421.9,266.7 L 425.4,258.4 L 421.5,250.0 L 425.6,235.2 L 424.0,232.4 L 434.2,228.0 L 439.1,233.8 L 436.6,240.2 L 439.6,246.2 L 436.3,249.5 L 443.9,256.9 L 458.0,259.2 L 467.7,254.8 L 474.7,257.7 L 500.9,256.0 L 502.2,246.3 L 500.1,242.1 L 493.0,242.0 L 492.8,235.9 L 498.3,236.9 L 504.5,233.1 L 508.7,235.2 L 514.0,231.1 L 513.0,227.3 L 517.7,226.2 L 527.6,216.0 L 543.9,210.1 L 545.9,208.0 L 544.5,205.2 L 551.0,202.0 L 563.4,207.1 L 578.8,200.1 L 583.7,204.3 L 581.4,207.7 L 584.2,206.1 L 590.1,214.4 L 585.7,219.5 L 587.5,221.1 L 591.7,217.1 L 595.8,222.8 L 604.3,226.1 L 605.0,230.4 L 595.1,239.3 L 600.0,250.6 L 591.5,244.5 L 582.2,246.5 L 561.2,261.1 L 559.5,264.8 L 561.9,273.1 L 556.3,284.3 L 551.2,288.0 L 552.7,298.2 L 541.8,322.2 L 525.7,317.0 L 526.8,337.9 L 525.0,340.7 L 521.7,339.9 L 523.2,357.1 L 517.4,364.2 L 513.4,359.5 L 511.5,363.4 L 505.2,325.0 L 498.9,324.7 L 499.2,330.3 L 495.1,334.2 L 496.6,338.8 L 492.3,342.2 L 489.1,335.1 L 487.0,338.6 L 483.4,327.4 L 487.6,316.4 L 491.7,317.2 L 494.8,313.4 L 497.8,315.8 L 498.2,311.4 L 503.0,309.6 L 504.3,299.0 L 509.5,299.5 L 508.1,296.1 L 501.0,292.6 L 469.4,293.6 L 457.6,290.3 L 458.5,275.9 L 454.5,269.5 L 452.5,275.4 L 448.2,274.5 L 444.3,271.7 L 443.0,265.9 L 439.4,265.7 L 442.2,269.4 L 434.7,268.9 L 436.3,267.0 L 429.5,260.9 L 428.2,264.1 L 432.0,266.8 L 425.2,271.4 L 423.8,278.8 L 432.3,285.6 L 437.6,285.2 L 441.4,290.9 L 439.7,293.1 L 430.4,292.1 L 429.5,298.0 L 424.4,298.2 L 421.9,304.1 L 428.3,310.4 L 436.1,312.7 L 436.8,319.2 L 433.0,321.9 L 432.6,326.5 L 437.4,329.9 L 435.8,335.2 L 441.2,336.1 L 438.2,340.7 L 443.2,359.5 L 441.0,365.2 L 443.2,370.9 L 439.7,371.1 L 438.5,367.8 L 438.3,371.4 L 435.8,370.0 L 436.9,362.6 L 434.2,361.2 L 432.6,367.0 L 430.7,365.2 L 430.5,371.5 L 427.1,368.8 L 426.6,372.6 L 425.8,359.6 L 422.1,358.0 L 425.5,360.6 L 417.9,369.6 L 404.0,373.1 L 400.5,377.5 L 398.9,382.0 L 401.7,388.9 L 399.7,389.9 L 403.6,391.1 L 397.0,395.2 L 398.1,398.7 L 395.9,400.5 L 398.3,399.4 L 390.0,408.1 L 364.0,420.4 L 346.2,444.3 L 335.1,450.5 L 328.4,460.1 L 310.7,472.3 L 310.7,482.9 L 299.1,488.5 L 290.4,488.8 L 284.0,501.6 L 278.9,497.7 L 270.9,502.4 L 266.6,515.6 L 272.5,555.1 L 268.8,573.2 L 261.0,590.7 L 263.4,620.7 L 251.9,621.8 L 244.3,638.8 L 249.9,643.4 L 231.9,649.2 L 228.1,663.4 L 217.9,670.0 L 207.4,663.9 L 198.3,651.8 L 200.7,649.7 L 198.2,651.0 L 194.6,641.5 L 193.0,626.8 L 185.1,602.7 L 178.8,589.8 L 172.1,583.3 L 164.8,564.9 L 158.8,534.0 L 147.0,515.4 L 144.6,502.9 L 138.1,494.0 L 132.9,466.6 L 135.0,466.7 L 127.9,446.3 L 131.2,448.0 L 130.9,444.1 L 127.6,443.5 L 127.4,439.2 L 129.3,440.8 L 126.4,435.8 L 128.0,432.9 L 129.5,435.4 L 127.4,431.3 L 130.5,428.6 L 128.9,424.9 L 125.4,431.4 L 125.0,422.3 L 127.5,422.7 L 124.2,418.9 L 127.0,417.5 L 123.9,417.4 L 122.4,410.7 L 127.8,390.3 L 124.0,385.0 L 126.2,384.2 L 123.5,383.0 L 125.0,381.0 L 122.1,383.2 L 124.1,380.6 L 121.3,378.4 L 127.8,370.1 L 120.1,370.3 L 124.3,363.5 L 119.6,363.4 L 121.1,358.4 L 127.5,357.1 L 118.1,358.4 L 116.0,356.1 L 114.5,364.6 L 112.8,363.8 L 115.6,371.1 L 111.8,380.6 L 86.7,391.8 L 73.7,383.8 L 49.9,356.2 L 52.5,352.4 L 55.6,357.3 L 74.1,351.0 L 79.4,341.5 L 74.9,339.6 L 65.0,346.6 L 55.0,344.5 L 44.0,337.1 L 45.7,337.9 L 42.9,335.8 L 44.9,334.2 L 39.9,329.6 L 47.5,321.5 L 40.0,322.8 L 38.5,328.0 L 35.0,327.3 L 38.5,324.8 L 35.3,324.8 L 38.6,319.4 L 46.3,319.4 L 47.4,311.9 L 48.5,314.1 L 62.7,312.4 L 71.1,315.0 L 81.6,309.5 L 81.8,313.3 L 84.6,314.1 L 92.5,309.9 L 90.1,309.0 L 92.0,303.6 L 83.6,288.0 L 83.5,281.3 L 75.9,281.0 L 72.6,276.1 L 74.1,262.6 L 61.1,258.3 L 62.6,248.6 L 77.9,230.3 L 82.2,230.4 L 87.7,237.1 L 107.7,231.5 L 117.3,213.6 L 128.1,207.9 L 136.9,187.7 L 148.1,182.1 L 147.4,175.7 L 162.3,162.8 L 158.6,161.5 L 161.4,155.1 L 158.2,148.7 L 160.5,144.8 L 175.4,137.4 L 170.2,131.9 L 162.0,131.5 L 162.4,123.8 L 155.9,125.4 L 141.5,118.3 L 140.8,100.7 L 136.9,90.0 L 138.0,85.8 L 142.0,85.9 L 143.4,81.5 L 149.6,78.7 L 151.2,73.6 L 143.8,71.4 L 144.5,64.7 L 137.1,64.6 L 131.6,60.4 L 132.6,57.3 L 120.8,57.5 L 120.4,49.1 L 128.5,43.7 L 130.4,38.8 L 145.8,38.4 L 142.2,33.9 L 149.5,35.8 L 162.1,30.0 L 166.3,33.5 L 171.0,31.4 L 176.3,33.1 L 177.2,38.1 L 182.5,37.6 L 188.2,44.5 L 201.7,50.7 L 204.1,57.3 L 214.0,60.4 L 217.3,65.5 Z`;

const toSVG = (lon, lat) => ({
  x: 35 + (lon - 68.1720) * 19.5050,
  y: 700 - 30 - (lat - 8.0737) * 22.0508,
});

const CITIES = [
  { name: 'Srinagar',   lon: 74.8, lat: 34.1, type: 'hospital' },
  { name: 'Chandigarh', lon: 76.8, lat: 30.7, type: 'rescue' },
  { name: 'Delhi',      lon: 77.2, lat: 28.6, type: 'accident', pulse: true },
  { name: 'Jaipur',     lon: 75.8, lat: 26.9, type: 'blood' },
  { name: 'Lucknow',    lon: 80.9, lat: 26.8, type: 'accident', pulse: true },
  { name: 'Patna',      lon: 85.1, lat: 25.6, type: 'medical' },
  { name: 'Guwahati',   lon: 91.7, lat: 26.2, type: 'hospital' },
  { name: 'Ahmedabad',  lon: 72.6, lat: 23.0, type: 'blood' },
  { name: 'Bhopal',     lon: 77.4, lat: 23.3, type: 'accident', pulse: true },
  { name: 'Nagpur',     lon: 79.1, lat: 21.1, type: 'snakebite' },
  { name: 'Kolkata',    lon: 88.4, lat: 22.6, type: 'accident', pulse: true },
  { name: 'Mumbai',     lon: 72.9, lat: 19.1, type: 'accident', pulse: true },
  { name: 'Hyderabad',  lon: 78.5, lat: 17.4, type: 'hospital', you: true },
  { name: 'Bengaluru',  lon: 77.6, lat: 12.9, type: 'accident', pulse: true },
  { name: 'Chennai',    lon: 80.3, lat: 13.1, type: 'blood' },
  { name: 'Kochi',      lon: 76.3, lat:  9.9, type: 'hospital' },
];

const INCIDENTS = [
  { lon: 76.5, lat: 22.0, type: 'blood' },
  { lon: 81.0, lat: 24.5, type: 'medical' },
  { lon: 83.5, lat: 20.5, type: 'snakebite' },
  { lon: 74.5, lat: 20.5, type: 'rescue' },
  { lon: 78.0, lat: 15.5, type: 'blood' },
  { lon: 86.0, lat: 24.0, type: 'rescue' },
  { lon: 76.0, lat: 28.5, type: 'hospital' },
  { lon: 80.0, lat: 18.0, type: 'hospital' },
  { lon: 73.5, lat: 18.0, type: 'rescue' },
  { lon: 79.5, lat: 11.0, type: 'medical' },
];

const ROUTES = [
  [[77.2, 28.6], [80.9, 26.8], [85.1, 25.6]],
  [[77.2, 28.6], [75.8, 26.9], [72.6, 23.0]],
  [[77.4, 23.3], [79.1, 21.1], [78.5, 17.4]],
  [[85.1, 25.6], [88.4, 22.6]],
  [[72.9, 19.1], [78.5, 17.4], [77.6, 12.9]],
  [[78.5, 17.4], [80.3, 13.1], [77.6, 12.9]],
  [[77.6, 12.9], [76.3,  9.9]],
];

// ── Marker Icon ───────────────────────────────────────────────────────────────
const Marker = ({ type, pulse, you, r = 7 }) => {
  if (you) return (
    <g>
      <circle r={r + 8} fill="rgba(0,229,100,0.22)" className="animate-pulse" />
      <circle r={r + 3} fill="rgba(0,229,100,0.40)" className="animate-ping" />
      <circle r={r} fill="#00E564" stroke="#00FF80" strokeWidth="1.5" />
      <circle r={3} fill="#fff" />
    </g>
  );

  const map = {
    accident: { fill: '#FF2244', stroke: '#FF6677', label: '!' },
    blood:    { fill: '#CC1133', stroke: '#FF4466', label: '🩸' },
    snakebite:{ fill: '#008855', stroke: '#00CC77', label: '🐍' },
    medical:  { fill: '#6D28D9', stroke: '#A855F7', label: '+' },
    hospital: { fill: '#1D4ED8', stroke: '#60A5FA', label: 'H' },
    rescue:   { fill: '#0E7490', stroke: '#22D3EE', label: '🚑' },
  };
  const c = map[type] || map.accident;

  return (
    <g>
      {pulse && (
        <>
          <circle r={r + 8} fill={`${c.fill}22`} className="animate-ping" />
          <circle r={r + 4} fill={`${c.fill}33`} className="animate-ping" style={{ animationDelay: '0.4s' }} />
        </>
      )}
      <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      {type === 'hospital' ? (
        <text y="3" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#fff">H</text>
      ) : type === 'blood' ? (
        <text y="3" textAnchor="middle" fontSize="6.5" fill="#fff">🩸</text>
      ) : type === 'snakebite' ? (
        <text y="3" textAnchor="middle" fontSize="6.5" fill="#fff">🐍</text>
      ) : type === 'rescue' ? (
        <text y="3" textAnchor="middle" fontSize="6.5" fill="#fff">🚑</text>
      ) : type === 'medical' ? (
        <text y="3.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#fff">+</text>
      ) : (
        <text y="3.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff">!</text>
      )}
    </g>
  );
};

// ── Main Map Component ────────────────────────────────────────────────────────
export const HomepageLiveMap = ({ compact = false }) => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all',       label: language === 'te' ? 'అన్నీ' : language === 'hi' ? 'सभी' : 'All',       color: '#3B82F6' },
    { key: 'accident',  label: language === 'te' ? 'ప్రమాదం' : language === 'hi' ? 'दुर्घटना' : 'Accident',  color: '#FF2244', emoji: '🚗' },
    { key: 'blood',     label: language === 'te' ? 'రక్తం' : language === 'hi' ? 'रक्त' : 'Blood',     color: '#CC1133', emoji: '🩸' },
    { key: 'snakebite', label: language === 'te' ? 'పాము కాటు' : language === 'hi' ? 'सर्पदंश' : 'Snakebite', color: '#008855', emoji: '🐍' },
    { key: 'medical',   label: language === 'te' ? 'వైద్యం' : language === 'hi' ? 'चिकित्सा' : 'Medical',   color: '#6D28D9', emoji: '🏥' },
  ];

  const visCities = filter === 'all' ? CITIES : CITIES.filter(c => c.type === filter || c.you);
  const visInc    = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.type === filter);

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-[#020817] border border-cyan-500/20 shadow-2xl flex flex-col"
      style={{ minHeight: compact ? 440 : 540 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#030C1E]/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-white tracking-widest uppercase">{t('live_map_title') || 'Live Emergency Map'}</span>
          <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
        </div>
        <button className="text-[8px] font-bold text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded-lg hover:bg-cyan-500/10 transition-colors flex items-center gap-1 cursor-pointer">
          {language === 'te' ? 'పూర్తి మ్యాప్ ↗' : language === 'hi' ? 'पूरा नक्शा ↗' : 'View Full Map ↗'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/5 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold whitespace-nowrap transition-all cursor-pointer"
            style={filter === f.key
              ? { background: `${f.color}22`, border: `1px solid ${f.color}55`, color: f.color }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}>
            {f.emoji ? f.emoji + ' ' : '⊕ '}{f.label}
          </button>
        ))}
      </div>

      {/* Map + Sidebar row */}
      <div className="flex flex-1 min-h-0">

        {/* ── SVG India Map ── */}
        <div className="relative flex-1" style={{ background: 'radial-gradient(ellipse 80% 70% at 45% 40%, #061228 0%, #020817 100%)' }}>
          {/* Subtle star matrix */}
          <div className="absolute inset-0 pointer-events-none opacity-30"
            style={{ backgroundImage: 'radial-gradient(rgba(180,210,255,0.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Compass rose */}
          <div className="absolute top-2 left-2 opacity-75 z-10" style={{ width: 36, height: 36 }}>
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#1E3A60" strokeWidth="1.5" fill="#030C1E" />
              <polygon points="20,4 22.5,17 20,15 17.5,17" fill="#FF4444" />
              <polygon points="20,36 22.5,23 20,25 17.5,23" fill="#5a7a9a" />
              <polygon points="4,20 17,17.5 15,20 17,22.5" fill="#5a7a9a" />
              <polygon points="36,20 23,17.5 25,20 23,22.5" fill="#5a7a9a" />
              <circle cx="20" cy="20" r="3" fill="#1E3A60" stroke="#3B82F6" strokeWidth="1" />
              <text x="20" y="9" textAnchor="middle" fontSize="5" fontWeight="900" fill="#FF4444">N</text>
            </svg>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {['+', '−', '◎'].map((s, i) => (
              <button key={i} className="w-6 h-6 rounded-md bg-[#0A1628]/90 border border-white/10 text-slate-300 text-[10px] font-bold flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">{s}</button>
            ))}
          </div>

          {/* The High-Precision SVG Map */}
          <svg
            viewBox="0 0 640 700"
            className="w-full h-full"
            style={{ display: 'block', padding: '6px' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glowIndia" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="indiaMapGrad" cx="45%" cy="36%" r="65%">
                <stop offset="0%" stopColor="#0E2550" />
                <stop offset="50%" stopColor="#081A38" />
                <stop offset="100%" stopColor="#040D1C" />
              </radialGradient>
              <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0055FF" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Ambient Background Grid lines */}
            <g opacity="0.1" stroke="#00D9FF" strokeWidth="0.5">
              <line x1="40" y1="150" x2="600" y2="150" strokeDasharray="3 6" />
              <line x1="40" y1="300" x2="600" y2="300" strokeDasharray="3 6" />
              <line x1="40" y1="450" x2="600" y2="450" strokeDasharray="3 6" />
              <line x1="40" y1="600" x2="600" y2="600" strokeDasharray="3 6" />
              <line x1="160" y1="30" x2="160" y2="680" strokeDasharray="3 6" />
              <line x1="320" y1="30" x2="320" y2="680" strokeDasharray="3 6" />
              <line x1="480" y1="30" x2="480" y2="680" strokeDasharray="3 6" />
            </g>

            {/* India Territory Base & Glow Border */}
            <path
              d={INDIA_PATH}
              fill="url(#indiaMapGrad)"
              stroke="#2563EB"
              strokeWidth="1.8"
              filter="url(#glowIndia)"
            />
            {/* Neon Border Pulse */}
            <path
              d={INDIA_PATH}
              fill="none"
              stroke="rgba(56, 189, 248, 0.55)"
              strokeWidth="1"
              strokeDasharray="6 3"
            />

            {/* Route network lines */}
            {ROUTES.map((route, ri) => {
              const pts = route.map(([lon, lat]) => {
                const p = toSVG(lon, lat);
                return `${p.x.toFixed(0)},${p.y.toFixed(0)}`;
              }).join(' ');
              return (
                <polyline key={ri} points={pts}
                  fill="none"
                  stroke="url(#routeGlow)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Extra incident markers */}
            {visInc.map((inc, i) => {
              const p = toSVG(inc.lon, inc.lat);
              return (
                <g key={`inc-${i}`} transform={`translate(${p.x.toFixed(0)},${p.y.toFixed(0)})`}>
                  <Marker type={inc.type} r={5} />
                </g>
              );
            })}

            {/* City markers with exact geographical placement */}
            {visCities.map((city) => {
              const p = toSVG(city.lon, city.lat);
              const x = p.x.toFixed(0);
              const y = p.y.toFixed(0);
              const labelLeft = city.lon > 84;
              return (
                <g key={city.name} transform={`translate(${x},${y})`}>
                  <Marker type={city.type} pulse={city.pulse} you={city.you} r={city.you ? 8 : 6.5} />
                  <text
                    x={labelLeft ? -9 : 9}
                    y="2.5"
                    fontSize="7"
                    fontWeight="700"
                    fill="rgba(215, 235, 255, 0.95)"
                    textAnchor={labelLeft ? 'end' : 'start'}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >{city.name}</text>
                </g>
              );
            })}

            {/* Dynamic radar scan beam */}
            <rect x="0" y="0" width="80" height="700" fill="url(#scanBeam)" opacity="0.08">
              <animateTransform attributeName="transform" type="translate"
                from="-80 0" to="650 0" dur="4.5s" repeatCount="indefinite" />
            </rect>
            <defs>
              <linearGradient id="scanBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
                <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timestamp */}
          <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[7px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {language === 'te' ? 'నవీకరించబడింది: ఇప్పుడే' : language === 'hi' ? 'अपडेट किया गया: अभी' : 'Last updated: Just now'}
            <span className="cursor-pointer hover:text-slate-400">↺</span>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-32 shrink-0 border-l border-white/5 bg-[#030C1E]/60 flex flex-col overflow-y-auto no-scrollbar">

          {/* Live Overview */}
          <div className="p-2 border-b border-white/5">
            <div className="text-[7.5px] font-black text-cyan-400 tracking-wider uppercase mb-1.5">{t('live_overview') || 'Live Overview'}</div>
            {[
              { emoji: '🚨', val: 24,     label: language === 'te' ? 'ప్రమాదాలు' : language === 'hi' ? 'सक्रिय घटनाएं' : 'Active Incidents' },
              { emoji: '🚑', val: 108,    label: language === 'te' ? '108 యూనిట్లు' : language === 'hi' ? 'बचाव दल' : 'Rescue Units' },
              { emoji: '🏥', val: 254,    label: language === 'te' ? 'ఆసుపత్రులు' : language === 'hi' ? 'अस्पताल' : 'Hospitals' },
              { emoji: '🩸', val: 395,    label: language === 'te' ? 'రక్త దాతలు' : language === 'hi' ? 'रक्त दाता' : 'Blood Donors' },
              { emoji: '👥', val: '12.8K',label: language === 'te' ? 'సేవకులు' : language === 'hi' ? 'स्वयंसेवक' : 'Volunteers' },
            ].map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1.5 py-1 border-b border-white/4 last:border-0">
                <span className="text-sm leading-none">{row.emoji}</span>
                <div>
                  <div className="text-[11px] font-black text-white leading-tight">{row.val}</div>
                  <div className="text-[7px] text-slate-400 leading-tight">{row.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="p-2">
            <div className="text-[7.5px] font-black text-cyan-400 tracking-wider uppercase mb-1.5">{t('legend_title') || 'Legend'}</div>
            {[
              { emoji: '🔴', label: language === 'te' ? 'ప్రమాదం' : language === 'hi' ? 'दुर्घटना' : 'Accident' },
              { emoji: '🩸', label: language === 'te' ? 'రక్త దాత' : language === 'hi' ? 'रक्त दाता' : 'Blood / Donor' },
              { emoji: '🐍', label: language === 'te' ? 'పాము కాటు' : language === 'hi' ? 'सर्पदंश' : 'Snakebite' },
              { emoji: '🟣', label: language === 'te' ? 'వైద్య అత్యవసరం' : language === 'hi' ? 'चिकित्सा' : 'Medical' },
              { emoji: '🔵', label: language === 'te' ? 'ఆసుపత్రి' : language === 'hi' ? 'अस्पताल' : 'Hospital' },
              { emoji: '🚑', label: language === 'te' ? '108 రెస్క్యూ' : language === 'hi' ? 'बचाव दल' : 'Rescue Unit' },
              { emoji: '🟢', label: language === 'te' ? 'మీరు ఇక్కడ ఉన్నారు' : language === 'hi' ? 'आप यहाँ हैं' : 'You Are Here' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-1.5 py-0.5 border-b border-white/4 last:border-0">
                <span className="text-[10px] leading-none">{row.emoji}</span>
                <span className="text-[7.5px] text-slate-300">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
