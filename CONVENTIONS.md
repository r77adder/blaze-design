# blaze-design conventions

Policy decisions for the design system. Read this before adding or changing components.

## Source of truth

**Prod (`apps/blaze/src/blaze-ui/`, `apps/blaze/src/blaze-components/`, `apps/blaze/src/components/`) is the source of truth for component APIs, props, and visual treatment.**

`figma-make-guidelines.md` (Ivan's design spec for Claude Design) is **reference only**. It is a snapshot of design intent for a parallel context (Claude-driven HTML mockups). Where it diverges from prod, prod wins.

This means:
- Component prop names, types, and defaults should match prod's component of the same name.
- SCSS mixin choices (`@include sm-sohne-medium` vs `@include sm-sohne`) should match prod's actual usage.
- Color tokens, padding scales, border-radii, and dimensions should match prod's CSS module values.
- When porting, read the prod component first; cross-reference the figma-make-guidelines only if prod is silent.

## Why this policy

Earlier components over-indexed on the figma-make-guidelines because that file was front-and-center while the lib was being scaffolded. The result: the Text component invented a `weight` prop with German names that doesn't exist in prod; Button typography rendered in weight 400 instead of prod's actual 500; size-naming drifted across components. The audit on 2026-05-09 (`~/Documents/Obsidian Vault/blaze/blaze-design/decisions/`) showed the gap.

The tradeoff: we accept some "uglier" naming (e.g., `variant: 'metadata' | 'largeList' | 'smallList'` instead of t-shirt sizes) in exchange for a 1:1 surface that almanac-editor can consume by changing import paths only. No adapter layers, no breaking-change roadmap.

## Two tiers: vetted vs staging

The repo separates components into two tiers, both lockstep with the source-of-truth policy above:

### `src/components/` — VETTED

- Ships in the publishable lib (`@blaze/design-system`).
- Each one has a 1:1 equivalent in `apps/blaze/src/blaze-ui/` with matching API surface (modulo the strip-list below) and matching visual render verified via Chrome DevTools MCP.
- Today: `Button`, `Heading`, `Paragraph`, `Text`.
- Eng-protected — designers/PMs don't edit these directly.

### `src/staging/` — WORK IN PROGRESS

- **NOT** shipped in the publishable lib.
- Shared across prototypes; usable in any prototype.
- Includes both (a) components whose closest prod equivalent lives in `apps/blaze/src/components/` or `apps/blaze/src/common/` (i.e. app-level, not lib-level — prod hasn't blessed them as primitives yet) and (b) components with no clean prod equivalent at all (genuine new shapes).
- Open to prototype-driven evolution. The API may shift as we learn from prototypes.
- Today: `Avatar`, `Card`, `Chip`, `KindBadge`, `Logo`, `NavItem`, `NavSection`, `Pill`, `SourcePill`, `Toast`, `WorkspaceSelector`.

### Promotion: staging → vetted

The hard gate is **prod adoption**: `apps/blaze/src/blaze-ui/<Name>/` must exist with a comparable API. Until then, components stay in staging — that's a clear signal that the prod team hasn't blessed the abstraction yet.

Full promotion checklist: `.claude/skills/promoting-staging-component.md`.

### Where to scaffold a new component

Default to `staging/`. The plopfile asks at scaffold time — pick **vetted** only if a `apps/blaze/src/blaze-ui/<Name>/` already exists. Inventing a vetted component from scratch (no prod precedent) is forbidden — vetted always graduates from staging.

## Strip-list when porting from prod

Prod components carry coupling that doesn't belong in a design system. When porting, strip:
- Redux (`useSelector`, `useDispatch`)
- MobX (`useRootStore`, observed stores)
- React Query (`useQuery` and friends — domain hooks like `useCurrentWorkspace`)
- React Router (`NavLink`, `useHistory`, `matchPath`, `useLocation`) — replace with `isActive` and `onPress` props
- Custom auth/session hooks (`useSession`, `useLoggedIn`)
- Feature flag hooks (`useIsSystemRedesign`, etc.) — pick one mode (the redesign one, since that's where prod is heading) and bake it in
- `[data-autopilot-system-redesign='on']` SCSS overrides — pick the redesign-mode value and use it as the default

Do NOT strip:
- `forwardRef` and `displayName` — keep
- Native HTML attribute extension via `...rest` — keep
- `react-aria` primitives like `useButton`, `useHover`, `useFocusRing` — case-by-case. If they're load-bearing for accessibility (focus rings, keyboard nav, ARIA), keep them. If they're just wrapping native semantics, drop in favor of native.

### Use Chrome DevTools MCP for visual gap debugging

When investigating "ours doesn't look like prod," skip screenshot loops. Use the Chrome DevTools MCP plugin (set up with `--autoConnect` to attach to your live Chrome where you're already logged into prod):

1. `list_pages` — confirm both prod and localhost tabs are visible
2. `select_page` to prod tab → `evaluate_script` to grab `getComputedStyle()` + `getBoundingClientRect()` of the target element. Build a small JS function that returns the subset of properties you care about.
3. `select_page` to localhost → run the same script
4. Compare property-by-property → fix what differs

This caught the Upgrade button mismatch in one round (`gap: 2px` in prod vs our `5px`) instead of guessing across multiple screenshots. Also caught that prod's "Upgrade" button isn't the legacy `VirtualMarketerUpgradeButton` gradient at all — it's a regular `<Button variant="secondary">`. Reading prod's SCSS files alone misled the implementer for several rounds; one DevTools-MCP inspection settled it.

Trust the computed values, not the source SCSS. SCSS files can be misleading when prod uses a different component than the one you assumed.

### DevTools is the source of truth when investigating prod

If the user (or anyone) inspects an element in prod and the Styles/Computed panel shows a specific selector + property + value, **that IS the rule producing the visual**. Don't go looking for a different one because it doesn't match your prediction. Find that exact selector in the SCSS and port it.

Common mistake: assuming a redesign-mode `[data-autopilot-system-redesign='on'] &:hover` block fully replaces the default `&:hover, &.highlighted` rule outside it. CSS doesn't work that way — properties not re-set in the more-specific block cascade from the less-specific one.

### Visual-matching is forbidden

When prod looks different from what our cascade investigation predicts, **do not "visual match"** by picking a token that produces the right pixel value. Always keep digging in the editor repo until you find the actual rule producing the prod render — even if it means reading 4 SCSS files or tracing a JS-applied className. The whole point of 1:1 alignment is fidelity to *prod's actual code*, not approximation. If after thorough investigation you genuinely cannot find the rule, STOP and surface the mystery to the user — don't ship a guess.

### Which mode does this component render in?

**Redesign mode is the source of truth for new Blaze work.** The
`data-autopilot-system-redesign='on'` attribute is set on
`document.documentElement` (i.e. `<html>`) by
`apps/blaze/src/hooks/useAutopilotProvider.tsx`:

```tsx
useEffect(() => {
  if (isOnboardingPath || !currentWorkspace) return
  if (isVirtualMarketer) {
    document.documentElement.setAttribute('data-autopilot-system-redesign', 'on')
  } else {
    document.documentElement.setAttribute('data-autopilot-system-redesign', 'off')
  }
}, [isVirtualMarketer, isOnboardingPath, currentWorkspace])
```

`isVirtualMarketer` is a flipper flag (cloud-controlled), and it's **on by
default for new Blaze users**. Onboarding/signup paths force it on regardless.
Because the attribute lives on `<html>`, **every CSS selector inside an
`[data-autopilot-system-redesign='on'] &` block applies to every component
in the tree** — including chrome (Sidebar, TopBar) and inside-feature
components (Button, Pill, etc).

The earlier version of this doc claimed chrome rendered in default mode
because we only saw inline JSX usage of the attribute (`VirtualMarketerHomeV2`,
`Integrations`, etc) and missed the central effect. **Trust the runtime
applicator, not the inline overrides.** Inline `data-autopilot-system-redesign="on"`
attrs in feature wrappers are belt-and-suspenders — they keep the redesign
on even if the global flag is somehow off (e.g. unauthenticated routes).

**Rule of thumb when porting:** unless your component will only ever be
consumed in a context where the FF is explicitly off (legacy admin tools,
specific `data-autopilot-system-redesign="off"` wrappers), bake the
redesign-mode SCSS values in as defaults. That matches what prod actually
renders for the user.

### Investigation methodology — finding what produces a prod visual

When the user (or anyone) reports a visual gap between our render and prod, follow this in order:

1. **Inspect element in prod DevTools.** Computed panel = ground truth for what prod actually renders. Note the:
   - Class list on the target element (the CSS-module hash names like `NavItem_root_21e50.NavItem_highlighted_21e50` are searchable below)
   - Computed `font-size`, `line-height`, `padding`, `height`, `background-color`
   - The cascading rules in the Styles panel (which selectors match, in order)

2. **Search prod for the class names** (without the hash suffix). E.g., if DevTools shows `NavItem_root` and `NavItem_highlighted`, run:
   ```bash
   grep -rn '\.root\|\.highlighted' apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/NavItem/
   ```
   This gives you the SCSS file producing those classes.

3. **Trace the render tree upward** to find the `data-autopilot-system-redesign` attribute (or its absence). Open the prod TSX file containing the component, find the parent component, repeat. The closest `data-autopilot-system-redesign="on"` ancestor (or document.documentElement attribute) determines whether redesign-mode SCSS rules apply.

4. **Read the SCSS cascade in DOM-order, not file-order.** A property defined OUTSIDE the redesign block cascades INTO it unless explicitly overridden. Common mistake: assuming `[data-autopilot-system-redesign='on'] &:hover` block fully replaces a sibling `&:hover, &.highlighted` rule. It doesn't — properties not re-set in the more-specific block carry forward.

5. **If the predicted value doesn't match DevTools, you're reading the wrong cascade.** Trust DevTools — find the actual selector it shows and locate that exact rule.

### When porting prod's composition into a different shape, redo the layout math

If we collapse two prod-sibling components into a parent-child wrapper (e.g. SectionHeader + items → a single `<NavSection>` wrapping both), prod's CSS values were written assuming sibling layout. Margins, padding, gaps that prod sets on the sibling positions now apply to the entire subtree if blindly hoisted to the wrapper.

Process when collapsing siblings into a wrapper:
1. List every margin/padding/gap on each prod sibling.
2. For each value, decide: is it positioning THIS sibling within its parent (carry it to the analogous element in the new shape — usually a child of the wrapper, NOT the wrapper itself), OR is it spacing this sibling from its peers (carry it to the wrapper's outer margin)?
3. The wrapper itself usually gets ONLY the inter-sibling spacing (`margin-bottom` between sections, etc), never the in-parent positioning.

Example: `NavSection` collapsed prod's `<SectionHeader>` + `<NavMenuItem>...` siblings into one `<div>`. Prod's `SectionHeader.root` margin `0 10px 4px 20px` positioned the header within NavMenu — that 20px-left was for the LABEL only, not for the items below. Putting it on the wrapper indented every item too. Fix: apply 20px-left to `.label` (the analogous element); leave the wrapper with only the vertical margin.

### Common gotchas

- **Buttons:** prod's Button uses `*-sohne-medium` (weight 500) in default mode and `*-sohne` (weight 400) in redesign mode. Buttons that render INSIDE a redesign wrapper (most app screens) get 400. Buttons in legacy chrome get 500. Match the surface.
- **NavItem:** prod's `:hover, .highlighted` background = `var(--light-40)` in BOTH modes (the rule is OUTSIDE the redesign block). The redesign `:hover` only adds a `color` rule.
- **Token resolution depends on theme + viewport:** `--default-bg` is `#ffffff` at base but flips to `#f3f5f6` for desktop + `[data-color-scheme='light']`. Trace the @media + theme cascades, not just `:root`.

## Naming conventions

### Sizes

All size-bearing props use prod's range: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`. Components pick a contiguous subset of this range as appropriate.

**Do not use** the abbreviated `'s' | 'm' | 'l'` form — it's inconsistent with prod and confusing alongside `xs`.

### Icon slots

For components with icon slots (Button, Pill, etc.):
- Leading icon: `frontIcon`
- Trailing icon: `endIcon` (NOT `backIcon` — "back" reads as "back arrow", not "trailing")

### Active / selected state

For interactive items (NavItem, Pill/Chip, etc.):
- `isActive: boolean` — currently selected/route-active
- `isHovered: boolean` — exposed via context if sub-components need to react

## Typography

### Mixin selection rules

Choose the mixin that matches **prod's redesign-mode** treatment (per the strip-list above — we bake redesign mode in as default).

- **Body text, paragraphs:** `@include md-sohne` (16px, weight 400) or `@include sm-sohne` (14px, weight 400)
- **Buttons:** `@include sm-sohne` (xs/sm/md sizes) or `@include md-sohne` (lg/xl sizes) — all Buch (400). The default-mode override in prod uses `*-sohne-medium` (500), but redesign mode strips that. Ivan's `figma-make-guidelines.md` also draws buttons as 400. Do NOT use `*-sohne-medium` for Button typography.
- **Labels, emphasis:** `@include sm-sohne-medium` (14px, weight 500) or `@include md-sohne-medium` (16px, weight 500) — for non-button emphasis (selected nav item, active tab label, table column headers, etc).
- **Small captions, metadata:** `@include xs-sohne-book` (12px, weight 400)
- **Headings:** `@include xxxl-sohne` / `xxl-sohne` / `xl-sohne` / `lg-sohne` (sizes 37/32/26/18px, weights vary per heading scale)

### Söhne weight 450 (Kräftig)

Our licensed Söhne files do not include the 450 face. Where Ivan's spec calls for Kräftig (450), we map to weight 500 (Medium) — the closest available face. This means components should NOT expose a `weight: 'kraftig'` prop because it would be visually identical to `weight: 'medium'`. Use prod's variant model instead, which encodes weight as part of semantic variant choice.

## Component composition: children vs slots

Prefer `children: ReactNode` for composition over fixed `label: string` + `icon: Component` slot props. Composition is more flexible (designers can add badges, counters, emoji, etc. without forking the component). Slot props are fine for components that need a strictly bounded surface (e.g., Button's `frontIcon`/`endIcon` make sense because the layout is rigid).

## Bulk port over piecemeal

When porting from prod, **bring the whole thing**, not one piece at a time. If you find yourself needing one icon, port the whole size folder. If you find yourself needing one color token, port the whole color scale. Cherry-picking creates subtle gaps (missing `--dark-3`, partial scales, "closest existing" icon mappings) that compound into visible chrome bugs over time. Bulk imports are mechanical, fast, and leave the lib at parity with prod's actual surface.

Wholesale-port targets:
- **Color tokens** — copy from `apps/blaze/src/styles/blaze/colors.scss` AND `apps/blaze/src/styles/colors.scss` AND `apps/blaze/src/styles/variables.scss`. Convert SCSS variable syntax to CSS custom properties (most are already custom properties under `:root`).
- **Icon library** — copy each `apps/blaze/src/blaze-ui/icons/<size>/` folder wholesale. Don't hand-translate one at a time.
- **Mixin scales** — when porting `apps/blaze/src/styles/blaze/mixins.scss`, port the whole file's typography mixins, not just the ones you think you need.

## Where to find things

- **Component implementations:** `src/components/<Name>/`
- **Icons:** `src/icons/<size>/<Name>.tsx`
- **Tokens:** `src/tokens/colors.css`, `src/tokens/typography.scss`, `src/tokens/fonts.scss`
- **Plopfile templates:** `plop/component/`, `plop/icon/`, `plop/prototype/`
- **Prototype shell:** `prototypes/_shell/`
- **CLAUDE.md hard rules:** `CLAUDE.md` (the always-loaded master rules)

## When updating this doc

This doc lives in the repo so contributors see it. The vault has a breadcrumb at `~/Documents/Obsidian Vault/blaze/blaze-design/conventions.md` pointing here. Keep them in sync.

When you add a new convention:
1. Update this file.
2. If the convention should be enforced by Claude in every session, also add a one-line rule to `CLAUDE.md`.
3. If the convention affects the plopfile templates, update those too.
