# MFE orchestrator refactor — historical implementation record

## Audit

The initial HTTP service also held a public mutable catalog subject, read development settings, refreshed the catalog after writes, and swallowed errors. The list route combined presentation, search/selection calculations, dialogs and transport calls. The form used `forkJoin` on non-completing control streams and `mergeMap` for input replacement, allowing old form subscriptions to remain active. Its dynamically added controls were untyped and incomplete when changing remote types. Development settings used inconsistent broker keys. Several components exceeded 250–370 lines, and style classes lacked consistent BEM names. Templates and styles were already inline; retain that convention.

## Plan and implementation

1. **Separate data access from the singleton model.** Keep `ApiMfeRemotes` stateless: typed HTTP requests only. Isolate browser/broker persistence in `DevModeStorage`. Introduce `MfeRemotesStore` as the root-provided model owning catalog data, write/refresh orchestration, pending work and recoverable errors. Expose observable state; keep subjects private. Serialize mutations with `concatMap`, refresh after successful writes, and preserve the last catalog when refresh fails.
2. **Introduce scoped view models.** `CatalogViewModel` owns route-local search/selection and derives counts, filtered rows, selection and request status. `MfeFormViewModel` owns one form draft and cancellable verification per form instance. Replacing a form input uses `switchMap` to detach previous streams. Use contract DTOs for writes and typed controls; normalize payloads by remote type.
3. **Separate orchestration from presentation.** The list route coordinates create dialogs and model commands. The card coordinates edit, confirmation, development settings and preview. The form coordinates draft/verification state and output events. Detail, rail, row, summary, card header, form section, basic fields, capabilities, structural fields and override/subtype controls render inputs and emit UI events. Nested orchestration is intentional where dialogs/forms own their own lifecycle.
4. **Apply view conventions.** Keep every view's HTML and SCSS in its component TypeScript file. Use BEM block/element/modifier names and `OnPush`. Split catalog rows, card summaries, form sections and capability controls by responsibility. Aim around 230 lines; the rail is a small exception because its cohesive layout includes inline responsive styles. Remove the unused legacy hero.
5. **Verify behavior.** Add tests for load failures/recovery, broker failures, serialized writes, error recovery, DTO filtering, dev-mode updates, search/selection, form validity/errors, both type transitions, old-form cleanup, verification cancellation and consistent storage keys. Replace the stale scaffold title test. Build development and production bundles and smoke-test the local remote inside the actual admin shell.

## Maintenance rules

- Components must not inject the HTTP or persistence adapters. Use the singleton model through orchestration/view models.
- Root state contains shared catalog data; route selection and form drafts stay scoped to their view.
- Catch failures at the orchestration boundary, preserve useful data and expose an actionable error.
- Use `AsyncPipe` for view streams and lifecycle-bound subscriptions for imperative UI commands. Pass an explicit `DestroyRef` to `takeUntilDestroyed` for compatibility with the current federated shell.
- Use `switchMap` when replacing read work or form inputs, `concatMap` when writes must finish in order. Do not use `forkJoin` for live control streams.
- Presentational views receive typed inputs and emit semantic events; keep transport and persistence out of them.
- URL verification checks HTTP readability of the federation JavaScript entry as text. It does not execute or validate the module's exports; preview performs module loading.
- Preserve the shell-provided `blur-backdrop` integration class. Locally owned dialog panel styles use `orchestrator-dialog` BEM modifiers.

## Verification results

- Development and production builds pass.
- All 15 Chrome Headless tests pass.
- Formatting and whitespace checks pass.
- In the admin shell, the local remote loads with the new row and summary components. Search selects the matching structural remote; clearing search restores the catalog. The create dialog starts invalid, becomes valid after required values are entered, and supports both type transitions. The test draft was canceled. URL verification succeeds against the existing JavaScript remote entry.
- HTTP writes and development-setting persistence are exercised through mocked transport/storage tests; live catalog records and persisted development settings were not changed during smoke testing.
- The local server is left serving the final development bundle. Changes remain uncommitted for review.

This record captures the earlier refactor and verification in this chat. Its paths and working-tree status describe that delivery, not the current checkout. See [current architecture](../../docs/architecture.md) and [source organization migration](../002-source-organization/handoff.md) for the current layout.
