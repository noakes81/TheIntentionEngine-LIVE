import { RadionicRate } from "@/types";

interface RadionicRateDialsProps {
  label: string;
  value: RadionicRate;
  color?: "primary" | "secondary";
}

export function RadionicRateDials({ label, value, color = "primary" }: RadionicRateDialsProps) {
  const accent = color === "secondary"
    ? "text-amber-400 border-amber-400/40 bg-amber-400/5"
    : "text-primary border-primary/40 bg-primary/5";
  return (
    <div className="space-y-1">
      <div className="text-[12px] font-mono uppercase tracking-widest text-muted-foreground/70">{label} Radionic Rate</div>
      <div className={`font-mono text-sm tracking-widest px-2 py-1 rounded border inline-block ${accent}`}>
        {value || "0000000000"}
      </div>
    </div>
  );
}
