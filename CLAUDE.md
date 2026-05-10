# blaze-design — rules for Claude Code

This repo is the Blaze design system + a prototype playground. Two audiences use it: engineers (who add lib components and cut releases) and designers/PMs (who compose prototypes from existing components). You are the bridge — when a designer asks for something, scaffold the prototype, compose from `@/components`, and tell them when a component is missing.

---

## Hard rules

1. **NEVER reinvent components inside `prototypes/`.** If a needed component doesn't exist in `src/components/` OR `src/staging/`, STOP. Either scaffold it in `src/staging/` (default) or append a description to `prototypes/<feature>/GAPS.md` and tell the user. Do not fake it with raw `<button>`, `<input>`, custom card divs, etc.
2. **NEVER use raw hex for blacks/whites/reds.** Use design tokens: `var(--dark-90)`, `var(--light-100)`, `var(--red-70)`, etc. Brand and accent colors are tokenized too — see the table below.
3. **NEVER edit files in `src/components/` or `src/icons/` from a prototype task.** Those directories are eng-protected. `src/staging/` is open for prototype-driven evolution. If a prototype task seems to require touching `src/components/` or `src/icons/`, confirm with the user before doing so.
4. **NEVER add a new directory to `src/components/` directly.** All new components scaffold into `src/staging/` first. Promotion to `src/components/` requires the gate in `.claude/skills/promoting-staging-component.md` (chiefly: prod has adopted the component into `apps/blaze/src/blaze-ui/`).
5. **ALWAYS import via `@/components` (vetted lib) or `@/staging` (work-in-progress)** inside `prototypes/` and `src/playground/`. **ALWAYS use relative imports** inside `src/components/` and `src/staging/` — the alias is intentionally not in the lib's tsconfig because it would leak into emitted `.d.ts` files. Vetted code MUST NOT import from staging (would leak into the published surface); staging may import from `../../components/<Name>`.
6. **For any visual gap investigation against prod**, follow `.claude/skills/visual-debugging.md`. First step is verifying chrome-devtools-mcp is connected — if `list_pages` errors, walk the user through plugin install BEFORE attempting screenshot comparisons. Never ping-pong screenshots with the user when the MCP would settle the question in one tool call.
7. **When a new prototype or component lands, add a Playwright snapshot test** under `tests/visual/`. Follow `.claude/skills/visual-snapshot-testing.md`. Run `pnpm test:visual` before considering the task done.

---

## What's where

- `src/components/` — **vetted lib surface (publishable).** Only components that are 1:1 with `apps/blaze/src/blaze-ui/`. Eng-protected. Today: `Button`, `Heading`, `Paragraph`, `Text`.
- `src/staging/` — shared-across-prototypes work-in-progress components. NOT shipped in the published lib. Open to prototype-driven evolution. Promote to `src/components/` only when prod adopts the component into `apps/blaze/src/blaze-ui/` — see `.claude/skills/promoting-staging-component.md`.
- `src/icons/` — eng-protected icon components, organized by pixel size (`12/`, `14/`, `16/`, etc.)
- `src/tokens/` — `colors.css` + `typography.scss` + `fonts.scss` + `reset.css` + Söhne font files
- `src/playground/` — Vite app entrypoint (dev infra, never shipped in the package)
- `prototypes/_shell/` — `<PrototypeShell>` + `<StatePicker>`. Use these in every prototype. NOT in the lib.
- `prototypes/<slug>/` — designer/PM playground. Open access.
- `.ladle/` — component dev environment config
- `.claude/commands/` — slash commands (one per file)
- `.claude/skills/` — longer workflow guides for specific tasks

---

## Common tasks

| User asks | Do this |
|---|---|
| "Make a new prototype X" | `pnpm plop prototype --name X`, ensure `pnpm dev` is running, open browser to `http://localhost:5173/X` |
| "Add a new component X" | `pnpm plop component --name X`. The plop prompt asks vetted vs staging — pick **staging** unless prod's `apps/blaze/src/blaze-ui/X/` already exists. Then follow `.claude/skills/writing-a-component.md`. |
| "Promote staging component X to vetted" (eng) | Follow `.claude/skills/promoting-staging-component.md`. Hard gate: prod must already have `apps/blaze/src/blaze-ui/X/`. |
| "Add icon X size N" (eng) | `pnpm plop icon --name X --size N`, paste SVG paths into the new file |
| "Port this HTML to a prototype" | Follow `.claude/skills/porting-html-to-prototype.md` step by step |
| "Preview prototype X" | Ensure `pnpm dev` is running (background); open `http://localhost:5173/X` |
| "Publish a release" (eng) | Follow `.claude/skills/publishing-a-release.md` |

---

## Design tokens (canonical)

These are the live tokens defined in `src/tokens/colors.css`. Always reference them via `var(--name)` — never paste the hex/rgba directly.

### Colors — dark/light/status

```css
--dark-90:  rgba(0,0,0,0.9)        /* Primary text, primary button bg */
--dark-80:  rgba(0,0,0,0.8)        /* Body text */
--dark-60:  rgba(0,0,0,0.6)        /* Secondary / muted text */
--dark-40:  rgba(0,0,0,0.4)        /* Placeholder text */
--dark-15:  rgba(0,0,0,0.15)       /* Hover borders */
--dark-8:   rgba(0,0,0,0.08)       /* Default borders */
--dark-4:   rgba(0,0,0,0.04)       /* Subtle backgrounds, counter bg */
--dark-2:   rgba(0,0,0,0.02)       /* Very subtle surface tint */

--light-100: #ffffff                /* White surface / text on dark */
--light-60:  rgba(255,255,255,0.6)  /* Secondary text on dark backgrounds */

--red-90:    #ae2222                /* Error text, error toast background */
--red-70:    #bc010b                /* Error border */

--brand:     #fcb728                /* Brand yellow */
--purple:    #7c5cfc                /* Accent */
```

### Status pill colors

```css
--status-draft:    #757c8a   /* Grey   */
--status-connect:  #ed7c2c   /* Orange */
--status-review:   #edb62c   /* Yellow */
--status-approved: #04af00   /* Green  */
--status-posting:  #0179cf   /* Blue   */
--status-posted:   #7f24b7   /* Purple */
--status-failed:   #bc010b   /* Red    */
--status-new:      #e65cac   /* Pink   */
```

### Spacing

Use multiples of 4px only: `4, 8, 12, 16, 20, 24, 32, 40, 48px`.

### Border radius

| Token | Value  |
|-------|--------|
| XS    | 4-6px  |
| S     | 6px    |
| M     | 8px    |
| L     | 8px    |
| XL    | 10px   |

---

## Typography

**Font family**: `'Sohne'` (no umlaut — files are loaded as the ASCII name to match prod). Fallback: `sans-serif`.

```css
font-family: 'Sohne', sans-serif;
```

**NOTE: weight 450 (Kräftig) maps to 500 in this repo** because our licensed Söhne files don't include a 450 face. `<Text weight="kraftig">` and `<Text weight="halbfett">` render identically. See `src/tokens/typography.scss` header for the full mapping note. Resolve once licensing covers the 450 face OR update the spec.

### Font weights

| CSS weight | Variant         | Use                                      |
|------------|-----------------|------------------------------------------|
| 400        | Buch (Book)     | **Default** — body, labels, most UI text |
| 450 → 500  | Kräftig         | Emphasis / selected (renders as 500)     |
| 500        | Halbfett        | Headings, strong emphasis                |
| 600        | Dreiviertelfett | Strong headings                          |
| 700        | Fett (Bold)     | Heavy headings                           |
| 800        | Extrafett       | Display / hero text                      |

### Type scale

| Token | px   | Letter-spacing | Use                              |
|-------|------|----------------|----------------------------------|
| xs    | 12px | 0.24px         | Labels, descriptions, captions   |
| sm    | 14px | 0.28px         | Button labels (M/S/XS), inputs   |
| base  | 16px | 0.32px         | Button labels (L/XL), body       |
| lg    | 18px | 0.36px         | Selected XXL pill text           |

Fonts load automatically via the playground / Ladle. Do NOT add `@font-face` declarations in prototype JSX or HTML — they're already in `src/tokens/fonts.scss`.

---

## Component catalog (quick reference)

### Vetted (`@/components`) — 1:1 with `apps/blaze/src/blaze-ui/`

- **`Text`** — typographic primitive (`apps/blaze/src/blaze-ui/Text`)
- **`Heading`** — heading primitive (`apps/blaze/src/blaze-ui/Heading`)
- **`Paragraph`** — paragraph primitive (`apps/blaze/src/blaze-ui/Paragraph`)
- **`Button`** — button primitive (`apps/blaze/src/blaze-ui/Button`). Verified 1:1 via Chrome DevTools MCP.

For full prop details, read each component's `Types.ts`.

### Staging (`@/staging`) — shared WIP, NOT shipped

- `Avatar`, `Card`, `Chip`, `KindBadge`, `Logo`, `NavItem`, `NavSection`, `Pill`, `SourcePill`, `Toast`, `WorkspaceSelector`

These are usable across prototypes but their APIs may shift. Before promoting any to vetted, prod must adopt the equivalent into `apps/blaze/src/blaze-ui/` — see `.claude/skills/promoting-staging-component.md`.

When a needed component is missing from BOTH directories: scaffold in staging by default (`pnpm plop component` → pick "staging"). Only fall back to `prototypes/<slug>/GAPS.md` if even staging is the wrong tier (e.g., the user is unsure whether the abstraction is right).

---

## Editing JSX in prototypes — style guide

- Flat top-down structure. No deep nesting.
- One section per visual area. Use `// section: hero` style comments to mark them.
- Compose from `@/components` and `@/icons`. Don't invent.
- Local state via `useState` is fine. No Redux, no global state lib.
- **No CSS files in prototypes** — use inline `style={}` for layout (gap, padding, flex direction) and rely on lib components for typography/colors.
- For one-off color overrides: `style={{ color: 'var(--dark-60)' }}`. Never raw hex.
- If a prototype exceeds ~100 lines, split into local files: `Hero.tsx`, `Feed.tsx`, etc., still inside `prototypes/<slug>/`.
- Always wrap in `<PrototypeShell>` + `<StatePicker>` from `prototypes/_shell`. The hello-world prototype is the canonical example.

---

## Slash commands

See `.claude/commands/` for the full prompt of each.

- `/new-prototype <slug>` — scaffold a prototype + open browser
- `/preview [slug]` — open a prototype in the browser
- `/port-html <path>` — start the HTML → prototype workflow
- `/add-icon <name> <size>` — add an icon (eng-friendly)
- `/new-component <name>` — (eng) scaffold a new lib component
- `/publish <version>` — (eng) cut a release tag

---

## Skills

Longer workflow guides — read the relevant one before doing the matching task.

- `.claude/skills/writing-a-component.md` — eng workflow for adding a lib component (TDD-first)
- `.claude/skills/writing-a-prototype.md` — designer/PM workflow for composing a prototype
- `.claude/skills/porting-html-to-prototype.md` — converting an HTML mockup to a real prototype
- `.claude/skills/publishing-a-release.md` — eng workflow for tagging a release
- `.claude/skills/visual-debugging.md` — investigate "ours doesn't match prod" gaps using chrome-devtools-mcp (live inspection of prod + localhost)
- `.claude/skills/visual-snapshot-testing.md` — Playwright snapshot tests under `tests/visual/`, when to add them and how to re-seed baselines
- `.claude/skills/promoting-staging-component.md` — checklist for graduating a `src/staging/` component into the vetted `src/components/` lib surface
