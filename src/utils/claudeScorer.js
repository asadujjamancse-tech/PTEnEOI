const SKILL_PROMPTS = {
  summarize_written: `You are a PTE Academic expert examiner scoring a Summarize Written Text response. The student must write EXACTLY ONE sentence (5–75 words) summarising the passage. Return ONLY valid compact JSON with no markdown fences:
{"overall":<integer 0-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","form":<0-1 — 1 if exactly one sentence AND 5-75 words else 0>,"content":<0-2>,"grammar":<0-2>,"vocabulary":<0-2>,"spelling":<0-2>,"fix_now":["<most critical fix>","<2nd fix>"]}`,
  read_aloud: `You are a PTE Academic expert examiner. Score the student's Read Aloud transcript against the original passage. Return ONLY valid compact JSON with no markdown fences:
{"overall":<integer 0-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","fluency":<0-5>,"pronunciation":<0-5>,"oral_fluency":<0-5>,"content":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,
  reading: `You are a PTE Academic expert examiner. Score the student's written answer to a reading comprehension question. Return ONLY valid compact JSON with no markdown fences:
{"overall":<integer 0-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","comprehension":<0-5>,"vocabulary":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,
  writing: `You are a PTE Academic expert examiner. Score the student's writing response. Return ONLY valid compact JSON with no markdown fences:
{"overall":<integer 0-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","grammar":<0-5>,"cohesion":<0-5>,"vocabulary":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,
  listening: `You are a PTE Academic expert examiner. Score the student's written answer to a listening comprehension question. Return ONLY valid compact JSON with no markdown fences:
{"overall":<integer 0-90>,"band":"<Expert|Advanced|Upper Intermediate|Intermediate|Elementary>","accuracy":<0-5>,"comprehension":<0-5>,"fix_now":["<specific fix 1>","<specific fix 2>"]}`,
};

export async function callClaudeScore({ skill, question, answer }) {
  const system = SKILL_PROMPTS[skill];
  if (!system) throw new Error(`Unknown skill: ${skill}`);
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: `Question: ${question}\n\nStudent Answer: ${answer}` }],
    }),
  });
  if (!res.ok) throw new Error(`Score API error ${res.status}`);
  const data = await res.json();
  const raw = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}
