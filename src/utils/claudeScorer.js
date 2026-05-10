const SKILL_PROMPTS = {
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
