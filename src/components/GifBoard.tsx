import { useEffect } from 'react';
import { useGifSearch } from '../hooks/useGifSearch';

export const GifBoard: React.FC = () => {
  const { query, setQuery, results, loading, error, search } = useGifSearch();

  useEffect(() => {
    search();
  }, [search]);

  return (
    <div className="card">
      <div className="badge">GIF lounge</div>
      <h2>Celebrate (or commiserate) with GIFs</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          search(query);
        }}
        className="grid"
      >
        <label>
          <span>Search tenor-worthy GIFs</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="green squares" />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <div className="gif-grid">
        {results.map((gif) => (
          <a key={gif.id} href={gif.url} target="_blank" rel="noreferrer">
            <img src={gif.previewUrl} alt={gif.title} loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
};
