import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BackgroundVideo } from './components/BackgroundVideo';
import { AccidentAlertModal } from './components/AccidentAlertModal';
import { accidentDetector } from './services/AccidentDetectionService';
import { LandingPage } from './pages/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { VoiceControlWidget } from './components/VoiceControlWidget';

// Code-split heavy secondary pages for instant initial load across all platforms
const AccidentPage = lazy(() => import('./pages/AccidentPage').then(m => ({ default: m.AccidentPage })));
const EmergencyCopilotPage = lazy(() => import('./pages/EmergencyCopilotPage').then(m => ({ default: m.EmergencyCopilotPage })));
const BloodDonorPage = lazy(() => import('./pages/BloodDonorPage').then(m => ({ default: m.BloodDonorPage })));
const SnakebitePage = lazy(() => import('./pages/SnakebitePage').then(m => ({ default: m.SnakebitePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));

const PageLoadingFallback = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
      <RefreshCw className="w-6 h-6 animate-spin" />
    </div>
    <p className="text-xs font-mono text-slate-400">Loading module...</p>
  </div>
);

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState(null);

  useEffect(() => {
    // Start multi-signal crash detector
    accidentDetector.startMonitoring((details) => {
      setAccidentDetails(details);
      setIsAccidentModalOpen(true);
    });

    return () => accidentDetector.stopMonitoring();
  }, []);

  const handleSimulateCrash = () => {
    setActiveTab('accident');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'accident':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <AccidentPage />
          </Suspense>
        );
      case 'copilot':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <EmergencyCopilotPage setActiveTab={setActiveTab} />
          </Suspense>
        );
      case 'blood':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <BloodDonorPage />
          </Suspense>
        );
      case 'snakebite':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <SnakebitePage />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <DashboardPage />
          </Suspense>
        );
      case 'auth':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <AuthPage />
          </Suspense>
        );
      case 'home':
      default:
        return <LandingPage setActiveTab={setActiveTab} onSimulateCrash={handleSimulateCrash} />;
    }
  };

  return (
    <div className="min-h-[100dvh] text-slate-100 flex flex-col font-sans relative selection:bg-red-600 selection:text-white bg-[#050A14]">
      
      {/* Fixed Ambient Glow Background (Zero Video Overhead) */}
      <BackgroundVideo activeTab={activeTab} />

      {/* Top Header Navbar with Language Switcher & SOS Trigger */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onSimulateCrash={handleSimulateCrash} />
      
      {/* Network / Offline Banner */}
      <OfflineIndicator />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar with SOS Anchor */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Fixed Right-Side Corner Voice Assistance Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        <VoiceControlWidget setActiveTab={setActiveTab} />
      </div>

      {/* Automatic Accident Detection Alert Modal */}
      <AccidentAlertModal
        isOpen={isAccidentModalOpen}
        onClose={() => setIsAccidentModalOpen(false)}
        accidentDetails={accidentDetails}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </DemoProvider>
    </AuthProvider>
  );
}
