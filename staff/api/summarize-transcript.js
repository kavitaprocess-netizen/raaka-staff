// Vercel serverless function — POST /api/summarize-transcript
//
// The frontend (Staff Dashboard and Owner Dashboard's "Session transcript
// ✦ AI summary" feature) used to call api.anthropic.com directly from the
// browser with no API key at all. That only ever worked inside a Claude.ai
// artifact sandbox, which proxies that specific call — it silently fails
// on a real deployed site like this one, since there's no key attached and
// the request likely gets blocked by CORS besides.
//
// This function is the real fix: it runs server-side on Vercel, holds the
// actual API key as an environment variable (never sent to the browser),
// and does the real Anthropic call on the frontend's behalf. The frontend
// just POSTs the transcript text here and gets the same summary JSON shape
// back that it always expected.
//
// Deploy this file at api/summarize-transcript.js in BOTH the Staff and
// Owner Vercel projects (each dashboard calls its own project's copy of
// this endpoint) — and set ANTHROPIC_API_KEY as a real environment
// variable in each project's Settings → Environment Variables. Without
// that env var set, this function returns a clear 500 error rather than
// failing silently.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed — use POST.' });
    return;
  }

  const { transcript } = req.body || {};
  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    res.status(400).json({ error: 'Missing or empty transcript.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Deliberately explicit rather than a generic 500 — this is the
    // single most likely setup mistake (function deployed, env var
    // forgotten), and a vague error here would send someone straight
    // back to debugging the frontend instead of Vercel's env var settings.
    res.status(500).json({ error: 'Server is not configured with an Anthropic API key (ANTHROPIC_API_KEY env var missing).' });
    return;
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: "You're helping a wellness practitioner (yoga, breathwork, or Ayurvedic consultation) turn a raw session transcript into a very brief summary for their own records — speed matters more than completeness here, since they may be reading this between sessions. Return ONLY a JSON object (no markdown, no preamble, no code fences) with this exact shape:\n" +
            '{"keyPoints": ["...", "..."], "areasAddressed": "short comma-separated phrase or empty string", "recommendations": ["...", "..."], "wellnessThemes": "one short soft phrase noting any stress, sleep, or tension themes that came up, or empty string if none — never invent a numeric score"}\n' +
            "Keep keyPoints to 2-4 very short bullets (under 10 words each) covering only what actually came up, not generic wellness advice. Keep recommendations to at most 2 short bullets, only what the practitioner actually said they'd suggest. Be terse everywhere — this is a quick glance-back, not a report. If the transcript doesn't support a field, use an empty string or empty array rather than guessing.\n\nTranscript:\n" + transcript
        }]
      })
    });

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text().catch(() => '');
      console.error('Anthropic API error:', anthropicResponse.status, errBody);
      res.status(502).json({ error: 'The AI summary service returned an error (status ' + anthropicResponse.status + ').' });
      return;
    }

    const data = await anthropicResponse.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();

    let summary;
    try {
      summary = JSON.parse(clean);
    } catch (parseErr) {
      console.error('Could not parse AI response as JSON:', text);
      res.status(502).json({ error: 'The AI summary came back in an unexpected format.' });
      return;
    }

    res.status(200).json({ summary });
  } catch (err) {
    console.error('summarize-transcript function error:', err);
    res.status(500).json({ error: 'Unexpected server error generating the summary.' });
  }
}
