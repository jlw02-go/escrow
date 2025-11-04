import { format } from 'date-fns';
import { PlayerScore } from '../types';

export const ScoreList: React.FC<{ scores: PlayerScore[]; isRevealed: boolean; countdown: string }> = ({
  scores,
  isRevealed,
  countdown,
}) => {
  return (
    <div className="card">
      <div className="badge">Today's submissions</div>
      <h2>{isRevealed ? 'Results unlocked!' : `Vault opens in ${countdown}`}</h2>
      {scores.length === 0 && <p>No one has checked in yet. Be the first to stash your score!</p>}
      <div className="score-list">
        {scores.map((score) => {
          const created = format(new Date(score.createdAt), 'h:mm aaa');
          return (
            <div className="score-item" key={score.id}>
              <div className="score-item__details">
                <span className="score-item__name">{score.playerName}</span>
                <span className="score-item__guesses">
                  {isRevealed
                    ? `${score.guesses === 7 ? 'X' : score.guesses}/6 · submitted ${created}`
                    : `Locked · submitted ${created}`}
                </span>
              </div>
              {isRevealed && score.pattern && (
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono, "Fira Code", monospace)' }}>
                  {score.pattern}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
