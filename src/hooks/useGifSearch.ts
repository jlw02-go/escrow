import { useCallback, useState } from 'react';
import { GifResult } from '../types';

const API_BASE = 'https://api.giphy.com/v1/gifs/search';

export const useGifSearch = () => {
  const [query, setQuery] = useState('wordle');
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (nextQuery?: string) => {
      const searchTerm = nextQuery ?? query;
      if (!searchTerm) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: searchTerm,
          api_key: import.meta.env.VITE_GIPHY_API_KEY,
          limit: '12',
        });
        const response = await fetch(`${API_BASE}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Unable to fetch GIFs');
        }
        const json = (await response.json()) as { data: Array<Record<string, any>> };
        const mapped = json.data.map((item) => ({
          id: String(item.id),
          title: String(item.title ?? ''),
          url: String(item.url ?? ''),
          previewUrl: String(item.images?.downsized_medium?.url ?? item.images?.original?.url ?? ''),
        })) as GifResult[];
        setResults(mapped);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  };
};
