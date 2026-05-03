import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Copy, Trash2, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Operations() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);

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

  const handleDelete = (id: string) => {
    if (confirm("Delete this operation?")) {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Saved Operations</h1>
          <p className="text-muted-foreground mt-2">Manage your stored energetic transmissions.</p>
        </div>
        <Link href="/builder">
          <Button className="bg-primary hover:bg-primary/90">New Operation</Button>
        </Link>
      </header>

      {operations.length === 0 ? (
        <Card className="glass-card p-12 text-center border-dashed">
          <h2 className="text-2xl font-serif mb-2">No Operations Found</h2>
          <p className="text-muted-foreground mb-6">Create your first energetic transmission in the builder.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operations.map(op => (
            <Card key={op.id} className={`glass-card overflow-hidden transition-all ${op.status === 'running' ? 'border-primary/50 shadow-[0_0_20px_rgba(157,78,221,0.15)]' : ''}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium truncate">{op.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Target: {op.target.name}</p>
                  </div>
                  <Badge variant={op.status === 'running' ? 'default' : 'outline'} className={op.status === 'running' ? 'bg-primary animate-pulse' : ''}>
                    {op.status}
                  </Badge>
                </div>
                
                <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3 py-1 mb-6 line-clamp-2">
                  "{op.intention}"
                </p>
                
                <div className="flex items-center gap-4 text-xs font-mono mb-6">
                  <div className="bg-background/50 px-2 py-1 rounded border border-border/50">
                    <span className="text-primary">{op.frequencyHz}</span> Hz
                  </div>
                  <div className="bg-background/50 px-2 py-1 rounded border border-border/50 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{op.sessionDurationMinutes} min</span>
                  </div>
                  {op.elapsedSeconds > 0 && (
                    <div className="text-muted-foreground">
                      Ran: {formatTime(op.elapsedSeconds)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={op.status === 'running' ? 'secondary' : 'default'}
                      className={op.status === 'running' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-primary hover:bg-primary/90'}
                      onClick={() => handleStatusChange(op.id, op.status === 'running' ? 'paused' : 'running')}
                    >
                      {op.status === 'running' ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {op.status === 'running' ? 'Pause' : 'Start'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Duplicate"
                      onClick={() => handleDuplicate(op)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete"
                    onClick={() => handleDelete(op.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
