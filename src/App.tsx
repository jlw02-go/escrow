import { ScoreForm } from './components/ScoreForm';
import { ScoreList } from './components/ScoreList';
import { SummaryPanel } from './components/SummaryPanel';
import { GifBoard } from './components/GifBoard';
import { StatsDashboard } from './components/StatsDashboard';
import { GroupConfigProvider, useGroupConfig } from './context/GroupContext';
import { useScores } from './hooks/useScores';

const Dashboard: React.FC = () => {
  const { name } = useGroupConfig();
  const { scores, loading, error, puzzleDate, isRevealed, countdown, everyoneSubmitted } = useScores();

  return (
    <main className="main-app">
      <header style={{ background: '#0f172a', color: 'white', padding: '2.5rem 0' }}>
        <div className="container">
          <span className="tag">Wordle escrow</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{name}</h1>
          <p style={{ maxWidth: '620px', color: 'rgba(255,255,255,0.85)' }}>
            Park your daily Wordle results in a safe vault. Everyone&apos;s shareable grids unlock together at 7pm CST or when the
            whole crew has submitted. Stats, smack talk, and celebratory GIFs included.
          </p>
        </div>
      </header>
      <section className="container" aria-live="polite">
        {error && <div className="card">{error}</div>}
        <div className="grid dashboard-grid">
          <div className="grid">
            <ScoreForm puzzleDate={puzzleDate} />
            <ScoreList scores={scores} isRevealed={isRevealed} countdown={countdown} />
            <SummaryPanel scores={scores} puzzleDate={puzzleDate} isRevealed={isRevealed} />
            <GifBoard />
          </div>
          <StatsDashboard />
        </div>
        {!isRevealed && everyoneSubmitted && (
          <div className="card">
            <p>Everyone has submitted! The vault will open momentarily.</p>
          </div>
        )}
        {loading && <div className="card">Loading today&apos;s entries…</div>}
      </section>
      <footer style={{ marginTop: 'auto', padding: '3rem 0', textAlign: 'center', color: '#475569' }}>
        <p>
          Built for friendly Wordle rivalries. Deploy on Netlify, back it with Firebase, and keep the streak alive.
        </p>
      </footer>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <GroupConfigProvider>
      <Dashboard />
    </GroupConfigProvider>
  );
};

export default App;
