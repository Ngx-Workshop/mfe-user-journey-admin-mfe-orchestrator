# Plan: catalog routing
Status: Implemented · Updated: 2026-10-27

## Technical Context
**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Material/CDK 21.1.0, RxJS 7.8.2
**Storage**: Existing singleton store and service catalog
**Project Type**: Federated Angular remote

## Design
FR-001: Add `new-mfe-remote` beside the catalog/ID routes in `src/app/app.routes.ts`. Reuse catalog layout; derive selection from ActivatedRoute paramMap in CatalogViewModel. Navigate relative to the catalog's parent so shell mounts remain supported.
FR-002: Replace dialog launch with routed create page and scoped CreateMfeViewModel beside catalog views. Extend store create with optional completion callback after refresh, preserving existing callers and serialized writes. Destroyed pages ignore completion navigation.
FR-003: Resolve routed selection against full catalog; expose missing ID explicitly; retain base filtered fallback.

## Verification and Constitution Check
Exercise router navigation, deep links, history, creation validation/cancel/success/failure and existing template interactions under testing/app/features/mfe-remotes/pages/catalog. Run layout, full unit suite and production build. Preserve DTOs, auth, exports and shared dependencies. No deviations or external dependency changes.

## Creation wizard follow-up
FR-004 / AC-004: Replace full-form creation with a linear Material stepper in
`create-mfe-page.ts`. Own form factory instance, cancellable verification stream,
signals and guarded submission in `create-mfe-view-model.ts`. Reuse basic field
views with all/url/details mode and StructuralFields. URL success gates details;
required name gates integration. Cancel is explicitly relative to the base catalog.
Update route and shell-mount regressions, test validation, stale verification,
failed verification/retry, step skipping and draft preservation. No service/DTO change.

## Default route follow-up
FR-005 / AC-005: In CatalogViewModel, combine store state with NavigationEnd and
select the first record only for the base route once loaded. Take one matching
emission with DestroyRef cleanup, navigate relative to the parent with replaceUrl,
queryParamsHandling preserve and preserveFragment. No resolver or extra catalog read.
Update search/exit regressions to reflect ID-routed selection; test pending initial
load, cached default navigation, empty state, explicit/missing IDs, query/fragment,
history replacement and shell mount paths.
