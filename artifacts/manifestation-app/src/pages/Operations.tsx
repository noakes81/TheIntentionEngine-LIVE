import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Copy, Trash2, Clock, Sparkles, Target } from "lucide-react";
import { Link } from "wouter";

export default function Operations() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);

  const handleStatusChange = (id: string, newStatus: Operation["status"]) => {
    setOperations(ops =>
      ops.map(op => {
        if (op.id === id) return { ...op, status: newStatus, lastRunAt: newStatus === 'running' ? new Date().toISOString() : op.lastRunAt };
        if (newStatus === 'running' && op.status === 'running') return { ...op, status: 'paused' };
        return op;
      })
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this radionic position?")) {
      setOperations(ops => ops.filter(op => op.id !== id));
    }
  };

  const handleDuplicate = (op: Operation) => {
    const duplicated: Operation = {
      ...op,
      id: `op-${Date.now()}`,
      name: `${op.name} (Copy)`,
      status: 'idle',
      elapsedSeconds: 0,
      createdAt: new Date().toISOString(),
      lastRunAt: undefined
    };
    setOperations([duplicated, ...operations]);
  };

  const statusColors: Record<string, string> = {
    running: "bg-primary text-primary-foreground animate-pulse",
    paused:  "bg-amber-500/20 text-amber-400 border-amber-500/40",
    idle:    "bg-muted/20 text-muted-foreground",
    completed: "bg-green-500/20 text-green-400 border-green-500/40",
  };

  const running = operations.filter(op => op.status === 'running');
  const paused = operations.filter(op => op.status === 'paused');
  const idle = operations.filter(op => op.status !== 'running' && op.status !== 'paused');

  const Section = ({ title, ops }: { title: string; ops: Operation[] }) => ops.length === 0 ? null : (
    <div className="space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 border-b border-border/20 pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ops.map(op => (
          <Card
            key={op.id}
            data-testid={`card-operation-${op.id}`}
            className={`glass-card overflow-hidden transition-all ${op.status === 'running' ? 'border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.12)]' : 'border-border/30'}`}
          >
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-base font-medium leading-tight">{op.name}</h3>
                <Badge className={`text-[10px] font-mono shrink-0 ${statusColors[op.status] || statusColors.idle}`}>
                  {op.status.toUpperCase()}
                </Badge>
              </div>

              {/* TREND */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary/60">
                  <Sparkles className="w-3 h-3" /> TREND
                </div>
                <p className="text-sm italic text-muted-foreground line-clamp-2 border-l-2 border-primary/30 pl-3">
                  "{op.intention}"
                </p>
                {op.trendRate && (
                  <div className="flex gap-1 mt-1">
                    {op.trendRate.map((d, i) => (
                      <span key={i} className="w-6 h-6 flex items-center justify-center text-xs font-mono rounded border border-primary/25 bg-primary/8 text-primary/80">{d}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground/40 self-center ml-1 font-mono">rate</span>
                  </div>
                )}
              </div>

              {/* TARGET */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400/60">
                  <Target className="w-3 h-3" /> TARGET
                </div>
                <div className="flex items-center gap-2">
                  {op.target.photo && (
                    <img src={op.target.photo} alt="Witness" className="w-8 h-8 rounded object-cover border border-amber-500/20 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground">{op.target.name}</span>
                </div>
                {op.targetRate && (
                  <div className="flex gap-1 mt-1">
                    {op.targetRate.map((d, i) => (
                      <span key={i} className="w-6 h-6 flex items-center justify-center text-xs font-mono rounded border border-amber-500/25 bg-amber-500/8 text-amber-400/80">{d}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground/40 self-center ml-1 font-mono">rate</span>
                  </div>
                )}
              </div>

              {/* Params row */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="bg-background/50 px-2 py-1 rounded border border-border/40 text-primary">
                  {op.frequencyHz} Hz
                </div>
                <div className="bg-background/50 px-2 py-1 rounded border border-border/40 flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {op.sessionDurationMinutes}m
                </div>
                {op.elapsedSeconds > 0 && (
                  <div className="text-muted-foreground/50">
                    {Math.floor(op.elapsedSeconds / 60)}m elapsed
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={op.status === 'running'
                      ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                      : 'bg-primary hover:bg-primary/90'}
                    onClick={() => handleStatusChange(op.id, op.status === 'running' ? 'paused' : 'running')}
                    data-testid={`button-toggle-${op.id}`}
                  >
                    {op.status === 'running' ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                    {op.status === 'running' ? 'Pause' : op.status === 'paused' ? 'Resume' : 'Transmit'}
                  </Button>
                  <Button size="sm" variant="outline" title="Duplicate position" onClick={() => handleDuplicate(op)} data-testid={`button-duplicate-${op.id}`}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(op.id)} data-testid={`button-delete-${op.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Radionic Positions</h1>
          <p className="text-muted-foreground mt-2">Manage your stored TREND/TARGET transmission configurations.</p>
        </div>
        <Link href="/builder">
          <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-operation">New Position</Button>
        </Link>
      </header>

      {operations.length === 0 ? (
        <Card className="glass-card p-12 text-center border-dashed">
          <h2 className="text-2xl font-serif mb-2 text-muted-foreground">No Positions Found</h2>
          <p className="text-muted-foreground/60 mb-6">Build your first radionic position using the Position Builder.</p>
          <Link href="/builder">
            <Button className="bg-primary hover:bg-primary/90">Open Position Builder</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-10">
          <Section title="Transmitting" ops={running} />
          <Section title="Paused" ops={paused} />
          <Section title="Stored Positions" ops={idle} />
        </div>
      )}
    </div>
  );
}
