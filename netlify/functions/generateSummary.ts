import type { Handler } from '@netlify/functions';

const systemPrompt = `You are the witty host of a Wordle results show. Keep things playful, short (under 120 words), and mention standout performances, struggles, and overall vibe.`;

type ScorePayload = {
  playerName: string;
  guesses: number;
  pattern: string;
};

type RequestBody = {
  scores: ScorePayload[];
  puzzleDate: string;
  groupId: string;
};

const fallbackSummary = (scores: ScorePayload[], puzzleDate: string) => {
  if (!scores.length) {
    return `No scores for ${puzzleDate} yet. The host is pacing backstage.`;
  }
  const sorted = [...scores].sort((a, b) => a.guesses - b.guesses);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const average = scores.reduce((acc, score) => acc + Math.min(score.guesses, 6), 0) / scores.length;
  return `On ${puzzleDate}, ${best.playerName} solved it in ${best.guesses === 7 ? 'X tries (ouch)' : `${best.guesses} guesses`} while ${worst.playerName} held the suspense until the end. Group average: ${average.toFixed(2)}. Someone please check on the person still seeing gray squares.`;
};

const buildPrompt = (scores: ScorePayload[], puzzleDate: string, groupId: string) => {
  const scoreboard = scores
    .map(
      (score) =>
        `${score.playerName}: ${score.guesses === 7 ? 'X' : score.guesses}/6${score.pattern ? ` pattern: ${score.pattern.replace(/\n/g, ' ')}` : ''}`,
    )
    .join('\n');

  return `Group ${groupId} results for Wordle on ${puzzleDate}:\n${scoreboard}\nCreate a humorous recap. Avoid revealing hints for future puzzles.`;
};

const callOpenAI = async (prompt: string) => {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
      max_output_tokens: 300,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI error', await response.text());
    throw new Error('Failed to generate summary');
  }

  const data = (await response.json()) as { output: Array<{ content: Array<{ text?: string }> }> };
  const text = data.output?.[0]?.content?.[0]?.text;
  return text ?? null;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body ?? '{}') as RequestBody;
    const { scores = [], puzzleDate, groupId } = body;
    if (!puzzleDate || !groupId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const prompt = buildPrompt(scores, puzzleDate, groupId);
    let summary: string | null = null;
    try {
      summary = await callOpenAI(prompt);
    } catch (err) {
      console.error(err);
    }

    if (!summary) {
      summary = fallbackSummary(scores, puzzleDate);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ summary }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate summary' }),
    };
  }
};
