import { useState } from "react";
import QUESTIONS from "../../data/summarizeSpeechQuestions";
import { callClaudeScore } from "../../utils/claudeScorer";
import { generateMockScore } from "../../utils/listeningScorer";
import useScoreTracker from "../../hooks/useScoreTracker";

export default function SummarizeSpeechPanel() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [scored, setScored] = useState(null);
  const [scoring, setScoring] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];
  const wc = answer.trim().split(/\s+/).filter(Boolean).length;
  const inRange = wc >= 50 && wc <= 70;

  const playAudio = () => {
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.audio);
    utt.rate = 0.87;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => setPlaying(false);
    window.speechSynthesis?.speak(utt);
  };

  const stopAudio = () => { window.speechSynthesis?.cancel(); setPlaying(false); };

  const submit = async () => {
    if (scoring) return;
    setScoring(true);
    try {
      const result = await callClaudeScore({ skill: "listening", question: q.audio, answer });
      setScored(result);
      if (result?.overall) addPracticeScore("L", result.overall);
    } catch {
      const mock = generateMockScore();
      setScored(mock);
      addPracticeScore("L", mock.overall || 60);
    }
    setScoring(false);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setPlayed(false); setPlaying(false); setAnswer(""); setScored(null); setScoring(false);
    window.speechSynthesis?.cancel();
  };

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Summarize Spoken Text</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen to a lecture, then write a 50–70 word summary. Listening only.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">14% of score</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>Listen to the lecture (you can replay), then write your summary below.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!playing ? (
            <button className="btn-primary" style={{ padding: "7px 18px" }} onClick={playAudio}>
              {played ? "↩ Replay" : "▶ Play Lecture"}
            </button>
          ) : (
            <button className="btn-primary" style={{ padding: "7px 18px", background: "#475569" }} onClick={stopAudio}>■ Stop</button>
          )}
          <div style={{ color: playing ? "#38BDF8" : played ? "#34D399" : "#475569", fontSize: 12 }}>
            {playing ? "Playing…" : played ? "Write your summary below" : "Press Play to begin"}
          </div>
        </div>
      </div>

      {played && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#64748B" }}>Write your 50–70 word summary:</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: inRange ? "#34D399" : wc > 0 ? "#FBBF24" : "#475569" }}>
              {wc} words {inRange ? "✓" : wc < 50 ? "(need more)" : "(too long)"}
            </div>
          </div>
          <textarea
            className="input-field"
            rows={5}
            placeholder="Summarise the main points of the lecture in 50–70 words…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!scored}
          />
          {!inRange && wc > 0 && (
            <div style={{ fontSize: 12, color: "#FBBF24", marginTop: 4 }}>
              {wc < 50 ? `Add ${50 - wc} more words to meet the minimum.` : `Remove ${wc - 70} words to stay within the limit.`}
            </div>
          )}
        </div>
      )}

      {scored && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Score: {scored.overall}{scored.band ? ` · ${scored.band}` : ""}</div>
          {scored.fix_now?.length > 0 && (
            <ul style={{ paddingLeft: 18, color: "#94A3B8", fontSize: 12, lineHeight: 1.7 }}>
              {scored.fix_now.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {played && !scored && inRange && !scoring && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit for AI Score</button>
        )}
        {scoring && <div style={{ color: "#64748B", fontSize: 13, padding: "8px 0" }}>Scoring…</div>}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
