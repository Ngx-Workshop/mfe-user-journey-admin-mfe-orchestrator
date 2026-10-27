# MFE orchestrator architecture

Reviewed 2026-10-07. Migration baseline: commit `9728861`.

## Responsibility and stack

The Angular administrator remote lists, searches, creates, edits, archives/unarchives, deletes, configures development overrides and previews MFE catalog entries. Angular/Material/CDK are 21.1.0, RxJS 7.8.2, TypeScript ~5.9.3 and published orchestrator contracts ^0.0.54. Module Federation and ngx-build-plus are 20.0.0; working compatibility must be verified rather than inferred.

The host provides shell composition and authentication context. `App` is a minimal router outlet with a default export. `Routes` is the named route export. `webpack.config.js` preserves the legacy `ngx-seed-mfe` name and `remoteEntry.js`, exposing `./Component` and `./Routes`; production config reuses it. The repository retains strict shared dependencies and their existing versions.

## Design system integration

The remote and admin shell install and share `@tmdjr/ngx-workshop-design-system`
21.0.1 as a strict singleton. The catalog route host has `ngx-design-system`.
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
| Resolution     | `resolvers/mfe-remote.resolver.ts`                                                   | Populate the store before route activation                                              |
| Catalog        | `pages/catalog/list-mfe-remotes.ts`, `catalog-view-model.ts`                         | Create dialog orchestration; scoped search/selection and derived counts                 |
| Catalog views  | `pages/catalog/mfe-remote-{catalog-actions,rail,list-item,detail}.ts` | Page-only input/event views                                                             |
| Create dialog  | `pages/catalog/dialog-create-mfe.ts`                                                 | Catalog-only dialog returning a typed draft                                             |
| Configuration  | `components/remote-configuration/`                                                   | Card orchestrator, summary/header/info views, confirmation/dev/preview dialogs          |
| Form workspace | `components/remote-configuration/form-mfe/`                                          | Form orchestrator/local VM, basic fields, capabilities, structural fields and overrides |
| Tests          | `testing/app/features/mfe-remotes/`                                                  | Mirrored API, state and form-workspace suites; root app test under `testing/app`        |

## Routes and data flow

The empty authenticated route redirects to `list-mfe-remotes`. That child lazily loads `ListMfeRemotes` after `mfeRemoteResolver` loads the singleton catalog. The hosted mount observed earlier in this chat was `/mfe-orchestrator/list-mfe-remotes`; it is the shell's mount, not a hardcoded route inside this remote.

The API adapter returns cold HTTP observables without state, refreshes or swallowed errors. `MfeRemotesStore` reads catalog records plus broker keys, enriches records with `isDevMode` and exposes state. Commands use `concatMap`; successful HTTP writes refresh the catalog. Failed commands leave the queue usable; failed refreshes retain the previous catalog and expose an error. Development persistence updates dev badges after a successful write. Root state survives route component destruction and is lost on application reload.

`CatalogViewModel` is provided by the list route component. Search/selection subjects are local, with counts, filtered rows, fallback selection and busy/error state derived as streams. The route opens the create dialog and invokes store commands; the card handles confirmation, preview and development dialogs. Presentational views emit intent and do not call adapters.

`MfeFormViewModel` is provided per form instance. Input replacement cancels old form streams with `switchMap`; initial values and validity are emitted. The factory retains typed controls for both remote types and projects only relevant fields. URL verification uses a cancellable stream; edits and input replacement reset verification. Explicit `DestroyRef` arguments to `takeUntilDestroyed` preserve compatibility with the current federated runtime.

## External boundaries

See [HTTP contracts](api-contracts.md). The service owns persistence and authorization; the client guard checks authentication. API calls use same-origin `/api/mfe-remotes` and require the host/gateway or a separately configured local proxy. Development settings use the broker's bare remote ID and a prefixed shell mirror. Preview executes a federation module exposing `./Component` and renders its default component; HTTP URL verification only checks readability as text.

See [source organization](source-organization.md) for folder rules and [readiness](orchestrator-readiness.md) for evidence gaps. Layout migration changes imports and responsibility folders only; route URLs, providers, payload behavior and federation exports remain compatible.

The catalog rail measures its remaining viewport space and panel chrome, updating
on resize, scroll and size changes. Long catalogs scroll internally; the mobile
rail is additionally capped at 480px. The configuration panel heading displays
the selected remote's name. The ID and metadata/quick actions project into the shared `ngxPanelHeader` slot,
removing the separate detail context. This slot is implemented locally in the
shared library; a matching published host/remote upgrade remains pending (X002).
