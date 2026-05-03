import { RadionicRate } from "@/types";
import { ChevronUp, ChevronDown } from "lucide-react";

interface RadionicRateDialsProps {
  label: string;
  value: RadionicRate;
  onChange: (rate: RadionicRate) => void;
  color?: "primary" | "secondary";
}

export function RadionicRateDials({ label, value, onChange, color = "primary" }: RadionicRateDialsProps) {
  const accent = color === "secondary" ? "text-amber-400 border-amber-400/40 bg-amber-400/5" : "text-primary border-primary/40 bg-primary/5";
  const accentBtn = color === "secondary" ? "hover:text-amber-400 hover:bg-amber-400/10" : "hover:text-primary hover:bg-primary/10";

  const increment = (i: number) => {
    const next = [...value] as RadionicRate;
    next[i] = (next[i] + 1) % 10;
    onChange(next);
  };

  const decrement = (i: number) => {
    const next = [...value] as RadionicRate;
    next[i] = (next[i] + 9) % 10;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">{label} Radionic Rate</div>
      <div className="flex items-center gap-2">
        {value.map((digit, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => increment(i)}
              className={`w-8 h-6 rounded-t flex items-center justify-center text-muted-foreground transition-colors ${accentBtn}`}
              data-testid={`btn-rate-up-${label.toLowerCase()}-${i}`}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div className={`w-8 h-10 rounded border flex items-center justify-center font-mono text-lg font-bold transition-colors ${accent}`}>
              {digit}
            </div>
            <button
              type="button"
              onClick={() => decrement(i)}
              className={`w-8 h-6 rounded-b flex items-center justify-center text-muted-foreground transition-colors ${accentBtn}`}
              data-testid={`btn-rate-down-${label.toLowerCase()}-${i}`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="ml-2 text-xs font-mono text-muted-foreground/50">
          {value.join(" — ")}
        </div>
      </div>
    </div>
  );
}
