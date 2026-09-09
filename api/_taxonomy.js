// Domain terminology reference for Raaka Rituals' six practiced/planned
// modalities. Fed into the AI summary prompt in summarize-transcript.js
// so Claude interprets and standardizes session jargon correctly rather
// than guessing from generic conversational language — e.g. recognizing
// "tight in my hip flexors" and "pigeon pose" as related yoga terms, or
// "vata is aggravated" as a real Ayurvedic assessment rather than an
// unfamiliar phrase to paraphrase awkwardly.
//
// Scoped deliberately to what Raaka Rituals actually offers or has
// concretely planned (breathwork/meditation/Reiki chosen specifically
// because they fit the existing virtual-retreat model), not a
// speculative exhaustive list of every holistic modality that exists.
// Add a new section here if a new modality becomes real — no other
// code changes needed, since summarize-transcript.js just includes
// this whole reference as context.

export const TAXONOMY = `
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
