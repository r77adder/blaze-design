# Component gaps for scorecard

Components this prototype needs that the lib doesn't support yet.
Built inline for now — surface to eng when ready to standardize.

---

- **Input** — standard text input field. Used in the scorecard input form (URL, business name, social handles). Currently built inline. Needs: controlled/uncontrolled modes, focus ring matching Blaze style, error state, placeholder styling. Candidate for `src/staging/Input/`.

- **ScoreGauge** — large circular SVG progress ring with score number + label in center. Used in the results sidebar for the overall marketing health score. Built as `GaugeRing.tsx` inline. Needs standardisation of size variants (large = 132px, mini = 36–44px), color-by-status logic, grade label below. Candidate for `src/staging/ScoreGauge/`.

- **SearchRankingRow** — search query row showing a platform icon (Google G), query text, and placement chips (map pack, organic, paid) in a tabular layout. Used in the "showing up online" card. Current inline implementation uses a 4-column CSS grid. Candidate for `src/staging/SearchRankingRow/`.

- **CheckRow** — pass/warn/fail audit row with a colored status icon circle (✓/!/✕), check title, point score tag, and description. Used in every area card section. Candidate for `src/staging/CheckRow/`.

- **AreaSectionHeader** — numbered dark-circle badge + section title + platform pills + mini score ring badge. The header row for each audit pillar. Candidate for `src/staging/AreaSectionHeader/`.
