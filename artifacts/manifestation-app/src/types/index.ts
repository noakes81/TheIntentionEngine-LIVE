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

export type RadionicRate = [number, number, number]; // three dials 0-9

export type Operation = {
  id: string;
  name: string;
  // TREND
  intention: string;           // trend statement
  trendRate: RadionicRate;     // 3-dial radionic rate for trend
  // TARGET
  target: {
    name: string;
    description: string;
    photo?: string;
    photoNote?: string;
    transferDiagram?: string;
  };
  targetRate: RadionicRate;    // 3-dial radionic rate for target
  structuralLinkType?: "photo" | "name" | "written" | "transfer";
  // Chi / frequency
  frequencyHz: number;
  // Cards
  cards: string[];             // position-wide filter cards
  trendCardIds?: string[];     // symbolic cards for the TREND specifically
  customTrendCardImage?: string; // user-uploaded sigil/image as trend card (base64)
  trendRateLocked?: boolean;
  targetRateLocked?: boolean;
  presetName?: string;
  // Session
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
