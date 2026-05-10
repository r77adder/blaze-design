---
name: publish
description: Cut a new release tag (engineering only)
---

User wants to publish a new release of `@blaze/design-system`.

This is eng-protected. Required: `$ARGUMENTS` is the new semver version (e.g. `v0.2.0`). If missing, ask.

Follow `.claude/skills/publishing-a-release.md` step by step. The full flow is:

1. Verify on `main`, working tree clean.
2. Bump `package.json` `version` to the new semver (without the `v` prefix).
3. Update `CHANGELOG.md` with `## vX.Y.Z — YYYY-MM-DD` section.
4. Commit version + changelog: `git commit -m "chore: bump to vX.Y.Z"`.
5. Run `VERSION=vX.Y.Z pnpm publish:tag`.
6. Verify tag pushed: `git ls-remote --tags origin | grep vX.Y.Z`.
7. Tell consumer repos to update `package.json` to `"@blaze/design-system": "almanaclabs/blaze-design#vX.Y.Z"` and `pnpm install`.

Distribution is git-tag style (mirrors `prose-core`). No npm registry.
