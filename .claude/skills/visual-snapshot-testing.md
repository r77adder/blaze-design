# Visual snapshot testing — Playwright

Catch unintended visual regressions when porting components or refactoring shared styles. Each prototype + each component variant has committed PNG baselines; CI fails if a render diverges by more than 0.5% pixel ratio.

This skill is for **regression detection over time**, not for debugging a specific gap. For ad-hoc "ours doesn't match prod" investigations, use `.claude/skills/visual-debugging.md`.

---

## Setup (already done)

- `playwright.config.ts` at repo root — chromium-only, full-page screenshots, 0.5% diff tolerance, auto-boots `pnpm dev`.
- `tests/visual/` — spec files. One spec per prototype.
- `tests/visual/__snapshots__/` — committed baseline PNGs.
- `pnpm test:visual` — run tests, fail on diff.
- `pnpm test:visual:update` — re-seed baselines (use after intentional visual changes).
- Browser binary: `pnpm exec playwright install chromium` (run once per machine).

---

## When to add a new snapshot test

Add one when:

- **A new prototype lands** — at minimum: one screenshot per StatePicker state.
- **A new component lands in `src/components/`** — Ladle covers the dev environment, but a snapshot test in `tests/visual/` against a Ladle URL or a dedicated playground page locks the variants. (Pick whichever is easier; Ladle URLs are stable.)
- **A shared token changes** — re-run `pnpm test:visual` to surface what moved, then `pnpm test:visual:update` if all diffs are intentional.

---

## Adding a snapshot test for a new prototype

Pattern, mirroring `tests/visual/hello-world.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('<prototype-slug> prototype', () => {
  test('renders default state', async ({ page }) => {
    await page.goto('/<prototype-slug>');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });

  // One test per StatePicker state if the prototype has one.
  test('renders <state> state', async ({ page }) => {
    await page.goto('/<prototype-slug>');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '<state>' }).click();
    await expect(page).toHaveScreenshot('<state>.png', { fullPage: true });
  });
});
```

Then seed baselines:

```bash
pnpm test:visual:update
```

Verify they're stable on a clean run before committing:

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

- **Diff is intentional** (you changed a token, refactored a component, etc.): re-seed with `pnpm test:visual:update`, commit the new baselines, mention it in the commit message.
- **Diff is a regression**: don't update the baseline. Fix the underlying CSS / component change. Re-run.

---

## Anti-patterns

- ❌ Re-seeding baselines without looking at the diff. That defeats the entire point of the test.
- ❌ Adding `await page.waitForTimeout(N)` to "make tests stable." Use `waitForLoadState('networkidle')` and explicit selectors via `getByRole` / `getByText`. Timeouts mask real flakiness.
- ❌ Snapshot-testing the same component from 12 angles. Cover the variants that matter. One snapshot per StatePicker state is usually enough per prototype.
- ❌ Running `test:visual` against a stale `pnpm dev` server with old code. The `webServer.reuseExistingServer` setting reuses it — restart `pnpm dev` if you've changed anything since it started.
- ❌ Using snapshot tests to hunt down a "ours doesn't match prod" gap. Wrong tool — Playwright can't see prod with auth. Use chrome-devtools-mcp instead (see `.claude/skills/visual-debugging.md`).
