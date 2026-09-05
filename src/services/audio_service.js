/**
 * Global Multilingual Audio & Speech Synthesis Service for RESQONE-AI
 * Supports English (en-IN), Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), Kannada (kn-IN).
 * Covers all pages: Accident, Blood Donation, Snakebite, Dashboard, Landing, 3D Crash, Auth, Copilot.
 * 
 * Features:
 * - Dual Engine: Web SpeechSynthesis API + Natural Audio Stream Fallback (Google TTS)
 * - Autoplay Unlocker: Automatically unlocks audio on initial user touch/click
 * - Comprehensive phrase translation & fuzzy pattern matchers for all 5 languages
 * - Audio mute control & active utterance management
 */

let speechTimeout = null;
let currentAudioElement = null;
let isAudioMuted = false;
let isAudioUnlocked = false;

// Initialize mute state from localStorage
if (typeof window !== 'undefined') {
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

// Autoplay unlocker on first user interaction
const unlockAudioContext = () => {
  if (isAudioUnlocked) return;
  isAudioUnlocked = true;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      // Prime synthesis with an empty utterance
      const empty = new SpeechSynthesisUtterance('');
      empty.volume = 0;
      window.speechSynthesis.speak(empty);
    } catch {}
  }

  // Remove listeners once unlocked
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', unlockAudioContext);
    window.removeEventListener('keydown', unlockAudioContext);
    window.removeEventListener('touchstart', unlockAudioContext);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudioContext, { once: true });
  window.addEventListener('keydown', unlockAudioContext, { once: true });
  window.addEventListener('touchstart', unlockAudioContext, { once: true });
}

// ================= TRANSLATION DICTIONARIES =================

const TELUGU_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర కౌంట్‌డౌన్ ప్రారంభమైంది. 10 సెకన్లలో స్వయంచాలక రెస్క్యూ బయలుదేరుతుంది.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర కౌంట్‌డౌన్ ప్రారంభమైంది. 25 సెకన్లలో స్వయంచాలక రెస్క్యూ బయలుదేరుతుంది.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": "ఎమర్జెన్సీ కన్ఫర్మ్ అయింది. ప్రభుత్వ జనరల్ ఆసుపత్రి కేసును అంగీకరించింది. 108 ఆంబులెన్స్ బయలుదేరింది.",
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": "ప్రభుత్వ జనరల్ ఆసుపత్రి విజయవాడ అత్యవసర కేసును స్వీకరించింది. ఏఎల్ఎస్ ఆంబులెన్స్ బయలుదేరింది.",
  "Ambulance is moving towards crash location on National Highway 16.": "ఆంబులెన్స్ జాతీయ రహదారి 16 పై ప్రమాద స్థలానికి వేగంగా వస్తోంది.",
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.": "ఆంబులెన్స్ ప్రమాద స్థలానికి చేరుకుంది. పారామెడిక్స్ బాధితుడిని స్ట్రెచర్ పైకి ఎక్కిస్తున్నారు.",
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": "బాధితుడిని ఆంబులెన్స్ లోకి ఎక్కించారు. గ్రీన్ కారిడార్ ద్వారా ఆసుపత్రికి తీసుకెళ్తున్నారు.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": "బాధితుడు సురక్షితంగా ఆసుపత్రికి చేరాడు. ఐసియులో చేర్చబడ్డాడు. రోగి సురక్షితంగా ఉన్నాడు!",
  "Navigating to Blood Donation Finder.": "రక్త దాతల మ్యాచ్ పేజీకి వెళ్తున్నాము.",
  "Navigating to Snakebite First Aid and Antivenom.": "పాము కాటు మరియు యాంటీవెనమ్ పేజీకి వెళ్తున్నాము.",
  "Navigating to 3D Vehicle Crash Simulation.": "3D వాహన ప్రమాద రెస్క్యూ పేజీకి వెళ్తున్నాము.",
  "Navigating to Hospital Mission Control.": "ఆసుపత్రి మిషన్ కంట్రోల్ పేజీకి వెళ్తున్నాము.",
  "Please select which snake matches what you encountered from the visual gallery below.": "ఏ పాము కాటు వేసిందో క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.": "ఏ పాము కాటు వేసిందో క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": "హెచ్చరిక! మీరు అతివేగంగా వెళ్తున్నారు. దయచేసి వెంటనే వేగాన్ని తగ్గించండి.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.": "జాగ్రత్త! ముందు ప్రమాదకరమైన మలుపు మరియు యాక్సిడెంట్ జోన్ ఉంది. నెమ్మదిగా నడపండి.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.": "జాగ్రత్త! వాహనం అస్థిరంగా ఉంది. దయచేసి లేన్ నియంత్రణ పాటించండి.",
  "Speed normalized. You are safe! Hazard avoided.": "వేగం సురక్షిత స్థాయికి తగ్గింది. మీరు ఇప్పుడు సురక్షితంగా ఉన్నారు!",
  "SOS Cancelled. Stay safe.": "అత్యవసర SOS రద్దు చేయబడింది. సురక్షితంగా ఉండండి.",
  "Emergency! High impact vehicle crash detected! Dispatching rescue teams.": "అత్యవసరం! తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది! రెస్క్యూ బృందాలు పంపబడుతున్నాయి.",
  "Emergency SOS Beacon broadcasted to all registered contacts and nearby hospitals.": "అత్యవసర SOS సిగ్నల్ అన్ని సంప్రదింపులు మరియు సమీప ఆసుపత్రులకు పంపబడింది.",
  "Emergency SOS Beacon broadcasted to all rescue agencies and family members.": "అత్యవసర SOS సిగ్నల్ అన్ని రెస్క్యూ ఏజెన్సీలు మరియు కుటుంబ సభ్యులకు పంపబడింది.",
  "24/7 Emergency alert notifications are now active.": "24 గంటల అత్యవసర హెచ్చరిక నోటిఫికేషన్‌లు యాక్టివ్ అయ్యాయి.",
  "24/7 Emergency alert notifications activated.": "24 గంటల అత్యవసర నోటిఫికేషన్‌లు యాక్టివ్ చేయబడ్డాయి.",
  "Emergency notifications enabled.": "అత్యవసర నోటిఫికేషన్‌లు ఆన్ చేయబడ్డాయి.",
  "Rescue mission completed. Patient safely delivered to trauma bay.": "రెస్క్యూ మిషన్ పూర్తయింది. రోగి సురక్షితంగా ట్రామా బేకు చేర్చబడ్డాడు.",
  "Emergency SOS alert broadcast to hospitals.": "అత్యవసర SOS హెచ్చరిక ఆసుపత్రులకు ప్రసారం చేయబడింది.",
  "108 Rescue Team accepted case. Ambulance en route.": "108 రెస్క్యూ బృందం కేసును స్వీకరించింది. ఆంబులెన్స్ బయలుదేరింది.",
  "Hospital accepted emergency SOS. ICU bed reserved.": "ఆసుపత్రి అత్యవసర కేసును అంగీకరించింది. ఐసియు బెడ్ కేటాయించబడింది.",
  "Blood donor confirmed. Cold chain courier assigned.": "రక్త దాత నిర్ధారించబడ్డాడు. కోల్డ్ చైన్ కొరియర్ బయలుదేరింది.",
  "First responder accepted emergency rescue mission.": "ఫస్ట్ రెస్పాండర్ రెస్క్యూ మిషన్‌ను ప్రారంభించారు.",
  "తెలుగు భాష ఎంచుకోబడింది.": "తెలుగు భాష ఎంచుకోబడింది.",
};

const HINDI_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": "गंभीर वाहन दुर्घटना का पता चला है। 10 सेकंड में स्वचालित बचाव दल रवाना होगा।",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": "गंभीर वाहन दुर्घटना का पता चला है। 25 सेकंड में स्वचालित बचाव दल रवाना होगा।",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": "आपातकालीन SOS की पुष्टि हुई। जीजीएच अस्पताल ने केस स्वीकार किया। एम्बुलेंस रवाना हुई।",
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": "सरकारी अस्पताल ने आपातकालीन मामला स्वीकार किया। ALS एम्बुलेंस रवाना हुई।",
  "Ambulance is moving towards crash location on National Highway 16.": "एम्बुलेंस राष्ट्रीय राजमार्ग 16 पर दुर्घटना स्थल की ओर जा रही है।",
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.": "एम्बुलेंस दुर्घटना स्थल पर पहुंच गई। पैरामेडिक्स पीड़ित को स्थिर कर रहे हैं।",
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": "पीड़ित को एम्बुलेंस में सुरक्षित किया गया। ग्रीन कॉरिडोर से अस्पताल ले जाया जा रहा है।",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": "पीड़ित सुरक्षित रूप से अस्पताल पहुंच गया। आईसीयू में भर्ती कराया गया। मरीज सुरक्षित है!",
  "Navigating to Blood Donation Finder.": "रक्त दाता खोज पेज पर जा रहे हैं।",
  "Navigating to Snakebite First Aid and Antivenom.": "सर्पदंश प्राथमिक चिकित्सा पेज पर जा रहे हैं।",
  "Navigating to 3D Vehicle Crash Simulation.": "3D वाहन दुर्घटना पेज पर जा रहे हैं।",
  "Navigating to Hospital Mission Control.": "अस्पताल मिशन कंट्रोल पेज पर जा रहे हैं।",
  "Please select which snake matches what you encountered from the visual gallery below.": "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.": "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": "चेतावनी! आप अत्यधिक गति से जा रहे हैं। कृपया तुरंत गति धीमी करें।",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.": "सावधानी! आगे राष्ट्रीय राजमार्ग 16 पर दुर्घटना संभावित क्षेत्र है। धीरे चलाएं।",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.": "सावधानी! वाहन अचानक लेन बदल रहा है। वाहन स्थिरता बनाए रखें।",
  "Speed normalized. You are safe! Hazard avoided.": "गति सामान्य हो गई है। आप अब सुरक्षित हैं!",
  "SOS Cancelled. Stay safe.": "आपातकालीन SOS रद्द कर दिया गया। सुरक्षित रहें।",
  "Emergency! High impact vehicle crash detected! Dispatching rescue teams.": "आपातकाल! भारी वाहन दुर्घटना का पता चला! बचाव दल रवाना हो रहे हैं।",
  "Emergency SOS Beacon broadcasted to all registered contacts and nearby hospitals.": "SOS सिग्नल सभी पंजीकृत संपर्कों और निकटतम अस्पतालों को भेजा गया।",
  "Emergency SOS Beacon broadcasted to all rescue agencies and family members.": "आपातकालीन SOS सिग्नल सभी एजेंसियों और परिजनों को भेजा गया।",
  "24/7 Emergency alert notifications are now active.": "आपातकालीन अलर्ट नोटिफिकेशन अब 24 घंटे सक्रिय है।",
  "24/7 Emergency alert notifications activated.": "24 घंटे आपातकालीन अलर्ट सूचनाएं सक्रिय की गईं।",
  "Emergency notifications enabled.": "आपातकालीन सूचनाएं चालू की गई हैं।",
  "Rescue mission completed. Patient safely delivered to trauma bay.": "बचाव मिशन पूरा हुआ। मरीज सुरक्षित रूप से ट्रॉमा बे पहुंचाया गया।",
  "Emergency SOS alert broadcast to hospitals.": "अस्पतालों को आपातकालीन SOS अलर्ट भेजा गया।",
  "108 Rescue Team accepted case. Ambulance en route.": "108 बचाव दल ने मामला स्वीकार किया। एम्बुलेंस रवाना हो गई।",
  "Hospital accepted emergency SOS. ICU bed reserved.": "अस्पताल ने आपातकालीन अनुरोध स्वीकार किया। आईसीयू बेड आरक्षित किया गया।",
  "Blood donor confirmed. Cold chain courier assigned.": "रक्त दाता की पुष्टि हो गई। कोल्ड चेन कूरियर रवाना हुआ।",
  "First responder accepted emergency rescue mission.": "प्रथम प्रतिक्रियाकर्ता ने बचाव मिशन शुरू किया।",
  "हिंदी भाषा चुनी गई है।": "हिंदी भाषा चुनी गई है।",
};

const TAMIL_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": "கடுமையான வாகன விபத்து கண்டறியப்பட்டது. 10 வினாடிகளில் மீட்புக்குழு புறப்படும்.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": "கடுமையான வாகன விபத்து கண்டறியப்பட்டது. 25 வினாடிகளில் மீட்புக்குழு புறப்படும்.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": "அவசர SOS உறுதி செய்யப்பட்டது. அரசு மருத்துவமனை வழக்கை ஏற்றது. 108 ஆம்புலன்ஸ் புறப்பட்டது.",
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": "அரசு பொது மருத்துவமனை அவசர வழக்கை ஏற்றது. 108 ஆம்புலன்ஸ் புறப்பட்டது.",
  "Ambulance is moving towards crash location on National Highway 16.": "ஆம்புலன்ஸ் தேசிய நெடுஞ்சாலை 16 வழியாக விபத்து இடத்திற்கு விரைகிறது.",
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.": "ஆம்புலன்ஸ் விபத்து இடத்தில் சேர்ந்தது. பாரமெடிக்குகள் பாதிக்கப்பட்டவரை படுக்கையில் ஏற்றுகின்றனர்.",
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": "பாதிக்கப்பட்டவர் ஆம்புலன்ஸில் வைக்கப்பட்டார். பச்சை தடம் வழியாக மருத்துவமனைக்கு கொண்டு செல்லப்படுகிறார்.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": "பாதிக்கப்பட்டவர் பாதுகாப்பாக மருத்துவமனை சென்றடைந்தார். தீவிர சிகிச்சை பிரிவில் அனுமதிக்கப்பட்டார்!",
  "Navigating to Blood Donation Finder.": "இரத்த தானம் தேடும் பக்கத்திற்கு செல்கிறது.",
  "Navigating to Snakebite First Aid and Antivenom.": "பாம்புக்கடி முதலுதவி பக்கத்திற்கு செல்கிறது.",
  "Navigating to 3D Vehicle Crash Simulation.": "3D விபத்து பக்கத்திற்கு செல்கிறது.",
  "Navigating to Hospital Mission Control.": "மருத்துவமனை கட்டுப்பாட்டு மையத்திற்கு செல்கிறது.",
  "Please select which snake matches what you encountered from the visual gallery below.": "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.": "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": "எச்சரிக்கை! நீங்கள் அதிவேகமாக செல்கிறீர்கள். உடனே வேகத்தைக் குறைக்கவும்.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.": "எச்சரிக்கை! முன்னால் விபத்து அபாய பகுதி உள்ளது. மெதுவாக செல்லவும்.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.": "எச்சரிக்கை! வாகனம் நிலைதடுமாறுகிறது. கவனமாக ஓட்டவும்.",
  "Speed normalized. You are safe! Hazard avoided.": "வேகம் இயல்பு நிலைக்கு திரும்பியது. நீங்கள் பாதுகாப்பாக உள்ளீர்கள்!",
  "SOS Cancelled. Stay safe.": "அவசர எச்சரிக்கை ரத்து செய்யப்பட்டது. பாதுகாப்பாக இருங்கள்.",
  "Emergency! High impact vehicle crash detected! Dispatching rescue teams.": "அவசரநிலை! கடுமையான வாகன விபத்து கண்டறியப்பட்டது! மீட்புக்குழுக்கள் அனுப்பப்படுகின்றன.",
  "Emergency SOS Beacon broadcasted to all registered contacts and nearby hospitals.": "அவசர SOS சிக்னல் அனைத்து தொடர்புகளுக்கும் அருகிலுள்ள மருத்துவமனைகளுக்கும் அனுப்பப்பட்டது.",
  "Emergency SOS Beacon broadcasted to all rescue agencies and family members.": "அவசர SOS சிக்னல் அனைத்து மீட்பு அமைப்புகளுக்கும் குடும்பத்தினருக்கும் அனுப்பப்பட்டது.",
  "24/7 Emergency alert notifications are now active.": "அவசர எச்சரிக்கை அறிவிப்புகள் இப்போது 24 மணி நேரமும் செயலில் உள்ளன.",
  "24/7 Emergency alert notifications activated.": "24 மணி நேர அவசர எச்சரிக்கை அறிவிப்புகள் இயக்கப்பட்டன.",
  "Emergency notifications enabled.": "அவசர அறிவிப்புகள் இயக்கப்பட்டன.",
  "Rescue mission completed. Patient safely delivered to trauma bay.": "மீட்பு பணி நிறைவடைந்தது. நோயாளி பாதுகாப்பாக மருத்துவமனை அடைந்தார்.",
  "Emergency SOS alert broadcast to hospitals.": "மருத்துவமனைகளுக்கு அவசர SOS எச்சரிக்கை அனுப்பப்பட்டது.",
  "108 Rescue Team accepted case. Ambulance en route.": "108 மீட்புக் குழு வழக்கை ஏற்றது. ஆம்புலன்ஸ் புறப்பட்டது.",
  "Hospital accepted emergency SOS. ICU bed reserved.": "மருத்துவமனை அவசர கோரிக்கையை ஏற்றது. தீவிர சிகிச்சை படுக்கை ஒதுக்கப்பட்டது.",
  "Blood donor confirmed. Cold chain courier assigned.": "இரத்த தானம் செய்பவர் உறுதி செய்யப்பட்டார். கூரியர் அனுப்பப்பட்டது.",
  "First responder accepted emergency rescue mission.": "முதல் மீட்பாளர் மீட்புப் பணியைத் தொடங்கினார்.",
  "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.": "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.",
};

const KANNADA_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.": "ತೀವ್ರ ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. 10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಕ್ಷಣಾ ಪಡೆ ಹೊರಡಲಿದೆ.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.": "ತೀವ್ರ ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. 25 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರಕ್ಷಣಾ ಪಡೆ ಹೊರಡಲಿದೆ.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.": "ತುರ್ತು SOS ದೃಢಪಟ್ಟಿದೆ. ಆಸ್ಪತ್ರೆ ಪ್ರಕರಣ ಸ್ವೀಕರಿಸಿದೆ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.",
  "Government General Hospital Vijayawada accepted emergency SOS. ALS Ambulance 108 dispatched.": "ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ತುರ್ತು ಪ್ರಕರಣ ಸ್ವೀಕರಿಸಿದೆ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.",
  "Ambulance is moving towards crash location on National Highway 16.": "ಆಂಬ್ಯುಲೆನ್ಸ್ ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ 16 ಮೇಲೆ ಅಪಘಾತ ಸ್ಥಳಕ್ಕೆ ಹೋಗುತ್ತಿದೆ.",
  "Ambulance arrived at crash scene. Paramedics stabilizing victim onto stretcher.": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಪಘಾತ ಸ್ಥಳ ತಲುಪಿದೆ. ಸಂತ್ರಸ್ತರನ್ನು ಸ್ಟ್ರೆಚರ್‌ಗೆ ಹಾಕಲಾಗುತ್ತಿದೆ.",
  "Victim secured in ALS unit. Transporting to hospital emergency trauma bay via green corridor.": "ಸಂತ್ರಸ್ತರನ್ನು ಹಸಿರು ಕಾರಿಡಾರ್ ಮೂಲಕ ಆಸ್ಪತ್ರೆಗೆ ಕೊಂಡೊಯ್ಯಲಾಗುತ್ತಿದೆ.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!": "ಸಂತ್ರಸ್ತರು ಸುರಕ್ಷಿತವಾಗಿ ಆಸ್ಪತ್ರೆ ತಲುಪಿದ್ದಾರೆ. ರೋಗಿ ಸುರಕ್ಷಿತವಾಗಿದ್ದಾರೆ!",
  "Navigating to Blood Donation Finder.": "ರಕ್ತದಾನ ಹುಡುಕಾಟ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Navigating to Snakebite First Aid and Antivenom.": "ಹಾವು ಕಡಿತ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Navigating to 3D Vehicle Crash Simulation.": "3D ವಾಹನ ಅಪಘಾತ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Navigating to Hospital Mission Control.": "ಆಸ್ಪತ್ರೆ ಮಿಷನ್ ಕಂಟ್ರೋಲ್ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Please select which snake matches what you encountered from the visual gallery below.": "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.": "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.": "ಎಚ್ಚರಿಕೆ! ನೀವು ಅತಿವೇಗದಲ್ಲಿ ಚಲಿಸುತ್ತಿದ್ದೀರಿ. ತಕ್ಷಣ ವೇಗ ಕಡಿಮೆ ಮಾಡಿ.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.": "ಎಚ್ಚರಿಕೆ! ಮುಂದೆ ಅಪಾಯಕಾರಿ ತಿರುವು ಮತ್ತು ಅಪಘಾತ ವಲಯವಿದೆ. ನಿಧಾನವಾಗಿ ಚಲಿಸಿ.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.": "ಎಚ್ಚರಿಕೆ! ವಾಹನ ಅಸ್ಥಿರವಾಗಿದೆ. ಲೇನ್ ನಿಯಂತ್ರಣ ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
  "Speed normalized. You are safe! Hazard avoided.": "ವೇಗ ಸಹಜ ಸ್ಥಿತಿಗೆ ಬಂದಿದೆ. ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ!",
  "SOS Cancelled. Stay safe.": "ತುರ್ತು SOS ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ಸುರಕ್ಷಿತವಾಗಿರಿ.",
  "Emergency! High impact vehicle crash detected! Dispatching rescue teams.": "ತುರ್ತು! ತೀವ್ರ ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ! ರಕ್ಷಣಾ ತಂಡಗಳು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.",
  "Emergency SOS Beacon broadcasted to all registered contacts and nearby hospitals.": "SOS ಸಿಗ್ನಲ್ ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಸಂಪರ್ಕಗಳಿಗೆ ಮತ್ತು ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳಿಗೆ ಕಳಿಸಲಾಗಿದೆ.",
  "Emergency SOS Beacon broadcasted to all rescue agencies and family members.": "ತುರ್ತು SOS ಸಿಗ್ನಲ್ ಎಲ್ಲಾ ಏಜೆನ್ಸಿಗಳಿಗೆ ಮತ್ತು ಕುಟುಂಬಸ್ಥರಿಗೆ ಕಳಿಸಲಾಗಿದೆ.",
  "24/7 Emergency alert notifications are now active.": "ತುರ್ತು ಎಚ್ಚರಿಕೆ ಅಧಿಸೂಚನೆಗಳು ಈಗ 24 ಗಂಟೆ ಸಕ್ರಿಯ.",
  "24/7 Emergency alert notifications activated.": "24 ಗಂಟೆಯ ತುರ್ತು ಅಧಿಸೂಚನೆಗಳು ಸಕ್ರಿಯಗೊಂಡಿವೆ.",
  "Emergency notifications enabled.": "ತುರ್ತು ಅಧಿಸೂಚನೆಗಳು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.",
  "Rescue mission completed. Patient safely delivered to trauma bay.": "ರಕ್ಷಣಾ ಮಿಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ರೋಗಿ ಟ್ರಾಮಾ ಬೇ ತಲುಪಿದ್ದಾರೆ.",
  "Emergency SOS alert broadcast to hospitals.": "ಆಸ್ಪತ್ರೆಗಳಿಗೆ ತುರ್ತು SOS ಎಚ್ಚರಿಕೆ ಕಳಿಸಲಾಗಿದೆ.",
  "108 Rescue Team accepted case. Ambulance en route.": "108 ರಕ್ಷಣಾ ತಂಡ ಪ್ರಕರಣ ಸ್ವೀಕರಿಸಿದೆ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.",
  "Hospital accepted emergency SOS. ICU bed reserved.": "ಆಸ್ಪತ್ರೆ ತುರ್ತು ಪ್ರಕರಣ ಸ್ವೀಕರಿಸಿದೆ. ಐಸಿಯು ಹಾಸಿಗೆ ಮೀಸಲಿಡಲಾಗಿದೆ.",
  "Blood donor confirmed. Cold chain courier assigned.": "ರಕ್ತದಾನಿ ದೃಢಪಟ್ಟಿದ್ದಾರೆ. ಕೋಲ್ಡ್ ಚೈನ್ ಕೊರಿಯರ್ ಹೊರಟಿದೆ.",
  "First responder accepted emergency rescue mission.": "ಮೊದಲ ಪ್ರತಿಕ್ರಿಯೆಗಾರರು ರಕ್ಷಣಾ ಕಾರ್ಯಾಚರಣೆ ಆರಂಭಿಸಿದ್ದಾರೆ.",
  "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ.": "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ.",
};

// ================= DYNAMIC TRANSLATION PATTERN MATCHERS =================

export function translateToTeluguDynamic(text) {
  if (TELUGU_AUDIO_MAP[text]) return TELUGU_AUDIO_MAP[text];
  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "ఏ పాము కాటు వేసిందో క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors') || lower.includes('blood donor')) {
    return "సరిపోలిన రక్త దాతలు మరియు రక్త బ్యాంకులు విజయవంతంగా కనుగొనబడ్డాయి.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "అత్యవసర రక్త అభ్యర్థన పంపబడింది. కోల్డ్ చైన్ కొరియర్ బయలుదేరింది.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "ఆసుపత్రిలో యాంటీవెనమ్ రిజర్వ్ చేయబడింది. అంబులెన్స్ బయలుదేరింది.";
  }
  if (lower.includes('first aid') || lower.includes('precautions')) {
    return "ప్రథమ చికిత్స సూచన: రోగిని ప్రశాంతంగా ఉంచండి, గాయాన్ని కదల్చకుండా వెంటనే ఆసుపత్రికి చేర్చండి.";
  }
  if (lower.includes('route') && (lower.includes('hospital') || lower.includes('calculated') || lower.includes('driving'))) {
    return "ఆసుపత్రికి వేగవంతమైన ప్రయాణ మార్గం మ్యాప్‌లో చూపబడింది.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర రెస్క్యూ బృందాలు బయలుదేరాయి.";
  }
  if (lower.includes('speed limit exceeded') || lower.includes('slow down')) {
    return "హెచ్చరిక! వేగ పరిమితి దాటింది. దయచేసి నెమ్మదిగా నడపండి.";
  }
  if (lower.includes('harsh braking')) {
    return "హెచ్చరిక! అకస్మాత్తుగా బ్రేక్ వేయబడింది. జాగ్రత్తగా నడపండి.";
  }
  if (lower.includes('emergency sos alert') || lower.includes('emergency sos beacon')) {
    return "అత్యవసర SOS సిగ్నల్ సమీప ఆసుపత్రులు మరియు బంధువులకు పంపబడింది.";
  }
  return text;
}

export function translateToHindiDynamic(text) {
  if (HINDI_AUDIO_MAP[text]) return HINDI_AUDIO_MAP[text];
  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors') || lower.includes('blood donor')) {
    return "उपयुक्त रक्त दाता और ब्लड बैंक सफलतापूर्वक मिल गए हैं।";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "आपातकालीन रक्त सहायता अनुरोध भेजा गया। कूरियर रवाना हुआ।";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "अस्पताल में एंटीवेनम आरक्षित किया गया। एम्बुलेंस रवाना हुई।";
  }
  if (lower.includes('first aid') || lower.includes('precautions')) {
    return "प्राथमिक उपचार: मरीज को शांत रखें और तुरंत नजदीकी अस्पताल ले जाएं।";
  }
  if (lower.includes('route') && (lower.includes('hospital') || lower.includes('calculated') || lower.includes('driving'))) {
    return "अस्पताल के लिए सड़क मार्ग मानचित्र पर तैयार है।";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "गंभीर वाहन दुर्घटना का पता चला है। आपातकालीन बचाव दल रवाना किया जा रहा है।";
  }
  if (lower.includes('speed limit exceeded') || lower.includes('slow down')) {
    return "चेतावनी! आप गति सीमा पार कर रहे हैं। कृपया गति धीमी करें।";
  }
  if (lower.includes('harsh braking')) {
    return "सावधानी! अचानक ब्रेक लगाया गया। सुरक्षित रूप से चलाएं।";
  }
  return text;
}

export function translateToTamilDynamic(text) {
  if (TAMIL_AUDIO_MAP[text]) return TAMIL_AUDIO_MAP[text];
  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors') || lower.includes('blood donor')) {
    return "பொருத்தமான இரத்த வங்கிகள் மற்றும் இரத்த தானம் செய்பவர்கள் கண்டுபிடிக்கப்பட்டனர்.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "அவசர இரத்த உதவி கோரிக்கை அனுப்பப்பட்டது. கூரியர் புறப்பட்டது.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "மருத்துவமனையில் நச்சு முறிவு மருந்து ஒதுக்கப்பட்டது. ஆம்புலன்ஸ் புறப்பட்டது.";
  }
  if (lower.includes('first aid') || lower.includes('precautions')) {
    return "முதலுதவி நெறிமுறை: பாதிக்கப்பட்டவரை அமைதியாக வைத்திருங்கள், உடனடியாக மருத்துவமனைக்கு அழைத்துச் செல்லுங்கள்.";
  }
  if (lower.includes('route') && (lower.includes('hospital') || lower.includes('calculated') || lower.includes('driving'))) {
    return "மருத்துவமனைக்கான பாதை வரைபடத்தில் காட்டப்பட்டுள்ளது.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "வாகன விபத்து கண்டறியப்பட்டது. அவசர மீட்புக்குழு புறப்படுகிறது.";
  }
  if (lower.includes('speed limit exceeded') || lower.includes('slow down')) {
    return "எச்சரிக்கை! நீங்கள் வேக வரம்பைத் தாண்டிவிட்டீர்கள். மெதுவாக ஓட்டவும்.";
  }
  return text;
}

export function translateToKannadaDynamic(text) {
  if (KANNADA_AUDIO_MAP[text]) return KANNADA_AUDIO_MAP[text];
  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors') || lower.includes('blood donor')) {
    return "ಹತ್ತಿರದ ರಕ್ತ ನಿಧಿ ಮತ್ತು ರಕ್ತದಾನಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "ತುರ್ತು ರಕ್ತ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ಶೀತಲ ಸರಪಳಿ ಕೊರಿಯರ್ ಹೊರಟಿದೆ.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಆಂಟಿವೆನಮ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ. ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.";
  }
  if (lower.includes('first aid') || lower.includes('precautions')) {
    return "ಡಬ್ಲ್ಯುಎಚ್‌ಒ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ: ಗಾಯಗೊಂಡವರನ್ನು ಶಾಂತರಾಗಿರಿಸಿ ಮತ್ತು ತಕ್ಷಣವೇ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.";
  }
  if (lower.includes('route') && (lower.includes('hospital') || lower.includes('calculated') || lower.includes('driving'))) {
    return "ಆಸ್ಪತ್ರೆಗೆ ರಸ್ತೆ ಮಾರ್ಗವನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಲಾಗಿದೆ.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. ತುರ್ತು ರಕ್ಷಣಾ ತಂಡ ಹೊರಡುತ್ತಿದೆ.";
  }
  if (lower.includes('speed limit exceeded') || lower.includes('slow down')) {
    return "ಎಚ್ಚರಿಕೆ! ನೀವು ವೇಗದ ಮಿತಿಯನ್ನು ಮೀರಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಚಾಲನೆ ಮಾಡಿ.";
  }
  return text;
}

// ================= STOP ALL AUDIO =================

export const stopAllAudio = () => {
  if (typeof window === 'undefined') return;

  try {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }

    // Stop native Web SpeechSynthesis
    if ('speechSynthesis' in window) {
      if (window._resqone_active_utterance) {
        window._resqone_active_utterance.onend = null;
        window._resqone_active_utterance.onerror = null;
        window._resqone_active_utterance = null;
      }
      window.speechSynthesis.cancel();
    }

    // Stop fallback HTML5 Audio
    if (currentAudioElement) {
      try {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
        currentAudioElement = null;
      } catch {}
    }

    // Dispatch global event for UI indicator
    window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
  } catch (err) {
    console.warn('[AudioService] stopAllAudio failed gracefully:', err);
  }
};

// ================= AUDIO STREAM FALLBACK (GOOGLE TTS) =================

function playStreamFallback(text, langCode) {
  try {
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement = null;
    }

    const ttsLang = ['te', 'hi', 'ta', 'kn', 'en'].includes(langCode) ? langCode : 'en';
    const trimmed = text.length > 200 ? text.slice(0, 197) + '...' : text;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(trimmed)}`;

    const audio = new Audio(url);
    currentAudioElement = audio;

    audio.onplay = () => {
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: true, text: trimmed } }));
    };

    audio.onended = () => {
      currentAudioElement = null;
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
    };

    audio.onerror = () => {
      currentAudioElement = null;
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.warn('[AudioService] Stream fallback autoplay prevented:', err.message);
        window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
      });
    }
  } catch (err) {
    console.warn('[AudioService] playStreamFallback failed:', err);
  }
}

// ================= CORE SPEAK FUNCTION =================

/**
 * Speak an emergency instruction or system message in the selected language.
 * @param {string} text - The instruction or phrase to speak (can be English or native)
 * @param {string|null} forcedLang - Language code ('te', 'hi', 'ta', 'kn', 'en') or null for user's active language
 */
export const speakEmergencyInstruction = (text, forcedLang = null) => {
  if (typeof window === 'undefined') return;
  if (isAudioMuted) return;

  try {
    stopAllAudio();

    if (!text || typeof text !== 'string') return;

    // Resolve target language
    const selectedLang = forcedLang || localStorage.getItem('resqone_language') || 'en';
    
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
      spokenText = translateToTamilDynamic(text);
    } else if (selectedLang === 'kn') {
      targetLocale = 'kn-IN';
      spokenText = translateToKannadaDynamic(text);
    } else {
      targetLocale = 'en-IN';
      spokenText = text;
    }

    // Check Web SpeechSynthesis availability
    const hasSpeech = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    
    if (!hasSpeech) {
      // Direct stream fallback for environments without SpeechSynthesis
      playStreamFallback(spokenText, selectedLang);
      return;
    }

    const voices = window.speechSynthesis.getVoices() || [];
    const hasIndianVoice = voices.some(v => v.lang && (v.lang.startsWith(selectedLang) || v.lang.startsWith(targetLocale)));

    // On Windows/desktop browsers, if a non-English language is requested but no regional voice is installed,
    // speech synthesis will speak garbled/silent English voice reading native script.
    // In that case, use natural streaming audio for authentic accent!
    if (selectedLang !== 'en' && !hasIndianVoice && voices.length > 0) {
      playStreamFallback(spokenText, selectedLang);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = targetLocale;
    utterance.rate = selectedLang === 'te' ? 0.86 : selectedLang === 'hi' ? 0.88 : selectedLang === 'ta' ? 0.86 : selectedLang === 'kn' ? 0.86 : 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window._resqone_active_utterance = utterance;

    utterance.onstart = () => {
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: true, text: spokenText } }));
    };

    utterance.onend = () => {
      window._resqone_active_utterance = null;
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
    };

    utterance.onerror = (e) => {
      window._resqone_active_utterance = null;
      window.dispatchEvent(new CustomEvent('resqone_speech_status', { detail: { isSpeaking: false } }));
      // If Web Speech fails with an error, fall back to streaming audio
      if (selectedLang !== 'en') {
        playStreamFallback(spokenText, selectedLang);
      }
    };

    if (voices && voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang && (v.lang.startsWith(selectedLang) || v.lang.startsWith(targetLocale))) 
        || voices.find(v => v.lang && (v.lang.startsWith('en-IN') || v.lang.startsWith('en'))) 
        || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    speechTimeout = setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioService] SpeechSynthesis.speak failed, using stream fallback:', err);
        playStreamFallback(spokenText, selectedLang);
      }
    }, 80);
  } catch (err) {
    console.warn('[AudioService] Speech error:', err);
    try {
      playStreamFallback(text, forcedLang || 'en');
    } catch {}
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

  // Ensure voices are loaded when ready
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
