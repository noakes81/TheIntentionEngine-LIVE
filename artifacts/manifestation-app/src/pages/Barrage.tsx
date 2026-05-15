import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserData } from "@/hooks/useUserData";
import { Operation, BarrageSession } from "@/types";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronUp, ChevronDown, RotateCcw, Play, Check, X } from "lucide-react";

const INTERVAL_OPTIONS = [1, 3, 5, 10, 15] as const;

export default function Barrage() {
  const [operations, setOperations] = useUserData<Operation[]>("orgone_operations", []);
  const [, setBarrage] = useLocalStorage<BarrageSession | null>("orgone_barrage", null);
  const [, navigate] = useLocation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(5);
  const [loop, setLoop] = useState(true);

  const availableOps = operations.filter(op => op.status !== "running");

  const toggleOp = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(s => s !== id));
      setOrderedIds(prev => prev.filter(s => s !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
      setOrderedIds(prev => [...prev, id]);
    }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setOrderedIds(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === orderedIds.length - 1) return;
    setOrderedIds(prev => {
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const startBarrage = () => {
    if (orderedIds.length < 2) return;
    const firstId = orderedIds[0];
    setOperations(ops =>
      ops.map(op => ({
        ...op,
        status: op.id === firstId ? "running" : op.status === "running" ? "paused" : op.status,
        elapsedSeconds: op.id === firstId ? 0 : op.elapsedSeconds,
        lastRunAt: op.id === firstId ? new Date().toISOString() : op.lastRunAt,
      }))
    );
    setBarrage({
      active: true,
      operationIds: orderedIds,
      intervalMinutes,
      currentIdx: 0,
      loop,
    });
    navigate("/");
  };

  const rowStyle = {
    background: "linear-gradient(160deg, hsla(228,35%,8%,0.98), hsla(228,35%,5%,1))",
    border: "1px solid hsla(228,25%,14%,0.8)",
  };

  return (
    <div className="animate-in fade-in duration-400 space-y-5 pb-20">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Zap className="w-4 h-4" style={{ color: "hsla(270,75%,65%,0.8)" }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/25">Radionic Barrage</span>
        </div>
        <h1 className="text-xl md:text-2xl font-mono font-bold text-white/90 tracking-wide">Barrage Mode</h1>
        <p className="text-sm font-mono text-white/30 mt-1 hidden sm:block">
          Cycle through multiple operations automatically — each runs for a fixed interval then advances.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">

        {/* Left: operation selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px" style={{ background: "hsla(270,75%,58%,0.5)" }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
              Select Operations ({selectedIds.length} selected)
            </span>
          </div>

          {availableOps.length === 0 ? (
            <div className="rounded p-8 text-center" style={rowStyle}>
              <p className="text-sm font-mono text-white/30">No operations found. Build some in the Position Builder first.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {availableOps.map((op, i) => {
                const sel = selectedIds.includes(op.id);
                return (
                  <motion.button
                    key={op.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    type="button"
                    onClick={() => toggleOp(op.id)}
                    className="w-full text-left rounded px-4 py-3 transition-all flex items-center gap-3"
                    style={{
                      background: sel ? "hsla(270,35%,11%,1)" : "hsla(228,35%,7%,0.98)",
                      border: sel ? "1px solid hsla(270,75%,45%,0.45)" : "1px solid hsla(228,25%,14%,0.8)",
                      boxShadow: sel ? "0 0 12px hsla(270,75%,45%,0.08)" : "none",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: sel ? "hsla(270,75%,45%,1)" : "hsla(228,25%,12%,1)",
                        border: sel ? "1px solid hsla(270,75%,60%,0.6)" : "1px solid hsla(228,25%,20%,0.8)",
                      }}
                    >
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono font-medium text-white/80 truncate">{op.name}</div>
                      <div className="text-[11px] font-mono text-white/30 mt-0.5">
                        {op.target.name} · {op.sessionDurationMinutes === 0 ? "Continuous" : `${op.sessionDurationMinutes} min`} · {op.frequencyHz} Hz
                      </div>
                    </div>
                    {op.target.photo && (
                      <img src={op.target.photo} alt="" className="w-8 h-8 rounded object-cover shrink-0"
                        style={{ border: "1px solid hsla(38,85%,52%,0.25)" }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: queue + settings */}
        <div className="space-y-4">

          {/* Ordered queue */}
          <div className="rounded overflow-hidden" style={rowStyle}>
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderBottom: "1px solid hsla(228,25%,12%,1)", background: "hsla(228,35%,6%,0.8)" }}>
              <Zap className="w-3 h-3" style={{ color: "hsla(270,75%,65%,0.7)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">Barrage Queue</span>
            </div>

            <div className="p-3 space-y-1.5 min-h-[80px]">
              <AnimatePresence mode="popLayout">
                {orderedIds.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-[11px] font-mono text-white/20">Select operations on the left to add them here</p>
                  </div>
                ) : (
                  orderedIds.map((id, idx) => {
                    const op = operations.find(o => o.id === id);
                    if (!op) return null;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 rounded px-3 py-2"
                        style={{
                          background: "hsla(270,35%,9%,1)",
                          border: "1px solid hsla(270,45%,25%,0.4)",
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                          style={{ background: "hsla(270,45%,20%,1)", color: "hsla(270,75%,70%,1)" }}
                        >
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-xs font-mono text-white/70 truncate">{op.name}</span>
                        <div className="flex gap-0.5 shrink-0">
                          <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0}
                            className="w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-20"
                            style={{ color: "hsla(270,75%,65%,0.8)" }}>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => moveDown(idx)} disabled={idx === orderedIds.length - 1}
                            className="w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-20"
                            style={{ color: "hsla(270,75%,65%,0.8)" }}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => toggleOp(id)}
                            className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                            style={{ color: "hsla(0,65%,55%,0.7)" }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interval selector */}
          <div className="rounded overflow-hidden" style={rowStyle}>
            <div className="px-4 py-2.5"
              style={{ borderBottom: "1px solid hsla(228,25%,12%,1)", background: "hsla(228,35%,6%,0.8)" }}>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">Interval Per Operation</span>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-5 gap-1.5">
                {INTERVAL_OPTIONS.map(min => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setIntervalMinutes(min)}
                    className="py-2 rounded text-xs font-mono font-medium transition-all"
                    style={{
                      background: intervalMinutes === min ? "hsla(270,75%,40%,1)" : "hsla(228,25%,10%,1)",
                      border: intervalMinutes === min ? "1px solid hsla(270,75%,55%,0.5)" : "1px solid hsla(228,25%,16%,0.8)",
                      color: intervalMinutes === min ? "white" : "hsla(228,10%,40%,1)",
                      boxShadow: intervalMinutes === min ? "0 0 10px hsla(270,75%,45%,0.25)" : "none",
                    }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-mono text-white/25 mt-2">
                Each operation will run for {intervalMinutes} minute{intervalMinutes !== 1 ? "s" : ""} before advancing to the next.
              </p>
            </div>
          </div>

          {/* Loop toggle */}
          <div className="rounded overflow-hidden" style={rowStyle}>
            <div className="px-4 py-2.5"
              style={{ borderBottom: "1px solid hsla(228,25%,12%,1)", background: "hsla(228,35%,6%,0.8)" }}>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">Loop Settings</span>
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => setLoop(l => !l)}
                className="w-full flex items-center justify-between rounded px-3 py-2.5 transition-all"
                style={{
                  background: loop ? "hsla(270,35%,12%,1)" : "hsla(228,25%,9%,1)",
                  border: loop ? "1px solid hsla(270,75%,45%,0.4)" : "1px solid hsla(228,25%,16%,0.8)",
                }}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" style={{ color: loop ? "hsla(270,75%,65%,1)" : "hsla(228,10%,40%,1)" }} />
                  <span className="text-sm font-mono" style={{ color: loop ? "hsla(270,75%,75%,1)" : "hsla(228,10%,40%,1)" }}>
                    {loop ? "Loop Enabled — runs continuously" : "No Loop — stop after one pass"}
                  </span>
                </div>
                <div
                  className="w-8 h-4 rounded-full transition-all relative"
                  style={{ background: loop ? "hsla(270,75%,45%,1)" : "hsla(228,25%,18%,1)" }}
                >
                  <div
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                    style={{ left: loop ? "calc(100% - 14px)" : "2px" }}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Start button */}
          <button
            type="button"
            onClick={startBarrage}
            disabled={orderedIds.length < 2}
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm font-mono font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,60%,30%,1))",
              border: "1px solid hsla(270,75%,55%,0.5)",
              color: "white",
              boxShadow: orderedIds.length >= 2 ? "0 0 20px hsla(270,75%,58%,0.3)" : "none",
            }}
          >
            <Play className="w-4 h-4" />
            Launch Barrage ({orderedIds.length} operations · {intervalMinutes}min each{loop ? " · loop" : ""})
          </button>
          {orderedIds.length < 2 && (
            <p className="text-center text-[11px] font-mono text-white/25">
              Select at least 2 operations to enable barrage mode.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
