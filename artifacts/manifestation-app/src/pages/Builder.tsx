import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation, SymbolicCard, RadionicRate } from "@/types";
import { PRESET_OPERATIONS, FREQUENCY_PRESETS } from "@/data/presets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrequencySlider } from "@/components/FrequencySlider";
import { RadionicRateDials } from "@/components/RadionicRateDials";
import { WitnessPhotoUpload } from "@/components/WitnessPhotoUpload";
import { useLocation } from "wouter";
import { Check, Save, Zap, Target, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Builder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cardsLib] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const [name, setName] = useState("");
  // TREND
  const [intention, setIntention] = useState("");
  const [trendRate, setTrendRate] = useState<RadionicRate>([0, 0, 0]);
  // TARGET
  const [targetName, setTargetName] = useState("Self");
  const [targetDesc, setTargetDesc] = useState("");
  const [targetPhoto, setTargetPhoto] = useState<string | undefined>(undefined);
  const [structuralLinkType, setStructuralLinkType] = useState<Operation["structuralLinkType"]>("name");
  const [targetRate, setTargetRate] = useState<RadionicRate>([0, 0, 0]);
  // Chi / frequency
  const [frequencyHz, setFrequencyHz] = useState(7.83);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [duration, setDuration] = useState("30");

  const loadPreset = (presetId: string) => {
    const preset = PRESET_OPERATIONS.find(p => p.id === presetId);
    if (!preset) return;
    setName(preset.name);
    setIntention(preset.intention);
    setTrendRate(preset.trendRate);
    setTargetName(preset.target.name);
    setTargetDesc(preset.target.description);
    setTargetRate(preset.targetRate);
    setFrequencyHz(preset.frequencyHz);
    setSelectedCards(preset.cards);
    setStructuralLinkType(preset.structuralLinkType);
  };

  const loadFreqPreset = (hz: string) => {
    setFrequencyHz(parseFloat(hz));
  };

  const handleSave = () => {
    if (!name || !intention) {
      toast({ title: "Missing fields", description: "Please provide a name and trend statement.", variant: "destructive" });
      return;
    }

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      name,
      intention,
      trendRate,
      target: { name: targetName, description: targetDesc, photo: targetPhoto },
      targetRate,
      structuralLinkType,
      frequencyHz,
      cards: selectedCards,
      trendCards: [],
      status: "idle",
      sessionDurationMinutes: parseInt(duration) || 30,
      elapsedSeconds: 0,
      createdAt: new Date().toISOString()
    };

    setOperations([...operations, newOp]);
    toast({ title: "Position Saved", description: "Your radionic position has been saved to the library." });
    navigate("/operations");
  };

  const toggleCard = (id: string) => {
    setSelectedCards(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Position Builder</h1>
          <p className="text-muted-foreground mt-2">Construct a new radionic transmission — set your TREND, TARGET, and rates.</p>
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

      <div className="space-y-2">
        <Label htmlFor="op-name">Position Name</Label>
        <Input
          id="op-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Abundance Flow — Self — 333 Hz"
          className="bg-background/50 border-primary/20 text-lg"
          data-testid="input-operation-name"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TREND column */}
        <Card className="glass-card p-6 space-y-6 border-primary/20">
          <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-primary">TREND</h2>
              <p className="text-xs text-muted-foreground">Desired outcome — what you want to happen</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intention">Trend Statement (present tense, feeling-based)</Label>
            <Textarea
              id="intention"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              placeholder="I feel deeply grateful knowing that abundance flows freely to me now..."
              className="min-h-[120px] bg-background/50 border-primary/20 italic text-base resize-none leading-relaxed"
              data-testid="textarea-intention"
            />
            <p className="text-[10px] text-muted-foreground/60">Write from the feeling of already having the result. (Magic of the Future — Welz)</p>
          </div>

          <RadionicRateDials
            label="TREND"
            value={trendRate}
            onChange={setTrendRate}
            color="primary"
          />
        </Card>

        {/* TARGET column */}
        <Card className="glass-card p-6 space-y-6 border-amber-500/20">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-amber-400">TARGET</h2>
              <p className="text-xs text-muted-foreground">Who or what the operation is directed at</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetName">Target Name</Label>
              <Input
                id="targetName"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                className="bg-background/50 border-amber-500/20"
                data-testid="input-target-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Structural Link Type</Label>
              <Select value={structuralLinkType} onValueChange={(v) => setStructuralLinkType(v as Operation["structuralLinkType"])}>
                <SelectTrigger className="bg-background/50 border-amber-500/20">
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

          <div className="space-y-2">
            <Label htmlFor="targetDesc">Target Description</Label>
            <Input
              id="targetDesc"
              value={targetDesc}
              onChange={e => setTargetDesc(e.target.value)}
              placeholder="Brief description of target or situation"
              className="bg-background/50 border-amber-500/20"
              data-testid="input-target-desc"
            />
          </div>

          <div className="space-y-2">
            <Label>Witness Photo (Structural Link)</Label>
            <WitnessPhotoUpload value={targetPhoto} onChange={setTargetPhoto} />
          </div>

          <RadionicRateDials
            label="TARGET"
            value={targetRate}
            onChange={setTargetRate}
            color="secondary"
          />
        </Card>
      </div>

      {/* Chi frequency + session + cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-border/30 pb-4">
            <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">CHI GENERATOR FREQUENCY</h2>
              <p className="text-xs text-muted-foreground/60">Pulse frequency for the orgone/chi field (0.6–1000 Hz)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/30 p-4 rounded-xl border border-border/30">
              <FrequencySlider value={frequencyHz} onChange={setFrequencyHz} />
            </div>
            <div className="space-y-3">
              <Label>Quick-Select Frequency</Label>
              <Select onValueChange={loadFreqPreset}>
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

        {/* Symbolic cards */}
        <Card className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/30 pb-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Filter Cards</h2>
            <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-full">
              {selectedCards.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
            {cardsLib.slice(0, 14).map(card => {
              const isSelected = selectedCards.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  data-testid={`card-${card.id}`}
                  className={`cursor-pointer rounded-lg p-2 text-center border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                      : "border-border/40 bg-background/50 hover:border-primary/40"
                  }`}
                >
                  <div className="text-xl mb-1">{card.symbol}</div>
                  <div className="text-[9px] font-medium leading-tight line-clamp-2">{card.title}</div>
                  {isSelected && <Check className="w-3 h-3 text-primary mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
