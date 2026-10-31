# MFE orchestrator architecture

Reviewed 2026-10-07. Migration baseline: commit `9728861`.

## Responsibility and stack

The Angular administrator remote lists, searches, creates, edits, archives/unarchives, deletes, configures development overrides and previews MFE catalog entries. Angular/Material/CDK are 21.1.0, RxJS 7.8.2, TypeScript ~5.9.3 and published orchestrator contracts ^0.0.54. Module Federation and ngx-build-plus are 20.0.0; working compatibility must be verified rather than inferred.

The host provides shell composition and authentication context. `App` is a minimal router outlet with a default export. `Routes` is the named route export. `webpack.config.js` preserves the legacy `ngx-seed-mfe` name and `remoteEntry.js`, exposing `./Component` and `./Routes`; production config reuses it. The repository retains strict shared dependencies and their existing versions.

## Design system integration

The remote and admin shell install and share `@tmdjr/ngx-workshop-design-system`
21.0.4 as a strict singleton. The catalog route host has `ngx-design-system`.
The shell supplies semantic Ngx tokens, shared button/code styles and a scoped
Material adapter. Its legacy body palettes continue to style older remotes.
Standalone global styles include the public `theme()` mixin and matching adapter scopes.

The catalog opens with a compact full-width action bar containing its page heading and create
action, without a hero header. The workspace uses the available width with 1rem gutters.
Rail, form sections and configuration workspace use `NgxPanel`;
normal Material buttons use `NgxButton`; summary states use `NgxStatus`.
Icon buttons, forms, selects, switches, validation and dialog focus stay with Material.
Owned surfaces use public semantic tokens and responsive layouts stack at 900px.
Form sections sit side by side when their own container is at least 960px wide;
narrower workspaces and dialogs keep the sections stacked.
Multi-line field hints use public `subscriptSizing="dynamic"` to reserve enough space.

Dialogs use `ngx-design-system-overlay` on their pane and
`ngx-design-system-backdrop` for the public CDK backdrop hook. Select panels and
tooltips also use `ngx-design-system-overlay` because they attach outside the
route host. The shell must provide these global classes; the remote's stylesheet
is a standalone fallback and is not automatically loaded by federation.
Dialog dimensions are supplied through MatDialog config so hosted mode does not
depend on remote-only global sizing classes. The routed App/Routes exports,
providers, API and persistence adapters retain their contracts.

The create-MFE page renders the shared `NgxBackground` with viewport placement.
Its isolated host keeps the decoration behind the glass form while retaining its
765px content width. Background artwork inherits the active document theme; the
page does not implement theme selection or load separate image assets.

## Source map

Paths below are relative to `src/app/features/mfe-remotes/` unless stated otherwise.

| Area           | Source                                                                               | Responsibility                                                                          |
| -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Bootstrap/host | `src/main.ts`, `src/bootstrap.ts`, `src/app/{app.ts,app.config.ts,app.routes.ts}`    | Zoneless app, HTTP DI interceptors, async animations, public federation routes          |
| HTTP           | `api/api-mfe-remotes.ts`                                                             | Stateless typed catalog CRUD and text URL reads                                         |
| Persistence    | `api/dev-mode-storage.ts`                                                            | Broker calls and shell local-storage mirror, no catalog state                           |
| Shared model   | `state/mfe-remotes-store.ts`                                                         | Root singleton catalog, pending/errors, serialized commands and refresh orchestration   |
| Domain types   | `models/app.types.ts`                                                                | Remote plus UI dev flag; URL verification states                                        |
| Form factory   | `forms/mfe-remote-form.ts`                                                           | Typed controls, validation and type-specific request values                             |
| Catalog        | `pages/catalog/list-mfe-remotes.ts`, `catalog-view-model.ts`                         | Routed creation/configuration; scoped search/selection and derived counts                 |
| Catalog views  | `pages/catalog/mfe-remote-{catalog-actions,rail,list-item,detail}.ts` | Page-only input/event views                                                             |
| Create page | `pages/catalog/create-mfe-page.ts` | Routed typed creation form, pending/retry and completion navigation |
| Configuration  | `components/remote-configuration/`                                                   | Card orchestrator, summary/header/info views, confirmation/dev/preview dialogs          |
| Form workspace | `components/remote-configuration/form-mfe/`                                          | Form orchestrator/local VM, basic fields, capabilities, structural fields and overrides |
| Tests          | `testing/app/features/mfe-remotes/`                                                  | Mirrored API, state and form-workspace suites; root app test under `testing/app`        |

## Routes and data flow

The empty authenticated route redirects to `list-mfe-remotes`. Catalog routes lazily load `ListMfeRemotes` without a data resolver. The route-scoped CatalogViewModel calls `ensureLoaded()` for list/detail routes; it does not wait for the HTTP response. Creation does not require an initial catalog read. `list-mfe-remotes/:remoteId` selects a configuration by persisted ID; the static `new-mfe-remote` route opens creation. Navigation stays relative to the shell mount. Once catalog data is available, the base catalog replaces its URL with `list-mfe-remotes/<first persisted ID>`, preserving query parameters and fragment. Empty catalogs remain on the base route. Search filters the rail without changing an ID-routed configuration. Unknown/deleted IDs display Remote not found only after a successful catalog load. The hosted mount observed earlier in this chat was `/mfe-orchestrator/list-mfe-remotes`; it is the shell's mount, not a hardcoded route inside this remote.

The API adapter returns cold HTTP observables without state, refreshes or swallowed errors. `MfeRemotesStore` reads catalog records plus broker keys, enriches records with `isDevMode` and exposes state. Commands use `concatMap`; successful HTTP writes refresh the catalog. Failed commands leave the queue usable; failed refreshes retain the previous catalog and expose an error. Development persistence updates dev badges after a successful write. Root state survives route component destruction and is lost on application reload. `loaded` distinguishes a successful empty catalog from an uninitialized one; `loading` tracks active reads. Initial reads and explicit refreshes are coalesced and serialized with writes. Successful cached data is reused across navigation. Failed initial reads permit retry; failed refreshes retain prior data.

`CatalogViewModel` is provided by the list route component. Search is local and selection comes from ActivatedRoute, with counts, filtered rows, base-route fallback selection and busy/error state derived as streams. The route navigates to creation and invokes store commands; the card handles confirmation, preview and development dialogs. The VM exposes `viewModel` via a single `toSignal(viewModel$, { requireSync: true })`; the existing RxJS store remains the state source. Templates read that signal without initiating requests. Presentational views emit intent and do not call adapters.

`MfeFormViewModel` is provided per form instance. Input replacement cancels old form streams with `switchMap`; initial values and validity are emitted. The factory retains typed controls for both remote types and projects only relevant fields. URL verification uses a cancellable stream; edits and input replacement reset verification. Explicit `DestroyRef` arguments to `takeUntilDestroyed` preserve compatibility with the current federated runtime.

## External boundaries

See [HTTP contracts](api-contracts.md). The service owns persistence and authorization; the client guard checks authentication. API calls use same-origin `/api/mfe-remotes` and require the host/gateway or a separately configured local proxy. Development settings use the broker's bare remote ID and a prefixed shell mirror. Preview executes a federation module exposing `./Component` and renders its default component; HTTP URL verification only checks readability as text.

See [source organization](source-organization.md) for folder rules and [readiness](orchestrator-readiness.md) for evidence gaps. Layout migration changes imports and responsibility folders only; route URLs, providers, payload behavior and federation exports remain compatible.

The catalog rail measures its remaining viewport space and panel chrome, updating
on resize, scroll and size changes. Long catalogs scroll internally; the mobile
rail is additionally capped at 480px. The configuration panel heading displays
the selected remote's name. The ID and metadata/quick actions project into the shared `ngxPanelHeader` slot,
removing the separate detail context. The header slot and staggered-heading inputs are supplied by published 21.0.4,
pinned in both shell and remote with matching strict share requirements.

Route capabilities and Shell overrides are initially collapsed Material accordions.
MfeForm applies shared public expansion overrides with semantic Ngx tokens,
so both retain the same styling in embedded forms and dialogs. Capability edits
remain in the reactive form while collapsed; the header shows the enabled count.

Existing remote forms project card-owned Delete and Archive/Unarchive actions into
a collapsed Remote lifecycle accordion in Integration behavior; the create form
omits it. Existing remote edits autosave after 500ms of inactivity; there is no save footer. MfeForm's inherited expansion tokens
cover all integration accordions. Shell overrides use labelled Material selects
for Header/Navigation/Footer with the existing full/compact/disabled values and
themed overlay scope. Lifecycle handlers still belong to the card.

The form VM shares form instances between rendered values and a valid-only
valueChanges autosave stream. It skips initial/unchanged values, cancels on input
replacement/destruction, and preserves edited same-ID forms across refreshes to
protect newer drafts. Creation remains explicit. The card emits existing update
intent with the selected ID. Store update projection now omits archived; lifecycle
endpoints alone change archive state.

The root store publishes saving/saved/error notifications for update requests.
Only successful PATCH responses produce saved; revisions suppress stale queued
completions. A store-owned timer clears success after three seconds. Errors remain
visible with Retry save, using the failed payload through the existing write queue.
The action bar renders these states through a persistent polite live region.

The selected remote panel opts into headingMotion=stagger and binds headingMotionKey
to its persisted ID. This shared API animates only title characters, preserves
panel/form state, and respects reduced motion. The shared API is provided by published 21.0.4; clean installs no longer require
a local package preview. Hosted deployment acceptance remains pending.

## Routed creation — 2026-10-27

`CreateMfePage` at `new-mfe-remote` uses a linear, keyboard-operable Material
stepper: (1) remote entry URL verification, (2) display name and optional description,
(3) integration behavior and explicit Create. Its scoped `CreateMfeViewModel` owns
one typed form built by the shared factory, verification state and submission.
Shared basic fields have all/url/details modes; existing edit forms retain all fields.
The wizard reuses StructuralFields for type, capabilities, subtypes and shell overrides.

Successful URL verification gates step two; a valid display name gates step three.
A changed URL clears success and cancels the current request; late results cannot
unlock progression. Back navigation retains values. Creation requires the final
step, a valid form and successful current-URL verification. Verification checks
HTTP readability only, using the existing adapter; it does not inspect exports.

Pending requests disable duplicate submission. Errors remain visible in the catalog
and preserve the creation form for retry. The optional store completion callback
receives the POST result after catalog refresh and navigates to its persisted ID.
Pages destroyed by cancel/navigation ignore late completion. The top action switches from New remote to Back to List during creation and returns
to the base catalog; the wizard has no separate Cancel button. Preview, development settings and delete confirmation retain their dialogs.

The creation route hides the All remotes rail and centers the wizard at a maximum
width of 765px with responsive outer gutters. Its panel uses the public glass
background. Continue buttons use the chevron shape; step headers provide backward
navigation without separate Back buttons. Catalog/configuration routes retain the rail.

The final-step Create button uses chevron shape and projects through the public
`ngxPanelActions` slot into the panel footer. It appears only on integration step
three and retains form/verification/pending guards.

All three wizard steps now render their primary action in the same `ngxPanelActions`
footer: Continue to details, Continue to integration, then Create. Continue calls the
linear stepper's next method with the existing validation gates. Every action uses
chevron shape; step content contains fields and verification controls only.

The creation route host is a flex column with a minimum height covering the remaining
dynamic viewport. It measures its document offset on render/resize to account for
standalone and hosted shell chrome; the toolbar keeps its natural height and the
creation grid grows into remaining space. Minimum height permits long steps to grow
and scroll naturally; the centered wizard retains its 765px cap and natural height.

## Catalog read lifetime — 2026-10-27

No resolver waits for HTTP or the development-settings broker. Initial list/detail
navigation renders immediately with a loading status and hides premature empty or
missing-record states. Creation renders its form without triggering the catalog read.
`ensureLoaded()` reuses successful root-store data and any scheduled/in-flight load.
`refresh()` is explicit, coalesces concurrent requests, and uses the existing serialized
command queue; post-write reads remain ordered after their successful mutation.
The root store owns subscriptions so navigating away cannot cancel the shared read.
No TTL or polling is added: external changes appear in a new application session; the catalog action bar has
no manual refresh control. Failed refreshes keep known records visible with Retry.

Foreground catalog reads display a labelled indeterminate Material progress bar below
the action bar for initial loading and foreground refresh. Form update refreshes
run silently behind the existing save notification. The store keeps loading/pending
state separate from the showProgress presentation flag. Cached content stays visible
during refresh; the bar disappears on success or failure and Retry remains available.

The measured viewport minimum height applies to every catalog route, including
initial loading, refresh and error states. Background coverage no longer depends
on creation mode or the amount of content. Creation retains its flex-column layout;
loaded catalog views retain the existing grid and natural scrolling.

## Staged panel entrance — 2026-10-27

The generic shared boot effect is removed. The CATALOG / SELECT and REMOTE
CONFIGURATION panels fade together over 240ms without scaling. Remote rows fade
in after 260ms, staggered by 40ms per row (delay capped at index 12 for long lists).
Existing row nodes remain stable through search/refresh.

Remote details and Integration behavior panels start at 150px and grow to their
measured intrinsic height over 420ms, starting at 280/400ms. FormSection uses the
browser Web Animations API after rendering, so no fixed max-height or text scaling
is needed. The projected content fades in at 820/900ms, after both child panels have
grown. Animation completion removes clipping and leaves natural automatic sizing.
Resize, preference changes, keyboard focus and destruction cancel the intro and
restore live layout. Reduced motion skips height/content animation and CSS fades.
No render/request delay or form-state recreation is introduced; cached refreshes
retain existing panel nodes. Creation and empty-state panels use a simple fade.

## Default remote selection — 2026-10-27

The catalog VM combines root-store state with NavigationEnd to normalize only the
base `list-mfe-remotes` route to the first record in catalog order. Navigation and
loading remain nonblocking; cached data needs no new GET. The one-shot subscription
is destroyed with the VM. `replaceUrl` avoids an extra base-route history entry.
Explicit remote IDs (including missing ones) and creation routes are preserved.
Returning through MFE Remote List now opens the first remote when data is available.

## Development override and clipboard controls — 2026-10-27

Development override uses a compact toggle and a URL field in an auto/minmax grid
row. The field fills remaining width; the dialog keeps its 600px desktop size with
viewport gutters. Public Material slide-toggle selected-state overrides use
`--ngx-color-warning`, including hover/focus/pressed states. Existing broker loading,
disabled state and persistence handlers are preserved. The Configure development
mode launcher gets a warning-colored ring/glow only from the catalog `isDevMode`
flag, which updates after successful local override persistence.

Remote ID is focusable clickable text using CdkCopyToClipboard to copy the
persisted `_id`, with Enter/Space support and visible keyboard focus. Remote entry URL's link prefix icon is wrapped in a labelled icon
button and copies the current reactive-form control value. It is disabled when
empty. Both copy controls have tooltip and polite live-region success/failure
feedback; copying does not edit values, verify URLs or submit forms. URL input edits
clear previous copy feedback. These use installed CDK clipboard support with no
new service/API/dependency or changes to dev override key conventions.

The catalog rail uses natural height with align-self:start. It must not inherit
100% of the animated configuration grid row: that inflated its measured panel
chrome, reducing the available list space during sibling panel growth. Row reveal
remains opacity-only, with the existing bounded viewport list and scroll handling.

## Shared motion and Material policy — 2026-10-27

The design system now owns NgxEntrance fade/grow mechanics, reduced-motion/focus/
resize cancellation and cleanup. FormSection retains its descriptive layout and
projects content through a shared fade directive; MfeForm applies shared growth
to section hosts. Catalog panels and rows use the same directive. The MFE retains
existing sequence delays, durations and row delay cap; forms stay mounted.
MfeForm and DevModeOptions include public expansion-theme()/warning-slide-toggle()
Sass mixins instead of local Material override maps. Component-scoped inclusion
works with the host's existing global theme, including dialogs.

Source adoption is verified against a local built package preview. Published
21.0.4 cannot supply these APIs. A clean install removes the preview: release the
producer, align shell and remote package/lock/strict-singleton versions with the
actual published version, then deploy shell before remote. See
[handoff](../specs/008-shared-motion-material-policy/handoff.md).


Remote type supplies the public `mfe-structural-fields__type-panel` panel class.
Its component-loaded, BEM-scoped styles retain the select fade's final frame until
Material detaches the overlay. This prevents a terminal opacity reset while keeping
Material's animations, focus handling and reactive form value ownership. These
styles load with the component in federated mode rather than relying on the
remote's standalone global stylesheet.

Structural placement independently applies the same final-frame retention through
`mfe-structural-subtypes__placement-panel` in StructuralSubTypeOptions. Its styles
load with the child component and do not depend on StructuralFields rendering.

Header, Navigation and Footer shell override selects also retain the closing fade's
final frame via `mfe-structural-overrides__select-panel`. StructuralOverrides loads
its own portal styles; its host, title, field and container-query styles remain
explicitly scoped to avoid affecting other forms.

## Domain membership — 2026-10-30

Basic fields now include a themed Material multi-select for Admin and Workshop,
rendered in the URL/all modes so creation shows it in step one. Route capabilities
contain only Uses routes and Authentication, with an enabled count out of two.
The typed form and store preserve explicit domains for both remote types and omit
legacy isAdmin from writes. Legacy membership is inferred only for missing domains;
explicit empty arrays remain empty. The catalog retains the unfiltered read; domain
selection for shell loading belongs to the service endpoint. See API contracts and
feature 009 for delivery order and compatibility.
