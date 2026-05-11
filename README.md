# PTE 90 Master

> An AI-powered PTE Academic practice platform built with React, Vite, Express and Supabase.  
> Covers all four skill zones — Speaking, Writing, Reading, Listening — with spaced repetition, streak tracking, cloud-saved notes and video library.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start (Local)](#quick-start-local)
5. [Environment Variables](#environment-variables)
6. [Deploy to Render](#deploy-to-render)
7. [Supabase Setup](#supabase-setup)
8. [Architecture Overview](#architecture-overview)
9. [Scripts](#scripts)
10. [License](#license)

---

## Features

### Practice Modes
| Feature | Description |
|---|---|
| **Read Aloud** | 35s prep + 40s speaking; scores Speaking + Reading simultaneously |
| **Repeat Sentence** | Verbal memory drills; scores Speaking + Listening |
| **Describe Image** | 4-part template trainer with 25s prep |
| **Re-tell Lecture** | Audio → speech recall; keyword noting |
| **Write Essay** | 200–300 word argumentative writing with AI scoring |
| **Summarize Written Text** | Single-sentence summary discipline (5–75 words) |
| **R&W Fill in the Blanks** | Drag-and-drop collocation practice |
| **Reorder Paragraph** | Discourse structure training |
| **Write From Dictation** | Verbatim transcription; highest Listening weight (22%) |
| **Summarize Spoken Text** | 60s lecture → 50–70 word written summary |
| **Fill Blanks (Type In)** | Listening + exact spelling under audio pressure |

### Smart Features
| Feature | Description |
|---|---|
| **Smart Dictation (SRS)** | Spaced repetition (SM-2 algorithm), weak-word tracker, accent variation |
| **Rapid Fire Vocab** | 30-second streak game with 30 PTE vocabulary words |
| **AI Scorer** | Claude-powered essay and task scoring with rubric breakdown |
| **AI Weakness Detector** | Analyses score history, ranks weak zones, gives targeted tips |
| **Daily Challenges** | 3 rotating daily tasks with XP rewards, resets at midnight |
| **Streak + XP System** | Daily study streak, 11-level XP progression, session rewards |
| **Study Heatmap** | 15-week GitHub-style activity grid |

### Cloud Storage (Supabase)
| Feature | Description |
|---|---|
| **My Notes** | Color-coded notes with tags, search, pin-to-top — saved permanently |
| **Video Library** | Save YouTube/any video URLs with thumbnails, zone tags, personal notes |

### Navigation Sections
- **PTE Master** — all practice tabs + tools sidebar
- **Score Weights** — official PTE scoring weights per task
- **PR Dashboard** — Australian PR points calculator
- **EOI Pulse** — SkillSelect EOI tracker with public invitation round data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Framer Motion |
| Backend | Node.js, Express 4 |
| Database | Supabase (PostgreSQL) |
| AI Scoring | Anthropic Claude API |
| Charts | Recharts |
| Styling | Inline styles + CSS-in-JS (no Tailwind, no CSS modules) |
| Auth | Custom token auth via Express |
| Deploy | Render (Web Service) |

---

## Project Structure

```
pte-app/
├── server/
│   └── index.js              # Express backend — auth, AI proxy, static serving
│
├── src/
│   ├── main.jsx              # App entry — auth flow, nav, ThemeProvider
│   ├── index.css             # Global resets and base styles
│   ├── ThemeContext.jsx      # Dark/light mode context + localStorage persistence
│   │
│   ├── PTEMaster.jsx         # Main practice hub — sidebar, tabs, zone routing
│   ├── PTEWeights.jsx        # Score weights reference page (re-export)
│   ├── pte-score-weights.jsx # Score weights UI with interactive breakdown
│   ├── pte-pr-dashboard_4.jsx# PR points calculator dashboard
│   ├── EOIPulse.jsx          # EOI waiting/invited/lodged tracker
│   │
│   ├── components/
│   │   ├── LoginScreen.jsx         # Animated login page with orbital letters
│   │   ├── ErrorBoundary.jsx       # React error boundary wrapper
│   │   ├── AITutorChat.jsx         # Floating AI tutor chat widget
│   │   ├── AIWeaknessDetector.jsx  # Score trend analysis + zone tips
│   │   ├── DailyChallenges.jsx     # 3 daily rotating tasks with XP
│   │   ├── EssayFeedbackPanel.jsx  # Essay AI feedback display
│   │   ├── EOIInsightsPanel.jsx    # EOI prediction + insights
│   │   ├── FeatureShell.jsx        # Generic panel shell/wrapper
│   │   ├── NotesPanel.jsx          # Cloud notes (Supabase CRUD)
│   │   ├── VideoLibrary.jsx        # Cloud video library (Supabase CRUD)
│   │   ├── PriorityIntelligencePanel.jsx # Smart study priority recommendations
│   │   ├── PriorityTaskDetail.jsx  # Task detail modal
│   │   ├── PTEAdvancedPanels.jsx   # Mock tests, analytics, gamification, planner
│   │   ├── RapidFireVocab.jsx      # 30-second vocab streak game
│   │   ├── StreakXPBanner.jsx      # Streak flame + XP level bar
│   │   ├── StudyHeatmap.jsx        # 15-week activity heatmap
│   │   │
│   │   ├── listening/
│   │   │   ├── SmartDictationPanel.jsx   # SRS-powered dictation
│   │   │   ├── WriteDictationPanel.jsx   # Standard Write From Dictation
│   │   │   ├── SummarizeSpeechPanel.jsx  # Summarize Spoken Text
│   │   │   └── TypeInFillBlanksPanel.jsx # Fill Blanks (Type In)
│   │   │
│   │   ├── speaking/
│   │   │   ├── RepeatSentencePanel.jsx   # Repeat Sentence
│   │   │   ├── DescribeImagePanel.jsx    # Describe Image
│   │   │   └── RetellLecturePanel.jsx    # Re-tell Lecture
│   │   │
│   │   ├── reading/
│   │   │   ├── RWFillBlanksPanel.jsx     # R&W Fill in the Blanks
│   │   │   ├── ReorderPanel.jsx          # Reorder Paragraph
│   │   │   └── DropdownFillBlanksPanel.jsx # Fill Blanks (Drop-down)
│   │   │
│   │   ├── writing/
│   │   │   └── SummarizeWrittenPanel.jsx # Summarize Written Text
│   │   │
│   │   ├── readAloud/
│   │   │   ├── ReadAloudPanel.jsx        # Read Aloud practice UI
│   │   │   └── ReadAloudPractice.jsx     # Read Aloud recording logic
│   │   │
│   │   └── practice/
│   │       ├── ListeningPanel.jsx        # General listening practice
│   │       ├── ReadingPanel.jsx          # General reading practice
│   │       └── WritingPanel.jsx          # General writing practice
│   │
│   ├── data/
│   │   ├── writeDictationQuestions.js    # 30 WFD sentences (Easy/Medium/Hard)
│   │   ├── readAloudQuestions.js         # Read Aloud passages
│   │   ├── repeatSentenceQuestions.js    # Repeat Sentence audio prompts
│   │   ├── retellQuestions.js            # Re-tell Lecture prompts
│   │   ├── summarizeSpeechQuestions.js   # Summarize Spoken Text audio
│   │   ├── summarizeWrittenQuestions.js  # Summarize Written Text passages
│   │   ├── writingQuestions.js           # Essay prompts
│   │   ├── rwFillBlanksQuestions.js      # R&W Fill in the Blanks
│   │   ├── reorderQuestions.js           # Reorder Paragraph sets
│   │   ├── typeInFillBlanksQuestions.js  # Type In Fill Blanks
│   │   ├── listeningQuestions.js         # General listening
│   │   └── readingQuestions.js           # General reading
│   │
│   ├── hooks/
│   │   ├── useScoreTracker.js      # Session score CRUD + localStorage sync
│   │   ├── useStreakXP.js          # Daily streak, XP, level system
│   │   ├── usePracticeStorage.js   # IndexedDB practice recording storage
│   │   ├── useReadAloudStorage.js  # Read Aloud specific storage
│   │   └── useLocalStorage.js      # Generic localStorage hook
│   │
│   └── utils/
│       ├── supabase.js             # Supabase client + getUserId helper
│       ├── apiClient.js            # Fetch wrappers for backend endpoints
│       ├── claudeScorer.js         # Claude API scoring logic
│       ├── pteIntelligence.js      # Priority and study intelligence engine
│       ├── idb.js                  # IndexedDB wrapper (recordings store)
│       ├── readAloudScorer.js      # Read Aloud scoring algorithm
│       ├── writingScorer.js        # Writing task scoring
│       ├── readingScorer.js        # Reading task scoring
│       ├── listeningScorer.js      # Listening task scoring
│       ├── generatePracticeQuestions.js   # Dynamic question generation
│       └── generateReadAloudQuestions.js  # Read Aloud question generation
│
├── public/
│   └── manifest.webmanifest  # PWA manifest
│
├── .env.example              # Environment variable template
├── .gitignore
├── index.html                # Vite HTML entry
├── vite.config.js            # Vite config + manual chunk splitting
├── package.json
└── README.md
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+ 
- npm 9+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/asadujjamancse-tech/PTEnEOI.git
cd PTEnEOI/pte-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your keys (see Environment Variables below)

# 4. Start the Express backend (terminal 1)
npm run server

# 5. Start the Vite dev server (terminal 2)
npm run dev
```

Open **http://localhost:5173** — Vite proxies all `/api/*` requests to Express on port 3000.

---

## Environment Variables

Create a `.env` file in the `pte-app/` directory:

```env
# ── App login (protects the whole app) ──────────────────────────────────────
APP_USERNAME=your_username
APP_PASSWORD=your_password

# ── AI Scoring (Anthropic Claude) ───────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── AI Tutor Chat (OpenAI) ───────────────────────────────────────────────────
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# ── Supabase (cloud notes, video library, bookmarks) ─────────────────────────
# VITE_ prefix required — Vite bakes these into the frontend bundle at build time
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Security:** Never commit `.env` to git. It is already in `.gitignore`.  
> **VITE_ prefix:** Any variable the browser needs must start with `VITE_` — Vite replaces these at build time. Server-only keys (Anthropic, OpenAI) must NOT have the prefix.

---

## Deploy to Render

1. Push the repo to GitHub
2. Go to **dashboard.render.com** → New → **Web Service**
3. Connect your GitHub repository
4. Fill in the fields:

| Field | Value |
|---|---|
| **Root Directory** | `pte-app` |
| **Build Command** | `npm install; npm run build` |
| **Start Command** | `node server/index.js` |
| **Instance Type** | Free (or higher) |

5. Add **Environment Variables** in Render dashboard (same keys as `.env`)
6. Click **Deploy**

The Express server serves the built `dist/` as static files and handles all `/api/*` routes — one service covers both frontend and backend.

---

## Supabase Setup

1. Create a free project at **supabase.com**
2. Go to **SQL Editor** and run:

```sql
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null default '',
  content text not null default '',
  tags text[] default '{}',
  color text default '#0EA5E9',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table video_links (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  url text not null,
  zone text default '',
  notes text default '',
  created_at timestamptz default now()
);

create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  task_id text not null,
  task_name text not null,
  zone text not null,
  note text default '',
  created_at timestamptz default now()
);

alter table notes enable row level security;
alter table video_links enable row level security;
alter table bookmarks enable row level security;

create policy "open_notes" on notes for all using (true) with check (true);
create policy "open_videos" on video_links for all using (true) with check (true);
create policy "open_bookmarks" on bookmarks for all using (true) with check (true);
```

3. Copy your **Project URL** and **anon public key** from Settings → API
4. Add them to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Architecture Overview

```
Browser
  │
  ├── React App (Vite build)
  │     ├── src/main.jsx          — auth gate, app shell, theme
  │     ├── src/PTEMaster.jsx     — practice hub with sidebar + tabs
  │     ├── src/EOIPulse.jsx      — EOI tracker
  │     ├── src/pte-pr-dashboard  — PR points calculator
  │     └── src/pte-score-weights — scoring weight reference
  │
  ├── /api/* requests
  │     │
  │     └── Express Server (server/index.js :3000)
  │           ├── POST /api/auth/app/login    — credential validation
  │           ├── POST /api/auth/app/validate — token check
  │           ├── POST /api/score             — Claude AI scoring proxy
  │           ├── POST /api/openai/*          — OpenAI tutor proxy
  │           └── GET  /api/invitation-rounds — EOI public data
  │
  └── Supabase (direct from browser)
        ├── notes table    — cloud notes
        ├── video_links    — saved video URLs
        └── bookmarks      — task bookmarks

Local Persistence (localStorage)
  ├── Streak + XP data
  ├── Smart Dictation SRS state
  ├── Weak word history
  ├── Score tracker sessions
  └── Daily challenge completion
```

---

## Scripts

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run server   # Start Express backend (port 3000)
```

---

## License

Copyright © 2025 Asadujjaman (Prince Rafa). All rights reserved.  
See [LICENSE](./LICENSE) for full terms.
