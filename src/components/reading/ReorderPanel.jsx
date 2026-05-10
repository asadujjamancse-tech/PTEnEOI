import { useMemo, useState } from "react";
import QUESTIONS from "../../data/reorderQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scorePairs(ordered, correct) {
  let pts = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = correct.indexOf(ordered[i]);
    const b = correct.indexOf(ordered[i + 1]);
    if (a >= 0 && b === a + 1) pts++;
  }
  return pts;
}

export default function ReorderPanel() {
  const [idx, setIdx] = useState(0);
  const q = QUESTIONS[idx];
  const shuffled = useMemo(() => shuffle(q.sentences), [idx]);
  const [left, setLeft] = useState(shuffled);
  const [right, setRight] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const { addPracticeScore } = useScoreTracker();

  const maxPairs = q.sentences.length - 1;

  const moveToRight = (sentence) => {
    if (submitted) return;
    setLeft(l => l.filter(s => s !== sentence));
    setRight(r => [...r, sentence]);
  };

  const moveToLeft = (sentence) => {
    if (submitted) return;
    setRight(r => r.filter(s => s !== sentence));
    setLeft(l => [...l, sentence]);
  };

  const submit = () => {
    setSubmitted(true);
    const pairs = scorePairs(right, q.sentences);
    const overall = Math.round(40 + (pairs / maxPairs) * 50);
    addPracticeScore("R", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setSubmitted(false);
    const nq = QUESTIONS[(idx + 1) % QUESTIONS.length];
    const ns = shuffle(nq.sentences);
    setLeft(ns); setRight([]);
  };

  const correctPairs = submitted ? scorePairs(right, q.sentences) : 0;

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Reorder Paragraph</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Click sentences to move them into the correct order. Scored on adjacent pairs.</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">{q.title}</span>
        <span className="pill">13% of score</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Source — click to add →</div>
          <div style={{ minHeight: 120, background: "#080E1A", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {left.map((s, i) => (
              <button key={i} onClick={() => moveToRight(s)} disabled={submitted}
                style={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", textAlign: "left", color: "#CBD5E1", fontSize: 13, cursor: submitted ? "default" : "pointer", lineHeight: 1.5 }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#38BDF8", marginBottom: 8 }}>Your order (click to remove):</div>
          <div style={{ minHeight: 120, background: "#080E1A", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {right.map((s, i) => {
              const isCorrect = submitted && q.sentences[i] === s;
              const isWrong = submitted && q.sentences[i] !== s;
              return (
                <button key={i} onClick={() => moveToLeft(s)} disabled={submitted}
                  style={{ background: submitted ? (isCorrect ? "#052E1C" : "#2D0A0A") : "#0F1929", border: `1px solid ${submitted ? (isCorrect ? "#34D399" : "#F87171") : "#0EA5E9"}`, borderRadius: 8, padding: "8px 12px", textAlign: "left", color: submitted ? (isCorrect ? "#34D399" : "#F87171") : "#38BDF8", fontSize: 13, cursor: submitted ? "default" : "pointer", lineHeight: 1.5 }}>
                  <span style={{ color: "#475569", fontSize: 11, marginRight: 6 }}>{i + 1}.</span>{s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#38BDF8", marginBottom: 8 }}>{correctPairs} / {maxPairs} correct pairs</div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Correct order:</div>
          {q.sentences.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4, lineHeight: 1.5 }}>
              <span style={{ color: "#475569", marginRight: 6 }}>{i + 1}.</span>{s}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {!submitted && right.length === q.sentences.length && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
