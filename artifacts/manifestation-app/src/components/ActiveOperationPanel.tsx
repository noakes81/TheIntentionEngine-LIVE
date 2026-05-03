import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Zap, Target, Clock } from "lucide-react";
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
    <div className="h-20 w-full flex items-center justify-center gap-[3px] overflow-hidden relative">
      {active && <div className="absolute inset-0 bg-primary/8 blur-2xl rounded-full pointer-events-none" />}
      {bars.map((_, i) => {
        const phase = Math.sin((i / bars.length) * Math.PI * 2);
        const base = 8 + Math.abs(phase) * 44;
        return (
          <motion.div
            key={i}
            className={`rounded-full flex-shrink-0 w-[3px] ${active ? 'bg-gradient-to-t from-primary/60 to-primary' : 'bg-muted/30'}`}
            animate={active
              ? { height: [base * 0.4, base * 1.15, base * 0.55, base * 1.0, base * 0.4] }
              : { height: 3 }
            }
            transition={{
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * (speed / bars.length),
            }}
            style={{
              boxShadow: active ? `0 0 6px hsl(var(--primary) / 0.6)` : 'none',
            }}
          />
        );
      })}
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
    if (target > 0 && elapsedSeconds >= target) {
      onStatusChange('completed');
    }
  }, [elapsedSeconds]);

  const targetSeconds = operation.sessionDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const opCards = cards.filter(c => operation.cards.includes(c.id));

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-[#0d0d1f]" data-testid="active-operation-panel">
      {/* Cosmic radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.12),transparent)] pointer-events-none" />
      {isRunning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.08), transparent)" }}
        />
      )}

      {/* Transmission status bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-primary/10 bg-background/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary' : isPaused ? 'bg-amber-400' : 'bg-muted'}`}
            animate={isRunning ? { scale: [1, 1.6, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {isRunning ? 'Transmitting' : isPaused ? 'Paused' : 'Standby'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
          <Zap className="w-3 h-3 text-primary/60" />
          <span>{operation.frequencyHz} Hz</span>
        </div>
      </div>

      <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Left: main content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-serif text-foreground leading-tight">{operation.name}</h2>
            <p className="text-base text-muted-foreground italic border-l-2 border-primary/40 pl-4 mt-3 leading-relaxed">
              "{operation.intention}"
            </p>
          </div>

          {/* Live waveform */}
          <div className="relative">
            <LiveWaveform active={isRunning} frequency={operation.frequencyHz} />
            {isRunning && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            )}
          </div>

          {/* Progress bar */}
          {operation.sessionDurationMinutes > 0 && (
            <div className="space-y-1.5">
              <div className="h-1 rounded-full bg-primary/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.5)" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
                <span>Elapsed {formatTime(elapsedSeconds)}</span>
                {targetSeconds > 0 && <span>{Math.round(progress)}% complete</span>}
                {targetSeconds > 0 && <span>Remaining {formatTime(remainingSeconds)}</span>}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className={`gap-2 px-8 rounded-full font-medium transition-all ${
                isRunning
                  ? 'bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)]'
              }`}
              onClick={() => onStatusChange(isRunning ? 'paused' : 'running')}
              data-testid="button-op-toggle"
            >
              {isRunning
                ? <><Pause className="w-4 h-4" /> Pause</>
                : <><Play className="w-4 h-4" /> {isPaused ? 'Resume' : 'Transmit'}</>
              }
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border/40 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => onStatusChange('idle')}
              disabled={operation.status === 'idle'}
              data-testid="button-op-stop"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => { reset(); onStatusChange('idle'); }}
              data-testid="button-op-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4 lg:border-l lg:border-primary/10 lg:pl-8">
          {/* Countdown clock */}
          <div className="relative w-full aspect-square max-w-[160px] mx-auto flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-primary/10" strokeWidth="3" cx="50" cy="50" r="46" fill="transparent" />
              <motion.circle
                className="stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                cx="50" cy="50" r="46"
                fill="transparent"
                style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.7))" }}
                animate={{ strokeDasharray: `${(progress / 100) * 289} 289` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-3xl font-mono font-light tracking-tighter text-foreground">
                {formatTime(targetSeconds > 0 ? remainingSeconds : elapsedSeconds)}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mt-1">
                {targetSeconds > 0 ? 'remaining' : 'elapsed'}
              </div>
            </div>
          </div>

          {/* Target info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <Target className="w-3 h-3" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-3">
              {operation.target.photo && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                  <img src={operation.target.photo} alt="Witness" className="w-full h-full object-cover" data-testid="img-active-witness" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-foreground">{operation.target.name}</p>
                {operation.target.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{operation.target.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <Clock className="w-3 h-3" />
              <span>Session</span>
            </div>
            <p className="text-sm font-medium text-foreground">{operation.sessionDurationMinutes} min target</p>
          </div>

          {/* Active cards */}
          {opCards.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">Archetypes</div>
              <div className="flex flex-wrap gap-1.5">
                {opCards.slice(0, 6).map(card => (
                  <div
                    key={card.id}
                    className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5"
                    title={card.title}
                    data-testid={`badge-card-${card.id}`}
                  >
                    <span className="text-xs">{card.symbol}</span>
                    <span className="text-[10px] font-medium text-primary/80 max-w-[60px] truncate">{card.title.split(' ')[0]}</span>
                  </div>
                ))}
                {opCards.length > 6 && (
                  <div className="bg-background/50 border border-border/30 rounded-full px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{opCards.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom frequency bar */}
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
