---
name: task-atlas-fullstack
description: >-
  Use when working on this ProjectManagement repository to continue the Task Atlas
  full-stack build. Covers Node.js + Express + SQLite implementation, native HTML/CSS/JS
  frontend work, progress-file updates, and cross-conversation continuity for the
  multi-phase task management system.
---

# Task Atlas Fullstack

## Start Here

At the start of every conversation:

1. Read `docs/progress/MASTER.md`.
2. Identify the active phase and next unchecked task.
3. Read only the specific analysis or plan docs needed for that task.
4. Update `MASTER.md` Current Status before substantial work if the active task changes.

## Working Rules

- Respect the confirmed default stack:
  - Frontend: native `HTML / CSS / JavaScript`
  - Backend: `Node.js + Express + SQLite`
  - Auth: username + password
  - Data mode: guest local storage when logged out, cloud-backed account data when logged in
- Preserve the existing visual language unless a task explicitly requires redesign.
- Prefer incremental changes that keep the app runnable after each completed task.
- Keep server truth on the backend. Do not treat browser storage as authenticated truth.

## Progress Updates

After completing a task:

1. Check the task box in the relevant `docs/progress/phase-*.md` file.
2. Update the completed count for that phase in `docs/progress/MASTER.md`.
3. Update `Current Status` and `Next Steps` in `docs/progress/MASTER.md`.
4. Record notable implementation decisions or blockers in the phase file Notes section.

## Phase Guidance

### Phase 1

- Establish `package.json`, `server/`, `public/`, and runtime scripts.
- Serve the current frontend through Express before adding deeper backend features.

### Phase 2

- Implement schema, authentication routes, session handling, and protected API boundaries.
- Favor explicit validation and consistent error payloads.

### Phase 3

- Build project, task, subtask, tag, and import/export APIs before expanding UI complexity.
- Keep ownership checks rooted at the authenticated user.

### Phase 4

- Treat guest mode and cloud mode as separate channels.
- Make guest-to-account import explicit rather than implicit merge.

### Phase 5

- Add automated verification for auth and core task flows.
- Finish deployment and operating documentation before calling the project complete.

## Cleanup Trigger

When all checkboxes in `docs/progress/MASTER.md` are marked complete, begin the cleanup phase:

1. List generated docs and the project skill.
2. Ask which artifacts to keep.
3. Remove unneeded workflow artifacts only after user confirmation.
