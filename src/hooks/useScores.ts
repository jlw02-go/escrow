import { useEffect, useMemo, useState } from 'react';
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { zonedTimeToUtc } from 'date-fns-tz';
import { db } from '../services/firebase';
import { PlayerScore } from '../types';
import { useGroupConfig } from '../context/GroupContext';

const todayInChicago = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const buildRevealDate = (puzzleDate: string, revealTime: string) => {
  const [hour = '19', minute = '00'] = revealTime.split(':');
  const zoned = `${puzzleDate}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00.000`;
  return zonedTimeToUtc(zoned, 'America/Chicago');
};

export const useScores = (puzzleDateParam?: string) => {
  const { id: groupId, memberCount, dailyRevealTimeCST } = useGroupConfig();
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const puzzleDate = puzzleDateParam ?? todayInChicago();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    const scoresQuery = query(
      collection(db, 'groups', groupId, 'scores'),
      where('puzzleDate', '==', puzzleDate),
      orderBy('createdAt', 'asc'),
    );

    const unsubscribe = onSnapshot(
      scoresQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const createdAt = data.createdAt as Timestamp | undefined;
          return {
            id: docSnap.id,
            groupId,
            playerName: String(data.playerName ?? 'Unknown'),
            guesses: Number(data.guesses ?? 0),
            pattern: String(data.pattern ?? ''),
            puzzleDate: String(data.puzzleDate ?? puzzleDate),
            createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
            revealed: Boolean(data.revealed ?? false),
          } satisfies PlayerScore;
        });
        setScores(mapped);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [groupId, puzzleDate]);

  const revealDate = useMemo(
    () => buildRevealDate(puzzleDate, dailyRevealTimeCST ?? '19:00'),
    [puzzleDate, dailyRevealTimeCST],
  );

  const shouldRevealByTime = useMemo(() => {
    return new Date(now) >= revealDate;
  }, [revealDate, now]);

  const everyoneSubmitted = useMemo(() => {
    if (!memberCount) return false;
    return scores.length >= memberCount;
  }, [scores, memberCount]);

  const isRevealed = useMemo(() => shouldRevealByTime || everyoneSubmitted, [shouldRevealByTime, everyoneSubmitted]);

  const countdown = useMemo(() => {
    if (isRevealed) {
      return 'Scores visible';
    }
    const diff = revealDate.getTime() - now;
    if (diff <= 0) {
      return 'Scores visible';
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [isRevealed, revealDate, now]);

  const visibleScores = useMemo(() => {
    if (isRevealed) {
      return scores.map((score) => ({ ...score, revealed: true }));
    }
    return scores.map((score) => ({ ...score, revealed: false }));
  }, [scores, isRevealed]);

  return {
    scores: visibleScores,
    loading,
    error,
    puzzleDate,
    isRevealed,
    countdown,
    everyoneSubmitted,
  };
};
