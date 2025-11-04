export type PlayerScore = {
  id: string;
  groupId: string;
  playerName: string;
  guesses: number;
  pattern: string;
  puzzleDate: string; // ISO string (YYYY-MM-DD)
  createdAt: string; // ISO timestamp
  revealed: boolean;
};

export type GroupConfig = {
  id: string;
  name: string;
  memberCount: number;
  dailyRevealTimeCST: string; // HH:mm format
};

export type GroupStats = {
  averageGuesses: number;
  bestStreak: number;
  totalGames: number;
  distribution: Record<number, number>;
  lastUpdated: string;
};

export type GifResult = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
};
