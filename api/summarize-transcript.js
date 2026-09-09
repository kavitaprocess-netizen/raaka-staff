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
// Deploy this SINGLE self-contained file at api/summarize-transcript.js
// in BOTH the Staff and Owner Vercel projects (each dashboard calls its
// own project's copy of this endpoint) — and set ANTHROPIC_API_KEY as a
// real environment variable in each project's Settings → Environment
// Variables. Without that env var set, this function returns a clear
// 500 error rather than failing silently.
//
// The taxonomy reference below used to live in a separate _taxonomy.js
// file imported from here — merged inline instead after a live 500 error
// (Vercel returning its own generic crash page, not our JSON error
// response, meaning the function failed before our own code even ran).
// Most likely cause: Vercel's handling of underscore-prefixed files
// (intentionally excluded from becoming their own route) also excluded
// it from being bundled as an imported dependency. Inlining removes that
// risk entirely — this file has zero local dependencies now.

const TAXONOMY = `
YOGA
Poses/asanas: Downward Dog, Child's Pose, Cat-Cow, Warrior I/II/III, Triangle Pose, Pigeon Pose,
Bridge Pose, Cobra Pose, Seated Forward Fold, Corpse Pose (Savasana), Sun Salutation (Surya
Namaskar), Tree Pose, Chair Pose.
Concepts: vinyasa (flow), asana, alignment, drishti (gaze point), bandha (energy lock), restorative
yoga, yin yoga, prana.
Common observations/complaints (start of session): tight hip flexors, hamstring tightness, shoulder
impingement, rounded shoulders, limited hip/shoulder mobility, lower back strain, sciatica, postural
imbalance.
Session outcomes/results (end of session): increased flexibility, improved range of motion, reduced
muscle tension, better postural alignment, increased body awareness, deeper breath capacity,
improved balance, greater ease in a pose, reduced pain/discomfort.
Practitioner phrasing (instructions/assessment, in their own voice): "let's work on opening the
hips," "engage your core," "find length through the spine," "let's modify this for your shoulder,"
"breathe into the stretch," "let's build strength in your legs today," "I want you to feel grounded
through your feet."
Follow-up self-report (returning client, reporting since last visit): "hip flexors feel looser,"
"lower back pain has eased," "been doing the stretches at home," "still tight in the same spot,"
"flexibility has improved since last time," "haven't had time to practice between sessions."

AYURVEDA
Doshas: Vata (air/space — movement, dryness, anxiety when aggravated), Pitta (fire/water —
transformation, heat, irritability/inflammation when aggravated), Kapha (earth/water — structure,
stability, lethargy/congestion when aggravated).
Concepts: Prakriti (natural constitution), Vikriti (current state/imbalance), Agni (digestive fire),
Ama (toxins/undigested residue), Dinacharya (daily routine practice), Abhyanga (self oil massage),
Panchakarma (detoxification therapies).
Common observations/complaints (start of session): dosha imbalance, aggravated vata/pitta/kapha,
digestive sluggishness (low agni), signs of ama buildup.
Session outcomes/results (end of session): improved digestion/agni, more balanced dosha state,
reduced vata/pitta/kapha aggravation, calmer nervous system, improved elimination, reduced bloating.
Practitioner phrasing (instructions/assessment, in their own voice): "this suggests a vata
imbalance," "let's work on grounding your energy," "I'd recommend warming, cooked foods this week,"
"your agni seems low today," "let's focus on calming excess pitta," "try an oil massage before bed."
Follow-up self-report (returning client, reporting since last visit): "digestion has been better,"
"sleep improved since starting the routine," "still feeling ungrounded/anxious," "skin has cleared
up," "energy levels more stable," "haven't been following the dinacharya routine consistently."

MASSAGE / BODYWORK
Techniques: Swedish massage, deep tissue, myofascial release, trigger point therapy, effleurage,
petrissage, cupping, hot stone.
Common observations/complaints (start of session): muscle knots/trigger points, fascial
restriction, adhesions, myalgia, reduced range of motion (ROM), delayed onset muscle soreness
(DOMS), postural imbalance, chronic tension.
Session outcomes/results (end of session): reduced muscle tension, improved range of motion,
decreased trigger point sensitivity, reduced pain, improved circulation, greater relaxation, reduced
stiffness.
Practitioner phrasing (instructions/assessment, in their own voice): "I'm going to apply some deeper
pressure here," "let's work on releasing this trigger point," "I'm noticing some tension in this
area," "let's focus on your shoulders today," "I'll use some myofascial release technique here,"
"let me know if the pressure is too much."
Follow-up self-report (returning client, reporting since last visit): "the knot in my shoulder feels
better," "pain has decreased since last session," "stiffness returned after a few days," "range of
motion has improved," "was sore for a day or two after last time."

BREATHWORK / PRANAYAMA
Techniques: diaphragmatic breathing, box breathing, alternate nostril breathing (Nadi Shodhana),
Kapalabhati (skull-shining breath), Ujjayi (ocean breath), 4-7-8 breathing, holotropic breathwork,
breath retention (kumbhaka).
Common observations/complaints (start of session): shallow/chest breathing, hyperventilation
tendency, nervous system dysregulation, low vagal tone.
Session outcomes/results (end of session): calmer nervous system, reduced anxiety, improved breath
capacity, greater relaxation, reduced racing thoughts, increased vagal tone/parasympathetic
activation.
Practitioner phrasing (instructions/assessment, in their own voice): "let's slow down your breath,"
"try to extend your exhale," "let's activate your parasympathetic response," "breathe deeply into
your belly," "let's try alternate nostril breathing today," "notice how your body feels as you
slow down."
Follow-up self-report (returning client, reporting since last visit): "sleep has improved since we
started," "still feel anxious, racing thoughts," "practicing the breathing exercises daily," "felt
calmer after last session but it faded," "stress levels have gone down."

MEDITATION & MINDFULNESS
Techniques: body scan, loving-kindness (Metta) meditation, guided visualization, mindfulness-based
stress reduction (MBSR), mantra meditation, walking meditation, transcendental meditation.
Common observations/complaints (start of session): racing/"monkey mind," rumination, difficulty
with present-moment awareness, stress reactivity.
Session outcomes/results (end of session): reduced stress reactivity, improved present-moment
awareness, calmer mental state, reduced rumination, greater emotional regulation, improved focus.
Practitioner phrasing (instructions/assessment, in their own voice): "let's bring awareness to the
present moment," "notice any thoughts without judgment," "let's try a body scan today," "let's work
on quieting the mind," "use your breath as an anchor," "just observe whatever comes up."
Follow-up self-report (returning client, reporting since last visit): "meditating daily since last
session," "mind still wanders a lot," "feeling calmer overall," "noticed less reactivity to stress,"
"haven't kept up the practice."

REIKI / ENERGY HEALING
Concepts: chakras (root, sacral, solar plexus, heart, throat, third eye, crown), aura, hands-on vs.
hands-off healing, distance/remote healing, Reiki attunement, universal life force energy
(Ki/Chi/Prana), energetic clearing.
Common observations/complaints (start of session): chakra blockage, energy imbalance, feeling
ungrounded, energetic heaviness or stagnation.
Session outcomes/results (end of session): reduced energetic heaviness, greater sense of
balance/grounding, sense of lightness or release, improved emotional clarity.
Practitioner phrasing (instructions/assessment, in their own voice): "I'm sensing some blockage in
your heart chakra," "let's work on clearing your energy," "I'll place my hands here to promote
healing," "your energy feels more balanced now," "let's focus on grounding your root chakra," "just
relax and let the energy flow."
Follow-up self-report (returning client, reporting since last visit): "felt lighter after last
session," "energy has felt more balanced," "still feeling blocked/stuck," "sleep improved after the
session," "noticed an emotional release in the days after."
`.trim();


// KNOWN LIMITATION: live browser recording (see toggleTranscriptRecording
// in the dashboards) uses the browser's built-in SpeechRecognition API,
// which has no speaker diarization — it returns one unlabeled stream of
// text with no way to tell practitioner from client. The nextAppointment
// extraction below does its best to infer speaker turns from context on
// unlabeled transcripts, but that's inherently a guess; a pasted transcript
// with real speaker labels (or a future paid diarization service —
// AssemblyAI evaluated as the best cost/quality fit if this becomes worth
// it) will be meaningfully more reliable. Manual booking always works as
// the fallback regardless of what gets detected here.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed — use POST.' });
    return;
  }

  const { transcript, todayDateKey } = req.body || {};
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
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: "You're helping a wellness practitioner (yoga, Ayurveda, massage/bodywork, breathwork, meditation, or Reiki/energy healing) turn a raw session transcript into a very brief summary for their own records — speed matters more than completeness here, since they may be reading this between sessions. Use the terminology reference below to correctly recognize and standardize any technique, pose, condition, or instructional phrasing that comes up — don't paraphrase a real term into vaguer language, and don't invent a technique name that wasn't actually mentioned. The reference includes how practitioners themselves typically phrase instructions and assessments — use that as a guide for recognizing when the PRACTITIONER is speaking versus the client, especially on unlabeled transcripts.\n\nTERMINOLOGY REFERENCE:\n" + TAXONOMY + "\n\nReturn ONLY a JSON object (no markdown, no preamble, no code fences) with this exact shape:\n" +
            '{"keyPoints": ["...", "..."], "areasAddressed": "short comma-separated phrase or empty string", "followUpReport": "if this is a returning client reporting how things have been since their last visit, one short phrase using real follow-up language, or empty string if not a returning-client check-in", "sessionOutcome": "one short phrase on how THIS session concluded, using real outcome terms, or empty string if unclear", "recommendations": ["...", "..."], "wellnessThemes": "one short soft phrase noting any stress, sleep, or tension themes that came up, or empty string if none — never invent a numeric score", "nextAppointment": {"discussed": true or false, "date": "YYYY-MM-DD or null if not resolvable to an actual date", "dateText": "the practitioner\'s own words for when they proposed, or empty string", "time": "e.g. \'2:00 PM\', or null if not stated", "clientResponse": "yes | no | unclear", "note": "one short plain-language sentence on what was proposed and how the client responded, or empty string if nothing was discussed", "preferredDays": ["array of full day names the CLIENT expressed a preference for, e.g. Tuesday, Thursday - empty array if none stated"], "preferredTimeOfDay": "morning, afternoon, evening, or null if not stated"}}\n' +
            "Keep keyPoints to 2-4 very short bullets (under 10 words each) covering only what actually came up, not generic wellness advice. Keep recommendations to at most 2 short bullets, only what the practitioner actually said they'd suggest. Be terse everywhere — this is a quick glance-back, not a report. If the transcript doesn't support a field, use an empty string or empty array rather than guessing.\n\n" +
            "followUpReport is ONLY for what the CLIENT says about the time since a PRIOR session (e.g. they mention how they have been feeling, what they noticed, whether they kept up home care) — leave it empty for a first-time client or if nothing like that came up. sessionOutcome is about how THIS specific session concluded — actual results noticed by the end of it, not a general recommendation for later. Use the terminology reference's outcome and follow-up phrasing as a guide for tone and specificity, but describe what actually happened in this transcript, never invent an outcome that was not mentioned.\n\n" +
            "For nextAppointment: only set discussed=true if the PRACTITIONER actually proposed a specific next appointment day and/or time during the conversation (e.g. 'does next Tuesday afternoon work?', 'let's say Thursday at 2') — a client vaguely saying 'I'll come back soon' with no practitioner-proposed slot does not count, leave discussed=false. The transcript may or may not have real speaker labels (e.g. \"Practitioner:\"/\"Client:\") — if labels are present, use them directly; if it's one unlabeled continuous stream (common with live browser dictation, which cannot distinguish speakers at all), infer speaker turns from context as best you can, and set clientResponse to \"unclear\" rather than guessing \"yes\" if you are not genuinely confident who said what. Today's date is " + (todayDateKey || 'unknown') + " — use it to resolve relative day references (\"next Tuesday\", \"Thursday\") to a real YYYY-MM-DD date. If the practitioner gives BOTH a rough timeframe (\"in about two weeks\", \"next month\") AND a day name, resolve the day name to fall within that stated timeframe rather than the literal nearest occurrence — e.g. \"let's follow up in two weeks, does Tuesday work\" means the Tuesday roughly two weeks out, not the very next Tuesday; if today's date isn't given or the reference is too ambiguous to resolve confidently, leave date as null but still fill in dateText and the rest. clientResponse is \"yes\" only if the client clearly agreed to that specific proposal, \"no\" if they declined or asked for something else instead, \"unclear\" if the transcript cuts off or doesn't show a clear answer. If the practitioner and client went back and forth (e.g. Tuesday didn't work, settled on Thursday), extract the FINAL agreed-upon slot, not the first one mentioned. Separately, fill preferredDays/preferredTimeOfDay whenever the CLIENT expressed ANY general scheduling preference, whether or not a specific slot was ultimately agreed on — e.g. if they said "Tuesdays or Thursdays work better for me" or "mornings are easier," capture that even if clientResponse ends up being "no" to a specific proposal, since it's useful for finding a real alternative afterward. Leave both empty/null if the client never stated a general preference at all.\n\nTranscript:\n" + transcript
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
