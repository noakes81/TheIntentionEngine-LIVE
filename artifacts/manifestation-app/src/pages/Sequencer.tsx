import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Square, Plus, Trash2, GripVertical, Layers } from "lucide-react";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { SequencerStep } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function Sequencer() {
  const [steps, setSteps] = useState<SequencerStep[]>([
    { id: 's1', label: 'Grounding', frequencyHz: 396, durationMinutes: 5 },
    { id: 's2', label: 'Transformation', frequencyHz: 417, durationMinutes: 10 },
    { id: 's3', label: 'Miracle', frequencyHz: 528, durationMinutes: 15 },
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  const totalDuration = steps.reduce((acc, step) => acc + step.durationMinutes, 0);
  const { elapsedSeconds, formattedTime, start, pause, stop, reset } = useSessionTimer(0);

  useEffect(() => {
    if (status === 'running') {
      start();
      let accumulatedSeconds = 0;
      let currentStep = -1;
      for (let i = 0; i < steps.length; i++) {
        const stepDurationSeconds = steps[i].durationMinutes * 60;
        if (elapsedSeconds >= accumulatedSeconds && elapsedSeconds < accumulatedSeconds + stepDurationSeconds) {
          currentStep = i;
          break;
        }
        accumulatedSeconds += stepDurationSeconds;
      }
      if (elapsedSeconds >= totalDuration * 60 && totalDuration > 0) {
        setStatus('idle');
        stop();
        setActiveStepIndex(-1);
      } else if (currentStep !== activeStepIndex) {
        setActiveStepIndex(currentStep);
      }
    } else if (status === 'paused') {
      pause();
    } else {
      stop();
      setActiveStepIndex(-1);
    }
  }, [elapsedSeconds, status, steps, totalDuration, activeStepIndex, start, pause, stop]);

  const togglePlayback = () => {
    if (status === 'running') setStatus('paused');
    else setStatus('running');
  };

  const stopPlayback = () => {
    setStatus('idle');
    reset();
  };

  const addStep = () => {
    setSteps([...steps, {
      id: `s-${Date.now()}`,
      label: 'New Step',
      frequencyHz: 432,
      durationMinutes: 5
    }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof SequencerStep, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const isRunning = status === 'running';
  const overallProgress = totalDuration > 0 ? Math.min((elapsedSeconds / (totalDuration * 60)) * 100, 100) : 0;
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : null;

  return (
    <div className="animate-in fade-in duration-400 space-y-5 pb-20">
      {/* Header */}
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/25 mb-0.5">Orgone Manifestation X</div>
        <h1 className="text-2xl font-mono font-bold text-white/85">Frequency Sequencer</h1>
        <p className="text-xs font-mono text-white/30 mt-0.5">Chain multiple frequencies into a continuous barrage transmission.</p>
      </div>

      {/* Main control panel */}
      <div
        className="rounded overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
          border: isRunning ? "1px solid hsla(270,75%,50%,0.4)" : "1px solid hsla(228,25%,13%,0.9)",
          boxShadow: isRunning ? "0 0 30px hsla(270,75%,58%,0.1), 0 4px 20px hsla(0,0%,0%,0.4)" : "0 4px 20px hsla(0,0%,0%,0.4)"
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 py-2"
          style={{
            background: "linear-gradient(90deg, hsla(228,35%,8%,1), hsla(228,35%,6%,1))",
            borderBottom: "1px solid hsla(228,25%,12%,1)"
          }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className={isRunning ? "led-green" : status === 'paused' ? "led-amber" : "led-off"}
              animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/35">
              {isRunning ? `Sequencing — Step ${activeStepIndex + 1} of ${steps.length}` : status === 'paused' ? 'Paused' : 'Barrage Mode Ready'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-white/20" />
            <span className="text-[9px] font-mono text-white/20">{steps.length} STEPS — {totalDuration} MIN TOTAL</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
          {/* Circular clock */}
          <div className="relative w-36 mx-auto aspect-square flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle strokeWidth="3" cx="50" cy="50" r="45" fill="transparent"
                style={{ stroke: "hsla(228,25%,14%,1)" }} />
              <motion.circle
                strokeWidth="3"
                strokeLinecap="round"
                cx="50" cy="50" r="45" fill="transparent"
                style={{
                  stroke: "hsla(270,75%,58%,1)",
                  filter: isRunning ? "drop-shadow(0 0 4px hsla(270,75%,58%,0.7))" : "none"
                }}
                animate={{ strokeDasharray: `${(overallProgress / 100) * 283} 283` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-xl font-mono text-white/85 tabular-nums tracking-tighter">{formattedTime}</div>
              <div className="text-[8px] font-mono uppercase tracking-widest text-white/25 mt-0.5">
                / {totalDuration}:00
              </div>
            </div>
          </div>

          {/* Right — current step + waveform + controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-white/75">
                  {isRunning ? (activeStep?.label ?? 'Complete') : status === 'paused' ? 'Paused' : 'Ready to Sequence'}
                </div>
                <div
                  className="text-base font-mono font-bold mt-0.5"
                  style={{ color: isRunning ? "hsla(270,75%,65%,1)" : "hsla(228,10%,35%,1)" }}
                >
                  {activeStep ? `${activeStep.frequencyHz} Hz` : '— Hz'}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={isRunning ? {
                    background: "hsla(270,35%,15%,1)",
                    border: "1px solid hsla(270,45%,30%,0.5)",
                    color: "hsla(270,75%,70%,1)"
                  } : {
                    background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,30%,1))",
                    border: "1px solid hsla(270,75%,55%,0.5)",
                    color: "white",
                    boxShadow: "0 0 16px hsla(270,75%,58%,0.35)"
                  }}
                  onClick={togglePlayback}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "hsla(228,25%,9%,1)",
                    border: "1px solid hsla(0,50%,30%,0.4)",
                    color: "hsla(0,65%,50%,0.6)"
                  }}
                  onClick={stopPlayback}
                  disabled={status === 'idle'}
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Waveform */}
            <div
              className="h-16 rounded overflow-hidden"
              style={{
                background: "hsla(228,35%,5%,0.8)",
                border: "1px solid hsla(228,25%,12%,0.8)"
              }}
            >
              <WaveformVisualizer
                active={isRunning}
                frequency={activeStep?.frequencyHz ?? 432}
              />
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(228,25%,12%,1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1 }}
                  style={{
                    background: "linear-gradient(90deg, hsla(270,75%,45%,0.8), hsla(270,75%,65%,1))",
                    boxShadow: isRunning ? "0 0 6px hsla(270,75%,58%,0.5)" : "none"
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-white/20">
                <span>{Math.round(overallProgress)}% complete</span>
                <span>{totalDuration} min total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px" style={{ background: "hsla(270,75%,58%,0.5)" }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/30">Sequence Timeline</span>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono transition-all"
            style={{
              background: "hsla(228,35%,7%,1)",
              border: "1px dashed hsla(270,45%,35%,0.5)",
              color: "hsla(270,75%,65%,0.8)"
            }}
            onClick={addStep}
          >
            <Plus className="w-3 h-3" /> Add Step
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {steps.map((step, index) => {
              const isActive = activeStepIndex === index;
              let accSeconds = 0;
              for (let i = 0; i < index; i++) accSeconds += steps[i].durationMinutes * 60;
              const stepProgress = isActive && totalDuration > 0
                ? Math.max(0, Math.min(100, ((elapsedSeconds - accSeconds) / (step.durationMinutes * 60)) * 100))
                : 0;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="relative rounded overflow-hidden"
                  style={{
                    background: isActive
                      ? "linear-gradient(90deg, hsla(270,45%,10%,1), hsla(228,35%,6%,1))"
                      : "linear-gradient(160deg, hsla(228,35%,7%,0.99), hsla(228,40%,5%,1))",
                    border: isActive
                      ? "1px solid hsla(270,75%,50%,0.4)"
                      : "1px solid hsla(228,25%,13%,0.8)",
                    boxShadow: isActive ? "0 0 12px hsla(270,75%,58%,0.08)" : "none"
                  }}
                >
                  {/* Step progress bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5">
                      <motion.div
                        className="h-full"
                        animate={{ width: `${stepProgress}%` }}
                        transition={{ duration: 1 }}
                        style={{ background: "linear-gradient(90deg, hsla(270,75%,45%,0.8), hsla(270,75%,65%,1))" }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="w-3.5 h-3.5 cursor-grab shrink-0" style={{ color: "hsla(228,10%,28%,1)" }} />

                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-mono font-bold shrink-0"
                      style={{
                        background: isActive ? "hsla(270,75%,50%,1)" : "hsla(228,25%,14%,1)",
                        color: isActive ? "white" : "hsla(228,10%,40%,1)",
                        boxShadow: isActive ? "0 0 8px hsla(270,75%,58%,0.5)" : "none"
                      }}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-3 min-w-0">
                      <div>
                        <div className="text-[8px] font-mono uppercase tracking-widest mb-1 text-white/25">Label</div>
                        <Input
                          value={step.label}
                          onChange={e => updateStep(index, 'label', e.target.value)}
                          className="h-7 text-xs font-mono"
                          style={{
                            background: "hsla(228,35%,5%,0.8)",
                            border: "1px solid hsla(228,25%,15%,0.8)"
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-[8px] font-mono uppercase tracking-widest mb-1 text-white/25">Freq (Hz)</div>
                        <Input
                          type="number"
                          value={step.frequencyHz}
                          onChange={e => updateStep(index, 'frequencyHz', Number(e.target.value))}
                          className="h-7 text-xs font-mono"
                          style={{
                            background: "hsla(228,35%,5%,0.8)",
                            border: "1px solid hsla(228,25%,15%,0.8)"
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-[8px] font-mono uppercase tracking-widest mb-1 text-white/25">Duration (min)</div>
                        <Input
                          type="number"
                          value={step.durationMinutes}
                          onChange={e => updateStep(index, 'durationMinutes', Number(e.target.value))}
                          className="h-7 text-xs font-mono"
                          style={{
                            background: "hsla(228,35%,5%,0.8)",
                            border: "1px solid hsla(228,25%,15%,0.8)"
                          }}
                        />
                      </div>
                    </div>

                    <button
                      className="p-1.5 rounded shrink-0 transition-all"
                      style={{
                        background: "transparent",
                        border: "1px solid transparent",
                        color: "hsla(0,60%,45%,0.35)"
                      }}
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
