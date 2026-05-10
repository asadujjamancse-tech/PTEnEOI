import { useState, useEffect } from "react";
import { saveResource, getResourcesByTask, deleteResource } from "../utils/idb";

const ZONE_COLOR = { S: "#38BDF8", W: "#A78BFA", R: "#34D399", L: "#FBBF24" };
const ZONE_NAME  = { S: "Speaking", W: "Writing",  R: "Reading", L: "Listening" };

function ytId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function loadLinks(taskId) {
  try { return JSON.parse(localStorage.getItem(`pte_links_${taskId}`) || "[]"); } catch { return []; }
}
function persistLinks(taskId, links) {
  localStorage.setItem(`pte_links_${taskId}`, JSON.stringify(links));
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileIcon(type) {
  if (type.startsWith("image/")) return "🖼";
  if (type === "application/pdf") return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.startsWith("text/")) return "📋";
  return "📎";
}

export default function PriorityTaskDetail({ task, customTip, onSaveTip, onClose }) {
  const [tip, setTip]     = useState(customTip ?? task.tip);
  const [dirty, setDirty] = useState(false);

  const [tab, setTab]         = useState("links");
  const [links, setLinks]     = useState(() => loadLinks(task.id));
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  const [files, setFiles]         = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [preview, setPreview]     = useState(null); // { url, name }

  useEffect(() => {
    getResourcesByTask(task.id).then(setFiles).catch(() => {});
  }, [task.id]);

  const save  = () => { onSaveTip(task.id, tip); setDirty(false); };
  const reset = () => { setTip(task.tip); setDirty(true); };

  function addLink() {
    if (!linkUrl.trim()) return;
    const next = [...links, { id: `link-${Date.now()}`, url: linkUrl.trim(), label: linkLabel.trim() || linkUrl.trim() }];
    setLinks(next);
    persistLinks(task.id, next);
    setLinkUrl("");
    setLinkLabel("");
  }

  function removeLink(id) {
    const next = links.filter(l => l.id !== id);
    setLinks(next);
    persistLinks(task.id, next);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    try {
      const item = {
        id: `res-${task.id}-${Date.now()}`,
        blob: file,
        metadata: { taskId: task.id, name: file.name, type: file.type, size: file.size, added: new Date().toISOString() },
      };
      await saveResource(item);
      setFiles(prev => [...prev, item]);
    } catch (err) {
      console.error("file save failed", err);
    } finally {
      setFileLoading(false);
      e.target.value = "";
    }
  }

  async function removeFile(id) {
    await deleteResource(id).catch(() => {});
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  function openFile(item) {
    const url = URL.createObjectURL(item.blob);
    if (item.metadata.type.startsWith("image/")) {
      setPreview({ url, name: item.metadata.name });
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = item.metadata.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  }

  const zc = ZONE_COLOR[task.zone];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 16px", overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Image full-screen preview */}
      {preview && (
        <div
          onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          <img src={preview.url} alt={preview.name} style={{ maxWidth: "92vw", maxHeight: "86vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 0 60px rgba(0,0,0,.8)" }} />
          <div style={{ color: "#64748B", fontSize: 12, marginTop: 10 }}>{preview.name} — click anywhere to close</div>
        </div>
      )}

      <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 16, width: "100%", maxWidth: 680, boxShadow: "0 32px 80px rgba(0,0,0,.6)" }}>

        {/* ── Header ── */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#E2E8F0" }}>{task.name}</div>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {task.skills.map(s => (
                <span key={s} style={{ display: "inline-block", background: "#1E293B", color: "#94A3B8", borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>{s}</span>
              ))}
              <span style={{ color: task.vvi === 5 ? "#FBBF24" : "#94A3B8", fontSize: 13, letterSpacing: 1 }}>
                {"★".repeat(task.vvi)}{"☆".repeat(5 - task.vvi)}
              </span>
              <span style={{ background: task.vvi === 5 ? "#78350F" : "#1E3A2F", color: task.vvi === 5 ? "#FCD34D" : "#6EE7B7", fontSize: 10, fontWeight: 800, borderRadius: 4, padding: "2px 7px", letterSpacing: .5 }}>
                {task.vvi === 5 ? "CRITICAL" : "HIGH"}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4, marginLeft: 12, flexShrink: 0 }}>✕</button>
        </div>

        {/* ── Weight + Brief ── */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1E293B", display: "flex", gap: 14 }}>
          <div style={{ background: "#071226", border: `1px solid ${zc}30`, borderRadius: 12, padding: "14px 18px", minWidth: 120, textAlign: "center" }}>
            <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Score Weight</div>
            <div style={{ color: zc, fontSize: 30, fontWeight: 800, marginTop: 6, lineHeight: 1 }}>~{task.weight}%</div>
            <div style={{ color: "#475569", fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>of {ZONE_NAME[task.zone]}<br />score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>About This Task</div>
            <div style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 1.75 }}>{task.brief}</div>
          </div>
        </div>

        {/* ── Strategy Notes ── */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1E293B" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>
              My Strategy Notes <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", fontSize: 11 }}>— edit freely</span>
            </div>
            {customTip && customTip !== task.tip && (
              <span style={{ fontSize: 10, color: "#38BDF8", background: "#0F2A3F", borderRadius: 4, padding: "2px 6px" }}>customised</span>
            )}
          </div>
          <textarea
            rows={5}
            value={tip}
            onChange={e => { setTip(e.target.value); setDirty(true); }}
            style={{ background: "#071226", border: "1px solid #334155", borderRadius: 10, color: "#E2E8F0", fontSize: 13, padding: "10px 14px", width: "100%", outline: "none", resize: "vertical", lineHeight: 1.7, fontFamily: "inherit", boxSizing: "border-box", transition: "border .2s" }}
            onFocus={e => e.target.style.borderColor = "#0EA5E9"}
            onBlur={e => e.target.style.borderColor = "#334155"}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={save} disabled={!dirty}
              style={{ background: dirty ? "#0EA5E9" : "#1E293B", border: "none", color: dirty ? "#fff" : "#475569", fontWeight: 700, borderRadius: 10, cursor: dirty ? "pointer" : "not-allowed", padding: "8px 18px", fontSize: 13, fontFamily: "inherit", transition: "all .2s" }}>
              {dirty ? "Save Notes" : "Saved ✓"}
            </button>
            <button onClick={reset}
              style={{ background: "none", border: "none", color: "#64748B", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
              Reset to default
            </button>
          </div>
        </div>

        {/* ── Resources ── */}
        <div style={{ padding: "18px 24px" }}>
          <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>
            My Resources <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", fontSize: 11 }}>— videos, screenshots, PDFs, docs</span>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2, background: "#071226", borderRadius: 8, padding: 3, marginBottom: 14 }}>
            {[
              { id: "links", label: `Video Links${links.length ? ` (${links.length})` : ""}` },
              { id: "files", label: `Files${files.length ? ` (${files.length})` : ""}` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "7px 0", border: "none", borderRadius: 6, cursor: "pointer",
                fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
                background: tab === t.id ? "#0F1929" : "transparent",
                color: tab === t.id ? "#E2E8F0" : "#475569",
              }}>{t.label}</button>
            ))}
          </div>

          {/* ─── Links tab ─── */}
          {tab === "links" && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <input
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addLink(); }}
                  placeholder="Paste YouTube or any tutorial URL…"
                  style={{ flex: 2, background: "#071226", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "8px 10px", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#0EA5E9"}
                  onBlur={e => e.target.style.borderColor = "#334155"}
                />
                <input
                  value={linkLabel}
                  onChange={e => setLinkLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addLink(); }}
                  placeholder="Label (optional)"
                  style={{ flex: 1, background: "#071226", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "8px 10px", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#0EA5E9"}
                  onBlur={e => e.target.style.borderColor = "#334155"}
                />
                <button onClick={addLink}
                  style={{ background: zc, border: "none", color: "#000", fontWeight: 800, borderRadius: 8, padding: "0 14px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  + Add
                </button>
              </div>

              {links.length === 0 ? (
                <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
                  No links yet. Paste a YouTube tutorial URL above and press + Add.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map(link => {
                    const vid = ytId(link.url);
                    return (
                      <div key={link.id} style={{ background: "#071226", border: "1px solid #1E293B", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                        {vid ? (
                          <img
                            src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                            alt=""
                            style={{ width: 88, height: 52, objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 88, height: 52, background: "#0F1929", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔗</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</div>
                          <div style={{ color: "#475569", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{link.url}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, padding: "0 10px", flexShrink: 0 }}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                            style={{ background: "#0EA5E9", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none", cursor: "pointer", display: "inline-block" }}>
                            Open ↗
                          </a>
                          <button onClick={() => removeLink(link.id)}
                            style={{ background: "none", border: "1px solid #334155", color: "#64748B", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Files tab ─── */}
          {tab === "files" && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 12, background: "#071226", border: "1px dashed #334155", borderRadius: 10, padding: "14px 16px", cursor: fileLoading ? "not-allowed" : "pointer", marginBottom: 12, transition: "border .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = zc}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
              >
                <span style={{ fontSize: 26 }}>📁</span>
                <div>
                  <div style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600 }}>
                    {fileLoading ? "Saving file…" : "Click to add a file"}
                  </div>
                  <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
                    Screenshots (PNG/JPG) · PDFs · Word docs · Text files
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.md"
                  onChange={handleFile}
                  disabled={fileLoading}
                  style={{ display: "none" }}
                />
              </label>

              {files.length === 0 ? (
                <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
                  No files yet. Upload a screenshot, PDF, or document above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {files.map(f => {
                    const m = f.metadata;
                    const isImage = m.type.startsWith("image/");
                    return (
                      <div key={f.id} style={{ background: "#071226", border: "1px solid #1E293B", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{fileIcon(m.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                          <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>
                            {fmtSize(m.size)} · {new Date(m.added).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openFile(f)}
                            style={{ background: isImage ? "#0EA5E9" : "#1E3A2F", color: isImage ? "#fff" : "#6EE7B7", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            {isImage ? "View" : "↓ Download"}
                          </button>
                          <button onClick={() => removeFile(f.id)}
                            style={{ background: "none", border: "1px solid #334155", color: "#64748B", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
