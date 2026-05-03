import { useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionTimer } from "@/hooks/useSessionTimer";

interface SessionTimerProps {
  durationMinutes: number;
  status: "idle" | "running" | "paused" | "completed";
  onStatusChange: (status: "idle" | "running" | "paused" | "completed") => void;
  onTick?: (elapsedSeconds: number) => void;
}

export function SessionTimer({ durationMinutes, status, onStatusChange, onTick }: SessionTimerProps) {
  const { elapsedSeconds, formattedTime, progress, start, pause, stop, reset } = useSessionTimer(durationMinutes);

  useEffect(() => {
    if (status === 'running') start();
    else if (status === 'paused') pause();
    else if (status === 'idle') stop();
  }, [status, start, pause, stop]);

  useEffect(() => {
    if (onTick) onTick(elapsedSeconds);
    
    if (durationMinutes > 0 && elapsedSeconds >= durationMinutes * 60) {
      onStatusChange('completed');
      stop();
    }
  }, [elapsedSeconds, durationMinutes, onTick, onStatusChange, stop]);

  const handleToggle = () => {
    if (status === 'running') {
      onStatusChange('paused');
    } else {
      onStatusChange('running');
    }
  };

  const handleStop = () => {
    onStatusChange('idle');
  };

  const handleReset = () => {
    reset();
    onStatusChange('idle');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 rounded-2xl glass-card relative">
      {status === 'running' && (
        <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse pointer-events-none" />
      )}
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer glowing ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            className="text-muted/30 stroke-current"
            strokeWidth="2"
            cx="50"
            cy="50"
            r="48"
            fill="transparent"
          />
          <motion.circle
            className="text-primary stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="48"
            fill="transparent"
            initial={{ strokeDasharray: "0 300" }}
            animate={{ strokeDasharray: `${(progress / 100) * 301} 300` }}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Center content */}
        <div className="text-center z-10 flex flex-col items-center">
          <span className="text-4xl font-mono tracking-tighter text-foreground font-light">
            {formattedTime}
          </span>
          {durationMinutes > 0 && (
            <span className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
              / {durationMinutes}:00:00
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary/20 hover:text-primary transition-all"
          onClick={handleToggle}
        >
          {status === 'running' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-destructive/20 hover:bg-destructive/20 hover:text-destructive transition-all"
          onClick={handleStop}
          disabled={status === 'idle'}
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
