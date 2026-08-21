import { supabase } from '../lib/supabaseClient';

/**
 * Dual-Mode Web Speech API Assistant (Q&A Mode + Action Mode)
 * Supports English (en-IN), Telugu (te-IN), and Hindi (hi-IN).
 */

const LANG_MAP = {
  en: { speechCode: 'en-IN', label: 'English' },
  te: { speechCode: 'te-IN', label: 'Telugu' },
  hi: { speechCode: 'hi-IN', label: 'Hindi' }
};

export const speakText = (text, langCode = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel ongoing utterance

    if (!text || typeof text !== 'string') return false;

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = LANG_MAP[langCode]?.speechCode || 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onerror = (e) => {
      console.warn('[VoiceService] Speech utterance error:', e?.error);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(v => v.lang && (v.lang.startsWith(targetLang) || v.lang.startsWith(langCode)));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('[VoiceService] Speak call failed gracefully:', e);
      }
    }, 50);
    return true;
  } catch (err) {
    console.warn('[VoiceService] SpeechSynthesis error:', err);
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
};

/**
 * Dual-Mode Voice Command Interpreter (Q&A Mode vs Action Mode)
 */
export const processVoiceIntent = async (cmd, langCode, { setActiveTab, setLanguage, onOpenSOS }) => {
  const lower = cmd.toLowerCase();

  // ==========================================
  // 1. ACTION MODE COMMANDS (Executive Intent)
  // ==========================================

  // Action: Trigger SOS
  if (lower.includes('sos') || lower.includes('emergency') || lower.includes('अपात') || lower.includes('అత్యవసర')) {
    const toast = 'Activating Emergency SOS';
    speakText('Activating Emergency SOS now', langCode);
    if (onOpenSOS) onOpenSOS();
    return { mode: 'ACTION', action: 'SOS_TRIGGERED', toast };
  }

  // Action: Call Nearest Hospital ER
  if (lower.includes('call hospital') || lower.includes('call ambulance') || lower.includes('कॉल अस्पताल') || lower.includes('ఫోన్ చేయి')) {
    const toast = 'Calling GGH Vijayawada ER (+91-866-2472777)';
    speakText('Calling Government General Hospital Vijayawada Emergency ER now', langCode);
    window.location.href = 'tel:+91-866-2472777';
    return { mode: 'ACTION', action: 'PHONE_CALL', toast };
  }

  // Action: Switch Language to Telugu
  if (lower.includes('telugu') || lower.includes('తెలుగు')) {
    const toast = 'Switched to Telugu (తెలుగు)';
    speakText('భాషను తెలుగులోకి మార్చాము', 'te');
    if (setLanguage) setLanguage('te');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast };
  }

  // Action: Switch Language to Hindi
  if (lower.includes('hindi') || lower.includes('हिंदी')) {
    const toast = 'Switched to Hindi (हिंदी)';
    speakText('भाषा को हिंदी में बदल दिया गया है', 'hi');
    if (setLanguage) setLanguage('hi');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast };
  }

  // Action: Switch Language to English
  if (lower.includes('english') || lower.includes('अंग्रेजी')) {
    const toast = 'Switched to English';
    speakText('Switched language to English', 'en');
    if (setLanguage) setLanguage('en');
    return { mode: 'ACTION', action: 'LANG_CHANGED', toast };
  }

  // Action: Show Blood Donors
  if (lower.includes('show blood') || lower.includes('find blood') || lower.includes('blood donors') || lower.includes('రక్తం')) {
    const toast = 'Navigated to Smart Blood Donor Matcher';
    speakText('Opening Smart Blood Donor Matcher', langCode);
    if (setActiveTab) setActiveTab('blood');
    return { mode: 'ACTION', action: 'NAVIGATE_BLOOD', toast };
  }

  // Action: Snakebite Species Identification
  if (lower.includes('identify snake') || lower.includes('snakebite') || lower.includes('सांप') || lower.includes('పాము')) {
    const toast = 'Navigated to Snakebite AI Species Locator';
    speakText('Opening Snakebite Species AI and Antivenom locator', langCode);
    if (setActiveTab) setActiveTab('snakebite');
    return { mode: 'ACTION', action: 'NAVIGATE_SNAKE', toast };
  }

  // Action: Mission Control Dashboard
  if (lower.includes('dashboard') || lower.includes('mission control')) {
    const toast = 'Navigated to Mission Control Dashboard';
    speakText('Opening Mission Control Telemetry', langCode);
    if (setActiveTab) setActiveTab('dashboard');
    return { mode: 'ACTION', action: 'NAVIGATE_DASHBOARD', toast };
  }


  // ==========================================
  // 2. Q&A MODE COMMANDS (Factual Database Queries)
  // ==========================================

  // Q&A: Antivenom (AVS) Stock Inquiry
  if (lower.includes('antivenom') || lower.includes('avs') || lower.includes('vials') || lower.includes('stock')) {
    const answer = "Government General Hospital Vijayawada has 150 vials of Polyvalent Antivenom Serum in stock. Ramesh Hospitals has 35 vials available.";
    speakText(answer, langCode);
    return { mode: 'Q&A', answer, toast: answer };
  }

  // Q&A: Snakebite Treatment & First Aid
  if (lower.includes('first aid') || lower.includes('treat') || lower.includes('bite') || lower.includes('उपचार') || lower.includes('చికిత్స')) {
    const answer = "Immobilize the bitten limb below heart level. Keep patient calm to slow venom circulation. Do not cut or apply tourniquets. Transport to hospital immediately.";
    speakText(answer, langCode);
    return { mode: 'Q&A', answer, toast: answer };
  }

  // Q&A: ICU Bed Availability
  if (lower.includes('icu') || lower.includes('beds') || lower.includes('hospital bed')) {
    const answer = "GGH Vijayawada currently has 12 ICU beds available. Ramesh Hospitals has 15 ICU beds available.";
    speakText(answer, langCode);
    return { mode: 'Q&A', answer, toast: answer };
  }

  // Q&A: Universal Blood Donors
  if (lower.includes('universal donor') || lower.includes('o negative') || lower.includes('donor count')) {
    const answer = "3 active O- Negative universal blood donors are available within 2.5 kilometers near Vijayawada.";
    speakText(answer, langCode);
    return { mode: 'Q&A', answer, toast: answer };
  }


  // ==========================================
  // 3. FALLBACK QUERY
  // ==========================================
  const fallback = `Evaluating query: "${cmd}". Routing to AI Copilot triage.`;
  speakText(`Searching emergency telemetry for ${cmd}`, langCode);
  if (setActiveTab) setActiveTab('copilot');
  return { mode: 'Q&A', answer: fallback, toast: fallback };
};
