export const speakEmergencyInstruction = (text) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Cancel any stuck utterances in speech queue
    window.speechSynthesis.cancel();

    if (!text || typeof text !== 'string') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Safety timeout to avoid browser speech hanging on mobile
    utterance.onerror = (e) => {
      console.warn('[AudioService] Utterance error (ignoring gracefully):', e?.error);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang && (v.lang.startsWith('en-IN') || v.lang.startsWith('en'))) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Delay slightly to allow cancel() to clear
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AudioService] SpeechSynthesis speak failed gracefully:', err);
      }
    }, 50);
  } catch (err) {
    console.warn('[AudioService] SpeechSynthesis error:', err);
  }
};
