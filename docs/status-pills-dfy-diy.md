# Status pills: DFY vs DIY

Reference for the approval status-pill system introduced in
[PR #74 — feat(prototype/h2): add DIY/DFY audience mode to Approvals](https://github.com/almanaclabs/blaze-design/pull/74)
(branch `prototype/approvals-diy-dfy`).

Source of truth: [`prototypes/h2/pages/ApprovalsV2.tsx`](../prototypes/h2/pages/ApprovalsV2.tsx),
plus the shared contexts
[`approval-audience-context.tsx`](../prototypes/h2/approval-audience-context.tsx) and
[`approval-settings-context.tsx`](../prototypes/h2/approval-settings-context.tsx).

---

## Business context

Blaze ships the same Approvals surface to two very different audiences. The
audience is selected in the dev panel (`useApprovalAudience()` → `'dfy' | 'diy'`)
and changes both the mental model and the pills/CTAs on screen.

- **DFY ("done for you" — agency / managed).** An agency manages content on
  behalf of a client. There is a **two-step pipeline**: the agency team (staff /
  account manager) reviews internally, then hands content to the **client** for
  sign-off. DFY therefore has two viewer modes within one audience:
  - **Internal (staff)** — the default. Sees the internal pipeline.
  - **Client** — entered via the **"View as client"** toggle. Sees only what the
    staff marked ready, exactly as the client would.
- **DIY ("do it yourself" — self-serve customer).** The customer runs their own
  marketing. There is **no agency, no internal pipeline, and no staff/client
  split** — the customer is simultaneously the owner and the approver. The whole
  surface collapses to a single self-review view.

Because of this, the codebase derives the active view as:

```ts
const isDiy = audience === 'diy';
const tab = isDiy ? 'client' : (clientView ? 'client' : 'internal');
```

DIY reuses the "client" rendering path but strips the agency-only affordances
(View-as-client, Send-to-Client, internal-pipeline pills).

Two pill components implement everything:

| Component | Drives | Lives where |
|---|---|---|
| `StatusPill` | content lifecycle states (`pending`/`approved`/`rejected`/`declined`/`draft` + `isPast`/`postedWhenApproved`) | client + DIY views, past campaigns, review-page top bar |
| `InternalStatusPill` | DFY internal pipeline (`internalReview`/`readyForClient`/`inClientReview`) | DFY internal view only |

A separate **derived display string** (`getDisplayStatus`) exists purely to power
the **filter facets** — it is not what the pill renders. The pill renders from the
raw `Status` + flags; the filter maps those to facet values.

---

## Status matrix (DFY vs DIY)

### Pill labels and colors

| Pill label | Color (token / hex) | Raw condition | DFY | DIY |
|---|---|---|---|---|
| **Internal Review** | purple `#6a00ff` | `internalStatus = internalReview` | ✅ staff only | ❌ (no pipeline) |
| **Ready for Client** | blue `#0179cf` | `internalStatus = readyForClient`, not yet sent | ✅ staff only | ❌ |
| **In client review** | green `var(--status-approved)` family | sent to client (`sentPosts[id]`) | ✅ staff only | ❌ |
| **Review** | amber `#7a4800` | `pending` (not past) | ✅ client view | ✅ |
| **Revised** | blue `#0179cf` (`--status-posting`) | `pending` + a resubmit note exists (covers 2nd, 3rd, … submissions) | ✅ client view (after staff resubmits a returned item) | ❌ (no resubmit loop) |
| **Approved** | green `#20a14f` | `approved` (not past) | ✅ client view | ✅ |
| **Changes Requested** | red `#ae2222` | `rejected` | ✅ both | ❌ (DIY uses Draft instead) |
| **Declined** | red `#ae2222` | `declined` | ✅ both | ❌ |
| **Draft** | grey `#757c8a` (`--status-draft`) | `draft` | ⚠️ not reachable | ✅ ("Don't Post" → Draft) |
| **Posted** | purple `#7f24b7` (`--status-posted`) | `approved` **and** (`isPast` **or** `postedWhenApproved`) | ✅ past campaigns | ✅ past campaigns **+ reputation replies** |
| **Failed** | grey `var(--dark-60)` | `pending` **and** `isPast` | ✅ past campaigns | ✅ past campaigns |

### Lifecycle by audience

| Stage | DFY | DIY |
|---|---|---|
| Just generated | `Internal Review` (staff) | `Review` |
| Staff marks ready | `Ready for Client` (staff) → client sees `Review` | n/a |
| Sent to client | `In client review` (staff) | n/a |
| Approved | `Approved` (client) | `Approved` (or `Posted` for reputation replies) |
| Rejected with feedback | `Changes Requested` → returns to staff | n/a — DIY has no feedback loop |
| Declined | `Declined` → returns to staff | n/a |
| Held back | n/a | `Draft` (via "Don't Post", undoable) |
| Past, succeeded | `Posted` | `Posted` |
| Past, never approved | `Failed` | `Failed` |

### Status-filter facets (header filter menu)

| DFY — internal | DFY — client view | DIY |
|---|---|---|
| All | All | All |
| Internal review | Review (`inClientReview`) | Review |
| In client review | Changes requested | Draft |
| Returned by Client¹ | Declined | Approved |
| Approved | Approved | Posted |
| Posted | Posted | Failed |
| Failed | Failed | |

¹ "Returned by Client" is a **meta-facet** matching both `changesRequested` and
`declined`. It is also what drives the red attention dot on the filter icon in
DFY internal view.

---

## Per-surface behavior

### 1. List content cards (`InternalCard` / `ContentCard` → `ReputationCard`, `PaidSearchCard`, `LocalSEOCard`)

| | DFY internal (staff) | DFY client view | DIY |
|---|---|---|---|
| Pill (bottom-left) | `InternalStatusPill` — Internal Review / Ready for Client / In client review; returned cards show `Changes Requested`/`Declined`; client-approved show `Approved` | `StatusPill` (`viewerMode="client"`) | `StatusPill`; reputation posted → `Posted` (purple) |
| Per-card control | **Checkbox** (top-right): checked = included in client send → `Ready for Client`; unchecked → `Internal Review`. Hidden once sent (dims to 40%). | Hover **Approve** / **Remove approval** + **Review/Edit** | Hover **Approve** (standard) / **Post Reply** (reputation) / **Remove approval** + **Review/Edit** |
| Hover CTA | **Review** (standard), **Edit** (reputation / paid search) | Review / Edit | Review / Edit |

### 2. Campaign section header (bulk CTAs)

| | DFY internal | DFY client | DIY |
|---|---|---|---|
| Bulk action | **Send to Client** — opens `SendToClientModal` (editable cover note); hidden once every checked creative is sent | **Approve All** | **Approve All**; **Post All** for reputation campaigns |
| Approved group divider | n/a | "Approved (N)" (green) | "Approved (N)" green; **"Posted (N)" purple** for reputation |

### 3. Full-screen review page (`ReviewPage`)

**Top-bar pill**

- DFY internal: `InternalStatusPill` (`inClientReview` if sent, else `internalStatus`); past / returned / client-approved fall back to `StatusPill`.
- DFY client + DIY: `StatusPill` with `viewerMode="client"`.

**Center CTAs**

| State | DFY internal | DFY client | DIY |
|---|---|---|---|
| Fresh / ready | **Ready for Client** (green) → marks ready | **Approve** (green) | **Don't Post** + **Approve** |
| Already ready, not sent | **Undo** | — | — |
| Sent (in client review) | _no CTA_ (cannot pull back) | — | — |
| Returned | _no CTA_ (staff resubmits) | _no CTA_ | — |
| Approved | — | **Remove approval** | **Remove approval** |
| Draft (DIY only) | — | — | **Approve & Schedule** |

**"Don't Post" behavior differs by audience:**

- **DFY** → opens the **feedback modal** (`DontPostModal`); choosing _request
  changes_ sets `rejected` → `Changes Requested`, _decline_ sets `declined` →
  `Declined`. Both return the item to staff and close the review.
- **DIY** → **no modal**. Drafts the post in place (`draft` → `Draft` pill),
  flips the CTA to **Approve & Schedule**, the right-panel "Posting on" to
  "Schedule Post", and surfaces an **undoable "Post moved to drafts" toast**.

**Reputation in DIY** → "Edit" opens the shared **`EditAIDraftModal`** (same as
DFY) rather than the full review page. Reputation cards with no AI-generated
reply are removed from both audiences.

**Feedback thread (DFY).** The right-panel conversation is a **single per-post
message log owned by the parent** (`threads: Record<number, CommentMsg[]>` in
`ApprovalV2Inner`), shared by staff and client — not rebuilt per `ReviewPage`
mount. Each action appends one ordered, timestamped entry:

| Action | Appends |
|---|---|
| Client requests changes | `client` message (status → `rejected` / `Changes Requested`) |
| Client declines | `client` message (status → `declined` / `Declined`) |
| Staff resubmits | `staff` note (if typed) **+** a `system` line "Revised version submitted to client" (status → `pending`, stays `readyForClient`/sent → client sees **Revised**) |

Because the log is shared and append-only, **repeat change requests** (a client's
2nd, 3rd, … round) show as distinct messages in correct order for **both** staff
and client. This replaced the earlier model that derived the thread from
aggregate fields (`dontPostReasons.join('\n')` → one merged bubble + a single
`resubmitNotes` string), which dropped/mis-ordered later rounds on the staff
side. `dontPostReasons` / `resubmitNotes` are still kept for the pill tooltip and
the `Revised` pill condition, but are no longer the conversation source.

### 4. Approval Settings modal (`ApprovalSettingsModal`)

Per-content-type rows show a mini-pill reflecting whether that type needs
sign-off. Labels are audience-specific:

| | requires approval | auto | 
|---|---|---|
| DFY | **Client approval required** (green) | **Agent review only** (grey) |
| DIY | **Approval required** (green) | **Auto-publishes** (grey) |

This modal is the **single source of truth** (`ApprovalSettingsProvider`): the
master toggle + per-feature flags live in context, not local state.

### 5. SEO/AEO "Blog post settings" → Publishing row

A **read-only mirror** of the `seo-blogs` flag from Approval Settings (no
duplicate control here):

- `featureRequiresApproval('seo-blogs') === true` → green **"Approval required"** + "Posts require your sign-off before going live."
- else → grey **"Auto-publishes"** + "Posts publish automatically on their scheduled date."

A right-aligned secondary button **"Manage in Approval Settings →"** routes to
`/h2/approvals`, where the one control lives.

---

## Open questions

1. **`Draft` in DFY.** The grey Draft pill is only reachable in DIY ("Don't
   Post"). In DFY, "Don't Post" routes to Changes Requested / Declined. Is a DFY
   draft state ever needed, or is Draft strictly a DIY concept?
2. **`Revised` pill — verified working.** Confirmed end-to-end: client requests
   changes (→ `Changes Requested`) → staff opens the returned item and
   "Resubmit to client" → `resubmitPost` sets `pending` + records the note while
   keeping `readyForClient`/sent → the client sees the item again as **Revised**.
   No open issue; left here only to note the label is intentionally reusable for
   the 2nd, 3rd, … round (it does not version-number). The resubmit composer's
   thread system line was likewise made round-agnostic ("Revised version
   submitted to client").
3. **Two greens.** `Approved`, `In client review`, and the Approval-Settings
   "approval required" pill all read as green; `Posted` and `Internal Review`
   are both purple-ish (`#7f24b7` vs `#6a00ff`). Worth confirming these are
   distinguishable enough, especially Posted vs Internal Review.
4. **Reputation "Posted" semantics.** DIY reputation uses `Posted` (purple) for a
   sent AI reply via `postedWhenApproved`, reusing the past-campaign "Posted"
   treatment. Should a *live* posted reply read differently from a *past*
   posted social creative?
5. **State persistence.** The shared approval-settings + per-post state is
   in-memory and resets on a hard browser reload (prototype behavior). Does the
   real product need the SEO/AEO ↔ Approval Settings mirror to survive reloads,
   or is session-scoped acceptable for the prototype?
6. **DIY "Failed".** DIY past `pending` → `Failed`, but DIY has no review queue
   that would leave something un-acted-on the way DFY does. Confirm what
   produces a DIY "Failed" in practice (publish failure vs. never-approved).
