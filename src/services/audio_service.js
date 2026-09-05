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
  "Please select which snake matches what you encountered from the visual gallery below.":
    "ఏ పాము కాటు వేసిందో గుర్తించడానికి క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "ఏ పాము కాటు వేసిందో గుర్తించడానికి క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "హెచ్చరిక! మీరు అతివేగంగా వెళ్తున్నారు. ఇది ప్రమాదకరం, దయచేసి వెంటనే వేగాన్ని తగ్గించండి.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "జాగ్రత్త! ముందు జాతీయ రహదారిపై ప్రమాదకరమైన మలుపు మరియు యాక్సిడెంట్ జోన్ ఉంది. నెమ్మదిగా నడపండి.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.":
    "జాగ్రత్త! వాహనం అస్థిరంగా మలుపులు తిరుగుతోంది. దయచేసి లేన్ నియంత్రణ పాటించండి.",
  "Speed normalized. You are safe! Hazard avoided.":
    "వేగం సురక్షిత స్థాయికి తగ్గింది. మీరు ఇప్పుడు సురక్షితంగా ఉన్నారు! ప్రమాదం తప్పింది.",
  "SOS Cancelled. Stay safe.":
    "అత్యవసర SOS రద్దు చేయబడింది. సురక్షితంగా ఉండండి."
};

const HINDI_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.":
    "गंभीर वाहन दुर्घटना का पता चला है। 10 सेकंड में स्वचालित बचाव दल रवाना होगा।",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.":
    "आपातकालीन SOS की पुष्टि हुई। जीजीएच अस्पताल ने केस स्वीकार किया। एम्बुलेंस रवाना हुई।",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!":
    "पीड़ित सुरक्षित रूप से अस्पताल पहुंच गया है। आईसीयू में भर्ती कराया गया। मरीज सुरक्षित है!",
  "Navigating to Blood Donation Finder.":
    "रक्त दाता खोज पेज पर ले जाया जा रहा है।",
  "Navigating to Snakebite First Aid and Antivenom.":
    "सर्पदंश प्राथमिक चिकित्सा पेज पर ले जाया जा रहा है।",
  "Please select which snake matches what you encountered from the visual gallery below.":
    "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "चेतावनी! आप अत्यधिक गति से जा रहे हैं। कृपया तुरंत गति धीमी करें।",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "सावधानी! आगे राष्ट्रीय राजमार्ग 16 पर अत्यधिक दुर्घटना संभावित क्षेत्र है। कृपया वाहन धीरे चलाएं।",
  "Speed normalized. You are safe! Hazard avoided.":
    "गति सामान्य हो गई है। आप अब सुरक्षित हैं! खतरा टल गया है।",
  "SOS Cancelled. Stay safe.":
    "आपातकालीन SOS रद्द कर दिया गया है। सुरक्षित रहें।"
};

const TAMIL_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.":
    "கடுமையான வாகன விபத்து கண்டறியப்பட்டது. 10 வினாடிகளில் தானியங்கி மீட்புக்குழு புறப்படும்.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.":
    "கடுமையான வாகன விபத்து கண்டறியப்பட்டது. 25 வினாடிகளில் தானியங்கி மீட்புக்குழு புறப்படும்.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.":
    "அவசர SOS உறுதி செய்யப்பட்டது. அரசு பொது மருத்துவமனை வழக்கை ஏற்றது. 108 ஆம்புலன்ஸ் புறப்பட்டது.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!":
    "பாதிக்கப்பட்டவர் பாதுகாப்பாக மருத்துவமனை சென்றடைந்தார். தீவிர சிகிச்சை பிரிவில் அனுமதிக்கப்பட்டார்!",
  "Navigating to Blood Donation Finder.":
    "இரத்த தானம் தேடும் பக்கத்திற்கு செல்கிறது.",
  "Navigating to Snakebite First Aid and Antivenom.":
    "பாம்புக்கடி முதலுதவி பக்கத்திற்கு செல்கிறது.",
  "Navigating to 3D Vehicle Crash Simulation.":
    "3D விபத்து பக்கத்திற்கு செல்கிறது.",
  "Please select which snake matches what you encountered from the visual gallery below.":
    "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "எச்சரிக்கை! நீங்கள் அதிவேகமாக செல்கிறீர்கள். உடனே வேகத்தைக் குறைக்கவும்.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "எச்சரிக்கை! முன்னால் விபத்து ஏற்படும் அபாய பகுதி உள்ளது. மெதுவாக செல்லவும்.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.":
    "எச்சரிக்கை! வாகனம் நிலைதடுமாறுகிறது. கவனமாக ஓட்டவும்.",
  "Speed normalized. You are safe! Hazard avoided.":
    "வேகம் இயல்பு நிலைக்கு திரும்பியது. நீங்கள் பாதுகாப்பாக உள்ளீர்கள்!",
  "SOS Cancelled. Stay safe.":
    "அவசர எச்சரிக்கை ரத்து செய்யப்பட்டது. பாதுகாப்பாக இருங்கள்."
};

const KANNADA_AUDIO_MAP = {
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 10 seconds.":
    "ತೀವ್ರ ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. 10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ರಕ್ಷಣಾ ಪಡೆ ಹೊರಡಲಿದೆ.",
  "Severe vehicle crash detected. Emergency SOS countdown active. Automatic rescue dispatch in 25 seconds.":
    "ತೀವ್ರ ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. 25 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ರಕ್ಷಣಾ ಪಡೆ ಹೊರಡಲಿದೆ.",
  "Emergency SOS Confirmed. GGH Vijayawada accepted case. Ambulance ALS 108 dispatched.":
    "ತುರ್ತು SOS ದೃಢಪಟ್ಟಿದೆ. ಆಸ್ಪತ್ರೆ ಪ್ರಕರಣವನ್ನು ಸ್ವೀಕರಿಸಿದೆ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.",
  "Victim arrived safely at hospital trauma bay. Admitted to ICU. Patient is safe!":
    "ಸಂತ್ರಸ್ತರು ಸುರಕ್ಷಿತವಾಗಿ ಆಸ್ಪತ್ರೆ ತಲುಪಿದ್ದಾರೆ. ರೋಗಿ ಸುರಕ್ಷಿತವಾಗಿದ್ದಾರೆ!",
  "Navigating to Blood Donation Finder.":
    "ರಕ್ತದಾನಿಗಳ ಹುಡುಕಾಟ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Navigating to Snakebite First Aid and Antivenom.":
    "ಹಾವು ಕಡಿತ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Navigating to 3D Vehicle Crash Simulation.":
    "3D ವಾಹನ ಅಪಘಾತ ಪುಟಕ್ಕೆ ತೆರಳಲಾಗುತ್ತಿದೆ.",
  "Please select which snake matches what you encountered from the visual gallery below.":
    "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  "Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.":
    "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  "Warning! High speed detected. You are exceeding the safe limit. Please slow down immediately.":
    "ಎಚ್ಚರಿಕೆ! ನೀವು ಅತಿವೇಗದಲ್ಲಿ ಚಲಿಸುತ್ತಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ವೇಗವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
  "Caution! High-accident risk zone ahead on NH-16 highway. Sharp curve detected, drive slowly.":
    "ಎಚ್ಚರಿಕೆ! ಮುಂದೆ ಅಪಾಯಕಾರಿ ತಿರುವು ಮತ್ತು ಅಪಘಾತ ವಲಯವಿದೆ. ನಿಧಾನವಾಗಿ ಚಲಿಸಿ.",
  "Caution! Sudden lane swerving detected. Please maintain vehicle stability.":
    "ಎಚ್ಚರಿಕೆ! ವಾಹನ ಅಸ್ಥಿರವಾಗಿದೆ. ಲೇನ್ ನಿಯಂತ್ರಣವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
  "Speed normalized. You are safe! Hazard avoided.":
    "ವೇಗ ಸಹಜ ಸ್ಥಿತಿಗೆ ಬಂದಿದೆ. ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ!",
  "SOS Cancelled. Stay safe.":
    "ತುರ್ತು SOS ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ಸುರಕ್ಷಿತವಾಗಿರಿ."
};

/**
 * Dynamic Telugu Speech Translator for runtime templates
 */
function translateToTeluguDynamic(text) {
  if (TELUGU_AUDIO_MAP[text]) return TELUGU_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "ఏ పాము కాటు వేసిందో గుర్తించడానికి క్రింది ఫోటోల నుండి సరైన పామును ఎంచుకోండి.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "సరిపోలే రక్త నిల్వలు మరియు రక్త దాతలు విజయవంతంగా కనుగొనబడ్డాయి.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "అత్యవసర రక్త అభ్యర్థన పంపబడింది. కోల్డ్ చైన్ కొరియర్ తక్షణమే కేటాయించబడింది.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "ఆసుపత్రిలో పాలీవాలెంట్ యాంటీవెనమ్ ఇంజెక్షన్లు రిజర్వ్ చేయబడ్డాయి. అత్యవసర ఆంబులెన్స్ బయలుదేరింది.";
  }
  if (lower.includes('first aid precautions for') || lower.includes('first aid')) {
    return "WHO ప్రథమ చికిత్స మార్గదర్శకాలు: బాధితుడిని కదల్చకుండా ప్రశాంతంగా ఉంచండి. కాటు వేసిన భాగాన్ని గుండె కంటే కిందకు ఉంచి వెంటనే ఆసుపత్రికి తరలించండి.";
  }
  if (lower.includes('route') && lower.includes('hospital')) {
    return "ఆసుపత్రికి వేగవంతమైన రహదారి మార్గం మ్యాప్‌లో చూపించబడింది.";
  }
  if (lower.includes('starting drive') || lower.includes('live drive')) {
    return "డ్రైవింగ్ ప్రారంభమైంది. లైవ్ సెన్సార్లు మరియు స్పీడోమీటర్ పర్యవేక్షణ ఆన్‌లో ఉంది.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. అత్యవసర ఎమర్జెన్సీ రెస్క్యూ బయలుదేరుతుంది.";
  }

  return text;
}

/**
 * Dynamic Hindi Speech Translator for runtime templates
 */
function translateToHindiDynamic(text) {
  if (HINDI_AUDIO_MAP[text]) return HINDI_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "सांप की पहचान करने के लिए नीचे दी गई तस्वीरों में से सही सांप चुनें।";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "रक्त बैंक और संगत रक्त दाता सफलतापूर्वक मिल गए हैं।";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "आपातकालीन रक्त अनुरोध भेजा गया। कोल्ड-चेन कूरियर रवाना हो गया है।";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "अस्पताल में एंटीवेनम आरक्षित किया गया। आपातकालीन एम्बुलेंस रवाना हुई।";
  }
  if (lower.includes('first aid')) {
    return "डब्ल्यूएचओ प्राथमिक उपचार: पीड़ित को स्थिर रखें और तुरंत नजदीकी अस्पताल ले जाएं।";
  }
  if (lower.includes('route') && lower.includes('hospital')) {
    return "अस्पताल के लिए सड़क मार्ग मानचित्र पर दिखाया गया है।";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "गंभीर वाहन दुर्घटना का पता चला है। आपातकालीन बचाव दल रवाना किया जा रहा है।";
  }

  return text;
}

/**
 * Dynamic Tamil Speech Translator for runtime templates
 */
function translateToTamilDynamic(text) {
  if (TAMIL_AUDIO_MAP[text]) return TAMIL_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "பாம்பை அடையாளம் காண கீழே உள்ள படங்களில் இருந்து சரியான பாம்பை தேர்வு செய்யவும்.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "பொருத்தமான இரத்த வங்கிகள் மற்றும் இரத்த தானம் செய்பவர்கள் கண்டுபிடிக்கப்பட்டனர்.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "அவசர இரத்த உதவி கோரிக்கை அனுப்பப்பட்டது. கூரியர் புறப்பட்டது.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "மருத்துவமனையில் நச்சு முறிவு மருந்து ஒதுக்கப்பட்டது. ஆம்புலன்ஸ் புறப்பட்டது.";
  }
  if (lower.includes('first aid')) {
    return "முதலுதவி நெறிமுறை: பாதிக்கப்பட்டவரை அமைதியாக வைத்திருங்கள், உடனடியாக மருத்துவமனைக்கு அழைத்துச் செல்லுங்கள்.";
  }
  if (lower.includes('route') && lower.includes('hospital')) {
    return "மருத்துவமனைக்கான பாதை வரைபடத்தில் காட்டப்பட்டுள்ளது.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "வாகன விபத்து கண்டறியப்பட்டது. அவசர மீட்புக்குழு புறப்படுகிறது.";
  }

  return text;
}

/**
 * Dynamic Kannada Speech Translator for runtime templates
 */
function translateToKannadaDynamic(text) {
  if (KANNADA_AUDIO_MAP[text]) return KANNADA_AUDIO_MAP[text];

  const lower = text.toLowerCase();

  if (lower.includes('which snake') || lower.includes('visual gallery') || lower.includes('select')) {
    return "ಹಾವನ್ನು ಗುರುತಿಸಲು ಕೆಳಗಿನ ಚಿತ್ರಗಳಿಂದ ಸರಿಯಾದ ಹಾವನ್ನು ಆಯ್ಕೆಮಾಡಿ.";
  }
  if (lower.includes('found verified blood banks') || lower.includes('compatible donors')) {
    return "ಹತ್ತಿರದ ರಕ್ತ ನಿಧಿ ಮತ್ತು ರಕ್ತದಾನಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ.";
  }
  if (lower.includes('blood sos sent to') || lower.includes('cold chain courier')) {
    return "ತುರ್ತು ರಕ್ತ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ಶೀತಲ ಸರಪಳಿ ಕೊರಿಯರ್ ಹೊರಟಿದೆ.";
  }
  if (lower.includes('antivenom') && (lower.includes('reserved') || lower.includes('hospital'))) {
    return "ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಆಂಟಿವೆನಮ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ. ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಹೊರಟಿದೆ.";
  }
  if (lower.includes('first aid')) {
    return "ಡಬ್ಲ್ಯುಎಚ್‌ಒ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ: ಗಾಯಗೊಂಡವರನ್ನು ಶಾಂತರಾಗಿರಿಸಿ ಮತ್ತು ತಕ್ಷಣವೇ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.";
  }
  if (lower.includes('route') && lower.includes('hospital')) {
    return "ಆಸ್ಪತ್ರೆಗೆ ರಸ್ತೆ ಮಾರ್ಗವನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಲಾಗಿದೆ.";
  }
  if (lower.includes('crash detected') || lower.includes('severe vehicle crash')) {
    return "ವಾಹನ ಅಪಘಾತ ಪತ್ತೆಯಾಗಿದೆ. ತುರ್ತು ರಕ್ಷಣಾ ತಂಡ ಹೊರಡುತ್ತಿದೆ.";
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
    stopAllAudio();

    if (!text || typeof text !== 'string') return;

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
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = targetLocale;
    utterance.rate = selectedLang === 'te' ? 0.84 : selectedLang === 'hi' ? 0.86 : 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window._resqone_active_utterance = utterance;

    utterance.onend = () => {
      window._resqone_active_utterance = null;
    };

    utterance.onerror = (e) => {
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

// Global lifecycle hooks
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
