import { useState, useEffect, useCallback } from 'react';

export const LOCATION_PRESETS = [
  { id: 'live', name: 'Live GPS Position', lat: null, lng: null, desc: 'Browser High-Precision GPS' },
  { id: 'vja', name: 'Vijayawada GGH Trauma Hub', lat: 16.5167, lng: 80.6500, desc: 'Krishna District ER Center' },
  { id: 'vzg', name: 'Visakhapatnam KGH Coastal', lat: 17.7089, lng: 83.3032, desc: 'North AP Level-1 Trauma' },
  { id: 'tpt', name: 'Tirupati SVIMS Medical Hub', lat: 13.6288, lng: 79.4192, desc: 'Rayalaseema Emergency Grid' },
  { id: 'hyd', name: 'Hyderabad AIIMS Trauma Corridor', lat: 17.3850, lng: 78.4867, desc: 'Central Telangana Network' },
  { id: 'blr', name: 'Bengaluru Victoria ER Grid', lat: 12.9716, lng: 77.5946, desc: 'Karnataka Advanced Trauma' }
];

export function useLiveLocation() {
  const [realGpsCoords, setRealGpsCoords] = useState(null);
  const [customCoords, setCustomCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [activePresetId, setActivePresetId] = useState('live');
  const [isLocating, setIsLocating] = useState(false);

  const fetchCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setRealGpsCoords(newCoords);
        setAccuracy(Math.round(acc));
        setError(null);
        setIsLocating(false);
      },
      (err) => {
        console.warn('[useLiveLocation] getCurrentPosition fallback error:', err);
        setIsLocating(false);
        // Fallback to IP geolocation
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client')
          .then(r => r.json())
          .then(d => {
            if (d && d.latitude && d.longitude) {
              setRealGpsCoords({ lat: d.latitude, lng: d.longitude });
              setAccuracy(300);
              setError(null);
            }
          })
          .catch(() => {
            if (err.code === 1) {
              setPermissionStatus('denied');
              setError('Location permission denied. Please allow GPS access in your browser or select a regional preset.');
            } else {
              setError(err.message || 'Unable to retrieve precise GPS coordinates.');
            }
          });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );
  }, []);

  useEffect(() => {
    fetchCurrentPosition();

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => {
          setPermissionStatus(status.state);
          if (status.state === 'granted') {
            fetchCurrentPosition();
          }
        };
      }).catch(() => {});
    }

    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords;
          setRealGpsCoords({ lat: latitude, lng: longitude });
          setAccuracy(Math.round(acc));
          setError(null);
        },
        (err) => {
          console.warn('[useLiveLocation] watchPosition warning:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [fetchCurrentPosition]);

  // Set location from preset or custom coordinates
  const selectPreset = useCallback((presetId) => {
    setActivePresetId(presetId);
    if (presetId === 'live') {
      setCustomCoords(null);
      fetchCurrentPosition();
    } else {
      const preset = LOCATION_PRESETS.find(p => p.id === presetId);
      if (preset && preset.lat && preset.lng) {
        setCustomCoords({ lat: preset.lat, lng: preset.lng });
        setError(null);
      }
    }
  }, [fetchCurrentPosition]);

  const setManualLocation = useCallback((lat, lng) => {
    setActivePresetId('custom');
    setCustomCoords({ lat, lng });
    setError(null);
  }, []);

  // Effective coords: custom preset if selected, otherwise real GPS, otherwise Vijayawada default
  const coords = customCoords || realGpsCoords || { lat: 16.5167, lng: 80.6500 };
  const isUsingLiveGps = activePresetId === 'live' && !!realGpsCoords;

  return {
    coords,
    realGpsCoords,
    accuracy,
    error,
    permissionStatus,
    activePresetId,
    isLocating,
    isUsingLiveGps,
    selectPreset,
    setManualLocation,
    refreshLocation: fetchCurrentPosition,
    presets: LOCATION_PRESETS
  };
}
