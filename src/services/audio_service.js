/**
 * Global Multilingual Audio & Speech Synthesis Service for RESQONE-AI
 * Supports English, Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), Kannada (kn-IN).
 * Provides clean speech output, automatic queue cancellation, 
 * tab-switching cleanup, and app backgrounding/quit safety.
 */

let speechTimeout = null;

// Exact sentence mappings
const TELUGU_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.":
    "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర ఎమర్జెన్సీ కౌంట్‌డౌన్ ప్రారంభమైంది. 10 సెకన్లలో స్వయంచాలక రెస్క్యూ బయలుదేరుతుంది.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.":
    "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర ఎమర్జెన్సీ కౌంట్‌డౌన్ ప్రారంభమైంది. 10 సెకన్లలో స్వయంచాలక రెస్క్యూ బయలుదేరుతుంది.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.":
    "ఎమర్జెన్సీ కన్ఫర్మ్ అయింది. ప్రభుత్వ జనరల్ ఆసుపత్రి విజయవాడ కేసును అంగీకరించింది. ఏఎల్ఎస్ 108 ఆంబులెన్స్ బయలుదేరింది.",
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.":
    "ప్రభుత్వ జనరల్ ఆసుపత్రి విజయవాడ అత్యవసర కేసును స్వీకరించింది. ఏఎల్ఎస్ ఆంబులెన్స్ బయలుదేరింది.",
  "Ambulance is moving towards crash location on National Highway 16.":
    "ఆంబులెన్స్ జాతీయ రహదారి 16 పై ప్రమాద స్థలానికి వేగంగా వస్తోంది.",
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.":
    "ఆంబులెన్స్ ప్రమాద స్థలానికి చేరుకుంది. పారామెడిక్స్ బాధితుడిని స్ట్రెచర్ పైకి ఎక్కిస్తున్నారు.",
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.":
    "బాధితుడిని ఆంబులెన్స్ లోకి ఎక్కించారు. గ్రీన్ సిగ్నల్ కారిడార్ ద్వారా ఆసుపత్రికి వేగంగా తీసుకెళ్తున్నారు.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!":
    "బాధితుడు సురక్షితంగా ఆసుపత్రికి చేరాడు. ఐసియు లో చేర్చబడ్డాడు. రోగి సురక్షితంగా ఉన్నాడు!",
  "Navigating to Blood Donation Finder.":
    "రక్త దాతల మ్యాచ్ పేజీకి మళ్లించబడుతోంది. మీ రక్త గ్రూప్ ఎంచుకోండి.",
  "Navigating to Snakebite First Aid and Antivenom.":
    "పాము కాటు గుర్తింపు మరియు యాంటీవెనమ్ ఆసుపత్రుల పేజీకి మళ్లించబడుతోంది.",
  "Navigating to 3D Vehicle Crash Simulation.":
    "3D వాహన ప్రమాద రెస్క్యూ పేజీకి మళ్లించబడుతోంది.",
  "Navigating to Hospital Mission Control.":
    "ఆసుపత్రి మిషన్ కంట్రోల్ పేజీకి మళ్లించబడుతోంది.",
  "Directing to emergency blood search.":
    "అత్యవసర రక్త శోధనకు మళ్లించబడుతోంది.",
  "Directing to snakebite emergency.":
    "పాము కాటు అత్యవసర చికిత్సకు మళ్లించబడుతోంది.",
  "Directing to accident crash rescue.":
    "ప్రమాద రెస్క్యూ విభాగానికి మళ్లించబడుతోంది.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "గుర్తుతెలియని పాము కాటు నమోదైంది. దయచేసి గ్యాలరీ నుండి మీరు చూసిన పామును ఎంచుకోండి.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "హెచ్చరిక! మీరు అతివేగంగా వెళ్తున్నారు. ఇది ప్రమాదకరం, దయచేసి వెంటనే వేగాన్ని తగ్గించండి.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "జాగ్రత్త! ముందు జాతీయ రహదారిపై ప్రమాదకరమైన మలుపు మరియు యాక్సిడెంట్ జోన్ ఉంది. నెమ్మదిగా నడపండి.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.":
    "జాగ్రత్త! వాహనం అస్థిరంగా మలుపులు తిరుగుతోంది. దయచేసి లేన్ నియంత్రణ పాటించండి.",
  "Speed normalized. You are safe! Hazard avoided.":
    "వేగం సురక్షిత స్థాయికి తగ్గింది. మీరు ఇప్పుడు సురక్షితంగా ఉన్నారు! ప్రమాదం తప్పింది."
};

const HINDI_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.":
    "गंभीर वाहन दुर्घटना का पता चला है। 25 सेकंड में स्वचालित बचाव दल रवाना होगा।",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.":
    "आपातकालीन SOS की पुष्टि हुई। जीजीएच अस्पताल ने केस स्वीकार किया। एम्बुलेंस रवाना हुई।",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!":
    "पीड़ित सुरक्षित रूप से अस्पताल पहुंच गया है। आईसीयू में भर्ती कराया गया। मरीज सुरक्षित है!",
  "Navigating to Blood Donation Finder.":
    "रक्त दाता खोज पेज पर ले जाया जा रहा है।",
  "Navigating to Snakebite First Aid and Antivenom.":
    "सर्पदंश प्राथमिक चिकित्सा पेज पर ले जाया जा रहा है।",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "अज्ञात सर्पदंश की सूचना मिली है। कृपया गैलरी से उस सांप का चयन करें जिसे आपने देखा था।",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "चेतावनी! आप अत्यधिक गति से जा रहे हैं। यह असुरक्षित है, कृपया तुरंत गति धीमी करें।",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "सावधानी! आगे राष्ट्रीय राजमार्ग 16 पर अत्यधिक दुर्घटना संभावित क्षेत्र है। कृपया वाहन धीरे चलाएं।",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.":
    "सावधानी! वाहन का असंतुलन देखा गया है। कृपया नियंत्रण बनाए रखें।",
  "Speed normalized. You are safe! Hazard avoided.":
    "गति सामान्य हो गई है। आप अब सुरक्षित हैं! खतरा टल गया है।"
};

/**
 * Dynamic Telugu Speech Translator for runtime templates
 */
function translateToTeluguDynamic(text) {
  if (TELUGU_AUDIO_MAP[text]) return TELUGU_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  // Blood Finder dynamic matching
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "విజయవాడలో సరిపోలే రక్త నిల్వలు మరియు రక్త దాతలు విజయవంతంగా కనుగొనబడ్డాయి.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "అత్యవసర రక్త అభ్యర్థన పంపబడింది. కోల్డ్ చైన్ కొరియర్ తక్షణమే కేటాయించబడింది.";
  }

  // Snakebite dynamic matching
  if (lower.includes('antivenom vials reserved at') || lower.includes('trauma bay alerted')) {
    return "ఆసుపత్రిలో పాలీవాలెంట్ యాంటీవెనమ్ ఇంజెక్షన్లు రిజర్వ్ చేయబడ్డాయి. అత్యవసర విభాగానికి సమాచారం అందించబడింది.";
  }
  if (lower.includes('first aid precautions for') || lower.includes('first aid')) {
    return "WHO ప్రథమ చికిత్స మార్గదర్శకాలు: బాధితుడిని కదల్చకుండా ప్రశాంతంగా ఉంచండి. కాటు వేసిన భాగాన్ని గుండె కంటే కిందకు ఉంచి వెంటనే ఆసుపత్రికి తరలించండి.";
  }
  if (lower.includes('critical') && lower.includes('snakebite')) {
    return "తీవ్రమైన పాము కాటు అత్యవసర పరిస్థితి గుర్తించబడింది. యాంటీవెనమ్ ఉన్న సమీప ఆసుపత్రికి మార్గం సిద్ధమైంది.";
  }
  if (lower.includes('critical') && lower.includes('emergency')) {
    return "తీవ్రమైన అత్యవసర పరిస్థితి గుర్తించబడింది. సమీప ఆసుపత్రికి సమాచారం పంపబడింది.";
  }

  return text;
}

/**
 * Dynamic Hindi Speech Translator for runtime templates
 */
function translateToHindiDynamic(text) {
  if (HINDI_AUDIO_MAP[text]) return HINDI_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "सत्यापित रक्त बैंक और संगत रक्त दाता सफलतापूर्वक मिल गए हैं।";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "आपातकालीन रक्त अनुरोध भेजा गया। कोल्ड चेन कूरियर रवाना कर दिया गया है।";
  }
  if (lower.includes('antivenom vials reserved at') || lower.includes('trauma bay alerted')) {
    return "अस्पताल में एंटीवेनम शीशियां आरक्षित कर ली गई हैं। आपातकालीन कक्ष सतर्क है।";
  }
  if (lower.includes('first aid precautions for') || lower.includes('first aid')) {
    return "डब्ल्यूएचओ प्राथमिक उपचार: मरीज को शांत रखें, काटे गए अंग को स्थिर रखें और तुरंत अस्पताल ले जाएं।";
  }

  return text;
}

export const stopAllAudio = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
    if (window._resqone_active_utterance) {
      window._resqone_active_utterance.onend = null;
      window._resqone_active_utterance.onerror = null;
      window._resqone_active_utterance = null;
    }
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('[AudioService] stopAllAudio failed gracefully:', err);
  }
};

export const speakEmergencyInstruction = (text, forcedLang = null) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Immediately stop previous audio to prevent overlapping collision
    stopAllAudio();

    if (!text || typeof text !== 'string') return;

    // Detect user's selected language
    const selectedLang = forcedLang || localStorage.getItem('resqone_language') || 'en';
    
    // Choose appropriate localized text
    let spokenText = text;
    let targetLocale = 'en-IN';

    if (selectedLang === 'te') {
      targetLocale = 'te-IN';
      spokenText = translateToTeluguDynamic(text);
    } else if (selectedLang === 'hi') {
      targetLocale = 'hi-IN';
      spokenText = translateToHindiDynamic(text);
    } else if (selectedLang === 'ta') {
      targetLocale = 'ta-IN';
    } else if (selectedLang === 'kn') {
      targetLocale = 'kn-IN';
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = targetLocale;
    // Set a calm, clear, highly intelligible pace (0.85) to avoid rushed slurring
    utterance.rate = selectedLang === 'te' ? 0.84 : selectedLang === 'hi' ? 0.86 : 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Chrome/Edge Bugfix: Keep global reference so browser garbage collector does not break audio mid-sentence
    window._resqone_active_utterance = utterance;

    utterance.onend = () => {
      window._resqone_active_utterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('[AudioService] Utterance finished/interrupted:', e?.error);
      window._resqone_active_utterance = null;
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang && (v.lang.startsWith(selectedLang) || v.lang.startsWith(targetLocale))) 
        || voices.find(v => v.lang && (v.lang.startsWith('en-IN') || v.lang.startsWith('en'))) 
        || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Delay 90ms after cancel() to let browser hardware audio buffer clear cleanly
    speechTimeout = setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioService] speak failed gracefully:', err);
      }
    }, 90);
  } catch (err) {
    console.warn('[AudioService] SpeechSynthesis error:', err);
  }
};

// Global lifecycle hooks: Stop speaking when tab closes, changes, or window is backgrounded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopAllAudio);
  window.addEventListener('pagehide', stopAllAudio);
  window.addEventListener('blur', stopAllAudio);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAllAudio();
    }
  });
}
