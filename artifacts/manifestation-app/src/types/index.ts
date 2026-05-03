export type SymbolicCard = {
  id: string;
  title: string;
  category: "chakra" | "solfeggio" | "protection" | "manifestation" | "elements" | "numerology" | string;
  symbol: string;
  description: string;
  frequency?: number;
  favorited: boolean;
};

export type TrendCard = {
  id: string;
  title: string;
  intention: string;
  color: string;
};

export type Operation = {
  id: string;
  name: string;
  intention: string;
  target: { name: string; description: string; photoNote?: string };
  frequencyHz: number;
  cards: string[]; // card IDs
  trendCards: TrendCard[];
  presetName?: string;
  status: "idle" | "running" | "paused" | "completed";
  sessionDurationMinutes: number;
  elapsedSeconds: number;
  createdAt: string;
  lastRunAt?: string;
  notes?: string;
};

export type SequencerStep = {
  id: string;
  label: string;
  frequencyHz: number;
  durationMinutes: number;
};

export type SequencerSession = {
  id: string;
  name: string;
  steps: SequencerStep[];
};
