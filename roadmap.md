📋 ORDERED BUILD TASK LIST
🔵 Phase 0 — Setup (Day 1)

 T-00 Run all install commands above
 T-01 Create GitHub repo
 T-02 Scaffold Tauri project, verify pnpm tauri dev works
 T-03 Install all frontend deps
 T-04 Set up Tailwind

🟢 Phase 1 — Foundation (Days 2–4)

 T-05 Configure tauri.conf.json — always-on-top, correct window size
 T-06 Write migration SQL files
 T-07 Write Rust DB init + schema.rs
 T-08 Write Rust task CRUD commands
 T-09 Write db.ts frontend invoke wrappers
 T-10 Build taskStore.ts (Zustand)
 T-11 Build TaskCard component
 T-12 Build Dashboard.tsx layout
 T-13 ✅ Milestone: Create task → persists → restart → still there

🟡 Phase 2 — Sprint System (Days 5–7)

 T-14 Rust sprint CRUD commands
 T-15 sprintEngine.ts — scoring logic
 T-16 sprintStore.ts
 T-17 Sprint.tsx — create, select tasks, set targets
 T-18 Sprint progress bar component
 T-19 Sprint evaluation flow (complete → score)
 T-20 ✅ Milestone: Full sprint cycle works

🟠 Phase 3 — Rating Engine (Days 8–9)

 T-21 Implement ratingEngine.ts (code above)
 T-22 Rust rating read/write commands
 T-23 Wire sprint complete → rating change → save
 T-24 RatingBadge component
 T-25 Profile.tsx — rating, rank, streak
 T-26 RatingGraph.tsx (Recharts line chart)
 T-27 ✅ Milestone: Rating moves when sprint ends

🔴 Phase 4 — Command Palette (Day 10)

 T-28 Set up cmdk component
 T-29 Register Ctrl+Space global hotkey via Tauri
 T-30 Build registry.ts with commands: add task, start sprint, show rating, focus mode
 T-31 ✅ Milestone: Can create task without touching mouse

🟣 Phase 5 — Analytics & Polish (Days 11–14)

 T-32 analyticsEngine.ts — aggregations
 T-33 Analytics.tsx with charts
 T-34 Activity heatmap (GitHub-style)
 T-35 Backlog.tsx
 T-36 Settings.tsx
 T-37 Streaks + achievements logic
 T-38 Daily mood log widget

⚫ Phase 6 — Ship (Day 15)

 T-39 Create .desktop autostart file:

ini  [Desktop Entry]
  Type=Application
  Name=Productivity OS
  Exec=/home/USER/.local/bin/productivity-os
  Hidden=false
  X-GNOME-Autostart-enabled=true
```
  Place at: `~/.config/autostart/productivity-os.desktop`
- [ ] **T-40** `pnpm tauri build` — release binary
- [ ] **T-41** Test cold boot autostart
- [ ] **T-42** Write install script for fresh machines

---

## 🤖 AI PROMPT TEMPLATE (For Each Task)

Copy this and fill in when asking AI to build each piece:
```
Context: Building a Tauri v2 + React + TypeScript desktop productivity widget with SQLite.
Stack: Tauri v2, React 18, TypeScript 5, TailwindCSS, Zustand, tauri-plugin-sql, Recharts

Current task: [e.g. "Build the TaskCard component"]

Existing code context:
- taskStore.ts: [paste]
- db.ts invoke wrappers: [paste]
- Task type: [paste interface]

Requirements:
- [list specific behaviors]
- Follow TailwindCSS only for styling (no external CSS)

Output: Complete working file for [filename], no placeholders.

Total estimated build time: ~2–3 weeks building ~1–2 hours/day using AI assistance.