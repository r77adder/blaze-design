For design rationale, patterns, and component intent, read ios/DESIGN.md before generating iOS prototypes.
## Components
All reusable components live in `ios/components/`. Import via `@ios/components`. Add new components directly to `ios/components/` — do NOT use `ios/staging/`.

Available components:
- TabBar, TabBarItem — bottom navigation
- ToolbarHeader, ToolbarButton — top nav
- Sheet, SidebarDrawer — overlays
- TextField, Toggle, Radio, Stepper — form inputs
- SelectionPill, SegmentSelector — selectors
- Toast, FooterCTA — feedback & actions
- GlassIconButton, MenuItem, ContentAreaButton — buttons
- CampaignListItem, ContentStatusPill, ContentCard — list items & cards

## Icons
Icons are in `ios/icons/`. Use existing SVGs only.