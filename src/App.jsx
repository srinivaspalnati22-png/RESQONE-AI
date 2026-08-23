import React, { useState, useEffect, lazy, Suspense, Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BackgroundVideo } from './components/BackgroundVideo';
import { AccidentAlertModal } from './components/AccidentAlertModal';
import { accidentDetector } from './services/AccidentDetectionService';
import { LandingPage } from './pages/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { VoiceControlWidget } from './components/VoiceControlWidget';
import { stopAllAudio } from './services/audio_service';

// Code-split heavy secondary pages for instant load across all platforms
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

class TabErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn("Tab render recovered:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
            ⚡
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Module Synced</h4>
            <p className="text-xs text-slate-400 max-w-sm">Tap below to refresh and view this module.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Tab</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isOnboarded } = useAuth();
  const [activeTab, setActiveTab] = useState(() => (isOnboarded ? 'home' : 'auth'));
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState(null);

  // Sync tab if onboarding status changes
  useEffect(() => {
    if (!isOnboarded && activeTab !== 'auth') {
      setActiveTab('auth');
    }
  }, [isOnboarded]);

  // Stop any audio speech immediately whenever active tab is changed
  useEffect(() => {
    stopAllAudio();
  }, [activeTab]);

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
    // Force onboarding/login screen if new user
    if (!isOnboarded && activeTab === 'auth') {
      return (
        <TabErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <AuthPage onOnboardingComplete={() => setActiveTab('home')} />
          </Suspense>
        </TabErrorBoundary>
      );
    }

    switch (activeTab) {
      case 'accident':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <AccidentPage />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'copilot':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <EmergencyCopilotPage setActiveTab={setActiveTab} />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'blood':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <BloodDonorPage />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'snakebite':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <SnakebitePage />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'dashboard':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <DashboardPage />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'auth':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <AuthPage onOnboardingComplete={() => setActiveTab('home')} />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'home':
      default:
        return (
          <TabErrorBoundary>
            <LandingPage setActiveTab={setActiveTab} onSimulateCrash={handleSimulateCrash} />
          </TabErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-dvh text-slate-100 flex flex-col font-sans relative selection:bg-red-600 selection:text-white bg-[#050A14]">
      
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

      {/* Bottom Floating Navigation Bar (Mobile / Tablet) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Automated Crash Modal Triggered by Physics Thresholds */}
      <AccidentAlertModal
        isOpen={isAccidentModalOpen}
        accidentDetails={accidentDetails}
        onClose={() => setIsAccidentModalOpen(false)}
        onConfirm={() => {
          setIsAccidentModalOpen(false);
          setActiveTab('accident');
        }}
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
