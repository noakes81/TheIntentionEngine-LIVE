import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Pencil, Check } from "lucide-react";

interface StickPadProps {
  locked: boolean;
  onLock: (rate: string) => void;
  onClear: () => void;
  rateDisplay: string;
  color?: "primary" | "amber";
}

function randomTenDigits(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

export function StickPad({ locked, onLock, onClear, rateDisplay, color = "primary" }: StickPadProps) {
  const [scanning, setScanning] = useState(false);
  const [scanDisplay, setScanDisplay] = useState("0000000000");
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHolding = useRef(false);
  const lastScanDisplay = useRef("0000000000");

  const isPrimary = color === "primary";
  const accentColor  = isPrimary ? "rgba(157,78,221,1)"    : "rgba(251,191,36,1)";
  const accentFaint  = isPrimary ? "rgba(157,78,221,0.15)" : "rgba(251,191,36,0.12)";
  const accentText   = isPrimary ? "text-primary"           : "text-amber-400";
  const accentBorder = isPrimary ? "border-primary/30"      : "border-amber-500/30";
  const accentBg     = isPrimary ? "bg-primary/10"          : "bg-amber-500/10";

  const stopScan = useCallback(() => {
    if (scanInterval.current) { clearInterval(scanInterval.current); scanInterval.current = null; }
    isHolding.current = false;
    setScanning(false);
  }, []);

  const startScan = useCallback(() => {
    if (locked || isHolding.current) return;
    isHolding.current = true;
    setScanning(true);
    scanInterval.current = setInterval(() => {
      const next = randomTenDigits();
      lastScanDisplay.current = next;
      setScanDisplay(next);
    }, 55);
  }, [locked]);

  // Lock with whatever digit is currently shown — exact same value user sees
  const commitLock = useCallback(() => {
    if (!isHolding.current) return;
    if (scanInterval.current) { clearInterval(scanInterval.current); scanInterval.current = null; }
    isHolding.current = false;
    setScanning(false);
    onLock(lastScanDisplay.current);
  }, [onLock]);

  // ── Pointer handlers ───────────────────────────────────────────────────────
  // We use setPointerCapture so the element keeps receiving events even when
  // the cursor drifts outside the button bounds during the hold. This means
  // pointerup always fires here on release, no need to watch pointerleave.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (locked || manualMode) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startScan();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (scanning || isHolding.current) commitLock();
  };

  const handlePointerCancel = () => {
    stopScan();
  };

  const handleClick = () => {
    if (manualMode) return;
    if (locked) onClear();
  };

  // Manual entry helpers
  const openManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    setManualValue(locked ? rateDisplay : "");
    setManualMode(true);
  };

  const commitManual = () => {
    const cleaned = manualValue.replace(/\D/g, "").slice(0, 10).padEnd(10, "0");
    onLock(cleaned);
    setManualMode(false);
    setManualValue("");
  };

  const cancelManual = () => {
    setManualMode(false);
    setManualValue("");
  };

  // Keep display synced to prop when idle
  useEffect(() => {
    if (!scanning) {
      setScanDisplay(rateDisplay);
      lastScanDisplay.current = rateDisplay;
    }
  }, [rateDisplay, scanning]);

  useEffect(() => () => stopScan(), [stopScan]);

  const lcdStyle = isPrimary ? {
    background: "hsla(120,40%,4%,1)",
    border: "1px solid hsla(120,60%,22%,0.3)",
    color: "hsla(120,75%,58%,0.9)",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.2em",
    textShadow: "0 0 8px hsla(120,75%,50%,0.5)",
    boxShadow: "inset 0 2px 8px hsla(0,0%,0%,0.5)"
  } : {
    background: "hsla(38,25%,4%,1)",
    border: "1px solid hsla(38,75%,28%,0.3)",
    color: "hsla(38,95%,60%,0.9)",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.2em",
    textShadow: "0 0 8px hsla(38,95%,50%,0.5)",
    boxShadow: "inset 0 2px 8px hsla(0,0%,0%,0.5)"
  };

  return (
    <div className="space-y-2">
      {/* Rate display + manual edit */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 px-3 py-2 rounded text-sm tabular-nums flex items-center justify-between gap-2 select-none min-h-[38px] transition-all"
          style={scanning ? {
            ...lcdStyle,
            boxShadow: `0 0 12px ${accentFaint}, inset 0 2px 8px hsla(0,0%,0%,0.5)`
          } : lcdStyle}
        >
          {scanning ? (
            <div className="flex items-center gap-[1px] flex-1">
              {scanDisplay.split("").map((digit, i) => (
                <motion.span
                  key={i}
                  className="font-mono font-bold text-base tabular-nums inline-block w-[1.1ch] text-center"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.11, repeat: Infinity, delay: i * 0.012 }}
                  style={{ color: isPrimary ? "hsla(120,75%,62%,1)" : "hsla(38,95%,65%,1)" }}
                >
                  {digit}
                </motion.span>
              ))}
              <motion.span
                className="ml-2 text-[11px] font-mono uppercase tracking-widest"
                style={{ color: isPrimary ? "hsla(120,50%,40%,0.8)" : "hsla(38,70%,45%,0.8)" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                scanning
              </motion.span>
            </div>
          ) : manualMode ? (
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={manualValue}
              onChange={e => setManualValue(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={e => { if (e.key === "Enter") commitManual(); if (e.key === "Escape") cancelManual(); }}
              placeholder="0000000000"
              className="bg-transparent border-0 outline-none flex-1 font-mono text-sm tracking-widest tabular-nums"
              style={{ color: isPrimary ? "hsla(120,75%,58%,0.9)" : "hsla(38,95%,60%,0.9)" }}
            />
          ) : (
            <>
              <span className="font-mono font-bold text-sm tabular-nums">{rateDisplay}</span>
              {locked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest"
                  style={{ color: isPrimary ? "hsla(120,65%,50%,0.8)" : "hsla(38,85%,55%,0.8)" }}
                >
                  <Lock className="w-3 h-3" /> Locked
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Manual entry button / confirm */}
        {manualMode ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={commitManual}
              className="w-8 h-8 rounded flex items-center justify-center transition-all"
              style={{
                background: isPrimary ? "hsla(120,45%,12%,1)" : "hsla(38,45%,12%,1)",
                border: isPrimary ? "1px solid hsla(120,60%,30%,0.4)" : "1px solid hsla(38,75%,35%,0.4)",
                color: isPrimary ? "hsla(120,75%,55%,1)" : "hsla(38,95%,60%,1)"
              }}
              title="Confirm rate"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelManual}
              className="w-8 h-8 rounded flex items-center justify-center transition-all"
              style={{
                background: "hsla(228,25%,8%,1)",
                border: "1px solid hsla(228,25%,16%,0.8)",
                color: "hsla(228,10%,35%,1)"
              }}
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openManual}
            className="w-8 h-8 rounded flex items-center justify-center transition-all shrink-0"
            style={{
              background: "hsla(228,25%,8%,1)",
              border: "1px solid hsla(228,25%,16%,0.8)",
              color: "hsla(228,10%,35%,1)"
            }}
            title="Enter rate manually"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Hold pad */}
      <motion.button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
        whileTap={{ scale: locked ? 1 : 0.98 }}
        className="relative w-full h-16 rounded overflow-hidden select-none focus:outline-none touch-none"
        style={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: locked ? accentColor : scanning ? accentColor : "hsla(228,25%,16%,0.8)",
          background: locked
            ? `radial-gradient(ellipse at 50% 40%, ${accentFaint} 0%, hsla(228,35%,5%,1) 70%)`
            : scanning
            ? `radial-gradient(ellipse at 50% 40%, ${accentFaint} 0%, hsla(228,35%,5%,1) 70%)`
            : `hsla(228,35%,5%,1)`,
          boxShadow: locked
            ? `0 0 18px ${accentFaint}, inset 0 0 12px ${accentFaint}`
            : scanning
            ? `0 0 30px ${accentFaint}, inset 0 0 20px ${accentFaint}`
            : "inset 0 2px 6px hsla(0,0%,0%,0.4)",
          cursor: locked ? "pointer" : "default"
        }}
      >
        {/* Repeating dot texture when idle */}
        {!locked && !scanning && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, hsla(255,100%,100%,0.04) 1px, transparent 1px)`,
              backgroundSize: "12px 12px"
            }}
          />
        )}

        {/* Sweep shimmer while scanning */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "110%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}30 50%, transparent 100%)` }}
            />
          )}
        </AnimatePresence>

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
          {locked ? (
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ color: accentColor }}>
              <Lock className="w-3.5 h-3.5" /> Rate Locked — Click to Clear
            </div>
          ) : scanning ? (
            <motion.span
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: accentColor }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              Release to Lock Rate
            </motion.span>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ color: "hsla(228,10%,32%,1)" }}>
              <Unlock className="w-3.5 h-3.5" />
              Hold — Think of Your Intention — Release to Lock
            </div>
          )}
        </div>
      </motion.button>

      <p className="text-[11px] font-mono text-center"
        style={{ color: "hsla(228,10%,28%,1)" }}>
        {locked
          ? "Rate confirmed. Click pad to clear, or use ✎ to edit manually."
          : "Hold pad while concentrating on your intention. Release when the rate feels right."}
      </p>
    </div>
  );
}
