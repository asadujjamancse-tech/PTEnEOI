/**
 * SmartDictationPanel.jsx — Spaced Repetition Write From Dictation
 *
 * Implements a simplified SM-2 spaced repetition algorithm so that:
 *  - Sentences you get right (≥90%) are pushed further into the future
 *  - Sentences you struggle with (< 60%) come back the next day
 *  - Questions you've never seen are shown first (easiest difficulty first)
 *
 * Features:
 *  - Weak-word tracker: counts every word missed across all sessions
 *  - Accent variation: cycles AU/GB/US TTS voices per question
 *  - Mastery progress bar: shows how many of 30 sentences are "mastered" (≥7 day interval)
 *
 * Storage:
 *  - smart_wfd_v1    → SRS card state per question id { ef, interval, dueAt, lastPct }
 *  - smart_wfd_weak_v1 → word → miss count map
 *
 * See docs/ARCHITECTURE.md §6 for full SRS algorithm explanation.
 */
import { useState, useCallback, useMemo } from "react";
import QUESTIONS from "../../data/writeDictationQuestions";
import useScoreTracker from "../../hooks/useScoreTracker";

// ── SRS helpers ──────────────────────────────────────────────────────────────
const SRS_KEY = "smart_wfd_v1";
const WEAK_KEY = "smart_wfd_weak_v1";

function loadSRS() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY) || "{}"); } catch { return {}; }
}
function saveSRS(data) {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
}
function loadWeak() {
  try { return JSON.parse(localStorage.getItem(WEAK_KEY) || "{}"); } catch { return {}; }
}
function saveWeak(data) {
  localStorage.setItem(WEAK_KEY, JSON.stringify(data));
}

// Simplified SM-2: returns updated card state
function updateSRS(card, pct) {
  const ef = Math.max(1.3, (card.ef || 2.5) + (pct >= 90 ? 0.1 : pct >= 60 ? 0 : -0.2));
  const interval = pct >= 90
    ? Math.round((card.interval || 1) * ef)
    : pct >= 60
    ? (card.interval || 1)
    : 0;
  const dueAt = Date.now() + interval * 86_400_000;
  return { ef, interval, dueAt, lastPct: pct };
}

function isDue(card) {
  if (!card) return true;
  return Date.now() >= (card.dueAt || 0);
}

// ── Scoring helpers (identical to WriteDictationPanel) ───────────────────────
function normalise(w) {
  return w.toLowerCase().replace(/[.,!?;:'"()\-]/g, "").trim();
}
function scoreSequential(reference, attempt) {
  const ref = reference.trim().split(/\s+/).filter(Boolean).map(normalise);
  const att = attempt.trim().split(/\s+/).filter(Boolean).map(normalise);
  let correct = 0;
  const len = Math.min(ref.length, att.length);
  for (let i = 0; i < len; i++) { if (ref[i] === att[i]) correct++; }
  return { correct, total: ref.length, pct: Math.round((correct / ref.length) * 100) };
}
function buildDiff(reference, attempt) {
  const ref = reference.trim().split(/\s+/).filter(Boolean);
  const att = attempt.trim().split(/\s+/).filter(Boolean).map(normalise);
  return ref.map((word, i) => ({
    word, got: att[i] || null,
    status: att[i] === normalise(word) ? "correct" : att[i] === undefined ? "missing" : "wrong",
  }));
}

// ── Voice helpers ─────────────────────────────────────────────────────────────
const ACCENTS = ["en-AU", "en-GB", "en-US"];
let voiceIdx = 0;
function getNextVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const target = ACCENTS[voiceIdx % ACCENTS.length];
  voiceIdx++;
  return voices.find(v => v.lang === target) || voices.find(v => v.lang.startsWith("en")) || null;
}

// ── Difficulty ordering ──────────────────────────────────────────────────────
const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 };

export default function SmartDictationPanel() {
  const [srs, setSRS] = useState(loadSRS);
  const [weak, setWeak] = useState(loadWeak);
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showWeak, setShowWeak] = useState(false);
  const [sessionStats, setSessionStats] = useState({ done: 0, correct: 0 });
  const { addPracticeScore } = useScoreTracker();

  // Pick the best question: due questions first, then easiest not yet started
  const currentQ = useMemo(() => {
    // Questions due for review
    const due = QUESTIONS.filter(q => isDue(srs[q.id])).sort((a, b) => {
      const aCard = srs[a.id];
      const bCard = srs[b.id];
      // Prioritise unseen, then lowest due time, then easiest difficulty
      if (!aCard && bCard) return -1;
      if (aCard && !bCard) return 1;
      if (!aCard && !bCard) return DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty];
      return (aCard.dueAt || 0) - (bCard.dueAt || 0);
    });
    return due[0] || QUESTIONS[0];
  }, [srs]);

  // Stats across all questions
  const stats = useMemo(() => {
    const done = Object.values(srs).length;
    const mastered = Object.values(srs).filter(c => (c.interval || 0) >= 7).length;
    const due = QUESTIONS.filter(q => isDue(srs[q.id])).length;
    return { done, mastered, due };
  }, [srs]);

  // Sorted weak words
  const weakWords = useMemo(() => {
    return Object.entries(weak)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);
  }, [weak]);

  const playAudio = useCallback(() => {
    if (played || playing) return;
    setPlaying(true);
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(currentQ.text);
    utt.rate = 0.84;
    utt.voice = getNextVoice();
    utt.onstart = () => setPlaying(true);
    utt.onend = () => { setPlaying(false); setPlayed(true); };
    utt.onerror = () => { setPlaying(false); setPlayed(true); };
    window.speechSynthesis?.speak(utt);
  }, [played, playing, currentQ]);

  const submit = useCallback(() => {
    if (!answer.trim()) return;
    setSubmitted(true);
    const { pct } = scoreSequential(currentQ.text, answer);

    // Update SRS
    const updated = updateSRS(srs[currentQ.id], pct);
    const newSRS = { ...srs, [currentQ.id]: updated };
    setSRS(newSRS);
    saveSRS(newSRS);

    // Track weak words
    const diff = buildDiff(currentQ.text, answer);
    const newWeak = { ...weak };
    diff.forEach(({ word, status }) => {
      if (status !== "correct") {
        const key = normalise(word);
        newWeak[key] = (newWeak[key] || 0) + 1;
      }
    });
    setWeak(newWeak);
    saveWeak(newWeak);

    // Session stats
    setSessionStats(s => ({ done: s.done + 1, correct: s.correct + (pct >= 80 ? 1 : 0) }));

    // Score tracker
    const overall = Math.round(36 + pct * 0.54);
    addPracticeScore("L", overall);
  }, [answer, currentQ, srs, weak, addPracticeScore]);

  const next = useCallback(() => {
    setPlayed(false); setPlaying(false); setAnswer(""); setSubmitted(false);
    window.speechSynthesis?.cancel();
    // Force re-compute of currentQ by touching srs reference (already updated in submit)
    setSRS(s => ({ ...s }));
  }, []);

  const result = submitted ? scoreSequential(currentQ.text, answer) : null;
  const diff = submitted ? buildDiff(currentQ.text, answer) : null;
  const card = srs[currentQ.id];
  const diffColor = DIFF_RANK[currentQ.difficulty] === 0 ? "#34D399"
    : DIFF_RANK[currentQ.difficulty] === 1 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Smart Dictation</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Spaced repetition · Adaptive difficulty · Accent variety</div>
        </div>
        {/* Session stats */}
        <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
          <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <div style={{ color: "#FBBF24", fontWeight: 800 }}>{stats.due}</div>
            <div style={{ color: "#475569" }}>Due</div>
          </div>
          <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <div style={{ color: "#34D399", fontWeight: 800 }}>{stats.mastered}</div>
            <div style={{ color: "#475569" }}>Mastered</div>
          </div>
          <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <div style={{ color: "#38BDF8", fontWeight: 800 }}>{sessionStats.done}</div>
            <div style={{ color: "#475569" }}>Today</div>
          </div>
        </div>
      </div>

      {/* Progress bar for mastery */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 4 }}>
          <span>Overall mastery</span>
          <span>{stats.mastered}/{QUESTIONS.length} sentences</span>
        </div>
        <div style={{ height: 5, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.round((stats.mastered / QUESTIONS.length) * 100)}%`, background: "linear-gradient(90deg,#0EA5E9,#34D399)", borderRadius: 4, transition: "width .4s" }} />
        </div>
      </div>

      {/* Question meta */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ background: `${diffColor}20`, color: diffColor, border: `1px solid ${diffColor}40`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          {currentQ.difficulty}
        </span>
        {card && (
          <span style={{ background: "#1E293B", color: "#64748B", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
            Interval: {card.interval || 0}d · Last: {card.lastPct}%
          </span>
        )}
        {!card && (
          <span style={{ background: "#1E293B20", color: "#64748B", borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>New</span>
        )}
        <span style={{ background: "#1E293B", color: "#64748B", borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>
          22% weight
        </span>
      </div>

      {/* Official rules */}
      <div style={{ background: "#0C1B35", border: "1px solid #1D4ED830", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#60A5FA" }}>
        ⚠ <strong>One play only.</strong> Each correctly spelled word in the correct position = 1 pt. Score well → question revisited in more days. Miss it → back tomorrow.
      </div>

      {/* Audio */}
      <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>
          {!played && !playing && "Press Play — accent varies each question for realistic practice."}
          {playing && "🎧 Playing… listen to the full sentence before typing."}
          {played && !submitted && "✅ Now type every word exactly as you heard it."}
          {submitted && "Submitted."}
        </div>
        <button
          className="btn-primary"
          style={{ padding: "8px 20px", opacity: (played || playing) ? 0.4 : 1, cursor: (played || playing) ? "not-allowed" : "pointer" }}
          onClick={playAudio}
          disabled={played || playing}
        >
          {playing ? "⏵ Playing…" : played ? "✓ Played (once only)" : "▶ Play Audio"}
        </button>
      </div>

      {/* Answer input */}
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              <span style={{ color: result.pct >= 80 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171" }}>
                {result.correct}/{result.total}
              </span>
              <span style={{ color: "#475569", fontSize: 13, marginLeft: 6 }}>words correct ({result.pct}%)</span>
            </div>
            {/* SRS feedback */}
            <div style={{ fontSize: 12, color: result.pct >= 90 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171", fontWeight: 700 }}>
              {result.pct >= 90 ? "→ Next review in " + (srs[currentQ.id]?.interval || 1) + "d"
                : result.pct >= 60 ? "→ Review again soon"
                : "→ Due tomorrow (needs work)"}
            </div>
          </div>

          <div style={{ height: 6, background: "#1E293B", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${result.pct}%`, background: result.pct >= 80 ? "#34D399" : result.pct >= 60 ? "#FBBF24" : "#F87171", borderRadius: 4 }} />
          </div>

          {/* Word diff */}
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6, fontWeight: 700 }}>CORRECT SENTENCE:</div>
          <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 10 }}>
            {diff.map((item, i) => (
              <span key={i} style={{ marginRight: 4 }}>
                <span style={{
                  color: item.status === "correct" ? "#34D399" : "#F87171",
                  fontWeight: item.status !== "correct" ? 700 : 400,
                  padding: "1px 2px", borderRadius: 3,
                }}>{item.word}</span>
                {item.status === "wrong" && item.got && (
                  <span style={{ fontSize: 10, color: "#F87171", verticalAlign: "super" }}> ({item.got})</span>
                )}
                {item.status === "missing" && (
                  <span style={{ fontSize: 10, color: "#F87171", verticalAlign: "super" }}> (missing)</span>
                )}
              </span>
            ))}
          </div>

          <div style={{ background: "#0A1222", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>YOUR ANSWER:</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{answer || "—"}</div>
          </div>
        </div>
      )}

      {/* Weak words panel */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setShowWeak(v => !v)}
          className="reveal-btn"
        >
          {showWeak ? "Hide" : "🔴 Show"} your weak words ({weakWords.length})
        </button>
        {showWeak && weakWords.length > 0 && (
          <div style={{ marginTop: 8, background: "#1A0A0A", border: "1px solid #F8717130", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#F87171", fontWeight: 700, marginBottom: 8 }}>WORDS YOU MISS MOST OFTEN</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {weakWords.map(([word, count]) => (
                <span key={word} style={{
                  background: `rgba(248,113,113,${Math.min(0.05 + count * 0.05, 0.25)})`,
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: 12, color: "#FCA5A5", fontWeight: 600,
                }}>
                  {word} <span style={{ color: "#F87171", fontSize: 10 }}>×{count}</span>
                </span>
              ))}
            </div>
            <button
              onClick={() => { setWeak({}); saveWeak({}); setShowWeak(false); }}
              style={{ marginTop: 10, fontSize: 11, color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Clear weak word history
            </button>
          </div>
        )}
        {showWeak && weakWords.length === 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#34D399" }}>No weak words yet — great work!</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {played && !submitted && answer.trim() && (
          <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={submit}>Submit</button>
        )}
        <button className="qtab" onClick={next}>
          {submitted ? "Next (SRS) ▶" : "Skip ▶"}
        </button>
        <button
          onClick={() => { setSRS({}); saveSRS({}); setWeak({}); saveWeak({}); }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1E293B", background: "transparent", color: "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
        >
          Reset SRS
        </button>
      </div>
    </div>
  );
}
