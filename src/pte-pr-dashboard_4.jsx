import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from "recharts";
import { useRef } from "react";
import { useTheme } from "./ThemeContext";

// ─── DATA ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "speaking", label: "Speaking", icon: "🎤", color: "#38BDF8", bg: "#0C1F35", border: "#1D4ED8",
    tasks: [
      { name: "Repeat Sentence",            qs: "10–12", feeds: "Listening", pct: 28, critical: true,  note: "" },
      { name: "Read Aloud",                 qs: "6–7",   feeds: "Reading",   pct: 15, critical: true,  note: "" },
      { name: "Summarize Group Discussion", qs: "1–2",   feeds: "Listening", pct: 12, critical: true,  note: "New Aug 2025" },
      { name: "Describe Image",             qs: "3–4",   feeds: "—",         pct: 12, critical: false, note: "" },
      { name: "Respond to a Situation",     qs: "1–2",   feeds: "—",         pct: 10, critical: false, note: "New Aug 2025" },
      { name: "Re-tell Lecture",            qs: "1–2",   feeds: "Listening", pct: 10, critical: false, note: "" },
      { name: "Answer Short Question",      qs: "5–6",   feeds: "Listening", pct:  8, critical: false, note: "" },
    ],
  },
  {
    id: "writing", label: "Writing", icon: "✍️", color: "#A78BFA", bg: "#160C35", border: "#6D28D9",
    tasks: [
      { name: "Write Essay",              qs: "1–2", feeds: "—",       pct: 58, critical: true,  note: "Expanded 0–6 scale" },
      { name: "Summarize Written Text",   qs: "1–2", feeds: "Reading", pct: 25, critical: true,  note: "Content 0–4 (doubled)" },
      { name: "R&W Fill in the Blanks",   qs: "5–6", feeds: "Reading", pct: 17, critical: true,  note: "" },
      { name: "Write From Dictation",     qs: "3–4", feeds: "Listening",pct: 5, critical: false, note: "Minor writing contribution" },
    ],
  },
  {
    id: "reading", label: "Reading", icon: "📖", color: "#34D399", bg: "#052E1C", border: "#065F46",
    tasks: [
      { name: "R&W Fill in the Blanks",       qs: "5–6", feeds: "Writing", pct: 30, critical: true,  note: "" },
      { name: "Fill in Blanks (Drop-down)",   qs: "4–5", feeds: "—",       pct: 22, critical: true,  note: "" },
      { name: "Reorder Paragraphs",           qs: "2–3", feeds: "—",       pct: 18, critical: true,  note: "" },
      { name: "Summarize Written Text",       qs: "1–2", feeds: "Writing", pct: 10, critical: false, note: "" },
      { name: "MCQ Multiple Answers",         qs: "1–2", feeds: "—",       pct:  5, critical: false, note: "⚠ Negative marking" },
      { name: "MCQ Single Answer",            qs: "1–2", feeds: "—",       pct:  5, critical: false, note: "" },
    ],
  },
  {
    id: "listening", label: "Listening", icon: "👂", color: "#FBBF24", bg: "#1C1005", border: "#92400E",
    tasks: [
      { name: "Repeat Sentence",            qs: "10–12", feeds: "Speaking", pct: 25, critical: true,  note: "Highest volume task" },
      { name: "Write From Dictation",       qs: "3–4",   feeds: "Writing",  pct: 20, critical: true,  note: "" },
      { name: "Summarize Spoken Text",      qs: "1–2",   feeds: "—",        pct: 13, critical: true,  note: "" },
      { name: "Fill in Blanks (Type In)",   qs: "2–3",   feeds: "Reading",  pct: 10, critical: false, note: "" },
      { name: "Highlight Incorrect Words",  qs: "2–3",   feeds: "Reading",  pct:  8, critical: false, note: "" },
      { name: "Re-tell Lecture",            qs: "1–2",   feeds: "Speaking", pct:  7, critical: false, note: "" },
      { name: "Others",                     qs: "varies",feeds: "—",        pct: 17, critical: false, note: "MCQ, Highlight Summary, Select Missing Words" },
    ],
  },
];

// Official DHA points — source: immi.homeaffairs.gov.au
const POINTS_CONFIG = {
  age: {
    label: "Age", icon: "🎂",
    hint: "Points at time of invitation (not application)",
    options: [
      { label: "18–24 years", value: 25 },
      { label: "25–32 years", value: 30 },
      { label: "33–39 years", value: 25 },
      { label: "40–44 years", value: 15 },
      { label: "45–49 years", value: 0  },
    ],
  },
  english: {
    label: "English Language", icon: "🌐",
    hint: "DHA update (tests from 7 Aug 2025): Superior PTE = L69 R70 W85 S88 · Proficient = L58 R59 W69 S76 · Competent = L47 R48 W51 S54",
    options: [
      { label: "Superior  — PTE L69 R70 W85 S88 / IELTS 8+", value: 20 },
      { label: "Proficient — PTE L58 R59 W69 S76 / IELTS 7",  value: 10 },
      { label: "Competent  — PTE L47 R48 W51 S54 / IELTS 6",  value: 0  },
    ],
  },
  overseasExp: {
    label: "Overseas Skilled Work Experience", icon: "🌍",
    hint: "In your nominated occupation or closely related",
    options: [
      { label: "8–10 years", value: 15 },
      { label: "5–7 years",  value: 10 },
      { label: "3–4 years",  value:  5 },
      { label: "< 3 years",  value:  0 },
    ],
  },
  ausExp: {
    label: "Australian Skilled Work Experience", icon: "🇦🇺",
    hint: "Lawful employment in Australia in your nominated occupation",
    options: [
      { label: "8–10 years", value: 20 },
      { label: "5–7 years",  value: 15 },
      { label: "3–4 years",  value: 10 },
      { label: "1–2 years",  value:  5 },
      { label: "< 1 year",   value:  0 },
    ],
  },
  qualifications: {
    label: "Educational Qualifications", icon: "🎓",
    hint: "Highest relevant qualification",
    options: [
      { label: "Doctorate — Australian institution",    value: 20 },
      { label: "Bachelor degree or higher",             value: 15 },
      { label: "Diploma / trade qualification (Cert IV+)", value: 10 },
      { label: "No qualification points",               value:  0 },
    ],
  },
  australianStudy: {
    label: "Australian Study", icon: "📚",
    hint: "At least 2 years full-time study at a CRICOS registered institution",
    options: [
      { label: "Yes — 2+ years CRICOS study", value: 5 },
      { label: "No",                           value: 0 },
    ],
  },
  regionalStudy: {
    label: "Regional Study / Low Population Growth Area", icon: "🏡",
    hint: "Completed study in a regional or low population growth area of Australia",
    options: [
      { label: "Yes — studied in regional area", value: 5 },
      { label: "No",                              value: 0 },
    ],
  },
  professionalYear: {
    label: "Professional Year in Australia", icon: "💼",
    hint: "Completed a structured professional year program in accounting, IT, or engineering",
    options: [
      { label: "Yes — completed professional year", value: 5 },
      { label: "No",                                value: 0 },
    ],
  },
  communityLanguage: {
    label: "Credentialled Community Language", icon: "🗣️",
    hint: "Accredited NAATI certification in a community language",
    options: [
      { label: "Yes — NAATI certified",  value: 5 },
      { label: "No",                      value: 0 },
    ],
  },
  partnerSkills: {
    label: "Partner / Spouse Skills", icon: "👫",
    hint: "Partner's qualifications, English and work experience — or if single / citizen partner",
    options: [
      { label: "Partner has skilled occupation + competent English + skills assessment", value: 10 },
      { label: "You are single OR partner is Australian/NZ citizen or PR",              value: 10 },
      { label: "Partner does not meet skilled requirements",                             value:  5 },
      { label: "No points",                                                              value:  0 },
    ],
  },
  nomination: {
    label: "State / Territory Nomination", icon: "📍",
    hint: "Additional points for state or territory nomination",
    options: [
      { label: "Subclass 491 nomination (+15 pts)",  value: 15 },
      { label: "Subclass 190 nomination (+5 pts)",   value:  5 },
      { label: "No nomination (189 independent)",    value:  0 },
    ],
  },
};

// Pre-filled from user's Settledin screenshots
const DEFAULT_VALUES = {
  age: 30,
  english: 10,
  overseasExp: 0,
  ausExp: 5,
  qualifications: 15,
  australianStudy: 5,
  regionalStudy: 5,
  professionalYear: 5,
  communityLanguage: 0,
  partnerSkills: 5,
  nomination: 5,
};

const CSOL_PDF_URL = "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf";
const SKILLED_LIST_URL = "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list";
const FALLBACK_OCCUPATIONS = [
  { code: "333212", title: "Solid Plasterer" },
  { code: "331212", title: "Carpenter" },
  { code: "331211", title: "Carpenter and Joiner" },
  { code: "331213", title: "Joiner" },
  { code: "332211", title: "Painting Trades Worker" },
  { code: "334111", title: "Plumber (General)" },
  { code: "261313", title: "Software Engineer" },
  { code: "261312", title: "Developer Programmer" },
  { code: "254499", title: "Registered Nurses nec" },
  { code: "321211", title: "Motor Mechanic (General)" },
  { code: "351311", title: "Chef" },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function ScoreGauge({ score, max = 90, color, dm }) {
  const pct = Math.min((score / max) * 100, 100);
  const r = 54; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke={dm ? "#1E293B" : "#E2E8F0"} strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray .6s ease" }} />
      <text x="70" y="65" textAnchor="middle" fill={dm ? "#fff" : "#0F172A"} fontSize="28" fontWeight="800" fontFamily="'DM Serif Display', serif">{score}</text>
      <text x="70" y="84" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="'DM Sans', sans-serif">/ 90 pts</text>
    </svg>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(+e.target.value)}
      className="pr-select"
      style={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 13, padding: "8px 12px", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
      {options.map(o => <option key={o.value + o.label} value={o.value}>{o.label} — {o.value > 0 ? "+" : ""}{o.value} pts</option>)}
    </select>
  );
}

const CustomTooltip = ({ active, payload, color }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#0F1929", border: `1px solid ${color}40`, borderRadius: 10, padding: "10px 14px", maxWidth: 210 }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color, fontSize: 18, fontWeight: 800 }}>~{d.pct}%</div>
      <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{d.qs} questions</div>
      {d.feeds !== "—" && <div style={{ color: "#64748B", fontSize: 11 }}>Also feeds: {d.feeds}</div>}
      {d.note && <div style={{ color: "#FBBF24", fontSize: 11, marginTop: 3 }}>{d.note}</div>}
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function App() {
  const { darkMode: dm } = useTheme();
  const [mainTab, setMainTab] = useState("pr");

  // PTE tab state
  const [pteSkill, setPteSkill] = useState("speaking");
  const [pteView, setPteView] = useState("both");

  // PR state
  const [pts, setPts] = useState(() => {
    try {
      return {
        ...DEFAULT_VALUES,
        ...JSON.parse(window.localStorage.getItem('pts') || '{}'),
      };
    } catch (e) {
      return DEFAULT_VALUES;
    }
  });
  const [occupations, setOccupations] = useState(FALLBACK_OCCUPATIONS);
  const [occupationQuery, setOccupationQuery] = useState("");
  const [selectedOccupationCode, setSelectedOccupationCode] = useState("333212");
  const [occupationLoadNote, setOccupationLoadNote] = useState("Loading latest official occupation list...");
  // User-editable EOI state (make the dashboard's `State` field changeable)
  const [eoiState, setEoiState] = useState(() => {
    try {
      return window?.localStorage?.getItem?.('eoiState') || "SA — South Australia";
    } catch (e) {
      return "SA — South Australia";
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem('eoiState', eoiState); } catch (e) { }
  }, [eoiState]);
  useEffect(() => {
    try { window.localStorage.setItem('pts', JSON.stringify(pts)); } catch (e) { }
  }, [pts]);
  // Optional manual overrides and notes for visa point displays (persisted)
  const [visaOverrides, setVisaOverrides] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('visaOverrides') || '{}'); } catch (e) { return {}; }
  });
  useEffect(() => {
    try { window.localStorage.setItem('visaOverrides', JSON.stringify(visaOverrides)); } catch (e) { }
  }, [visaOverrides]);

  // Fetch visa metadata via server proxy to avoid CORS
  useEffect(() => {
    const ids = ['189','190','491'];
    ids.forEach(async (id) => {
      try {
        const r = await fetch(`/api/visa-meta?id=${id}`);
        if (!r.ok) return;
        const j = await r.json();
        setVisaMeta(prev => ({ ...prev, [id]: j }));
      } catch (e) {
        // ignore
      }
    });
  }, []);

  // Apply overrides to totals if present
  const overrideValue = (id, base) => {
    const o = visaOverrides[id];
    return o && typeof o.value === 'number' ? o.value : base;
  };
  const [editingVisa, setEditingVisa] = useState(null);
  const [tempOverride, setTempOverride] = useState("");
  const [tempNote, setTempNote] = useState("");
  // Metadata fetched from DHA pages (last-updated, summary) — best-effort (may be CORS-limited)
  const [visaMeta, setVisaMeta] = useState({});

  useEffect(() => {
    // list of official pages we want to try fetching
    const pages = {
      "189": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
      "190": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
      "491": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
    };

    Object.entries(pages).forEach(async ([id, url]) => {
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) return;
        // try header first
        const last = res.headers.get('last-modified') || res.headers.get('date');
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        // attempt various fallbacks for a summary
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
        const firstPara = doc.querySelector('p')?.textContent?.trim();
        const timeEl = doc.querySelector('time')?.textContent?.trim();
        const summary = (metaDesc || firstPara || '').slice(0, 200);
        setVisaMeta(prev => ({ ...prev, [id]: { lastUpdated: last || timeEl || null, summary: summary || null } }));
      } catch (e) {
        // ignore; CORS will often block this in-browser
      }
    });
  }, []);
  const set = (k, v) => setPts(p => ({ ...p, [k]: v }));

  useEffect(() => {
    let cancelled = false;

    const parseRows = (rawText) => {
      const compact = rawText.replace(/\s+/g, " ");
      const re = /(?:^|\s)(\d{1,3})\s+(\d{6})\s+(.+?)(?=\s+\d{1,3}\s+\d{6}\s+|$)/g;
      const out = [];
      const seen = new Set();
      let match;
      while ((match = re.exec(compact)) !== null) {
        const code = match[2].trim();
        const title = match[3].trim().replace(/\s+/g, " ");
        if (!seen.has(code) && title.length > 1) {
          seen.add(code);
          out.push({ code, title });
        }
      }
      return out;
    };

    const loadFromImmiNominationList = async () => {
      try {
        const response = await fetch(SKILLED_LIST_URL);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const hidden = doc.querySelector("#ctl00_PlaceHolderMain_PageJSONDataHiddenField_Input");
        const raw = hidden?.getAttribute("value");
        if (!raw) throw new Error("Skilled list payload not found");

        const payload = JSON.parse(raw);
        const seen = new Set();
        const parsed = [];

        payload.forEach((item) => {
          const visasText = String(item?.visas || "");
          const nominationEligible = visasText.includes("190 -") || visasText.includes("491 -");
          if (!nominationEligible) return;

          const codeMatch = String(item?.anzscocode || "").match(/\b(\d{6})\b/);
          if (!codeMatch) return;
          const code = codeMatch[1];
          const title = String(item?.occupation || "").trim();
          if (!title) return;

          const listTag = String(item?.list || "").replace(/;/g, "/");
          const key = `${code}-${title}`;
          if (seen.has(key)) return;
          seen.add(key);
          parsed.push({ code, title: `${title} [${listTag}]` });
        });

        if (!cancelled && parsed.length > 200) {
          setOccupations(parsed.sort((a, b) => a.title.localeCompare(b.title)));
          setOccupationLoadNote(`Loaded updated nomination ANZSCO list from Immi (${parsed.length} occupations for 190/491).`);
          return true;
        }
      } catch (error) {
      }
      return false;
    };

    const loadFromPdf = async () => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!window.pdfjsLib) throw new Error("pdfjs not available");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await window.pdfjsLib.getDocument(CSOL_PDF_URL).promise;

        let text = "";
        for (let page = 1; page <= pdf.numPages; page += 1) {
          const p = await pdf.getPage(page);
          const content = await p.getTextContent();
          text += ` ${content.items.map((i) => i.str).join(" ")}`;
        }

        const parsed = parseRows(text);
        if (!cancelled && parsed.length >= 400) {
          setOccupations(parsed);
          setOccupationLoadNote(`Loaded latest CSOL from DHA PDF (${parsed.length} occupations).`);
        } else if (!cancelled) {
          setOccupationLoadNote("Using fallback list. Could not fully parse CSOL PDF in-browser.");
        }
      } catch (error) {
        if (!cancelled) {
          setOccupationLoadNote("Using fallback list. Open with internet to auto-load latest CSOL.");
        }
      }
    };

    (async () => {
      const loadedNomination = await loadFromImmiNominationList();
      if (!loadedNomination) {
        await loadFromPdf();
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOccupations = useMemo(() => {
    const q = occupationQuery.trim().toLowerCase();
    if (!q) return occupations;
    const matches = occupations.filter((o) => `${o.code} ${o.title}`.toLowerCase().includes(q));
    return matches.length ? matches : occupations;
  }, [occupations, occupationQuery]);

  const selectedOccupation = useMemo(() => {
    return occupations.find((o) => o.code === selectedOccupationCode) || FALLBACK_OCCUPATIONS[0];
  }, [occupations, selectedOccupationCode]);

  useEffect(() => {
    if (!occupations.some((o) => o.code === selectedOccupationCode) && occupations.length) {
      setSelectedOccupationCode(occupations[0].code);
    }
  }, [occupations, selectedOccupationCode]);

  const total = useMemo(() => Object.values(pts).reduce((a, b) => a + b, 0), [pts]);
  // computed (raw) totals based on current pts selections
  const computedBaseTotal = useMemo(() => Object.entries(pts).reduce((a, [k, v]) => k === "nomination" ? a : a + v, 0), [pts]);
  const computedWith190 = computedBaseTotal + 5;
  const computedWith491 = computedBaseTotal + 15;

  // Apply any manual visa overrides (if present) so the dashboard reflects user-entered totals
  const baseTotal = useMemo(() => overrideValue('189', computedBaseTotal), [visaOverrides, computedBaseTotal]);
  const with190 = useMemo(() => overrideValue('190', computedWith190), [visaOverrides, computedWith190]);
  const with491 = useMemo(() => overrideValue('491', computedWith491), [visaOverrides, computedWith491]);

  const englishUpgrade = pts.english === 10 ? 10 : pts.english === 0 ? 20 : 0;
  const projectedWithSuperiorEnglish = total + englishUpgrade;

  const scoreColor = (s) => s >= 90 ? "#34D399" : s >= 80 ? "#FBBF24" : s >= 65 ? "#FB923C" : "#F87171";
  const viabilityLabel = (s) => s >= 90 ? "🟢 Very Competitive for 189" : s >= 80 ? "🟡 Strong — Target 190 / 491" : s >= 65 ? "🟠 Eligible — Focus on 491" : "🔴 Below Threshold";

  const breakdown = Object.entries(pts).map(([k, v]) => ({
    name: POINTS_CONFIG[k]?.label.replace("/ Territory", "").replace("Credentialled Community Language", "Community Language"),
    pts: v,
    color: v >= 15 ? "#38BDF8" : v >= 10 ? "#A78BFA" : v >= 5 ? "#34D399" : "#334155",
  })).filter(d => d.pts > 0);

  const pteSection = SECTIONS.find(s => s.id === pteSkill);

  const MAIN_TABS = [
    { id: "pr",  icon: "🇦🇺", label: "PR Points Calculator" },
    { id: "pte", icon: "📊", label: "PTE Score Weights" },
  ];

  // List of Australian states/territories for the EOI selector
  const AU_STATES = [
    "NSW — New South Wales",
    "VIC — Victoria",
    "QLD — Queensland",
    "WA — Western Australia",
    "SA — South Australia",
    "TAS — Tasmania",
    "ACT — Australian Capital Territory",
    "NT — Northern Territory",
  ];

  const EOI_ROWS = [
    { label: "Occupation", val: `${selectedOccupation.code} ${selectedOccupation.title}` },
    { label: "State", val: eoiState, isState: true },
    { label: "EOIs in pool", val: "6 (+20% ↑)" },
    { label: "Pool date", val: "Apr 2026" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: dm ? "#070D1A" : "#F0F4F8", color: dm ? "#fff" : "#0F172A", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button, select { font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0F1929; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .main-tab { background: none; border: none; cursor: pointer; padding: 14px 22px; font-size: 14px; font-weight: 700; border-bottom: 2px solid transparent; transition: all .2s; color: #475569; white-space: nowrap; }
        .main-tab.active { color: #fff; border-bottom-color: #38BDF8; }
        .main-tab:hover:not(.active) { color: #94A3B8; }
        .skill-tab { background: none; border: none; cursor: pointer; padding: 10px 16px; font-size: 13px; font-weight: 600; border-bottom: 2px solid transparent; transition: all .2s; color: #475569; }
        .skill-tab.active { color: #fff; border-bottom-color: currentColor; }
        .view-btn { border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all .2s; border: 1px solid #1E293B; background: #0F1929; color: #64748B; }
        .view-btn.active { color: #fff; }
        .field-label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
        .field-hint { font-size: 10px; color: #334155; margin-bottom: 6px; line-height: 1.4; }
        .pts-chip { display: inline-block; border-radius: 6px; padding: 1px 8px; font-size: 12px; font-weight: 800; }
  .visa-card { border-radius: 14px; padding: 16px 18px; border: 1px solid; }
  .visa-detail { font-size: 11px; color: #94A3B8; margin-top: 6px; line-height: 1.3; }
  .visa-edit-btn { background: transparent; border: 1px solid #334155; color: #38BDF8; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-size: 12px; }
  .visa-save { background: #34D399; border: none; color: #042014; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-weight: 700; }
  .visa-cancel { background: #1E293B; border: 1px solid #334155; color: #94A3B8; padding: 6px 8px; border-radius: 8px; cursor: pointer; }
  .visa-input { background: #07101a; border: 1px solid #334155; color: #fff; padding: 6px 8px; border-radius: 6px; width: 100%; }
  .visa-link { color: #38BDF8; font-size: 12px; text-decoration: none; margin-left: 8px; border: 1px solid transparent; padding: 4px 6px; border-radius: 6px; }
  .visa-link:hover { text-decoration: underline; }
  /* Styled tooltip */
  .visa-tooltip { position: relative; }
  .visa-tooltip .tip { display: none; position: absolute; right: 0; top: 120%; width: 320px; background: #07101a; border: 1px solid #334155; padding: 10px; border-radius: 8px; color: #cbd5e1; font-size: 12px; z-index: 60; box-shadow: 0 6px 20px rgba(2,6,23,0.6); }
  .visa-tooltip:hover .tip, .visa-tooltip:focus-within .tip { display: block; }
  .visa-tooltip .tip h4 { margin: 0 0 6px 0; font-size: 13px; color: #fff; }
  .visa-tooltip .tip p { margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; }
  /* Compact horizontal visa row (used above nominated occupation) */
  .visa-mini-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .visa-mini { background: #0A1222; border-radius: 12px; padding: 10px 12px; border: 1px solid #1E293B; min-width: 110px; text-align: center; }
        .info-note { background: #0C1B35; border: 1px solid #1D4ED8; border-radius: 10px; padding: 10px 14px; font-size: 11px; color: #60A5FA; line-height: 1.6; }
        /* Responsive layout for score gauge + visa cards */
  .score-visa-row { display: flex; gap: 12px; align-items: flex-start; }
  /* Left column: visa cards horizontally laid out on desktop */
  .visa-cards { flex: 0 0 320px; display: flex; flex-direction: row; gap: 8px; align-items: flex-start; }
  .visa-cards .visa-card { flex: 1 1 0; }

        /* Tablet: two columns for visa cards and slightly narrower left column */
        @media (max-width: 1024px) and (min-width: 721px) {
          .score-left { flex: 0 0 280px; }
          .visa-cards { grid-template-columns: repeat(2, 1fr); }
        }

        /* Mobile: stack vertically and make selects full width */
        @media (max-width: 720px) {
          .score-visa-row { flex-direction: column; }
          .score-left { flex: none; width: 100%; }
          .visa-cards { grid-template-columns: 1fr; }
          .visa-card { width: 100%; }
          select { width: 100%; }
        }

        /* ── Light mode overrides ── */
        [data-theme="light"] ::-webkit-scrollbar-track { background: #F0F4F8; }
        [data-theme="light"] ::-webkit-scrollbar-thumb { background: #CBD5E1; }
        [data-theme="light"] .main-tab { color: rgba(0,0,0,0.45); }
        [data-theme="light"] .main-tab.active { color: #0F172A; border-bottom-color: #0EA5E9; }
        [data-theme="light"] .main-tab:hover:not(.active) { color: rgba(0,0,0,0.65); }
        [data-theme="light"] .skill-tab { color: rgba(0,0,0,0.45); }
        [data-theme="light"] .skill-tab.active { color: #0F172A; }
        [data-theme="light"] .view-btn { background: #F1F5F9; border-color: #E2E8F0; color: rgba(0,0,0,0.45); }
        [data-theme="light"] .field-label { color: #64748B; }
        [data-theme="light"] .field-hint { color: #94A3B8; }
        [data-theme="light"] .info-note { background: #EFF6FF; border-color: #93C5FD; color: #1D4ED8; }
        [data-theme="light"] .visa-mini { background: #F8FAFC; border-color: #E2E8F0; }
        [data-theme="light"] .visa-card { background: #FFFFFF !important; }
        [data-theme="light"] .visa-detail { color: #64748B; }
        [data-theme="light"] .visa-edit-btn { background: transparent; border-color: #E2E8F0; color: #0EA5E9; }
        [data-theme="light"] .visa-cancel { background: #F1F5F9; border-color: #E2E8F0; color: #64748B; }
        [data-theme="light"] .visa-input { background: #FFFFFF; border-color: #CBD5E1; color: #0F172A; }
        [data-theme="light"] .visa-link { color: #0EA5E9; }
        [data-theme="light"] .visa-tooltip .tip { background: #FFFFFF; border-color: #E2E8F0; color: #475569; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        [data-theme="light"] .visa-tooltip .tip h4 { color: #0F172A; }
        [data-theme="light"] .pr-header { background: #FFFFFF !important; border-bottom-color: #E2E8F0 !important; }
        [data-theme="light"] .pr-tabs-bar { background: #FFFFFF !important; border-bottom-color: #E2E8F0 !important; }
        [data-theme="light"] .pr-card { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .pr-select { background: #FFFFFF !important; border-color: #CBD5E1 !important; color: #0F172A !important; }
        [data-theme="light"] .pr-row-item { background: #F8FAFC !important; }
        [data-theme="light"] .pr-circle-card { background: #FFFFFF !important; border-color: rgba(0,0,0,0.1) !important; }
        [data-theme="light"] .pr-breakdown-card { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-card { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .sw-tab-btn-inactive { background: #F1F5F9 !important; border-color: #CBD5E1 !important; color: rgba(0,0,0,0.5) !important; }
        [data-theme="light"] .pr-card input,
        [data-theme="light"] .pr-card select { background: #FFFFFF !important; border-color: #CBD5E1 !important; color: #0F172A !important; }
        [data-theme="light"] .pr-row-item select { background: #F8FAFC !important; border-color: #CBD5E1 !important; color: #0F172A !important; }
        [data-theme="light"] .pr-card .pr-visa-desc { color: #475569 !important; }
        [data-theme="light"] .pr-card .pr-visa-desc strong { color: #0F172A !important; }
        [data-theme="light"] .pr-breakdown-card .pr-breakdown-label { color: #64748B !important; }
        [data-theme="light"] .pr-circle-card .pr-gauge-label { color: #64748B !important; }
        [data-theme="light"] .pr-eoi-strategy { background: #F0FDF4 !important; border-color: #86EFAC !important; }
        [data-theme="light"] .pr-eoi-strategy .pr-eoi-text { color: #475569 !important; }
      `}</style>

      {/* ── Top header ── */}
      <div className="pr-header" style={{ background: "#0A1222", borderBottom: "1px solid #1E293B", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20 }}>
            Australia <span style={{ color: "#38BDF8", fontStyle: "italic" }}>PR & PTE</span> Dashboard
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Points Calculator · EOI Strategy · PTE Score Weights</div>
        </div>
        <div style={{ fontSize: 11, color: "#334155" }}>Asadujjaman · {selectedOccupation.title} {selectedOccupation.code} · Onshore</div>
      </div>

      {/* ── Main tabs ── */}
      <div className="pr-tabs-bar" style={{ background: "#0A1222", borderBottom: "1px solid #1E293B", paddingLeft: 24, display: "flex" }}>
        {MAIN_TABS.map(t => (
          <button key={t.id} className={`main-tab${mainTab === t.id ? " active" : ""}`} onClick={() => setMainTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — PR POINTS CALCULATOR
      ══════════════════════════════════════════════ */}
      {mainTab === "pr" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

          {/* PTE → PR connection banner */}
          {pts.english < 20 && (
            <div style={{ background: "linear-gradient(135deg,#0C1B35,#160C35)", border: "1px solid #7C3AED", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28 }}>⚡</div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ color: "#A78BFA", fontWeight: 800, fontSize: 14, marginBottom: 3 }}>PTE Superior = +{englishUpgrade} MORE PR POINTS</div>
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Your current English score is <strong style={{ color: "#FBBF24" }}>{pts.english} pts (Proficient)</strong>. 
                  Reaching <strong style={{ color: "#34D399" }}>PTE Superior threshold (L69 R70 W85 S88)</strong> gives you <strong style={{ color: "#34D399" }}>Superior English = 20 pts</strong>, 
                  pushing your total from <strong style={{ color: "#F87171" }}>{total} → {projectedWithSuperiorEnglish} pts</strong>.
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 18px", background: "#1A0D2E", borderRadius: 12, border: "1px solid #7C3AED" }}>
                <div style={{ color: "#A78BFA", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Projected score</div>
                <div style={{ color: "#34D399", fontSize: 32, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>{projectedWithSuperiorEnglish}</div>
                <div style={{ color: "#64748B", fontSize: 10 }}>with PTE Superior threshold</div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

            {/* ── LEFT: inputs ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, marginBottom: 4 }}>Your Points Profile</div>
                <div style={{ fontSize: 12, color: "#475569" }}>Pre-filled from your Settledin profile · Adjust any field to recalculate</div>
              </div>

              {/* Visa cards moved above nominated occupation (moved from right column) */}
              <div className="visa-cards" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { id: "189", label: "189", type: "Independent", total: baseTotal, threshold: 85, color: "#38BDF8", note: "Permanent · Anywhere in AU", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189" },
                  { id: "190", label: "190", type: "Nominated",   total: with190,   threshold: 75, color: "#A78BFA", note: "+5 pts · State commitment 2yr", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190" },
                  { id: "491", label: "491", type: "Regional",    total: with491,   threshold: 65, color: "#34D399", note: "+15 pts · Regional 3yr → PR 191", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491" },
                ].map(v => {
                  const displayVal = visaOverrides[v.id]?.value ?? v.total;
                  const overrideNote = visaOverrides[v.id]?.note || "";
                  const eligible = displayVal >= 65;
                  const competitive = displayVal >= v.threshold;
                    return (
                    <a key={v.id} href={v.href || '#'} target="_blank" rel="noreferrer" title={(visaMeta[v.id]?.lastUpdated ? `Updated: ${visaMeta[v.id].lastUpdated}\n` : '') + (visaMeta[v.id]?.summary ? visaMeta[v.id].summary : '')} style={{ textDecoration: 'none' }}>
                      <div className="visa-card" style={{ borderColor: competitive ? v.color + "60" : "#1E293B", background: competitive ? v.color + "08" : "#0A1222", padding: "12px", minWidth: 160, cursor: 'pointer' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 12, color: "#94A3B8", display: 'flex', alignItems: 'center', gap: 8 }} className="visa-tooltip">{v.label} · {v.type}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 6 }}>
                                <path d="M14 3h7v7" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 14L21 3" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 21H3V3h7" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="tip" role="tooltip">
                                <h4>{v.label} · {v.type}</h4>
                                <p>{visaMeta[v.id]?.summary || 'Live details at the official DHA page.'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <small style={{ color: '#64748b' }}>{visaMeta[v.id]?.lastUpdated ? `Updated: ${visaMeta[v.id].lastUpdated}` : ''}</small>
                                  <a className="visa-link" href={v.href} target="_blank" rel="noreferrer">Open page</a>
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: competitive ? v.color : "#F1F5F9" }}>{displayVal}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                            <div style={{ fontSize: 11, padding: "4px 8px", borderRadius: 8, background: competitive ? v.color+"20" : "#0F1929", color: competitive ? v.color : "#94A3B8", fontWeight: 700 }}>{competitive ? 'STRONG' : eligible ? 'ELIGIBLE' : 'LOW'}</div>
                            {editingVisa === v.id ? (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="visa-save" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const val = Number(tempOverride) || 0; setVisaOverrides(prev => ({ ...prev, [v.id]: { value: val, note: tempNote } })); setEditingVisa(null); }}>Save</button>
                                <button className="visa-cancel" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingVisa(null); }}>Cancel</button>
                              </div>
                            ) : (
                              <button className="visa-edit-btn" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingVisa(v.id); setTempOverride(String(displayVal)); setTempNote(overrideNote); }}>Edit</button>
                            )}
                          </div>
                        </div>
                        <div className="visa-detail">{v.note}</div>
                        <div className="visa-detail">Threshold for strong consideration: <strong>{v.threshold}</strong> pts</div>
                        <div className="visa-detail">Notes: {overrideNote || '—'}</div>
                        {editingVisa === v.id && (
                          <div style={{ marginTop: 8, display: "grid", gap: 8 }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                            <input className="visa-input" type="number" value={tempOverride} onChange={e => setTempOverride(e.target.value)} />
                            <textarea className="visa-input" rows={2} value={tempNote} onChange={e => setTempNote(e.target.value)} />
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="pr-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: "14px 16px" }}>
                <div className="field-label">🧰 Nominated Occupation</div>
                <div className="field-hint">Search and change anytime. Source: DHA Core Skills Occupation List (auto-load).</div>
                <input
                  value={occupationQuery}
                  onChange={(e) => setOccupationQuery(e.target.value)}
                  placeholder="Search ANZSCO code or occupation title"
                  style={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 13, padding: "8px 12px", width: "100%", marginBottom: 8, outline: "none" }}
                />
                <select
                  value={selectedOccupationCode}
                  onChange={(e) => setSelectedOccupationCode(e.target.value)}
                  style={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 13, padding: "8px 12px", width: "100%", outline: "none" }}
                >
                  {filteredOccupations.slice(0, 1000).map((occ) => (
                    <option key={occ.code} value={occ.code}>{occ.code} — {occ.title}</option>
                  ))}
                </select>
                <div style={{ marginTop: 8, color: "#64748B", fontSize: 11 }}>{occupationLoadNote}</div>
              </div>

              {/* Grid of selects */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {Object.entries(POINTS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="pr-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: "14px 16px" }}>
                    <div className="field-label">{cfg.icon} {cfg.label}</div>
                    <div className="field-hint">{cfg.hint}</div>
                    <Select value={pts[key]} onChange={v => set(key, v)} options={cfg.options} />
                    <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ height: 3, flex: 1, background: "#1E293B", borderRadius: 2, overflow: "hidden", marginRight: 10 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: pts[key] >= 15 ? "#38BDF8" : pts[key] >= 10 ? "#A78BFA" : pts[key] >= 5 ? "#34D399" : "#334155", width: `${Math.min((pts[key] / Math.max(...cfg.options.map(o => o.value))) * 100, 100)}%`, transition: "width .3s" }}></div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: pts[key] > 0 ? "#F1F5F9" : "#334155" }}>+{pts[key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Source note */}
              <div className="info-note">
                ℹ️ Points based on official <strong>Department of Home Affairs points table</strong> (immi.homeaffairs.gov.au) · Current occupation: <strong>{selectedOccupation.code} {selectedOccupation.title}</strong> · Minimum threshold: 65 pts
              </div>
            </div>

            {/* ── RIGHT: results ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>

              {/* Visa cards on the left, score gauge + breakdown centered */}
              <div className="score-visa-row" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div className="score-center" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                  {/* Score gauge */}
                  <div className="pr-circle-card" style={{ background: "#0A1222", border: `2px solid ${scoreColor(total)}30`, borderRadius: 18, padding: "24px 20px", textAlign: "center", width: "100%" }}>
                    <div style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>YOUR TOTAL SCORE</div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <ScoreGauge score={total} color={scoreColor(total)} dm={dm} />
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: scoreColor(total) }}>{viabilityLabel(total)}</div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Base (no nomination): <strong style={{ color: "#fff" }}>{baseTotal}</strong></div>
                    </div>
                  </div>

                  {/* Editable Points Breakdown */}
                  <div className="pr-breakdown-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 14, padding: "12px 14px", width: "100%" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>POINTS BREAKDOWN</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {Object.keys(POINTS_CONFIG).map((k) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>{POINTS_CONFIG[k].label}</div>
                          <div style={{ width: 170 }}>
                            <Select value={pts[k]} onChange={(v) => set(k, v)} options={POINTS_CONFIG[k].options} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* EOI context from screenshot */}
              <div className="pr-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#94A3B8" }}>📋 Your EOI Pool Status (from Settledin)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {EOI_ROWS.map(r => (
                    <div key={r.label} className="pr-row-item" style={{ background: "#0F1929", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>
                        {r.isState ? (
                          <select value={eoiState} onChange={(e) => setEoiState(e.target.value)}
                            style={{ background: "#0F1929", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 12, padding: "6px 8px", width: "100%", outline: "none" }}>
                            {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          r.val
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pr-eoi-strategy" style={{ background: "#052E1C", borderRadius: 8, padding: "10px 12px", border: "1px solid #065F46" }}>
                  <div style={{ color: "#34D399", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>💡 EOI Strategy</div>
                  <div className="pr-eoi-text" style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>
                    Only <strong style={{ color: "#fff" }}>6 EOIs</strong> in your SA 190 pool at 80 pts — very low competition. 
                    With PTE Superior threshold, you'd reach <strong style={{ color: "#34D399" }}>{projectedWithSuperiorEnglish} pts</strong>, 
                    making your 189 pathway strong without needing state nomination.
                  </div>
                </div>
              </div>

              <div className="pr-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#94A3B8" }}>🛂 Visa descriptions</div>
                {[
                  { visa: "189", text: "Skilled Independent visa. Permanent residence, points-tested, no state sponsorship required." },
                  { visa: "190", text: "Skilled Nominated visa. Permanent residence with state/territory nomination (+5 points)." },
                  { visa: "491", text: "Skilled Work Regional (Provisional). Regional provisional visa with state/family sponsorship (+15 points)." },
                  { visa: "191", text: "Permanent Residence (Skilled Regional). PR pathway after meeting 491/494 regional income and residency requirements." },
                ].map((v) => (
                  <div key={v.visa} className="pr-visa-desc" style={{ marginBottom: 8, fontSize: 12, lineHeight: 1.5, color: dm ? "#CBD5E1" : "#475569" }}>
                    <strong style={{ color: dm ? "#fff" : "#0F172A" }}>Subclass {v.visa}:</strong> {v.text}
                  </div>
                ))}
              </div>

              <div className="pr-card" style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#94A3B8" }}>🔗 Official links</div>
                {[
                  { label: "ImmiAccount login portal", href: "https://online.immi.gov.au/lusc/login" },
                  { label: "DHA visa finder", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder" },
                  { label: "Subclass 189 details", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189" },
                  { label: "Subclass 190 details", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190" },
                  { label: "Subclass 491 details", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491" },
                  { label: "Subclass 191 details", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/permanent-residence-skilled-regional-191" },
                  { label: "Skilled occupation list", href: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list" },
                  { label: "Pearson PTE portal", href: "https://www.pearsonpte.com/" },
                  { label: "Pearson account sign in", href: "https://www.pearsonpte.com/test-takers/sign-in" },
                ].map((l) => (
                  <div key={l.href} style={{ marginBottom: 7 }}>
                    <a href={l.href} target="_blank" rel="noreferrer" style={{ color: "#38BDF8", fontSize: 12, textDecoration: "none" }}>{l.label}</a>
                  </div>
                ))}
              </div>

              {/* (Points breakdown moved above the gauge and made editable) */}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2 — PTE SCORE WEIGHTS
      ══════════════════════════════════════════════ */}
      {mainTab === "pte" && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.4px" }}>
              PTE Score <span style={{ fontStyle: "italic", color: "#38BDF8" }}>Weight</span> Dashboard
            </div>
            <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
              Approximate task contributions per skill · Pearson Official Score Guide · Aug 2025 format
            </p>
          </div>

          <div className="info-note" style={{ marginBottom: 20 }}>
            ℹ️ <strong>Pearson does not publish exact percentages.</strong> Estimates based on official question counts × max score points from pearsonpte.com Score Guide. Actual weight varies slightly per test version (52–64 tasks per test).
          </div>

          {/* Skill tabs */}
          <div className="sw-card" style={{ background: "#0A1222", borderBottom: "1px solid #1E293B", display: "flex", marginBottom: 20, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            {SECTIONS.map(s => (
              <button key={s.id} className={`skill-tab${pteSkill === s.id ? " active" : ""}`}
                onClick={() => setPteSkill(s.id)}
                style={{ color: pteSkill === s.id ? s.color : "#475569", borderBottomColor: pteSkill === s.id ? s.color : "transparent", flex: 1 }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "flex-end" }}>
            {[["table","📋 Table"],["chart","📊 Chart"],["both","⊞ Both"]].map(([v, l]) => (
              <button key={v} className={`view-btn${pteView===v?" active":""}`}
                onClick={() => setPteView(v)}
                style={pteView===v ? { borderColor: pteSection.color, background: pteSection.color+"15", color: pteSection.color } : {}}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* TABLE */}
            {(pteView === "table" || pteView === "both") && (
              <div className="sw-card" style={{ flex: pteView==="both" ? "1 1 420px" : "1 1 100%", background: "#0A1222", border: `1px solid ${pteSection.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: pteSection.bg, borderBottom: `1px solid ${pteSection.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{pteSection.icon}</span>
                  <div>
                    <div style={{ color: pteSection.color, fontWeight: 800, fontSize: 15 }}>{pteSection.label} Score</div>
                    <div style={{ color: "#475569", fontSize: 11 }}>Approximate task weight contribution</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 80px", padding: "10px 20px", borderBottom: "1px solid #1E293B" }}>
                  {["Task","Qs","Also Feeds","Weight"].map((h, i) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em", textAlign: i > 0 ? "center" : "left" }}>{h}</div>
                  ))}
                </div>
                {pteSection.tasks.map((task, i) => {
                  const isTop = task.pct >= 20; const isMed = task.pct >= 10 && task.pct < 20;
                  const barW = (task.pct / pteSection.tasks[0].pct) * 100;
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 80px", padding: "12px 20px", borderBottom: i < pteSection.tasks.length-1 ? "1px solid #0F1929" : "none", background: isTop ? pteSection.bg : "transparent", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isTop ? pteSection.color : isMed ? pteSection.color+"99" : "#334155", flexShrink: 0 }}></div>
                          <span style={{ fontSize: 13, fontWeight: isTop ? 700 : 500, color: isTop ? "#F1F5F9" : "#94A3B8" }}>{task.name}</span>
                          {task.critical && <span style={{ fontSize: 9, fontWeight: 800, color: pteSection.color, background: pteSection.color+"15", padding: "1px 5px", borderRadius: 4, textTransform: "uppercase" }}>VVI</span>}
                        </div>
                        {task.note && <div style={{ marginLeft: 12, fontSize: 10, color: task.note.includes("⚠") ? "#F87171" : "#FBBF24", marginTop: 2 }}>{task.note}</div>}
                        <div style={{ marginLeft: 12, marginTop: 5, height: 3, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${barW}%`, height: "100%", background: `linear-gradient(90deg,${pteSection.color},${pteSection.color}88)`, borderRadius: 2 }}></div>
                        </div>
                      </div>
                      <div style={{ textAlign: "center", fontSize: 12, color: "#64748B", fontWeight: 600 }}>{task.qs}</div>
                      <div style={{ textAlign: "center" }}>
                        {task.feeds !== "—" ? <span style={{ fontSize: 11, background: "#1E293B", color: "#94A3B8", borderRadius: 6, padding: "2px 8px" }}>{task.feeds}</span>
                          : <span style={{ fontSize: 11, color: "#334155" }}>—</span>}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: isTop ? pteSection.color : isMed ? pteSection.color+"CC" : "#475569" }}>~{task.pct}%</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 80px", padding: "10px 20px", borderTop: `1px solid ${pteSection.border}`, background: pteSection.bg }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>Total</div>
                  <div /><div />
                  <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: pteSection.color }}>100%</div>
                </div>
              </div>
            )}

            {/* CHART COLUMN */}
            {(pteView === "chart" || pteView === "both") && (
              <div style={{ flex: pteView==="both" ? "1 1 280px" : "1 1 100%", display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="sw-card" style={{ background: "#0A1222", border: `1px solid ${pteSection.border}`, borderRadius: 14, padding: "18px" }}>
                  <div style={{ color: pteSection.color, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{pteSection.icon} {pteSection.label} Breakdown</div>
                  <ResponsiveContainer width="100%" height={pteSection.tasks.length * 42 + 8}>
                    <BarChart layout="vertical" data={pteSection.tasks} margin={{ left: 0, right: 36, top: 0, bottom: 0 }} barSize={16}>
                      <XAxis type="number" domain={[0, pteSection.tasks[0].pct + 8]} tick={false} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={155} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 22 ? v.slice(0,21)+"…" : v} />
                      <Tooltip content={<CustomTooltip color={pteSection.color} />} cursor={{ fill: pteSection.color+"08" }} />
                      <Bar dataKey="pct" radius={[0,6,6,0]}>
                        {pteSection.tasks.map((t, i) => <Cell key={i} fill={t.pct>=20 ? pteSection.color : t.pct>=10 ? pteSection.color+"99" : pteSection.color+"44"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 80% rule */}
                <div style={{ background: "#0C1B35", border: "1px solid #1D4ED8", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: "#60A5FA", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>⚡ 80% of {pteSection.label} score</div>
                  {(() => { let c=0; return pteSection.tasks.filter(t=>{ const o=c>=80; c+=t.pct; return !o; }).map((t,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0F1929", borderRadius:8, padding:"7px 12px", marginBottom:6 }}>
                      <div style={{ fontSize:12, color:"#CBD5E1", fontWeight:600 }}>{t.name}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:pteSection.color }}>~{t.pct}%</div>
                    </div>
                  )); })()}
                </div>

                {/* Dual-skill */}
                {pteSection.tasks.some(t=>t.feeds!=="—") && (
                  <div style={{ background: "#1A1305", border: "1px solid #92400E", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ color: "#FBBF24", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>🔄 Dual-Skill Tasks</div>
                    {pteSection.tasks.filter(t=>t.feeds!=="—").map((t,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                        <span style={{ fontSize:12, color:"#D97706" }}>{t.name}</span>
                        <span style={{ fontSize:11, background:"#292105", color:"#FBBF24", borderRadius:6, padding:"2px 8px" }}>→ {t.feeds}</span>
                      </div>
                    ))}
                    <div style={{ fontSize:11, color:"#78350F", marginTop:8 }}>Every correct response scores in TWO skills simultaneously.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* All sections summary */}
          <div className="sw-card" style={{ marginTop: 24, background: "#0A1222", border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E293B" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>📌 All Sections — Tasks with ≥20% weight</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
              {SECTIONS.map((s,si) => (
                <div key={s.id} style={{ borderRight: si<3 ? "1px solid #1E293B" : "none", padding: "16px" }}>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: 12, marginBottom: 10 }}>{s.icon} {s.label}</div>
                  {s.tasks.filter(t=>t.pct>=20).map((t,i)=>(
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 600, lineHeight: 1.3 }}>{t.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                        <div style={{ flex:1, height:4, background:"#1E293B", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ width:`${t.pct}%`, height:"100%", background:s.color, borderRadius:2 }}></div>
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, color:s.color }}>~{t.pct}%</span>
                      </div>
                      {t.feeds!=="—" && <div style={{ fontSize:10, color:"#64748B", marginTop:2 }}>+ feeds {t.feeds}</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, textAlign: "center", fontSize: 10, color: "#334155" }}>
            Source: Pearson PTE Academic Official Score Guide (pearsonpte.com) · August 2025 format · Estimates only
          </div>
        </div>
      )}
    </div>
  );
}
