import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewModeContext = createContext();

export const ViewModeProvider = ({ children }) => {
  const [viewMode, setViewModeState] = useState(() => {
    return localStorage.getItem('resqone_view_mode') || 'mobile';
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('resqone_view_mode', mode);
  };

  useEffect(() => {
    const handleStorage = () => {
      const mode = localStorage.getItem('resqone_view_mode') || 'mobile';
      setViewModeState(mode);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    return {
      viewMode: 'mobile',
      setViewMode: () => {}
    };
  }
  return context;
};
