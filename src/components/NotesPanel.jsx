import { useState, useEffect, useCallback } from "react";
import { supabase, getUserId } from "../utils/supabase";

const NOTE_COLORS = ["#0EA5E9","#A78BFA","#34D399","#FBBF24","#F87171","#EC4899","#F97316"];
const ZONE_TAGS   = ["Speaking","Writing","Reading","Listening","Vocabulary","Grammar","General"];

function emptyNote() {
  return { title: "", content: "", tags: [], color: "#0EA5E9", pinned: false };
}

export default function NotesPanel() {
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [editing, setEditing]     = useState(null); // null | { ...note }
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const userId = getUserId();

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (err) setError(err.message);
    else setNotes(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing?.title?.trim() && !editing?.content?.trim()) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      title:   editing.title   || "",
      content: editing.content || "",
      tags:    editing.tags    || [],
      color:   editing.color   || "#0EA5E9",
      pinned:  editing.pinned  || false,
      updated_at: new Date().toISOString(),
    };
    if (editing.id) {
      await supabase.from("notes").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("notes").insert({ ...payload, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const deleteNote = async (id) => {
    setDeleting(id);
    await supabase.from("notes").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const togglePin = async (note) => {
    await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id);
    load();
  };

  const toggleTag = (tag) => {
    setEditing(e => ({
      ...e,
      tags: e.tags.includes(tag) ? e.tags.filter(t => t !== tag) : [...e.tags, tag],
    }));
  };

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchTag = !tagFilter || (n.tags || []).includes(tagFilter);
    return matchSearch && matchTag;
  });

  // ── Editor modal ──────────────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{editing.id ? "Edit Note" : "New Note"}</div>
          <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {/* Color picker */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {NOTE_COLORS.map(c => (
            <button key={c} onClick={() => setEditing(e => ({ ...e, color: c }))} style={{
              width: 22, height: 22, borderRadius: "50%", background: c, border: editing.color === c ? "3px solid #fff" : "2px solid transparent",
              cursor: "pointer", padding: 0,
            }} />
          ))}
        </div>

        {/* Title */}
        <input
          value={editing.title}
          onChange={e => setEditing(n => ({ ...n, title: e.target.value }))}
          placeholder="Note title…"
          style={{
            width: "100%", padding: "10px 14px", background: "#080E1A", border: `2px solid ${editing.color}40`,
            borderRadius: 9, color: "#F1F5F9", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
            outline: "none", marginBottom: 10, boxSizing: "border-box",
          }}
        />

        {/* Content */}
        <textarea
          value={editing.content}
          onChange={e => setEditing(n => ({ ...n, content: e.target.value }))}
          placeholder="Write your note, strategy, or tips here…"
          rows={8}
          style={{
            width: "100%", padding: "10px 14px", background: "#080E1A", border: `1px solid ${editing.color}30`,
            borderRadius: 9, color: "#E2E8F0", fontSize: 14, fontFamily: "inherit", lineHeight: 1.7,
            outline: "none", resize: "vertical", marginBottom: 12, boxSizing: "border-box",
          }}
        />

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 7 }}>TAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ZONE_TAGS.map(tag => {
              const active = (editing.tags || []).includes(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  padding: "4px 12px", borderRadius: 20, border: `1px solid ${active ? editing.color : "#1E293B"}`,
                  background: active ? `${editing.color}20` : "transparent",
                  color: active ? editing.color : "#64748B",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pin */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={editing.pinned} onChange={e => setEditing(n => ({ ...n, pinned: e.target.checked }))} />
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Pin this note to top</span>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={save} disabled={saving}
            style={{
              padding: "10px 24px", borderRadius: 9, border: "none",
              background: `linear-gradient(135deg, ${editing.color}, ${editing.color}cc)`,
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
          <button onClick={() => setEditing(null)} style={{ padding: "10px 20px", borderRadius: 9, border: "1px solid #1E293B", background: "transparent", color: "#64748B", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Notes list ────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#0F1929", border: "1px solid #1E293B", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>📝 My Notes</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Saved permanently to cloud · {notes.length} notes</div>
        </div>
        <button
          onClick={() => setEditing(emptyNote())}
          style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#0EA5E9,#2563EB)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          + New Note
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          style={{ flex: 1, minWidth: 160, padding: "8px 12px", background: "#080E1A", border: "1px solid #1E293B", borderRadius: 8, color: "#F1F5F9", fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <select
          value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          style={{ padding: "8px 12px", background: "#080E1A", border: "1px solid #1E293B", borderRadius: 8, color: "#94A3B8", fontSize: 13, fontFamily: "inherit" }}
        >
          <option value="">All tags</option>
          {ZONE_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error && <div style={{ color: "#F87171", fontSize: 13, marginBottom: 10 }}>Error: {error}</div>}
      {loading && <div style={{ color: "#475569", fontSize: 13 }}>Loading notes…</div>}

      {/* Notes grid */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
          <div style={{ fontSize: 14 }}>No notes yet. Create your first note!</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {filtered.map(note => (
          <div key={note.id} style={{
            background: "#080E1A", borderRadius: 12,
            border: `1px solid ${note.color}35`,
            borderTop: `3px solid ${note.color}`,
            padding: 14, position: "relative",
          }}>
            {/* Pin indicator */}
            {note.pinned && <div style={{ position: "absolute", top: 10, right: 10, fontSize: 14 }}>📌</div>}

            <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 6, paddingRight: 20, wordBreak: "break-word" }}>
              {note.title || <span style={{ color: "#475569" }}>Untitled</span>}
            </div>

            <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 10, maxHeight: 80, overflow: "hidden", wordBreak: "break-word" }}>
              {note.content || <span style={{ color: "#334155" }}>No content</span>}
            </div>

            {/* Tags */}
            {(note.tags || []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {note.tags.map(tag => (
                  <span key={tag} style={{ background: `${note.color}15`, color: note.color, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{tag}</span>
                ))}
              </div>
            )}

            <div style={{ fontSize: 10, color: "#334155", marginBottom: 10 }}>
              {new Date(note.updated_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setEditing({ ...note })} style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: `1px solid ${note.color}40`, background: `${note.color}10`, color: note.color, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
              <button onClick={() => togglePin(note)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #1E293B", background: "transparent", color: "#64748B", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} title={note.pinned ? "Unpin" : "Pin"}>
                {note.pinned ? "📌" : "📍"}
              </button>
              <button
                onClick={() => deleteNote(note.id)} disabled={deleting === note.id}
                style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid rgba(248,113,113,0.2)", background: "transparent", color: "#F87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
              >
                {deleting === note.id ? "…" : "🗑"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
