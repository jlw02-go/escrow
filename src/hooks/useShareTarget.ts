import { useEffect, useMemo, useState } from 'react';
import { parseWordleShare, WordleSharePayload } from '../utils/wordleShare';

type ShareTargetState = {
  payload: WordleSharePayload | null;
  active: boolean;
};

const readShareText = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const url = new URL(window.location.href);
  const textParam = url.searchParams.get('text') ?? url.searchParams.get('body');
  const titleParam = url.searchParams.get('title');

  if (!textParam && !titleParam) {
    return null;
  }

  // Clean up the URL so refreshes do not keep rehydrating share content
  const hash = url.hash ? url.hash : '';
  window.history.replaceState({}, document.title, '/' + (hash ? hash : ''));

  const combined = [titleParam, textParam].filter(Boolean).join('\n\n');
  return combined.trim();
};

export const useShareTarget = () => {
  const [{ payload, active }, setState] = useState<ShareTargetState>({
    payload: null,
    active: false,
  });

  useEffect(() => {
    const sharedText = readShareText();
    if (sharedText) {
      setState({
        payload: parseWordleShare(sharedText),
        active: true,
      });
    }
  }, []);

  return useMemo(
    () => ({
      payload,
      active,
    }),
    [payload, active],
  );
};
