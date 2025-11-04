import { useCallback, useEffect, useState } from 'react';
import { PlayerScore } from '../types';
import { useGroupConfig } from '../context/GroupContext';

export const useSummary = (scores: PlayerScore[], puzzleDate: string, isRevealed: boolean) => {
  const { id: groupId } = useGroupConfig();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isRevealed || !scores.length) {
      setSummary('Scores are still locked. Hang tight!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/generateSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scores, puzzleDate, groupId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI summary');
      }

      const data = (await response.json()) as { summary: string };
      setSummary(data.summary);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSummary('Our AI host tripped over a vowel. Try again soon.');
    } finally {
      setLoading(false);
    }
  }, [groupId, isRevealed, puzzleDate, scores]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
};
