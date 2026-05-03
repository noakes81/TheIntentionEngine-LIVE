import { motion } from "framer-motion";

export function WaveformVisualizer({ active, frequency = 432 }: { active: boolean; frequency?: number }) {
  // Create bars for the visualizer
  const bars = Array.from({ length: 24 }).map((_, i) => i);
  
  // Calculate speed based on frequency (higher freq = faster)
  // Base speed is around 1s, scales down to 0.2s for high frequencies
  const speed = Math.max(0.2, 2 - (Math.log10(Math.max(1, frequency)) * 0.5));
  
  return (
    <div className="h-16 w-full flex items-center justify-center gap-1 overflow-hidden relative">
      {/* Background glow when active */}
      {active && (
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
      )}
      
      {bars.map((bar) => {
        // Create an organic wave shape
        const heightPhase = Math.sin((bar / bars.length) * Math.PI);
        const baseHeight = 10 + heightPhase * 40;
        
        return (
          <motion.div
            key={bar}
            className={`w-1 rounded-full ${active ? 'bg-primary' : 'bg-muted'}`}
            initial={{ height: active ? baseHeight : 4 }}
            animate={{ 
              height: active 
                ? [baseHeight * 0.5, baseHeight * 1.2, baseHeight * 0.5] 
                : 4 
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: active ? (bar * (speed / bars.length)) : 0
            }}
            style={{
              boxShadow: active ? `0 0 8px hsl(var(--primary) / 0.5)` : 'none'
            }}
          />
        );
      })}
    </div>
  );
}
