---
title: "feat: Pre-launch Confidence Layer for Meta campaign wizard"
type: feat
status: completed
date: 2026-06-03
origin: docs/brainstorms/2026-06-03-prelaunch-confidence-layer-requirements.md
---

# feat: Pre-launch Confidence Layer for Meta campaign wizard

## Overview

Ship a "Pre-launch Confidence Layer" rendered on Step 5 of the Meta campaign creation wizard (`MetaCampaignModal`) that turns the Launch screen from a config receipt into a defensible brief. The layer composes four new UI components — a plain-English `CampaignSummary`, a `SimilarToCard` anchoring projections to the user's own history, a `PreflightChecklist` with traffic-light statuses and 1-click fixes, and a `SafetyNetEditor` that captures auto-pause / spend-cap / CTR-alert rules at launch time. Additionally, inline ✨ "Why?" popovers (`WhyPopover`) appear on AI-driven decisions across Steps 2 / 4 / 5 to make every Blaze pick legible on demand. The safety-net rules are persisted per campaign and editable post-launch on the campaign detail page (`PaidSocialDetail`).

## Problem Frame

In-house marketers at small/mid businesses are the persona — they have some ad experience and use Blaze to avoid Meta Ads Manager's friction, but they keep visible control over copy, audience, and budget. The anxiety they bring to the Launch screen is not *"how does this UI work"* but *"am I about to spend $2,700 on something I can't defend?"* The current wizard does a lot for them silently (Blaze drafts topic, picks creative across four sources, suggests audience, sets recommended budget), but the *why* is invisible, there's no anchor to past performance, no safety net, and no holistic summary. The Launch screen reads like a config receipt rather than a brief a marketer could quote verbatim to a CMO. (See origin: `docs/brainstorms/2026-06-03-prelaunch-confidence-layer-requirements.md`.)

## Requirements Trace

- **R1.** Inline "Why?" affordances on AI-driven decisions across Steps 2 / 4 / 5 — click-popover, 1–3 sentence plain-English explanations.
- **R2.** Plain-English campaign summary paragraph above the Launch button on Step 5.
- **R3.** "Similar to" historical-campaign callout in Step 5 — one closest past campaign with recap metrics and similarity/difference narrative.
- **R4.** Pre-launch checklist with traffic lights (green/amber/red), 1-click fixes for ambers, hard blocks for reds gating the Launch button.
- **R5.** "Set safety net" guardrails (auto-pause-on-CPR / weekly-spend cap / CTR alert) set at launch with sensible defaults, editable post-launch on the detail page.

## Scope Boundaries

- Not training or invoking an ML model — `findSimilarCampaign` is a deterministic heuristic over `CAMPAIGNS` + `createdCampaigns`. (See origin: scope boundaries.)
- Not implementing actual auto-pause server logic — rules persist as state; no real-time enforcement.
- Not touching Cluster D (first-3-days projection, post-launch digest), Cluster B2 (Step-1 budget realistic-range), or Cluster C3 (brand-safety scanner) — deferred per origin doc.
- Not changing post-launch UI beyond a single Safety Net card on the detail page.
- Not addressing the SMB-zero-experience or agency-multi-client personas.
- No automated tests added — `CLAUDE.md` explicitly disallows snapshot tests for prototypes; verification per unit is manual scenarios.

## Context & Research

### Relevant Code and Patterns

- **Wizard shell + step dispatch** — `prototypes/h2/meta-campaign/MetaCampaignModal.tsx` owns the step-rendering switch and the Launch button. R4 gating attaches here.
- **State container** — `prototypes/h2/meta-campaign/meta-campaign-context.tsx` holds `draft`, `generatedAds`, `selectedStyles`, `createdCampaigns`, `addedAdsByCampaign`. Pattern for the new `safetyNetByCampaign` slice is `addedAdsByCampaign` (record keyed by campaign id, set via callback).
- **Step 5 layout** — `prototypes/h2/meta-campaign/steps/Step5Review.tsx` already has the Summary / Ads list / Targeting / Spend & Payment composition pattern and reusable `SectionHeading`, `SectionCard`, `SummaryRow`, `Field`, `Select` helpers we can reuse.
- **Per-card editable affordance pattern** — `prototypes/h2/meta-campaign/steps/Step4Creative.tsx` `AdVariantCard` shows how a card surfaces editable fields with `Regenerate` buttons. The same pattern (small ✨ icon next to a label) extends to `WhyPopover` triggers.
- **Click-popover with outside-close** — `prototypes/h2/pages/PaidSocialDetail.tsx` `TimeRangeSelect` (ref + `contains` outside-click handler) is the canonical pattern. `WhyPopover` mirrors it.
- **Dropdown / list popover layout** — `FormatDropdown` in `prototypes/h2/meta-campaign/AiGeneratedList.tsx` and `ContentTypeDropdown` in `prototypes/h2/organic-campaign/steps/Step5ReviewTopics.tsx`. Same visual idiom for the safety-net rule chips if needed.
- **Existing seed campaign data with metrics** — `prototypes/h2/pages/PaidSocial.tsx` `CAMPAIGNS` (with `impressions`, `ctr`, `costPerResult`, `results`, `status`, `budget`). These are the historical pool for R3 `findSimilarCampaign`.
- **Audience size estimator** — `Step5Review.tsx` `estimateAudience()` already classifies Narrow / Recommended / Broad based on age/gender/location. R4 reuses this output for the "Audience in range" check.
- **Toggle / StatusPill / Heading / Text / Button** — staging + vetted lib components used throughout. Reuse, don't reinvent.

### Institutional Learnings

- No `docs/solutions/` folder in this prototype repo; no prior institutional learnings to draw from for this feature.
- Prototype-level constraint from `CLAUDE.md`: no Playwright snapshot tests for prototypes. Verification per unit is manual scenarios, not test files.
- Design-token constraint from `CLAUDE.md`: use `var(--dark-90)`, `var(--purple)`, `var(--status-approved)`, `var(--red-70)`, etc. — never raw hex.
- Eng-protected directories (`src/components/`, `src/icons/`) — all new files for this plan live under `prototypes/h2/meta-campaign/confidence/` or modify existing prototype files.

### External References

- Skipped per Phase 1.2 — strong local patterns exist for every component shape this work needs (popover, dropdown, checklist, expandable card, summary block).

## Key Technical Decisions

- **Popovers are click-triggered with `ref`-based outside-close.** Mirrors `TimeRangeSelect` exactly. `mousedown` document listener checks `rootRef.current.contains(e.target)` — this is the pattern that already fixed the earlier dropdown bug. (See origin: "click-popover, not always-visible".)
- **"Similar to" matching is a deterministic scoring heuristic, not ML.** Weighted score over (objective match, format-mix cosine similarity, audience-tag Jaccard, budget tier, recency decay) → top score above threshold wins; below threshold renders a fallback card with category benchmarks. (See origin: R3 scope decision — seeds + this-session.)
- **Safety-net rules live in a new `safetyNetByCampaign: Record<string, SafetyNetConfig>` slice on the existing `MetaCampaignProvider`** — same pattern as `addedAdsByCampaign`. Avoids polluting the `Campaign` type, and seed campaigns (which are a `const`) can still gain editable safety nets without mutation. (See origin: "Safety-net rules are editable post-launch.")
- **Safety-net default thresholds computed from the user's history,** with category fallback. `pauseCprAbove = 1.4 × historical CPR` (median of past `costPerResult` across `CAMPAIGNS` + `createdCampaigns`, falling back to `1.4 × draft.dailyBudget / projectedLeads` heuristic). `capWeeklySpend = 1.2 × (draft.dailyBudget × 7)`. `alertCtrBelow = 1.5%` (industry floor). (See origin: "Safety-net defaults from historical data.")
- **Preflight checklist is computed pure-function from draft + generatedAds.** No async checks, no actual Meta API call — every check is verifiable from in-memory state (URL non-empty, audience size in range from existing estimator, budget ≥ Meta minimum $10, every included ad has headline + caption + cta, at least one ad included). Pixel-connected is a static ✅ per origin doc. Caps-headline detector is the one amber-with-fix path.
- **The confidence layer is rendered inside Step5Review as one cohesive block,** not split across collapsed sections. Order: existing campaign summary → existing ads list → existing targeting/spend → new `CampaignSummary` (plain English) → new `SimilarToCard` → new `PreflightChecklist` → new `SafetyNetEditor`. Launch button at the modal footer is gated on `PreflightChecklist` reporting zero red blockers.
- **Launch button gating is wired via context state.** Step5Review computes `hasRedBlocker` from the preflight result and writes it into a context flag (`launchBlocked`) that `MetaCampaignModal`'s footer reads to set the primary button's `isDisabled`. Avoids prop-drilling through the step component.
- **All new components live under a new folder** `prototypes/h2/meta-campaign/confidence/` to keep the confidence-layer surface visually grouped in the file tree and importable as a unit.

## Open Questions

### Resolved During Planning

- **How is the launch flow re-routed when the checklist has a red blocker?** — The primary Launch button is `isDisabled` until reds clear. Cancel and Back remain functional. No separate error toast — the red checklist item is the error surface.
- **How does the detail page distinguish "safety net not yet configured" from "all rules disabled"?** — A campaign without an entry in `safetyNetByCampaign` is treated as having defaults applied; the SafetyNetCard always renders. "All disabled" is shown with explicit warning copy.
- **Where do per-popover copy templates live?** — Each `WhyPopover` invocation passes its own `title` + `body` props. No central copy registry; templates live inline at the call site so the wizard step is self-explanatory. If volume grows, we'll factor later.
- **What happens to safety net state if the user removes a campaign?** — Out of scope (the prototype doesn't currently support removing campaigns); leaving stale entries in `safetyNetByCampaign` is fine.

### Deferred to Implementation

- **Exact threshold copy and tone for amber checklist items** — first-cut copy lands in Unit 3; refine in PR review.
- **Tiebreaker for `findSimilarCampaign` when two candidates score equally** — likely "more recent wins", but only matters if seed data produces ties; finalize when implementing Unit 1.
- **Whether the `SafetyNetCard` on the detail page is inline-editable or opens the `SafetyNetEditor` in an inline-expand vs modal mode** — defer until Unit 8; expand-inline is the leading bet since it composes the same component.
- **Whether to surface the safety-net rules in the post-launch toast** ("Spring Exterior is live — 3 safety rules active") — minor copy enhancement, defer to Unit 7.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Component composition on Step 5

```
┌─ Step5Review (modified) ─────────────────────────────────────────────┐
│                                                                       │
│  EXISTING                                                             │
│  ┌─ SectionCard "Campaign" ───────────────────────────┐               │
│  │  Spring Exterior — Competitor Playbook             │               │
│  │  Objective · Destination                           │               │
│  └────────────────────────────────────────────────────┘               │
│  ┌─ Ads list ──────────────────────────────────────────┐               │
│  │  3 ads ready · per-ad headline / format / cta       │               │
│  └────────────────────────────────────────────────────┘               │
│  ┌─ Targeting + Spend & payment ─────────────────────────┐             │
│  │  Age / Gender / Language / Locations / Audience size │             │
│  │  Weekly spend / Payment method                       │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                       │
│  NEW — Confidence Layer ─────────────────────────────────             │
│  <CampaignSummary draft={…} generatedAds={…} safetyNet={…} />         │
│  <SimilarToCard draft={…} pool={CAMPAIGNS + createdCampaigns} />      │
│  <PreflightChecklist draft={…} generatedAds={…} onAmberFix={…} />     │
│  <SafetyNetEditor value={…} onChange={…} historicalCpr={…} />         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                                                        
        Launch button (in MetaCampaignModal footer)
        isDisabled = launchBlocked  (set by PreflightChecklist via context)
```

### Data flow at launch

```mermaid
flowchart LR
  A[draft + generatedAds] --> B[preflight()]
  A --> C[findSimilarCampaign()]
  A --> D[campaignSummary()]
  A --> E[defaultSafetyNet()]
  B -->|checklist[]| F[PreflightChecklist]
  C -->|match?| G[SimilarToCard]
  D -->|paragraph| H[CampaignSummary]
  E -->|defaults| I[SafetyNetEditor user-edits]
  F -->|hasRed| J[setLaunchBlocked]
  I -->|finalConfig| K[finish() handler]
  J -.->|disables| L[Launch button]
  L -->|click| K
  K -->|setSafetyNet| M[safetyNetByCampaign]
  K -->|addCampaign| N[createdCampaigns]
```

### `WhyPopover` anatomy

```
inline marker:  <… label …> ✨   (button)
                              ↓ on click
                ┌─────────────────────────────────┐
                │ ✨ Why this audience?            │ ← title
                │                                  │
                │ Matches the audience profile of  │ ← body
                │ your 3 best-performing campaigns │
                │ (Spring 2024 Exterior, …).       │
                │                                  │
                │   [Got it]   (optional)          │
                └─────────────────────────────────┘
                  closes on: outside click, Esc
```

## Implementation Units

- [ ] **Unit 1: Confidence module foundation — types, state, and pure helpers**

**Goal:** Land the data layer the rest of the units consume. New `confidence/` folder under `meta-campaign/` with types and pure functions; context gains the `safetyNetByCampaign` slice + `setSafetyNet` action and a `launchBlocked` flag with `setLaunchBlocked`.

**Requirements:** R3 (heuristic), R4 (preflight logic), R2 (summary composer), R5 (defaults + state)

**Dependencies:** None

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/types.ts`
- Create: `prototypes/h2/meta-campaign/confidence/similar-campaign.ts`
- Create: `prototypes/h2/meta-campaign/confidence/preflight.ts`
- Create: `prototypes/h2/meta-campaign/confidence/summary.ts`
- Create: `prototypes/h2/meta-campaign/confidence/defaults.ts`
- Modify: `prototypes/h2/meta-campaign/meta-campaign-context.tsx` (add `safetyNetByCampaign` state, `setSafetyNet`, `launchBlocked`, `setLaunchBlocked`)

**Approach:**
- `types.ts` exports `SafetyRule`, `SafetyNetConfig`, `PreflightCheck`, `PreflightStatus`, `SimilarMatch` shapes.
- `similar-campaign.ts` exports `findSimilarCampaign(draft, pool)`: scores each `pool` campaign (`CAMPAIGNS` + `createdCampaigns`) on objective match, format-mix similarity, audience-tag overlap, budget tier, and recency decay; returns `{ campaign, similarities[], differences[], score }` if best score ≥ threshold, else `null`.
- `preflight.ts` exports `runPreflight(draft, generatedAds): PreflightCheck[]`: returns an ordered array of check items each with `id`, `status` (`'green' | 'amber' | 'red'`), `label`, optional `fix: () => Partial<DraftPatch>`, optional `detail`. Pure — no React state.
- `summary.ts` exports `campaignSummary(draft, generatedAds, safetyNet): string`: composes the four-clause paragraph (duration/scale → creative composition → audience+budget → post-launch behavior) using template variables. Handles empty / all-AI / all-proven edge cases with conditional clauses.
- `defaults.ts` exports `defaultSafetyNetForDraft(draft, history): SafetyNetConfig`: computes `1.4×` historical CPR, `1.2× weekly` cap, `1.5%` CTR floor; falls back to category defaults when history is empty.
- Context: `safetyNetByCampaign` state mirrors `addedAdsByCampaign` pattern. `setSafetyNet(id, config)` and `getSafetyNet(id)` exposed. Add `launchBlocked: boolean` + `setLaunchBlocked: (next: boolean) => void` to context; Step5 writes to it from `PreflightChecklist`, modal footer reads it.

**Technical design:** *(directional guidance, not specification)*

```
runPreflight(draft, ads):
  checks = []
  push { id: 'pixel', status: green, label: 'Pixel connected' }
  push { id: 'destination', status: draft.websiteUrl ? green : red, label: 'Destination URL set', fix?: focusDestinationInput }
  push { id: 'audience', status: estimateAudience(...).fillPct in [22..70] ? green : amber, ... }
  push { id: 'budget-min', status: draft.dailyBudget >= 10 ? green : red, ... }
  push { id: 'ads-have-headline', status: ads.every(a => a.included → a.headline.trim()) ? green : red, ... }
  push { id: 'ads-have-caption', status: ads.every(a => a.included → a.primaryText.trim()) ? green : red, ... }
  push { id: 'ads-no-all-caps', status: ads.some(a => isAllCaps(a.headline)) ? amber : green, fix: titleCaseHeadlines, ... }
  push { id: 'at-least-one-ad', status: ads.filter(included).length >= 1 ? green : red, ... }
  return checks
```

**Patterns to follow:**
- `addedAdsByCampaign` and `addAdsToCampaign` in `meta-campaign-context.tsx` for the state-slice + action pair.
- Helper modules pattern: similar pure-function helper modules exist as `competitor-creative.ts`, `organic-creative.ts`, etc. — flat exports, no React.

**Test scenarios** *(manual)*:
- `findSimilarCampaign` against default draft picks one of the seed `CAMPAIGNS` (likely `Spring Exterior Campaign` given the default name/objective).
- `findSimilarCampaign` with an empty `pool` returns `null`.
- `runPreflight` on a default Blaze-drafted campaign returns all-green except possibly one amber.
- `runPreflight` with an empty `draft.websiteUrl` returns a red item with `id: 'destination'`.
- `runPreflight` with zero included ads returns a red item with `id: 'at-least-one-ad'`.
- `campaignSummary` against the default draft renders a single readable paragraph of 2–3 sentences.
- `defaultSafetyNetForDraft` for a $90/day campaign returns `capWeeklySpend ≈ $756`, `alertCtrBelow = 1.5`, and a `pauseCprAbove` value within 1.3–1.5× the inferred historical CPR.
- `setSafetyNet` and `getSafetyNet` round-trip through context without re-renders breaking child memoization.

**Verification:**
- All helper modules export and import cleanly; `tsc --noEmit` passes.
- Console exercise: open the wizard, run each helper from a temporary debug button, verify outputs match the scenarios above.

---

- [ ] **Unit 2: `WhyPopover` shared component**

**Goal:** Ship a reusable click-popover component the rest of the surface composes. Generic API: `title`, `body`, `children` (the trigger). Outside-click and Esc close it. Mirrors `TimeRangeSelect`'s ref-based pattern.

**Requirements:** R1 (plumbing)

**Dependencies:** Unit 1 (uses no helpers directly, but ordering keeps the confidence folder cohesive)

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/WhyPopover.tsx`

**Approach:**
- Functional component. Trigger is the children (typically a small ✨ button or icon label). On click, toggle `open` state; render the popover panel with a `rootRef` ancestor; document-level `mousedown` listener uses `rootRef.current.contains(e.target)` to detect outside clicks. Esc keydown also closes.
- Popover panel positions absolute below the trigger, right-aligned. Uses purple tint (`rgba(124, 92, 252, 0.07)` background + `rgba(124, 92, 252, 0.18)` border) consistent with the wizard's "AI moment" treatment.
- Body accepts `ReactNode` so callers can compose richer content (a sentence + a list of bullets) without a registry.
- Trigger is unstyled inside the component — caller provides the `✨` icon + label, ensuring the popover looks native to its host context (slate card vs Step 5 section header).

**Patterns to follow:**
- `TimeRangeSelect` and its outside-click handler in `prototypes/h2/pages/PaidSocialDetail.tsx` lines ~294–391.
- `FormatDropdown` in `prototypes/h2/meta-campaign/AiGeneratedList.tsx` for the panel styling defaults.

**Test scenarios** *(manual)*:
- Clicking the trigger opens the panel.
- Clicking inside the panel does not close it.
- Clicking outside the panel closes it.
- Pressing Esc with the panel open closes it.
- Two `WhyPopover` instances open back-to-back close the first before opening the second (default browser focus behavior is fine).
- Panel renders without overflowing the modal when triggered near the right edge (right-align is enough; no need for auto-flip in prototype).

**Verification:**
- Component renders in isolation when dropped into any wizard step.
- No console warnings about leaked event listeners on rapid open/close.

---

- [ ] **Unit 3: Wire inline "Why?" affordances across Steps 2 / 4 / 5**

**Goal:** Place `WhyPopover` triggers at every AI-driven decision point in the wizard with per-context copy. (R1.)

**Requirements:** R1

**Dependencies:** Unit 2

**Files:**
- Modify: `prototypes/h2/meta-campaign/steps/Step2Inspiration.tsx`
- Modify: `prototypes/h2/meta-campaign/steps/Step4Creative.tsx`
- Modify: `prototypes/h2/meta-campaign/steps/Step5Review.tsx`

**Approach:**
- **Step 2 (Inspiration):** ✨ trigger next to the "Your slate · N" header → popover explains why Blaze chose this mix ("3 sources, weighted toward proven performers because…"). Additionally, a smaller ✨ on each slate card → popover explains why that specific card was picked.
- **Step 4 (Creative):** ✨ in each `AdVariantCard` provenance bar → popover explains why this variant was generated ("This concept was adapted from the Five Star competitor reel because its scroll-stop rate matched the campaign topic best.").
- **Step 5 (Targeting):** ✨ next to the "Targeting" section header → popover explains audience defaults. Smaller ✨ next to the Weekly-spend field → popover explains budget recommendation.
- Inline copy lives at each call site — no central registry yet.

**Patterns to follow:**
- The existing per-row icon-button pattern in `AiGeneratedList`'s `PlainIconButton` for the ✨ trigger button styling.

**Test scenarios** *(manual)*:
- Each wizard step shows the new ✨ icons at the documented positions.
- Clicking each opens a popover with on-context copy that mentions specifics from the current `draft` (e.g. mentions the actual campaign topic, not generic text).
- Popovers don't crowd existing labels or break the section-header layout at typical viewport widths.
- Closing one popover and opening another within the same step transitions cleanly.

**Verification:**
- A reviewer can answer "why did Blaze pick this?" for any visible AI decision in ≤3 seconds (one click + one read) — matches the origin doc success criterion.

---

- [ ] **Unit 4: `PreflightChecklist` component**

**Goal:** Render the result of `runPreflight()` as a compact card with traffic-light statuses, 1-click fixes for ambers, and visible blockers for reds. Writes `launchBlocked` to context whenever any red is present.

**Requirements:** R4

**Dependencies:** Unit 1

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/PreflightChecklist.tsx`

**Approach:**
- Card with a header ("Pre-launch checks") and a list of `PreflightCheck` items.
- Each item: status dot (green ✓ / amber ⚠ / red ✕) + label + optional 1-click fix button on the right ("Title-case all-caps headline", "Set destination", etc.) that dispatches the check's `fix()` patch via the context's `setDraft` or per-ad `updateGeneratedAd`.
- Greens are muted (light grey text + small ✓); ambers are highlighted (orange) with the fix button prominent; reds are highlighted (red) with no fix button — the user is expected to scroll up to the relevant field, or 1-click fixes target the underlying field directly when feasible.
- Synchronizes `launchBlocked` on every render via `useEffect` — if any item's status === 'red', `setLaunchBlocked(true)`; otherwise `setLaunchBlocked(false)`.
- Counts visible at the top: "5 ready · 1 needs attention".

**Patterns to follow:**
- `StatusPill` from `@/staging` for the status dots if it composes cleanly; otherwise a simple inline span with the dot.
- `Field` helpers in `Step5Review.tsx` for the section-card framing.

**Test scenarios** *(manual)*:
- Default Blaze draft (clean state) → all greens, `launchBlocked === false`.
- Manually clear `draft.websiteUrl` → "Destination URL set" turns red, `launchBlocked === true`, Launch button disables.
- Re-enter a URL → check flips green, button re-enables.
- Open Step 4, type an all-caps headline on one variant → return to Step 5; "All ads avoid all-caps" turns amber with a "Title-case" fix button; clicking it mutates the variant copy.

**Verification:**
- The Launch button visibly disables when a red is present.
- All ambers have a working 1-click fix.

---

- [ ] **Unit 5: `CampaignSummary` component**

**Goal:** Render the plain-English 2–3 sentence paragraph above the Launch button. Uses `campaignSummary()` from Unit 1.

**Requirements:** R2

**Dependencies:** Unit 1

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/CampaignSummary.tsx`

**Approach:**
- Small card with a `✨` icon prefix and the paragraph rendered as a single `<p>`.
- Subtle purple-tinted background to identify it as an AI-generated brief.
- Re-renders when `draft` / `generatedAds` / safety-net defaults change so the paragraph stays in sync as the user edits in the same step.

**Patterns to follow:**
- AI note card style from `Step1Goal.tsx` `AiNote` helper — already establishes the purple-tinted "Blaze is talking" treatment.

**Test scenarios** *(manual)*:
- Default draft → paragraph reads naturally, mentions ad count, source breakdown, audience tag, weekly spend, and one post-launch behavior.
- Mutate `draft.dailyBudget` from $90 to $150 → paragraph updates to reflect the new weekly figure.
- Toggle off all ads → paragraph either shows a stub ("No ads selected") or the component hides itself (decide during implementation; lean toward stub since the checklist already flags red).

**Verification:**
- The paragraph is quotable verbatim to a CMO — no broken templates, no template literals leaking through.

---

- [ ] **Unit 6: `SimilarToCard` component**

**Goal:** Render the closest historical campaign found by `findSimilarCampaign()`, with recap metrics and a similarity/difference narrative. Fallback state when no match.

**Requirements:** R3

**Dependencies:** Unit 1

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/SimilarToCard.tsx`

**Approach:**
- Card layout: heading "Most similar past campaign", campaign name + status pill, KPI row (CTR, CPR, ROAS or results — whichever the seed campaign has), 1–2 sentence narrative listing the matching dimensions and the meaningful differences.
- Fallback when `findSimilarCampaign` returns `null`: "No close historical match — this is new territory for your account. Category benchmarks: ~$78 per lead, ~3.4% CTR." Slightly different visual (neutral grey instead of confident green).
- Reads `createdCampaigns` from context and `CAMPAIGNS` from `PaidSocial.tsx` (already exported); merges them and passes to the helper.

**Patterns to follow:**
- `KpiTile` in `PaidSocialDetail.tsx` for the metric cell shape.
- `StatusChip` in `PaidSocial.tsx` for the status pill (already exported).

**Test scenarios** *(manual)*:
- Default draft (Spring Exterior — Competitor Playbook) → matches `spring-exterior` seed campaign with high score; card shows its KPIs and a sentence like *"Matches on objective (Lead generation) and creative mix (3 ads, 2 reels + 1 static). Differs in budget tier ($90/day vs $120/day)."*
- Change `draft.objective` to `awareness` and `draft.dailyBudget` to $300 → match score drops below threshold → fallback card renders.
- New ad campaign with a unique topic (e.g., user re-enters with edited draft) → either still matches a seed or falls back gracefully.

**Verification:**
- The card never crashes when the pool is empty or when the draft is in an unusual state.
- Reviewer can read the narrative and immediately understand why this comparison is informative.

---

- [ ] **Unit 7: `SafetyNetEditor` component**

**Goal:** Expandable card with three rules (`pauseCprAbove`, `capWeeklySpend`, `alertCtrBelow`) showing computed defaults, each with a `Toggle` and a small inline threshold editor.

**Requirements:** R5 (launch-time setup)

**Dependencies:** Unit 1

**Files:**
- Create: `prototypes/h2/meta-campaign/confidence/SafetyNetEditor.tsx`

**Approach:**
- Card header: "Safety net" + a subtitle ("Blaze will watch these in flight"). Collapsed by default with a quick summary ("3 rules active · auto-pause, weekly cap, CTR alert") and a "Customize" affordance to expand.
- Expanded body: three rows, each with a `Toggle` (on/off), a sentence describing the rule with the threshold value inline-editable (number input for `pauseCprAbove` and `capWeeklySpend`, number-with-percent for `alertCtrBelow`).
- Receives `value: SafetyNetConfig` and `onChange: (next) => void` as props; the parent (`Step5Review`) keeps a local `useState<SafetyNetConfig>` initialized from `defaultSafetyNetForDraft(draft, history)` on first mount.
- The same component is reused in compact mode on the detail page (Unit 8) via a `compact` prop that swaps the heading + collapse behavior.

**Patterns to follow:**
- `Field` + `inputStyle` helpers in `Step5Review.tsx` for the threshold inputs.
- `Toggle` from `@/staging` for the per-rule on/off.
- Expand/collapse pattern from `AddAdsModal.tsx` (the shared-copy section appears only after selections).

**Test scenarios** *(manual)*:
- Default draft → component shows three default thresholds (1.4× historical CPR, $756 weekly cap, 1.5% CTR floor).
- Toggle off `pauseCprAbove` → summary updates to "2 rules active".
- Edit `capWeeklySpend` to $500 → state updates immediately.
- Mutate `draft.dailyBudget` → defaults DO NOT recompute mid-flow (sticky initial value), but a small "Reset to suggested" link offers to refresh.

**Verification:**
- All three rules persist their state across re-renders of Step 5.
- Compact mode used by Unit 8 lays out cleanly on the detail page.

---

- [ ] **Unit 8: Compose confidence layer into Step5Review + Launch gating + persist on finish()**

**Goal:** Assemble Units 4–7 into `Step5Review`, gate the Launch button via `launchBlocked` from context, and persist the user's `SafetyNetConfig` into context on launch.

**Requirements:** R2, R3, R4, R5

**Dependencies:** Units 1, 4, 5, 6, 7

**Files:**
- Modify: `prototypes/h2/meta-campaign/steps/Step5Review.tsx`
- Modify: `prototypes/h2/meta-campaign/MetaCampaignModal.tsx`
- Modify: `prototypes/h2/meta-campaign/meta-campaign-context.tsx` (extend `finish()` to also call `setSafetyNet(newCampaign.id, finalSafetyNet)`)

**Approach:**
- In `Step5Review`, after the existing Spend & payment section, render in order: `<CampaignSummary>`, `<SimilarToCard>`, `<PreflightChecklist>`, `<SafetyNetEditor>`.
- `Step5Review` owns a `useState<SafetyNetConfig>` initialized from `defaultSafetyNetForDraft(draft, history)`. It passes the current `SafetyNetConfig` into `<CampaignSummary>` (so the paragraph can mention "Blaze will pause underperformers") and into the wizard's `finish()` handler via a context setter — add `pendingSafetyNet: SafetyNetConfig | null` + `setPendingSafetyNet` to context, or pass it through `finish()` as an argument. Prefer the latter — simpler.
- Modify `finish()` in context to accept an optional `SafetyNetConfig` argument. When the new campaign id is generated, also persist via `setSafetyNet(newCampaign.id, config)`.
- `MetaCampaignModal` footer: read `launchBlocked` from context; set the primary button's `isDisabled = launchBlocked` when step === 5. Update the click handler to pass the current `SafetyNetConfig` from Step5 into `finish()`. To avoid prop-drilling, lift the editor state into context (`pendingSafetyNet`), or use a callback-ref pattern.

**Patterns to follow:**
- `Step5Review.tsx` `SectionCard` / `SectionHeading` framing for the new components.
- `MetaCampaignModal.tsx` existing Launch button gating pattern (`isDisabled={continueDisabled}`).

**Test scenarios** *(manual)*:
- Open wizard → walk to Step 5 → the four new components render in order below the existing sections.
- All checks green → Launch button enabled.
- Edit a safety rule → click Launch → toast confirms; navigate to the new campaign's detail page; safety rules card (Unit 9) reflects the edited values.
- Clear `websiteUrl` → red checklist item → Launch button disables.
- Hit Back from Step 5 to Step 4 and return → safety net state preserved (does not reset).

**Verification:**
- End-to-end launch creates a campaign with a `safetyNetByCampaign` entry matching the user's choices.
- Detail page reads back the safety net.

---

- [ ] **Unit 9: `SafetyNetCard` on the campaign detail page**

**Goal:** Surface the active safety net on `PaidSocialDetail`. Reuses `SafetyNetEditor` in compact mode for inline editing.

**Requirements:** R5 (post-launch editing)

**Dependencies:** Unit 7, Unit 8

**Files:**
- Modify: `prototypes/h2/pages/PaidSocialDetail.tsx`

**Approach:**
- New section card placed near "Audience & targeting" (or below "Creative health · X ads need attention"). Heading: "Safety net · N rules active" (where N counts enabled rules).
- Default state: collapsed summary view — three short bullets listing each rule's current threshold and on/off state.
- "Customize" button expands into inline edit mode via `<SafetyNetEditor compact value={config} onChange={(next) => setSafetyNet(campaign.id, next)} />`.
- Reads `getSafetyNet(campaign.id)` — if missing, computes `defaultSafetyNetForDraft` from the campaign's current state (so seed campaigns with no prior entry still render a sensible default that the user can edit and save).
- Updates persist via the existing context `setSafetyNet` action — no new actions required.

**Patterns to follow:**
- `SectionCard` + `SectionHeading` shape from `PaidSocialDetail.tsx` itself (`TargetingCard`, `BlazeRecommendations`).

**Test scenarios** *(manual)*:
- Launch a campaign from the wizard with default safety net → navigate to detail page → "Safety net · 3 rules active" card visible.
- Click Customize → editor expands → toggle off `alertCtrBelow` → save → summary updates to "2 rules active".
- Navigate to a seed campaign (e.g. `cabinet-1`) that was never launched through the wizard → card renders default values; editing them and saving persists across navigations.
- Refresh the page (state resets — prototype scope) → defaults render again, which is acceptable per prototype.

**Verification:**
- The detail page surfaces the safety net clearly and inline edits write back through context.

## System-Wide Impact

- **Interaction graph:** Most of the work is local to `meta-campaign/confidence/` plus wizard steps and `PaidSocialDetail`. Two cross-cutting context additions (`safetyNetByCampaign`, `launchBlocked`) — both follow the existing `addedAdsByCampaign` pattern and are additive, not mutating, to consumers.
- **Error propagation:** Pure helpers (`runPreflight`, `findSimilarCampaign`, `campaignSummary`, `defaultSafetyNetForDraft`) handle empty/degenerate inputs by returning sensible defaults or `null` rather than throwing. No async paths.
- **State lifecycle risks:** `safetyNetByCampaign` could accumulate stale entries if campaigns are ever removed — out of scope today; document as a follow-up. `launchBlocked` must be reset when the wizard closes/restarts so a stale red doesn't poison a fresh draft — handled in `start()` (`setLaunchBlocked(false)`) and on Step5 unmount as a safety belt.
- **API surface parity:** `AddAdsModal` (the in-campaign add-ads flow) does *not* need a confidence layer in this iteration — it's a smaller-stakes operation, and adding the full surface there would balloon the modal. Document as a deferred symmetry concern.
- **Integration coverage:** Manual end-to-end verification through the wizard from Step 1 through launch into detail page is the integration test. No automated tests per repo policy.

## Risks & Dependencies

- **R3 heuristic noise:** With only ~5 seed campaigns + zero-to-few session campaigns, the "closest match" can degenerate (always matches the same seed). Mitigation: include the score in the rendered narrative ("strong match" vs "loose match") so the user can recalibrate.
- **R4 amber fixes that mutate per-ad copy:** Title-casing all-caps headlines is a destructive edit. Mitigation: confirm via a toast ("Headline updated — undo?") with a 5-second Undo button, OR more simply, only apply title-case to headlines that are wholly uppercase (not mixed). Implement the simpler path first.
- **Launch button gating via context flag:** A race condition risk if `PreflightChecklist` writes `launchBlocked` in a `useEffect` after the user has already clicked Launch. Mitigation: `MetaCampaignModal`'s click handler re-runs the same `runPreflight()` synchronously and short-circuits the launch if any red appears — belt and braces.
- **Safety-net rule editing on the detail page might confuse users** if rules can be edited but never actually fire (since the prototype doesn't enforce them). Mitigation: add a quiet "Prototype: Blaze would monitor these in production" footnote on the card.

## Documentation / Operational Notes

- No production docs or runbooks affected — this is a prototype.
- No design-system or vetted-lib changes — all new components live under `prototypes/h2/meta-campaign/confidence/`.
- Suggest a follow-up README or comment header in `confidence/` summarizing the layer's purpose for the next designer/PM who explores the prototype.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-06-03-prelaunch-confidence-layer-requirements.md](../brainstorms/2026-06-03-prelaunch-confidence-layer-requirements.md)
- Related code:
  - `prototypes/h2/meta-campaign/meta-campaign-context.tsx` (state container + `addedAdsByCampaign` precedent)
  - `prototypes/h2/meta-campaign/MetaCampaignModal.tsx` (wizard shell + Launch button)
  - `prototypes/h2/meta-campaign/steps/Step5Review.tsx` (target step for composition)
  - `prototypes/h2/pages/PaidSocial.tsx` (seed `CAMPAIGNS` with metrics, exported `Ad`/`Campaign` types)
  - `prototypes/h2/pages/PaidSocialDetail.tsx` (`TimeRangeSelect` ref-popover pattern, `SectionCard` shape, target for Unit 9)
  - `prototypes/h2/meta-campaign/AiGeneratedList.tsx` (`FormatDropdown` styling pattern)
- Related PRs/issues: none yet.
- External docs: skipped — strong local patterns made external research unnecessary.
