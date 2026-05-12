# /rebase — catch up with the latest main

Use when the user says any of: "rebase", "/rebase", "catch up with main", "pull in the latest", "I'm behind main", "sync with main", "update from main".

This rebases the current branch onto the latest `origin/main`. Designers shouldn't need to know what "rebase" means — just walk them through it. Defaults are safe: stash any in-progress work, never `--force` (only `--force-with-lease`), never auto-resolve conflicts.

If the user is **already on `main`**, this is a fast-forward pull instead — see step 3.

## Steps

### 1. Confirm where they are

```bash
git -C /Users/kevinaleman/dev/blaze-design rev-parse --abbrev-ref HEAD
git -C /Users/kevinaleman/dev/blaze-design status -s
```

Note:
- **Current branch** — `main` vs. a feature branch matters (different flow).
- **Uncommitted work** — if `status -s` has output, we need to stash it first.

Tell the user what you see:

> You're on `prototype/inbox-v3` with 2 uncommitted files. I'll stash those, pull the latest main, rebase, and unstash.

### 2. Stash uncommitted work (if any)

If `git status -s` shows anything, stash it including untracked files:

```bash
git -C /Users/kevinaleman/dev/blaze-design stash push -u -m "rebase-autostash-$(date +%s)"
```

Remember whether you stashed — you'll restore at the end. Capture the stash ref so you can pop it specifically later (in case the user already had unrelated stashes).

### 3. Fetch + figure out the right operation

```bash
git -C /Users/kevinaleman/dev/blaze-design fetch origin
```

Then branch by case:

**Case A: user is on `main`** → fast-forward only:

```bash
git -C /Users/kevinaleman/dev/blaze-design merge --ff-only origin/main
```

If `--ff-only` fails, the local main has diverged from origin/main (shouldn't happen for designers, but possible). Surface this and stop — do **not** auto-rebase main. Tell the user: "Your local main has commits that aren't on origin/main. That's unusual — ping an engineer."

**Case B: user is on a feature branch** → rebase onto origin/main:

```bash
git -C /Users/kevinaleman/dev/blaze-design rebase origin/main
```

### 4. Handle conflicts (Case B only)

If rebase fails with conflicts, **do not auto-resolve**. Run:

```bash
git -C /Users/kevinaleman/dev/blaze-design status
```

List the conflicting files for the user in plain language:

> Rebase paused — main changed `src/components/Modal/Header.tsx` and you also changed it. I need to merge them by hand. Want me to walk through it?

For each conflicting file, read it, find the `<<<<<<<` `=======` `>>>>>>>` markers, and propose a merge. Show the user the proposed resolution and get a "yes" before writing it. After each resolution:

```bash
git -C /Users/kevinaleman/dev/blaze-design add <resolved-file>
```

Once all conflicts are resolved:

```bash
git -C /Users/kevinaleman/dev/blaze-design rebase --continue
```

If the user wants to back out at any point:

```bash
git -C /Users/kevinaleman/dev/blaze-design rebase --abort
```

…which puts everything back to where it was before the rebase started. Reassuring — no work is lost.

### 5. Restore stashed work

If you stashed in step 2:

```bash
git -C /Users/kevinaleman/dev/blaze-design stash pop
```

If `stash pop` itself conflicts, walk through it the same way as step 4. Once clean, leave the user's work uncommitted (just like before they ran `/rebase`).

### 6. Push (Case B only)

The branch has been rewritten, so the push needs `--force-with-lease`:

```bash
git -C /Users/kevinaleman/dev/blaze-design push --force-with-lease origin <branch-name>
```

`--force-with-lease` checks that the remote branch hasn't moved since you fetched — if it has, the push is rejected (someone else pushed a commit; you'd overwrite their work). **Never use plain `--force`** — that's the unsafe version.

If `--force-with-lease` is rejected, stop and surface it:

> Someone else pushed to your branch since you last fetched. That's unusual. Want me to fetch again and see what's there?

Don't retry blindly. Investigate.

For Case A (user was on `main`), skip the push — `main` is protected and you can't push to it directly anyway.

### 7. Report back

Tell the user what happened in one or two sentences:

> Done. Pulled in 7 new commits from main, replayed your 3 commits on top, force-pushed `prototype/inbox-v3`. Your uncommitted changes are back.

Or, if nothing changed:

> You were already up to date with main. Nothing to do.

## Anti-patterns

- ❌ Using `git pull` instead of `fetch + rebase`. `git pull` defaults to merge, which leaves an ugly merge commit on every catch-up. Always fetch then rebase.
- ❌ Using `git push --force` (without `--lease`). This silently overwrites collaborators' commits if they pushed between your last fetch and the push. Always use `--force-with-lease`.
- ❌ Auto-resolving conflicts. Designers need to see what's changing in their work — surface the conflict, propose a merge, get confirmation, then resolve. Don't pick a side automatically.
- ❌ Rebasing `main` itself. If the user is on `main`, fast-forward only. If FF fails, stop and surface the situation — local main shouldn't diverge.
- ❌ Forgetting to restore stashed work. If you stashed in step 2, you MUST `stash pop` in step 5, even if the rebase failed and was aborted. Otherwise the user's in-progress work is hiding in the stash list.
- ❌ Doing this on a branch that hasn't been pushed yet. If the branch only exists locally (`git ls-remote origin <branch>` returns nothing), skip step 6 entirely — there's nothing to push.
- ❌ `cd`-ing into the repo and then running git. The pre-commit hooks may rely on parent-shell CWD. Always use `git -C <path>` (see global CLAUDE.md).
