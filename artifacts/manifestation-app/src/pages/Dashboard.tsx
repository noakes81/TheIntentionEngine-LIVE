import { useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ActiveOperationPanel } from "@/components/ActiveOperationPanel";
import { ChiFieldIndicator } from "@/components/ChiFieldIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESET_OPERATIONS } from "@/data/presets";
import { Operation, SymbolicCard } from "@/types";
import { Link } from "wouter";
import { Plus, X, Upload, ImageIcon, Zap, ChevronRight, Radio, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PresetItem = typeof PRESET_OPERATIONS[0];

export default function Dashboard() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cards] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const [pendingPreset, setPendingPreset] = useState<PresetItem | null>(null);
  const [targetName, setTargetName] = useState("Self");
  const [linkType, setLinkType] = useState<"name" | "photo">("name");
  const [targetPhoto, setTargetPhoto] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const activeOperation = operations.find(op => op.status === 'running' || op.status === 'paused');
  const recentOperations = operations.filter(op => op.status !== 'running' && op.status !== 'paused').slice(0, 6);

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

  const openPresetModal = (preset: PresetItem) => {
    setPendingPreset(preset);
    setTargetName("Self");
    setLinkType("name");
    setTargetPhoto(undefined);
  };

  const closeModal = () => {
    setPendingPreset(null);
    setTargetPhoto(undefined);
  };

  const launchPreset = () => {
    if (!pendingPreset) return;
    const newOp: Operation = {
      ...pendingPreset,
      id: `op-${Date.now()}`,
      status: 'running',
      elapsedSeconds: 0,
      createdAt: new Date().toISOString(),
      lastRunAt: new Date().toISOString(),
      target: {
        name: targetName || "Self",
        description: pendingPreset.target.description,
        photo: linkType === "photo" ? targetPhoto : undefined,
      },
      structuralLinkType: linkType,
    };
    setOperations(ops => [newOp, ...ops.map(op => op.status === 'running' ? { ...op, status: 'paused' as const } : op)]);
    closeModal();
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTargetPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-400">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/25">Orgone Manifestation X</span>
              <span className="text-[9px] font-mono text-white/15">—</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">Virtual Radionic Device</span>
            </div>
            <h1 className="text-2xl font-mono font-bold text-white/90 tracking-wide">Control Panel</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ChiFieldIndicator active={activeOperation?.status === 'running'} frequencyHz={activeOperation?.frequencyHz} size="md" />
          <Link href="/builder">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-all"
              style={{
                background: "linear-gradient(135deg, hsla(270,75%,38%,1), hsla(270,65%,28%,1))",
                border: "1px solid hsla(270,75%,52%,0.5)",
                color: "white",
                boxShadow: "0 0 14px hsla(270,75%,58%,0.25)"
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Position
            </button>
          </Link>
        </div>
      </div>

      {/* Active operation */}
      {activeOperation ? (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="led-green" style={{ animationDuration: "1.2s" }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35">Active Transmission</span>
          </div>
          <ActiveOperationPanel
            operation={activeOperation}
            cards={cards}
            onStatusChange={(status) => handleStatusChange(activeOperation.id, status)}
            onTick={(elapsed) => handleTick(activeOperation.id, elapsed)}
          />
        </section>
      ) : (
        /* Empty state — no active operation */
        <div
          className="relative rounded overflow-hidden flex flex-col items-center justify-center py-12 text-center"
          style={{
            background: "linear-gradient(160deg, hsla(228,35%,7%,0.95), hsla(228,40%,4%,1))",
            border: "1px solid hsla(228,25%,13%,0.9)",
            boxShadow: "0 4px 24px hsla(0,0%,0%,0.4)"
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(hsla(228,25%,14%,0.2) 1px, transparent 1px),
                linear-gradient(90deg, hsla(228,25%,14%,0.2) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px"
            }} />
          <div className="relative z-10">
            <ChiFieldIndicator active={false} size="lg" />
            <h2 className="text-lg font-mono font-bold text-white/40 mt-4 mb-1">No Active Transmission</h2>
            <p className="text-sm text-white/20 font-mono mb-6 max-w-sm mx-auto leading-relaxed">
              Select a preset position below or build a custom radionic operation.
            </p>
            <Link href="/builder">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-mono mx-auto transition-all"
                style={{
                  background: "linear-gradient(135deg, hsla(270,75%,38%,1), hsla(270,65%,28%,1))",
                  border: "1px solid hsla(270,75%,52%,0.5)",
                  color: "white",
                  boxShadow: "0 0 18px hsla(270,75%,58%,0.3)"
                }}
                data-testid="button-create-operation"
              >
                <Plus className="w-4 h-4" /> Build Custom Position
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick-start presets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px" style={{ background: "hsla(270,75%,58%,0.5)" }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/35">Quick-Start Positions</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsla(270,75%,58%,0.2), transparent)" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {PRESET_OPERATIONS.slice(0, 6).map((preset, idx) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => openPresetModal(preset)}
              className="text-left rounded p-3.5 transition-all group relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, hsla(228,35%,8%,0.98), hsla(228,35%,5%,1))",
                border: "1px solid hsla(228,25%,14%,0.8)"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsla(270,75%,50%,0.3)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px hsla(270,75%,58%,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsla(228,25%,14%,0.8)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              data-testid={`preset-${preset.id}`}
            >
              {/* Position number badge */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold shrink-0"
                    style={{
                      background: "hsla(270,45%,18%,1)",
                      border: "1px solid hsla(270,75%,45%,0.3)",
                      color: "hsla(270,75%,70%,1)"
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-xs font-mono font-medium text-white/75 group-hover:text-white/90 transition-colors leading-tight">
                    {preset.name}
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-1"
                  style={{
                    background: "hsla(270,35%,14%,1)",
                    border: "1px solid hsla(270,45%,25%,0.4)",
                    color: "hsla(270,75%,65%,0.9)"
                  }}
                >
                  {preset.frequencyHz} Hz
                </span>
              </div>

              <p className="text-[10px] text-white/30 italic line-clamp-2 mb-2.5 font-mono leading-relaxed">
                "{preset.intention.slice(0, 72)}…"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-white/20">{preset.sessionDurationMinutes} min</span>
                  <span className="text-white/10">·</span>
                  <span className="text-[9px] font-mono" style={{ color: "hsla(120,60%,45%,0.7)" }}>
                    {preset.trendRate.slice(0, 5)}···
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-primary/60 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Stored operations */}
      {recentOperations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-px" style={{ background: "hsla(38,85%,52%,0.5)" }} />
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/35">Stored Operations</span>
            </div>
            <Link href="/operations">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors cursor-pointer">
                View All →
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {recentOperations.map(op => (
              <button
                key={op.id}
                className="flex items-center justify-between rounded px-4 py-3 text-left transition-all group"
                style={{
                  background: "hsla(228,35%,7%,0.95)",
                  border: "1px solid hsla(228,25%,13%,0.8)"
                }}
                onClick={() => handleStatusChange(op.id, 'running')}
                data-testid={`stored-op-${op.id}`}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsla(38,85%,45%,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsla(228,25%,13%,0.8)";
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium text-white/65 truncate group-hover:text-white/85 transition-colors">
                    {op.name}
                  </p>
                  <p className="text-[10px] font-mono text-white/30">{op.frequencyHz} Hz — {op.target.name}</p>
                </div>
                <span
                  className="shrink-0 ml-3 text-[9px] font-mono px-2 py-1 rounded transition-all"
                  style={{
                    background: "hsla(38,35%,10%,1)",
                    border: "1px solid hsla(38,60%,35%,0.3)",
                    color: "hsla(38,85%,62%,0.8)"
                  }}
                >
                  Transmit
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <footer className="pt-4 pb-2 border-t" style={{ borderColor: "hsla(228,25%,12%,0.6)" }}>
        <p className="text-[9px] font-mono text-white/15 max-w-3xl leading-relaxed">
          This software is designed for meditation, visualization, intention-setting, and entertainment/wellness purposes only. It does not diagnose, treat, cure, or prevent any medical condition. Results vary by individual. Not a substitute for professional medical, financial, or legal advice.
        </p>
      </footer>

      {/* Target Setup Modal */}
      <AnimatePresence>
        {pendingPreset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "hsla(228,35%,3%,0.85)", backdropFilter: "blur(4px)" }}
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div
                className="rounded overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, hsla(228,35%,8%,0.99), hsla(228,40%,5%,1))",
                  border: "1px solid hsla(270,75%,50%,0.35)",
                  boxShadow: "0 0 60px hsla(270,75%,58%,0.15), 0 24px 48px hsla(0,0%,0%,0.6)"
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-4"
                  style={{ borderBottom: "1px solid hsla(228,25%,12%,1)" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3" style={{ color: "hsla(270,75%,65%,0.8)" }} />
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35">Quick Launch</span>
                    </div>
                    <h2 className="text-base font-mono font-bold text-white/85 leading-tight">{pendingPreset.name}</h2>
                    <p className="text-[9px] font-mono text-white/30 mt-0.5">{pendingPreset.frequencyHz} Hz — {pendingPreset.sessionDurationMinutes} min</p>
                  </div>
                  <button onClick={closeModal} className="text-white/25 hover:text-white/60 transition-colors mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Fields */}
                <div className="p-4 space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-mono uppercase tracking-widest text-white/35">Target</Label>
                    <Input
                      value={targetName}
                      onChange={e => setTargetName(e.target.value)}
                      placeholder="Self"
                      className="text-sm font-mono h-9"
                      style={{
                        background: "hsla(228,35%,6%,1)",
                        border: "1px solid hsla(38,85%,45%,0.25)",
                        color: "hsla(38,85%,70%,0.9)"
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-mono uppercase tracking-widest text-white/35">Structural Link Type</Label>
                    <Select value={linkType} onValueChange={v => setLinkType(v as "name" | "photo")}>
                      <SelectTrigger className="text-sm h-9 font-mono"
                        style={{ background: "hsla(228,35%,6%,1)", border: "1px solid hsla(38,85%,45%,0.25)" }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Written Name</SelectItem>
                        <SelectItem value="photo">Witness Photo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {linkType === "photo" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <Label className="text-[9px] font-mono uppercase tracking-widest text-white/35">Witness Photo</Label>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
                      {targetPhoto ? (
                        <div className="relative group rounded overflow-hidden"
                          style={{ border: "1px solid hsla(38,85%,45%,0.3)" }}>
                          <img src={targetPhoto} alt="Target" className="w-full h-28 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button type="button" onClick={() => photoInputRef.current?.click()}
                              className="bg-black/70 text-xs text-white px-2 py-1 rounded flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Replace
                            </button>
                            <button type="button" onClick={() => setTargetPhoto(undefined)}
                              className="bg-black/70 text-xs text-red-400 px-2 py-1 rounded flex items-center gap-1">
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => photoInputRef.current?.click()}
                          className="h-24 rounded border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
                          style={{
                            borderColor: "hsla(38,85%,45%,0.25)",
                            background: "hsla(38,20%,5%,0.5)"
                          }}
                        >
                          <ImageIcon className="w-5 h-5 text-white/20" />
                          <p className="text-xs text-white/25 font-mono">Click to upload witness photo</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 rounded text-sm font-mono transition-all text-white/35 hover:text-white/60"
                    style={{ background: "hsla(228,25%,9%,1)", border: "1px solid hsla(228,25%,15%,1)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={launchPreset}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-mono transition-all"
                    style={{
                      background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,30%,1))",
                      border: "1px solid hsla(270,75%,55%,0.5)",
                      color: "white",
                      boxShadow: "0 0 16px hsla(270,75%,58%,0.3)"
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" /> Transmit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
