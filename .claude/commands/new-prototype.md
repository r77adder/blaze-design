---
name: new-prototype
description: Scaffold a new prototype, ensure dev server is running, open browser
---

User wants to create a new prototype.

If the user provided a slug as `$ARGUMENTS`, use it. Otherwise ask for one (kebab-case, e.g. `inbox-v3`).

Steps:

1. Run `pnpm plop prototype --name <slug>` from the repo root. This creates `prototypes/<slug>/index.tsx` and `prototypes/<slug>/GAPS.md`.
2. Verify the file `prototypes/<slug>/index.tsx` was created.
3. Check whether `pnpm dev` is running (look for a process on port 5173, e.g. `lsof -i :5173`). If not, start it in the background: `pnpm dev`.
4. Wait 2-3 seconds for Vite to bind.
5. Open `http://localhost:5173/<slug>` in the user's browser via `open` (macOS).
6. Tell the user: "Your prototype is at `prototypes/<slug>/index.tsx` and live at http://localhost:5173/<slug>. Tell me what you want to build."

If the user immediately describes what they want next, follow `.claude/skills/writing-a-prototype.md`.
