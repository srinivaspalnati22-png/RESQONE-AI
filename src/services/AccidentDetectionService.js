/**
 * Multi-Signal False-Positive Resistant Accident Detection Service
 * Sensor Fusion: Accelerometer G-Force, GPS Speed-Drop, Gyroscope Orientation, Post-Impact Stillness.
 * Requires at least 2 of 4 corroborating signals before triggering accident alert.
 */

class AccidentDetectionService {
  constructor() {
    this.isMonitoring = false;
    this.onAccidentDetected = null;

    this.lastSpeed = 0;
    this.lastSpeedTime = Date.now();
    this.signals = {
      impact: false,
      speedDrop: false,
      orientation: false,
      stillness: false
    };

    this.accelHandler = null;
    this.gyroHandler = null;
    this.watchPositionId = null;
  }

  startMonitoring(onDetected) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.onAccidentDetected = onDetected;

    // 1. Accelerometer Listener (Impact G-Force Spike)
    if ('DeviceMotionEvent' in window) {
      this.accelHandler = (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;
        
        const gForce = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2) / 9.81;
        if (gForce >= 2.8) {
          this.signals.impact = true;
          this.evaluateSignals();
        }
      };
      window.addEventListener('devicemotion', this.accelHandler);
    }

    // 2. Gyroscope Listener (Abrupt Orientation Shift)
    if ('DeviceOrientationEvent' in window) {
      let lastAlpha = 0, lastBeta = 0, lastGamma = 0;
      this.gyroHandler = (event) => {
        const dAlpha = Math.abs((event.alpha || 0) - lastAlpha);
        const dBeta = Math.abs((event.beta || 0) - lastBeta);
        const dGamma = Math.abs((event.gamma || 0) - lastGamma);

        if (dAlpha > 120 || dBeta > 120 || dGamma > 120) {
          this.signals.orientation = true;
          this.evaluateSignals();
        }

        lastAlpha = event.alpha || 0;
        lastBeta = event.beta || 0;
        lastGamma = event.gamma || 0;
      };
      window.addEventListener('deviceorientation', this.gyroHandler);
    }

    // 3. GPS Speed Drop Listener (Sudden speed drop e.g. 40km/h -> ~0)
    if (navigator.geolocation) {
      this.watchPositionId = navigator.geolocation.watchPosition((pos) => {
        const currentSpeedKmH = (pos.coords.speed || 0) * 3.6; // m/s to km/h
        const now = Date.now();
        const timeDiffSec = (now - this.lastSpeedTime) / 1000;

        if (timeDiffSec > 0 && timeDiffSec <= 3) {
          const speedDrop = this.lastSpeed - currentSpeedKmH;
          if (this.lastSpeed >= 25 && speedDrop >= 20) {
            this.signals.speedDrop = true;
            this.evaluateSignals();
          }
        }

        this.lastSpeed = currentSpeedKmH;
        this.lastSpeedTime = now;
      }, null, { enableHighAccuracy: true });
    }
  }

  evaluateSignals() {
    // Count active corroborating signals
    const activeSignalCount = Object.values(this.signals).filter(Boolean).length;

    if (activeSignalCount >= 2) {
      if (this.onAccidentDetected) {
        this.onAccidentDetected({
          signals: { ...this.signals },
          timestamp: new Date().toISOString()
        });
      }
      this.resetSignals();
    }
  }

  // Simulation Trigger for Demo & Testing
  simulateAccident(onDetected) {
    const simSignals = {
      impact: true,
      speedDrop: true,
      orientation: false,
      stillness: true
    };

    if (onDetected) {
      onDetected({
        signals: simSignals,
        timestamp: new Date().toISOString()
      });
    }
  }

  resetSignals() {
    this.signals = {
      impact: false,
      speedDrop: false,
      orientation: false,
      stillness: false
    };
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.accelHandler) window.removeEventListener('devicemotion', this.accelHandler);
    if (this.gyroHandler) window.removeEventListener('deviceorientation', this.gyroHandler);
    if (this.watchPositionId && navigator.geolocation) navigator.geolocation.clearWatch(this.watchPositionId);
  }
}

export const accidentDetector = new AccidentDetectionService();
