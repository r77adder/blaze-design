---
name: add-icon
description: Add a new icon to the lib
---

User wants to add an icon. Need: name (PascalCase) + size (one of `12`, `14`, `16`, `20`, `24`, `30`, `32`, `36`, `40`, `46`).

If `$ARGUMENTS` looks like `Name size` (e.g. `Bell 16`) parse it. Otherwise ask for both.

Steps:

1. Run `pnpm plop icon --name <Name> --size <size>` from the repo root.
2. Show the user the new file path: `src/icons/<size>/<Name>.tsx`. Tell them to paste the SVG paths from Figma into it (replacing the placeholder `<rect>`).
3. If the user has a Figma node URL, offer to fetch the SVG via `mcp__figma__get_design_context` and inline the paths automatically.
4. The barrel `src/icons/<size>/index.tsx` is updated by Plop — verify the new export is there.

This command is open to designers but typically engineers do it because it touches `src/icons/` (eng-protected).
