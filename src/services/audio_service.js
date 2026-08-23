/**
 * Global Multilingual Audio & Speech Synthesis Service for RESQONE-AI
 * Supports English, Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), Kannada (kn-IN).
 * Provides clean speech output, automatic queue cancellation, 
 * tab-switching cleanup, and app backgrounding/quit safety.
 */

let speechTimeout = null;

// Comprehensive Telugu phrase dictionary for high-fidelity Telugu emergency speech
const TELUGU_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.":
    "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. ఎమర్జెన్సీ కౌంట్‌డౌన్ ప్రారంభమైంది. 25 సెకన్లలో రెస్క్యూ స్వయంచాలకంగా బయలుదేరుతుంది.",
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
    "ప్రమాద రెస్క్యూ విభాగానికి మళ్లించబడుతోంది."
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
    "सर्पदंश प्राथमिक चिकित्सा पेज पर ले जाया जा रहा है।"
};

export const stopAllAudio = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('[AudioService] stopAllAudio failed gracefully:', err);
  }
};

export const speakEmergencyInstruction = (text, forcedLang = null) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Immediately clear any pending utterance
    stopAllAudio();

    if (!text || typeof text !== 'string') return;

    // Detect user's selected language
    const selectedLang = forcedLang || localStorage.getItem('resqone_language') || 'en';
    
    // Choose appropriate localized text
    let spokenText = text;
    let targetLocale = 'en-IN';

    if (selectedLang === 'te') {
      targetLocale = 'te-IN';
      spokenText = TELUGU_AUDIO_MAP[text] || text;
    } else if (selectedLang === 'hi') {
      targetLocale = 'hi-IN';
      spokenText = HINDI_AUDIO_MAP[text] || text;
    } else if (selectedLang === 'ta') {
      targetLocale = 'ta-IN';
    } else if (selectedLang === 'kn') {
      targetLocale = 'kn-IN';
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = targetLocale;
    utterance.rate = selectedLang === 'te' ? 0.95 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onerror = (e) => {
      console.warn('[AudioService] Utterance error (ignored):', e?.error);
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

    // Delay slightly after cancel() to let browser audio queue reset cleanly
    speechTimeout = setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioService] speak failed gracefully:', err);
      }
    }, 60);
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
