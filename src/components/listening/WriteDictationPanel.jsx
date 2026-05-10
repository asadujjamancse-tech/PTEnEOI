import { useState } from "react";
import QUESTIONS from "../../data/writeDictationQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

// Official PTE scoring: each word in the correct sequential position scores 1 pt.
// We use a positional comparison after normalising punctuation.
function normalise(w) {
  return w.toLowerCase().replace(/[.,!?;:'"()\-]/g, "").trim();
}

function scoreSequential(reference, attempt) {
  const refWords = reference.trim().split(/\s+/).filter(Boolean).map(normalise);
  const attWords = attempt.trim().split(/\s+/).filter(Boolean).map(normalise);
  let correct = 0;
  const len = Math.min(refWords.length, attWords.length);
  for (let i = 0; i < len; i++) {
    if (refWords[i] === attWords[i]) correct++;
  }
  return { correct, total: refWords.length, pct: Math.round((correct / refWords.length) * 100) };
}

// Build per-word diff for display — returns array of {word, status: 'correct'|'wrong'|'missing'}
function buildDiff(reference, attempt) {
  const refWords = reference.trim().split(/\s+/).filter(Boolean);
  const attWords = attempt.trim().split(/\s+/).filter(Boolean).map(normalise);
  return refWords.map((word, i) => ({
    word,
    status: attWords[i] === normalise(word) ? "correct" : attWords[i] === undefined ? "missing" : "wrong",
    got: attWords[i] || null,
  }));
}

const STRATEGIES = [
  "Listen to the WHOLE sentence first — don't start typing during playback.",
  "Group words into 3-4 chunks by phrase: [The study] [clearly shows] [that pollution levels] [have risen].",
  "Remember the structure: usually Subject + Verb + Object/Complement.",
  "Spelling counts — one misspelled letter = 0 for that word.",
  "If unsure of a word, attempt it anyway — blank = guaranteed 0.",
  "Common words to watch: their/there/they're, affect/effect, its/it's.",
  "Practice writing 10 sentences per day — WFD has the highest Listening weight (22%).",
];

export default function WriteDictationPanel() {
  const [idx, setIdx]         = useState(0);
  const [played, setPlayed]   = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const { addPracticeScore } = useScoreTracker();
  const q = QUESTIONS[idx];

  const playOnce = () => {
    if (played || playing) return;
    setPlaying(true);
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(q.text);
    utt.rate = 0.84;
    utt.pitch = 1;
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => { setPlaying(false); setPlayed(true); };
    window.speechSynthesis?.speak(utt);
  };

  const submit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    const { pct, correct, total } = scoreSequential(q.text, answer);
    // Scale: 100% → 90, 80% → 79, 60% → 68, 40% → 57, 20% → 46, 0% → 36
    const overall = Math.round(36 + pct * 0.54);
    addPracticeScore("L", overall);
  };

  const next = () => {
    setIdx(i => (i + 1) % QUESTIONS.length);
    setPlayed(false); setPlaying(false); setAnswer(""); setSubmitted(false); setShowStrategy(false);
    window.speechSynthesis?.cancel();
  };

  const result = submitted ? scoreSequential(q.text, answer) : null;
  const diff    = submitted ? buildDiff(q.text, answer) : null;

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Write From Dictation</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Listen once · type every word in exact sequence · Scores Listening + Writing</div>
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{idx + 1} / {QUESTIONS.length}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <span className="pill">{q.difficulty}</span>
        <span className="pill">22% of Listening — highest weight</span>
      </div>

      {/* Official rules */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#60A5FA" }}>
        ⚠ <strong>One play only.</strong> Each correctly spelled word in the correct position = 1 pt. Spelling must be exact.
      </div>

      {/* Audio */}
      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>
          {!played && !playing && "Press Play — you will hear the sentence once only."}
          {playing && "🎧 Playing… listen to the full sentence before typing."}
          {played && !submitted && "✅ Now type every word exactly as you heard it."}
          {submitted && "Submitted."}
        </div>
        <button
          className="btn-primary"
          style={{ padding: "8px 20px", opacity: (played || playing) ? 0.4 : 1, cursor: (played || playing) ? "not-allowed" : "pointer" }}
          onClick={playOnce}
          disabled={played || playing}
        >
          {playing ? "⏵ Playing…" : played ? "✓ Played (once only)" : "▶ Play Audio"}
        </button>
      </div>

      {/* Answer */}
      {played && (
        <div style={{ marginBottom: 14 }}>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Type every word exactly as you heard it… spelling counts!"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={submitted}
            style={{ fontSize: 15 }}
          />
        </div>
      )}

      {/* Result */}
      {submitted && result && diff && (
        <div style={{ background: "#071226", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          {/* Score bar */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              <span style={{ color: result.pct >= 80 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171" }}>
                {result.correct}/{result.total}
              </span>
              <span style={{ color: "#475569", fontSize: 13, marginLeft: 6 }}>words correct ({result.pct}%)</span>
            </div>
          </div>
          <div style={{ height: 6, background: "#1E293B", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${result.pct}%`, background: result.pct >= 80 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171", borderRadius: 4 }} />
          </div>

          {/* Word-by-word diff */}
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6, fontWeight: 700 }}>CORRECT SENTENCE (positional feedback):</div>
          <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 10 }}>
            {diff.map((item, i) => (
              <span key={i} style={{ marginRight: 4 }}>
                <span style={{
                  color: item.status === "correct" ? "#34D399" : "#F87171",
                  fontWeight: item.status !== "correct" ? 700 : 400,
                  background: item.status === "missing" ? "#2D0A0A30" : "transparent",
                  padding: "1px 2px",
                  borderRadius: 3,
                }}>
                  {item.word}
                </span>
                {item.status === "wrong" && item.got && (
                  <span style={{ fontSize: 10, color: "#F87171", verticalAlign: "super" }}> ({item.got})</span>
                )}
                {item.status === "missing" && (
                  <span style={{ fontSize: 10, color: "#F87171", verticalAlign: "super" }}> (missing)</span>
                )}
              </span>
            ))}
          </div>

          {/* Your answer */}
          <div style={{ background: "#0A1222", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>YOUR ANSWER:</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{answer || "—"}</div>
          </div>

          {/* Key tip */}
          <div style={{ marginTop: 10, background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#60A5FA" }}>
            💡 PTE WFD scores each word by <strong>position</strong>. Inserting an extra word shifts all following words — costing multiple marks. Focus on exact sequence, not just individual words.
          </div>
        </div>
      )}

      {/* Strategy */}
      <div style={{ marginBottom: 12 }}>
        <button className="reveal-btn" onClick={() => setShowStrategy(v => !v)}>
          {showStrategy ? "Hide strategy" : "📋 Show Write From Dictation strategy"}
        </button>
        {showStrategy && (
          <div style={{ marginTop: 8, background: "#052E1C", border: "1px solid #064E3B", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#34D399", fontWeight: 700, marginBottom: 6 }}>PTE WRITE FROM DICTATION — STRATEGY</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#6EE7B7", fontSize: 12, lineHeight: 1.9 }}>
              {STRATEGIES.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <div style={{ marginTop: 8, fontSize: 11, color: "#34D399", fontWeight: 700 }}>SCORING:</div>
            <div style={{ fontSize: 12, color: "#6EE7B7", marginTop: 4 }}>
              1 pt per correctly spelled word in correct sequence. Max = number of words in sentence.
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {played && !submitted && answer.trim() && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>Next ▶</button>
      </div>
    </div>
  );
}
