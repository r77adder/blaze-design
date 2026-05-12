# /setup — one-time machine setup for designers/PMs

Use when the user says any of: "set me up", "setup", "/setup", "I'm new here", or it's clear they're on a fresh machine that has never run this repo.

This walks a non-engineer through installing the four tools they need:
1. **Homebrew** — Mac package manager
2. **Node 20+** — JavaScript runtime
3. **pnpm** — package manager (handled via `corepack`, ships with Node)
4. **gh** — GitHub CLI (so `/share` can push and open PRs)

Then it auths `gh`, installs deps, boots the dev server, and opens the browser. The user shouldn't need to know what any of those tools are — just follow the prompts.

## Steps

### 1. Detect what's already installed

Run these in parallel — no harm if any fail:

```bash
command -v brew && brew --version | head -1
node --version 2>/dev/null
corepack --version 2>/dev/null
command -v pnpm && pnpm --version
command -v gh && gh --version | head -1
gh auth status 2>&1 | head -3
```

Build a checklist of what's present vs missing. Tell the user what you found in plain language:

> Here's what I see:
> - Homebrew: ✅ installed
> - Node 20+: ❌ not installed
> - pnpm: ❌ (depends on Node)
> - gh CLI: ❌ not installed
> - gh authenticated: ❌
>
> I'll walk you through each missing piece.

### 2. Install Homebrew (if missing)

Homebrew's installer asks for your Mac password (sudo), so **you have to run it yourself** — I can't drive sudo prompts.

Tell the user:

> Open **Terminal.app** (Cmd+Space → "Terminal") and paste this:
>
> ```
> /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
> ```
>
> When it asks for your password, that's your Mac login password. Hit Enter when prompted. It takes 3-5 minutes.
>
> When it finishes, **come back here** and tell me "done" or "ready".

Wait for the user to confirm. After they say done, re-run `brew --version` to verify.

If Homebrew installed successfully, it may print extra instructions about adding it to PATH (Apple Silicon Macs need `eval "$(/opt/homebrew/bin/brew shellenv)"` added to `~/.zprofile`). If `command -v brew` still fails after install, run:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile && eval "$(/opt/homebrew/bin/brew shellenv)"
```

…and verify with `brew --version`.

### 3. Install Node 20+, gh (if missing)

Once Homebrew is working, these are safe for me to run directly — no sudo needed:

```bash
brew install node@20 gh
```

If only one is missing, install just that one. After install, verify:

```bash
node --version
gh --version | head -1
```

Node should report `v20.x.x` or higher.

### 4. Enable corepack (pnpm)

Corepack ships with Node 20+ but isn't enabled by default. Enable it so `pnpm` works from the `packageManager` field in `package.json`:

```bash
corepack enable
```

Then verify pnpm works (this may download pnpm 10.23.0 on first run — that's expected):

```bash
cd /Users/kevinaleman/dev/blaze-design && pnpm --version
```

If you see `10.23.0` (or whatever's in `package.json` → `"packageManager"`), you're good.

### 5. Authenticate gh

Check status:

```bash
gh auth status 2>&1
```

If not authenticated, run:

```bash
gh auth login --web --git-protocol https
```

This will:
1. Print a one-time code (e.g. `1234-ABCD`)
2. Open your browser to GitHub
3. Ask you to paste the code there

Walk the user through it:

> I'm starting the GitHub login. Watch for a code like `1234-ABCD` in this chat. When your browser opens, paste that code into GitHub.
>
> If your browser doesn't open automatically, copy the URL it prints and open it yourself.

Wait for the command to finish (it blocks until the browser flow completes). Re-verify with `gh auth status`.

### 6. Install dependencies

```bash
cd /Users/kevinaleman/dev/blaze-design && pnpm install
```

This takes 30-90 seconds the first time. Don't worry about warnings about peer deps — they're expected.

### 7. Start the dev server + open the browser

Start the playground in the background and open the browser:

```bash
cd /Users/kevinaleman/dev/blaze-design && pnpm dev
```

Run this in the background so Claude can keep using the terminal. Once it logs `Local: http://localhost:5173`, open that URL in the browser using the `open` command:

```bash
open http://localhost:5173
```

### 8. Wrap up

Tell the user:

> You're all set. From now on:
> - **Make a new prototype:** `/new-prototype <name>` or just say "make a new prototype called X"
> - **Port a mockup:** drop an HTML file path and say "port this" — or use `/port-html <path>`
> - **Catch up with the latest main:** `/rebase`
> - **Share your work:** `/share` (opens a PR for the team)
>
> The dev server is running in the background. If you close Claude Code and come back later, just run `pnpm dev` again.

## Anti-patterns

- ❌ Trying to run the Homebrew installer yourself via `Bash`. It needs sudo, which prompts for the user's Mac password — you can't drive that. Always hand it off and wait.
- ❌ Skipping `corepack enable`. Without it, `pnpm` won't work even though it appears to be available, because the `packageManager` field is honored by corepack, not by a globally-installed pnpm.
- ❌ Using `gh auth login` without `--web --git-protocol https`. The interactive prompts are friendlier for non-engineers; HTTPS protocol means they don't need an SSH key.
- ❌ Running `pnpm install -g pnpm` or `brew install pnpm`. The `packageManager` field in `package.json` pins pnpm to a specific version — corepack handles it. A globally-installed pnpm will fight with that.
- ❌ Forgetting to verify each step before moving on. If `brew --version` fails after install, stop and fix PATH before trying `brew install`. Same for `node`, `pnpm`, `gh`.
- ❌ Trying to be clever about `node@20` vs the latest. The `engines` field requires `>=20`; just pin to 20 for predictability.
