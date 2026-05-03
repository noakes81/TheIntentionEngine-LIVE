import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

interface StickPadProps {
  locked: boolean;
  onLock: () => void;
  onClear: () => void;
  rateDisplay: string;
  color?: "primary" | "amber";
}

const SCAN_DURATION_MS = 2200;

function randomDigit() {
  return Math.floor(Math.random() * 10).toString();
}

function buildScanString(len: number) {
  return Array.from({ length: len }, randomDigit).join("");
}

export function StickPad({ locked, onLock, onClear, rateDisplay, color = "primary" }: StickPadProps) {
  const [scanning, setScanning] = useState(false);
  const [scanDisplay, setScanDisplay] = useState(rateDisplay);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPrimary = color === "primary";
  const accentColor = isPrimary ? "rgba(157,78,221,1)" : "rgba(251,191,36,1)";
  const accentFaint = isPrimary ? "rgba(157,78,221,0.15)" : "rgba(251,191,36,0.12)";
  const accentText = isPrimary ? "text-primary" : "text-amber-400";
  const accentBorder = isPrimary ? "border-primary/30" : "border-amber-500/30";
  const accentBg = isPrimary ? "bg-primary/10" : "bg-amber-500/10";

  const stopScan = useCallback(() => {
    if (scanInterval.current) { clearInterval(scanInterval.current); scanInterval.current = null; }
    if (lockTimeout.current) { clearTimeout(lockTimeout.current); lockTimeout.current = null; }
    if (holdTimeout.current) { clearTimeout(holdTimeout.current); holdTimeout.current = null; }
    setScanning(false);
    setScanDisplay(rateDisplay);
  }, [rateDisplay]);

  const startScan = useCallback(() => {
    if (locked) return;
    setScanning(true);

    // Cycle digits rapidly
    scanInterval.current = setInterval(() => {
      setScanDisplay(buildScanString(rateDisplay.replace(/\s/g, "").length));
    }, 60);

    // Lock after scan duration
    lockTimeout.current = setTimeout(() => {
      if (scanInterval.current) { clearInterval(scanInterval.current); scanInterval.current = null; }
      setScanDisplay(rateDisplay);
      setScanning(false);
      onLock();
    }, SCAN_DURATION_MS);
  }, [locked, onLock, rateDisplay]);

  // Pointer events for press-and-hold feel
  const handlePointerDown = () => {
    if (locked) return;
    holdTimeout.current = setTimeout(() => {
      startScan();
    }, 120);
  };

  const handlePointerUp = () => {
    if (holdTimeout.current) { clearTimeout(holdTimeout.current); holdTimeout.current = null; }
  };

  const handleClick = () => {
    if (locked) { onClear(); return; }
    if (!scanning) startScan();
  };

  // Keep display synced when not scanning
  useEffect(() => {
    if (!scanning) setScanDisplay(rateDisplay);
  }, [rateDisplay, scanning]);

  // Cleanup on unmount
  useEffect(() => () => stopScan(), [stopScan]);

  return (
    <div className="space-y-2">
      {/* Rate digit readout */}
      <div className={`font-mono text-xs tracking-widest px-3 py-2 rounded-lg border ${accentBorder} ${accentBg} flex items-center justify-between gap-2`}>
        <span className={`${accentText} font-bold text-sm tracking-[0.2em] tabular-nums`}>
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.span
                key="scanning"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.12 }}
                className="inline-block"
              >
                {scanDisplay}
              </motion.span>
            ) : (
              <motion.span
                key="static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {rateDisplay}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {locked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 text-[10px] ${accentText} font-mono uppercase tracking-widest`}
          >
            <Lock className="w-3 h-3" /> Locked
          </motion.div>
        )}
        {scanning && (
          <span className="text-[10px] text-muted-foreground font-mono animate-pulse">SCANNING...</span>
        )}
      </div>

      {/* The pad itself */}
      <motion.button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        disabled={scanning}
        whileTap={{ scale: 0.97 }}
        className="relative w-full h-14 rounded-xl overflow-hidden cursor-pointer select-none border transition-all duration-300 focus:outline-none"
        style={{
          borderColor: locked ? accentColor : scanning ? accentColor : "rgba(255,255,255,0.08)",
          background: locked
            ? `radial-gradient(ellipse at 50% 40%, ${accentFaint} 0%, rgba(10,10,20,0.95) 70%)`
            : scanning
            ? `radial-gradient(ellipse at 50% 40%, ${accentFaint} 0%, rgba(10,10,20,0.97) 70%)`
            : `repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px), rgba(18,12,30,0.95)`,
          boxShadow: locked
            ? `0 0 18px ${accentFaint}, inset 0 0 12px ${accentFaint}`
            : scanning
            ? `0 0 24px ${accentFaint}, inset 0 0 16px ${accentFaint}`
            : "none",
        }}
      >
        {/* Animated scan sweep */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${accentColor}22 50%, transparent 100%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {locked ? (
            <div className={`flex items-center gap-2 ${accentText} font-mono text-xs uppercase tracking-widest`}>
              <Lock className="w-3.5 h-3.5" />
              Rate Locked — Click to Clear
            </div>
          ) : scanning ? (
            <span className={`${accentText} font-mono text-xs uppercase tracking-widest`}>
              Scanning Chi Field...
            </span>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase tracking-widest">
              <Unlock className="w-3.5 h-3.5" />
              Use Stick Pad
            </div>
          )}
        </div>
      </motion.button>

      <p className="text-[10px] text-muted-foreground/40 font-mono text-center">
        {locked ? "Rate confirmed via stick pad." : "Click to scan and lock the radionic rate."}
      </p>
    </div>
  );
}
