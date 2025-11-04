import { useSummary } from '../hooks/useSummary';
import { PlayerScore } from '../types';

export const SummaryPanel: React.FC<{ scores: PlayerScore[]; puzzleDate: string; isRevealed: boolean }> = ({
  scores,
  puzzleDate,
  isRevealed,
}) => {
  const { summary, loading, error, refresh } = useSummary(scores, puzzleDate, isRevealed);

  return (
    <div className="card">
      <div className="badge">AI host</div>
      <h2>Group recap</h2>
      <p className="summary-text">{summary}</p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <button className="secondary" onClick={() => refresh()} disabled={loading}>
          {loading ? 'Punching up jokes…' : 'Regenerate summary'}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};
