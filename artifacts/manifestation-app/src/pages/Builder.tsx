import { useState, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation, SubPosition, SymbolicCard, RadionicRate } from "@/types";
import { PRESET_OPERATIONS, FREQUENCY_PRESETS } from "@/data/presets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrequencySlider } from "@/components/FrequencySlider";
import { WitnessPhotoUpload } from "@/components/WitnessPhotoUpload";
import { StickPad } from "@/components/StickPad";
import { useLocation } from "wouter";
import { Plus, Save, Zap, X, ImagePlus, Check, Sparkles, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_POSITIONS = 10;
const MAX_CARDS = 10;
const POSITION_TYPES: SubPosition["positionType"][] = [
  "Target", "Trend 1", "Trend 2", "Trend 3", "Trend 4", "Trend 5",
  "Trend 6", "Trend 7", "Trend 8", "Trend 9",
];

function makeDefaultSubPosition(idx: number): SubPosition {
  const trendNum = idx; // position 0 → Target, 1 → Trend 1, etc.
  const defaults: Partial<SubPosition>[] = [
    { name: "Target",  positionType: "Target",  targetLinkType: "name", targetName: "Self" },
    { name: "Trend 1", positionType: "Trend 1", targetLinkType: "name" },
    { name: "Trend 2", positionType: "Trend 2", targetLinkType: "name" },
  ];
  const trendTypes: SubPosition["positionType"][] = [
    "Target","Trend 1","Trend 2","Trend 3","Trend 4","Trend 5","Trend 6","Trend 7","Trend 8","Trend 9"
  ];
  const type = trendTypes[idx] ?? "Trend 1";
  const d = defaults[idx] ?? { name: type, positionType: type, targetLinkType: "name" };
  void trendNum;
  return {
    id: `sp-${Date.now()}-${idx}`,
    intention: "",
    rate: "0000000000",
    rateLocked: false,
    customCardImages: [],
    cardIds: [],
    ...d,
  } as SubPosition;
}

export default function Builder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cardsLib] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const [sessionName, setSessionName] = useState("");
  const [frequencyHz, setFrequencyHz] = useState(7.83);
  const [duration, setDuration] = useState("30");
  const [subPositions, setSubPositions] = useState<SubPosition[]>([
    makeDefaultSubPosition(0),
    makeDefaultSubPosition(1),
  ]);
  const [activeIdx, setActiveIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingSlot = useRef<number>(-1); // which image slot is being filled

  const active = subPositions[activeIdx];

  const updateActive = useCallback((patch: Partial<SubPosition>) => {
    setSubPositions(prev => prev.map((p, i) => i === activeIdx ? { ...p, ...patch } : p));
  }, [activeIdx]);

  const addPosition = () => {
    if (subPositions.length >= MAX_POSITIONS) return;
    setSubPositions(prev => [...prev, makeDefaultSubPosition(prev.length)]);
    setActiveIdx(subPositions.length);
  };

  const removePosition = (idx: number) => {
    if (subPositions.length <= 1) return;
    setSubPositions(prev => prev.filter((_, i) => i !== idx));
    setActiveIdx(prev => Math.min(prev, subPositions.length - 2));
  };

  // Custom card image upload
  const triggerImageUpload = (slot: number) => {
    uploadingSlot.current = slot;
    fileInputRef.current?.click();
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      const slot = uploadingSlot.current;
      setSubPositions(prev => prev.map((p, i) => {
        if (i !== activeIdx) return p;
        const imgs = [...p.customCardImages];
        if (slot === -1 || slot >= imgs.length) {
          // append
          imgs.push(data);
        } else {
          imgs[slot] = data;
        }
        return { ...p, customCardImages: imgs };
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeCustomImage = (slot: number) => {
    setSubPositions(prev => prev.map((p, i) =>
      i === activeIdx ? { ...p, customCardImages: p.customCardImages.filter((_, s) => s !== slot) } : p
    ));
  };

  const toggleLibraryCard = (cardId: string) => {
    const current = active.cardIds;
    const next = current.includes(cardId)
      ? current.filter(id => id !== cardId)
      : [...current, cardId];
    if (next.length + active.customCardImages.length > MAX_CARDS) return;
    updateActive({ cardIds: next });
  };

  const totalCards = active.customCardImages.length + active.cardIds.length;

  const loadPreset = (presetId: string) => {
    const preset = PRESET_OPERATIONS.find(p => p.id === presetId);
    if (!preset) return;
    setSessionName(preset.name);
    setFrequencyHz(preset.frequencyHz);
    setDuration(String(preset.sessionDurationMinutes));
    setSubPositions([
      {
        id: `sp-${Date.now()}-0`,
        name: "Trend 1",
        positionType: "Trend 1",
        intention: preset.intention,
        rate: preset.trendRate,
        rateLocked: false,
        customCardImages: [],
        cardIds: preset.cards,
      },
      {
        id: `sp-${Date.now()}-1`,
        name: "Target",
        positionType: "Target",
        intention: preset.target.description,
        rate: preset.targetRate,
        rateLocked: false,
        customCardImages: [],
        cardIds: [],
        targetName: preset.target.name,
        targetDescription: preset.target.description,
        targetLinkType: (preset.structuralLinkType ?? "name") as SubPosition["targetLinkType"],
        targetPhoto: preset.target.photo,
      },
    ]);
    setActiveIdx(0);
  };

  const handleSave = () => {
    if (!sessionName) {
      toast({ title: "Name required", description: "Please enter a position name.", variant: "destructive" });
      return;
    }
    const mainTrend = subPositions.find(p => p.positionType.startsWith("Trend")) ?? subPositions[0];
    const mainTarget = subPositions.find(p => p.positionType === "Target");

    const allCardIds = Array.from(new Set(subPositions.flatMap(p => p.cardIds)));

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      name: sessionName,
      intention: mainTrend.intention,
      trendRate: mainTrend.rate,
      trendRateLocked: mainTrend.rateLocked,
      trendCardIds: mainTrend.cardIds,
      customTrendCardImage: mainTrend.customCardImages[0],
      target: {
        name: mainTarget?.targetName ?? "Self",
        description: mainTarget?.targetDescription ?? "",
        photo: mainTarget?.targetPhoto,
        transferDiagram: mainTarget?.targetTransferDiagram,
      },
      targetRate: mainTarget?.rate ?? "0000000000",
      targetRateLocked: mainTarget?.rateLocked,
      structuralLinkType: mainTarget?.targetLinkType ?? "name",
      frequencyHz,
      cards: allCardIds,
      subPositions,
      status: "idle",
      sessionDurationMinutes: parseInt(duration) || 30,
      elapsedSeconds: 0,
      createdAt: new Date().toISOString(),
    };

    setOperations([...operations, newOp]);
    toast({ title: "Position Saved", description: `${subPositions.length} position${subPositions.length > 1 ? "s" : ""} saved to library.` });
    navigate("/operations");
  };

  const rateToDisplay = (r: RadionicRate) => r || "0000000000";
  const isTarget = active.positionType === "Target";
  const isTrend = active.positionType.startsWith("Trend");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Position Builder</h1>
          <p className="text-muted-foreground mt-2">Build up to 10 positions — each with its own trend, rate, and cards.</p>
        </div>
        <div className="flex gap-3">
          <Select onValueChange={loadPreset}>
            <SelectTrigger className="w-52 bg-background/50 border-primary/20 text-sm">
              <SelectValue placeholder="Load preset..." />
            </SelectTrigger>
            <SelectContent>
              {PRESET_OPERATIONS.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-2" data-testid="button-save-operation">
            <Save className="w-4 h-4" /> Save Position
          </Button>
        </div>
      </header>

      {/* Session name */}
      <div className="space-y-2">
        <Label htmlFor="session-name">Position Name</Label>
        <Input
          id="session-name"
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
          placeholder="e.g. Big Money — 9 Positions — 333 Hz"
          className="bg-background/50 border-primary/20 text-lg"
          data-testid="input-operation-name"
        />
      </div>

      {/* Position selector — SM-X style numbered pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mr-1">Positions</span>
        {subPositions.map((pos, idx) => (
          <div key={pos.id} className="relative group">
            <button
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`w-10 h-10 rounded-lg border font-mono text-sm font-bold transition-all ${
                idx === activeIdx
                  ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_12px_rgba(157,78,221,0.25)]"
                  : "bg-background/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {idx + 1}
            </button>
            {subPositions.length > 1 && (
              <button
                type="button"
                onClick={() => removePosition(idx)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-background border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 items-center justify-center hidden group-hover:flex transition-all"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}
        {subPositions.length < MAX_POSITIONS && (
          <button
            type="button"
            onClick={addPosition}
            className="w-10 h-10 rounded-lg border border-dashed border-border/40 text-muted-foreground/50 hover:border-primary/40 hover:text-primary/70 flex items-center justify-center transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        <span className="ml-auto text-xs font-mono text-muted-foreground/40">
          {subPositions.length} / {MAX_POSITIONS}
        </span>
      </div>

      {/* Position editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — trend/intention + cards */}
        <Card className={`glass-card p-6 space-y-5 ${isTrend ? "border-primary/20" : isTarget ? "border-amber-500/20" : "border-border/30"}`}>
          <div className="flex items-center gap-3 border-b border-border/30 pb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isTrend ? "bg-primary/15" : isTarget ? "bg-amber-500/10" : "bg-muted/20"}`}>
              {isTrend ? <Sparkles className="w-4 h-4 text-primary" /> : <Target className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div>
                <Input
                  value={active.name}
                  onChange={e => updateActive({ name: e.target.value })}
                  className={`bg-transparent border-0 p-0 h-auto text-sm font-mono uppercase tracking-widest focus-visible:ring-0 ${isTrend ? "text-primary" : isTarget ? "text-amber-400" : "text-muted-foreground"}`}
                  placeholder="Position name..."
                />
              </div>
              <Select value={active.positionType} onValueChange={v => updateActive({ positionType: v as SubPosition["positionType"] })}>
                <SelectTrigger className="h-7 text-xs bg-background/40 border-border/30 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Intention / text */}
          <div className="space-y-2">
            <Label className="text-xs">{isTarget ? "Target Description" : "Trend Statement (present tense, feeling-based)"}</Label>
            <Textarea
              value={active.intention}
              onChange={e => updateActive({ intention: e.target.value })}
              placeholder={isTarget
                ? "Brief description of target or situation..."
                : "I feel deeply grateful knowing that abundance flows freely to me now..."}
              className={`min-h-[100px] bg-background/50 resize-none leading-relaxed text-sm italic ${isTrend ? "border-primary/20" : isTarget ? "border-amber-500/20" : "border-border/30"}`}
              data-testid="textarea-intention"
            />
            {isTrend && <p className="text-[10px] text-muted-foreground/50">Write from the feeling of already having the result. (Magic of the Future — Welz)</p>}
          </div>

          {/* Trend Cards / Sigils */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono uppercase tracking-widest ${isTrend ? "text-primary/70" : isTarget ? "text-amber-400/70" : "text-muted-foreground/60"}`}>
                Trend Cards / Sigils
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                totalCards >= MAX_CARDS ? "bg-destructive/20 text-destructive" : isTrend ? "bg-primary/15 text-primary" : "bg-muted/20 text-muted-foreground"
              }`}>
                {totalCards} / {MAX_CARDS}
              </span>
            </div>

            {/* Custom image grid — up to 10 slots */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

            <div className="grid grid-cols-5 gap-2">
              {/* Filled slots */}
              {active.customCardImages.map((img, slot) => (
                <div key={slot} className="relative group aspect-square rounded-lg overflow-hidden border border-primary/30 bg-background/50">
                  <img src={img} alt={`Card ${slot + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => triggerImageUpload(slot)}
                      className="w-5 h-5 rounded bg-background/80 flex items-center justify-center text-primary/80 hover:text-primary"
                    >
                      <ImagePlus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomImage(slot)}
                      className="w-5 h-5 rounded bg-background/80 flex items-center justify-center text-destructive/70 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add slot (if under 10 total) */}
              {totalCards < MAX_CARDS && (
                <button
                  type="button"
                  onClick={() => triggerImageUpload(-1)}
                  className="aspect-square rounded-lg border-2 border-dashed border-border/30 hover:border-primary/40 bg-background/30 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-all group"
                >
                  <ImagePlus className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  <span className="text-[8px] text-muted-foreground/40 font-mono">SIGIL</span>
                </button>
              )}
            </div>

            {/* Library card picker */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
              {cardsLib.map(card => {
                const sel = active.cardIds.includes(card.id);
                const atMax = !sel && totalCards >= MAX_CARDS;
                return (
                  <div
                    key={card.id}
                    onClick={() => !atMax && toggleLibraryCard(card.id)}
                    className={`rounded-lg p-1.5 text-center border transition-all ${
                      atMax ? "opacity-30 cursor-not-allowed border-border/20 bg-background/20"
                      : sel ? "border-primary bg-primary/15 shadow-[0_0_6px_rgba(139,92,246,0.2)] cursor-pointer"
                      : "border-border/30 bg-background/40 hover:border-primary/30 cursor-pointer"
                    }`}
                  >
                    <div className="text-base">{card.symbol}</div>
                    <div className="text-[7px] font-medium leading-tight line-clamp-1 mt-0.5 text-muted-foreground">{card.title}</div>
                    {sel && <Check className="w-2.5 h-2.5 text-primary mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* RIGHT — target fields (if Main Target) + rate + stick pad */}
        <Card className={`glass-card p-6 space-y-5 ${isTarget ? "border-amber-500/20" : "border-border/30"}`}>

          {/* Main Target specific fields */}
          {isTarget && (
            <div className="space-y-4 border-b border-amber-500/15 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Name</Label>
                  <Input
                    value={active.targetName ?? ""}
                    onChange={e => updateActive({ targetName: e.target.value })}
                    placeholder="Self"
                    className="bg-background/50 border-amber-500/20 text-sm"
                    data-testid="input-target-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Structural Link Type</Label>
                  <Select value={active.targetLinkType ?? "name"} onValueChange={v => updateActive({ targetLinkType: v as SubPosition["targetLinkType"] })}>
                    <SelectTrigger className="bg-background/50 border-amber-500/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Written Name</SelectItem>
                      <SelectItem value="photo">Witness Photo</SelectItem>
                      <SelectItem value="written">Written Rate</SelectItem>
                      <SelectItem value="transfer">Transfer Diagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {active.targetLinkType === "photo" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Witness Photo</Label>
                  <WitnessPhotoUpload value={active.targetPhoto} onChange={v => updateActive({ targetPhoto: v })} />
                </div>
              )}
              {active.targetLinkType === "transfer" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Transfer Diagram</Label>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                    <p className="text-[10px] text-amber-400/60">Upload the Transfer Diagram provided upon purchase. Place the printout on your chi generator.</p>
                    <WitnessPhotoUpload value={active.targetTransferDiagram} onChange={v => updateActive({ targetTransferDiagram: v })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stick pad — hold to generate random rate, release to lock */}
          <StickPad
            locked={active.rateLocked}
            onLock={rate => updateActive({ rate, rateLocked: true })}
            onClear={() => updateActive({ rateLocked: false })}
            rateDisplay={rateToDisplay(active.rate)}
            color={isTarget ? "amber" : "primary"}
          />

          {/* Position summary (non-active positions preview) */}
          {subPositions.length > 1 && (
            <div className="border-t border-border/20 pt-4 space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">All Positions</p>
              {subPositions.map((pos, idx) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                    idx === activeIdx ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/20 border border-transparent"
                  }`}
                >
                  <span className="font-mono text-muted-foreground/60 w-4">{idx + 1}</span>
                  <span className="font-medium truncate flex-1">{pos.name}</span>
                  <span className="text-muted-foreground/40 font-mono">{pos.rate}</span>
                  {pos.rateLocked && <span className="text-primary/60 font-mono text-[9px]">LOCKED</span>}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Chi frequency + session duration */}
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-border/30 pb-4">
          <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Chi Generator Frequency</h2>
            <p className="text-xs text-muted-foreground/60">Pulse frequency for the orgone/chi field — applies to all positions (0.6–1000 Hz)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background/30 p-4 rounded-xl border border-border/30">
            <FrequencySlider value={frequencyHz} onChange={setFrequencyHz} />
          </div>
          <div className="space-y-3">
            <Label>Quick-Select Frequency</Label>
            <Select onValueChange={v => setFrequencyHz(parseFloat(v))}>
              <SelectTrigger className="bg-background/50 border-border/30">
                <SelectValue placeholder="Choose a preset frequency..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {FREQUENCY_PRESETS.map(fp => (
                  <SelectItem key={fp.hz} value={String(fp.hz)}>
                    <span className="font-mono">{fp.hz} Hz</span> — {fp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration (Minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="bg-background/50 border-border/30"
                data-testid="input-duration"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
