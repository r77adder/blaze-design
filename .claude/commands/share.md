# /share — share your work with the team

Use when the user says any of: "share this", "share with the team", "open a PR", "ship this", "send this for review", "/share".

This command takes the user's current uncommitted work, gets it onto a branch, pushes it, and opens a PR. The user shouldn't need to know git — handle everything.

## Steps

### 1. Survey the work

```bash
git -C /Users/kevinaleman/dev/blaze-design status -s
git -C /Users/kevinaleman/dev/blaze-design diff --stat
```

Identify what's changed. Determine the **primary scope**:
- New/modified files in `prototypes/<slug>/` → primary scope = "prototype/<slug>"
- New/modified files in `src/staging/<Name>/` → primary scope = "staging/<name-kebab>"
- New/modified files in `src/components/<Name>/` → primary scope = "components/<name-kebab>" (eng-only)
- New/modified files in `src/icons/` → primary scope = "icons/<topic>"
- Docs only (`*.md`, `CLAUDE.md`, `CONVENTIONS.md`, `.claude/`) → primary scope = "docs/<topic>"
- Mixed — pick the largest changed area; if truly mixed, ask the user

If nothing is modified AND nothing is untracked, tell the user there's nothing to share and stop.

### 2. Branch

Check the current branch:
```bash
git -C /Users/kevinaleman/dev/blaze-design rev-parse --abbrev-ref HEAD
```

- If on `main`: create + switch to a new branch named after the primary scope (e.g. `prototype/inbox-v3`, `staging/avatar-color-variants`).
  ```bash
  git -C /Users/kevinaleman/dev/blaze-design checkout -b <branch-name>
  ```
- If already on a non-main branch: keep using it. Don't switch.

### 3. Commit

Stage everything:
```bash
git -C /Users/kevinaleman/dev/blaze-design add -A
```

Generate a commit message from the diff. Follow this shape:
- Title: `<type>(<scope>): <one-line summary>` — types: `feat`, `fix`, `refactor`, `docs`, `chore`. Title under 70 chars.
- Body: 1-3 sentences on the *why* (use the user's natural-language description if they gave one).
- Always include the Co-Authored-By line.

Use a HEREDOC for the message:
```bash
git -C /Users/kevinaleman/dev/blaze-design commit -m "$(cat <<'EOF'
feat(prototype): add inbox-v3 with cold/steady/error states

Designer iteration on the inbox layout. Three states cover the empty,
loaded, and failed-to-load cases per the latest spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 4. Verify visually

If the change touches `prototypes/` or `src/staging/` or `src/components/`, run snapshot tests:
```bash
cd /Users/kevinaleman/dev/blaze-design && pnpm test:visual 2>&1 | tail -10
```

Capture the result. If tests fail because the user intentionally changed something visual, run `pnpm test:visual:update` to re-seed and `git add -A && git commit --amend --no-edit` to fold the new baselines into the same commit. If tests fail because of a regression, surface it to the user and ask whether to proceed.

If the change is docs-only or icons-only, skip this step.

### 5. Push

```bash
git -C /Users/kevinaleman/dev/blaze-design push -u origin <branch-name>
```

### 6. Open the PR

Use `gh pr create` with a HEREDOC body. Title = the commit title. Body should follow the PR template that exists at `.github/PULL_REQUEST_TEMPLATE.md` — `gh` will pre-fill from it, but you should fill it in:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## What changed

<1-3 sentence summary, use the user's natural-language phrasing if any>

## Try it

If this touches a prototype: open `http://localhost:5173/<slug>` after `pnpm dev`.
If this is a staging component: open Ladle (`pnpm ladle`) and find the story.
If this is docs only: read the diff in the Files tab.

## Status

- [x] `pnpm test` — <passing | N failing>
- [x] `pnpm test:visual` — <passing | N failing | snapshots intentionally updated>
- [x] `pnpm typecheck` — <passing | N errors>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

If the user gave context like "this is ready for design review" or "WIP — don't merge yet, just want eyes," include that in the body and consider adding `--draft` for the WIP case.

### 7. Report back

Output the PR URL plain so the user can click it. Brief — one or two sentences max.

## Anti-patterns

- ❌ Committing on `main`. Server-side branch protection will reject the push and you'll have to redo the work.
- ❌ Mixing prototype changes with eng-only changes (e.g., `src/components/` edits) into one PR. If you see both, ask the user before bundling.
- ❌ Skipping `pnpm test:visual` on a UI change. Snapshot tests are how regressions get caught — running them is the difference between "I think this works" and "the harness confirms this works."
- ❌ Letting `git add -A` sweep in `node_modules/`, `lib/`, `module/`, or `playwright-report/`. The `.gitignore` should already prevent this, but eyeball the `git status -s` output before staging to be sure.
- ❌ Creating a branch with a generic name like `claude/changes` or `wip`. The branch name should reflect the primary scope so reviewers know what they're looking at without opening it.
