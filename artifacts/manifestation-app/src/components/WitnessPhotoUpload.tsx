import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/imageUtils";

interface WitnessPhotoUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

export function WitnessPhotoUpload({ value, onChange }: WitnessPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      const compressed = await compressImage(raw, 800, 0.72);
      onChange(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="input-witness-photo"
        onChange={handleInputChange}
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(157,78,221,0.15)]">
          <img
            src={value}
            alt="Target witness"
            className="w-full h-48 object-cover"
            data-testid="img-witness-photo"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="button-replace-photo"
              onClick={() => inputRef.current?.click()}
              className="bg-background/80 border-white/30 text-white hover:bg-background"
            >
              <Upload className="w-3 h-3 mr-1" /> Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="button-remove-photo"
              onClick={handleRemove}
              className="bg-background/80 border-red-400/50 text-red-400 hover:bg-background"
            >
              <X className="w-3 h-3 mr-1" /> Remove
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-[12px] font-mono text-white/70 uppercase tracking-widest">Witness Attached</p>
          </div>
        </div>
      ) : (
        <div
          data-testid="dropzone-witness-photo"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative h-36 rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-all duration-300
            ${dragging
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(157,78,221,0.3)]"
              : "border-border/40 bg-background/30 hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          <div className={`p-3 rounded-full transition-colors ${dragging ? "bg-primary/20" : "bg-background/50"}`}>
            <ImageIcon className={`w-5 h-5 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {dragging ? "Drop image here" : "Attach witness photo"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Click or drag and drop — JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
