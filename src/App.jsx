import React, { useState, useEffect, lazy, Suspense, Component, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ViewModeProvider, useViewMode } from './context/ViewModeContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BackgroundVideo } from './components/BackgroundVideo';
import { AccidentAlertModal } from './components/AccidentAlertModal';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { accidentDetector } from './services/AccidentDetectionService';
import { LandingPage } from './pages/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, RotateCcw, ArrowRight, X } from 'lucide-react';
import { VoiceControlWidget } from './components/VoiceControlWidget';
import { stopAllAudio } from './services/audio_service';
import { GlobalAudioWidget } from './components/GlobalAudioWidget';

// Code-split heavy secondary pages for instant load across all platforms
const AccidentPage = lazy(() => import('./pages/AccidentPage').then(m => ({ default: m.AccidentPage })));
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
  const { viewMode, setViewMode } = useViewMode();
  const { globalSOSBanner, setGlobalSOSBanner, broadcastEmergencySOS } = useDemo();
  const [activeTab, setActiveTab] = useState('auth');
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState(null);

  // Stop audio when LEAVING a page (not when arriving), to avoid killing audio
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab !== activeTab) {
      stopAllAudio();
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    // Start multi-signal crash detector
    accidentDetector.startMonitoring((details) => {
      setAccidentDetails(details);
      setIsAccidentModalOpen(true);
      if (broadcastEmergencySOS) {
        broadcastEmergencySOS({
          type: 'ACCIDENT_RESCUE',
          title: '🚨 CRITICAL: High-Speed Crash Detected!',
          location: details.location || 'NH-16 Corridor, Vijayawada',
          victim: 'Srinivas Palnati (O- Blood)',
          gForce: details.gForce || 4.85,
          severity: 'CRITICAL'
        });
      }
    });

    return () => accidentDetector.stopMonitoring();
  }, [broadcastEmergencySOS]);

  const [sharedQuery, setSharedQuery] = useState(null);

  const navigateWithQuery = (tab, queryData) => {
    setSharedQuery(queryData);
    setActiveTab(tab);
  };

  const handleSimulateCrash = () => {
    setAccidentDetails({
      gForce: 4.85,
      impactSpeed: 88,
      lat: 16.5062,
      lng: 80.6480,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'CRITICAL',
      location: 'NH-16 Corridor, Vijayawada'
    });
    setIsAccidentModalOpen(true);
    if (broadcastEmergencySOS) {
      broadcastEmergencySOS({
        type: 'ACCIDENT_RESCUE',
        title: '🚨 CRITICAL: High-Speed 4.85G Crash on NH-16',
        location: 'NH-16 Corridor, Vijayawada',
        victim: 'Srinivas Palnati (O- Blood)',
        gForce: 4.85,
        severity: 'CRITICAL'
      });
    }
  };

  const renderTab = () => {
    // Force onboarding/login screen if new user
    if (!isOnboarded && activeTab === 'auth') {
      return (
        <TabErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <AuthPage 
              onOnboardingComplete={() => setActiveTab('home')} 
              onBack={() => setActiveTab('home')}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </Suspense>
        </TabErrorBoundary>
      );
    }

    switch (activeTab) {
      case 'accident':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <AccidentPage 
                initialQuery={sharedQuery} 
                onClearQuery={() => setSharedQuery(null)} 
              />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'blood':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <BloodDonorPage 
                initialQuery={sharedQuery} 
                onClearQuery={() => setSharedQuery(null)} 
              />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'snakebite':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <SnakebitePage 
                initialQuery={sharedQuery} 
                onClearQuery={() => setSharedQuery(null)} 
              />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'dashboard':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <DashboardPage 
                setActiveTab={setActiveTab}
              />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'auth':
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <AuthPage 
                onOnboardingComplete={() => setActiveTab('home')} 
                onBack={() => setActiveTab('home')}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </Suspense>
          </TabErrorBoundary>
        );
      case 'home':
      default:
        return (
          <TabErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <LandingPage 
                setActiveTab={setActiveTab} 
                navigateWithQuery={navigateWithQuery} 
                onSimulateCrash={handleSimulateCrash}
                viewMode={viewMode}
              />
            </Suspense>
          </TabErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-dvh text-slate-100 flex flex-col font-sans relative selection:bg-red-600 selection:text-white bg-[#03060B]">
      
      {/* Fixed Ambient Glow Background */}
      <BackgroundVideo activeTab={activeTab} />

      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSimulateCrash={handleSimulateCrash}
      />

      {/* Global Emergency SOS Broadcast Banner */}
      <AnimatePresence>
        {globalSOSBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[68px] z-50 w-full max-w-6xl mx-auto px-4 py-2"
          >
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border border-red-400 text-white shadow-2xl shadow-red-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
                  <span className="text-lg">🚨</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black tracking-wide leading-tight truncate">
                    {globalSOSBanner.title}
                  </h4>
                  <p className="text-[11px] text-red-100 mt-0.5 truncate">
                    📍 Location: <strong className="text-white">{globalSOSBanner.location}</strong> • SMS & WhatsApp dispatched to <strong className="text-white font-mono">{globalSOSBanner.familyCount} Family Relatives</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    if (setGlobalSOSBanner) setGlobalSOSBanner(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <span>View in Missions</span>
                  <ArrowRight className="w-3 h-3 text-red-400" />
                </button>
                <button
                  onClick={() => setGlobalSOSBanner && setGlobalSOSBanner(null)}
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Network / Offline Banner */}
      <OfflineIndicator />

      {/* Main Viewport Container dynamically adapting to Mobile View or Desktop View */}
      <main className={`flex-1 w-full relative z-10 transition-all duration-300 ${
        viewMode === 'mobile' ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto px-4'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${viewMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Notification Permission Banner Prompt for All Users */}
      <NotificationPermissionBanner />

      {/* Global Voice / Audioout Tester & Mute Widget */}
      <GlobalAudioWidget />

      {/* Bottom Floating Navigation Bar */}
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
    <LanguageProvider>
      <ViewModeProvider>
        <AuthProvider>
          <DemoProvider>
            <AppContent />
          </DemoProvider>
        </AuthProvider>
      </ViewModeProvider>
    </LanguageProvider>
  );
}
