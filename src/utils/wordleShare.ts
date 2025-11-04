export interface WordleSharePayload {
  puzzleNumber?: number;
  guesses?: number;
  pattern?: string;
  raw?: string;
}

const headerPattern = /Wordle\s+(\d+)\s+([0-6Xx])\/6\*?/i;

const extractPattern = (text: string) => {
  const parts = text.split(/\n{2,}/);
  if (parts.length < 2) {
    return text;
  }
  const [, patternSection] = parts;
  return patternSection.trim();
};

export const parseWordleShare = (text: string): WordleSharePayload => {
  if (!text) {
    return { raw: text };
  }

  const normalized = text.trim();
  const match = normalized.match(headerPattern);
  let guesses: number | undefined;

  if (match) {
    const [, puzzleNumber, guessToken] = match;
    if (puzzleNumber) {
      const parsedPuzzle = Number.parseInt(puzzleNumber, 10);
      if (!Number.isNaN(parsedPuzzle)) {
        if (guessToken.toUpperCase() === 'X') {
          guesses = 7;
        } else {
          const parsedGuesses = Number.parseInt(guessToken, 10);
          guesses = Number.isNaN(parsedGuesses) ? undefined : parsedGuesses;
        }
        return {
          puzzleNumber: parsedPuzzle,
          guesses,
          pattern: extractPattern(normalized),
          raw: normalized,
        };
      }
    }
  }

  return {
    raw: normalized,
    pattern: extractPattern(normalized),
    guesses,
  };
};
