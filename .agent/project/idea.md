# Turbo - The Developer Beat

> **Tagline:** "Strava for Coders"
>
> **Concept:** A social, wellness-focused developer identity platform that transforms how developers track, share, and protect their coding journey.

---

## The Problem Space

### Why Another Time Tracker?

Existing tools like wakatime answer the wrong question. They ask, _"Did you work enough hours?"_ — which breeds anxiety and feels like surveillance.

| Problem | Description |
|---------|-------------|
| **The "Timesheet" Stigma** | Tools feel like managerial surveillance, reducing developers to spreadsheet entries from 2015. |
| **The "Lone Wolf" Fallacy** | Coding is intellectually isolating. A developer can ship a massive feature at 2 AM with zero recognition for their effort. |
| **Invisible Burnout** | Developers mistake "hours worked" for productivity. No feedback loop warns: _"You've been typing for 4 hours straight; your cognitive performance is dropping."_ |
| **Lack of Context** | A graph showing "8 hours of JavaScript" is meaningless. It doesn't distinguish "Refactored the Auth System" from "Fixed CSS padding." |

---

## The Solution

**Turbo is not a time tracker — it's a Developer Lifecycle Platform.**

We shift the paradigm from **Monitoring** → **Recognition**.

| Old Paradigm | Turbo Approach |
|--------------|---------------|
| Hours | **Sessions** — meaningful blocks that tell a story |
| Isolation | **Squads** — real-time presence makes coding multiplayer |
| Data | **Wellness** — data protects users (break reminders, flow analysis) |
| Surveillance | **Privacy-First Context** — AI infers context from metadata, never reads code |

---

## Core Feature Set

### A. The Core Intelligence ("The Tracker")

_The invisible engine running in VS Code._

- **Smart Heartbeats**
  - Tracks: file name, project name, language, branch
  - **Debouncing:** Only logs active typing (ignores idle time)
  - **Privacy Mode:** Toggle between "Full Metadata" or "Stealth Mode" (language + time only)

- **Offline Sync**
  - Queues heartbeats locally in `queue.json` when offline
  - Auto-syncs when connection returns (e.g., coding on a train)

- **"In-The-Zone" Detector**
  - Detects high-velocity typing streaks
  - Marks user as "Flowing" after >20 minutes of consistent typing

---

### B. The Social Layer ("The Strava Feed")

_The primary dashboard — designed to be addictive and supportive._

- **Activity Feed**
  - Scrolling feed of session cards (not bar charts)
  - Example: _"Alex just finished a session: **Late Night Refactor**"_
    - **Visuals:** "Code Galaxy" sparkline (intensity heatmap)
    - **Stats:** 2h 14m • TypeScript • VS Code

- **Kudos & Reactions**
  - Friends give "Kudos": 🔥, ⚡, 🦆 (rubber ducks)
  - Acknowledges hard work without competition

- **Live Squads (Real-Time)**
  - **Green Dot:** See who's online and what language they're writing
  - **Status Beacon:** "Deep Work (DND)" or "Bug Hunting (Help Wanted)"

- **Shareable Assets**
  - "Spotify Wrapped" style images for social media
  - _"I shipped 40 commits this week on Turbo."_

---

### C. The Wellness Layer ("The Oura Ring")

_Features designed to prevent burnout and improve long-term career health._

- **Cadence Alerts**
  - VS Code toast after 90+ min without breaks: _"Your cadence is dropping. Take 5."_

- **Cognitive Freshness Score**
  - Daily score (0-100) based on:
    - Sleep (manual input or inferred from late-night commits)
    - Work intensity patterns

- **"Night Owl" Warning**
  - Flags frequent 2 AM – 5 AM coding as "Burnout Risk"

---

### D. Gamification & Identity ("The RPG")

_Making the grind fun._

- **Cohort Leaderboards**
  - No demotivating global leaderboards
  - Segmented: "React Devs in your Squad", "Weekend Warriors"

- **Personal Records (PRs)**
  - Badges for personal barriers:
    - 🏊 **Deep Diver:** Longest uninterrupted flow state (e.g., 3 hrs)
    - 🌍 **Polyglot:** Used 4+ languages in one week
    - 🏃 **Marathoner:** Coded 7 days in a row

- **XP & Leveling**
  - Rewards **consistency**, not just volume
  - 100 XP for 5-day streak, 10 XP for an hour of code

---

### E. The AI Manager ("Context Without Invasion")

_Using metadata + LLMs to automate boring tasks._

- **Auto-Standup Generator**
  - **Input:** Day's metadata (files: `auth.ts`, `login.tsx`; branch: `fix/login-bug`)
  - **Output:** _"Today I spent 4 hours refactoring the Authentication flow and fixed a critical bug in the Login component."_
  - One-click copy for Slack/Teams

- **Weekly Recap**
  - AI-generated focus summary
  - _"You shifted from Backend (Rust) to Frontend (React) this week."_

---

## Small Features (Micro-Wins)

- "You've made X commits in Y session"
- "You've made X commits in Y minutes/hours/days/weeks/months"
- Commit velocity tracking per session
- Session summaries with commit counts

---

## Technical Architecture

| Component | Technology | Role |
|-----------|------------|------|
| **Extension** | TypeScript | The sensor — captures signals, queues data, handles offline logic |
| **Backend API** | Next.js (App Router) | The gatekeeper — verifies API keys, sanitizes data |
| **Database** | Supabase (Postgres) | The truth source — relational data (Users → Sessions → Heartbeats) |
| **Realtime** | Supabase Realtime | The pulse — powers Live Squads and presence features |
| **Auth** | Better Auth | The identity — handles GitHub login and session management |
| **AI** | OpenAI / Anthropic | The analyst — turns file paths into human-readable summaries |

---

## Data Model (Conceptual)

```
Users
├── Sessions (grouped heartbeats with context)
│   ├── Heartbeats (raw activity signals)
│   ├── Commits (linked git activity)
│   └── Flows (detected flow states)
├── Squads (team memberships)
├── Kudos (received recognition)
├── Badges (earned achievements)
└── Stats (aggregated metrics)
```

---

## Privacy Principles

> [!IMPORTANT]
> Turbo is **privacy-first by design**.

1. **Never read code content** — only metadata (filenames, languages, branches)
2. **User-controlled granularity** — Full Metadata vs Stealth Mode
3. **Local-first queuing** — data stays on device until explicitly synced
4. **Transparent AI** — users see exactly what metadata the AI receives

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Daily Active Users | Growth | Core engagement |
| Sessions Created | Volume | Feature adoption |
| Kudos Given | Engagement | Social layer health |
| Break Alerts Triggered | Wellness | Users protected |
| Standup Copies | Utility | AI value delivered |

---

## Competitive Positioning

| Feature | wakatime | RescueTime | Turbo |
|---------|----------|------------|------|
| Time Tracking | ✅ | ✅ | ✅ |
| Social Feed | ❌ | ❌ | ✅ |
| Real-Time Squads | ❌ | ❌ | ✅ |
| Wellness Alerts | ❌ | ⚠️ | ✅ |
| AI Standups | ❌ | ❌ | ✅ |
| Gamification | Basic | ❌ | ✅ |
| Privacy Controls | ⚠️ | ⚠️ | ✅ |

---

## The Vision

Turbo transforms coding from a solitary, often unhealthy grind into a **recognized, protected, and celebrated craft**.

Every developer deserves to:
- **Be seen** for their effort
- **Be protected** from burnout
- **Be connected** to their community
- **Be proud** of their journey

**Turbo makes the invisible visible.** 🎯
