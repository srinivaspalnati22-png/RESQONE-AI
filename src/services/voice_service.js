import { supabase } from '../lib/supabaseClient';
import { speakEmergencyInstruction } from './audio_service';
import { broadcastDisasterAlert, getLoggedInUserProfile } from './broadcast_service';

/**
 * Multilingual Speech Recognition & Voice AI Assistant (Q&A Mode + Action Mode)
 * Supports English (en-IN), Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), and Kannada (kn-IN).
 */

export const LANG_MAP = {
  en: { speechCode: 'en-IN', label: 'English' },
  te: { speechCode: 'te-IN', label: 'Telugu' },
  hi: { speechCode: 'hi-IN', label: 'Hindi' },
  ta: { speechCode: 'ta-IN', label: 'Tamil' },
  kn: { speechCode: 'kn-IN', label: 'Kannada' }
};

export const speakText = (text, langCode = 'en') => {
  if (!text || typeof text !== 'string') return false;
  try {
    speakEmergencyInstruction(text, langCode);
    return true;
  } catch (err) {
    console.warn('[VoiceService] speakText error:', err);
    return false;
  }
};

export const startVoiceRecognition = (langCode = 'en', onResult, onError, onEnd) => {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('Voice recognition not supported on this device/browser.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[langCode]?.speechCode || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) onError(err.message);
    return null;
  }
};

// Localized Voice Response dictionary
const LOCALIZED_RESPONSES = {
  en: {
    accident_ambulance: "Accident distress alert broadcasted! 108 Emergency Ambulance dispatched. Route map and nearby trauma hospitals loaded.",
    sos_activated: "Activating Emergency SOS now.",
    calling_er: "Calling Emergency Helpline 108 now.",
    switched_te: "Switched language to Telugu.",
    switched_hi: "Switched language to Hindi.",
    switched_en: "Switched language to English.",
    switched_ta: "Switched language to Tamil.",
    switched_kn: "Switched language to Kannada.",
    nav_home: "Opening Home Page.",
    nav_crash: "Opening 3D Vehicle Crash Simulation and Hospital Route Map.",
    nav_copilot: "Opening AI Emergency Copilot.",
    nav_blood: "Opening Smart Blood Donor Matcher.",
    nav_snake: "Opening Snakebite Species AI, first aid precautions, and Antivenom locator.",
    nav_dashboard: "Opening Mission Control Dashboard.",
    nav_auth: "Opening Emergency Profile and Contacts.",
    avs_stock: "Government General Hospital Vijayawada has 150 vials of Polyvalent Antivenom Serum in stock. Ramesh Hospitals has 35 vials available.",
    first_aid: "Immobilize the bitten limb below heart level. Keep patient calm. Do not cut or apply tourniquets. Transport to hospital immediately.",
    icu_beds: "GGH Vijayawada currently has 12 ICU beds available. Ramesh Hospitals has 15 ICU beds available.",
    blood_donors: "3 active universal blood donors are available near your location.",
    evaluating: (q) => `Evaluating emergency query: ${q}. Routing to AI Copilot.`
  },
  te: {
    accident_ambulance: "ప్రమాద అత్యవసర హెచ్చరిక పంపబడింది! 108 ఆంబులెన్స్ బయలుదేరింది. సమీప ఆసుపత్రి మరియు రూట్ మ్యాప్ సిద్ధంగా ఉన్నాయి.",
    sos_activated: "అత్యవసర SOS ప్రారంభించబడింది.",
    calling_er: "108 అత్యవసర ఆంబులెన్స్‌కు కాల్ చేస్తున్నాం.",
    switched_te: "భాషను తెలుగులోకి మార్చాము.",
    switched_hi: "భాషను హిందీలోకి మార్చాము.",
    switched_en: "భాషను ఇంగ్లీషులోకి మార్చాము.",
    switched_ta: "భాషను తమిళంలోకి మార్చాము.",
    switched_kn: "భాషను కన్నడలోకి మార్చాము.",
    nav_home: "హోమ్ పేజీకి వెళ్తున్నాం.",
    nav_crash: "3D వాహన ప్రమాద సిమ్యులేషన్ మరియు ఆసుపత్రి మార్గాన్ని ఓపెన్ చేస్తున్నాం.",
    nav_copilot: "AI అత్యవసర కోపైలట్‌ను ఓపెన్ చేస్తున్నాం.",
    nav_blood: "రక్త దాతల మ్యాచ్ పేజీని ఓపెన్ చేస్తున్నాం.",
    nav_snake: "పాము కాటు వైద్య సహాయం, ప్రథమ చికిత్స జాగ్రత్తలు మరియు ఆసుపత్రి పేజీని ఓపెన్ చేస్తున్నాం.",
    nav_dashboard: "మిషన్ కంట్రోల్ డ్యాష్‌బోర్డ్ ఓపెన్ చేస్తున్నాం.",
    nav_auth: "అత్యవసర ప్రొఫైల్ మరియు కాంటాక్ట్స్ ఓపెన్ చేస్తున్నాం.",
    avs_stock: "విజయవాడ GGH లో 150 యాంటీవెనమ్ ఇంజెక్షన్లు అందుబాటులో ఉన్నాయి.",
    first_aid: "గాయాన్ని కదపకండి, రోగిని ప్రశాంతంగా ఉంచండి. వెంటనే సమీప ఆసుపత్రికి తరలించండి.",
    icu_beds: "GGH విజయవాడలో 12 ICU బెడ్లు సిద్ధంగా ఉన్నాయి.",
    blood_donors: "సమీపంలో రక్త దాతలు అందుబాటులో ఉన్నారు.",
    evaluating: (q) => `అత్యవసర అభ్యర్థనను విశ్లేషిస్తున్నాం: ${q}`
  },
  hi: {
    accident_ambulance: "दुर्घटना आपातकालीन चेतावनी भेजी गई! 108 एम्बुलेंस रवाना कर दी गई है। अस्पताल मार्ग नक्शा तैयार है।",
    sos_activated: "आपातकालीन SOS सक्रिय किया गया है।",
    calling_er: "108 आपातकालीन एम्बुलेंस को कॉल किया जा रहा है।",
    switched_te: "भाषा को तेलुगु में बदला गया।",
    switched_hi: "भाषा को हिंदी में बदला गया।",
    switched_en: "भाषा को अंग्रेजी में बदला गया।",
    switched_ta: "भाषा को तमिल में बदला गया।",
    switched_kn: "भाषा को कन्नड़ में बदला गया।",
    nav_home: "होम पेज खोला जा रहा है।",
    nav_crash: "3D वाहन दुर्घटना सिमुलेशन और अस्पताल रूट खोला जा रहा है।",
    nav_copilot: "एआई आपातकालीन कोपायलट खोला जा रहा है।",
    nav_blood: "रक्त दाता खोज मंच खोला जा रहा है।",
    nav_snake: "सर्पदंश सहायता, 10 प्राथमिक उपचार सावधानियां एवं एंटीवेनम खोला जा रहा है।",
    nav_dashboard: "मिशन कंट्रोल डैशबोर्ड खोला जा रहा है।",
    nav_auth: "आपातकालीन प्रोफाइल और संपर्क खोले जा रहे हैं।",
    avs_stock: "जीजीएच अस्पताल में 150 एंटीवेनम शीशियां उपलब्ध हैं।",
    first_aid: "काटे गए अंग को स्थिर रखें और तुरंत नजदीकी अस्पताल ले जाएं।",
    icu_beds: "जीजीएच विजयवाड़ा में 12 आईसीयू बेड उपलब्ध हैं।",
    blood_donors: "नजदीक में रक्त दाता उपलब्ध हैं।",
    evaluating: (q) => `आपातकालीन अनुरोध का विश्लेषण किया जा रहा है: ${q}`
  },
  ta: {
    accident_ambulance: "விபத்து அவசர எச்சரிக்கை அனுப்பப்பட்டது! 108 ஆம்புலன்ஸ் அனுப்பப்பட்டுள்ளது. வரைபடம் மற்றும் மருத்துவமனைகள் தயாராக உள்ளன.",
    sos_activated: "அவசர SOS செயல்படுத்தப்பட்டது.",
    calling_er: "108 அவசர ஊர்திக்கு அழைக்கப்படுகிறது.",
    switched_te: "தெலுங்கு மொழிக்கு மாற்றப்பட்டது.",
    switched_hi: "இந்தி மொழிக்கு மாற்றப்பட்டது.",
    switched_en: "ஆங்கில மொழிக்கு மாற்றப்பட்டது.",
    switched_ta: "தமிழ் மொழிக்கு மாற்றப்பட்டது.",
    switched_kn: "கன்னட மொழிக்கு மாற்றப்பட்டது.",
    nav_home: "முகப்பு பக்கம் திறக்கப்படுகிறது.",
    nav_crash: "3D விபத்து உருவகப்படுத்துதல் மற்றும் வரைபடம் திறக்கப்படுகிறது.",
    nav_copilot: "AI அவசர வழிகாட்டி திறக்கப்படுகிறது.",
    nav_blood: "இரத்த தானம் தேடல் பக்கம் திறக்கப்படுகிறது.",
    nav_snake: "பாம்புக்கடி உதவி, முதலுதவி முன்னெச்சரிக்கைகள் பக்கம் திறக்கப்படுகிறது.",
    nav_dashboard: "கட்டுப்பாட்டு மையம் திறக்கப்படுகிறது.",
    nav_auth: "அவசர எண்கள் திறக்கப்படுகிறது.",
    avs_stock: "அரசு மருத்துவமனையில் 150 பாம்புக்கடி மருந்துகள் உள்ளன.",
    first_aid: "கடித்த இடத்தை அசைக்காமல் மருத்துவமனைக்கு கொண்டு செல்லுங்கள்.",
    icu_beds: "12 தீவிர சிகிச்சை படுக்கைகள் தயாராக உள்ளன.",
    blood_donors: "இரத்த தான நன்கொடையாளர்கள் உள்ளனர்.",
    evaluating: (q) => `அவசர தகவல் பகுப்பாய்வு செய்யப்படுகிறது: ${q}`
  },
  kn: {
    accident_ambulance: "ಅಪಘಾತ ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ! 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನಿಸಲಾಗಿದೆ. ಆಸ್ಪತ್ರೆ ಮಾರ್ಗ ನಕ್ಷೆ ಸಿದ್ಧವಾಗಿದೆ.",
    sos_activated: "ತುರ್ತು SOS ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.",
    calling_er: "108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ.",
    switched_te: "ತೆಲುಗು ಭಾಷೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
    switched_hi: "ಹಿಂದಿ ಭಾಷೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
    switched_en: "ಇಂಗ್ಲಿಷ್ ಭಾಷೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
    switched_ta: "ತಮಿಳು ಭಾಷೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
    switched_kn: "ಕನ್ನಡ ಭಾಷೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
    nav_home: "ಮುಖಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_crash: "3D ಅಪಘಾತ ಸಿಮ್ಯುಲೇಶನ್ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಮಾರ್ಗ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_copilot: "AI ತುರ್ತು ಸಹಾಯಕ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_blood: "ರಕ್ತ ದಾನಿಗಳ ಶೋಧನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_snake: "ಹಾವು ಕಡಿತ ನೆರವು ಮತ್ತು 10 ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_dashboard: "ಮಿಷನ್ ಕಂಟ್ರೋಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    nav_auth: "ತುರ್ತು ಸಂಪರ್ಕಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
    avs_stock: "ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ 150 ಆಂಟಿವೆನಮ್ ಔಷಧಗಳು ಲಭ್ಯವಿವೆ.",
    first_aid: "ಕಡಿತದ ಅಂಗವನ್ನು ಅಲುಗಾಡಿಸದೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.",
    icu_beds: "12 ಐಸಿಯು ಬೆಡ್‌ಗಳು ಲಭ್ಯವಿವೆ.",
    blood_donors: "ರಕ್ತದಾನಿಗಳು ಲಭ್ಯವಿದ್ದಾರೆ.",
    evaluating: (q) => `ತುರ್ತು ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ: ${q}`
  }
};

/**
 * Multilingual Voice Command Interpreter
 */
export const processVoiceIntent = async (cmd, langCode = 'en', { setActiveTab, setLanguage, onOpenSOS }) => {
  const lower = cmd.toLowerCase().trim();
  const res = LOCALIZED_RESPONSES[langCode] || LOCALIZED_RESPONSES.en;

  // 1. Direct Accident & Ambulance Dispatch Request
  const isAccidentAmbulance = 
    lower.includes('accident') || lower.includes('crash') || lower.includes('aumblance') || lower.includes('ambulance') || 
    lower.includes('ప్రమాదం') || lower.includes('యాక్సిడెంట్') || lower.includes('ఆంబులెన్స్') || 
    lower.includes('दुर्घटना') || lower.includes('हादसा') || lower.includes('एम्बुलेंस') || 
    lower.includes('விபத்து') || lower.includes('ஆம்புலன்ஸ்') || 
    lower.includes('ಅಪಘಾತ') || lower.includes('ಆಂಬ್ಯುಲೆನ್ಸ್');

  if (isAccidentAmbulance) {
    const user = getLoggedInUserProfile();
    let userCoords = [16.5167, 80.6500];
    try {
      const saved = localStorage.getItem('resqone_user_location');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.lat && p.lng) userCoords = [p.lat, p.lng];
      }
    } catch (e) {}

    // Send universal disaster broadcast & notification
    broadcastDisasterAlert({
      category: 'ACCIDENT',
      victimName: user.name || 'Emergency Citizen',
      victimPhone: user.phone || '+91 94401 23401',
      locationName: 'Vijayawada NH-16 Emergency Corridor',
      lat: userCoords[0],
      lng: userCoords[1],
      severity: 'CRITICAL',
      summary: `Voice AI Distress: Accident reported (${cmd}). Immediate 108 Ambulance & Trauma Bay Dispatched.`
    }).catch(err => console.warn('[VoiceIntent] Broadcast error:', err));

    speakText(res.accident_ambulance, langCode);
    if (setActiveTab) setActiveTab('accident');
    return { mode: 'ACTION', action: 'ACCIDENT_AMBULANCE_DISPATCHED', toast: res.accident_ambulance };
  }

  // 2. SOS Emergency Trigger
  if (lower.includes('sos') || lower.includes('emergency') || lower.includes('danger') || lower.includes('अपात') || lower.includes('అత్యవసర') || lower.includes('காப்பாத்து') || lower.includes('ತುರ್ತು')) {
    speakText(res.sos_activated, langCode);
    if (onOpenSOS) onOpenSOS();
    return { mode: 'ACTION', action: 'SOS_TRIGGERED', toast: res.sos_activated };
  }

  // 3. Call Emergency Helpline / Ambulance
  if (lower.includes('call hospital') || lower.includes('call ambulance') || lower.includes('108') || lower.includes('कॉल') || lower.includes('ఫోన్') || lower.includes('அழைக்க') || lower.includes('ಕರೆ')) {
    speakText(res.calling_er, langCode);
    window.location.href = 'tel:108';
    return { mode: 'ACTION', action: 'PHONE_CALL', toast: res.calling_er };
  }

  // 4. Snakebite / Antivenom / First Aid
  if (lower.includes('snake') || lower.includes('bite') || lower.includes('venom') || lower.includes('antivenom') || lower.includes('పాము') || lower.includes('కాటు') || lower.includes('సాంప') || lower.includes('सांप') || lower.includes('विष') || lower.includes('काट') || lower.includes('பாம்பு') || lower.includes('கடி') || lower.includes('ಹಾವು') || lower.includes('ಕಡಿತ')) {
    speakText(res.nav_snake, langCode);
    if (setActiveTab) setActiveTab('snakebite');
    return { mode: 'ACTION', action: 'NAVIGATE_SNAKE', toast: res.nav_snake };
  }

  // 5. Blood Finder / Donor Request
  if (lower.includes('blood') || lower.includes('donor') || lower.includes('రక్తం') || lower.includes('రక్త') || lower.includes('బ్లడ్') || lower.includes('खून') || lower.includes('रक्त') || lower.includes('இரத்தம்') || lower.includes('ರಕ್ತ')) {
    speakText(res.nav_blood, langCode);
    if (setActiveTab) setActiveTab('blood');
    return { mode: 'ACTION', action: 'NAVIGATE_BLOOD', toast: res.nav_blood };
  }

  // 6. Language Switching Voice Commands
  if (lower.includes('telugu') || lower.includes('తెలుగు')) {
    speakText(res.switched_te, 'te');
    if (setLanguage) setLanguage('te');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast: res.switched_te };
  }
  if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('हिन्दी')) {
    speakText(res.switched_hi, 'hi');
    if (setLanguage) setLanguage('hi');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast: res.switched_hi };
  }
  if (lower.includes('tamil') || lower.includes('தமிழ்')) {
    speakText(res.switched_ta, 'ta');
    if (setLanguage) setLanguage('ta');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast: res.switched_ta };
  }
  if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) {
    speakText(res.switched_kn, 'kn');
    if (setLanguage) setLanguage('kn');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast: res.switched_kn };
  }
  if (lower.includes('english') || lower.includes('अंग्रेजी') || lower.includes('ఇంగ్లీష్')) {
    speakText(res.switched_en, 'en');
    if (setLanguage) setLanguage('en');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast: res.switched_en };
  }

  // 7. Navigate: Home
  if (lower.includes('home') || lower.includes('main') || lower.includes('హోమ్') || lower.includes('होम') || lower.includes('முகப்பு') || lower.includes('ಮುಖಪುಟ')) {
    speakText(res.nav_home, langCode);
    if (setActiveTab) setActiveTab('home');
    return { mode: 'ACTION', action: 'NAVIGATE_HOME', toast: res.nav_home };
  }

  // 8. Navigate: Mission Control / Hospital Dashboard
  if (lower.includes('copilot') || lower.includes('assistant') || lower.includes('help') || lower.includes('కోపైలట్') || lower.includes('सहायक') || lower.includes('मदद') || lower.includes('வழிகாட்டி') || lower.includes('ಸಹಾಯ')) {
    speakText(res.nav_dashboard, langCode);
    if (setActiveTab) setActiveTab('dashboard');
    return { mode: 'ACTION', action: 'NAVIGATE_DASHBOARD', toast: res.nav_dashboard };
  }

  if (lower.includes('dashboard') || lower.includes('control') || lower.includes('hospital') || lower.includes('icu') || lower.includes('డ్యాష్‌బోర్డ్') || lower.includes('ఆసుపత్రి') || lower.includes('डैशबोर्ड') || lower.includes('अस्पताल') || lower.includes('மருத்துவமனை') || lower.includes('ಆಸ್ಪತ್ರೆ')) {
    speakText(res.nav_dashboard, langCode);
    if (setActiveTab) setActiveTab('dashboard');
    return { mode: 'ACTION', action: 'NAVIGATE_DASHBOARD', toast: res.nav_dashboard };
  }

  // 9. Navigate: Profile / Emergency Contacts
  if (lower.includes('profile') || lower.includes('contact') || lower.includes('family') || lower.includes('login') || lower.includes('register') || lower.includes('ప్రొఫైల్') || lower.includes('బంధువులు') || lower.includes('प्रोफाइल') || lower.includes('ಸಂಪರ್ಕ')) {
    speakText(res.nav_auth, langCode);
    if (setActiveTab) setActiveTab('auth');
    return { mode: 'ACTION', action: 'NAVIGATE_AUTH', toast: res.nav_auth };
  }

  // ==========================================
  // Q&A Queries
  // ==========================================
  if (lower.includes('stock') || lower.includes('vials') || lower.includes('avs') || lower.includes('నిల్వ') || lower.includes('स्टॉक')) {
    speakText(res.avs_stock, langCode);
    return { mode: 'Q&A', answer: res.avs_stock, toast: res.avs_stock };
  }

  if (lower.includes('first aid') || lower.includes('treat') || lower.includes('చికిత్స') || lower.includes('उपचार') || lower.includes('முதலுதவி') || lower.includes('ಚಿಕಿತ್ಸೆ')) {
    speakText(res.first_aid, langCode);
    return { mode: 'Q&A', answer: res.first_aid, toast: res.first_aid };
  }

  if (lower.includes('beds') || lower.includes('bed') || lower.includes('బెడ్') || lower.includes('बेड') || lower.includes('படுக்கை')) {
    speakText(res.icu_beds, langCode);
    return { mode: 'Q&A', answer: res.icu_beds, toast: res.icu_beds };
  }

  // Fallback
  const fallback = res.evaluating(cmd);
  speakText(fallback, langCode);
  if (setActiveTab) setActiveTab('copilot');
  return { mode: 'Q&A', answer: fallback, toast: fallback };
};
