import { motion } from "framer-motion";

interface ChiFieldIndicatorProps {
  active: boolean;
  frequencyHz?: number;
  size?: "sm" | "md" | "lg";
}

export function ChiFieldIndicator({ active, frequencyHz = 7.83, size = "md" }: ChiFieldIndicatorProps) {
  const dim = size === "sm" ? 80 : size === "lg" ? 180 : 120;
  const rings = size === "sm" ? 2 : 3;
  const label = active ? "CHI FIELD ACTIVE" : "CHI FIELD STANDBY";

  return (
    <div className="flex flex-col items-center gap-3" data-testid="chi-field-indicator">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Outer pulsing rings */}
        {active && Array.from({ length: rings }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ scale: [1, 1.5 + i * 0.2], opacity: [0.6, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.7,
            }}
          />
        ))}

        {/* Static outer ring */}
        <div className={`absolute inset-0 rounded-full border ${active ? "border-primary/40" : "border-muted/20"}`} />

        {/* Inner glow core */}
        <div className="absolute inset-[20%] rounded-full flex items-center justify-center">
          <motion.div
            className={`w-full h-full rounded-full ${active ? "bg-primary/20" : "bg-muted/10"}`}
            animate={active ? { scale: [0.85, 1.05, 0.85], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={active ? { boxShadow: "0 0 24px hsl(var(--primary) / 0.5), 0 0 48px hsl(var(--primary) / 0.2)" } : {}}
          />
        </div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`rounded-full ${active ? "bg-primary" : "bg-muted/40"}`}
            style={{ width: dim * 0.14, height: dim * 0.14 }}
            animate={active ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </div>
      </div>

      <div className="text-center space-y-1">
        <div className={`text-[9px] font-mono uppercase tracking-widest ${active ? "text-primary" : "text-muted-foreground/40"}`}>
          {label}
        </div>
        {active && (
          <div className="text-[10px] font-mono text-muted-foreground/60">
            {frequencyHz} Hz
          </div>
        )}
      </div>
    </div>
  );
}
