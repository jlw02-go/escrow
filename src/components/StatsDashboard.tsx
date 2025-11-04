import { formatDistanceToNow } from 'date-fns';
import { useGroupStats } from '../hooks/useGroupStats';

export const StatsDashboard: React.FC = () => {
  const { stats, loading } = useGroupStats();

  const distributionEntries = Object.entries(stats.distribution).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <div className="card">
      <div className="badge">Group pulse</div>
      <h2>Performance trends</h2>
      {loading ? (
        <p>Crunching the numbers…</p>
      ) : (
        <div className="grid">
          <div>
            <strong>Average guesses</strong>
            <p>{stats.averageGuesses.toFixed(2)}</p>
          </div>
          <div>
            <strong>Best streak</strong>
            <p>{stats.bestStreak} days</p>
          </div>
          <div>
            <strong>Total games tracked</strong>
            <p>{stats.totalGames}</p>
          </div>
          <div>
            <strong>Last updated</strong>
            <p>{stats.lastUpdated ? formatDistanceToNow(new Date(stats.lastUpdated), { addSuffix: true }) : '—'}</p>
          </div>
          <div>
            <strong>Guess distribution</strong>
            <ul>
              {distributionEntries.length === 0 && <li>Submit a few games to unlock insights.</li>}
              {distributionEntries.map(([guessCount, total]) => (
                <li key={guessCount}>
                  {guessCount === '7' ? 'X' : guessCount} guesses · {total}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
