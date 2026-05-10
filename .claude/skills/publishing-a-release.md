# Publishing a release

For engineers cutting a new version of `@blaze/design-system`. Distribution mirrors `prose-core`'s git-tag style: no npm registry, no GH Packages. Consumers install from a git tag.

## Prerequisites

- You're an engineer (not a designer/PM).
- You know the new semver version (e.g. `v0.2.0`).
- You're on `main` and the working tree is clean.
- All tests pass: `pnpm test`.
- Build succeeds: `pnpm build`.

## The flow

### Step 1: Verify clean state

```bash
git status              # working tree clean
git rev-parse --abbrev-ref HEAD   # should be 'main'
git pull origin main    # up to date
pnpm test               # green
pnpm build              # produces lib/ + module/ without errors
```

If any of these fail, fix before proceeding.

### Step 2: Bump version in package.json

Edit `package.json` — change `"version": "0.1.0"` to the new semver (without the `v` prefix).

```json
{
  "name": "@blaze/design-system",
  "version": "0.2.0",
  ...
}
```

### Step 3: Update CHANGELOG.md

Add a section at the top:

```md
## v0.2.0 — 2026-05-09

- Added `Button` component with primary / secondary / tertiary variants.
- Fixed Text weight rendering on Safari.
```

Group entries by type (Added / Changed / Fixed / Removed). Keep it consumer-focused.

### Step 4: Commit version + changelog

```bash
git add package.json CHANGELOG.md
git commit -m "chore: bump to v0.2.0"
```

This commit lands on `main` BEFORE the release script runs.

### Step 5: Run the publish script

```bash
VERSION=v0.2.0 pnpm publish:tag
```

Under the hood (see `package.json` `scripts.publish:tag`), this:
1. Checks out a temporary `release` branch
2. Runs `pnpm build` to produce `lib/` and `module/`
3. Force-adds the build outputs (`git add -f lib/ module/`)
4. Commits as `Release vX.Y.Z`
5. Tags that commit with `vX.Y.Z`
6. Pushes the tag to origin
7. Returns to `main` and deletes the local `release` branch

The build outputs only ever live on the tag, never on `main`.

### Step 6: Verify the tag pushed

```bash
git ls-remote --tags origin | grep v0.2.0
```

Expected output is one line ending in `refs/tags/v0.2.0`. If empty, the push failed — investigate.

### Step 7: Tell consumer repos to update

The user now needs to update each consumer repo's `package.json`:

```json
{
  "dependencies": {
    "@blaze/design-system": "almanaclabs/blaze-design#v0.2.0"
  }
}
```

Then `pnpm install`.

Common consumers:
- `~/dev/almanac-editor` — eventual consumer (post Phase 1)

## Reference

The script that does this: `package.json` `scripts.publish:tag`.

The pattern mirrors `~/dev/prose-core` — see its `scripts.publish` for the canonical original.

## Common failures

- **Build errors during the script** — fix on `main` first, then retry. The script's `pnpm build` will fail-fast.
- **Tag already exists** — bump to a new version. Don't overwrite tags; consumers may have already installed the old one.
- **Push rejected** — usually means the local `release` branch already exists from a failed prior run. `git branch -D release` and try again.
