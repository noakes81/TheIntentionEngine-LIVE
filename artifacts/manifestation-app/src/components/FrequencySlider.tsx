import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FrequencySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function FrequencySlider({ value, onChange }: FrequencySliderProps) {
  // We use a logarithmic scale for the slider so small frequencies are easy to select
  // Min: 0.6, Max: 1000
  // log(0.6) approx -0.22, log(1000) = 3
  
  const minLog = Math.log10(0.6);
  const maxLog = Math.log10(1000);
  
  const toLog = (val: number) => {
    const clamped = Math.max(0.6, Math.min(1000, val));
    return ((Math.log10(clamped) - minLog) / (maxLog - minLog)) * 100;
  };
  
  const fromLog = (sliderVal: number) => {
    const logVal = minLog + (sliderVal / 100) * (maxLog - minLog);
    return Math.pow(10, logVal);
  };

  const handleSliderChange = (vals: number[]) => {
    const newVal = fromLog(vals[0]);
    // Round to 1 decimal place for small numbers, integers for larger
    const rounded = newVal < 10 ? Math.round(newVal * 10) / 10 : Math.round(newVal);
    onChange(rounded);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  const handleInputBlur = () => {
    const clamped = Math.max(0.6, Math.min(1000, value));
    onChange(clamped);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Frequency (Hz)</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            min={0.6} 
            max={1000} 
            step="any"
            value={value} 
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-24 font-mono text-right bg-background/50 border-primary/20 focus-visible:ring-primary/50"
          />
          <span className="text-sm text-muted-foreground font-mono">Hz</span>
        </div>
      </div>
      
      <div className="relative pt-4">
        <Slider 
          value={[toLog(value)]} 
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="py-4 cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
          <span>0.6</span>
          <span>10</span>
          <span>100</span>
          <span>1000</span>
        </div>
      </div>
    </div>
  );
}
