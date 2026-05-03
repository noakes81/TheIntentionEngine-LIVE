import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ActiveOperationPanel } from "@/components/ActiveOperationPanel";
import { ChiFieldIndicator } from "@/components/ChiFieldIndicator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRESET_OPERATIONS } from "@/data/presets";
import { Operation, SymbolicCard } from "@/types";
import { Link } from "wouter";
import { Plus, Sparkles, Target } from "lucide-react";

export default function Dashboard() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cards] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const activeOperation = operations.find(op => op.status === 'running' || op.status === 'paused');
  const recentOperations = operations.filter(op => op.status !== 'running' && op.status !== 'paused').slice(0, 4);

  const handleStatusChange = (id: string, newStatus: Operation["status"]) => {
    setOperations(ops =>
      ops.map(op => {
        if (op.id === id) return { ...op, status: newStatus, lastRunAt: newStatus === 'running' ? new Date().toISOString() : op.lastRunAt };
        if (newStatus === 'running' && op.status === 'running') return { ...op, status: 'paused' };
        return op;
      })
    );
  };

  const handleTick = (id: string, elapsed: number) => {
    setOperations(ops => ops.map(op => op.id === id ? { ...op, elapsedSeconds: elapsed } : op));
  };

  const startPreset = (preset: typeof PRESET_OPERATIONS[0]) => {
    const newOp: Operation = {
      ...preset,
      id: `op-${Date.now()}`,
      status: 'running',
      elapsedSeconds: 0,
      createdAt: new Date().toISOString(),
      lastRunAt: new Date().toISOString()
    };
    setOperations(ops => [newOp, ...ops.map(op => op.status === 'running' ? { ...op, status: 'paused' as const } : op)]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1">Orgone Manifestation Studio</p>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Control Panel</h1>
          <p className="text-muted-foreground mt-1">Initialize the chi field and set your radionic positions.</p>
        </div>
        <ChiFieldIndicator active={activeOperation?.status === 'running'} frequencyHz={activeOperation?.frequencyHz} size="md" />
      </header>

      {activeOperation ? (
        <section>
          <ActiveOperationPanel
            operation={activeOperation}
            cards={cards}
            onStatusChange={(status) => handleStatusChange(activeOperation.id, status)}
            onTick={(elapsed) => handleTick(activeOperation.id, elapsed)}
          />
        </section>
      ) : (
        <Card className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-border/30 hover:border-primary/30 transition-colors">
          <div className="mb-6">
            <ChiFieldIndicator active={false} size="lg" />
          </div>
          <h2 className="text-2xl font-serif mb-2 text-muted-foreground">No Active Positions</h2>
          <p className="text-muted-foreground/60 mb-8 max-w-md text-sm">
            The chi field is quiet. Select a preset below to begin transmitting, or build a custom radionic position.
          </p>
          <Link href="/builder">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_rgba(139,92,246,0.35)]" data-testid="button-create-operation">
              <Plus className="w-4 h-4" /> New Position
            </Button>
          </Link>
        </Card>
      )}

      {/* Quick Start Presets */}
      <section>
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60 mb-4">Quick-Start Positions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_OPERATIONS.slice(0, 6).map((preset) => (
            <Card
              key={preset.id}
              className="glass-card p-4 cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-0.5 group"
              onClick={() => startPreset(preset)}
              data-testid={`preset-${preset.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{preset.name}</h4>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0 ml-2">{preset.frequencyHz} Hz</span>
              </div>
              <p className="text-xs text-muted-foreground/70 italic line-clamp-2 mb-3">"{preset.intention.slice(0, 80)}..."</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {/* TREND rate mini display */}
                  <div className="flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-primary/50" />
                    {preset.trendRate.map((d, i) => (
                      <span key={i} className="text-[10px] font-mono text-primary/60">{d}</span>
                    ))}
                  </div>
                  <span className="text-muted-foreground/30 text-xs mx-1">|</span>
                  <div className="flex items-center gap-0.5">
                    <Target className="w-2.5 h-2.5 text-amber-400/50" />
                    {preset.targetRate.map((d, i) => (
                      <span key={i} className="text-[10px] font-mono text-amber-400/60">{d}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono">{preset.sessionDurationMinutes}m</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stored positions summary */}
      {recentOperations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Stored Positions</h3>
            <Link href="/operations">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentOperations.map(op => (
              <div
                key={op.id}
                className="flex items-center justify-between bg-background/30 border border-border/30 rounded-xl px-4 py-3 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(op.id, 'running')}
                data-testid={`stored-op-${op.id}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{op.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{op.frequencyHz} Hz — {op.target.name}</p>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0 text-primary hover:bg-primary/10 ml-3">Transmit</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="pt-8 pb-6 border-t border-border/20 text-center">
        <p className="text-[10px] text-muted-foreground/40 max-w-3xl mx-auto leading-relaxed">
          This software is designed for meditation, visualization, intention-setting, and entertainment/wellness purposes only. It does not diagnose, treat, cure, or prevent any medical condition, and makes no claims regarding financial, legal, or health outcomes. Results vary by individual. Not a substitute for professional medical, financial, or legal advice.
        </p>
      </footer>
    </div>
  );
}
