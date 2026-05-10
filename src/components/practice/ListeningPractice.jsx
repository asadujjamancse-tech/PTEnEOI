import { useState } from "react";
import { generateMockScore as genListeningScore } from "../../utils/listeningScorer";
import { callClaudeScore } from "../../utils/claudeScorer";

export default function ListeningPractice({ question, onClose, onComplete }) {
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);

  const playAudio = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(question.text);
    utt.rate = 0.88;
    utt.pitch = 1;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utt);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

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
      <div style={{ marginTop: 10, background: '#080E1A', padding: 12, borderRadius: 8, color: '#64748B', fontSize: 13 }}>
        Listen to the audio, then answer below. You may play once.
      </div>
      <div style={{ marginTop: 10, height: 56, background: '#071026', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
        {!playing ? (
          <button className="btn-primary" style={{ padding: '6px 18px', fontSize: 13 }} onClick={playAudio}>
            {played ? '↩ Replay' : '▶ Play Audio'}
          </button>
        ) : (
          <button className="btn-primary" style={{ padding: '6px 18px', fontSize: 13, background: '#475569' }} onClick={stopAudio}>
            ■ Stop
          </button>
        )}
        <div style={{ color: playing ? '#38BDF8' : played ? '#34D399' : '#475569', fontSize: 12 }}>
          {playing ? 'Playing…' : played ? 'Done — answer below' : 'Press Play to begin'}
        </div>
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
