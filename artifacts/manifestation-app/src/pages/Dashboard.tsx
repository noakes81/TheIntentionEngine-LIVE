import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SessionTimer } from "@/components/SessionTimer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRESET_OPERATIONS } from "@/data/presets";
import { Operation } from "@/types";
import { Link } from "wouter";
import { Play, Plus } from "lucide-react";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";

export default function Dashboard() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  
  const activeOperation = operations.find(op => op.status === 'running' || op.status === 'paused');
  const recentOperations = operations.filter(op => op.status !== 'running' && op.status !== 'paused').slice(0, 3);

  const handleStatusChange = (id: string, newStatus: Operation["status"]) => {
    setOperations(ops => 
      ops.map(op => {
        if (op.id === id) {
          return { ...op, status: newStatus };
        }
        // If starting a new one, pause others
        if (newStatus === 'running' && op.status === 'running') {
          return { ...op, status: 'paused' };
        }
        return op;
      })
    );
  };

  const handleTick = (id: string, elapsed: number) => {
    setOperations(ops =>
      ops.map(op => op.id === id ? { ...op, elapsedSeconds: elapsed } : op)
    );
  };

  const startPreset = (preset: typeof PRESET_OPERATIONS[0]) => {
    const newOp: Operation = {
      ...preset,
      id: `op-${Date.now()}`,
      status: 'running',
      createdAt: new Date().toISOString(),
      lastRunAt: new Date().toISOString()
    };
    
    setOperations(ops => [
      newOp,
      ...ops.map(op => op.status === 'running' ? { ...op, status: 'paused' as const } : op)
    ]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-serif text-primary tracking-tight">Studio Dashboard</h1>
        <p className="text-muted-foreground mt-2">Initialize your field and set powerful intentions.</p>
      </header>

      {activeOperation ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card-active p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <h2 className="text-xl font-medium tracking-wide text-primary">Active Operation</h2>
              </div>
              <h3 className="text-3xl font-serif mb-2">{activeOperation.name}</h3>
              <p className="text-lg text-muted-foreground italic border-l-2 border-primary/50 pl-4 py-1 my-4">
                "{activeOperation.intention}"
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Target</span>
                  <p className="font-medium">{activeOperation.target.name}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Frequency</span>
                  <p className="font-mono text-primary text-xl">{activeOperation.frequencyHz} Hz</p>
                </div>
              </div>
            </div>
            <div className="mt-8 z-10">
              <WaveformVisualizer active={activeOperation.status === 'running'} frequency={activeOperation.frequencyHz} />
            </div>
          </Card>
          
          <SessionTimer 
            durationMinutes={activeOperation.sessionDurationMinutes}
            status={activeOperation.status}
            onStatusChange={(status) => handleStatusChange(activeOperation.id, status)}
            onTick={(elapsed) => handleTick(activeOperation.id, elapsed)}
          />
        </section>
      ) : (
        <Card className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Play className="w-8 h-8 ml-1" />
          </div>
          <h2 className="text-2xl font-serif mb-2">No Active Operations</h2>
          <p className="text-muted-foreground mb-8 max-w-md">The field is quiet. Start a new intention or choose a preset below to begin transmitting.</p>
          <Link href="/builder">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(157,78,221,0.4)]">
              <Plus className="w-4 h-4" /> Create Operation
            </Button>
          </Link>
        </Card>
      )}

      <section>
        <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
          <span className="text-secondary">✦</span> Quick Start Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_OPERATIONS.slice(0, 4).map((preset) => (
            <Card key={preset.id} className="glass-card p-5 cursor-pointer hover:border-secondary/50 transition-all hover:-translate-y-1 group" onClick={() => startPreset(preset)}>
              <h4 className="font-medium group-hover:text-secondary transition-colors line-clamp-1">{preset.name}</h4>
              <p className="text-xs text-muted-foreground mt-2 font-mono">{preset.frequencyHz} Hz • {preset.sessionDurationMinutes} min</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="pt-12 pb-8 border-t border-border/30 text-center">
        <p className="text-xs text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed">
          This software is designed for meditation, visualization, intention-setting, and entertainment/wellness purposes only. It does not diagnose, treat, cure, or prevent any medical condition, and makes no claims regarding financial, legal, or health outcomes. Results vary by individual. Not a substitute for professional medical, financial, or legal advice.
        </p>
      </footer>
    </div>
  );
}
