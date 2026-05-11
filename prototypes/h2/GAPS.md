# Component gaps for h2-index

Components or component variants this prototype needs that the lib doesn't yet
support. Each entry is a candidate for a future component-porting plan. Sorted
by likely usage frequency in this and other H2 surfaces.

## Missing components

### CreditsBadge / TopBarRight cluster
Star + "{n} Credits" inline read-only chip in the topbar. Currently inlined as
a `<span>` with a local `StarIcon`.

- Anatomy: 6px gap, 13px Söhne-400 in `var(--dark-80)`, leading 14px star icon
  in `var(--dark-60)`.
- Source: Ivan's `index.html` `.credits` rule (line ~151).
- Now that `<Star>` exists at 12px, may want to add a 14px Star (or have the
  badge accept a `Star size={14}` from the icon prop).

### Upgrade button (purple-themed Button variant)
Same shape as a secondary Button (7px 14px padding, 8px radius, 13px
Söhne-500), but with a purple border (`#C8B5FB`), purple text (`var(--purple)`)
and a hover bg of `#F5F1FF`. Optionally with a leading lock icon.

- Could be added as `<Button variant="upgrade">` or a `tone="purple"` modifier
  on the existing secondary variant.
- Source: Ivan's `index.html` `.upgrade-btn` rule (lines ~156–166).

### TabChip / FilterChip (used as feed filters here, will recur)
Toggleable rounded-99px pill with a counter and an active state distinct from
our existing `Chip`. Currently emulated by passing inline counter spans inside
`<Chip>`.

- inactive: transparent bg, no border, `var(--dark-60)` text, hover bg
  `var(--dark-4)`.
- active: white bg, `var(--dark-15)` border, `var(--dark-90)` text, faint
  shadow.
- Real `<TabChip selected count={n}>` would feel cleaner than inline counters
  and could be the H2 standard for tab strips.
- Source: Ivan's `index.html` `.ff` and `.ff.active` rules (lines ~440–459).

### NavItem trail badge
"Integrations 3/10" — small right-aligned counter inside a NavItem. Reuses
font 11px Söhne-400 in `var(--dark-40)`.

- API sketch: `<NavItem label="Integrations" trail="3/10" />` OR a child
  `<NavItem.Trail>` slot composed via the existing children API.
- Source: Ivan's `index.html` `.nav-item .nav-trail` rule (lines ~115–117).

### WorkspaceSelector
Top-of-sidebar row: brand mark in a 26px rounded square (yellow bg from
`var(--brand)`, with a "B" mark inside), workspace name "Radiant Health" in
14px Söhne-500, trailing chevron-down in `var(--dark-40)`. Hover bg
`var(--dark-4)`.

- API sketch: `<WorkspaceSelector mark={<Logo variant="mark" />} name="Radiant Health" onPress={...} />`.
- Source: Ivan's `index.html` `.workspace` rule (lines ~71–91).

### HelpRow (sidebar footer)
Question-mark icon + "Help & Learn Blaze" label, same row treatment as
`<NavItem>` but visually a footer item below the divider. Could be a
`<NavItem>` once a Help / Question icon exists in `@/icons/20`.

### Toaster (auto-dismiss + portal wrapper)
Toast itself is now a lib component (see Resolved). What's still missing is
the orchestration layer:

- `useToast()` hook that returns a `showToast()` callback
- `<Toaster />` portal-mounted host that renders the active toasts and
  manages auto-dismiss (~2.4s)
- Stack ordering / pause-on-hover

The h2-index toast list is currently driven by local `useState` + `setTimeout`
inside the prototype, which works but should move to a shared hook before the
next H2 page picks up the pattern.

### Missing icons (size 20 unless noted)
All needed for the H2 sidebar at canonical fidelity. Currently mapped to the
closest existing icon in this prototype.

- `OrganicSocial` (heart-with-leaf)
- `Search` / `SeoAeo` (magnifier)
- `MapPin`
- `Ugc` / `People` (two avatars)
- `PaidSocial` (trending-up arrow)
- `PaidSearch` (dollar-in-circle)
- `Email` (envelope)
- `LandingPages` (panel-left or layout)
- `Reputation` (star — at size 20, distinct from the 12px Star added with
  KindBadge)
- `Integrations` (lightning bolt)
- `Help` / `QuestionCircle`
- `ChevronDown` (workspace selector trail)
- `Star` (size 14, for credits badge — currently inlined locally; the 12px
  Star added with KindBadge isn't quite right here)
- `Lock` (size 13, for Upgrade button)
- `ArrowRight` (size 11, for primary action button — currently inlined in
  `FeedItem.tsx`)

## Notes for future ports

- The H2 sidebar (Demand Gen / Conversion / Settings) is now the canonical
  Blaze sidebar AND the shell's default. Adding a workspace selector +
  trail-badge + help row would fully cover the H2 sidebar at canonical
  fidelity.
- `SourcePill` shows up across every H2 surface, not just the home feed. Now
  resolved.
- Toast appears in multiple H2 mockups (campaigns, reputation, content
  generation). Now resolved as a controlled component; a `useToast()` hook +
  `<Toaster />` portal wrapper is the next missing piece.

## Resolved

Components that were on this list and have shipped to the lib. Listed with
the commit that introduced them.

- **NavSection** — uppercase sidebar label + children grouping. `460ea2d`.
  Wired into the shell's `Sidebar` via `sections` prop; H2 grouping is now
  the default.
- **Avatar** — round image with initials fallback, 3 sizes (sm/md/lg).
  `d800a87`. Used in the topbar profile slot.
- **SourcePill** — colored chip with leading dot, 10 Blaze surface variants
  driven by `--source-<name>-bg/-fg` tokens. `fbf4c0c`. Tokens were added
  separately as `d0a2f37`.
- **KindBadge** — uppercase chip for action/alert/insight, with optional
  leading icon (Star for action, Warning for alert). `db43abb`. Star and
  Warning icons (size 12) shipped alongside.
- **Toast** — floating notification, success/generating/error variants, with
  optional action button and dismiss slot. `f79bac9`. Auto-dismiss timing
  and portal mounting are intentionally NOT in v1 — see Toaster gap above.
