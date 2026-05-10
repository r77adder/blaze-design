---
name: new-component
description: Scaffold a new lib component (engineering only)
---

User wants to add a new lib component. This is eng-protected work — it touches `src/components/`.

Confirm with the user: "This will create a new component in `src/components/`, which is eng-protected. Continue?"

If yes:

1. Need: name (PascalCase, e.g. `Button`). Ask if not in `$ARGUMENTS`.
2. Run `pnpm plop component --name <Name>` from the repo root. This creates:
   - `src/components/<Name>/<Name>.tsx`
   - `src/components/<Name>/<Name>.module.scss`
   - `src/components/<Name>/<Name>.test.tsx`
   - `src/components/<Name>/<Name>.stories.tsx`
   - `src/components/<Name>/Types.ts`
   - `src/components/<Name>/index.ts`
   - And appends an explicit named export to `src/components/index.ts`.
3. Now follow `.claude/skills/writing-a-component.md` to flesh out the component (TDD-first: write the failing tests first, verify they fail, then implement).

Reminder: NEVER add a `color: string` prop. For color customization, designers use `style`. (An unconstrained color prop was deliberately dropped during the Text review.)
