import { useState, useEffect } from 'react';

export function useLiveLocation() {
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // Query permission status if API is available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => {
          setPermissionStatus(status.state);
        };
      });
    }

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      setAccuracy(Math.round(acc));
      setError(null);
    };

    const handleError = (err) => {
      console.warn('[useLiveLocation] Geolocation watchPosition error:', err);
      if (err.code === 1) {
        setPermissionStatus('denied');
        setError('Location permission denied. Please allow GPS access to use the live maps & SOS tracking.');
      } else {
        setError(err.message || 'Unable to retrieve location.');
      }
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { coords, accuracy, error, permissionStatus };
}
