import { useState, useEffect, useRef } from 'react';

type TimerStatus = 'idle' | 'running' | 'paused';

export function useSessionTimer(initialDurationMinutes: number = 0, initialElapsed: number = 0) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsed);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const start = () => setStatus('running');
  const pause = () => setStatus('paused');
  const stop = () => {
    setStatus('idle');
    setElapsedSeconds(0);
  };
  const reset = () => setElapsedSeconds(0);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(elapsedSeconds);
  const targetSeconds = initialDurationMinutes * 60;
  const progress = targetSeconds > 0 ? Math.min((elapsedSeconds / targetSeconds) * 100, 100) : 0;

  return {
    elapsedSeconds,
    formattedTime,
    status,
    progress,
    start,
    pause,
    stop,
    reset
  };
}
