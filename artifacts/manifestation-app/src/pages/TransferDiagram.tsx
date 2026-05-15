import { useRef } from "react";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import { Printer, Upload, Trash2, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TransferDiagramData {
  image: string;
  uploadedAt: string;
  filename: string;
}

export default function TransferDiagram() {
  const { toast } = useToast();
  const [diagram, setDiagram] = useUserData<TransferDiagramData | null>(
    "orgone_transfer_diagram",
    null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setDiagram({ image: result, uploadedAt: new Date().toISOString(), filename: file.name });
      toast({ title: "Transfer Diagram loaded", description: "Structural link is now active." });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setDiagram({ image: result, uploadedAt: new Date().toISOString(), filename: file.name });
      toast({ title: "Transfer Diagram loaded", description: "Structural link is now active." });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setDiagram(null);
    toast({ title: "Transfer Diagram removed", description: "Structural link cleared." });
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">

      {/* Hidden file input — triggered via labels for browser compatibility */}
      <input
        ref={fileRef}
        id="transfer-diagram-upload"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleUpload}
      />

      {/* Header — hidden on print */}
      <header className="print:hidden">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">The Intention Engine</p>
        <h1 className="text-4xl font-serif text-primary tracking-tight">Transfer Diagram</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Your unique structural link — provided by Orgone Studio upon purchase. Upload it here and place the physical printout on your chi generator to activate the link between the field and this software.
        </p>
      </header>

      {/* Action bar — hidden on print */}
      {diagram && (
        <div className="print:hidden flex items-center gap-3">
          <Button
            onClick={handlePrint}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Printer className="w-4 h-4" /> Print Diagram
          </Button>
          <label htmlFor="transfer-diagram-upload" className="cursor-pointer">
            <Button variant="outline" className="gap-2 pointer-events-none" asChild={false} tabIndex={-1}>
              <Upload className="w-4 h-4" /> Replace
            </Button>
          </label>
          <Button
            variant="ghost"
            onClick={handleRemove}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {diagram ? (
          <motion.div
            key="diagram"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            {/* Display card — visible on screen and print */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/25 bg-card print:border-gray-300 print:rounded-none print:bg-white">
              {/* Ambient glow layer */}
              <div className="absolute inset-0 pointer-events-none print:hidden"
                style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(251,191,36,0.07) 0%, transparent 70%)" }} />

              {/* Print header */}
              <div className="hidden print:block px-10 pt-10 pb-4 border-b border-gray-200">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-mono">The Intention Engine — Structural Link Certificate</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">Issued: {new Date(diagram.uploadedAt).toLocaleDateString()}</p>
              </div>

              {/* Diagram image */}
              <div className="flex items-center justify-center p-8 print:p-10 min-h-[460px] print:min-h-0">
                <img
                  src={diagram.image}
                  alt="Transfer Diagram"
                  className="max-w-full max-h-[520px] object-contain drop-shadow-2xl print:max-h-none print:w-full"
                  data-testid="img-transfer-diagram-page"
                />
              </div>

              {/* Status bar — screen only */}
              <div className="print:hidden border-t border-amber-500/15 px-6 py-3 flex items-center justify-between bg-amber-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Structural Link Active</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Loaded {new Date(diagram.uploadedAt).toLocaleDateString()} — {diagram.filename}
                </span>
              </div>

              {/* Print footer */}
              <div className="hidden print:block px-10 py-6 border-t border-gray-200 space-y-2">
                <p className="text-[12px] uppercase tracking-widest text-gray-500 text-center font-mono">
                  Place this diagram on your chi generator to activate the structural link between your device and The Intention Engine.
                  This diagram is unique to your licensed copy and should not be shared or reproduced.
                </p>
                <p className="text-[11px] text-gray-400 text-center mt-3">
                  This software is designed for meditation, visualization, intention-setting, and entertainment/wellness purposes only.
                  It does not diagnose, treat, cure, or prevent any medical condition, and makes no claims regarding financial, legal, or health outcomes.
                </p>
              </div>
            </div>

            {/* Instructions — screen only */}
            <div className="print:hidden mt-4 rounded-xl border border-border/40 bg-card/40 px-6 py-4 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">How to use your Transfer Diagram</p>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Print this diagram using the Print button above — use the highest quality setting available.</li>
                <li>Place the printed diagram face-up on or beneath your chi generator (RAD, ATGS, or similar HSCTI device).</li>
                <li>The software will transmit through the structural link whenever a position is set to "Transmitting."</li>
                <li>Keep this page bookmarked — it is your personal link certificate.</li>
              </ol>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Upload drop zone — label wraps the whole zone so clicking anywhere triggers the picker */}
            <label
              htmlFor="transfer-diagram-upload"
              className="rounded-2xl border-2 border-dashed border-border/50 hover:border-amber-500/40 transition-colors duration-300 bg-card/30 min-h-[420px] flex flex-col items-center justify-center gap-6 cursor-pointer group print:hidden"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              data-testid="transfer-upload-zone"
            >
              <div className="w-20 h-20 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center group-hover:border-amber-500/40 transition-colors duration-300">
                <ImageOff className="w-8 h-8 text-amber-500/40 group-hover:text-amber-500/70 transition-colors duration-300" />
              </div>
              <div className="text-center space-y-2 px-8">
                <p className="text-lg font-serif text-muted-foreground">No Transfer Diagram loaded</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm">
                  Upload the Transfer Diagram image sent to you by Orgone Studio upon purchase. This is your unique structural link — keep it private.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-amber-500/30 text-amber-400/70 hover:border-amber-500/60 hover:text-amber-400 text-sm font-medium transition-colors duration-150">
                <Upload className="w-4 h-4" /> Upload Transfer Diagram
              </span>
              <p className="text-[11px] text-muted-foreground/40 font-mono">JPG, PNG, WEBP — drag and drop or click anywhere</p>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
