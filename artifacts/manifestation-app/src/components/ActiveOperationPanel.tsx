import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Clock, Sparkles, Target, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { Operation, SymbolicCard } from "@/types";

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

export function ActiveOperationPanel({ operation, cards, onStatusChange, onTick }: ActiveOperationPanelProps) {
  const { elapsedSeconds, progress, start, pause, stop, reset } = useSessionTimer(
    operation.sessionDurationMinutes,
    operation.elapsedSeconds
  );

  const isRunning = operation.status === 'running';
  const isPaused = operation.status === 'paused';

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
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40">
            {isRunning ? "Chi Field Transmitting" : isPaused ? "Transmission Paused" : "Standby"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/25">{operation.frequencyHz} Hz</span>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-white/20" />
            <span className="text-[10px] font-mono text-white/20">SMX VIRTUAL DEVICE</span>
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

          {/* Trend */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" style={{ color: "hsla(270,75%,65%,0.8)" }} />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(270,75%,65%,0.7)" }}>
                Trend / Intention
              </span>
            </div>
            <p className="text-sm italic text-white/55 leading-relaxed line-clamp-2"
              style={{ borderLeft: "2px solid hsla(270,75%,50%,0.4)", paddingLeft: "10px" }}>
              "{operation.intention}"
            </p>
            <LCDRate rate={operation.trendRate} color="green" />
          </div>

          {/* Target */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3" style={{ color: "hsla(38,85%,62%,0.8)" }} />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(38,85%,62%,0.7)" }}>
                Target / Structural Link
              </span>
            </div>
            <div className="flex items-center gap-2">
              {operation.target.photo && (
                <img src={operation.target.photo} alt="Witness"
                  className="w-9 h-9 rounded object-cover shrink-0"
                  style={{ border: "1px solid hsla(38,85%,52%,0.3)" }}
                  data-testid="img-active-witness"
                />
              )}
              <div>
                <p className="text-sm font-medium text-white/80">{operation.target.name}</p>
                {operation.target.description && (
                  <p className="text-xs text-white/35 line-clamp-1">{operation.target.description}</p>
                )}
              </div>
            </div>
            <LCDRate rate={operation.targetRate} color="amber" />
          </div>

          {/* Transfer Diagram */}
          {operation.target.transferDiagram && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsla(38,85%,62%,0.7)" }}>
                Transfer Diagram — Structural Link Active
              </span>
              <div className="relative rounded overflow-hidden"
                style={{ border: "1px solid hsla(38,85%,52%,0.25)", background: "hsla(38,30%,5%,0.5)" }}>
                <img src={operation.target.transferDiagram} alt="Transfer Diagram"
                  className="w-full max-h-24 object-contain p-2"
                  data-testid="img-transfer-diagram"
                />
              </div>
              <p className="text-[9px] text-white/25 font-mono">Place physical printout on chi generator.</p>
            </div>
          )}

          {/* Waveform */}
          <WaveformDisplay active={isRunning} frequency={operation.frequencyHz} />

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
              <div className="flex justify-between text-[9px] font-mono text-white/25 uppercase tracking-wider">
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

        {/* Right column — clock */}
        <div className="space-y-4 lg:border-l lg:pl-5" style={{ borderColor: "hsla(228,25%,12%,1)" }}>
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
              <div className="text-[8px] font-mono uppercase tracking-widest text-white/25 mt-0.5">
                {targetSeconds > 0 ? 'remaining' : 'elapsed'}
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="space-y-2 text-xs">
            {[
              { label: "Session", value: `${operation.sessionDurationMinutes} min` },
              ...(operation.structuralLinkType ? [{ label: "Link Type", value: operation.structuralLinkType }] : []),
              { label: "Frequency", value: `${operation.frequencyHz} Hz` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">{item.label}</span>
                <span className="font-mono text-[10px] text-white/55 capitalize">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Active filter cards */}
          {opCards.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/25">Filter Cards</div>
              <div className="flex flex-wrap gap-1">
                {opCards.slice(0, 8).map(card => (
                  <div
                    key={card.id}
                    className="flex items-center gap-1 rounded px-2 py-0.5"
                    style={{
                      background: "hsla(270,35%,12%,1)",
                      border: "1px solid hsla(270,45%,25%,0.5)"
                    }}
                    title={card.title}
                    data-testid={`badge-card-${card.id}`}
                  >
                    <span className="text-xs">{card.symbol}</span>
                    <span className="text-[9px] font-mono text-primary/70 max-w-[45px] truncate">{card.title.split(' ')[0]}</span>
                  </div>
                ))}
                {opCards.length > 8 && (
                  <div className="rounded px-2 py-0.5 text-[9px] font-mono text-white/30"
                    style={{ background: "hsla(228,25%,10%,1)", border: "1px solid hsla(228,25%,16%,1)" }}>
                    +{opCards.length - 8}
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
