import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Sparkles, Target, Radio, ArrowLeftRight, Volume2, VolumeX } from "lucide-react";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useChiAudio } from "@/hooks/useChiAudio";
import { Operation, SubPosition, SymbolicCard } from "@/types";

interface ActiveOperationPanelProps {
  operation: Operation;
  cards: SymbolicCard[];
  onStatusChange: (status: Operation["status"]) => void;
  onTick: (elapsed: number) => void;
}

function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function WaveformDisplay({ active, frequency }: { active: boolean; frequency: number }) {
  const bars = Array.from({ length: 48 });
  const speed = Math.max(0.12, 1.6 - Math.log10(Math.max(1, frequency)) * 0.4);
  return (
    <div className="h-12 w-full flex items-center justify-center gap-[2px] overflow-hidden relative">
      {active && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, hsla(270,75%,58%,0.05), transparent)" }} />
      )}
      {bars.map((_, i) => {
        const phase = Math.sin((i / bars.length) * Math.PI * 3.5 + i * 0.3);
        const base = 4 + Math.abs(phase) * 28;
        return (
          <motion.div
            key={i}
            className="rounded-full flex-shrink-0"
            style={{ width: 2 }}
            animate={active
              ? { height: [base * 0.35, base * 1.15, base * 0.5, base * 0.95, base * 0.35] }
              : { height: 2 }
            }
            transition={{
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * (speed / bars.length * 0.9)
            }}
            initial={false}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: active
                  ? `linear-gradient(to top, hsla(270,75%,45%,0.6), hsla(270,75%,70%,0.9))`
                  : "hsla(228,25%,16%,0.6)",
                boxShadow: active ? "0 0 4px hsla(270,75%,58%,0.4)" : "none"
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function LCDRate({ rate, color }: { rate?: string; color: "green" | "amber" }) {
  if (!rate) return null;
  return (
    <div className={`px-3 py-1.5 rounded text-sm tabular-nums ${color === "amber" ? "lcd-display-amber" : "lcd-display"}`}>
      {rate || "0000000000"}
    </div>
  );
}

// Animated rate digits — each digit flips to the new value
function AnimatedLCDRate({ rate, color }: { rate?: string; color: "green" | "amber" }) {
  const digits = (rate || "0000000000").split("");
  const lcdClass = color === "amber" ? "lcd-display-amber" : "lcd-display";
  return (
    <div className={`px-3 py-1.5 rounded flex gap-[2px] ${lcdClass}`}>
      {digits.map((d, i) => (
        <AnimatePresence key={i} mode="wait">
          <motion.span
            key={`${i}-${d}`}
            className="tabular-nums inline-block w-[1.1ch] text-center font-mono text-sm"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12, delay: i * 0.025 }}
          >
            {d}
          </motion.span>
        </AnimatePresence>
      ))}
    </div>
  );
}

// The cycling trend broadcaster panel
function TrendCycler({
  trendPositions,
  isRunning,
  cards,
}: {
  trendPositions: SubPosition[];
  isRunning: boolean;
  cards: SymbolicCard[];
}) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || trendPositions.length < 2) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIdx(prev => (prev + 1) % trendPositions.length);
    }, 3200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, trendPositions.length]);

  // Reset to 0 when stopped
  useEffect(() => {
    if (!isRunning) { setIdx(0); setDirection(1); }
  }, [isRunning]);

  if (trendPositions.length === 0) return null;

  const pos = trendPositions[idx];
  const hasCycle = trendPositions.length > 1;

  return (
    <div className="relative overflow-hidden rounded"
      style={{
        background: "hsla(270,35%,5%,0.7)",
        border: isRunning
          ? "1px solid hsla(270,75%,45%,0.35)"
          : "1px solid hsla(228,25%,14%,0.8)",
        boxShadow: isRunning ? "0 0 20px hsla(270,75%,45%,0.08)" : "none"
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ borderBottom: "1px solid hsla(228,25%,10%,0.8)", background: "hsla(228,35%,5%,0.8)" }}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" style={{ color: "hsla(270,75%,65%,0.8)" }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(270,75%,65%,0.7)" }}>
            Trend / Intention
          </span>
        </div>
        {hasCycle && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {trendPositions.map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  animate={{
                    width: i === idx ? 14 : 4,
                    background: i === idx ? "hsla(270,75%,60%,1)" : "hsla(228,25%,22%,1)"
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 4 }}
                />
              ))}
            </div>
            <ArrowLeftRight className="w-3 h-3" style={{ color: "hsla(270,50%,45%,0.6)" }} />
          </div>
        )}
      </div>

      {/* Cycling content */}
      <div className="relative px-3 py-3 min-h-[96px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`trend-${idx}`}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="space-y-2"
          >
            {/* Position badge + name */}
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                style={{
                  background: "hsla(270,45%,18%,1)",
                  border: "1px solid hsla(270,75%,45%,0.3)",
                  color: "hsla(270,75%,70%,1)"
                }}
              >
                {idx + 1}
              </div>
              <span className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "hsla(270,60%,65%,0.8)" }}>
                {pos.positionType || pos.name}
              </span>
              {hasCycle && isRunning && (
                <motion.span
                  className="text-[10px] font-mono uppercase tracking-widest ml-auto"
                  style={{ color: "hsla(270,50%,40%,0.6)" }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3.2, repeat: Infinity }}
                >
                  broadcasting
                </motion.span>
              )}
            </div>

            {/* Intention */}
            <p className="text-sm italic leading-relaxed"
              style={{
                color: "hsla(228,10%,65%,0.7)",
                borderLeft: "2px solid hsla(270,75%,50%,0.4)",
                paddingLeft: "10px"
              }}>
              "{pos.intention || "No intention set"}"
            </p>

            {/* LCD rate */}
            <AnimatedLCDRate rate={pos.rate} color="green" />

            {/* Trend cards for this position */}
            {((pos.customCardImages?.length ?? 0) > 0 || (pos.cardIds?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pos.customCardImages?.map((img, i) => (
                  <img
                    key={`cimg-${i}`}
                    src={img}
                    alt="Trend card"
                    className="w-8 h-8 rounded object-cover shrink-0"
                    style={{ border: "1px solid hsla(270,60%,45%,0.35)" }}
                  />
                ))}
                {pos.cardIds?.map(cid => {
                  const card = cards.find(c => c.id === cid);
                  if (!card) return null;
                  return (
                    <div
                      key={cid}
                      className="flex items-center gap-1 rounded px-2 py-0.5"
                      style={{
                        background: "hsla(270,35%,10%,1)",
                        border: "1px solid hsla(270,55%,28%,0.45)"
                      }}
                      title={card.title}
                    >
                      <span className="text-base leading-none">{card.symbol}</span>
                      <span className="text-[11px] font-mono max-w-[52px] truncate" style={{ color: "hsla(270,65%,68%,0.8)" }}>
                        {card.title.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Shimmer sweep when running */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded"
            animate={{ x: ["-100%", "110%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsla(270,75%,58%,0.06) 50%, transparent 100%)"
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ActiveOperationPanel({ operation, cards, onStatusChange, onTick }: ActiveOperationPanelProps) {
  const { elapsedSeconds, progress, start, pause, stop, reset } = useSessionTimer(
    operation.sessionDurationMinutes,
    operation.elapsedSeconds
  );

  const isRunning = operation.status === 'running';
  const isPaused = operation.status === 'paused';

  const [volume, setVolume] = useLocalStorage<number>("orgone_volume", 0);
  useChiAudio(operation.frequencyHz, volume, isRunning);

  useEffect(() => {
    if (isRunning) start();
    else if (isPaused) pause();
    else stop();
  }, [operation.status]);

  const tickRef = useRef(onTick);
  tickRef.current = onTick;
  useEffect(() => {
    tickRef.current(elapsedSeconds);
    const target = operation.sessionDurationMinutes * 60;
    if (target > 0 && elapsedSeconds >= target) onStatusChange('completed');
  }, [elapsedSeconds]);

  const targetSeconds = operation.sessionDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const opCards = cards.filter(c => operation.cards.includes(c.id));

  // Collect trend subPositions (non-Target), fall back to single trend from operation
  const trendSubPositions: SubPosition[] = (() => {
    const subs = operation.subPositions ?? [];
    const trends = subs.filter(p => p.positionType !== "Target");
    if (trends.length > 0) return trends;
    // Fallback: synthesize one from operation root fields
    return [{
      id: "root-trend",
      name: "Trend",
      positionType: "Trend 1",
      intention: operation.intention,
      rate: operation.trendRate,
      rateLocked: !!operation.trendRateLocked,
      customCardImages: [],
      cardIds: operation.trendCardIds ?? [],
    }];
  })();

  // Target subPosition (for display)
  const targetSub: Partial<SubPosition> & { name: string; rate?: string } = (() => {
    const subs = operation.subPositions ?? [];
    const t = subs.find(p => p.positionType === "Target");
    if (t) return t;
    return {
      name: operation.target.name,
      rate: operation.targetRate,
      intention: operation.target.description || "",
    };
  })();

  // Resolve witness photo from either root target or target SubPosition
  const witnessPhoto = operation.target.photo
    || (targetSub as Partial<SubPosition>).targetPhoto;

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,4%,1))",
        border: isRunning
          ? "1px solid hsla(270,75%,50%,0.5)"
          : "1px solid hsla(228,25%,15%,0.9)",
        boxShadow: isRunning
          ? "0 0 40px hsla(270,75%,58%,0.12), 0 4px 24px hsla(0,0%,0%,0.5)"
          : "0 4px 24px hsla(0,0%,0%,0.5)"
      }}
      data-testid="active-operation-panel"
    >
      {/* Animated running glow */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, hsla(270,75%,58%,0.06), transparent)" }}
          />
        )}
      </AnimatePresence>

      {/* Top status bar */}
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{
          background: "linear-gradient(90deg, hsla(228,35%,8%,1), hsla(228,35%,6%,1))",
          borderBottom: "1px solid hsla(228,25%,13%,1)"
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={isRunning ? "led-green" : isPaused ? "led-amber" : "led-off"}
            animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-white/40">
            {isRunning ? "Chi Field Transmitting" : isPaused ? "Transmission Paused" : "Standby"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-mono text-white/25">{operation.frequencyHz} Hz</span>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-white/20" />
            <span className="text-[12px] font-mono text-white/20">SMX VIRTUAL DEVICE</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">

        {/* Left column */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-mono font-bold text-white/90 tracking-wide">{operation.name}</h2>
          </div>

          {/* Trend cycler — animates between positions when running */}
          <TrendCycler trendPositions={trendSubPositions} isRunning={isRunning} cards={cards} />

          {/* Target */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3" style={{ color: "hsla(38,85%,62%,0.8)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(38,85%,62%,0.7)" }}>
                Target / Structural Link
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{targetSub.name}</p>
              {operation.target.description && (
                <p className="text-xs text-white/35 line-clamp-1">{operation.target.description}</p>
              )}
            </div>
            <LCDRate rate={targetSub.rate} color="amber" />
          </div>

          {/* Transfer Diagram */}
          {operation.target.transferDiagram && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(38,85%,62%,0.7)" }}>
                Transfer Diagram — Structural Link Active
              </span>
              <div className="relative rounded overflow-hidden"
                style={{ border: "1px solid hsla(38,85%,52%,0.25)", background: "hsla(38,30%,5%,0.5)" }}>
                <img src={operation.target.transferDiagram} alt="Transfer Diagram"
                  className="w-full max-h-24 object-contain p-2"
                  data-testid="img-transfer-diagram"
                />
              </div>
              <p className="text-[11px] text-white/25 font-mono">Place physical printout on chi generator.</p>
            </div>
          )}

          {/* Waveform */}
          <WaveformDisplay active={isRunning} frequency={operation.frequencyHz} />

          {/* Volume slider */}
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.4)}
              className="shrink-0 transition-colors"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0
                ? <VolumeX className="w-4 h-4" style={{ color: "hsla(228,10%,35%,1)" }} />
                : <Volume2 className="w-4 h-4" style={{ color: "hsla(270,75%,65%,0.8)" }} />
              }
            </button>
            <div className="flex-1 relative flex items-center" style={{ height: 20 }}>
              <div className="absolute inset-x-0 h-[3px] rounded-full" style={{ background: "hsla(228,25%,15%,1)" }} />
              <div
                className="absolute left-0 h-[3px] rounded-full"
                style={{
                  width: `${volume * 100}%`,
                  background: volume > 0
                    ? "linear-gradient(90deg, hsla(270,75%,45%,0.7), hsla(270,75%,65%,1))"
                    : "hsla(228,25%,18%,1)",
                  boxShadow: volume > 0 ? "0 0 6px hsla(270,75%,58%,0.5)" : "none"
                }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="absolute inset-x-0 w-full opacity-0 cursor-pointer"
                style={{ height: 20 }}
              />
              {/* Thumb indicator */}
              <div
                className="absolute w-3 h-3 rounded-full pointer-events-none transition-all"
                style={{
                  left: `calc(${volume * 100}% - 6px)`,
                  background: volume > 0 ? "hsla(270,75%,70%,1)" : "hsla(228,25%,30%,1)",
                  boxShadow: volume > 0 ? "0 0 8px hsla(270,75%,58%,0.7)" : "none",
                  border: "1px solid hsla(270,75%,50%,0.4)"
                }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums shrink-0 w-8 text-right"
              style={{ color: "hsla(228,10%,35%,1)" }}>
              {Math.round(volume * 100)}
            </span>
          </div>

          {/* Progress bar */}
          {targetSeconds > 0 && (
            <div className="space-y-1">
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "hsla(228,25%,15%,1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  style={{
                    background: "linear-gradient(90deg, hsla(270,75%,45%,0.7), hsla(270,75%,65%,1))",
                    boxShadow: "0 0 6px hsla(270,75%,58%,0.5)"
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-white/25 uppercase tracking-wider">
                <span>{formatTime(elapsedSeconds)}</span>
                <span>{Math.round(progress)}%</span>
                <span>{formatTime(remainingSeconds)} left</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-5 py-2 rounded text-sm font-mono font-medium transition-all"
              style={isRunning ? {
                background: "hsla(270,45%,15%,1)",
                border: "1px solid hsla(270,75%,45%,0.4)",
                color: "hsla(270,75%,75%,1)"
              } : {
                background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,32%,1))",
                border: "1px solid hsla(270,75%,55%,0.5)",
                color: "white",
                boxShadow: "0 0 16px hsla(270,75%,58%,0.35)"
              }}
              onClick={() => onStatusChange(isRunning ? 'paused' : 'running')}
              data-testid="button-op-toggle"
            >
              {isRunning ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> {isPaused ? 'Resume' : 'Transmit'}</>}
            </button>
            <button
              className="p-2 rounded transition-all"
              style={{ background: "hsla(228,25%,10%,1)", border: "1px solid hsla(228,25%,18%,1)", color: "hsla(0,70%,55%,0.7)" }}
              onClick={() => onStatusChange('idle')}
              disabled={operation.status === 'idle'}
              data-testid="button-op-stop"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-2 rounded transition-all"
              style={{ background: "hsla(228,25%,10%,1)", border: "1px solid hsla(228,25%,18%,1)", color: "hsla(228,10%,45%,1)" }}
              onClick={() => { reset(); onStatusChange('idle'); }}
              data-testid="button-op-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right column — photo + clock */}
        <div className="space-y-4 lg:border-l lg:pl-5" style={{ borderColor: "hsla(228,25%,12%,1)" }}>

          {/* Witness photo — prominent display */}
          {witnessPhoto && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3" style={{ color: "hsla(38,85%,62%,0.7)" }} />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "hsla(38,85%,62%,0.6)" }}>
                  Witness Photo
                </span>
              </div>
              <div
                className="relative rounded overflow-hidden mx-auto"
                style={{
                  border: isRunning
                    ? "1px solid hsla(38,85%,52%,0.55)"
                    : "1px solid hsla(38,85%,35%,0.3)",
                  boxShadow: isRunning
                    ? "0 0 18px hsla(38,85%,52%,0.18), inset 0 0 12px hsla(38,85%,52%,0.05)"
                    : "none",
                  maxWidth: 160,
                }}
              >
                <img
                  src={witnessPhoto}
                  alt="Target witness"
                  className="w-full object-cover"
                  style={{ display: "block", maxHeight: 200, objectPosition: "top" }}
                  data-testid="img-active-witness"
                />
                {/* Amber scan line when running */}
                {isRunning && (
                  <motion.div
                    className="absolute inset-x-0 h-[2px] pointer-events-none"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: "linear-gradient(90deg, transparent, hsla(38,85%,62%,0.6), transparent)"
                    }}
                  />
                )}
              </div>
              <p className="text-center text-[11px] font-mono text-white/30 truncate px-1">{targetSub.name}</p>
            </div>
          )}

          {/* Circular clock */}
          <div className="relative w-32 mx-auto aspect-square flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle strokeWidth="3" cx="50" cy="50" r="45" fill="transparent"
                style={{ stroke: "hsla(228,25%,14%,1)" }} />
              <motion.circle
                strokeWidth="3"
                strokeLinecap="round"
                cx="50" cy="50" r="45" fill="transparent"
                style={{
                  stroke: "hsla(270,75%,58%,1)",
                  filter: "drop-shadow(0 0 4px hsla(270,75%,58%,0.7))"
                }}
                animate={{ strokeDasharray: `${(progress / 100) * 283} 283` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-xl font-mono font-light tabular-nums text-white/85 tracking-tighter">
                {formatTime(targetSeconds > 0 ? remainingSeconds : elapsedSeconds)}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-white/25 mt-0.5">
                {targetSeconds > 0 ? 'remaining' : 'elapsed'}
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="space-y-2 text-xs">
            {[
              { label: "Session", value: operation.sessionDurationMinutes === 0 ? "Continuous" : `${operation.sessionDurationMinutes} min` },
              ...(operation.structuralLinkType ? [{ label: "Link Type", value: operation.structuralLinkType }] : []),
              { label: "Frequency", value: `${operation.frequencyHz} Hz` },
              { label: "Positions", value: `${trendSubPositions.length} trend${trendSubPositions.length !== 1 ? "s" : ""}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/25">{item.label}</span>
                <span className="font-mono text-[12px] text-white/55 capitalize">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Active filter cards */}
          {opCards.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-widest text-white/25">Filter Cards</div>
              <div className="grid grid-cols-3 gap-1.5">
                {opCards.slice(0, 9).map(card => (
                  <div
                    key={card.id}
                    className="flex flex-col items-center gap-1 rounded p-2"
                    style={{
                      background: "hsla(270,30%,9%,1)",
                      border: "1px solid hsla(270,45%,22%,0.5)"
                    }}
                    title={card.title}
                    data-testid={`badge-card-${card.id}`}
                  >
                    <span className="text-2xl leading-none">{card.symbol}</span>
                    <span className="text-[10px] font-mono text-center leading-tight w-full truncate"
                      style={{ color: "hsla(270,60%,65%,0.7)" }}>
                      {card.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                ))}
                {opCards.length > 9 && (
                  <div
                    className="flex items-center justify-center rounded p-2 text-[11px] font-mono text-white/25"
                    style={{ background: "hsla(228,25%,8%,1)", border: "1px solid hsla(228,25%,14%,1)" }}
                  >
                    +{opCards.length - 9}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running bottom pulse line */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, hsla(270,75%,58%,0.8), transparent)",
              transformOrigin: "center"
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
