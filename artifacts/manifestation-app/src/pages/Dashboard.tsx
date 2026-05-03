import { useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ActiveOperationPanel } from "@/components/ActiveOperationPanel";
import { ChiFieldIndicator } from "@/components/ChiFieldIndicator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESET_OPERATIONS } from "@/data/presets";
import { Operation, SymbolicCard } from "@/types";
import { Link } from "wouter";
import { Plus, Sparkles, Target, X, Upload, ImageIcon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PresetItem = typeof PRESET_OPERATIONS[0];

export default function Dashboard() {
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cards] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  // Target setup modal
  const [pendingPreset, setPendingPreset] = useState<PresetItem | null>(null);
  const [targetName, setTargetName] = useState("Self");
  const [linkType, setLinkType] = useState<"name" | "photo">("name");
  const [targetPhoto, setTargetPhoto] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement>(null);

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
              onClick={() => openPresetModal(preset)}
              data-testid={`preset-${preset.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{preset.name}</h4>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0 ml-2">{preset.frequencyHz} Hz</span>
              </div>
              <p className="text-xs text-muted-foreground/70 italic line-clamp-2 mb-3">"{preset.intention.slice(0, 80)}..."</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-primary/50" />
                    <span className="text-[10px] font-mono text-primary/60 tracking-wider">{preset.trendRate}</span>
                  </div>
                  <span className="text-muted-foreground/30 text-xs mx-1">|</span>
                  <div className="flex items-center gap-1">
                    <Target className="w-2.5 h-2.5 text-amber-400/50" />
                    <span className="text-[10px] font-mono text-amber-400/60 tracking-wider">{preset.targetRate}</span>
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

      {/* Target Setup Modal */}
      <AnimatePresence>
        {pendingPreset && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div className="bg-[#0d0b1a] border border-primary/20 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.2)] overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-border/20">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">Quick Start</p>
                    <h2 className="text-lg font-serif text-foreground leading-tight">{pendingPreset.name}</h2>
                    <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{pendingPreset.frequencyHz} Hz — {pendingPreset.sessionDurationMinutes} min</p>
                  </div>
                  <button type="button" onClick={closeModal} className="text-muted-foreground/40 hover:text-foreground transition-colors mt-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Target fields */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400/70">
                    <Target className="w-3 h-3" /> Target Setup
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Who or what is this for?</Label>
                    <Input
                      value={targetName}
                      onChange={e => setTargetName(e.target.value)}
                      placeholder="Self"
                      className="bg-background/50 border-amber-500/20 focus-visible:ring-amber-500/30 text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Structural Link Type</Label>
                    <Select value={linkType} onValueChange={v => setLinkType(v as "name" | "photo")}>
                      <SelectTrigger className="bg-background/50 border-amber-500/20 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Written Name</SelectItem>
                        <SelectItem value="photo">Witness Photo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Photo upload — shown when photo type selected */}
                  {linkType === "photo" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <Label className="text-xs">Witness Photo</Label>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />

                      {targetPhoto ? (
                        <div className="relative group rounded-xl overflow-hidden border border-amber-500/30">
                          <img src={targetPhoto} alt="Target" className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="bg-background/80 text-xs text-white px-2 py-1 rounded flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Replace
                            </button>
                            <button type="button" onClick={() => setTargetPhoto(undefined)} className="bg-background/80 text-xs text-red-400 px-2 py-1 rounded flex items-center gap-1">
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                            <p className="text-[9px] font-mono text-white/60 uppercase tracking-widest">Witness Attached</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => photoInputRef.current?.click()}
                          className="h-28 rounded-xl border-2 border-dashed border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5 text-amber-400/40" />
                          <p className="text-xs text-muted-foreground/50">Click to upload witness photo</p>
                          <p className="text-[10px] text-muted-foreground/30">JPG, PNG, WEBP</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-3">
                  <Button variant="ghost" onClick={closeModal} className="flex-1 text-muted-foreground">
                    Cancel
                  </Button>
                  <Button
                    onClick={launchPreset}
                    className="flex-1 bg-primary hover:bg-primary/90 gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  >
                    <Zap className="w-4 h-4" /> Transmit
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
