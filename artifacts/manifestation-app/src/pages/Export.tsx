import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation, SymbolicCard } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Export() {
  const { toast } = useToast();
  const [operations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [cards] = useLocalStorage<SymbolicCard[]>("orgone_cards", []);
  const [selectedId, setSelectedId] = useState<string>("");

  const selectedOp = operations.find(op => op.id === selectedId);
  const opCards = selectedOp ? cards.filter(c => selectedOp.cards.includes(c.id)) : [];

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!selectedOp) return;
    
    const text = `
ORGONE STUDIO OPERATION: ${selectedOp.name}
Date: ${new Date().toLocaleDateString()}

INTENTION:
${selectedOp.intention}

TARGET:
${selectedOp.target.name}
${selectedOp.target.description ? `(${selectedOp.target.description})` : ''}

PARAMETERS:
Frequency: ${selectedOp.frequencyHz} Hz
Duration: ${selectedOp.sessionDurationMinutes} minutes

SYMBOLS USED:
${opCards.map(c => `- ${c.title} (${c.category})`).join('\n')}

NOTES:
${selectedOp.notes || ''}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Operation details copied to clipboard.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <header className="print:hidden">
        <h1 className="text-4xl font-serif text-primary tracking-tight">Export Sheet</h1>
        <p className="text-muted-foreground mt-2">Generate printable records of your energetic operations.</p>
      </header>

      <div className="print:hidden bg-background/50 border border-border/50 p-4 rounded-xl flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full bg-background border-primary/20">
              <SelectValue placeholder="Select an operation to export..." />
            </SelectTrigger>
            <SelectContent>
              {operations.map(op => (
                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleCopy} disabled={!selectedOp} className="gap-2">
          <Copy className="w-4 h-4" /> Copy Text
        </Button>
        <Button onClick={handlePrint} disabled={!selectedOp} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Printer className="w-4 h-4" /> Print Sheet
        </Button>
      </div>

      {selectedOp ? (
        <Card className="bg-white text-black p-8 md:p-12 shadow-2xl print:shadow-none print:p-0 border-none mx-auto max-w-3xl min-h-[800px] flex flex-col relative overflow-hidden">
          {/* Decorative watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] text-gray-50 opacity-50 pointer-events-none select-none font-serif leading-none">
            ✧
          </div>
          
          <div className="border-b-2 border-gray-200 pb-6 mb-8 relative z-10 flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Orgone Studio Record</h2>
              <h1 className="text-4xl font-serif mt-2 text-gray-900">{selectedOp.name}</h1>
            </div>
            <div className="text-right text-sm font-mono text-gray-500">
              {new Date(selectedOp.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-8 relative z-10 flex-1">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">Intention</h3>
              <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">
                "{selectedOp.intention}"
              </p>
            </section>

            <div className="grid grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">Target / Witness</h3>
                <p className="text-lg font-medium text-gray-800">{selectedOp.target.name}</p>
                {selectedOp.target.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedOp.target.description}</p>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">Parameters</h3>
                <div className="space-y-2 text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-mono font-medium">{selectedOp.frequencyHz} Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-mono font-medium">{selectedOp.sessionDurationMinutes} min</span>
                  </div>
                </div>
              </section>
            </div>

            {opCards.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-1">Archetypes / Symbols</h3>
                <div className="grid grid-cols-4 gap-4">
                  {opCards.map(card => (
                    <div key={card.id} className="text-center border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                      <div className="text-3xl mb-2 text-gray-800">{card.symbol}</div>
                      <div className="text-xs font-medium text-gray-700">{card.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase mt-1">{card.category}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">Session Notes</h3>
              <div className="w-full h-48 border border-gray-200 bg-gray-50/30 rounded-lg p-4 text-gray-600 italic">
                {selectedOp.notes || "Write post-session impressions here..."}
              </div>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 relative z-10">
            This software is designed for meditation, visualization, intention-setting, and entertainment/wellness purposes only. It does not diagnose, treat, cure, or prevent any medical condition, and makes no claims regarding financial, legal, or health outcomes. Results vary by individual. Not a substitute for professional medical, financial, or legal advice.
          </div>
        </Card>
      ) : (
        <Card className="glass-card p-12 text-center border-dashed border-2 print:hidden">
          <h2 className="text-xl font-serif text-muted-foreground">Select an operation to generate export sheet</h2>
        </Card>
      )}
    </div>
  );
}
