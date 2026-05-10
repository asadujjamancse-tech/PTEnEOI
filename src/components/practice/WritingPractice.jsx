import { useEffect, useState } from "react";
import { generateMockScore as genWritingScore } from "../../utils/writingScorer";
import { callClaudeScore } from "../../utils/claudeScorer";

export default function WritingPractice({ question, onClose, onComplete }) {
  const [text, setText] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    const id = `writing-draft-${question.id}`;
    const saved = window.localStorage.getItem(id);
    if (saved) setText(saved);
    const t = setInterval(() => window.localStorage.setItem(id, text), 2000);
    return () => { clearInterval(t); window.localStorage.setItem(id, text); };
  }, [question.id, text]);

  const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

  const submit = async () => {
    if (scoring) return;
    setScoring(true);
    let score;
    try {
      score = await callClaudeScore({ skill: 'writing', question: question.text, answer: text });
    } catch {
      score = genWritingScore();
    }
    setScored(score);
    setScoring(false);
    if (onComplete) onComplete({ text, score });
  };

  return (
    <div style={{ background: '#071226', border: '1px solid #1E293B', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700 }}>{question.title}</div>
        <div style={{ color: '#94A3B8' }}>Words: {wc(text)}</div>
      </div>
      <div style={{ marginTop: 10, background: '#080E1A', padding: 12, borderRadius: 8 }}>{question.text}</div>
      <textarea className="input-field" rows={8} placeholder="Write your essay here..." value={text} onChange={e => setText(e.target.value)} style={{ marginTop: 10 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn-primary" onClick={submit} disabled={scoring}>{scoring ? 'Scoring...' : 'Submit'}</button>
        <button className="reveal-btn" onClick={onClose}>Close</button>
      </div>

      {scored && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700 }}>Score: {scored.overall}{scored.band ? ` · ${scored.band}` : ''}</div>
          {scored.fix_now && scored.fix_now.length > 0 && (
            <ul style={{ marginTop: 6, paddingLeft: 18, color: '#94A3B8', fontSize: 12, lineHeight: 1.6 }}>
              {scored.fix_now.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
