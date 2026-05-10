import React, { useState } from "react";

const PROVIDERS = [
  { id: "claude",  label: "Claude",  color: "#C084FC" },
  { id: "openai",  label: "ChatGPT", color: "#34D399" },
  { id: "gemini",  label: "Gemini",  color: "#FBBF24" },
];

function getStored(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? v : fallback; } catch { return fallback; }
}

export default function AITutorChat() {
  const [open, setOpen]         = useState(false);
  const [provider, setProvider] = useState(() => getStored("pte_tutor_provider", "claude"));
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask for PTE strategy, feedback, weak-skill drills, or question explanations." },
  ]);

  function switchProvider(id) {
    setProvider(id);
    localStorage.setItem("pte_tutor_provider", id);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        const providerName = PROVIDERS.find(p => p.id === provider)?.label || provider;
        const msg = data.error?.includes("not configured")
          ? `${providerName} API key is not set. Add it to .env and restart the server, or switch to Claude.`
          : (data.error || "Something went wrong. Try again.");
        setMessages([...next, { role: "assistant", content: msg }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply || localReply(input) }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Cannot reach the server. Make sure it is running on port 3000." }]);
    } finally {
      setLoading(false);
    }
  }

  const activeProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  return (
    <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 200 }}>
      {open && (
        <div style={{ width: 340, maxWidth: "calc(100vw - 36px)", background: "#0A1222", border: "1px solid #334155", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,.45)", display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: 10 }}>

          {/* Header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>AI Tutor</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>Powered by {activeProvider.label}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {/* Provider tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1E293B" }}>
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => switchProvider(p.id)}
                style={{
                  flex: 1, padding: "8px 0", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: provider === p.id ? "#0F1929" : "transparent",
                  color: provider === p.id ? p.color : "#475569",
                  borderBottom: provider === p.id ? `2px solid ${p.color}` : "2px solid transparent",
                  transition: "all .15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 0, maxHeight: 340 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: m.role === "user" ? "#0EA5E9" : "#0F1929",
                color: "#fff", border: "1px solid #1E293B", borderRadius: 12,
                padding: "8px 10px", fontSize: 12, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ color: "#64748B", fontSize: 12 }}>Thinking…</div>}
          </div>

          {/* Input */}
          <div style={{ padding: 10, borderTop: "1px solid #1E293B", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ask your PTE tutor…"
              style={{ flex: 1, background: "#0F1929", border: "1px solid #334155", borderRadius: 10, color: "#fff", padding: "9px 10px", outline: "none", fontSize: 13 }}
            />
            <button
              onClick={send}
              style={{ background: activeProvider.color, border: "none", color: provider === "openai" ? "#000" : "#fff", fontWeight: 800, borderRadius: 10, padding: "0 12px", cursor: "pointer", fontSize: 13 }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: "#0EA5E9", color: "#fff", border: "1px solid #38BDF8", borderRadius: 999, padding: "12px 16px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(14,165,233,.35)", fontSize: 13 }}
      >
        AI Tutor
      </button>
    </div>
  );
}

function localReply(input) {
  const text = input.toLowerCase();
  if (text.includes("essay")) return "For essays, protect Form first: 200-300 words, four paragraphs, clear opinion, and controlled sentence length. Then improve grammar and vocabulary.";
  if (text.includes("repeat")) return "Repeat Sentence improves Speaking and Listening together. Train meaning chunks, not word-by-word memory, and keep speaking even if you miss words.";
  if (text.includes("reading")) return "For Reading, prioritise R&W Fill in the Blanks, then Reorder Paragraph. Check part of speech before meaning.";
  return "Focus on the highest ROI task for your weakest skill today, then do one short review set for mistakes from yesterday.";
}
