# Implementation plan: Design system migration

Status: Implemented; hosted integration pending
Spec: [spec.md](spec.md)

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Material/CDK 21.1.0, Ngx design system 21.0.1, Module Federation 20.0.0
**Storage**: Existing singleton store, service-owned records, broker and browser overrides
**Project Type**: Host-mounted Angular admin remote

## Design and requirement mapping

- FR-001: Install exact 21.0.1 with Node 22/npm 10; add a strict singleton in webpack; use `NgxPanel`, `NgxButton` and `NgxStatus` across catalog/configuration. Replace owned rounded surfaces and hardcoded success colors with semantic tokens.
- FR-001/004: Shell supplies public Ngx tokens and shared button/code CSS, plus Material adapter scopes `ngx-design-system` and `ngx-design-system-overlay`. Apply the workspace class to the routed page and panel classes to dialogs/selects/tooltips. Standalone global styles load the public theme and the same scopes. Use public CDK backdrop hooks with Ngx overlay tokens.
- FR-002/005: Preserve page VM; distinguish filtered emptiness in the detail view; use minmax(0, 1fr) and a 900px single-column breakpoint, remove clipping of focus rings.
- FR-003/004: Keep normal Material controls/validation; apply Ngx buttons only to `MatButton` hosts. Style destructive/secondary actions with explicit tones. Keep icon buttons native Material.

## Constitution Check and contracts

No store/provider/HTTP/storage or federation export changes. Preserve default App, named Routes,
relative route and strict Angular versions. Match shell design-system version exactly. Remote's
own global stylesheet is only a standalone fallback; hosted mode must use shell-provided global CSS.
No new private Material DOM selectors. Replace the inherited checked-toggle selector with owned
state classes while touching the capability layout.

## Delivery and verification

The shell is committed/pushed first as requested. Remote remains a local migration pending review.
Run `check:layout`, existing/new ChromeHeadless tests, clean npm 10 install and production build
with license extraction. Inspect a temporary fixture-backed UI at desktop/mobile sizes, including
search, type transitions, disabled actions and dialog/select styling. Fixture checks cannot certify
live authentication, persistence or deployed host/remote compatibility. No live records changed.

## Mission Control refinement

FR-006/007: Remove the catalog hero component and place the h1 in the existing sticky
action bar. Remove the 1440px width cap from the action bar and workspace; use
border-box sizing and 1rem gutters. Reduce workspace/detail spacing and empty-state
height, align the catalog rail below the compact bar, and use a form-container query
for two columns at 960px without squeezing dialogs or narrow screens.
Constitution Check: presentation only; MVVM, integration and keyboard controls retained.
Verify layout, the existing interaction suite, production build and resulting CSS.

## Rail containment and selected remote heading

FR-008: Measure the owned rail/body elements after rendering and subtract actual
panel chrome from remaining viewport height. ResizeObserver plus resize/scroll
listeners update the bound height; destroy cleanup removes observers/listeners.
Keep search/counts from shrinking and scroll long lists. Preserve the user's
182px sticky offset. Avoid assumptions about internal Material structure.
FR-009: Bind the panel heading to the persisted selected remote name. Heading-row
projection uses the authorized additive ngxPanelHeader slot. Project ID and
MfeRemoteCardHeader there and remove the separate detail context. Use wrapping
flex layouts for long IDs and metadata on narrow widths.
Constitution Check: no adapter, persistence, route, provider or private DOM changes.
