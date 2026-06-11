---
date: 2026-06-03
topic: prelaunch-confidence-layer
---

# Pre-launch Confidence Layer

## Problem Frame

**Persona:** In-house marketer at a small/mid business (some ad experience, not an expert). They use Blaze because they don't want to build campaigns from scratch in Ads Manager, but they keep visible control over copy, audience, and budget.

**Anxiety they bring to the Launch screen:** *"Am I about to spend $2,700 on something I can't defend to my boss?"*

The current 5-step wizard does a lot for them (drafts the topic, picks creative across four sources, suggests audience, sets a recommended budget), but the *why* behind each AI choice is invisible. The Launch screen reads like a config receipt, not a brief. There's no anchor to past performance, no safety net, no holistic plain-English summary. A confident marketer reads the launch screen and feels they could explain the whole campaign in two sentences. Today they can't.

**Why now:** We just built the wizard. The Launch screen is the highest-stakes moment in the flow and currently the thinnest in terms of trust signals. Adding a confidence layer here returns more per square inch than any other change. It also differentiates Blaze from competitors that lean on fabricated CTR/ROAS forecasts — we ground confidence in legibility and history, not predictions.

## Requirements

- **R1. Inline "Why?" affordances on AI-driven decisions.** Every AI-authored moment in Steps 2 (Inspiration slate), 4 (Per-ad creative), and 5 (Targeting + Budget) carries a small ✨ icon. Clicking it reveals a 1–3 sentence plain-English explanation of why Blaze made that pick. At minimum: slate composition, audience defaults, daily-budget recommendation, and per-ad creative pairings (e.g., "this ad was adapted from your Five Star competitor reel because…").
- **R2. Plain-English campaign summary above the Launch button.** A 2–3 sentence paragraph synthesizing the campaign — objective + creative slate composition + audience + budget + what Blaze will do post-launch. Reads like a brief, not a config. Generated from the current draft state.
- **R3. "Similar to" historical-campaign callout in Step 5.** One reference to the user's closest past campaign on the Launch screen: name, recap metrics (e.g., *"Spring 2024 Exterior Push · 3.4x ROAS · 38 leads at $74 CPL"*), and 1–2 sentences naming the key similarities and differences vs. the campaign being launched. Prototype-level heuristic match (objective + audience overlap + format mix) — no ML.
- **R4. Pre-launch checklist with traffic lights and 1-click fixes.** Compact card above Launch listing 5–8 setup checks (Pixel connected, audience size in range, budget meets Meta minimum, all ads have headline + CTA, brand-safety pass, etc.). Greens silent or muted. Ambers have a 1-click fix that mutates the relevant draft field. Reds block the Launch button until resolved.
- **R5. "Set safety net" guardrails section.** Expandable card on the Launch screen with three pre-filled rules: *Auto-pause if CPR > $X for N days* (default `1.4× historical CPR`), *Cap weekly spend at $Y* (default `1.2× target weekly spend`), *Alert me if CTR < Z%* (default `1.5%`). User can toggle each rule on/off and edit thresholds. State is persisted on the launched campaign so the detail page can reflect/edit later (see R3 outstanding question).

## Success Criteria

- A user can answer *"why did Blaze pick this?"* for any visible AI decision in ≤3 seconds (one click + one read).
- The Launch screen contains everything needed to confidently confirm the campaign — no need to scroll, open a side panel, or re-read prior wizard steps to feel ready.
- A test marketer asked to launch a campaign blind (without us coaching) describes the experience as *"I knew exactly what was about to happen"* — not *"I hit go and hoped"*.
- 100% of green-state checklist items pass automatically on a Blaze-drafted campaign with no manual edits. Ambers always have a 1-click fix. Reds only trigger when the campaign would actually fail to ship (e.g., missing destination URL).
- The plain-English summary reads naturally — a marketer could quote it verbatim to a CMO without paraphrasing.

## Scope Boundaries

- **Not** building an ML-trained "similar to" matcher — prototype uses simple heuristic matching against `createdCampaigns` + seed campaigns.
- **Not** implementing real auto-pause server logic — safety-net rules are a UI affordance that persist on the campaign object. Visualization of "Blaze is monitoring this rule" on the detail page is in scope; actual pausing behavior is simulated/mocked.
- **Not** Cluster D (first-3-days projection, post-launch digest) — deferred. These add value but require simulation models we don't want to invent.
- **Not** Cluster B2 (realistic range replacing point estimate on Step 1) — deferred. Step 1 stays as today; confidence layer concentrates on Step 5.
- **Not** Cluster C3 (creative brand-safety scan) — deferred unless it falls out trivially from R4's checklist.
- **Not** changing post-launch UI beyond reflecting safety-net rules on the detail page.
- **Not** addressing other personas (SMB-zero-experience / agency-multi-client) — different anxiety patterns, different solutions.

## Key Decisions

- **"Why?" is click-popover, not always-visible.** Always-visible explanations would clutter the wizard. On-demand legibility keeps the surface calm.
- **R3 references one closest campaign, not a top-3 list.** One known reference point beats three abstract comparisons; reduces cognitive load.
- **R3 match scope: seed CAMPAIGNS + this-session createdCampaigns**, weighted toward seed entries since they carry real historical metrics (CTR, ROAS, impressions). This-session campaigns join the pool but rarely win the match because they lack performance data.
- **R5 rules are editable post-launch.** Detail page surfaces a "Safety net · N rules active" card; the marketer can tighten/loosen thresholds, toggle rules on/off, and add new ones in flight. Launching is not a one-shot commit.
- **Safety-net defaults are computed from historical data, not generic ranges.** `1.4× historical CPR` is more honest than `$100`. If history is empty, fall back to category benchmarks already used elsewhere in the prototype.
- **Confidence is grounded in legibility + history + recoverability — not forecasts.** Deliberately not reintroducing a "predicted CTR" pill. We already removed that and the new direction is consistent.
- **All five requirements ship as one cohesive surface ("the confidence layer"), not five separate flags.** They reinforce each other; a partial ship would feel awkward.

## Dependencies / Assumptions

- The current MetaCampaign context already holds `createdCampaigns` and we have `CAMPAIGNS` seed data in `PaidSocial.tsx` with realistic past-campaign metrics (CTR, impressions, results, status). R3 can heuristically match against these.
- The wizard's draft state already includes objective, websiteUrl, budget, targeting, and per-ad copy — enough to author R2 (the plain-English summary) and R4 (the checklist) without new state plumbing.
- "Pixel connected" can be a static ✅ in the checklist (we explicitly skipped the Pixel step earlier; pretending it's connected is consistent with the prototype's existing stance).
- Audience size estimator (Narrow / Recommended / Broad) already exists and feeds R4.

## Outstanding Questions

### Deferred to Planning

- **[Affects R1][Technical]** Final copy templates for each "Why?" popover — drafted during planning against the actual draft-state fields we have.
- **[Affects R2][Technical]** Exact paragraph structure and template variables for the plain-English summary; needs to handle 0-source slates, all-AI slates, etc.
- **[Affects R3][Needs research]** Concrete heuristic for "closest campaign": which dimensions weight most (objective, format mix, audience size, budget tier, recency)? Investigate during planning against the seed data.
- **[Affects R4][Technical]** Full checklist item list — needs technical pass over the actual draft state to confirm what we can check today (e.g., do we know contrast ratios on overlay text? probably not — drop that item if unverifiable).
- **[Affects R5][Technical]** How safety-net rules are stored on the launched `Campaign` object; how the detail page surfaces "Blaze is watching N rules" cleanly.

## Alternatives Considered

- **Lean cut (A2 + C1 only) — rejected.** Ships the summary + checklist but no "Why?" affordances or "Similar to" anchor. Visible, but the campaign still feels like a config receipt rather than an explained brief.
- **Full set (A1–A2 + B1–B2 + C1–C3 + D1–D2) — deferred.** All eight features in one go is a multi-PR effort and the marginal gain past the recommended cut is smaller than the schedule cost. D1/D2 are good follow-ons.
- **B2 ("realistic range" on Step 1 budget) — deferred.** Worth doing eventually but pushes confidence work into Step 1 in addition to Step 5, fragmenting the surface. Keep the confidence layer concentrated on Launch in v1.
- **A pre-launch "AI chat" panel for natural-language Q&A — deferred.** Surfaced in competitive research (Madgicx). Useful but qualitatively different from "show your work" — it's an investigation tool, not a confidence tool. Belongs to a later iteration.

## Next Steps

→ `/ce:plan` for structured implementation planning.
