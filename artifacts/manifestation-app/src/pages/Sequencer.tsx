import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Square, Plus, Trash2, GripVertical } from "lucide-react";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { SequencerStep } from "@/types";

export default function Sequencer() {
  const [steps, setSteps] = useState<SequencerStep[]>([
    { id: 's1', label: 'Grounding', frequencyHz: 396, durationMinutes: 5 },
    { id: 's2', label: 'Transformation', frequencyHz: 417, durationMinutes: 10 },
    { id: 's3', label: 'Miracle', frequencyHz: 528, durationMinutes: 15 },
  ]);
  
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [status, setStatus] = useState<'idle'|'running'|'paused'>('idle');
  
  // Calculate total duration
  const totalDuration = steps.reduce((acc, step) => acc + step.durationMinutes, 0);
  
  const { elapsedSeconds, formattedTime, start, pause, stop, reset } = useSessionTimer(0);

  // Sequencer logic
  useEffect(() => {
    if (status === 'running') {
      start();
      
      // Determine which step we're on based on elapsed time
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
      
      // Sequence completed
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

  const updateStep = (index: number, field: keyof SequencerStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header>
        <h1 className="text-4xl font-serif text-primary tracking-tight">Frequency Sequencer</h1>
        <p className="text-muted-foreground mt-2">Chain multiple frequencies into a continuous energetic journey.</p>
      </header>

      <Card className="glass-card p-8 border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 rounded-full border-4 border-primary/10 flex flex-col items-center justify-center relative bg-background/50 shadow-inner">
            {status === 'running' && (
              <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping opacity-20 pointer-events-none" />
            )}
            <span className="text-4xl font-mono text-foreground">{formattedTime}</span>
            <span className="text-sm text-muted-foreground mt-1">/ {totalDuration}:00</span>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif">
                  {status === 'idle' ? 'Ready to Sequence' : 
                   activeStepIndex >= 0 ? steps[activeStepIndex].label : 'Complete'}
                </h2>
                <p className="text-primary font-mono text-lg mt-1">
                  {activeStepIndex >= 0 ? `${steps[activeStepIndex].frequencyHz} Hz` : '---'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className={`w-14 h-14 rounded-full ${status === 'running' ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(157,78,221,0.4)]'}`}
                  onClick={togglePlayback}
                >
                  {status === 'running' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-14 h-14 rounded-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={stopPlayback}
                  disabled={status === 'idle'}
                >
                  <Square className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="h-24 bg-background/50 rounded-xl border border-border/50 p-4">
              <WaveformVisualizer 
                active={status === 'running'} 
                frequency={activeStepIndex >= 0 ? steps[activeStepIndex].frequencyHz : 432} 
              />
            </div>
            
            {/* Overall Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear"
                style={{ width: `${totalDuration > 0 ? Math.min((elapsedSeconds / (totalDuration * 60)) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif">Sequence Timeline</h3>
          <Button variant="outline" size="sm" onClick={addStep} className="gap-2 border-primary/20 hover:bg-primary/10">
            <Plus className="w-4 h-4" /> Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = activeStepIndex === index;
            
            return (
              <Card 
                key={step.id} 
                className={`p-4 flex flex-col md:flex-row items-center gap-4 transition-all duration-300 ${
                  isActive ? 'border-primary shadow-[0_0_15px_rgba(157,78,221,0.2)] bg-primary/5' : 'bg-background/40 hover:bg-background border-border/40'
                }`}
              >
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Label</Label>
                    <Input 
                      value={step.label} 
                      onChange={(e) => updateStep(index, 'label', e.target.value)}
                      className="h-9 bg-transparent border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Freq (Hz)</Label>
                    <Input 
                      type="number"
                      value={step.frequencyHz} 
                      onChange={(e) => updateStep(index, 'frequencyHz', Number(e.target.value))}
                      className="h-9 bg-transparent border-border/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Duration (Min)</Label>
                    <Input 
                      type="number"
                      value={step.durationMinutes} 
                      onChange={(e) => updateStep(index, 'durationMinutes', Number(e.target.value))}
                      className="h-9 bg-transparent border-border/50 font-mono"
                    />
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeStep(index)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
