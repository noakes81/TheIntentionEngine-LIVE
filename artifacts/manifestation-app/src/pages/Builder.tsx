import { useState, useRef, useCallback, useEffect } from "react";
import { compressImage } from "@/lib/imageUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation, SubPosition, SymbolicCard, RadionicRate } from "@/types";
import { PRESET_OPERATIONS, FREQUENCY_PRESETS } from "@/data/presets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrequencySlider } from "@/components/FrequencySlider";
import { WitnessPhotoUpload } from "@/components/WitnessPhotoUpload";
import { StickPad } from "@/components/StickPad";
import { useLocation, useSearch } from "wouter";
import { Plus, Save, Zap, X, ImagePlus, Check, Sparkles, Target, Pencil, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const MAX_POSITIONS = 10;
const MAX_CARDS = 10;
const POSITION_TYPES: SubPosition["positionType"][] = [
  "Target", "Trend 1", "Trend 2", "Trend 3", "Trend 4", "Trend 5",
  "Trend 6", "Trend 7", "Trend 8", "Trend 9",
];

function makeDefaultSubPosition(idx: number): SubPosition {
  const trendTypes: SubPosition["positionType"][] = [
    "Target","Trend 1","Trend 2","Trend 3","Trend 4","Trend 5","Trend 6","Trend 7","Trend 8","Trend 9"
  ];
  const type = trendTypes[idx] ?? "Trend 1";
  const defaults: Record<number, Partial<SubPosition>> = {
    0: { name: "Target", positionType: "Target", targetLinkType: "name", targetName: "Self" },
    1: { name: "Trend 1", positionType: "Trend 1", targetLinkType: "name" },
    2: { name: "Trend 2", positionType: "Trend 2", targetLinkType: "name" },
  };
  const d = defaults[idx] ?? { name: type, positionType: type, targetLinkType: "name" };
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

function PositionModuleCard({
  pos,
  idx,
  isActive,
  cardsLib,
  onSelect,
  onRemove,
  onUpdate,
  onTriggerImageUpload,
  onRemoveImage,
  totalCount,
  fileInputRef,
}: {
  pos: SubPosition;
  idx: number;
  isActive: boolean;
  cardsLib: SymbolicCard[];
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<SubPosition>) => void;
  onTriggerImageUpload: (slot: number) => void;
  onRemoveImage: (slot: number) => void;
  totalCount: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const isTarget = pos.positionType === "Target";
  const isTrend = pos.positionType.startsWith("Trend");
  const totalCards = pos.customCardImages.length + pos.cardIds.length;
  const [showCards, setShowCards] = useState(false);

  const toggleLibraryCard = (cardId: string) => {
    const current = pos.cardIds;
    const next = current.includes(cardId)
      ? current.filter(id => id !== cardId)
      : [...current, cardId];
    if (next.length + pos.customCardImages.length > MAX_CARDS) return;
    onUpdate({ cardIds: next });
  };

  const accentColor = isTarget ? "hsla(38,85%,52%,1)" : "hsla(270,75%,58%,1)";
  const accentFaint = isTarget ? "hsla(38,85%,52%,0.12)" : "hsla(270,75%,58%,0.12)";
  const accentBorder = isTarget ? "hsla(38,85%,52%,0.35)" : "hsla(270,75%,52%,0.35)";
  const headerBg = isTarget
    ? "linear-gradient(90deg, hsla(38,45%,9%,1), hsla(228,35%,6%,1))"
    : "linear-gradient(90deg, hsla(270,45%,11%,1), hsla(228,35%,6%,1))";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="relative flex flex-col rounded overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(175deg, hsla(228,35%,8%,0.99), hsla(228,40%,5%,1))",
        border: isActive
          ? `1px solid ${accentBorder}`
          : "1px solid hsla(228,25%,14%,0.9)",
        boxShadow: isActive
          ? `0 0 20px ${accentFaint}, 0 4px 20px hsla(0,0%,0%,0.5)`
          : "0 4px 16px hsla(0,0%,0%,0.4)"
      }}
      onClick={onSelect}
    >
      {/* Module header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{
          background: headerBg,
          borderBottom: `1px solid ${isActive ? accentBorder : "hsla(228,25%,13%,1)"}`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Position number badge */}
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
            style={{
              background: isActive ? accentColor : "hsla(228,25%,14%,1)",
              color: isActive ? "white" : "hsla(228,10%,40%,1)",
              boxShadow: isActive ? `0 0 8px ${accentFaint}` : "none"
            }}
          >
            {idx + 1}
          </div>
          <Input
            value={pos.name}
            onChange={e => { e.stopPropagation(); onUpdate({ name: e.target.value }); }}
            onClick={e => e.stopPropagation()}
            className="bg-transparent border-0 p-0 h-auto text-[12px] font-mono uppercase tracking-[0.15em] focus-visible:ring-0 w-24"
            style={{ color: isActive ? accentColor : "hsla(228,10%,45%,1)" }}
            placeholder="Name..."
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Select
            value={pos.positionType}
            onValueChange={v => onUpdate({ positionType: v as SubPosition["positionType"] })}
          >
            <SelectTrigger
              className="h-5 text-[11px] font-mono border-0 px-1 w-20 focus:ring-0"
              style={{
                background: "hsla(228,25%,10%,0.8)",
                color: "hsla(228,10%,40%,1)"
              }}
              onClick={e => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITION_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {totalCount > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="w-4 h-4 flex items-center justify-center rounded transition-colors"
              style={{ color: "hsla(0,65%,55%,0.5)" }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 space-y-3 flex flex-col">

        {/* Target-specific fields */}
        {isTarget && (
          <div className="space-y-2" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "hsla(38,85%,52%,0.6)" }}>Target</div>
                <Input
                  value={pos.targetName ?? ""}
                  onChange={e => onUpdate({ targetName: e.target.value })}
                  placeholder="Self"
                  className="text-xs h-7 font-mono"
                  style={{
                    background: "hsla(38,15%,6%,1)",
                    border: "1px solid hsla(38,85%,45%,0.2)",
                    color: "hsla(38,85%,70%,0.9)"
                  }}
                  data-testid="input-target-name"
                />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "hsla(38,85%,52%,0.6)" }}>Link</div>
                <Select value={pos.targetLinkType ?? "name"} onValueChange={v => onUpdate({ targetLinkType: v as SubPosition["targetLinkType"] })}>
                  <SelectTrigger className="text-xs h-7 font-mono"
                    style={{ background: "hsla(38,15%,6%,1)", border: "1px solid hsla(38,85%,45%,0.2)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="written">Written</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {pos.targetLinkType === "photo" && (
              <WitnessPhotoUpload value={pos.targetPhoto} onChange={v => onUpdate({ targetPhoto: v })} />
            )}
            {pos.targetLinkType === "transfer" && (
              <WitnessPhotoUpload value={pos.targetTransferDiagram} onChange={v => onUpdate({ targetTransferDiagram: v })} />
            )}
          </div>
        )}

        {/* Intention */}
        <div onClick={e => e.stopPropagation()}>
          <div className="text-[11px] font-mono uppercase tracking-widest mb-1"
            style={{ color: isTarget ? "hsla(38,85%,52%,0.6)" : "hsla(270,75%,65%,0.6)" }}>
            {isTarget ? "Description" : "Intention / Trend Statement"}
          </div>
          <Textarea
            value={pos.intention}
            onChange={e => onUpdate({ intention: e.target.value })}
            placeholder={isTarget
              ? "Describe target..."
              : "I feel abundant and grateful, knowing prosperity flows to me now..."}
            className="text-xs resize-none leading-relaxed font-mono min-h-[64px]"
            style={{
              background: "hsla(228,35%,5%,0.8)",
              border: `1px solid ${isActive ? (isTarget ? "hsla(38,85%,45%,0.2)" : "hsla(270,45%,35%,0.2)") : "hsla(228,25%,14%,0.8)"}`,
              color: "hsla(210,15%,72%,1)"
            }}
            data-testid={idx === 0 ? undefined : "textarea-intention"}
          />
        </div>

        {/* Sigil image slots */}
        <div onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[11px] font-mono uppercase tracking-widest"
              style={{ color: isTarget ? "hsla(38,85%,52%,0.5)" : "hsla(270,75%,65%,0.5)" }}>
              Sigils / Filters
            </div>
            <span className="text-[11px] font-mono"
              style={{ color: totalCards >= MAX_CARDS ? "hsla(0,70%,55%,0.8)" : "hsla(228,10%,35%,1)" }}>
              {totalCards}/{MAX_CARDS}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {pos.customCardImages.map((img, slot) => (
              <div key={slot} className="relative group aspect-square rounded overflow-hidden"
                style={{ border: "1px solid hsla(270,45%,35%,0.3)" }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5"
                  style={{ background: "hsla(0,0%,0%,0.7)" }}>
                  <button type="button" onClick={() => onTriggerImageUpload(slot)}
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ background: "hsla(228,25%,20%,1)", color: "hsla(270,75%,65%,1)" }}>
                    <ImagePlus className="w-2.5 h-2.5" />
                  </button>
                  <button type="button" onClick={() => onRemoveImage(slot)}
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ background: "hsla(228,25%,20%,1)", color: "hsla(0,65%,55%,1)" }}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
            {totalCards < MAX_CARDS && (
              <button type="button" onClick={() => onTriggerImageUpload(-1)}
                className="aspect-square rounded flex flex-col items-center justify-center gap-0.5 transition-all"
                style={{
                  border: "1px dashed hsla(228,25%,18%,0.8)",
                  background: "hsla(228,35%,6%,0.5)"
                }}
              >
                <ImagePlus className="w-3 h-3" style={{ color: "hsla(228,10%,30%,1)" }} />
              </button>
            )}
          </div>

          {/* Library card toggle */}
          <button
            type="button"
            onClick={() => setShowCards(s => !s)}
            className="mt-1.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono uppercase tracking-widest transition-all"
            style={{
              background: "hsla(228,25%,8%,0.8)",
              border: "1px solid hsla(228,25%,14%,0.8)",
              color: "hsla(228,10%,42%,1)"
            }}
          >
            <span>Filter Library ({pos.cardIds.length} selected)</span>
            {showCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showCards && cardsLib.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-4 gap-1.5 mt-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {cardsLib.map(card => {
                    const sel = pos.cardIds.includes(card.id);
                    const atMax = !sel && totalCards >= MAX_CARDS;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => !atMax && toggleLibraryCard(card.id)}
                        className="rounded p-1.5 text-center transition-all"
                        style={{
                          background: sel ? "hsla(270,45%,18%,1)" : "hsla(228,25%,8%,0.8)",
                          border: sel ? "1px solid hsla(270,75%,50%,0.4)" : "1px solid hsla(228,25%,14%,0.6)",
                          opacity: atMax ? 0.3 : 1,
                          cursor: atMax ? "not-allowed" : "pointer"
                        }}
                      >
                        <div className="text-base leading-none mb-0.5">{card.symbol}</div>
                        <div className="text-[10px] font-mono leading-tight line-clamp-1"
                          style={{ color: sel ? "hsla(270,65%,72%,0.9)" : "hsla(228,10%,50%,1)" }}>
                          {card.title.split(' ')[0]}
                        </div>
                        {sel && <Check className="w-2.5 h-2.5 mx-auto mt-0.5" style={{ color: "hsla(270,75%,65%,1)" }} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rate display (compact) */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest mb-1.5"
            style={{ color: isTarget ? "hsla(38,85%,52%,0.5)" : "hsla(270,75%,65%,0.5)" }}>
            Radionic Rate
          </div>
          <div
            className="px-3 py-1.5 rounded text-xs tabular-nums flex items-center justify-between"
            style={isTarget ? {
              background: "hsla(38,30%,4%,1)",
              border: "1px solid hsla(38,85%,30%,0.3)",
              color: "hsla(38,95%,62%,0.9)",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
              textShadow: "0 0 8px hsla(38,95%,55%,0.5)"
            } : {
              background: "hsla(120,40%,4%,1)",
              border: "1px solid hsla(120,60%,22%,0.3)",
              color: "hsla(120,75%,58%,0.9)",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
              textShadow: "0 0 8px hsla(120,75%,50%,0.5)"
            }}
          >
            {pos.rate || "0000000000"}
            {pos.rateLocked && (
              <Lock className="w-2.5 h-2.5 shrink-0" style={{ color: isTarget ? "hsla(38,85%,52%,0.6)" : "hsla(270,75%,65%,0.6)" }} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Builder() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cardsLib] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [frequencyHz, setFrequencyHz] = useState(7.83);
  const [duration, setDuration] = useState("30");
  const [unlimitedDuration, setUnlimitedDuration] = useState(false);
  const [subPositions, setSubPositions] = useState<SubPosition[]>([
    makeDefaultSubPosition(0),
    makeDefaultSubPosition(1),
  ]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const editId = params.get("edit");
    if (!editId) return;
    const op = operations.find(o => o.id === editId);
    if (!op) return;
    setEditingId(editId);
    setSessionName(op.name);
    setFrequencyHz(op.frequencyHz);
    setUnlimitedDuration(op.sessionDurationMinutes === 0);
    setDuration(op.sessionDurationMinutes === 0 ? "30" : String(op.sessionDurationMinutes));
    if (op.subPositions && op.subPositions.length > 0) {
      setSubPositions(op.subPositions as SubPosition[]);
    } else {
      const positions: SubPosition[] = [];
      positions.push({
        id: `sp-edit-0`,
        name: "Target",
        positionType: "Target",
        intention: op.target.description ?? "",
        rate: op.targetRate,
        rateLocked: op.targetRateLocked ?? false,
        customCardImages: [],
        cardIds: [],
        targetLinkType: op.structuralLinkType ?? "name",
        targetName: op.target.name,
        targetDescription: op.target.description,
        targetPhoto: op.target.photo,
        targetTransferDiagram: op.target.transferDiagram,
      });
      positions.push({
        id: `sp-edit-1`,
        name: "Trend 1",
        positionType: "Trend 1",
        intention: op.intention,
        rate: op.trendRate,
        rateLocked: op.trendRateLocked ?? false,
        customCardImages: op.customTrendCardImage ? [op.customTrendCardImage] : [],
        cardIds: op.trendCardIds ?? [],
        targetLinkType: "name",
      });
      setSubPositions(positions);
    }
    setActiveIdx(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadingSlot = useRef<number>(-1);
  const uploadingIdx = useRef<number>(0);

  const active = subPositions[activeIdx];

  const updatePosition = useCallback((idx: number, patch: Partial<SubPosition>) => {
    setSubPositions(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  }, []);

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

  const triggerImageUpload = (posIdx: number, slot: number) => {
    uploadingSlot.current = slot;
    uploadingIdx.current = posIdx;
    fileInputRef.current?.click();
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const data = await compressImage(raw, 800, 0.72);
      const posIdx = uploadingIdx.current;
      const slot = uploadingSlot.current;
      setSubPositions(prev => prev.map((p, i) => {
        if (i !== posIdx) return p;
        const imgs = [...p.customCardImages];
        if (slot === -1 || slot >= imgs.length) {
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

  const removeCustomImage = (posIdx: number, slot: number) => {
    setSubPositions(prev => prev.map((p, i) =>
      i === posIdx ? { ...p, customCardImages: p.customCardImages.filter((_, s) => s !== slot) } : p
    ));
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESET_OPERATIONS.find(p => p.id === presetId);
    if (!preset) return;
    setSessionName(preset.name);
    setFrequencyHz(preset.frequencyHz);
    setUnlimitedDuration(preset.sessionDurationMinutes === 0);
    setDuration(preset.sessionDurationMinutes === 0 ? "30" : String(preset.sessionDurationMinutes));
    setSubPositions([
      {
        id: `sp-${Date.now()}-0`,
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
      },
      {
        id: `sp-${Date.now()}-1`,
        name: "Trend 1",
        positionType: "Trend 1",
        intention: preset.intention,
        rate: preset.trendRate,
        rateLocked: false,
        customCardImages: [],
        cardIds: preset.cards,
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

    const updatedFields = {
      name: sessionName,
      intention: mainTrend.intention,
      trendRate: mainTrend.rate,
      trendRateLocked: mainTrend.rateLocked,
      trendCardIds: mainTrend.cardIds,
      customTrendCardImage: mainTrend.customCardImages[0],
      target: {
        name: mainTarget?.targetName ?? "Self",
        description: mainTarget?.intention ?? "",
        photo: mainTarget?.targetPhoto,
        transferDiagram: mainTarget?.targetTransferDiagram,
      },
      targetRate: mainTarget?.rate ?? "0000000000",
      targetRateLocked: mainTarget?.rateLocked,
      structuralLinkType: mainTarget?.targetLinkType ?? "name",
      frequencyHz,
      cards: allCardIds,
      subPositions,
      sessionDurationMinutes: unlimitedDuration ? 0 : (parseInt(duration) || 30),
    };

    if (editingId) {
      setOperations(ops => ops.map(op => op.id === editingId ? { ...op, ...updatedFields } : op));
      toast({ title: "Position Updated", description: `${subPositions.length} position(s) saved.` });
    } else {
      const newOp: Operation = {
        id: `op-${Date.now()}`,
        ...updatedFields,
        status: "idle",
        elapsedSeconds: 0,
        createdAt: new Date().toISOString(),
      };
      setOperations(ops => [newOp, ...ops]);
      toast({ title: "Position Saved", description: `${subPositions.length} position(s) saved to library.` });
    }
    navigate("/operations");
  };

  const rateToDisplay = (r: RadionicRate) => r || "0000000000";
  const isActiveTarget = active?.positionType === "Target";

  return (
    <div className="animate-in fade-in duration-400 pb-20 space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* Top toolbar */}
      <div
        className="rounded space-y-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
          border: "1px solid hsla(228,25%,13%,0.9)"
        }}
      >
        {/* Row 1: title + preset + save */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{ borderBottom: "1px solid hsla(228,25%,11%,1)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-mono font-bold text-white/70 shrink-0">
              {editingId ? "Edit Operation" : "Position Builder"}
            </h1>
            {editingId && (
              <div className="flex items-center gap-1.5">
                <Pencil className="w-2.5 h-2.5 shrink-0" style={{ color: "hsla(38,85%,52%,0.7)" }} />
                <span className="text-[11px] font-mono text-white/30">Editing — changes overwrite saved operation</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select onValueChange={loadPreset}>
              <SelectTrigger
                className="w-40 text-xs h-7 font-mono"
                style={{
                  background: "hsla(228,35%,6%,1)",
                  border: "1px solid hsla(228,25%,16%,0.8)",
                  color: "hsla(228,10%,45%,1)"
                }}
              >
                <SelectValue placeholder="Load preset..." />
              </SelectTrigger>
              <SelectContent>
                {PRESET_OPERATIONS.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-mono font-medium shrink-0 transition-all"
              style={{
                background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,30%,1))",
                border: "1px solid hsla(270,75%,55%,0.5)",
                color: "white",
                boxShadow: "0 0 14px hsla(270,75%,58%,0.25)"
              }}
              data-testid="button-save-operation"
            >
              <Save className="w-3.5 h-3.5" />
              {editingId ? "Update" : "Save Operation"}
            </button>
          </div>
        </div>

        {/* Row 2: Operation name — full width, prominent */}
        <div className="px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5"
            style={{ color: sessionName ? "hsla(228,10%,35%,1)" : "hsla(38,85%,52%,0.7)" }}>
            {sessionName ? "Operation Name" : "★ Operation Name (required — type it here)"}
          </div>
          <input
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            placeholder="e.g. My Abundance Operation"
            data-testid="input-operation-name"
            className="w-full bg-transparent outline-none font-mono text-lg font-semibold placeholder:text-white/20"
            style={{
              color: "hsla(270,75%,82%,1)",
              caretColor: "hsla(270,75%,65%,1)",
              borderBottom: sessionName
                ? "1px solid hsla(270,45%,40%,0.5)"
                : "1px solid hsla(38,85%,45%,0.45)",
            }}
          />
        </div>
      </div>

      {/* Main area: position canvas (left) + active editor (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">

        {/* ====== POSITION CANVAS ====== */}
        <div className="space-y-3">
          {/* Canvas toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-px" style={{ background: "hsla(270,75%,58%,0.5)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
                Radionic Canvas — {subPositions.length} / {MAX_POSITIONS} Positions
              </span>
            </div>
            {subPositions.length < MAX_POSITIONS && (
              <button
                type="button"
                onClick={addPosition}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-mono transition-all"
                style={{
                  background: "hsla(228,35%,7%,1)",
                  border: "1px dashed hsla(270,45%,35%,0.5)",
                  color: "hsla(270,75%,65%,0.8)"
                }}
              >
                <Plus className="w-3 h-3" /> Add Position
              </button>
            )}
          </div>

          {/* Position grid — SMX style: all visible simultaneously */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {subPositions.map((pos, idx) => (
                <PositionModuleCard
                  key={pos.id}
                  pos={pos}
                  idx={idx}
                  isActive={idx === activeIdx}
                  cardsLib={cardsLib}
                  onSelect={() => setActiveIdx(idx)}
                  onRemove={() => removePosition(idx)}
                  onUpdate={patch => updatePosition(idx, patch)}
                  onTriggerImageUpload={(slot) => triggerImageUpload(idx, slot)}
                  onRemoveImage={(slot) => removeCustomImage(idx, slot)}
                  totalCount={subPositions.length}
                  fileInputRef={fileInputRef}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ====== ACTIVE POSITION EDITOR (right panel) ====== */}
        {active && (
          <div className="space-y-3">
            {/* Panel header */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-px" style={{ background: "hsla(38,85%,52%,0.5)" }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
                Position {activeIdx + 1} — Rate Dialing
              </span>
            </div>

            {/* Rate dial section */}
            <div
              className="rounded p-4 space-y-4"
              style={{
                background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
                border: `1px solid ${isActiveTarget ? "hsla(38,85%,52%,0.3)" : "hsla(270,45%,35%,0.3)"}`,
                boxShadow: "0 4px 16px hsla(0,0%,0%,0.4)"
              }}
            >
              <div className="flex items-center gap-2">
                {isActiveTarget
                  ? <Target className="w-3.5 h-3.5" style={{ color: "hsla(38,85%,62%,0.8)" }} />
                  : <Sparkles className="w-3.5 h-3.5" style={{ color: "hsla(270,75%,65%,0.8)" }} />
                }
                <span className="text-xs font-mono font-bold"
                  style={{ color: isActiveTarget ? "hsla(38,85%,65%,0.9)" : "hsla(270,75%,70%,0.9)" }}>
                  {active.name} — Virtual Stick Pad
                </span>
              </div>

              <StickPad
                locked={active.rateLocked}
                onLock={rate => updatePosition(activeIdx, { rate, rateLocked: true })}
                onClear={() => updatePosition(activeIdx, { rateLocked: false })}
                rateDisplay={rateToDisplay(active.rate)}
                color={isActiveTarget ? "amber" : "primary"}
              />
            </div>

            {/* Chi frequency + duration */}
            <div
              className="rounded p-4 space-y-4"
              style={{
                background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
                border: "1px solid hsla(228,25%,14%,0.9)",
                boxShadow: "0 4px 16px hsla(0,0%,0%,0.4)"
              }}
            >
              <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid hsla(228,25%,12%,1)" }}>
                <Zap className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">Chi Frequency</span>
              </div>

              <FrequencySlider value={frequencyHz} onChange={setFrequencyHz} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest mb-1.5 text-white/30">Frequency</div>
                  <Select
                    value=""
                    onValueChange={v => setFrequencyHz(parseFloat(v))}
                  >
                    <SelectTrigger
                      className="text-xs h-8 font-mono w-full"
                      style={{ background: "hsla(228,35%,6%,1)", border: "1px solid hsla(228,25%,16%,0.8)" }}
                    >
                      <SelectValue placeholder="Select preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_PRESETS.map(p => (
                        <SelectItem key={p.hz} value={String(p.hz)} className="text-xs">
                          {p.hz} Hz — {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest mb-1.5 text-white/30">Duration</div>
                  {/* Unlimited toggle */}
                  <button
                    type="button"
                    onClick={() => setUnlimitedDuration(u => !u)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded mb-1.5 text-xs font-mono transition-all"
                    style={{
                      background: unlimitedDuration ? "hsla(270,45%,14%,1)" : "hsla(228,35%,6%,1)",
                      border: unlimitedDuration
                        ? "1px solid hsla(270,75%,45%,0.5)"
                        : "1px solid hsla(228,25%,16%,0.8)",
                      color: unlimitedDuration ? "hsla(270,75%,72%,1)" : "hsla(228,10%,40%,1)"
                    }}
                  >
                    <span>{unlimitedDuration ? "∞  Continuous" : "Timed session"}</span>
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{
                        background: unlimitedDuration ? "hsla(270,75%,55%,1)" : "hsla(228,25%,20%,1)",
                        boxShadow: unlimitedDuration ? "0 0 6px hsla(270,75%,58%,0.5)" : "none"
                      }}
                    />
                  </button>
                  {!unlimitedDuration && (
                    <Input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      min="1"
                      max="1440"
                      placeholder="30"
                      className="text-sm font-mono h-8"
                      style={{
                        background: "hsla(228,35%,6%,1)",
                        border: "1px solid hsla(228,25%,16%,0.8)"
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* All positions summary */}
            <div
              className="rounded p-3 space-y-1"
              style={{
                background: "hsla(228,35%,6%,0.8)",
                border: "1px solid hsla(228,25%,12%,0.8)"
              }}
            >
              <div className="text-[11px] font-mono uppercase tracking-widest text-white/20 mb-2">All Positions</div>
              {subPositions.map((pos, idx) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all"
                  style={{
                    background: idx === activeIdx ? "hsla(270,35%,12%,1)" : "transparent",
                    border: idx === activeIdx ? "1px solid hsla(270,45%,25%,0.4)" : "1px solid transparent"
                  }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                    style={{
                      background: idx === activeIdx ? "hsla(270,75%,50%,1)" : "hsla(228,25%,14%,1)",
                      color: idx === activeIdx ? "white" : "hsla(228,10%,40%,1)"
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[12px] font-mono truncate flex-1"
                    style={{ color: idx === activeIdx ? "hsla(270,75%,70%,1)" : "hsla(228,10%,40%,1)" }}>
                    {pos.name}
                  </span>
                  <span className="text-[11px] font-mono shrink-0"
                    style={{ color: "hsla(228,10%,30%,1)" }}>
                    {pos.rate.slice(0, 5)}···
                  </span>
                  {pos.rateLocked && (
                    <Lock className="w-2 h-2 shrink-0" style={{ color: "hsla(270,75%,58%,0.5)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
