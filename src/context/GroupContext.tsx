import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { GroupConfig } from '../types';
import { db } from '../services/firebase';

const DEFAULT_GROUP_ID = 'default-group';

const GroupConfigContext = createContext<GroupConfig | null>(null);

export const useGroupConfig = () => {
  const context = useContext(GroupConfigContext);
  if (!context) {
    throw new Error('useGroupConfig must be used within GroupConfigProvider');
  }
  return context;
};

export const GroupConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({
    id: DEFAULT_GROUP_ID,
    name: 'Daily Wordle Circle',
    memberCount: 4,
    dailyRevealTimeCST: '19:00',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'groups', DEFAULT_GROUP_ID), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<GroupConfig>;
        setGroupConfig((prev) => ({
          ...prev,
          ...data,
          id: DEFAULT_GROUP_ID,
          memberCount: data.memberCount ?? prev.memberCount,
          dailyRevealTimeCST: data.dailyRevealTimeCST ?? prev.dailyRevealTimeCST,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  return <GroupConfigContext.Provider value={groupConfig}>{children}</GroupConfigContext.Provider>;
};
