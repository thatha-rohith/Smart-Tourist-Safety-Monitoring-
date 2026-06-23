import { useEffect, useRef, useState, useCallback } from 'react';
import API from '../services/api';

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const useLiveLocation = (enabled = false, intervalMs = 20000) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(enabled);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const intervalRef = useRef(null);
  const lastCoordsRef = useRef(null);

  const syncLocation = useCallback(async (latitude, longitude) => {
    if (
      lastCoordsRef.current &&
      Math.abs(lastCoordsRef.current.lat - latitude) < 0.00005 &&
      Math.abs(lastCoordsRef.current.lng - longitude) < 0.00005
    ) {
      return null;
    }

    setSyncing(true);
    try {
      const address = await reverseGeocode(latitude, longitude);
      const { data } = await API.put('/tourists/me/location', { latitude, longitude, address });
      lastCoordsRef.current = { lat: latitude, lng: longitude };
      setLocation(data.currentLocation);
      setLastSynced(new Date());
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync location');
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);

  const pushCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => syncLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => setError(err.message || 'Unable to get location. Allow location access in browser.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, [syncLocation]);

  useEffect(() => {
    if (!tracking) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    pushCurrentPosition();
    intervalRef.current = setInterval(pushCurrentPosition, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tracking, intervalMs, pushCurrentPosition]);

  return { location, tracking, setTracking, error, lastSynced, syncing, pushCurrentPosition };
};

export default useLiveLocation;
