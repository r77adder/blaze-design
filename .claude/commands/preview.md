---
name: preview
description: Open a prototype in the browser
---

User wants to preview a prototype.

If `$ARGUMENTS` is provided, treat it as the slug. Otherwise list all prototypes with `ls prototypes/` (excluding `_shell`) and ask which one.

Steps:

1. Verify `prototypes/<slug>/index.tsx` exists. If not, tell the user it doesn't exist and offer to scaffold via `/new-prototype <slug>`.
2. Check whether `pnpm dev` is running (look for a process on port 5173). If not, start it in the background: `pnpm dev`. Wait 2-3 seconds for Vite to bind.
3. Open `http://localhost:5173/<slug>` via `open`.
4. Tell the user the URL.
