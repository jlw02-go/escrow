# Wordle Escrow

A Netlify-ready React app that keeps your Wordle group honest. Players submit their daily scores to a Firebase-powered vault. Results unlock for everyone together—once all players have submitted or the clock strikes 7PM CST. When the vault opens, the app:

- reveals the full scoreboard without spoiling anyone's puzzle early,
- generates a playful AI recap of the day,
- tracks group performance trends over time, and
- lets the crew celebrate or commiserate with curated GIFs.

## Tech stack

- **React + Vite** for the UI
- **Firebase** (Firestore + Auth) for realtime data and security rules
- **Netlify Functions** for the AI summary endpoint
- **OpenAI Responses API** (or a fallback summarizer) for witty recaps
- **Giphy API** for GIF search results

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your environment file**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the Firebase config, a Giphy API key, and (optionally) an OpenAI API key.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Netlify Dev (`netlify dev`) also works if you want the serverless function locally.

4. **Build for production**
   ```bash
   npm run build
   ```

## Android share-to-app workflow

The app is installable as a Progressive Web App (PWA). Once a player installs it on Android (via Chrome's “Add to Home screen”),
it becomes an option inside the native share sheet. Players can now open the NYT Wordle game, tap **Share**, and select
**Wordle Escrow**. The app automatically:

- Captures the shared grid/text via the Web Share Target API,
- Prefills the submission form with the emoji pattern and number of guesses, and
- Prompts the player to add their name before saving to the escrow vault.

Behind the scenes this works through the `manifest.webmanifest` share target configuration, a lightweight service worker, and a
React hook (`useShareTarget`) that parses the incoming payload.

## Firebase setup

1. Create a Firebase project and enable **Firestore** in production mode.
2. Create a web app in Firebase Console and copy the config into `.env.local`.
3. Create the following collections:
   - `groups/{groupId}` documents that define:
     ```json
     {
       "name": "Daily Wordle Circle",
       "memberCount": 4,
       "dailyRevealTimeCST": "19:00"
     }
     ```
   - `groups/{groupId}/scores` for daily score submissions (the app writes to this).
   - `groups/{groupId}/metadata/stats` for aggregate stats (populate with Cloud Functions, scheduled jobs, or manual scripts).
4. Optional: set up Firebase Authentication if you want verified sign-ins. The UI ships without auth gating but you can add it easily around the form and scoreboard.

### Firestore rules (starter snippet)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read: if true;

      match /scores/{scoreId} {
        allow create: if request.resource.data.playerName is string &&
                       request.resource.data.guesses is int &&
                       request.resource.data.puzzleDate is string;
        allow read: if true;
      }

      match /metadata/{docId} {
        allow read: if true;
        allow write: if false; // updated via Cloud Functions or admin scripts
      }
    }
  }
}
```

## Netlify & OpenAI

- Deploy the repo to Netlify. The included `netlify.toml` points the build to Vite and exposes the serverless function.
- Add environment variables in Netlify:
  - `VITE_FIREBASE_*` (matching the `.env.example` names)
  - `VITE_GIPHY_API_KEY`
  - `OPENAI_API_KEY` (if you want AI-powered recaps)
- Without an OpenAI key, the summary function falls back to a locally generated quip.

## Tracking stats over time

The UI listens for updates in `groups/{groupId}/metadata/stats`. To keep that document current you can:

- write a Firebase Cloud Function that aggregates stats whenever a score is created,
- schedule a daily job (Cloud Scheduler + HTTP function) to recompute historical streaks, or
- maintain the stats offline and upload them periodically.

The expected shape is:

```json
{
  "averageGuesses": 3.7,
  "bestStreak": 12,
  "totalGames": 154,
  "distribution": {"2": 10, "3": 40, "4": 70, "5": 25, "6": 8, "7": 1},
  "lastUpdated": "2024-05-12T12:30:00.000Z"
}
```

## GIF search

The home page includes a Giphy-powered search panel. The search happens client-side; make sure you enable the Giphy API key for browser use or proxy it through your own function if you need to hide it.

## Roadmap ideas

- Lock the submission form until the current user signs in.
- Allow multiple groups with invites and join codes.
- Display richer streak insights per player.
- Trigger celebratory confetti when someone hits a two-guess solve.

Have fun keeping your Wordle crew spoiler-free!
