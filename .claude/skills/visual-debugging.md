# Visual debugging — chrome-devtools-mcp workflow

When the user says "ours doesn't match prod" / "the spacing looks off" / "why isn't this aligned" — **don't** ping-pong screenshots. Use the Chrome DevTools MCP plugin to read computed styles directly from both prod and localhost, and diff them.

This skill covers (a) one-time setup — including for non-tech users — and (b) the per-investigation workflow.

---

## Setup (run once per machine)

The plugin lives in Claude Code's plugin system, not in this repo. Setup is a 4-step user-driven flow because slash commands and Chrome connection both require user action.

### Step 1 — Verify whether the plugin is already installed

Try calling `mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_pages` (no args).

- ✅ Returns a list of open Chrome tabs → you're set up. Skip to "Per-investigation workflow."
- ❌ Tool not found / "no such tool" / silent failure → continue to Step 2.

### Step 2 — Tell the user to install the plugin

Output **exactly** this so the user can copy-paste:

```
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp
```

These are slash commands — **the user must type them**, you cannot invoke them. Then ask the user to confirm they ran both, and to restart Claude Code.

### Step 3 — Patch in `--autoConnect`

By default the plugin spawns its own headless Chrome — useless because the user isn't logged into prod there. Patch the cached config to attach to their existing Chrome instead.

The cached config lives at one of:

- `~/.claude/plugins/cache/claude-plugins-official/chrome-devtools-mcp/<version>/.mcp.json`
- `~/.claude/plugins/cache/claude-plugins-official/chrome-devtools-mcp/<version>/.claude-plugin/plugin.json`

Both exist; both need patching. Find them:

```bash
find ~/.claude/plugins/cache -path '*chrome-devtools-mcp*' \( -name '.mcp.json' -o -name 'plugin.json' \) 2>/dev/null
```

In each file, find the args array and add `"--autoConnect"`:

```json
"args": ["chrome-devtools-mcp@latest", "--autoConnect"]
```

Then ask the user to **restart Claude Code** so MCP picks up the new args.

> ⚠️ This patch gets blown away on plugin upgrade. If `list_pages` ever starts returning a single about:blank tab instead of the user's real tabs, re-patch.

### Step 4 — Verify

Ask the user to make sure prod (`https://app.blaze.ai/...`) is open in a Chrome tab. Then call `list_pages` and confirm both prod and `localhost:5173` appear in the list.

---

## Per-investigation workflow

Once setup is done, every visual gap follows this loop:

### 1. List the open pages

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_pages
```

Confirm both prod and `localhost:5173/<prototype>` are listed. If not, ask the user to open them.

### 2. Switch to prod, grab computed styles for the target

```
select_page → <prod page index>
evaluate_script → returns getComputedStyle + getBoundingClientRect
```

Example `evaluate_script` body for a button:

```js
() => {
  const el = document.querySelector('[data-testid="upgrade-button"]')
       ?? Array.from(document.querySelectorAll('button')).find(b => /upgrade/i.test(b.textContent));
  if (!el) return { error: 'not found' };
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    classes: el.className,
    rect: { width: rect.width, height: rect.height, x: rect.x, y: rect.y },
    box: {
      padding: cs.padding,
      margin: cs.margin,
      gap: cs.gap,
      border: cs.border,
      borderRadius: cs.borderRadius,
    },
    type: {
      font: cs.font,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
    },
    bg: cs.backgroundColor,
    display: cs.display,
  };
}
```

Tailor the property subset to whatever you're investigating. Don't dump the whole `CSSStyleDeclaration` — it's noisy.

### 3. Switch to localhost, run the same script

```
select_page → <localhost page index>
evaluate_script → same JS body
```

### 4. Diff property-by-property

Side-by-side. Find what differs. Fix the SCSS. Reload localhost. Re-run script.

---

## When to use which tool

| Tool | Use when |
|---|---|
| chrome-devtools-mcp (this skill) | "Why doesn't this match prod?" — needs prod render with auth. Live, interactive, one-shot inspection. |
| `pnpm inspect` | Quick computed-style dump for a localhost-only element. No auth needed. Faster to invoke than MCP. Outputs to terminal + screenshot. |
| Playwright snapshot tests | **Regression catching**, not debugging. See `.claude/skills/visual-snapshot-testing.md`. |

---

## Anti-patterns

- ❌ Asking the user for more screenshots after they've already sent one. Always reach for MCP first.
- ❌ Reading prod SCSS files and assuming they describe the render. They often don't (cascade, JS-applied classes, runtime feature flags). Computed values from the live DOM are authoritative.
- ❌ "Visual matching" — picking a color or pixel value that produces the right look without finding the source rule in prod's repo. See `CONVENTIONS.md` § "Visual-matching is forbidden."
- ❌ Skipping Step 4 verification after install. If MCP attached to its own headless Chrome instead of the user's, you'll silently get useless data.
