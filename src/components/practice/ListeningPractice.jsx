import { useState } from "react";
import { generateMockScore as genListeningScore } from "../../utils/listeningScorer";
import { callClaudeScore } from "../../utils/claudeScorer";

export default function ListeningPractice({ question, onClose, onComplete }) {
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);

  // For demo purposes, audio is not a real file. In a real system we'd attach an audio URL.
  const fakeAudioUrl = null;

  const submit = async () => {
    if (scoring) return;
    setScoring(true);
    let score;
    try {
      score = await callClaudeScore({ skill: 'listening', question: question.text, answer });
    } catch {
      score = genListeningScore();
    }
    setScored(score);
    setScoring(false);
    if (onComplete) onComplete({ answer, score });
  };

  return (
    <div style={{ background: '#071226', border: '1px solid #1E293B', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700 }}>{question.title}</div>
        <div style={{ color: '#94A3B8' }}>{question.difficulty}</div>
      </div>
      <div style={{ marginTop: 10, background: '#080E1A', padding: 12, borderRadius: 8 }}>{question.text}</div>
      <div style={{ marginTop: 10 }}>
        <div style={{ height: 56, background: '#071026', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Audio player placeholder</div>
      </div>
      <textarea className="input-field" rows={4} placeholder="Type your answer to the listening prompt..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ marginTop: 10 }} />
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
