# Blaze Marketer iOS — Design System

Reference documentation for the Blaze **marketer** iOS app, derived from the [⭐ New Mobile App Components](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components) Figma library. Use this as the source of truth when building prototypes, handoff specs, or new screens for the marketer surface.

**Figma source:** [⭐ New Mobile App Components](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components) (file key `EYf7EUoL3nmIKfMsOcHaG5`)
**Canvas width:** 402 px · **Safe container height:** 874 px · **Corner radius (device frame):** 62 px

**Source nodes for this document**

| Pattern | Open in Figma |
|---|---|
| Campaign list | [`5381:80179`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5381-80179) |
| Campaign list + button tapped (popover) | [`5514:91461`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-91461) |
| Campaign detail — pre-generation | [`5471:148295`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5471-148295) |
| Campaign detail — post-generation | [`5448:147513`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-147513) |
| Content cards (post variants) | [`5514:93803`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-93803) |
| CTA — pre-generated | [`5448:141481`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141481) |
| CTA — post-generated | [`5448:141952`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141952) |
| CTA — posted | [`5448:142235`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-142235) |

Every color value, typography style, and effect below is taken directly from the Figma variables attached to those nodes. **Always reference the variable name in code and specs.** Do not hard-code the underlying hex — the variable is the contract.

---

## 1. Design Philosophy

Blaze Marketer uses a light-surface, glass-accent aesthetic layered over vivid brand imagery. Content surfaces stay neutral (`background-gray` / `Backgrounds/Primary`) so campaign creative does the visual heavy lifting. Transparency stacks (`dark-*` and `light-*` opacity ramps) let the same system work over white chrome and over photography without introducing new grays. Pill shapes (radius 99) signal interactivity. Motion is sparing and directional: slide-in for push, slide-up for sheet, fade for overlay.

---

## 2. Design Tokens

### 2.1 Color variables

All color variables live in the [Figma library](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components). Casing matches the Figma variable name exactly — in particular note that `Dark-8`, `Dark-4`, `Dark-60`, `Dark-80` and `Light-100`, `Light-80` appear with a leading capital while their opacity-ramp siblings use lowercase. Both forms resolve to the same values; prefer the existing casing when echoing a node's tokens.

**Neutrals — black opacity ramp**

| Variable | Hex | Usage |
|---|---|---|
| `dark-90` | `#000000e5` | Primary text, primary button fill |
| `dark-60` / `Dark-60` | `#00000099` | Metadata, secondary text, trailing values |
| `dark-40` | `#00000066` | Disabled / muted glyph |
| `dark-25` | `#00000040` | Extremely subtle dividers, subdued icon |
| `Dark-8` / `dark-8` | `#00000014` | Primary button border, sheet border, card outline |
| `Dark-4` / `dark-4` | `#0000000a` | Row dividers, soft chip fills |
| `dark-2` | `#00000005` | Page-level surface tint |

**Neutrals — white opacity ramp**

| Variable | Hex | Usage |
|---|---|---|
| `light-100` / `Light-100` | `#ffffff` | White surfaces, text on dark |
| `light-60` | `#ffffff99` | Tab bar glass fill, tertiary text on imagery |

**Semantic**

| Variable | Hex | Usage |
|---|---|---|
| `green` | `#20a14f` | Success label |
| `green-10` | `#20a14f1a` | Success pill fill |
| `upgrade` | `#6a00ff` | "Posted" status label, upgrade moments |
| `upgrade-10` | `#6a00ff1a` | "Posted" pill fill |

**Surfaces**

| Variable | Hex | Usage |
|---|---|---|
| `background-gray` | `#f7f7f7` | App background (page chrome) |
| `background-light` | `#ffffff` | Card and sheet surface |

Inline hex values not listed above (e.g. the `#3f2b00` text used on `warning-30` pills for the "Review" state) are bound to specific components rather than the global palette — treat them as local overrides, not tokens.

### 2.2 Typography variables

The typeface is Söhne. Variables are bound to specific text roles — reference by variable name, not by raw size.

| Variable | Family · Style | Weight | Size | Line height | Letter spacing |
|---|---|---|---|---|---|
| `New H1 Mobile` | Söhne Buch | 400 | 28 | 1.1 | 0 |
| `New H2 Mobile` | Söhne Buch | 400 | 22 | 1.2 | 0 |
| `New H3 Mobile` | Söhne Buch | 400 | 18 | 1.4 | 0 |
| `New H4 Mobile` | Söhne Kräftig | 500 | 16 | 1.4 | 0 |
| `New H5 Mobile` | Söhne Kräftig | 500 | 14 | 1.4 | 1 |
| `New Primary Text Mobile` | Söhne Buch | 400 | 16 | 1.5 | 0 |
| `New Secondary Text Mobile` | Söhne Buch | 400 | 14 | 1.4 | 1 |
| `New Metadata Mobile` | Söhne Buch | 400 | 12 | 1.4 | 1 |
| `New Label Mobile` | Söhne Buch | 400 | 12 | 1.4 | 1 |

Font files: `Söhne-Buch.otf` (400), `Söhne-Kräftig.otf` (500). Fallback stack: `'Söhne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`.

> **Note:** The default `ios/tokens/typography.css` was scaffolded with SF Pro as a system-font baseline. Blaze marketer uses Söhne for brand consistency — update the typography tokens to point at the Söhne font files before porting prototypes that depend on the brand type ramp.

Role map across the screens documented here: hero title uses `New H2` (26 px); section headers use `New H4 Mobile`; inset row labels use `Primary Text Mobile` with the trailing value in `New Primary Text Mobile` at `dark-60`; metadata strips use `New Metadata Mobile` or `Metadata Mobile`; pill labels use `New Secondary Text Mobile` at 14 px or `New Label Mobile` at 12 px on content cards.

### 2.3 Spacing & layout

Screen gutter 20 px. Section gap 20–24 px. Card inner padding 16 px. Row height 52 px (menu / detail), 55 px (tab item), 76 px (toolbar header), 44 × 44 px (toolbar buttons). Floating `+` action: 55 × 55 px at 24 px from the right edge and 118 px from the bottom (above the tab bar).

### 2.4 Radius

Pill (99) for all interactive controls — buttons, pills, chips, tab bar container, floating action. Cards 16–24. Chip 4 (list status pill) or 6 (detail status pill). Inner toolbar button region 6. Device frame 62. Image thumbnails 12–16. Content cards 16 with a 175 × 175 image area on top.

### 2.5 Elevation & effects

`Blaze glass effect` is a single named Figma effect: `Effect(type: GLASS, radius: 4)` composed with `Effect(type: DROP_SHADOW, color: #00000014, offset: (0, 0), radius: 32, spread: 0)`. Apply this to toolbar buttons floating on imagery and to the tab bar capsule. In CSS, approximate with `backdrop-filter: blur(20px) saturate(140%)` + `box-shadow: 0 0 32px rgba(0,0,0,0.08)`.

Sheet / modal elevation: `box-shadow: 0 15px 75px rgba(0,0,0,0.18)` (non-variable, component-scoped). Floating `+`: `box-shadow: 0 6px 24px rgba(0,0,0,0.18), 0 0 32px rgba(0,0,0,0.08)`. Text over imagery: `text-shadow: 0 1px 7px rgba(0,0,0,0.45)` on the hero `New H2` title.

Sticky top/bottom gradients use a vertical `rgba(247,247,247,0 → 1)` fade from `background-gray` so content scrolls cleanly under the tab bar and footer CTA.

### 2.6 Motion

| Animation | Duration | Easing | Use |
|---|---|---|---|
| `slide-in-right` | 380 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Push detail |
| `slide-out-right` | 300 ms | `cubic-bezier(0.4, 0, 1, 1)` | Pop detail |
| `slide-up` | 380 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Present sheet |
| `slide-down` | 300 ms | `cubic-bezier(0.4, 0, 1, 1)` | Dismiss sheet |
| `fade-in` | 220 ms | `ease-out` | Scrim overlay |
| `pop-in` | 260 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Popover (list `+` tapped) |
| `scale-press` | 160 ms | `ease-out` | Tap feedback (0.97 → 1) |

---

## 3. Patterns (from the 7 source nodes)

### 3.1 Campaign list — [`5381:80179`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5381-80179)

Header (116 px): page title "Campaigns" in `New H3 Mobile` at `dark-90` on `background-gray`; settings (gear) and history buttons on the right as 44 × 44 glass buttons (`light-60` fill + `Blaze glass effect`). Bottom edge is a 1 px `Dark-4` underline.

Row: 104 × 125 image thumbnail (16 px radius), 17 px gap, vertical text stack — date range in `Metadata Mobile` with the "–" separator at `dark-25`; title in `New Primary Text` (16 px, 2-line clamp) at `dark-90`; category label with emoji in `Metadata Mobile` at `dark-60`; trailing status pill (see §3.3). Trailing chevron-right-small at `dark-60`.

Floating `+`: 55 × 55, `dark-90` fill, white `plus-01` glyph, floating shadow, positioned bottom-right 24 px from edge and 118 px from the bottom (above the tab bar).

Tab bar: 402 × 126 container with a floating capsule — `light-60` fill + `Blaze glass effect` + 99 radius + 4 px inner padding. Five equal items (Home → Calendar → Campaigns → Brand Kit → More), each 55 px tall with stacked icon (22) + label in `New Label Mobile`. Selected state: `Dark-4` fill behind the selected item pill.

### 3.2 Campaign list + button tapped — [`5514:91461`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-91461)

Tapping the floating `+` opens a popover anchored above the button. Container: 279 px wide, 24 px radius, white (`Backgrounds/Primary`) with the drawer shadow. The + button state changes: the plus glyph rotates to an `x-02` (close) while the popover is open. Three rows, 1 px `Dark-4` divider between them:

| Row | Icon (36 × 36 on `Dark-4`, 10 radius) | Label (`New H5 Mobile`) | Sub (`New Label Mobile`, `dark-60`) |
|---|---|---|---|
| New Content | `layout-01` | New Content | A single post for any platform |
| New Campaign | `layers-05` | New Campaign | A set of posts around one theme |
| New Strategy | `plan-filled` | New Strategy | A full plan across many campaigns |

Backdrop: `bg-black/10` scrim (fade-in). Dismiss by tapping the backdrop or the now-close button.

### 3.3 Status pill

Compact inline pill used in list rows and in the detail chip row. Height 20 px in list, ~24 px in detail. Padding 3 × 6 (list) or 4 × 8 (detail). Radius 4 (list) / 6 (detail).

| Status | List pill fill | List pill text | Detail pill fill | Detail pill text |
|---|---|---|---|---|
| Pre-generation ("Generates in 3 days") | `Dark-4` | `dark-60`, `New Label Mobile` | `light-100` + 1 px `Dark-4` border | `dark-60`, `New Secondary Text Mobile` |
| Post-generation ("{n} posts to Review") | `warning-30` (component-scoped `rgba(255,174,0,0.3)`) | `#3f2b00` (component-scoped), `New Label Mobile` 500 | same fill | same text, 14 px |
| Posted | `upgrade-10` | `upgrade`, `New Label Mobile` 500 | `upgrade-10` | `upgrade`, `New Secondary Text Mobile` 500 |

All status is conveyed with both color and label — never color-only.

### 3.4 Campaign detail — pre-generation — [`5471:148295`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5471-148295)

Full-bleed hero (`aspect 402:320`) with a `to-top` black gradient (0.85 → 0.18 opacity) so the chip row and `New H2` title read over imagery. Chip row above the title: category chip (`dark-60` fill + `backdrop-blur`, emoji + label in `New Secondary Text Mobile` at `light-90`) and the pre-gen status pill. Title in `New H2` at `light-100` with the hero text-shadow.

Floating Back and More buttons ride over the hero at `top: 61`, 44 × 44, `light-10` fill + `Blaze glass effect`, icons in `light-100`. Body is `background-gray` with a 20 px gutter; content groups are inset-grouped `Backgrounds/Primary` cards (24 radius) with 1 px `Dark-4` dividers between rows (no divider after the last row).

Sections, in order:

1. **Campaign details** — Theme (leading row with chevron), a free-text theme block in `New Primary Text Mobile` at `dark-90`, then rows for Call-to-action, Target link, Audience, Context. Row label uses `Primary Text Mobile` at `Dark-80` in the left slot; trailing value uses `New Primary Text Mobile` at `dark-60` right-aligned (max 55 % width). Context row shows up to 4 attachment tiles + "+N" count at `New Secondary Text Mobile` `dark-90`.
2. **Schedule & accounts** — Schedule, Accounts (overlapping avatar stack + "{name} + N" at `dark-60`), Content (breakdown like "2 stills, 2 carousels, 2 videos, 2 blogs").
3. **Post prompts** — see §3.6.

Footer CTA: see §3.7 pre-gen.

### 3.5 Campaign detail — post-generation — [`5448:147513`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-147513)

Same hero, back/more chrome, and Campaign details / Schedule & accounts sections as pre-gen with one exception: the Theme leading row is removed (the theme block displays directly as the first card body). Status pill flips to post-generation variant ("{n} posts to Review").

The Post prompts section is replaced by **Review {n} posts** — a horizontally scrolling strip of content cards (see §3.8). The section header uses `New H4 Mobile` and includes a trailing "See all →" affordance in `New Secondary Text Mobile` at `dark-60`.

**Posted variant** uses the same post-generation body, but the status pill flips to `upgrade` / `upgrade-10` ("Posted") and the section header label switches to "{n} posts published". Footer CTA: see §3.7 posted.

### 3.6 Post prompt card (pre-generation)

24 radius white card, 16 px padding. Left: 120 × 120 rounded-16 thumbnail with a floating 28 × 28 edit FAB in the bottom-right corner (`light-100` fill + `Blaze glass effect`, `edit-01` icon). Right stack:

- Metadata chip row (22 px): type chip (`New Label Mobile`, `dark-90`, with a leading format icon and a trailing `chevron-down` accessory for inline editing) + accounts chip (same shape). Chips are `light-100` fill + 1 px `Dark-8` border at 6 radius.
- Body copy in `New Secondary Text Mobile` at `dark-90`, up to 4 lines clamped.
- Trailing timestamp in `New Label Mobile` at `dark-60`.

Footer strip: 1 px `Dark-4` divider above a 40 px split row with Delete (`trash-02`) on the left and Regenerate (`refresh`) on the right; both labeled in `New Secondary Text Mobile` at `dark-90`.

### 3.7 CTA (sticky footer)

Footer container: 20 px horizontal padding, ~34 px bottom safe area, sticky-top gradient fading from `background-gray` transparent → opaque. Primary button is an L (52 px, 99 radius, `dark-90` fill, `light-100` text in `New H4 Mobile`).

**Pre-generated — [`5448:141481`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141481)**

Single primary: `Generate Now ✦ 125`. Label + `credits` glyph in `light-100`, credit count in `light-100` at ~70 % opacity with `Primary Text Mobile` tracking. Sub-copy below in `New Secondary Text Mobile` at `dark-60`: "Edit your campaign before anything is generated."

**Post-generated — [`5448:141952`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141952)**

Stacked CTA. Primary: `Review Posts` with a leading `check-02` verified icon in `light-100`. Secondary: 44 px pill, `light-100` fill + 1 px `Dark-8` border, label `Regenerate All` in `dark-90` with trailing `credits` + `125` at `dark-60`. No sub-copy.

**Posted — [`5448:142235`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-142235)**

Single primary with a leading `calendar-01` icon: `Open Insights`. Sub-copy below in `New Secondary Text Mobile` at `dark-60`: "Published successfully! See how the posts performed."

### 3.8 Content cards — [`5514:93803`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-93803)

Seven type variants, 175 px wide. All share:
- 175 × 175 media area (16 radius top corners), 1 px `Dark-4` border on the whole card.
- Format pill overlaid top-left on the media: `bg-black/45` + `backdrop-blur`, 99 radius, 8 × 4 padding. Icon (12) + label in `New Label Mobile` at `light-100`.
- Body: 10 × 10 padding, body copy in `New Label Mobile` at `dark-90` (3-line clamp), trailing timestamp in `New Label Mobile` at `dark-60`.

**Variants (property1 → format icon → media treatment)**

| Variant | Format icon | Media |
|---|---|---|
| Still Image | `image-03` | Photo |
| Stories | `layout-01` | Photo |
| Carousel | `layout-01` multi | Photo w/ dot-indicator |
| Feed Video Post | `send-01` / play | Photo + play overlay |
| Shorts | `send-01` portrait | Portrait photo |
| Email | `send-01` | Placeholder text lines (no image) |
| Blog | `card` | Placeholder text lines (no image) |

---

## 4. Iconography

Line icons at 1.5–1.7 px stroke, 24 px native size (scaled to 16 / 18 / 20 / 22 in use). Source SVGs live in `ios/icons/`:

`add-square-04`, `arrow-right-sm`, `atom`, `attatchment-01`, `bar-group-03`, `brandkit_filled`, `calendar-01`, `card`, `check-02`, `chevron-down`, `chevron-left`, `chevron-right-small`, `chevron-right-small-1`, `credits`, `edit-01`, `eye-open`, `folder`, `heart`, `help-circle-contained`, `home-04`, `home-filled`, `image-03`, `information-circle-contained`, `layers-05`, `layout-01`, `lightning-01`, `line-chart-up-01`, `logout-02`, `more-dots`, `plan-filled`, `plus-01`, `search-01`, `send-01`, `settings`, `trash-02`, `user-profile-circle`, `x-02`, `Bug`.

Tab bar map: Home → `home-04`, Calendar → `calendar-01`, Campaigns → `layers-05`, Brand Kit → `atom`, More → `more-dots`. Floating `+` uses `plus-01`; when the popover is open it swaps to `x-02`. Detail Back uses `chevron-left`; More uses `more-dots`. CTA accessories: credits chip uses `credits`; "Open Insights" uses `calendar-01`; "Review Posts" uses `check-02`.

---

## 5. Accessibility

- Contrast: `dark-90` on `Backgrounds/Primary` = 18:1 (AAA); `dark-60` on `Backgrounds/Primary` = 7.5:1 (AA body, AAA large); `light-100` on `green` = 4.6:1 (AA large — reserve for pills and accents, not long copy); `upgrade` on `upgrade-10` = 6.4:1 (AA body on light surfaces).
- Touch targets ≥ 44 × 44 for all icon buttons (toolbar buttons meet this exactly).
- Status is always conveyed with both color and label ("Posted", "12 posts to Review", "Generates in 3 days", "Needs context") — never color-only.
- Respect `prefers-reduced-motion`: disable `slide-in-right` / `slide-up` / `pop-in` and fall back to `fade-in` only.
- Every navigable row exposes a visible chevron — do not use a row as a tap target without a clear trailing affordance.

---

## 6. Usage rules

Do reference the exact Figma variable names in code and specs — `Dark-8`, not `rgba(0,0,0,0.08)`; `New H2`, not `Söhne 26/1.1`. Do keep interactive elements pill-shaped (99). Do pair every status color with a text label. Do anchor primary actions in a sticky footer on scrollable detail screens.

Don't mix arbitrary radii — a card is 16 or 24, a chip is 4 or 6, a button is 99. Don't put chrome directly over imagery without the `Blaze glass effect`. Don't introduce new grays — extend the `dark-*` / `light-*` opacity ramps. Don't hardcode the black-ramp or upgrade hexes; bind to the variable so theme swaps stay clean.

---

## 7. File map

**Design source (external)**

- [⭐ New Mobile App Components](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components) — canonical Figma library (this doc is derived from it; file key `EYf7EUoL3nmIKfMsOcHaG5`)
- ⭐ Icons — separate Figma library for the icon set
- `Söhne-Buch.otf` (400), `Söhne-Kräftig.otf` (500) — typefaces

**In this repo (`ios/`)**

- `ios/DESIGN.md` — this document
- `ios/tokens/colors.css` — iOS semantic colors (`var(--ios-label)`, `--ios-blue`, etc.)
- `ios/tokens/spacing.css` — 8pt grid, device dimensions, radii
- `ios/tokens/typography.css` — type scale (update to Söhne — see §2.2)
- `ios/icons/*.svg` — exported icon set
- `ios/components/` — vetted iOS components (`@ios/components`)
- `ios/staging/` — WIP iOS components (`@ios/staging`)
- `ios/prototypes/_shell/StatusBar.tsx` — Dynamic Island + system icons
- `ios/prototypes/_shell/PhoneFrame.tsx` — 390×844 bezel, scrollable content, footer slot
- `ios/prototypes/mobile-app/` — reference prototype: list → detail (pre-gen / post-gen / posted) → new-campaign flow

Additional prototypes will be added under `ios/prototypes/<slug>/` as they are ported from earlier explorations.

---

*Last updated: May 12, 2026 · Canvas: 402 × 874 · Source: [⭐ New Mobile App Components](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components) (file key `EYf7EUoL3nmIKfMsOcHaG5`) — nodes [`5381:80179`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5381-80179), [`5514:91461`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-91461), [`5471:148295`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5471-148295), [`5448:147513`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-147513), [`5514:93803`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5514-93803), [`5448:141481`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141481), [`5448:141952`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-141952), [`5448:142235`](https://www.figma.com/design/EYf7EUoL3nmIKfMsOcHaG5/%E2%AD%90-New-Mobile-App-Components?node-id=5448-142235).*
