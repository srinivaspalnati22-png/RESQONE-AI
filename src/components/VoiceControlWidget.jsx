import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, HelpCircle, Zap, Volume2 } from 'lucide-react';
import { startVoiceRecognition, processVoiceIntent } from '../services/voice_service';
import { useLanguage } from '../context/LanguageContext';

export function VoiceControlWidget({ setActiveTab, onOpenSOS, floating = false }) {
  const { language, setLanguage, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackResult, setFeedbackResult] = useState(null);

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setFeedbackResult(null);
    setTranscript('Listening for voice command...');

    startVoiceRecognition(
      language,
      async (text) => {
        setTranscript(text);
        const res = await processVoiceIntent(text, language, { setActiveTab, setLanguage, onOpenSOS });
        setFeedbackResult(res);
        setTimeout(() => setFeedbackResult(null), 5000);
      },
      (error) => {
        setIsListening(false);
        setFeedbackResult({ mode: 'NOTICE', toast: `Voice Notice: ${error}` });
        setTimeout(() => setFeedbackResult(null), 4000);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  return (
    <div className="relative group">
      
      {/* Mic Button */}
      <button
        onClick={handleMicClick}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full font-extrabold text-xs transition-all duration-300 shadow-xl border ${
          isListening
            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-400 animate-pulse shadow-red-600/60 scale-105'
            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-red-500/50 shadow-slate-950/80 backdrop-blur-xl'
        }`}
        title="Voice AI Assistant (Click to Speak Commands or Ask Q&A)"
      >
        <div className="relative flex items-center justify-center">
          {isListening ? (
            <MicOff className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
          )}
        </div>
        
        <span className="tracking-wide">
          {isListening ? 'Listening...' : 'Voice AI'}
        </span>

        <Sparkles className={`w-3.5 h-3.5 ${isListening ? 'text-amber-300 animate-spin' : 'text-amber-400'}`} />
      </button>

      {/* Floating Listening Indicator */}
      {isListening && (
        <div className="absolute -top-10 right-0 bg-slate-950/95 border border-red-500/60 text-red-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap backdrop-blur-md flex items-center gap-1.5 animate-bounce">
          <Volume2 className="w-3 h-3 text-red-400 animate-pulse" />
          <span>{transcript || 'Speak now...'}</span>
        </div>
      )}

      {/* Spoken + Visual Action Confirmation Toast with Mode Badge */}
      {feedbackResult && (
        <div className="absolute bottom-14 right-0 w-72 bg-slate-950/95 border border-emerald-500/80 p-3.5 rounded-2xl text-xs shadow-2xl z-50 flex flex-col gap-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <div className="flex items-center gap-1.5 font-black uppercase text-[10px] text-emerald-400">
              {feedbackResult.mode === 'ACTION' ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>ACTION EXECUTED</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Q&A RESPONSE</span>
                </>
              )}
            </div>
            <span className="text-[9px] text-slate-400 font-mono">ResQOne AI</span>
          </div>

          <div className="text-slate-200 text-xs font-semibold leading-relaxed">
            {feedbackResult.toast}
          </div>
        </div>
      )}
    </div>
  );
}
