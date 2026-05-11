# Visual snapshot testing — Playwright

Catch unintended visual regressions in **vetted lib components** when porting them or when refactoring shared tokens. CI fails if a render diverges by more than 0.5% pixel ratio.

This skill is for **regression detection over time**, not for debugging a specific gap. For ad-hoc "ours doesn't match prod" investigations, use `.claude/skills/visual-debugging.md`.

---

## What's in scope

- **`src/components/`** — vetted lib components. Snapshot any component variant that prod ships.
- **Ladle stories** — if a vetted component has Ladle stories that mirror prod's Ladle stories (which themselves have snapshot coverage in prod), those story URLs are fair game.

## What's NOT in scope

- ❌ **Prototypes** (`prototypes/<slug>/`). Prototypes are throwaway by design — Cloudinary asset churn, copy edits, layout iteration, and StatePicker churn make snapshot tests pure maintenance overhead with zero signal. Designers and PMs eyeball prototypes; that's the QA loop.
- ❌ **Staging components** (`src/staging/`). API and visuals shift weekly. Snapshot tests would just block iteration. When a staging component graduates to vetted, it picks up snapshot coverage at that boundary (see `.claude/skills/promoting-staging-component.md`).

If you find yourself reaching for `tests/visual/foo.spec.ts` for a prototype or staging file, stop — that's a smell.

---

## Setup (already done)

- `playwright.config.ts` at repo root — chromium-only, full-page screenshots, 0.5% diff tolerance, auto-boots `pnpm dev`.
- `tests/visual/` — spec files. One spec per component (or per Ladle story batch).
- `tests/visual/__snapshots__/` — committed baseline PNGs.
- `pnpm test:visual` — run tests, fail on diff.
- `pnpm test:visual --update-snapshots` — re-seed baselines (use after intentional visual changes, never blindly).
- Browser binary: `pnpm exec playwright install chromium` (run once per machine).

---

## Adding snapshots for a vetted component

Pattern when a Ladle URL exists for the component:

```ts
import { test, expect } from '@playwright/test';

test.describe('Button — vetted', () => {
  test('primary md', async ({ page }) => {
    await page.goto('/ladle/?story=button--primary-md');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button')).toHaveScreenshot('primary-md.png');
  });
});
```

Pattern when no Ladle story exists (rare — prefer adding the Ladle story first): mount the component on a dedicated playground route under `src/playground/` and screenshot that route.

Then seed baselines:

```bash
pnpm test:visual --update-snapshots
```

Verify they're stable on a clean re-run before committing:

```bash
pnpm test:visual
```

Commit both the spec file and the new files under `tests/visual/__snapshots__/`.

---

## When `pnpm test:visual` fails

A failed test produces three files in `test-results/`:

- `*-actual.png` — what playwright rendered just now
- `*-expected.png` — the committed baseline
- `*-diff.png` — pixel diff (highlighted)

Open the diff. Decide:

- **Diff is intentional** (you changed a token, refactored a vetted component, etc.): re-seed with `pnpm test:visual --update-snapshots`, commit the new baselines, mention it in the commit message.
- **Diff is a regression**: don't update the baseline. Fix the underlying CSS / component change. Re-run.

---

## Anti-patterns

- ❌ Re-seeding baselines without looking at the diff. That defeats the entire point of the test.
- ❌ Adding `await page.waitForTimeout(N)` to "make tests stable." Use `waitForLoadState('networkidle')` and explicit selectors via `getByRole` / `getByText`. Timeouts mask real flakiness.
- ❌ Snapshot-testing the same component from 12 angles. Cover the variants that actually ship.
- ❌ Running `test:visual` against a stale `pnpm dev` server with old code. The `webServer.reuseExistingServer` setting reuses it — restart `pnpm dev` if you've changed anything since it started.
- ❌ Using snapshot tests to hunt down a "ours doesn't match prod" gap. Wrong tool — Playwright can't see prod with auth. Use chrome-devtools-mcp instead (see `.claude/skills/visual-debugging.md`).
- ❌ Adding snapshots for a prototype or staging component. See "What's NOT in scope" above.
