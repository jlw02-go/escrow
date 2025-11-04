import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useGroupConfig } from '../context/GroupContext';
import { GroupStats } from '../types';
import { db } from '../services/firebase';

const defaultStats: GroupStats = {
  averageGuesses: 0,
  bestStreak: 0,
  totalGames: 0,
  distribution: {},
  lastUpdated: new Date(0).toISOString(),
};

export const useGroupStats = () => {
  const { id: groupId } = useGroupConfig();
  const [stats, setStats] = useState<GroupStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'groups', groupId, 'metadata', 'stats'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<GroupStats>;
        setStats({ ...defaultStats, ...data });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  return { stats, loading };
};
