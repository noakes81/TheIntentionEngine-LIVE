import { motion } from "framer-motion";

interface ChiFieldIndicatorProps {
  active: boolean;
  frequencyHz?: number;
  size?: "sm" | "md" | "lg";
}

export function ChiFieldIndicator({ active, frequencyHz = 7.83, size = "md" }: ChiFieldIndicatorProps) {
  const dim = size === "sm" ? 72 : size === "lg" ? 160 : 100;
  const rings = active ? (size === "sm" ? 2 : 3) : 1;

  return (
    <div className="flex flex-col items-center gap-2" data-testid="chi-field-indicator">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Background circle */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: active
              ? "radial-gradient(circle, hsla(270,75%,20%,0.4) 0%, hsla(228,35%,5%,0.6) 70%)"
              : "radial-gradient(circle, hsla(228,25%,10%,0.8) 0%, hsla(228,35%,5%,0.9) 70%)",
            border: `1px solid ${active ? "hsla(270,75%,58%,0.3)" : "hsla(228,25%,18%,0.8)"}`,
            boxShadow: active ? "0 0 30px hsla(270,75%,58%,0.2), inset 0 0 20px hsla(270,75%,58%,0.08)" : "inset 0 2px 8px hsla(0,0%,0%,0.5)"
          }}
        />

        {/* Pulsing rings */}
        {active && Array.from({ length: rings }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid hsla(270,75%,58%,0.4)" }}
            animate={{ scale: [1, 1.6 + i * 0.25], opacity: [0.5, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8,
            }}
          />
        ))}

        {/* Inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "18%",
            border: `1px solid ${active ? "hsla(270,75%,58%,0.5)" : "hsla(228,25%,20%,0.5)"}`,
          }}
        />

        {/* Core glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="rounded-full"
            style={{
              width: dim * 0.28,
              height: dim * 0.28,
              background: active
                ? "radial-gradient(circle, hsla(270,90%,75%,0.9) 0%, hsla(270,75%,55%,0.6) 60%, transparent 100%)"
                : "hsla(228,25%,15%,0.8)",
              boxShadow: active
                ? "0 0 12px hsla(270,75%,65%,0.8), 0 0 30px hsla(270,75%,58%,0.5), 0 0 60px hsla(270,75%,58%,0.2)"
                : "inset 0 1px 3px hsla(0,0%,0%,0.5)"
            }}
            animate={active ? {
              scale: [0.85, 1.1, 0.85],
              opacity: [0.85, 1, 0.85]
            } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Frequency text in center for lg */}
        {size === "lg" && active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-1">
              <div className="text-[12px] font-mono text-primary/80 mt-8">{frequencyHz} Hz</div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <div
          className="text-[11px] font-mono uppercase tracking-[0.2em]"
          style={{ color: active ? "hsla(270,75%,68%,1)" : "hsla(228,10%,35%,1)" }}
        >
          {active ? "CHI ACTIVE" : "STANDBY"}
        </div>
        {active && size !== "sm" && (
          <div className="text-[11px] font-mono mt-0.5" style={{ color: "hsla(228,10%,45%,1)" }}>
            {frequencyHz} Hz
          </div>
        )}
      </div>
    </div>
  );
}
