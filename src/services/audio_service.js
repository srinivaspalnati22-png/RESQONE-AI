/**
 * Global Multilingual Audio & Speech Synthesis Service for RESQONE-AI
 * Supports:
 * - English (en-IN / en-US)
 * - Telugu (te-IN)
 * - Hindi (hi-IN)
 * - Tamil (ta-IN)
 * - Kannada (kn-IN)
 * 
 * Works across ALL pages: Accident Detection, 3D Crash, Blood Donation,
 * Snakebite First Aid, Hospital Mission Control, Dashboard, and Global Navigation.
 * 
 * Reliability Architecture:
 * 1. Web Audio API Chime Synthesizer: Immediate acoustic chime that primes the audio pipeline.
 * 2. Native Script Voice Execution: If the browser has a native voice for te/hi/ta/kn, it speaks native script.
 * 3. Phonetic Transliteration Engine: If a device (Windows, iOS, Linux) lacks native te/ta/kn voices,
 *    it speaks phonetic Indian transliteration using the Indian voice (en-IN / hi-IN).
 *    This ensures 100% audibility with authentic pronunciation without silent failures.
 * 4. Autoplay Unlocker: Unlocks AudioContext & SpeechSynthesis on any touch/click gesture.
 * 5. Garbage Collection Guard: Utterances are retained in memory to prevent Chrome GC drops.
 */

let isAudioMuted = false;
let isAudioUnlocked = false;
let audioContextInstance = null;

// Persistent memory to prevent Chrome from prematurely garbage collecting utterances
if (typeof window !== 'undefined') {
  window._resqone_utterances = window._resqone_utterances || [];
  try {
    isAudioMuted = localStorage.getItem('resqone_audio_muted') === 'true';
  } catch {}
}

export const getAudioMuted = () => isAudioMuted;

export const setAudioMuted = (muted) => {
  isAudioMuted = !!muted;
  try {
    localStorage.setItem('resqone_audio_muted', isAudioMuted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('resqone_audio_mute_changed', { detail: { muted: isAudioMuted } }));
  } catch {}
  if (isAudioMuted) {
    stopAllAudio();
  }
};

export const toggleAudioMute = () => {
  setAudioMuted(!isAudioMuted);
  return isAudioMuted;
};

// Web Audio API Context initializer & wake-up
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioContextInstance) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContextInstance = new AudioContextClass();
    }
  }
  if (audioContextInstance && audioContextInstance.state === 'suspended') {
    audioContextInstance.resume().catch(() => {});
  }
  return audioContextInstance;
};

// Acoustic chime alert synthesizer (plays a sleek 2-tone attention beep)
export const playAttentionChime = (tone = 'info') => {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    if (tone === 'emergency') {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn('[AudioService] Chime skipped:', err);
  }
};

// Autoplay unlocker on first user interaction
export const unlockAudio = () => {
  if (isAudioUnlocked) return;
  isAudioUnlocked = true;

  getAudioContext();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      const empty = new SpeechSynthesisUtterance('');
      empty.volume = 0;
      window.speechSynthesis.speak(empty);
    } catch {}
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('click', unlockAudio, { once: true });
}

// ================= PHRASE DICTIONARIES (NATIVE + PHONETIC) =================

const TELUGU_PHRASES = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": {
    native: "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర కౌంట్‌డౌన్ ప్రారంభమైంది. 10 సెకన్లలో రెస్క్యూ బయలుదేరుతుంది.",
    phonetic: "Teevramaina vaahana pramaadam gurtinchabadindi. Emergency countdown prarambhamaimdi. Padi secondlalo rescue bayaluderutundi."
  },
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": {
    native: "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర కౌంట్‌డౌన్ ప్రారంభమైంది. 25 సెకన్లలో రెస్క్యూ బయలుదేరుతుంది.",
    phonetic: "Teevramaina vaahana pramaadam gurtinchabadindi. Eruvadi ayidu secondlalo automatic rescue bayaluderutundi."
  },
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": {
    native: "ఎమర్జెన్సీ కన్ఫర్మ్ అయింది. ప్రభుత్వ ఆసుపత్రి కేసును అంగీకరించింది. 108 ఆంబులెన్స్ బయలుదేరింది.",
    phonetic: "Emergency confirm ayindi. Prabhuthva aasupatri case sweekarinchindi. 108 ambulance bayaluderindi."
  },
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": {
    native: "ప్రభుత్వ ఆసుపత్రి అత్యవసర కేసును స్వీకరించింది. ఏఎల్ఎస్ ఆంబులెన్స్ బయలుదేరింది.",
    phonetic: "Prabhuthva aasupatri emergency case sweekarinchindi. ALS ambulance bayaluderindi."
  },
  "Ambulance is moving towards crash location on National Highway 16.": {
    native: "ఆంబులెన్స్ ప్రమాద స్థలానికి వేగంగా వస్తోంది.",
    phonetic: "Ambulance pramaada sthalam vaipu vegamgaa vastondi."
  },
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.": {
    native: "ఆంబులెన్స్ ప్రమాద స్థలానికి చేరుకుంది. పారామెడిక్స్ బాధితుడికి చికిత్స చేస్తున్నారు.",
    phonetic: "Ambulance pramaada sthalaaniki cherukundi. Paramedics baadhitidiki chikitsa chestunnaru."
  },
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": {
    native: "బాధితుడిని ఆంబులెన్స్ లోకి ఎక్కించారు. గ్రీన్ కారిడార్ ద్వారా ఆసుపత్రికి తీసుకెళ్తున్నారు.",
    phonetic: "Baadhitudini ambulance loki ekkinchaaru. Green corridor dwaaraa aasupatriki teesukeltunnaru."
  },
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": {
    native: "బాధితుడు సురక్షితంగా ఆసుపత్రికి చేరాడు. ఐసియులో చేర్చబడ్డాడు. రోగి సురక్షితంగా ఉన్నాడు!",
    phonetic: "Baadhitudu surakshitangaa hospital cherukunnadu. Rogi surakshitangaa unnaadu!"
  },
  "Navigating to Blood Donation Finder.": {
    native: "రక్త దాతల పేజీకి వెళ్తున్నాము.",
    phonetic: "Rakta daatala page ki veltunnamu."
  },
  "Navigating to Snakebite First Aid and Antivenom.": {
    native: "పాము కాటు మరియు యాంటీవెనమ్ పేజీకి వెళ్తున్నాము.",
    phonetic: "Paamu kaatu mariyu antivenom page ki veltunnamu."
  },
  "Navigating to 3D Vehicle Crash Simulation.": {
    native: "3D వాహన ప్రమాద రెస్క్యూ పేజీకి వెళ్తున్నాము.",
    phonetic: "3D vaahana pramaada rescue page ki veltunnamu."
  },
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": {
    native: "హెచ్చరిక! మీరు అతివేగంగా వెళ్తున్నారు. దయచేసి వేగాన్ని తగ్గించండి.",
    phonetic: "Heccharika! Meeru ativegamgaa veltunnaru. Dayachesi vegaanni tagginchandi."
  },
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.": {
    native: "జాగ్రత్త! వాహనం అస్థిరంగా ఉంది. లేన్ నియంత్రణ పాటించండి.",
    phonetic: "Jaagrattha! Vaahanam asthiramgaa undi. Lane niyantrana paatinchandi."
  },
  "Speed normalized. You are safe! Hazard avoided.": {
    native: "వేగం సాధారణ స్థాయికి వచ్చింది. మీరు ఇప్పుడు సురక్షితంగా ఉన్నారు.",
    phonetic: "Vegam saadhaaranangaa aindi. Meeru ippudu surakshitangaa unnaaru."
  },
  "SOS Cancelled. Stay safe.": {
    native: "అత్యవసర SOS రద్దు చేయబడింది. సురక్షితంగా ఉండండి.",
    phonetic: "Emergency SOS raddu cheyabadindi. Surakshitangaa undandi."
  },
  "నమస్కారం! రెస్క్యూ వన్ వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.": {
    native: "నమస్కారం! రెస్క్యూ వన్ వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.",
    phonetic: "Namaskaram! RESQONE voice assistant siddhamgaa vundi."
  },
  "తెలుగు భాష ఎంచుకోబడింది.": {
    native: "తెలుగు భాష ఎంచుకోబడింది.",
    phonetic: "Telugu bhaasha enchukobadindi."
  }
};

const HINDI_PHRASES = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": {
    native: "गंभीर वाहन दुर्घटना का पता चला है। 10 सेकंड में स्वचालित बचाव दल रवाना होगा।",
    phonetic: "Gambhir vahan durghatna ka pata chala hai. Das second mein bachav dal ravana hoga."
  },
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": {
    native: "गंभीर वाहन दुर्घटना का पता चला है। 25 सेकंड में आपातकालीन दल रवाना होगा।",
    phonetic: "Gambhir vahan durghatna ka pata chala hai. Pachchis second mein apatkalin dal ravana hoga."
  },
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": {
    native: "आपातकालीन SOS की पुष्टि हुई। अस्पताल ने केस स्वीकार किया। एम्बुलेंस रवाना हुई।",
    phonetic: "Apatkalin SOS ki pushti hui. Hospital ne case sweekar kiya. 108 ambulance ravana hui."
  },
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": {
    native: "सरकारी अस्पताल ने आपातकालीन मामला स्वीकार किया। एम्बुलेंस रवाना हुई।",
    phonetic: "Sarkari hospital ne apatkalin mamla sweekar kiya. Ambulance ravana hui."
  },
  "Ambulance is moving towards crash location on National Highway 16.": {
    native: "एम्बुलेंस दुर्घटना स्थल की ओर तेजी से आ रही है।",
    phonetic: "Ambulance durghatna sthal ki or tezi se aa rahi hai."
  },
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": {
    native: "पीड़ित को एम्बुलेंस में सुरक्षित किया गया। ग्रीन कॉरिडोर से अस्पताल ले जाया जा रहा है।",
    phonetic: "Peedit ko ambulance mein surakshit kiya gaya. Green corridor se hospital le jaya ja raha hai."
  },
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": {
    native: "पीड़ित सुरक्षित रूप से अस्पताल पहुंच गया। मरीज सुरक्षित है!",
    phonetic: "Peedit surakshit roop se hospital pahunch gaya. Mareez surakshit hai!"
  },
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": {
    native: "चेतावनी! आप अत्यधिक गति से जा रहे हैं। कृपया तुरंत गति धीमी करें।",
    phonetic: "Chetavni! Aap atyadhik gati se ja rahe hain. Kripya turant gati dheemi karein."
  },
  "Speed normalized. You are safe! Hazard avoided.": {
    native: "गति सामान्य हो गई है। आप अब सुरक्षित हैं।",
    phonetic: "Gati samanya ho gayi hai. Aap ab surakshit hain."
  },
  "नमस्ते! रेस्क्यू वन वॉयस असिस्टेंट पूरी तरह तैयार है।": {
    native: "नमस्ते! रेस्क्यू वन वॉयस असिस्टेंट पूरी तरह तैयार है।",
    phonetic: "Namaste! RESQONE voice assistant poori tarah taiyaar hai."
  },
  "हिंदी भाषा चुनी गई है।": {
    native: "हिंदी भाषा चुनी गई है।",
    phonetic: "Hindi bhasha chuni gayi hai."
  }
};

const TAMIL_PHRASES = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": {
    native: "கடுமையான வாகன விபத்து கண்டறியப்பட்டது. 10 வினாடிகளில் மீட்புக்குழு புறப்படும்.",
    phonetic: "Kadu-maiyaana vaagana vibathu kandariyapattathu. Pathu vinaadigalil meetpukkuzhu purappadum."
  },
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": {
    native: "அவசர உதவி உறுதி செய்யப்பட்டது. 108 ஆம்புலன்ஸ் புறப்பட்டது.",
    phonetic: "Avasara udhavi urudhi seyyappattadhu. 108 ambulance purappattadhu."
  },
  "Ambulance is moving towards crash location on National Highway 16.": {
    native: "ஆம்புலன்ஸ் விபத்து இடத்திற்கு விரைகிறது.",
    phonetic: "Ambulance vibathu idathirku viraigiradhu."
  },
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": {
    native: "பாதிக்கப்பட்டவர் பாதுகாப்பாக மருத்துவமனை சேர்ந்தார். நோயாளி நலமாக உள்ளார்!",
    phonetic: "Baadhikkapattavar paadhukaappaaga maruthuvamanai serndhaar. Noyaali nalamaaga ullaar!"
  },
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": {
    native: "எச்சரிக்கை! நீங்கள் அதிவேகமாக செல்கிறீர்கள். உடனே வேகத்தைக் குறைக்கவும்.",
    phonetic: "Eccharikkai! Neengal adhi-vegamaaga selgeereergal. Vegathai kuraikkavum."
  },
  "வணக்கம்! ரெஸ்க்யூ ஒன் குரல் வழிகாட்டி தயாராக உள்ளது.": {
    native: "வணக்கம்! ரெஸ்க்யூ ஒன் குரல் வழிகாட்டி தயாராக உள்ளது.",
    phonetic: "Vanakkam! RESQONE kural vazhikaatti thayaaraaga ulladhu."
  },
  "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.": {
    native: "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.",
    phonetic: "Tamizh mozhi therndhedukkappattadhu."
  }
};

const KANNADA_PHRASES = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": {
    native: "ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. 10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಕ್ಷಣಾ ತಂಡ ಹೊರಡಲಿದೆ.",
    phonetic: "Vaahana apagatha patteyagide. Hattu secondgalalli rakshanaa thanda horadalide."
  },
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": {
    native: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ ದೃಢಪಟ್ಟಿದೆ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.",
    phonetic: "Turtu paristhithi drudhapattide. 108 ambulance horatide."
  },
  "Ambulance is moving towards crash location on National Highway 16.": {
    native: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಘಟನಾ ಸ್ಥಳಕ್ಕೆ ಬರುತ್ತಿದೆ.",
    phonetic: "Ambulance ghatana sthalakke baaruttide."
  },
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": {
    native: "ಗಾಯಾಳು ಸುರಕ್ಷಿತವಾಗಿ ಆಸ್ಪತ್ರೆ ತಲುಪಿದ್ದಾರೆ. ರೋಗಿ ಸುರಕ್ಷಿತವಾಗಿದ್ದಾರೆ!",
    phonetic: "Gaayaalu surakshitavaagi aaspatre talupidaare. Rogi surakshitavaagidaare!"
  },
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": {
    native: "ಎಚ್ಚರಿಕೆ! ನೀವು ವೇಗದ ಮಿತಿಯನ್ನು ಮೀರಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ವೇಗ ಕಡಿಮೆ ಮಾಡಿ.",
    phonetic: "Eccharike! Neevu vegada mitiyannu meeriddiri. Vegavannu kadime maadi."
  },
  "ನಮಸ್ಕಾರ! ರೆಸ್ಕ್ಯೂ ಒನ್ ಧ್ವನಿ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.": {
    native: "ನಮಸ್ಕಾರ! ರೆಸ್ಕ್ಯೂ ಒನ್ ಧ್ವನಿ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.",
    phonetic: "Namaskara! RESQONE dhwani sahayaka siddhavagide."
  },
  "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ.": {
    native: "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ.",
    phonetic: "Kannada bhashe aaykeyagide."
  }
};

// Fuzzy Dynamic Transliteration for Dynamic Statements (Routes, Hospital Matches)
function getDynamicTranslation(text, lang) {
  const lower = text.toLowerCase();

  if (lang === 'te') {
    if (TELUGU_PHRASES[text]) return TELUGU_PHRASES[text];
    if (lower.includes('route') && (lower.includes('calculated') || lower.includes('driving'))) {
      const placeMatch = text.match(/to\s+([^.]+)/i);
      const place = placeMatch ? placeMatch[1] : 'గమ్యస్థానానికి';
      return {
        native: `${place} వైపు డ్రైవింగ్ రూట్ సిద్ధంగా ఉంది.`,
        phonetic: `${place} vaipu driving route siddhamgaa vundi.`
      };
    }
    if (lower.includes('speed') && (lower.includes('exceeded') || lower.includes('slow'))) {
      return {
        native: "హెచ్చరిక! దయచేసి వాహనం వేగాన్ని తగ్గించండి.",
        phonetic: "Heccharika! Dayachesi vaahanam vegaanni tagginchandi."
      };
    }
    if (lower.includes('blood') && lower.includes('donor')) {
      return {
        native: "అనుకూలమైన రక్త దాతలు కనుగొనబడ్డారు.",
        phonetic: "Anukoolamaina rakta daatalu kanugonabaddaaru."
      };
    }
    if (lower.includes('snake') || lower.includes('antivenom')) {
      return {
        native: "పాము కాటు సమాచారం: వెంటనే సమీప ఆసుపత్రికి వెళ్ళండి.",
        phonetic: "Paamu kaatu samaachaaram: Ventane sameepa hospital ki vellandi."
      };
    }
    return { native: text, phonetic: text };
  }

  if (lang === 'hi') {
    if (HINDI_PHRASES[text]) return HINDI_PHRASES[text];
    if (lower.includes('route') && (lower.includes('calculated') || lower.includes('driving'))) {
      const placeMatch = text.match(/to\s+([^.]+)/i);
      const place = placeMatch ? placeMatch[1] : 'गंतव्य';
      return {
        native: `${place} के लिए ड्राइविंग मार्ग तैयार है।`,
        phonetic: `${place} ke liye driving route taiyaar hai.`
      };
    }
    if (lower.includes('speed') && (lower.includes('exceeded') || lower.includes('slow'))) {
      return {
        native: "चेतावनी! कृपया वाहन की गति धीमी करें।",
        phonetic: "Chetavni! Kripya vahan ki gati dheemi karein."
      };
    }
    if (lower.includes('blood') && lower.includes('donor')) {
      return {
        native: "उपयुक्त रक्त दाता मिल गए हैं।",
        phonetic: "Upyukt rakta daata mil gaye hain."
      };
    }
    return { native: text, phonetic: text };
  }

  if (lang === 'ta') {
    if (TAMIL_PHRASES[text]) return TAMIL_PHRASES[text];
    if (lower.includes('route') && (lower.includes('calculated') || lower.includes('driving'))) {
      return {
        native: "மருத்துவமனைக்கான பாதை வரைபடத்தில் தயாராக உள்ளது.",
        phonetic: "Hospitalukkaana paadhai map-il thayaaraaga ulladhu."
      };
    }
    if (lower.includes('speed')) {
      return {
        native: "எச்சரிக்கை! வேகத்தைக் குறைக்கவும்.",
        phonetic: "Eccharikkai! Vegathai kuraikkavum."
      };
    }
    return { native: text, phonetic: text };
  }

  if (lang === 'kn') {
    if (KANNADA_PHRASES[text]) return KANNADA_PHRASES[text];
    if (lower.includes('route') && (lower.includes('calculated') || lower.includes('driving'))) {
      return {
        native: "ಆಸ್ಪತ್ರೆಗೆ ರಸ್ತೆ ಮಾರ್ಗ ಸಿದ್ಧವಾಗಿದೆ.",
        phonetic: "Aaspatrege raste marga siddhavagide."
      };
    }
    if (lower.includes('speed')) {
      return {
        native: "ಎಚ್ಚರಿಕೆ! ವೇಗ ಕಡಿಮೆ ಮಾಡಿ.",
        phonetic: "Eccharike! Vega kadime maadi."
      };
    }
    return { native: text, phonetic: text };
  }

  return { native: text, phonetic: text };
}

// ================= STOP ALL AUDIO =================

export const stopAllAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (window._resqone_utterances) {
        window._resqone_utterances = [];
      }
    }
    window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
  } catch (err) {
    console.warn('[AudioService] stopAllAudio failed gracefully:', err);
  }
};

// ================= INTELLIGENT VOICE FINDER =================

function resolveBestVoice(lang, voices) {
  if (!voices || voices.length === 0) return { voice: null, isNative: false };

  const langCode = lang.toLowerCase();

  // 1. Check for exact native language voice
  const nativeVoice = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase().replace(/_/g, '-');
    return vLang.startsWith(langCode) || vLang.includes(`-${langCode}`);
  });

  if (nativeVoice) {
    return { voice: nativeVoice, isNative: true };
  }

  // 2. Check for Indian accent voice (en-IN or hi-IN) which speaks phonetic Indian transliteration perfectly
  const indianVoice = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const vName = (v.name || '').toLowerCase();
    return vLang.includes('in') || vLang.includes('hi') || vName.includes('india') || vName.includes('hindi') || vName.includes('ravi') || vName.includes('heera') || vName.includes('kalpana');
  });

  if (indianVoice) {
    return { voice: indianVoice, isNative: false };
  }

  // 3. Fallback to default voice
  const defaultVoice = voices.find(v => v.default) || voices[0];
  return { voice: defaultVoice, isNative: false };
}

// ================= CORE SPEAK FUNCTION =================

/**
 * Speak an emergency instruction or system message across all pages in the user's selected language.
 * @param {string} text - Phrase to speak
 * @param {string|null} forcedLang - 'te' | 'hi' | 'ta' | 'kn' | 'en'
 */
export const speakEmergencyInstruction = (text, forcedLang = null) => {
  if (typeof window === 'undefined') return;
  if (isAudioMuted) return;
  if (!text || typeof text !== 'string') return;

  try {
    unlockAudio();
    stopAllAudio();

    const selectedLang = forcedLang || localStorage.getItem('resqone_language') || 'en';
    const translation = getDynamicTranslation(text, selectedLang);

    // Play subtle high-tech acoustic chime
    const isEmergency = text.toLowerCase().includes('crash') || text.toLowerCase().includes('sos') || text.toLowerCase().includes('accident');
    playAttentionChime(isEmergency ? 'emergency' : 'info');

    if (!('speechSynthesis' in window)) {
      console.warn('[AudioService] Web SpeechSynthesis not supported on this device.');
      return;
    }

    // Force resume any paused browser speech queues
    try {
      window.speechSynthesis.resume();
    } catch {}

    const voices = window.speechSynthesis.getVoices() || [];
    const { voice: selectedVoice, isNative } = resolveBestVoice(selectedLang, voices);

    // If native voice exists for the language, speak native script.
    // If no native voice exists on this OS, speak phonetic Indian transliteration!
    const textToSpeak = (selectedLang === 'en' || isNative) ? translation.native : translation.phonetic;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (isNative && selectedLang !== 'en') {
      utterance.lang = selectedLang === 'te' ? 'te-IN' : selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'ta' ? 'ta-IN' : 'kn-IN';
      utterance.rate = 0.88;
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = 0.90;
    }

    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prevent Chrome garbage collection bug
    window._resqone_utterances = window._resqone_utterances || [];
    window._resqone_utterances.push(utterance);

    utterance.onstart = () => {
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { 
        detail: { isSpeaking: true, text: translation.native } 
      }));
    };

    utterance.onend = () => {
      window._resqone_utterances = (window._resqone_utterances || []).filter(u => u !== utterance);
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
    };

    utterance.onerror = (e) => {
      console.warn('[AudioService] Utterance error:', e?.error);
      window._resqone_utterances = (window._resqone_utterances || []).filter(u => u !== utterance);
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
    };

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioService] speak failed:', err);
      }
    }, 60);

  } catch (err) {
    console.warn('[AudioService] Global speech failure:', err);
  }
};

// Global lifecycle hooks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopAllAudio);
  window.addEventListener('pagehide', stopAllAudio);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAllAudio();
    }
  });

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        window.speechSynthesis.getVoices();
      } catch {}
    };
  }
}
