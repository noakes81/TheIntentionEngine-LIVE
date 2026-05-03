import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation, SymbolicCard } from "@/types";
import { PRESET_OPERATIONS } from "@/data/presets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FrequencySlider } from "@/components/FrequencySlider";
import { SymbolicCard as SymbolicCardComponent } from "@/components/SymbolicCard";
import { WitnessPhotoUpload } from "@/components/WitnessPhotoUpload";
import { useLocation } from "wouter";
import { Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Builder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [operations, setOperations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cardsLib] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);

  const [name, setName] = useState("");
  const [intention, setIntention] = useState("");
  const [targetName, setTargetName] = useState("Self");
  const [targetDesc, setTargetDesc] = useState("");
  const [targetPhoto, setTargetPhoto] = useState<string | undefined>(undefined);
  const [frequencyHz, setFrequencyHz] = useState(432);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [duration, setDuration] = useState("30");

  const handleSave = () => {
    if (!name || !intention) {
      toast({
        title: "Missing fields",
        description: "Please provide a name and intention for your operation.",
        variant: "destructive"
      });
      return;
    }

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      name,
      intention,
      target: { name: targetName, description: targetDesc, photo: targetPhoto },
      frequencyHz,
      cards: selectedCards,
      trendCards: [],
      status: "idle",
      sessionDurationMinutes: parseInt(duration) || 30,
      elapsedSeconds: 0,
      createdAt: new Date().toISOString()
    };

    setOperations([...operations, newOp]);
    toast({
      title: "Operation Saved",
      description: "Your operation has been saved to the library.",
    });
    navigate("/operations");
  };

  const toggleCard = (id: string) => {
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Operation Builder</h1>
          <p className="text-muted-foreground mt-2">Construct a new energetic transmission.</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" /> Save Operation
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-serif border-b border-border/50 pb-4">Core Intention</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Operation Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Deep Healing 432Hz"
                  className="bg-background/50 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intention">Intention Statement (Present Tense)</Label>
                <Textarea 
                  id="intention" 
                  value={intention} 
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="I am whole, healed, and deeply at peace..."
                  className="min-h-[100px] bg-background/50 border-primary/20 italic text-lg resize-none"
                />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-serif border-b border-border/50 pb-4">Target & Frequency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetName">Target Name</Label>
                  <Input 
                    id="targetName" 
                    value={targetName} 
                    onChange={(e) => setTargetName(e.target.value)}
                    className="bg-background/50 border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDesc">Target Description (Optional)</Label>
                  <Input 
                    id="targetDesc" 
                    value={targetDesc} 
                    onChange={(e) => setTargetDesc(e.target.value)}
                    className="bg-background/50 border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Witness Photo (Optional)</Label>
                  <WitnessPhotoUpload value={targetPhoto} onChange={setTargetPhoto} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Session Duration (Minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-background/50 border-primary/20"
                  />
                </div>
              </div>
              
              <div className="space-y-4 bg-background/30 p-4 rounded-xl border border-border/30">
                <FrequencySlider value={frequencyHz} onChange={setFrequencyHz} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card p-6 space-y-6 h-full">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h2 className="text-xl font-serif">Symbolic Cards</h2>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-full">
                {selectedCards.length} selected
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {cardsLib.slice(0, 10).map((card) => {
                const isSelected = selectedCards.includes(card.id);
                return (
                  <div 
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    className={`cursor-pointer rounded-xl p-3 text-center border transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(157,78,221,0.2)]" 
                        : "border-border/50 bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{card.symbol}</div>
                    <div className="text-[10px] font-medium leading-tight line-clamp-2">{card.title}</div>
                    {isSelected && <Check className="w-3 h-3 text-primary mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Select cards to amplify your intention.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
