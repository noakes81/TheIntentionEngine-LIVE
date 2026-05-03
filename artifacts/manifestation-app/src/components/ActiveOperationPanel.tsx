import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Clock, Sparkles, Target } from "lucide-react";
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

function LiveWaveform({ active, frequency }: { active: boolean; frequency: number }) {
  const bars = Array.from({ length: 40 });
  const speed = Math.max(0.15, 1.8 - Math.log10(Math.max(1, frequency)) * 0.45);
  return (
    <div className="h-16 w-full flex items-center justify-center gap-[3px] overflow-hidden relative">
      {active && <div className="absolute inset-0 bg-primary/6 blur-2xl rounded-full pointer-events-none" />}
      {bars.map((_, i) => {
        const phase = Math.sin((i / bars.length) * Math.PI * 2);
        const base = 6 + Math.abs(phase) * 36;
        return (
          <motion.div
            key={i}
            className={`rounded-full flex-shrink-0 w-[3px] ${active ? 'bg-gradient-to-t from-primary/50 to-primary' : 'bg-muted/20'}`}
            animate={active ? { height: [base * 0.4, base * 1.2, base * 0.5, base * 1.0, base * 0.4] } : { height: 2 }}
            transition={{ duration: speed, repeat: Infinity, ease: "easeInOut", delay: i * (speed / bars.length) }}
            style={{ boxShadow: active ? `0 0 5px hsl(var(--primary) / 0.5)` : 'none' }}
          />
        );
      })}
    </div>
  );
}

function RateDisplay({ rate, color }: { rate?: string; color: "primary" | "amber" }) {
  if (!rate) return null;
  const cls = color === "amber"
    ? "border-amber-500/25 bg-amber-500/8 text-amber-400/80"
    : "border-primary/25 bg-primary/8 text-primary/80";
  return (
    <div className={`font-mono text-xs tracking-widest px-2 py-1 rounded border ${cls} inline-block`}>
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
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-[#0d0d1f]" data-testid="active-operation-panel">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.10),transparent)] pointer-events-none" />
      {isRunning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.07), transparent)" }}
        />
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-primary/10 bg-background/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary' : isPaused ? 'bg-amber-400' : 'bg-muted'}`}
            animate={isRunning ? { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {isRunning ? 'Chi Field Transmitting' : isPaused ? 'Transmission Paused' : 'Standby'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/50">{operation.frequencyHz} Hz</span>
      </div>

      <div className="p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        {/* Left: waveform + controls + trend+target */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-serif text-foreground leading-tight">{operation.name}</h2>
          </div>

          {/* TREND */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary/60">
              <Sparkles className="w-3 h-3" /> TREND
            </div>
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/40 pl-3 leading-relaxed line-clamp-2">
              "{operation.intention}"
            </p>
            <RateDisplay rate={operation.trendRate} color="primary" />
          </div>

          {/* TARGET */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400/60">
              <Target className="w-3 h-3" /> TARGET
            </div>
            <div className="flex items-center gap-2">
              {operation.target.photo && (
                <img src={operation.target.photo} alt="Witness" className="w-9 h-9 rounded-lg object-cover border border-amber-500/20 shrink-0" data-testid="img-active-witness" />
              )}
              <div>
                <p className="text-sm font-medium">{operation.target.name}</p>
                {operation.target.description && <p className="text-xs text-muted-foreground line-clamp-1">{operation.target.description}</p>}
              </div>
            </div>
            <RateDisplay rate={operation.targetRate} color="amber" />
          </div>

          {/* Transfer Diagram — shown prominently when present */}
          {operation.target.transferDiagram && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/60">Transfer Diagram — Structural Link Active</div>
              <div className="relative rounded-xl overflow-hidden border border-amber-500/25 bg-amber-500/5">
                <img
                  src={operation.target.transferDiagram}
                  alt="Transfer Diagram"
                  className="w-full max-h-28 object-contain p-2"
                  data-testid="img-transfer-diagram"
                />
                {operation.status === 'running' && (
                  <div className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{ boxShadow: "inset 0 0 20px rgba(251,191,36,0.15)" }} />
                )}
              </div>
              <p className="text-[10px] text-amber-400/50 font-mono">Place physical printout on chi generator to maintain link.</p>
            </div>
          )}

          {/* Waveform */}
          <LiveWaveform active={isRunning} frequency={operation.frequencyHz} />

          {/* Progress bar */}
          {targetSeconds > 0 && (
            <div className="space-y-1">
              <div className="h-px rounded-full bg-primary/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  style={{ boxShadow: "0 0 6px hsl(var(--primary) / 0.5)" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40 uppercase">
                <span>{formatTime(elapsedSeconds)} elapsed</span>
                <span>{Math.round(progress)}%</span>
                <span>{formatTime(remainingSeconds)} remaining</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="default"
              className={`gap-2 px-7 rounded-full font-medium transition-all ${
                isRunning
                  ? 'bg-primary/15 border border-primary/35 text-primary hover:bg-primary/25'
                  : 'bg-primary hover:bg-primary/90 shadow-[0_0_18px_rgba(139,92,246,0.4)]'
              }`}
              onClick={() => onStatusChange(isRunning ? 'paused' : 'running')}
              data-testid="button-op-toggle"
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> {isPaused ? 'Resume' : 'Transmit'}</>}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-border/40 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onStatusChange('idle')} disabled={operation.status === 'idle'} data-testid="button-op-stop">
              <Square className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => { reset(); onStatusChange('idle'); }} data-testid="button-op-reset">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: clock + meta */}
        <div className="space-y-5 lg:border-l lg:border-primary/10 lg:pl-7">
          {/* Countdown clock */}
          <div className="relative w-[140px] mx-auto aspect-square flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-primary/10" strokeWidth="3" cx="50" cy="50" r="46" fill="transparent" />
              <motion.circle
                className="stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                cx="50" cy="50" r="46" fill="transparent"
                style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.6))" }}
                animate={{ strokeDasharray: `${(progress / 100) * 289} 289` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-2xl font-mono font-light tracking-tighter">
                {formatTime(targetSeconds > 0 ? remainingSeconds : elapsedSeconds)}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-1">
                {targetSeconds > 0 ? 'remaining' : 'elapsed'}
              </div>
            </div>
          </div>

          {/* Session info */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground/50 font-mono uppercase tracking-widest text-[10px]">
                <Clock className="w-3 h-3" /> Session
              </div>
              <span className="font-mono text-foreground">{operation.sessionDurationMinutes} min</span>
            </div>
            {operation.structuralLinkType && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground/50 font-mono uppercase tracking-widest text-[10px]">Link Type</span>
                <span className="font-mono text-muted-foreground capitalize">{operation.structuralLinkType}</span>
              </div>
            )}
          </div>

          {/* Active filter cards */}
          {opCards.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Filter Cards</div>
              <div className="flex flex-wrap gap-1.5">
                {opCards.slice(0, 8).map(card => (
                  <div key={card.id} className="flex items-center gap-1 bg-primary/8 border border-primary/15 rounded-full px-2 py-0.5" title={card.title} data-testid={`badge-card-${card.id}`}>
                    <span className="text-xs">{card.symbol}</span>
                    <span className="text-[10px] font-medium text-primary/70 max-w-[50px] truncate">{card.title.split(' ')[0]}</span>
                  </div>
                ))}
                {opCards.length > 8 && <div className="bg-background/50 border border-border/30 rounded-full px-2 py-0.5 text-[10px] text-muted-foreground">+{opCards.length - 8}</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{ transformOrigin: "center" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
