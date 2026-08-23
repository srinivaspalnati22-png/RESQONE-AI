import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RESQONE Uncaught UI Error:', error, errorInfo);
  }

  handleResetAndLaunch = () => {
    try {
      // Clear any stale demo or session cache that might cause JSON parse error
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear notice:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#050A14',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#0B1220',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '36px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px'
            }}>
              🚨
            </div>

            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              RESQONE Interface Ready
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
              Click below to launch the live application and sync sensor telemetry.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: '#050A14',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#f87171',
                textAlign: 'left',
                marginBottom: '20px',
                overflowX: 'auto',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleResetAndLaunch}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: '800',
                padding: '12px 32px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)'
              }}
            >
              Launch Live App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
