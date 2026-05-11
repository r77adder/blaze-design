# Promoting a staging component

Components in `src/staging/` are shared across prototypes but not yet vetted as part of the publishable lib surface (`src/components/`). This skill is the checklist for moving one over.

---

## When to promote

A staging component graduates to `src/components/` when **all** of these are true:

1. **Prod has adopted it into `apps/blaze/src/blaze-ui/`** — there's a directory of the same name with comparable API. This is the hard gate. If prod's equivalent lives in `apps/blaze/src/components/` or `apps/blaze/src/common/`, it's app-level, not lib-level — keep it in staging.
2. **The API is 1:1 with prod's component** — same prop names, same prop types (modulo the `CONVENTIONS.md` strip-list: no Redux/router/feature-flag hooks).
3. **The render is verified 1:1 with prod via Chrome DevTools MCP** — see `.claude/skills/visual-debugging.md`. Computed styles match across box, type, and color properties on every variant.
4. **Tests cover the variants prod uses** — at minimum, every documented variant + size combination renders without errors and applies the right SCSS module class.

If only some of these are true, the component stays in staging.

---

## Promotion steps

### 1. Verify the gate

Confirm `apps/blaze/src/blaze-ui/<ComponentName>/` exists in the editor checkout. Read its `.tsx` and `.module.scss` to extract the prop surface and the redesign-mode SCSS values.

### 2. Audit the staging implementation against prod

Use `.claude/skills/visual-debugging.md` to compare. Open the staging component in a Ladle URL or a prototype, open prod with the equivalent component visible, and run `evaluate_script` on both. Diff. Fix any drift in the staging implementation **before promoting**, not after.

### 3. Move the directory

```bash
git mv src/staging/<Name> src/components/<Name>
```

### 4. Update the index files

- Remove the export block from `src/staging/index.ts`
- Add the matching block to `src/components/index.ts`
- Group the new export with the existing alphabetically-similar entries

### 5. Fix any cross-imports

Search for stale imports:

```bash
grep -rn "from '@/staging'" prototypes/ src/playground/ src/staging/ src/components/
grep -rn "from '\\.\\.\\/<Name>'" src/components/ src/staging/
```

In prototypes / playground: change `@/staging` → `@/components` for the promoted name only.

In `src/staging/`: if a staging component imports the now-promoted one via a relative `../<Name>` path, update to `../../components/<Name>`.

In `src/components/`: same in reverse — if the promoted component imports another vetted sibling, the relative path doesn't change.

### 6. Verify

```bash
pnpm typecheck
pnpm test
pnpm build && ls lib/components/  # confirm the new component appears
```

If the now-vetted component has prod Ladle stories worth covering, add `tests/visual/<Name>.spec.ts` per `.claude/skills/visual-snapshot-testing.md`. Don't snapshot the prototypes that consume the component — prototype snapshots are out of scope (CLAUDE.md rule #8).

### 7. Commit

One commit per promotion:

```
feat(components): promote <Name> from staging — prod now ships in blaze-ui

API verified 1:1 against apps/blaze/src/blaze-ui/<Name>:
- props: <list>
- variants: <list>
- visual diff via Chrome DevTools MCP: 0 deltas on box/type/color
```

---

## Anti-patterns

- ❌ Promoting because "the component looks ready to me." The hard gate is **prod adoption**, not your assessment.
- ❌ Skipping the typecheck + unit test pass before promotion. Visual snapshot coverage is optional (only relevant if the component has Ladle stories), but type/unit tests are required.
- ❌ Inventing a vetted-tier component from scratch. Vetted always starts as staging and graduates — no shortcuts.
- ❌ Carrying staging-specific debt into the vetted version. If staging had a `// TODO: align with prod` workaround, fix it during promotion, not after.
