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

## Collapsible integration controls

FR-010: Import MatExpansionModule for capabilities; put the count in the header
and existing reactive controls in the body. Apply public Material expansion-overrides
on StructuralFields' host so both child accordions inherit the same theme in
standalone, dialogs and federated mode. Owned panel borders and flexible header
heights keep controls readable without targeting private Material DOM. Container
queries respond to actual form width. Constitution Check: form/store/contracts
and user edits preserved. Verify expansion, retained values, count, save and styles.

## Lifecycle actions and shell selects

Project card-owned lifecycle buttons via `[ngxMfeLifecycleActions]` into MfeForm's
Integration behavior section. An explicit false-default showLifecycleActions input
keeps lifecycle controls absent in create forms. Keep handlers, confirmation and
selected persisted DTO in the card; projected buttons have type=button. Move shared
public expansion overrides from StructuralFields to MfeForm to style all three
accordions. Render labelled shell-region selects over the existing form controls.
Constitution Check: no API, storage, provider or payload contract changes; preserve
user edits and native Material keyboard/focus handling. Verify payloads through
Material select harnesses and lifecycle interactions in real templates.

## Debounced autosave

FR-013: The form VM owns shared form creation and a valueChanges-only autosave
stream with a 500ms debounce, validity guard and projected-value deduplication.
MfeForm emits autosave for existing IDs; the card merges values with the selected
persisted record and retains the existing update output/store boundary. Remove
the manual save footer. Preserve edited same-ID form instances across catalog
refreshes, while replacing/cancelling streams on a different selected ID.
FR-014: The store exposes save notifications tied to update request responses and
a revision counter suppresses stale queued completions. Store-owned switchMap timer
clears successful notifications at 3000ms and cancels on later saves/destruction.
Keep failed payloads for retry through the serialized queue. The action bar reads
notifications with a persistent polite live region and a retry event.
Constitution Check: stateless adapters, scoped draft/debounce, root persistence
orchestration and ordered writes retained. No endpoint/storage/federation changes.
Omit archived from update projection; archive/unarchive remains lifecycle-owned.
Verify exact timing with Jasmine clocks, real component form events and HTTP doubles.

FR-015: Add opt-in headingMotion=stagger and headingMotionKey APIs to shared NgxPanel (which owns the title). Render grapheme spans with bounded delays and reduced-motion fallback. The card binds the persisted ID as its heading animation key. No per-letter pipe or private Material DOM styling required. Local verification uses a built shared package; release and align shell/remote published versions before deployment.

## Remote type closing flash — 2026-10-29

FR-016: The installed Material 21.1.0 exit animation fades opacity to zero without
retaining its final frame. A real-browser component test reproduces opacity returning
to one before animationend detaches the overlay for all three dismissal paths.
Add a unique public panelClass and animation-fill-mode: forwards. Its important flag
only overrides the fill reset in Material's animation shorthand. No private Material
selector, event override, DOM mutation or value binding workaround is needed.

Use ViewEncapsulation.None with BEM-scoped component rules: the portaled panel is
outside the host and federated mode does not load remote global styles. Scope the
existing host/form-field rules explicitly. Constitution Check: form, focus, keyboard,
MVVM, API and federation contracts remain intact. Test actual animations rather than
NoopAnimations, including the terminal frame, detachment, value and reopening.

## Structural placement closing flash — 2026-10-29

FR-017 extends the verified AC-016 fix to StructuralSubTypeOptions using its own
public BEM panelClass and component-loaded, scoped styles. Keep the child component
self-contained so the fix also works without StructuralFields. Constitution Check:
no value, form, keyboard, focus, persistence or federation contract changes. Verify
real animation terminal opacity, detachment, control value and visible reopening
for all three dismissal paths in an isolated child fixture.

## Shell override closing flashes — 2026-10-29

FR-018: Apply the AC-016/017 public panelClass/final-frame retention fix independently
in StructuralOverrides. Scope all component styles explicitly for unencapsulated
portal styling, including panel title and responsive description rules. Constitution
Check: preserve accordion, region values, form bindings, focus, API and federation
behavior. Isolated real-animation tests cover each region and dismissal method.
