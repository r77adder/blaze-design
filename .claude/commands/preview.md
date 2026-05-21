---
name: preview
description: Open a prototype in the browser
---

User wants to preview a prototype.

If `$ARGUMENTS` is provided, treat it as the slug. Otherwise list all prototypes with `ls prototypes/` (excluding `_shell`) and ask which one.

Steps:

1. Verify `prototypes/<slug>/index.tsx` exists. If not, tell the user it doesn't exist and offer to scaffold via `/new-prototype <slug>`.
2. Check whether the dev server is running on port 5173. If not, call `preview_start` with name `vite` to start it.
3. Call `preview_screenshot` to show the prototype in the Claude app preview — do NOT call `open` or launch a native browser.
4. Tell the user the URL.
