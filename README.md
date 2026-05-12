# blaze-design

Blaze's design system + a prototype playground for designers and PMs.

## For designers/PMs — getting started

Open this folder in Claude Code (desktop app). On your first day, paste this:

> /setup

Claude walks you through installing the four things you need (Homebrew, Node, pnpm, the GitHub CLI), authenticates GitHub, installs dependencies, and opens the playground in your browser. About 5-10 minutes start to finish. You only do this once per machine.

After that, every session just ask Claude what you want:

- "Make a new prototype called inbox-v3"
- "Port this HTML mockup: /Users/me/Downloads/somefile.html"
- "Show me what the Text component can do"

Slash commands also work:

- `/new-prototype <slug>` — scaffold + open browser
- `/preview [slug]` — open a prototype
- `/port-html <path>` — convert an HTML mockup into a real prototype
- `/rebase` — catch up with the latest `main` (safe, walks through any conflicts)
- `/share` — push your work and open a PR for the team to review

## Sharing your work

When you have something the team should see, just say:

> share this with the team

Claude creates a branch, commits your changes, runs the tests, pushes, and opens a pull request — all without you needing to know git. It'll print the PR link when done.

If you want to give context, just add it:

> share this — the inbox-v3 prototype is ready for design review

Claude uses your phrasing to write the PR title and description.

The `main` branch is protected — all changes ship via PR. If you (or Claude) accidentally try to push directly to `main`, GitHub will reject it. Use `/share` instead.

## For engineers — getting started

```bash
pnpm install
pnpm ladle           # component dev (Ladle, port 61000)
pnpm dev             # prototype playground (Vite, port 5173)
pnpm test            # unit tests
pnpm test:visual     # snapshot tests (boots dev server automatically)
pnpm build           # produce lib/ + module/ output
```

## Visual debugging — one-time setup

When checking whether a component matches prod, Claude uses the **chrome-devtools-mcp** plugin to read computed styles directly from your live Chrome (where you're logged into prod). This is much faster than screenshot-comparison loops.

To enable it on a new machine, paste this to Claude:

> Set up chrome-devtools-mcp for this repo. Walk me through installing the plugin and patching its config so it attaches to my real Chrome.

Claude will follow `.claude/skills/visual-debugging.md` — that skill covers the full plugin install (`/plugin install chrome-devtools-mcp`), the `--autoConnect` patching step, and verification.

You only need to do this once per machine. After install, just open prod and your localhost prototype in Chrome tabs and Claude can inspect both.

## Visual snapshot tests

Playwright snapshot tests under `tests/visual/` catch unintended visual regressions in **vetted lib components** (and Ladle stories, when present). Prototypes and staging components are intentionally NOT covered — see CLAUDE.md rule #8 for the rationale.

```bash
pnpm test:visual            # run tests, fail on diff
pnpm test:visual:update     # re-seed baselines after intentional changes
```

First-time setup on a machine: `pnpm exec playwright install chromium`.

When adding a new vetted component, optionally add a snapshot test — see `.claude/skills/visual-snapshot-testing.md`.

## Architecture

- `src/components/` — vetted, publishable lib (`@blaze/design-system`). 1:1 with `apps/blaze/src/blaze-ui/`.
- `src/staging/` — shared-across-prototypes work-in-progress components. NOT shipped in the published lib.
- `src/icons/`, `src/tokens/` — icon set + design tokens (also published).
- `prototypes/` — designer/PM playground. NOT shipped.
- `.ladle/` — component dev config.
- `.github/workflows/` — CI (typecheck + tests + build on push/PR).
- `.claude/` — Claude Code commands + skills.

See `CLAUDE.md` for hard rules and the workflow tables. See `CONVENTIONS.md` for the vetted/staging tier policy and the source-of-truth rules.

## Consuming the package

Distribution is git-tag based — no npm registry, no GH Packages. Mirrors `prose-core`'s pattern.

```json
{
  "dependencies": {
    "@blaze/design-system": "almanaclabs/blaze-design#vX.Y.Z"
  }
}
```

**No releases have been cut yet.** When the lib surface is ready, an engineer will follow `.claude/skills/publishing-a-release.md` to produce the first tag.

## Status

Pre-release. The repo is fully scaffolded with:

- **Vetted components** (publishable surface, 1:1 with prod's `apps/blaze/src/blaze-ui/` and `apps/blaze/src/almanac-ui/`): `Button`, `ButtonLink`, `Heading`, `IconButton`, `IconButtonLink`, `Modal`, `Paragraph`, `Text`.
- **Staging components** (shared WIP, not published): `Avatar`, `Card`, `Chip`, `KindBadge`, `Logo`, `NavItem`, `NavSection`, `Pill`, `SourcePill`, `TabChip`, `Toast`, `Toaster` (+ `useToast` hook), `WorkspaceSelector`.
- **Prototypes**:
  - `hello-world` — canonical example
  - `h2` — mega-prototype porting Ivan's H2 mockup. **All 10 page deep ports + 2 standalone tools shipped:**
    - `/h2` (Home)
    - `/h2/organic-social` — calendar + chooser modal + new-post modal + week nav (uses vetted Modal)
    - `/h2/map-ranking` — 4-step setup flow + animated SVG score ring + dismissable home action
    - `/h2/reputation` — Reviews + Insights + Listening tabs + AI draft Edit modal
    - `/h2/paid-search` — wizard modal + empty state + anomaly actions
    - `/h2/email-sms` — Suggested + Coming-soon + per-program detail modal + new-program modal
    - `/h2/landing-pages` — loading + 3-pane editor + published view
    - `/h2/influencer-content` — 4 tabs (Overview/Campaigns/Avatars/Content) + 7-step wizard
    - `/h2/seo-aeo` — first-run setup + 5 tabs + filter row + cell drawer modal
    - `/h2/campaigns` — SVG Gantt + detail view + wizard + chooser modal
    - `/h2/multi-change` — standalone tool with custom chrome (NOT H2Layout)
    - `/h2/content-plan` — standalone tool with custom sidebar (NOT H2Layout)
    - **Shared overlay**: `CrosspostWarningModal` invoked from OrganicSocial NewPostModal + Campaigns Detail
  - `modal-showcase` — end-to-end demo of the vetted Modal subtree
- **Tooling**: chrome-devtools-mcp workflow for visual debugging against prod, Playwright snapshot tests (vetted-only by policy), Plop scaffolders, Ladle component dev environment.

The promotion pipeline staging → vetted requires that prod adopts the equivalent into `apps/blaze/src/blaze-ui/`. See `.claude/skills/promoting-staging-component.md`.
