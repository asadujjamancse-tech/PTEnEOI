import { useState } from "react";
import QUESTIONS from "../../data/typeInFillBlanksQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

export default function TypeInFillBlanksPanel() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];
  const blankCount = q.answers.length;

  const playAudio = () => {
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.audio);
    utt.rate = 0.85;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => setPlaying(false);
    window.speechSynthesis?.speak(utt);
  };

  const submit = () => {
    setSubmitted(true);
    const correct = q.answers.filter((a, i) => answers[i]?.trim().toLowerCase() === a.toLowerCase()).length;
    const overall = Math.round(40 + (correct / blankCount) * 50);
    addPracticeScore("L", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setPlayed(false); setPlaying(false); setAnswers({}); setSubmitted(false);
    window.speechSynthesis?.cancel();
  };

  const renderPassage = () => {
    const parts = q.passage.split("{BLANK}");
    return parts.map((part, i) => {
      const correct = submitted && answers[i]?.trim().toLowerCase() === q.answers[i]?.toLowerCase();
      const wrong = submitted && answers[i]?.trim().toLowerCase() !== q.answers[i]?.toLowerCase();
      return (
        <span key={i} style={{ lineHeight: 2.4 }}>
          {part}
          {i < parts.length - 1 && (
            <input
              value={answers[i] || ""}
              onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
              disabled={submitted}
              placeholder="…"
              style={{ display: "inline-block", width: 110, background: submitted ? (correct ? "#052E1C" : "#2D0A0A") : "#1E293B", border: `1px solid ${submitted ? (correct ? "#34D399" : "#F87171") : "#475569"}`, color: submitted ? (correct ? "#34D399" : "#F87171") : "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 13, margin: "0 4px", outline: "none" }}
            />
          )}
        </span>
      );
    });
  };

  const correct = submitted ? q.answers.filter((a, i) => answers[i]?.trim().toLowerCase() === a.toLowerCase()).length : 0;

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Fill in the Blanks (Listening)</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen to the audio, then type the missing words directly in the blanks.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">12% of score</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <button className="btn-primary" style={{ padding: "7px 18px" }} onClick={playAudio} disabled={playing}>
            {playing ? "Playing…" : played ? "↩ Replay" : "▶ Play Audio"}
          </button>
          <div style={{ color: played ? "#34D399" : "#475569", fontSize: 12 }}>
            {played ? "Now fill in the blanks below" : "Listen carefully for the missing words"}
          </div>
        </div>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 2.4, marginBottom: 16 }}>
        {renderPassage()}
      </div>

      {submitted && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#38BDF8", marginBottom: 8 }}>{correct} / {blankCount} correct</div>
          {q.answers.map((ca, i) => (
            <div key={i} style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
              Blank {i + 1}: <span style={{ color: answers[i]?.trim().toLowerCase() === ca.toLowerCase() ? "#34D399" : "#F87171" }}>{answers[i] || "—"}</span>
              {answers[i]?.trim().toLowerCase() !== ca.toLowerCase() && <span style={{ color: "#64748B" }}> → <strong style={{ color: "#34D399" }}>{ca}</strong></span>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!submitted && Object.keys(answers).filter(k => answers[k]).length >= blankCount && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
