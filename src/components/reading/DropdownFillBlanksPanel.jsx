import { useState } from "react";
import RW_FILL_BLANKS from "../../data/rwFillBlanksQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

// Re-uses RW fill-blanks data but renders as dropdowns (distinct PTE task type)
const QUESTIONS = RW_FILL_BLANKS.slice(0, 10).map((q, i) => ({ ...q, id: `dd-${i + 1}` }));

function renderWithDropdowns(passage, wordBank, answers, onChange, submitted, correctAnswers) {
  const parts = passage.split("{BLANK}");
  return parts.map((part, i) => (
    <span key={i} style={{ lineHeight: 2.2 }}>
      {part}
      {i < parts.length - 1 && (
        <select
          value={answers[i] || ""}
          onChange={e => onChange(i, e.target.value)}
          disabled={submitted}
          style={{ background: submitted ? (answers[i]?.toLowerCase() === correctAnswers[i]?.toLowerCase() ? "#052E1C" : "#2D0A0A") : "#1E293B", border: `1px solid ${submitted ? (answers[i]?.toLowerCase() === correctAnswers[i]?.toLowerCase() ? "#34D399" : "#F87171") : "#475569"}`, color: submitted ? (answers[i]?.toLowerCase() === correctAnswers[i]?.toLowerCase() ? "#34D399" : "#F87171") : "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 13, margin: "0 4px", cursor: submitted ? "default" : "pointer" }}>
          <option value="">— select —</option>
          {wordBank.map((w, j) => <option key={j} value={w}>{w}</option>)}
        </select>
      )}
    </span>
  ));
}

export default function DropdownFillBlanksPanel() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];
  const blankCount = (q.passage.match(/{BLANK}/g) || []).length;

  const handleChange = (i, val) => setAnswers(a => ({ ...a, [i]: val }));

  const submit = () => {
    setSubmitted(true);
    const correct = Object.values(answers).filter((a, i) => a?.toLowerCase() === q.answers[i]?.toLowerCase()).length;
    const overall = Math.round(40 + (correct / blankCount) * 50);
    addPracticeScore("R", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setAnswers({}); setSubmitted(false);
  };

  const allFilled = Object.keys(answers).length >= blankCount && Object.values(answers).every(Boolean);
  const correct = submitted ? q.answers.filter((a, i) => answers[i]?.toLowerCase() === a.toLowerCase()).length : 0;

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Fill in the Blanks (Drop-down)</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Select the best word from each drop-down to complete the passage.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">10% of score</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 2.2, marginBottom: 16 }}>
        {renderWithDropdowns(q.passage, q.wordBank, answers, handleChange, submitted, q.answers)}
      </div>

      {submitted && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#38BDF8" }}>{correct} / {blankCount} correct</div>
          <div style={{ marginTop: 8 }}>
            {q.answers.map((ca, i) => (
              <div key={i} style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
                Blank {i + 1}: <span style={{ color: answers[i]?.toLowerCase() === ca.toLowerCase() ? "#34D399" : "#F87171" }}>{answers[i] || "—"}</span>
                {answers[i]?.toLowerCase() !== ca.toLowerCase() && <span style={{ color: "#64748B" }}> → <strong style={{ color: "#34D399" }}>{ca}</strong></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!submitted && allFilled && <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
