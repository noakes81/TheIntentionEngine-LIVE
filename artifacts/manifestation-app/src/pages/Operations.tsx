import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/types";
import { Play, Pause, Copy, Trash2, Clock, Sparkles, Target, Pencil, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Operations() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [, navigate] = useLocation();

  const handleStatusChange = (id: string, newStatus: Operation["status"]) => {
    setOperations(ops =>
      ops.map(op => {
        if (op.id === id) {
          // Reset elapsed when starting fresh (not resuming from paused)
          const shouldResetElapsed =
            newStatus === 'running' && (op.status === 'idle' || op.status === 'completed');
          return {
            ...op,
            status: newStatus,
            elapsedSeconds: shouldResetElapsed ? 0 : op.elapsedSeconds,
            lastRunAt: newStatus === 'running' ? new Date().toISOString() : op.lastRunAt,
          };
        }
        if (newStatus === 'running' && op.status === 'running') return { ...op, status: 'paused' };
        return op;
      })
    );
    // Go to Control Panel so the user can see the active transmission
    if (newStatus === 'running') navigate("/");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this radionic operation?")) {
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

  const byNewest = (a: Operation, b: Operation) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  const running = operations.filter(op => op.status === 'running').sort(byNewest);
  const paused = operations.filter(op => op.status === 'paused').sort(byNewest);
  const idle = operations.filter(op => op.status !== 'running' && op.status !== 'paused').sort(byNewest);

  const OperationCard = ({ op, idx }: { op: Operation; idx: number }) => {
    const isRunning = op.status === 'running';
    const isPaused = op.status === 'paused';

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        className="rounded overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
          border: isRunning
            ? "1px solid hsla(270,75%,50%,0.45)"
            : isPaused
            ? "1px solid hsla(38,85%,52%,0.3)"
            : "1px solid hsla(228,25%,13%,0.9)",
          boxShadow: isRunning
            ? "0 0 20px hsla(270,75%,58%,0.1), 0 4px 16px hsla(0,0%,0%,0.4)"
            : "0 4px 16px hsla(0,0%,0%,0.4)"
        }}
        data-testid={`card-operation-${op.id}`}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            background: isRunning
              ? "linear-gradient(90deg, hsla(270,45%,11%,1), hsla(228,35%,6%,1))"
              : isPaused
              ? "linear-gradient(90deg, hsla(38,35%,9%,1), hsla(228,35%,6%,1))"
              : "linear-gradient(90deg, hsla(228,35%,8%,1), hsla(228,35%,6%,1))",
            borderBottom: "1px solid hsla(228,25%,12%,1)"
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background: isRunning
                  ? "hsla(120,80%,50%,1)"
                  : isPaused
                  ? "hsla(38,95%,55%,1)"
                  : "hsla(228,25%,22%,1)",
                boxShadow: isRunning
                  ? "0 0 6px hsla(120,80%,50%,0.8)"
                  : isPaused
                  ? "0 0 6px hsla(38,95%,55%,0.8)"
                  : "none"
              }}
            />
            <h3 className="text-sm font-mono font-medium text-white/80 truncate">{op.name}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[11px] font-mono uppercase px-2 py-0.5 rounded"
              style={{
                background: isRunning
                  ? "hsla(270,35%,18%,1)"
                  : isPaused
                  ? "hsla(38,35%,12%,1)"
                  : "hsla(228,25%,10%,1)",
                border: isRunning
                  ? "1px solid hsla(270,45%,30%,0.6)"
                  : isPaused
                  ? "1px solid hsla(38,60%,35%,0.5)"
                  : "1px solid hsla(228,25%,16%,0.8)",
                color: isRunning
                  ? "hsla(270,75%,70%,1)"
                  : isPaused
                  ? "hsla(38,95%,62%,1)"
                  : "hsla(228,10%,40%,1)"
              }}
            >
              {op.status}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          {/* Trend */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5" style={{ color: "hsla(270,75%,65%,0.7)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "hsla(270,75%,65%,0.7)" }}>Trend</span>
            </div>
            <p className="text-xs italic text-white/40 line-clamp-2 leading-relaxed"
              style={{ borderLeft: "2px solid hsla(270,45%,40%,0.35)", paddingLeft: "8px" }}>
              "{op.intention}"
            </p>
            {op.trendRate && (
              <span
                className="text-[12px] font-mono tabular-nums px-2 py-0.5 rounded inline-block"
                style={{
                  background: "hsla(120,30%,4%,1)",
                  border: "1px solid hsla(120,50%,20%,0.3)",
                  color: "hsla(120,75%,55%,0.85)",
                  letterSpacing: "0.2em"
                }}
              >
                {op.trendRate}
              </span>
            )}
          </div>

          {/* Target */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Target className="w-2.5 h-2.5" style={{ color: "hsla(38,85%,62%,0.7)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "hsla(38,85%,62%,0.7)" }}>Target</span>
            </div>
            <div className="flex items-center gap-2">
              {op.target.photo && (
                <img src={op.target.photo} alt="Witness" className="w-7 h-7 rounded object-cover shrink-0"
                  style={{ border: "1px solid hsla(38,85%,52%,0.25)" }} />
              )}
              <span className="text-xs font-medium text-white/65">{op.target.name}</span>
            </div>
            {op.targetRate && (
              <span
                className="text-[12px] font-mono tabular-nums px-2 py-0.5 rounded inline-block"
                style={{
                  background: "hsla(38,25%,4%,1)",
                  border: "1px solid hsla(38,75%,28%,0.3)",
                  color: "hsla(38,95%,60%,0.85)",
                  letterSpacing: "0.2em"
                }}
              >
                {op.targetRate}
              </span>
            )}
          </div>

          {/* Params */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded"
              style={{
                background: "hsla(270,25%,10%,1)",
                border: "1px solid hsla(270,45%,22%,0.5)",
                color: "hsla(270,75%,65%,0.8)"
              }}
            >
              {op.frequencyHz} Hz
            </span>
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
              style={{
                background: "hsla(228,25%,8%,1)",
                border: "1px solid hsla(228,25%,15%,0.8)",
                color: "hsla(228,10%,40%,1)"
              }}
            >
              <Clock className="w-2.5 h-2.5" /> {op.sessionDurationMinutes === 0 ? "∞" : `${op.sessionDurationMinutes}m`}
            </span>
            {op.elapsedSeconds > 0 && (
              <span className="text-[11px] font-mono text-white/20">
                {Math.floor(op.elapsedSeconds / 60)}m elapsed
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid hsla(228,25%,11%,1)" }}>
            <div className="flex gap-1.5">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all"
                style={isRunning ? {
                  background: "hsla(270,35%,14%,1)",
                  border: "1px solid hsla(270,45%,28%,0.5)",
                  color: "hsla(270,75%,70%,1)"
                } : {
                  background: "linear-gradient(135deg, hsla(270,65%,35%,1), hsla(270,55%,28%,1))",
                  border: "1px solid hsla(270,75%,50%,0.5)",
                  color: "white",
                  boxShadow: "0 0 10px hsla(270,75%,58%,0.2)"
                }}
                onClick={() => handleStatusChange(op.id, isRunning ? 'paused' : 'running')}
                data-testid={`button-toggle-${op.id}`}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? 'Pause' : isPaused ? 'Resume' : 'Transmit'}
              </button>
              <button
                className="p-1.5 rounded transition-all"
                style={{
                  background: "hsla(38,25%,8%,1)",
                  border: "1px solid hsla(38,60%,30%,0.35)",
                  color: "hsla(38,85%,60%,0.7)"
                }}
                title="Edit"
                onClick={() => navigate(`/builder?edit=${op.id}`)}
                data-testid={`button-edit-${op.id}`}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                className="p-1.5 rounded transition-all"
                style={{
                  background: "hsla(228,25%,8%,1)",
                  border: "1px solid hsla(228,25%,15%,0.8)",
                  color: "hsla(228,10%,38%,1)"
                }}
                title="Duplicate"
                onClick={() => handleDuplicate(op)}
                data-testid={`button-duplicate-${op.id}`}
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <button
              className="p-1.5 rounded transition-all"
              style={{
                background: "transparent",
                border: "1px solid transparent",
                color: "hsla(0,60%,45%,0.4)"
              }}
              onClick={() => handleDelete(op.id)}
              data-testid={`button-delete-${op.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const Section = ({ title, ops, accent }: { title: string; ops: Operation[]; accent?: string }) => ops.length === 0 ? null : (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-px" style={{ background: accent ?? "hsla(228,25%,20%,1)" }} />
        <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/30">{title}</span>
        <span className="text-[11px] font-mono text-white/20">({ops.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {ops.map((op, i) => <OperationCard key={op.id} op={op} idx={i} />)}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-400 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/25 mb-0.5">The Intention Engine</div>
          <h1 className="text-2xl font-mono font-bold text-white/85">Radionic Operations</h1>
          <p className="text-xs font-mono text-white/30 mt-0.5">Manage your stored TREND/TARGET transmission configurations.</p>
        </div>
        <Link href="/builder">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-all"
            style={{
              background: "linear-gradient(135deg, hsla(270,75%,38%,1), hsla(270,65%,28%,1))",
              border: "1px solid hsla(270,75%,52%,0.5)",
              color: "white",
              boxShadow: "0 0 14px hsla(270,75%,58%,0.25)"
            }}
            data-testid="button-new-operation"
          >
            <Plus className="w-3.5 h-3.5" /> New Operation
          </button>
        </Link>
      </div>

      {operations.length === 0 ? (
        <div
          className="rounded p-12 text-center"
          style={{
            background: "linear-gradient(160deg, hsla(228,35%,7%,0.95), hsla(228,40%,4%,1))",
            border: "1px dashed hsla(228,25%,16%,0.8)"
          }}
        >
          <h2 className="text-lg font-mono text-white/30 mb-2">No Operations Found</h2>
          <p className="text-sm font-mono text-white/20 mb-6">Build your first radionic operation using the Position Builder.</p>
          <Link href="/builder">
            <button
              className="px-4 py-2 rounded text-sm font-mono"
              style={{
                background: "linear-gradient(135deg, hsla(270,75%,38%,1), hsla(270,65%,28%,1))",
                border: "1px solid hsla(270,75%,52%,0.5)",
                color: "white"
              }}
            >
              Open Position Builder
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Transmitting" ops={running} accent="hsla(120,70%,45%,0.7)" />
          <Section title="Paused" ops={paused} accent="hsla(38,85%,52%,0.6)" />
          <Section title="Stored Operations" ops={idle} accent="hsla(270,45%,45%,0.5)" />
        </div>
      )}
    </div>
  );
}
