import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SymbolicCardProps {
  id: string;
  title: string;
  category: string;
  symbol: string;
  description: string;
  frequency?: number;
  favorited?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onToggleFavorite?: () => void;
}

export function SymbolicCard({ 
  title, 
  category, 
  symbol, 
  description, 
  frequency,
  favorited,
  selected,
  onClick,
  onToggleFavorite
}: SymbolicCardProps) {
  
  const categoryColors: Record<string, string> = {
    chakra: "bg-red-500/10 text-red-500 border-red-500/20",
    solfeggio: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    protection: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    manifestation: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    elements: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    numerology: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group",
        "border border-border/50 hover:border-primary/50",
        selected ? "glass-card-active" : "glass-card",
        onClick ? "hover:-translate-y-1 hover:shadow-xl" : ""
      )}
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 z-10">
        {onToggleFavorite && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="text-muted-foreground hover:text-secondary transition-colors"
          >
            <Star className={cn("w-4 h-4", favorited && "fill-secondary text-secondary")} />
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50 shadow-inner">
          <span className="text-3xl text-primary font-serif">{symbol}</span>
        </div>
        
        <div className="space-y-2 w-full">
          <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wider font-semibold", categoryColors[category] || "bg-muted text-foreground")}>
            {category}
          </Badge>
          <h3 className="font-medium text-lg leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {frequency && (
          <div className="mt-auto pt-4 w-full border-t border-border/30 flex justify-center">
            <span className="text-xs font-mono text-primary/80">{frequency} Hz</span>
          </div>
        )}
      </div>
    </Card>
  );
}
