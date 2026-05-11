import { useState, useEffect, useCallback } from "react";
import { supabase, getUserId } from "../utils/supabase";

const ZONES = ["Speaking", "Writing", "Reading", "Listening", "Vocabulary", "General"];

function emptyVideo() {
  return { title: "", url: "", zone: "General", notes: "" };
}

// Extract YouTube video ID for thumbnail
function ytThumb(url) {
  try {
    const u = new URL(url);
    let id = u.searchParams.get("v");
    if (!id && u.hostname === "youtu.be") id = u.pathname.slice(1);
    if (!id) {
      const m = url.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (m) id = m[1];
    }
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  } catch { return null; }
}

function isYouTube(url) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

const ZONE_COLOR = {
  Speaking: "#38BDF8", Writing: "#A78BFA", Reading: "#34D399",
  Listening: "#FBBF24", Vocabulary: "#F97316", General: "#64748B",
};

export default function VideoLibrary() {
  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [zoneFilter, setZone]     = useState("");
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState(emptyVideo());
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const userId = getUserId();

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("video_links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setVideos(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    await supabase.from("video_links").insert({
      user_id: userId,
      title: form.title.trim(),
      url: form.url.trim(),
      zone: form.zone,
      notes: form.notes.trim(),
      created_at: new Date().toISOString(),
    });
    setSaving(false);
    setAdding(false);
    setForm(emptyVideo());
    load();
  };

  const del = async (id) => {
    setDeleting(id);
    await supabase.from("video_links").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const filtered = videos.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.title.toLowerCase().includes(q) || (v.notes || "").toLowerCase().includes(q);
    const matchZone = !zoneFilter || v.zone === zoneFilter;
    return matchSearch && matchZone;
  });

  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>🎬 Video Library</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Saved permanently · {videos.length} videos</div>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#A78BFA,#6366f1)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          + Add Video
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: "#080E1A", border: "1px solid #A78BFA40", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#A78BFA" }}>Add New Video</div>

          <input
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Video title…"
            style={{ width: "100%", padding: "9px 12px", background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8, boxSizing: "border-box" }}
          />
          <input
            value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="Paste YouTube or any video URL…"
            style={{ width: "100%", padding: "9px 12px", background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8, boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <select
              value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
              style={{ padding: "8px 12px", background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, color: "#94A3B8", fontSize: 13, fontFamily: "inherit" }}
            >
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <textarea
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes about this video (optional)…"
            rows={2}
            style={{ width: "100%", padding: "9px 12px", background: "#0A1222", border: "1px solid #1E293B", borderRadius: 8, color: "#E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", marginBottom: 10, boxSizing: "border-box" }}
          />

          {/* YouTube preview */}
          {form.url && isYouTube(form.url) && ytThumb(form.url) && (
            <img src={ytThumb(form.url)} alt="preview" style={{ width: "100%", maxWidth: 280, borderRadius: 8, marginBottom: 10, border: "1px solid #1E293B" }} />
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving || !form.title.trim() || !form.url.trim()} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#A78BFA,#6366f1)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Video"}
            </button>
            <button onClick={() => { setAdding(false); setForm(emptyVideo()); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #1E293B", background: "transparent", color: "#64748B", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + zone filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search videos…"
          style={{ flex: 1, minWidth: 140, padding: "8px 12px", background: "#080E1A", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <select
          value={zoneFilter} onChange={e => setZone(e.target.value)}
          style={{ padding: "8px 12px", background: "#080E1A", border: "1px solid #1E293B", borderRadius: 8, color: "#94A3B8", fontSize: 13, fontFamily: "inherit" }}
        >
          <option value="">All zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {error && <div style={{ color: "#F87171", fontSize: 13, marginBottom: 10 }}>Error: {error}</div>}
      {loading && <div style={{ color: "#475569", fontSize: 13 }}>Loading videos…</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
          <div style={{ fontSize: 14 }}>No videos saved yet. Add your first study video!</div>
        </div>
      )}

      {/* Video grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {filtered.map(v => {
          const thumb = ytThumb(v.url || "");
          const zColor = ZONE_COLOR[v.zone] || "#64748B";
          return (
            <div key={v.id} style={{ background: "#080E1A", borderRadius: 12, border: "1px solid #1E293B", overflow: "hidden" }}>
              {/* Thumbnail */}
              {thumb ? (
                <a href={v.url} target="_blank" rel="noreferrer">
                  <img src={thumb} alt={v.title} style={{ width: "100%", display: "block", borderBottom: "1px solid #1E293B" }} />
                </a>
              ) : (
                <a href={v.url} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 90, background: "#0A1222", borderBottom: "1px solid #1E293B",
                  fontSize: 32, textDecoration: "none",
                }}>🎬</a>
              )}

              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <a href={v.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#F1F5F9", textDecoration: "none", lineHeight: 1.4 }}>
                    {v.title}
                  </a>
                </div>

                <span style={{ display: "inline-block", background: `${zColor}15`, color: zColor, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                  {v.zone}
                </span>

                {v.notes && (
                  <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, marginBottom: 8, maxHeight: 48, overflow: "hidden" }}>{v.notes}</div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, color: "#334155" }}>
                    {new Date(v.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </div>
                  <button onClick={() => del(v.id)} disabled={deleting === v.id} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(248,113,113,0.2)", background: "transparent", color: "#F87171", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    {deleting === v.id ? "…" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
