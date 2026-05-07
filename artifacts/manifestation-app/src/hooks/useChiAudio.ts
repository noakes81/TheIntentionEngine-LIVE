import { useEffect, useRef } from "react";

export function useChiAudio(
  frequencyHz: number,
  volume: number,
  isRunning: boolean
) {
  const ctxRef    = useRef<AudioContext | null>(null);
  const oscRef    = useRef<OscillatorNode | null>(null);
  const gainRef   = useRef<GainNode | null>(null);

  // Initialize or restart oscillator when running state / frequency changes
  useEffect(() => {
    if (!isRunning) {
      // Fade out then disconnect
      if (gainRef.current && ctxRef.current) {
        const g = gainRef.current;
        const t = ctxRef.current.currentTime;
        g.gain.setTargetAtTime(0, t, 0.15);
      }
      setTimeout(() => {
        oscRef.current?.stop();
        oscRef.current?.disconnect();
        oscRef.current = null;
        gainRef.current?.disconnect();
        gainRef.current = null;
        ctxRef.current?.close();
        ctxRef.current = null;
      }, 400);
      return;
    }

    // Create context fresh each time so we survive iOS/Safari restrictions
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3);
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(Math.max(0.1, frequencyHz), ctx.currentTime);
    osc.connect(gain);
    osc.start();
    oscRef.current = osc;

    return () => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
        ctx.close();
      }, 400);
    };
  }, [isRunning, frequencyHz]);

  // Live volume adjustment without restart
  useEffect(() => {
    if (gainRef.current && ctxRef.current && isRunning) {
      gainRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.05);
    }
  }, [volume, isRunning]);
}
