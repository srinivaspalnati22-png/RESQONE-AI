import React, { useState, useEffect } from 'react';
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
import { AuthPage } from './pages/AuthPage';
import { EmergencyCopilotPage } from './pages/EmergencyCopilotPage';
import { BloodDonorPage } from './pages/BloodDonorPage';
import { SnakebitePage } from './pages/SnakebitePage';
import { DashboardPage } from './pages/DashboardPage';
import { motion, AnimatePresence } from 'framer-motion';

import { VoiceControlWidget } from './components/VoiceControlWidget';

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
    accidentDetector.simulateAccident((details) => {
      setAccidentDetails(details);
      setIsAccidentModalOpen(true);
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'copilot':
        return <EmergencyCopilotPage setActiveTab={setActiveTab} />;
      case 'blood':
        return <BloodDonorPage />;
      case 'snakebite':
        return <SnakebitePage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'auth':
        return <AuthPage />;
      case 'home':
      default:
        return <LandingPage setActiveTab={setActiveTab} onSimulateCrash={handleSimulateCrash} />;
    }
  };

  return (
    <div className="min-h-[100dvh] text-slate-100 flex flex-col font-sans relative selection:bg-red-600 selection:text-white bg-slate-950">
      
      {/* 100dvh Fixed Damped Scroll-Scrubbed Background Video */}
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
