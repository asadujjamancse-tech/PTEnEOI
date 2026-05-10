import { useState } from "react";
import QUESTIONS from "../../data/rwFillBlanksQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

function renderPassage(passage, userAnswers) {
  const parts = passage.split("{BLANK}");
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <span style={{ display: "inline-block", minWidth: 100, borderBottom: "2px solid #38BDF8", margin: "0 4px", padding: "0 6px", color: userAnswers[i] ? "#38BDF8" : "#475569", fontWeight: 700 }}>
          {userAnswers[i] || "______"}
        </span>
      )}
    </span>
  ));
}

export default function RWFillBlanksPanel() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];
  const blankCount = (q.passage.match(/{BLANK}/g) || []).length;

  const placeWord = (word) => {
    if (submitted) return;
    const slot = answers.findIndex(a => a === undefined || a === null);
    const nextEmpty = answers.filter(Boolean).length;
    if (nextEmpty >= blankCount) return;
    const updated = [...answers];
    updated[nextEmpty] = word;
    setAnswers(updated);
  };

  const removeAnswer = (i) => {
    if (submitted) return;
    const updated = [...answers];
    updated[i] = undefined;
    setAnswers(updated.filter((_, j) => j < i).concat(updated.slice(i)));
  };

  const submit = () => {
    setSubmitted(true);
    const correct = answers.filter((a, i) => a?.toLowerCase() === q.answers[i]?.toLowerCase()).length;
    const pct = Math.round((correct / blankCount) * 100);
    const overall = Math.round(40 + pct * 0.5);
    addPracticeScore("R", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setAnswers([]); setSubmitted(false);
  };

  const usedWords = answers.filter(Boolean);
  const remaining = [...q.wordBank].filter(w => {
    const usedCopy = [...usedWords];
    const idx2 = usedCopy.indexOf(w);
    if (idx2 >= 0) { usedCopy.splice(idx2, 1); return false; }
    return true;
  });

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>R&W Fill in the Blanks</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Click words from the bank to fill each blank in order. Dual: Reading + Writing.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">18% of score</span>
      </div>

      <div style={{ background: "#080E1A", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 2, marginBottom: 16 }}>
        {renderPassage(q.passage, answers)}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Word bank — click to fill next blank:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {q.wordBank.map((word, i) => {
            const used = !remaining.includes(word) || (remaining.filter(w => w === word).length < q.wordBank.filter(w => w === word).length);
            return (
              <button key={i} onClick={() => placeWord(word)} disabled={submitted || used}
                style={{ background: used ? "#0F1929" : "#1E293B", border: `1px solid ${used ? "#1E293B" : "#334155"}`, color: used ? "#334155" : "#CBD5E1", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: used || submitted ? "not-allowed" : "pointer", textDecoration: used ? "line-through" : "none" }}>
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {answers.filter(Boolean).length > 0 && !submitted && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Your answers (click to remove):</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Array.from({ length: blankCount }).map((_, i) => (
              <button key={i} onClick={() => removeAnswer(i)} disabled={submitted}
                style={{ background: answers[i] ? "#0EA5E920" : "#0F1929", border: `1px solid ${answers[i] ? "#0EA5E9" : "#334155"}`, color: answers[i] ? "#38BDF8" : "#475569", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: submitted ? "default" : "pointer" }}>
                {i + 1}: {answers[i] || "—"}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Results</div>
          {q.answers.map((correct, i) => {
            const yours = answers[i];
            const ok = yours?.toLowerCase() === correct.toLowerCase();
            return (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: ok ? "#34D399" : "#F87171", fontWeight: 700 }}>{ok ? "✓" : "✗"}</span>
                <span style={{ color: "#94A3B8" }}>Blank {i + 1}: </span>
                <span style={{ color: ok ? "#34D399" : "#F87171" }}>{yours || "—"}</span>
                {!ok && <span style={{ color: "#64748B" }}>→ correct: <strong style={{ color: "#34D399" }}>{correct}</strong></span>}
              </div>
            );
          })}
          <div style={{ marginTop: 8, fontWeight: 700, color: "#38BDF8" }}>
            {answers.filter((a, i) => a?.toLowerCase() === q.answers[i]?.toLowerCase()).length} / {blankCount} correct
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!submitted && answers.filter(Boolean).length === blankCount && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
