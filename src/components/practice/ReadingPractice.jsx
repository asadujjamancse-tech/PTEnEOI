import { useEffect, useState } from "react";
import { generateMockScore as genReadingScore } from "../../utils/readingScorer";
import { callClaudeScore } from "../../utils/claudeScorer";

export default function ReadingPractice({ question, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(45); // 45s read
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(tl => Math.max(0, tl - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async () => {
    if (scoring) return;
    setScoring(true);
    let score;
    try {
      score = await callClaudeScore({ skill: 'reading', question: question.text, answer });
    } catch {
      score = genReadingScore();
    }
    setScored(score);
    setScoring(false);
    if (onComplete) onComplete({ answer, score });
  };

  return (
    <div style={{ background: '#071226', border: '1px solid #1E293B', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700 }}>{question.title}</div>
        <div style={{ color: '#94A3B8' }}>Time left: {timeLeft}s</div>
      </div>
      <div style={{ marginTop: 10, background: '#080E1A', padding: 12, borderRadius: 8 }}>{question.text}</div>
      <textarea className="input-field" rows={4} placeholder="Write a short answer to the prompt (2-4 sentences)..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ marginTop: 10 }} />
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
