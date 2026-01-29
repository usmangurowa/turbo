# **Application Overview: Turbo**

**Tagline:** The Developer Beat.
**Concept:** A social, wellness-focused developer identity platform. "Strava for Coders."

## **The Mission**

**Why Turbo?**
Unlike wakatime (which monitors hours/surveillance), Turbo focuses on **Recognition**, **Context**, and **Wellness**. It shifts the narrative from "Did you work enough?" to "Look what you achieved."

### **Core Differentiators**

1.  **From "Hours" to "Sessions"**: Like a run on Strava, coding sessions tell a story with a start, finish, and stats.
2.  **From "Isolation" to "Squads"**: Real-time presence ("Green Dot") makes remote coding feel multiplayer.
3.  **From "Data" to "Wellness"**: Protects users from burnout (Cadence alerts, Night Owl warnings) rather than just logging grind.
4.  **Privacy-First Context**: Uses AI on metadata (filenames, branches) to infer context without reading code.

## **Feature Set**

### **1. The Core Intelligence (The "Tracker")**
- **Smart Heartbeats**: Tracks file, project, language, branch. Debounced active typing only.
- **Privacy Mode**: "Full Metadata" vs "Stealth Mode".
- **Offline Sync**: Queues heartbeats locally when offline.
- **Flow Detection**: >20 mins high-velocity typing = "Flowing".

### **2. The Social Layer (The "Strava Feed")**
- **Activity Feed**: Scrolling feed of "Sessions" cards.
- **Session Card**: Includes "Code Galaxy" (heatmap), stats, language.
- **Kudos & Reactions**: Social proof (🔥, ⚡, 🦆).
- **Live Squads**: Real-time status (Deep Work/Bug Hunting).

### **3. The Wellness Layer (The "Oura Ring")**
- **Cadence Alerts**: Break reminders after 90m intensity.
- **Cognitive Freshness Score**: Daily 0-100 score based on sleep/work patterns.
- **Burnout Warnings**: Flags frequent 2AM-5AM work.

### **4. Gamification & Identity**
- **Cohort Leaderboards**: "React Devs in your Squad" (not global).
- **Personal Records (PRs)**: Deep Diver, Polyglot, Marathoner.
- **XP & Leveling**: Based on consistency, not just volume.

### **5. The AI Manager**
- **Auto-Standup Generator**: Summarizes daily metadata into human-readable standups.
- **Weekly Recap**: AI summary of focus shifts.

## **Technical Pillars**
- **Extension**: VS Code (TypeScript) - *The Sensor*
- **API**: Next.js App Router - *The Gatekeeper*
- **Database**: Supabase (Postgres) - *The Truth Source*
- **Realtime**: Supabase Realtime - *The Pulse*
- **Auth**: Better Auth - *The Identity*
- **AI**: LLMs (OpenAI/Anthropic) - *The Analyst*
