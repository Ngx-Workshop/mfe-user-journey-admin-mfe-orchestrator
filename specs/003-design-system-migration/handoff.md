# Handoff: Workshop design system migration

Status: Implemented; hosted integration pending
Updated: 2026-10-26
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

Installed published design system 21.0.1 and shared it as a strict singleton in the remote.
Catalog header/rail, configuration and form sections use NgxPanel; ordinary Material actions use
NgxButton; remote statuses use NgxStatus. Owned surfaces use semantic tokens and angular geometry.
The tablet layout stacks rather than forcing a horizontally scrollable workspace. Search misses
offer clearing; a truly empty catalog offers creating. Field hints dynamically reserve space on
narrow screens. Create/delete/dev/preview dialogs and select/tooltip panels use matching theme
scopes outside the remote DOM, with responsive MatDialog dimensions and a glass backdrop.

Store/VM, adapters, routes, default App, named Routes, federation exposures, DTO projection, storage
keys and validation behavior are retained. The inherited private checked-toggle CSS selector is
replaced with owned capability state classes. No live API or browser-storage writes were performed.

## Verification evidence

| Scenario/check                                       | Method                                                                                                          | Result and limits                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Host installation/sharing                            | Node 22.23.4 / npm 10.9.9 `npm ci`, production build, 3 existing ChromeHeadless tests                           | PASS; shell commit `4f76413` pushed to main before remote migration                                                |
| Dependency/install compatibility                     | Same toolchain, remote `npm ci`                                                                                 | PASS; design-system pin 21.0.1; existing toolchain pins retained                                                   |
| Source organization                                  | `npm run check:layout` after removing temporary preview sources                                                 | PASS                                                                                                               |
| AC-002/003/004 UI regressions                        | ChromeHeadless full suite                                                                                       | PASS, 19 tests including 4 new catalog tests; real components with mocked store commands                           |
| Production compile/templates                         | `npm run build`                                                                                                 | PASS; nonempty `3rdpartylicenses.txt` and `remoteEntry.js` verified                                                |
| AC-001/004 theme inheritance                         | Temporary local fixture with actual compiled shell stylesheet and legacy `light-mode rose-palette` body classes | PASS; workspace and select panel resolve `--mat-sys-primary` to `#27f5ef`; no page errors                          |
| AC-002/003 browser interaction                       | Fixture search miss/clear and create dialog type switch to Structural                                           | PASS; no live services or writes involved                                                                          |
| AC-005 responsive rendering                          | Fixture at 1440px desktop; overflow assertions at 900, 768, 390 and 320px                                       | PASS; no horizontal page overflow; desktop/mobile and dialog screenshots inspected                                 |
| Whitespace                                           | `git diff --check`                                                                                              | PASS                                                                                                               |
| Live deployed host/remote federation and persistence | Not run                                                                                                         | X001 remains; fixture CSS check does not prove actual share-scope negotiation or production auth/API compatibility |

The first temporary preview entry imported Angular eagerly and failed Module Federation bootstrap.
It was corrected to a dynamic bootstrap boundary before all passing browser checks. The fixture
entry files were removed afterward. Screenshots are local verification artifacts under
`/tmp/ngx-design-system-migration-shots/` (`desktop.png`, `dialog.png`, `mobile.png`,
`mobile-dialog.png`). The browser used real compiled components with local catalog/store doubles.
Production build warnings remain the existing CommonJS optimization warnings; license extraction
stays enabled. No missing production configuration was worked around with a development build.

## Shell/remote contract and next step

`mfe-shell-admin` was committed and pushed as requested (`4f76413`). Its global stylesheet supplies
Ngx tokens and shared button/code CSS, plus Material adapters for `ngx-design-system` and
`ngx-design-system-overlay`. A scoped `ngx-design-system-backdrop` uses public CDK hooks and Ngx
overlay tokens. Legacy body palettes remain available to other remotes. The remote must load with
this host CSS and the matching 21.0.1 singleton; its global stylesheet is standalone-only.

The orchestrator migration remains local and uncommitted. Rebuild/deploy the host first, then
review/publish the remote changes and verify the existing `list-mfe-remotes` route in the host.
X001 is a deployment acceptance check, not a claim of a local failure. No backend rollout required.

README, architecture, development and the feature index now describe the new integration.

## Mission Control refinement — 2026-10-26

Removed the hero component. A compact page heading now shares the full-width sticky
action bar with New remote. Removed the workspace's 1440px cap, kept 1rem side gutters,
reduced detail spacing and empty-state height, and aligned the rail's sticky offset
with the compact bar. Form sections use two columns at a container width of 960px
and remain stacked below that width, including create dialogs. Long content retains
normal scrolling rather than clipping controls to force everything above the fold.

Verification: source layout check, all 19 ChromeHeadless interaction/domain tests,
production build and whitespace checks passed. Production emitted remoteEntry.js
and nonempty third-party licenses. The existing local static bundle server is
running, so the development bundle was rebuilt after production verification.
No new hosted visual check was performed for this refinement; X001 remains pending.
All changes remain local; no live data writes, commit, push or deployment.
