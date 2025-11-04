import { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useGroupConfig } from '../context/GroupContext';
import { db } from '../services/firebase';
import { useShareTarget } from '../hooks/useShareTarget';

const guessOptions = [1, 2, 3, 4, 5, 6, 7];

export const ScoreForm: React.FC<{ puzzleDate: string }> = ({ puzzleDate }) => {
  const { id: groupId } = useGroupConfig();
  const [playerName, setPlayerName] = useState('');
  const [guesses, setGuesses] = useState<number>(4);
  const [pattern, setPattern] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [shareApplied, setShareApplied] = useState(false);
  const { payload: sharePayload, active: shareActive } = useShareTarget();

  useEffect(() => {
    if (!sharePayload || shareApplied) {
      return;
    }

    const textToUse = sharePayload.raw ?? sharePayload.pattern;
    if (textToUse) {
      setPattern(textToUse);
    }
    if (typeof sharePayload.guesses === 'number' && !Number.isNaN(sharePayload.guesses)) {
      setGuesses(sharePayload.guesses);
    }
    setShareApplied(true);
  }, [sharePayload, shareApplied]);

  const reset = () => {
    setPlayerName('');
    setGuesses(4);
    setPattern('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!playerName.trim()) {
      setError('Please add your name.');
      return;
    }

    try {
      setStatus('saving');
      setError(null);
      await addDoc(collection(db, 'groups', groupId, 'scores'), {
        playerName: playerName.trim(),
        guesses,
        pattern: pattern.trim(),
        puzzleDate,
        createdAt: serverTimestamp(),
        revealed: false,
      });
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Could not save score. Try again.');
    }
  };

  return (
    <div className="card">
      <div className="badge">Submit your score</div>
      <h2>Wordle escrow drop-off</h2>
      {shareActive && (
        <p className="notice" role="status">
          Imported your Wordle share{sharePayload?.puzzleNumber ? ` for puzzle #${sharePayload.puzzleNumber}` : ''}.{' '}
          Confirm the details and add your name before submitting.
        </p>
      )}
      <form className="grid" onSubmit={handleSubmit}>
        <label>
          <span>Player name</span>
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Taylor Swiftle"
            required
          />
        </label>
        <label>
          <span>Guesses used</span>
          <select value={guesses} onChange={(event) => setGuesses(Number(event.target.value))}>
            {guessOptions.map((guess) => (
              <option value={guess} key={guess}>
                {guess === 7 ? 'X (failed)' : guess}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>NYT share pattern (optional)</span>
          <textarea
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder={'Wordle 123 4/6\n\n⬛⬛🟩⬛🟨\n🟨🟨⬛⬛🟩\n🟩🟩🟩🟩🟩'}
            rows={4}
          />
        </label>
        <button type="submit" className="primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Securing your score…' : 'Submit score'}
        </button>
        {status === 'success' && <p role="status">Score stashed in the vault. 🤫</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  );
};
