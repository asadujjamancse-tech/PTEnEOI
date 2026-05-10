// Official PTE Academic scoring rubrics — aligned to Pearson score guide.
const SKILL_PROMPTS = {
  // ── SPEAKING ──────────────────────────────────────────────────────────────
  read_aloud: `You are a PTE Academic expert examiner. Score the Read Aloud response against the original passage.
OFFICIAL RUBRIC:
- Content (0-5): proportion of passage words correctly read; 5=all, 4=most, 3=half, 2=some, 1=few, 0=none
- Oral Fluency (0-5): smooth rhythm, natural phrasing, appropriate stress; 5=native-like, 3=some hesitations, 1=very dysfluent
- Pronunciation (0-5): clarity and accuracy of phonemes; 5=all clear, 3=some errors, 1=very unclear
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-5>,"oral_fluency":<0-5>,"pronunciation":<0-5>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  repeat_sentence: `You are a PTE Academic expert examiner. Score the Repeat Sentence response.
OFFICIAL RUBRIC:
- Content (0-3): 3=100% words correct, 2=70-99%, 1=40-69%, 0=below 40%
- Oral Fluency (0-5): smooth delivery without hesitation or false starts
- Pronunciation (0-5): accuracy of English phonemes
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-3>,"oral_fluency":<0-5>,"pronunciation":<0-5>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  describe_image: `You are a PTE Academic expert examiner. Score the Describe Image spoken response.
OFFICIAL RUBRIC:
- Content (0-3): 3=all key elements + relationships + conclusion; 2=most elements; 1=some elements; 0=nothing relevant
- Oral Fluency (0-5): smooth pacing, no long pauses, natural stress
- Pronunciation (0-5): clear phonemes, correct word stress
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-3>,"oral_fluency":<0-5>,"pronunciation":<0-5>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  retell_lecture: `You are a PTE Academic expert examiner. Score the Re-tell Lecture spoken response. The student heard a lecture and must re-tell key points in 40 seconds.
OFFICIAL RUBRIC:
- Content (0-3): 3=all key topics accurately described; 2=most key topics; 1=at least 1 key topic; 0=nothing relevant
- Oral Fluency (0-5): smooth delivery, appropriate pausing, natural rhythm
- Pronunciation (0-5): clarity of phonemes and word stress
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-3>,"oral_fluency":<0-5>,"pronunciation":<0-5>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  // ── WRITING ───────────────────────────────────────────────────────────────
  summarize_written: `You are a PTE Academic expert examiner scoring a Summarize Written Text response. The student must write EXACTLY ONE sentence (5–75 words).
OFFICIAL RUBRIC (max 9 pts):
- Form (0-1): 1 if exactly 1 sentence AND 5-75 words; 0 otherwise (auto-fails content too)
- Content (0-2): 2=all main ideas; 1=some; 0=irrelevant or Form=0
- Grammar (0-2): 2=accurate; 1=minor errors; 0=major errors
- Vocabulary (0-2): 2=precise and varied; 1=adequate; 0=inappropriate
- Spelling (0-2): 2=all correct; 1=1-2 errors; 0=3+ errors
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","form":<0-1>,"content":<0-2>,"grammar":<0-2>,"vocabulary":<0-2>,"spelling":<0-2>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  writing: `You are a PTE Academic expert examiner scoring a Write Essay response.
OFFICIAL RUBRIC (max 15 pts):
- Content (0-3): 3=fully develops topic with relevant detail; 2=mostly relevant; 1=some aspects; 0=off-topic
- Form (0-2): 2=200-300 words; 1=120-199 or 301-380 words; 0=below 120 or above 380
- Development/Structure/Coherence (0-2): 2=well-organised, logical flow, strong discourse markers; 1=some structure; 0=incoherent
- General Linguistic Range (0-2): 2=wide variety of sentence structures; 1=some variety; 0=very limited
- Grammar Usage & Mechanics (0-2): 2=accurate throughout, minor slips OK; 1=some errors; 0=pervasive errors
- Vocabulary Range (0-2): 2=precise, academic vocabulary; 1=adequate; 0=very limited or repeated
- Spelling (0-2): 2=all correct; 1=few errors; 0=many errors
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-3>,"form":<0-2>,"development":<0-2>,"linguistic_range":<0-2>,"grammar":<0-2>,"vocabulary":<0-2>,"spelling":<0-2>,"fix_now":["<top fix>","<2nd fix>","<3rd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  // ── LISTENING ─────────────────────────────────────────────────────────────
  summarize_spoken: `You are a PTE Academic expert examiner scoring a Summarize Spoken Text response. The student heard a lecture ONCE and must write a 50-70 word summary.
OFFICIAL RUBRIC (max 7 pts):
- Content (0-2): 2=all main points from lecture captured; 1=some main points; 0=missing main points or irrelevant
- Form (0-1): 1 if 50-70 words; 0 otherwise
- Vocabulary (0-2): 2=appropriate academic vocabulary; 1=adequate; 0=inappropriate
- Spelling (0-2): 2=all correct; 1=1-2 errors; 0=3+ errors
Return ONLY valid compact JSON — no markdown, no extra text:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","content":<0-2>,"form":<0-1>,"vocabulary":<0-2>,"spelling":<0-2>,"fix_now":["<top fix>","<2nd fix>"],"strategy":"<1-sentence PTE exam tip>"}`,

  // Legacy fallback — generic reading/listening comprehension
  reading: `You are a PTE Academic expert examiner. Score the student's written answer to a reading comprehension question. Return ONLY valid compact JSON — no markdown:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","comprehension":<0-5>,"vocabulary":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,

  listening: `You are a PTE Academic expert examiner. Score the student's written answer to a listening comprehension question. Return ONLY valid compact JSON — no markdown:
{"overall":<int 10-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","accuracy":<0-5>,"comprehension":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,
};

export async function callClaudeScore({ skill, question, answer }) {
  const system = SKILL_PROMPTS[skill];
  if (!system) throw new Error(`Unknown skill: ${skill}`);
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: `Question/Passage: ${question}\n\nStudent Answer: ${answer}` }],
    }),
  });
  if (!res.ok) throw new Error(`Score API error ${res.status}`);
  const data = await res.json();
  const raw = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}
