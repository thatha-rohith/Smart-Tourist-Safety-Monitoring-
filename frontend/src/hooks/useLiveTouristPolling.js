import { useEffect, useRef, useCallback } from 'react';
import API from '../services/api';

export const useLiveTouristPolling = (enabled = true, intervalMs = 15000) => {
  const intervalRef = useRef(null);
  const callbackRef = useRef(null);

  const startPolling = useCallback((onData) => {
    callbackRef.current = onData;
    const fetchLive = () => {
      API.get('/tourists/live')
        .then(({ data }) => callbackRef.current?.(data))
        .catch(console.error);
    };
    fetchLive();
    intervalRef.current = setInterval(fetchLive, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs]);

  useEffect(() => {
    if (!enabled) return;
    return startPolling(callbackRef.current);
  }, [enabled, startPolling]);

  return { startPolling };
};

export default useLiveTouristPolling;
