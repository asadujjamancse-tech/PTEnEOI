# Architecture Guide — PTE 90 Master

This document explains the technical decisions, data flow, and component relationships in the project.

---

## 1. Overall Architecture

The app is a **monolith** — one GitHub repo, one Render service — that serves both the React frontend and the Express API from the same process.

```
                    ┌─────────────────────────────────────┐
                    │           Browser                   │
                    │                                     │
                    │  React 18 + Vite SPA                │
                    │  ┌──────────┐  ┌────────────────┐  │
                    │  │ Practice │  │ Notes / Videos │  │
                    │  │  Tabs    │  │  (Supabase)    │  │
                    │  └──────────┘  └────────────────┘  │
                    └────────┬────────────────┬───────────┘
                             │ /api/*          │ direct HTTPS
                             ▼                 ▼
                    ┌────────────────┐  ┌─────────────────┐
                    │ Express Server │  │    Supabase      │
                    │ (port 3000)   │  │  (PostgreSQL)    │
                    │               │  │  notes           │
                    │ /api/score    │  │  video_links     │
                    │ /api/auth/*   │  │  bookmarks       │
                    │ /api/openai/* │  └─────────────────┘
                    │ static dist/  │
                    └───────┬───────┘
                            │
               ┌────────────┼───────────┐
               ▼            ▼           ▼
         Anthropic       OpenAI     Public EOI
         Claude API      GPT API     Data
```

---

## 2. Frontend Module Map

### Entry point: `src/main.jsx`
- Wraps everything in `ThemeProvider` and `ErrorBoundary`
- `App` component handles the auth lifecycle: `checking → login → authed`
- `AppSwitcher` renders the top nav and switches between the 4 main pages

### Four main pages
| Component | File | Purpose |
|---|---|---|
| PTE Master | `PTEMaster.jsx` | Main practice hub — sidebar + zone tabs |
| Score Weights | `pte-score-weights.jsx` | Official PTE weight reference |
| PR Dashboard | `pte-pr-dashboard_4.jsx` | Australian PR points calculator |
| EOI Pulse | `EOIPulse.jsx` | SkillSelect EOI tracker |

### PTEMaster tab routing
```
PTEMaster
├── ZONES (sidebar top)
│   ├── speaking   → ReadAloudPanel / RepeatSentencePanel / DescribeImagePanel / RetellLecturePanel
│   ├── writing    → SummarizeWrittenPanel / WritingPanel
│   ├── reading    → RWFillBlanksPanel / ReorderPanel / DropdownFillBlanksPanel / ReadingPanel
│   └── listening  → SmartDictationPanel / WriteDictationPanel / SummarizeSpeechPanel / TypeInFillBlanksPanel / ListeningPanel
│
└── TOOLS (sidebar bottom)
    ├── priority  → PriorityIntelligencePanel + DailyChallenges
    ├── scorer    → AI Essay Scorer (Claude)
    ├── tracker   → Score Tracker (Recharts line chart)
    ├── qbank     → AIQuestionBank
    ├── vocab     → RapidFireVocab
    ├── notes     → NotesPanel (Supabase)
    ├── videos    → VideoLibrary (Supabase)
    ├── mock      → MockTestSystem
    ├── planner   → StudyPlanner
    └── analytics → StudyHeatmap + AIWeaknessDetector + AnalyticsDashboard
```

---

## 3. State and Persistence Strategy

The app uses three storage tiers:

| Tier | Technology | What's stored | Survives clear? |
|---|---|---|---|
| In-memory | React `useState` | Current session UI state | No |
| Browser | `localStorage` | Scores, streak, XP, SRS state, challenge completion | Browser only |
| Cloud | Supabase PostgreSQL | Notes, video links, bookmarks | Yes — cross-device |

### localStorage keys in use
| Key | Purpose |
|---|---|
| `pte_sessions` | Score tracker session history |
| `pte_streak_v1` | Streak + last study day |
| `pte_xp_v1` | XP total + daily log |
| `smart_wfd_v1` | Smart Dictation SRS card state |
| `smart_wfd_weak_v1` | Weak word frequency map |
| `rfv_best_streak` | Rapid Vocab best streak |
| `pte_daily_challenges_v1` | Today's challenge completion |
| `app_token` | Auth session token |
| `app_username` | Logged-in username (used as Supabase user_id) |
| `eoi_csv_url` | EOI Pulse auto-sync CSV URL |

---

## 4. Authentication

The app uses a simple custom token system — not OAuth or Supabase Auth.

```
1. User submits username + password
2. POST /api/auth/app/login
3. Server checks APP_USERNAME / APP_PASSWORD from .env
4. Returns a 32-byte random hex token
5. Frontend stores token in localStorage
6. Every page load: POST /api/auth/app/validate with stored token
7. Server checks token against in-memory Set (cleared on restart)
```

> Tokens are in-memory on the server — a server restart clears all sessions and users must log in again.

---

## 5. AI Scoring Flow

```
User pastes essay text
       │
       ▼
POST /api/score  (frontend → Express)
       │
       ▼
Express builds Anthropic messages payload
  - system: detailed PTE scoring rubric prompt
  - user:   task type + student response
       │
       ▼
POST https://api.anthropic.com/v1/messages
       │
       ▼
Response: JSON with scores per rubric dimension
       │
       ▼
Frontend displays score breakdown + feedback
addXP(20, "AI Scorer")  — awards XP to streak system
```

---

## 6. Spaced Repetition (Smart Dictation)

Implements a simplified SM-2 algorithm stored in `localStorage`:

```
Each question card:
  { ef: 2.5, interval: 0, dueAt: timestamp, lastPct: 0 }

After answering:
  score >= 90% → interval *= easeFactor, ef += 0.1   (push out review)
  score 60-89% → interval stays,         ef unchanged  (review soon)
  score < 60%  → interval = 0,           ef -= 0.2    (review tomorrow)

Next question picker:
  1. Filter all questions where Date.now() >= dueAt
  2. Sort: unseen first, then by earliest dueAt, then by difficulty
  3. Return top result
```

---

## 7. Bundle Splitting

Vite `manualChunks` splits the 1MB bundle into separately cacheable files:

| Chunk | Size (gz) | Contents |
|---|---|---|
| `index.js` | ~101 KB | App source code |
| `vendor-supabase` | ~53 KB | @supabase/supabase-js |
| `vendor-motion` | ~40 KB | framer-motion |
| `advanced-panels` | ~7 KB | PTEAdvancedPanels |
| `vendor-charts` | ~158 KB | recharts (loaded when analytics tab opens) |

Charts are the heaviest dependency. Future improvement: lazy-load the analytics tab with `React.lazy()`.

---

## 8. Adding a New Practice Panel

1. Create `src/components/<zone>/<TaskName>Panel.jsx`
2. Import question data from `src/data/<task>Questions.js`
3. Use `useScoreTracker` → `addPracticeScore(zone, score)` to record results
4. Import the panel in `src/PTEMaster.jsx`
5. Add a sub-tab entry in the relevant zone's `[...].map(t => ...)` array
6. Add the render: `{zoneTab === "id" && <TaskNamePanel />}`
7. Run `npm run build` to verify no errors

---

## 9. Adding a New Supabase Table

1. Run `CREATE TABLE` SQL in Supabase SQL Editor
2. Enable RLS: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY`
3. Add open policy: `CREATE POLICY "..." ON <name> FOR ALL USING (true) WITH CHECK (true)`
4. Create CRUD helpers in a new `src/utils/<table>Api.js` or inline in the component
5. Use `supabase` from `src/utils/supabase.js` and `getUserId()` for the `user_id` field
