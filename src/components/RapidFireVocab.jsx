import { useState, useEffect, useRef, useCallback } from "react";

// ── Word bank ─────────────────────────────────────────────────────────────────
// Each entry: word, definition, options (4), correct index
const VOCAB = [
  { word: "ubiquitous",    def: "present, appearing, or found everywhere",                      opts: ["rare","common","ubiquitous","ancient"],       ans: 2 },
  { word: "mitigate",      def: "make less severe, serious, or painful",                        opts: ["worsen","mitigate","ignore","amplify"],        ans: 1 },
  { word: "ambiguous",     def: "open to more than one interpretation",                         opts: ["clear","ambiguous","simple","direct"],         ans: 1 },
  { word: "paradigm",      def: "a typical example or pattern; a model",                        opts: ["exception","paradigm","defect","outcome"],     ans: 1 },
  { word: "meticulous",    def: "showing great attention to detail; very careful and precise",  opts: ["careless","rough","meticulous","hasty"],       ans: 2 },
  { word: "augment",       def: "make something greater by adding to it",                       opts: ["reduce","remove","augment","replace"],         ans: 2 },
  { word: "ephemeral",     def: "lasting for a very short time",                                opts: ["ephemeral","permanent","stable","enduring"],   ans: 0 },
  { word: "lucid",         def: "expressed clearly; easy to understand",                        opts: ["vague","confusing","lucid","verbose"],         ans: 2 },
  { word: "pragmatic",     def: "dealing with things sensibly and realistically",               opts: ["idealistic","pragmatic","abstract","naive"],   ans: 1 },
  { word: "proliferate",   def: "increase rapidly in numbers; multiply",                        opts: ["decline","freeze","proliferate","stagnate"],   ans: 2 },
  { word: "coherent",      def: "logical and consistent; clearly articulated",                  opts: ["coherent","random","chaotic","scattered"],     ans: 0 },
  { word: "detrimental",   def: "tending to cause harm",                                        opts: ["beneficial","helpful","detrimental","neutral"],ans: 2 },
  { word: "innate",        def: "inborn; natural; not learned",                                 opts: ["acquired","innate","taught","cultural"],       ans: 1 },
  { word: "ambivalent",    def: "having mixed or contradictory feelings about something",       opts: ["certain","ambivalent","decisive","firm"],      ans: 1 },
  { word: "concise",       def: "giving a lot of information clearly and in few words",         opts: ["wordy","vague","concise","elaborate"],         ans: 2 },
  { word: "ostensibly",    def: "apparently or purportedly, but perhaps not actually",          opts: ["truly","definitely","ostensibly","clearly"],   ans: 2 },
  { word: "unprecedented", def: "never done or known before",                                   opts: ["common","unprecedented","repeated","familiar"],ans: 1 },
  { word: "exacerbate",    def: "make a problem, bad situation, or negative feeling worse",     opts: ["soothe","exacerbate","resolve","improve"],     ans: 1 },
  { word: "discrepancy",   def: "a lack of compatibility or similarity between two things",     opts: ["match","discrepancy","harmony","balance"],     ans: 1 },
  { word: "substantiate",  def: "provide evidence to prove or support a statement",             opts: ["deny","ignore","substantiate","weaken"],       ans: 2 },
  { word: "pervasive",     def: "spreading widely throughout an area or group",                 opts: ["pervasive","isolated","local","contained"],    ans: 0 },
  { word: "convoluted",    def: "extremely complex and difficult to follow",                     opts: ["simple","convoluted","clear","direct"],        ans: 1 },
  { word: "plausible",     def: "seeming reasonable or probable",                               opts: ["impossible","plausible","absurd","false"],     ans: 1 },
  { word: "equivocal",     def: "open to more than one interpretation; ambiguous",              opts: ["equivocal","definite","certain","clear"],      ans: 0 },
  { word: "succinctly",    def: "in a brief and clearly expressed manner",                      opts: ["verbosely","vaguely","succinctly","slowly"],   ans: 2 },
  { word: "infer",         def: "deduce or conclude from evidence and reasoning",               opts: ["state","infer","ignore","dismiss"],            ans: 1 },
  { word: "advocate",      def: "publicly recommend or support",                                opts: ["oppose","advocate","deny","reject"],           ans: 1 },
  { word: "contentious",   def: "causing or likely to cause an argument; controversial",       opts: ["agreeable","neutral","contentious","peaceful"],ans: 2 },
  { word: "albeit",        def: "though; even though; although",                                opts: ["because","albeit","therefore","unless"],       ans: 1 },
  { word: "enumerate",     def: "mention a number of things one by one",                        opts: ["enumerate","hide","summarise","omit"],         ans: 0 },
];

const GAME_DURATION = 30;
const STREAK_KEY = "rfv_best_streak";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RapidFireVocab() {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [deck, setDeck] = useState([]);
  const [qi, setQi] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => Number(localStorage.getItem(STREAK_KEY) || 0));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);
  const feedbackRef = useRef(null);

  const endGame = useCallback((finalScore, finalStreak) => {
    clearInterval(timerRef.current);
    setPhase("done");
    if (finalStreak > bestStreak) {
      setBestStreak(finalStreak);
      localStorage.setItem(STREAK_KEY, String(finalStreak));
    }
  }, [bestStreak]);

  const start = () => {
    const d = shuffle(VOCAB);
    setDeck(d);
    setQi(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setScore(0);
    setHistory([]);
    setFeedback(null);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endGame(score, streak); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, endGame, score, streak]);

  const answer = useCallback((optIdx) => {
    if (phase !== "playing" || feedback !== null) return;
    const q = deck[qi];
    const correct = optIdx === q.ans;

    clearTimeout(feedbackRef.current);
    setFeedback(correct ? "correct" : "wrong");
    setHistory(h => [...h, { word: q.word, correct }]);

    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    feedbackRef.current = setTimeout(() => {
      setFeedback(null);
      setQi(i => {
        const next = i + 1;
        if (next >= deck.length) { endGame(score + (correct ? 1 : 0), streak + (correct ? 1 : 0)); return i; }
        return next;
      });
    }, 400);
  }, [phase, feedback, deck, qi, score, streak, endGame]);

  const q = deck[qi];
  const timePct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 15 ? "#34D399" : timeLeft > 7 ? "#FBBF24" : "#F87171";

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20, maxWidth: 560 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Rapid Fire Vocab</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>30 seconds · streak game · PTE Academic vocabulary</div>
        </div>
        <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
          <div style={{ color: "#FBBF24", fontWeight: 800, fontSize: 18 }}>🔥 {bestStreak}</div>
          <div style={{ color: "#475569", fontSize: 11 }}>Best streak</div>
        </div>
      </div>

      {/* IDLE */}
      {phase === "idle" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 8 }}>
            Match each word to its definition in 30 seconds.
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
            Build streaks for bonus points. Your best streak is saved.
          </div>
          <button
            className="btn-primary"
            style={{ padding: "12px 32px", fontSize: 15, fontWeight: 700 }}
            onClick={start}
          >
            Start Game ▶
          </button>
        </div>
      )}

      {/* PLAYING */}
      {phase === "playing" && q && (
        <>
          {/* Timer bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: timerColor, fontWeight: 700, fontSize: 22 }}>{timeLeft}s</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: "#FBBF24" }}>🔥 {streak}</span>
                <span style={{ color: "#34D399" }}>✓ {score}</span>
              </div>
            </div>
            <div style={{ height: 6, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${timePct}%`,
                background: timerColor,
                borderRadius: 4, transition: "width 1s linear, background .3s",
              }} />
            </div>
          </div>

          {/* Word card */}
          <div style={{
            background: feedback === "correct" ? "#052E1C" : feedback === "wrong" ? "#1A0A0A" : "#080E1A",
            border: `2px solid ${feedback === "correct" ? "#34D399" : feedback === "wrong" ? "#F87171" : "#1E293B"}`,
            borderRadius: 12, padding: "18px 20px", marginBottom: 16, textAlign: "center",
            transition: "background .2s, border-color .2s",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 8 }}>{q.word}</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{q.def}</div>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {q.opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={feedback !== null}
                style={{
                  padding: "11px 14px", borderRadius: 10, border: "1px solid #1E293B",
                  background: feedback !== null && i === q.ans ? "#052E1C"
                    : feedback === "wrong" && i !== q.ans ? "#1A0A0A"
                    : "#0A1222",
                  color: feedback !== null && i === q.ans ? "#34D399"
                    : feedback === "wrong" && i !== q.ans ? "#F87171"
                    : "#E2E8F0",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  cursor: feedback !== null ? "default" : "pointer",
                  transition: "all .15s",
                  borderColor: feedback !== null && i === q.ans ? "#34D39940"
                    : feedback === "wrong" && i !== q.ans ? "#F8717130"
                    : "#1E293B",
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10, color: "#475569", fontSize: 11, textAlign: "center" }}>
            {qi + 1} / {deck.length}
          </div>
        </>
      )}

      {/* DONE */}
      {phase === "done" && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{score >= 15 ? "🏆" : score >= 8 ? "⭐" : "💪"}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            <span style={{ color: "#34D399" }}>{score}</span>
            <span style={{ color: "#475569", fontSize: 16 }}> correct in 30s</span>
          </div>
          <div style={{ fontSize: 14, color: "#FBBF24", marginBottom: 16 }}>
            🔥 Best streak this round: {Math.max(...history.reduce((acc, h) => {
              const last = acc[acc.length - 1];
              if (h.correct) { acc[acc.length - 1] = last + 1; } else { acc.push(0); }
              return acc;
            }, [0]))}
          </div>
          {/* Word review */}
          {history.length > 0 && (
            <div style={{ background: "#080E1A", borderRadius: 10, padding: 14, marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 8 }}>WORDS ATTEMPTED</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {history.map((h, i) => (
                  <span key={i} style={{
                    background: h.correct ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                    border: `1px solid ${h.correct ? "#34D39940" : "#F8717130"}`,
                    color: h.correct ? "#34D399" : "#F87171",
                    borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
                  }}>{h.word}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-primary" style={{ padding: "10px 28px", fontSize: 14 }} onClick={start}>
              Play Again ▶
            </button>
          </div>
          {score > bestStreak && (
            <div style={{ marginTop: 12, fontSize: 13, color: "#FBBF24" }}>🎉 New best streak!</div>
          )}
        </div>
      )}
    </div>
  );
}
