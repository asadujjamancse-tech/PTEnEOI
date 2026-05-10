import React, { useMemo, useState } from "react";
import { scoreEssayLocally } from "../utils/pteIntelligence";
import { buttonStyle, cardStyle, ProgressBar } from "./FeatureShell";

export default function EssayFeedbackPanel({ text }) {
  const [remoteFeedback, setRemoteFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const local = useMemo(() => scoreEssayLocally(text), [text]);

  async function requestAiFeedback() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setRemoteFeedback(null);
    try {
      const response = await fetch("/api/openai/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI feedback failed");
      setRemoteFeedback(data);
    } catch (err) {
      setError("OpenAI feedback is unavailable. Local scoring remains active.");
    } finally {
      setLoading(false);
    }
  }

  if (!text.trim()) return null;

  const rows = [
    ["Grammar", local.grammar, "#38BDF8"],
    ["Vocabulary", local.vocabulary, "#A78BFA"],
    ["Structure", local.structure, "#34D399"],
    ["Coherence", local.coherence, "#FBBF24"],
    ["Form", local.form, "#F87171"],
  ];

  return (
    <div style={{ ...cardStyle, marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#A78BFA", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Real AI essay feedback layer</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 3 }}>Local score now, OpenAI feedback when API key is set</div>
        </div>
        <button style={buttonStyle} onClick={requestAiFeedback} disabled={loading}>{loading ? "Checking..." : "AI Feedback"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <div style={{ textAlign: "center", background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 12 }}>
          <div style={{ color: "#64748B", fontSize: 11 }}>Predicted PTE</div>
          <div style={{ color: local.overall >= 79 ? "#34D399" : "#FBBF24", fontSize: 40, fontWeight: 800 }}>{local.overall}</div>
          <div style={{ color: "#64748B", fontSize: 11 }}>{local.wordCount} words</div>
        </div>
        <div>
          {rows.map(([label, value, color]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: 12, marginBottom: 4 }}><span>{label}</span><span>{value}</span></div>
              <ProgressBar value={(value / 90) * 100} color={color} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 10, padding: 12 }}>
          <div style={{ color: "#34D399", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Suggestions</div>
          {local.suggestions.map((item) => <div key={item} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>- {item}</div>)}
        </div>
        <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 10, padding: 12 }}>
          <div style={{ color: "#FBBF24", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Weak Sentences</div>
          {local.weakSentences.slice(0, 3).map((sentence) => <div key={sentence} style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>- {sentence}</div>)}
          {!local.weakSentences.length && <div style={{ color: "#64748B", fontSize: 12 }}>No obvious sentence-length risk detected.</div>}
        </div>
      </div>

      {remoteFeedback && (
        <div style={{ marginTop: 12, background: "#0C1B35", border: "1px solid #1D4ED8", borderRadius: 10, padding: 12, color: "#CBD5E1", fontSize: 12, lineHeight: 1.6 }}>
          {remoteFeedback.feedback || JSON.stringify(remoteFeedback)}
        </div>
      )}
      {error && <div style={{ marginTop: 10, color: "#FBBF24", fontSize: 12 }}>{error}</div>}
    </div>
  );
}
