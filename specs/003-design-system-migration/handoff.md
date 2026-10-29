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

## Bounded catalog rail and selected heading — 2026-10-26

The rail now measures its actual position and panel chrome to constrain its body
to the remaining viewport. Search and counters retain their size while long
lists scroll internally. Resize/scroll listeners and ResizeObserver are cleaned
up on destruction. Preserved the user's 182px sticky offset and existing edits.
The configuration panel heading now binds to the selected remote's name.

All 20 ChromeHeadless tests pass, including a new 60-remote viewport-containment
regression. Source layout, production build and whitespace checks pass. Restored
the development bundle for the existing local static server. Hosted visuals remain
unverified. No release, deployment, commit or live data write performed.

Remaining: the installed NgxPanel 21.0.2 exposes only body and footer slots. Asked
the user whether to add a shared header slot before moving MfeRemoteCardHeader
and remote ID into its heading row; awaiting their scope decision. That row and
removal of the duplicate context heading have not yet been implemented.

## Shared header slot implemented — 2026-10-26

The user authorized the shared design-system addition. NgxPanel now has an optional
`ngxPanelHeader` slot. The card projects the selected ID and MfeRemoteCardHeader
(metadata and quick actions) beside the selected name heading. The detail view's
duplicate context heading is removed. Header content and long IDs wrap on narrow
screens. ID styling is owned by the card as `mfe-remote-card__remote-id`.

All 21 remote ChromeHeadless tests, layout and production build pass, including
a new regression asserting selected-name updates and ID/actions in the panel
header. Shared library/demo/Storybook/typecheck/packed-consumer checks pass;
all seven panel browser tests pass, including 320px containment and focus.
Shared desktop/mobile story screenshots inspected. Hosted integration not run.

Local verification uses built library code copied into the remote's installed
`fesm2022/` and `types/`; package manifests, registry lockfiles and strict share
versions remain at 21.0.2. A clean npm install removes this preview. Original
installed files are backed up at
`/var/folders/82/rylsmb_n1p591809975j19t80000gn/T/ngx-panel-header-original-d2jryuw7`.
Rebuild the library and copy those same two directories again for local preview.

X002: Release the additive library via ngx-workshop-design-system's existing
workflow, then update actual published versions/locks and strict share versions
in both mfe-shell-admin and this remote. Build host before remote and verify the
header row in the host. An older host singleton cannot supply the new slot.
No publication, shell mutation, commit, push, deployment or live data write.

## ID placement refinement — 2026-10-26

Moved the ID from the card header's horizontal row into MfeInfoGroup, immediately
above the Last updated/Version metadata row, aligned with Last updated. Retained
the selected name and quick actions. Presentation-only adjustment; production
build verified.

## Integration accordions — 2026-10-26

Wrapped Route capabilities in a Material accordion, collapsed initially like Shell
overrides. Its enabled count remains visible while collapsed. The existing controls
and reactive form are retained. Both accordions inherit public expansion-overrides
from StructuralFields: semantic surface/text/border, mono headings, primary indicator
and focus/hover colors, small corners and no elevation. Headers can grow to wrap
text; container queries adapt content to form width. No shared-library or shell
changes required.

Source layout and production build pass. Full suite: 21 passed, 1 existing failure.
The new regression passes for expand/collapse, retained toggle edits, enabled count,
shared border/radius and saved payload. The existing deletion/archived-summary test
fails because MfeRemoteSummary is commented out in the user's current card template;
that unrelated edit is preserved. Production reports its unused import warning.
Development bundle restored for the existing local server. Hosted visual checks
were not run. No commits, release, deployment or live writes.

## Remote lifecycle and shell selects — 2026-10-26

Delete and Archive/Unarchive now project from the card into a collapsed Remote
lifecycle accordion in MfeForm's Integration behavior section. The card retains
confirmation/dialog handling and persisted selection; type=button prevents form
submission. Create forms omit this accordion; the footer keeps Save changes.
Shared expansion overrides now live on MfeForm so lifecycle, capabilities and
shell accordions inherit the same theme. Header/Navigation/Footer use labelled
Material selects with dynamic hints, full/compact/disabled values and the themed
select panel scope. No persistence contract changes.

Verification: all 23 ChromeHeadless tests, source layout, production build and
whitespace checks pass. Tests cover lifecycle collapse/delete confirmation,
archive/unarchive independently of saving, create omission, all three select values
in save payloads and themed select panels. Material select harnesses locate panels
through their aria-controls ID; the captured overlay-container reference was stale
for these selects, so the assertion now inspects the actual controlled panel.
Updated the lifecycle regression to assert Unarchive for archived records rather
than expecting the summary component the user deliberately commented out. Its
existing unused-import build warning remains. Development bundle restored for
the existing static server. Hosted visual integration remains unverified.
No commit, push, release, deployment or live-data write performed.

## Debounced autosave and action-bar notification — 2026-10-26

Removed the manual Save changes footer. Existing-record form changes emit through
the scoped VM after 500ms of inactivity, only for valid, changed projected values.
Initial data and create drafts do not trigger updates. Create remains explicit.
Input replacement/destruction cancels pending debounce subscriptions. Once edited,
the selected form retains its draft across same-ID refreshes, including reverting
to the original value while an older save is in flight. A different selection
initializes a fresh form; edits still within the debounce window are cancelled
when leaving that record. No cross-record save emissions occur.

The card retains ID-bearing update intent; the store retains the serialized queue.
Update projection omits archived so delayed saves cannot undo lifecycle operations.
The action bar displays Saving during requests, Changes saved only on successful
PATCH response, then hides success at 3000ms. New saves cancel old notification
timers, and revisions suppress older queued save completions. Errors remain with
Retry save; the failed payload re-enters the existing write queue. A polite live
region announces status. Timers/subscriptions are cleaned up on destruction.

Verification: all 29 ChromeHeadless tests pass. Exact clock checks cover 500ms
debounce, rapid changes, invalid/unchanged/initial suppression, selection cancellation,
and the three-second success timeout. UI checks cover no manual save, emitted IDs,
create omission, controls/select payloads, lifecycle behavior and action-bar retry.
HTTP-double tests prove response-backed success, failure/retry and latest queued
status; form-VM checks preserve newer/reverted drafts through stale refreshes.
Source layout, production/development builds and whitespace checks pass. Existing
unused-summary compilation warning remains because its display is commented out.
Restored the development bundle for the existing local static server. Hosted visual
integration and real API writes were not exercised; no commit/push/deploy performed.

## Action-bar development indicator — 2026-10-26

Added a static light and live dev-mode MFE count beside the action-bar controls.
The light glows with the semantic warning color when any remotes use development
overrides and is dim at zero. Text uses singular/plural labels and a polite live
region; the decorative dot is hidden from assistive technology. The count uses
CatalogViewModel's full-catalog devModeCount, independent of search filtering.
No store or persistence changes.

Verification: existing 29 tests, layout check, production build and whitespace
check pass. Development bundle restored for the existing local server. Hosted
visual verification not performed. No commit/push/deployment or live data writes.

## Selected heading intro — 2026-10-27

Enabled the shared NgxPanel staggered heading API on the selected remote card,
keyed to its persisted ID. Characters fade in with a short neon glow (400ms each,
25ms stagger with 600ms delay cap). Unicode graphemes and spaces remain intact.
Selection/name changes replay the intro, while unchanged metadata leaves the
existing character nodes intact. Form contents remain mounted. Reduced-motion
preferences show the heading immediately; its full accessible label avoids
letter-by-letter screen-reader output.

All 29 remote tests, layout, production build and whitespace checks pass. Shared
library/demo/Storybook/story typecheck/packed consumer and nine panel browser tests
pass. Shared mid-intro/finished/mobile reduced-motion screenshots inspected under
`/tmp/ngx-heading-intro-*.png`. Updated the heading assertion to use its accessible
full label because visual spaces are now NBSP, and scoped the save-status assertion
to its own live region after the user's action-bar reordering. Development bundle
restored for the existing static server. No real API writes or hosted visuals run.

Local preview uses built shared fesm2022/types copied into the installed 21.0.3
package. Original code is backed up at
`/var/folders/82/rylsmb_n1p591809975j19t80000gn/T/ngx-stagger-heading-original-whp7yape`.
A clean install restores the published version, which lacks headingMotion and
headingMotionKey. Release the shared additive API, then align actual package/lock
and strict federation versions in shell and remote before hosted acceptance.
No publication, commit, push or deployment performed.

## Deployment dependency repair — 2026-10-27

Investigated Actions run 40453494492, job 122021368409, commit 7c3128464f6af20a4b09dcc56d996d5464135b3e.
The settings validation passed. Installation failed before build/upload because
npm 10.9.9 rejected missing optional peer lock entries: @emnapi/core 1.11.3,
@emnapi/runtime 1.11.3 and @emnapi/wasi-threads 1.2.3. Regenerated the remote lockfile
without node_modules using the runner's Node 22.23.4/npm 10.9.9 toolchain, adding
those entries without broad dependency churn.

Also confirmed the public 21.0.4 design-system tarball exposes headingMotion and
headingMotionKey; pinned that published version in both remote and mfe-shell-admin
package/lockfiles and strict federation settings. The previous 21.0.3 pin could
not supply the animation inputs. Clean installs now use the real registry package
rather than manually copied local-preview code. X002 is resolved by the observed
published release and aligned local dependency changes.

Verification with Node 22.23.4/npm 10.9.9: normal npm ci, production build and all
29 remote/3 shell tests pass. Development builds used by deployment also pass.
Layout/whitespace checks pass. Existing dependency deprecation and build warnings
remain. No CI steps, credentials, deployment targets or application behavior changed.

Changes remain local, uncommitted/unpushed in both repositories. Deploy the matching
shell first, then the remote. Re-running the original job without committing the
lockfile repair reuses the failing commit and cannot include this fix. No workflow
was rerun, no package published and no remote upload performed during verification.
X001 (actual hosted integration) remains pending.

## Ordered deployment — 2026-10-27

Committed/pushed mfe-shell-admin as 52fe3a409a09801d33f95dc91379f145d026e4ff.
Its push deployment run 40454385746 completed successfully, including dependency
installation/build and static asset upload. After completion, the public admin
index and main.js both returned HTTP 200 with the expected content types. This
verifies workflow delivery and public asset reachability, not authenticated journeys.

Only after that successful shell deployment, prepared this orchestrator dependency
repair for commit/push as requested. The orchestrator workflow will perform its
own clean install and rebuild from the corrected lockfile and published 21.0.4.

## Remote type closing flash — 2026-10-29

AC-016 implemented locally. The real animated StructuralFields fixture reproduced
opacity returning to 1 immediately after its exit fade, before overlay detachment,
for selection, outside click and Escape. A unique public panelClass retains the
final frame using animation-fill-mode: forwards. BEM-scoped styles are loaded with
the component via ViewEncapsulation.None so hosted overlays receive the fix without
shell global changes. No form binding, values, focus or autosave changes.

Verification: all three tests failed on the terminal opacity assertion before the
fix; all 54 ChromeHeadless tests pass after it. Tests also verify value changes only
on selection, overlay detachment and visible reopening. Source layout, production
build, restored development build and git diff --check pass. Existing unused
mfe-remote-summary.ts build warning remains. No live catalog writes performed.

Hosted visual acceptance remains pending: the reported URL fails to load in this
browser session because deployed remoteEntry.js requires design system 21.0.7 but
the shared runtime supplies 21.0.8. Existing local package/lock/webpack 21.0.8 edits
were present before this fix and preserved. Deploy the already aligned remote
through the normal user-authorized release process, then verify Remote type closes
smoothly on selection/outside click/Escape in the hosted shell. No deployment,
commit, push or dependency modification performed for this fix.

## Structural placement closing flash — 2026-10-29

AC-017 implemented in form-mfe-structural-subtypes.ts using a unique public panel
class, final-frame retention and BEM-scoped component-loaded styles. No placement
values, form bindings or other selects changed. The isolated child fixture's three
real-animation regressions all failed before the fix (terminal opacity 1 rather
than 0) and pass after it, including value/detachment/visible reopening checks.
All 57 ChromeHeadless tests, layout, production build, restored development build
and whitespace checks pass. Existing unused mfe-remote-summary.ts warning remains.
No live record changes, hosted visual verification, commit, push or deployment
performed for this follow-up. The user confirmed the earlier Remote type fix
visually in Chrome; that does not establish hosted Structural placement acceptance.

## Shell override closing flashes — 2026-10-29

AC-018 implemented for Header, Navigation and Footer in StructuralOverrides through
a shared component-owned public panelClass and animation-fill-mode: forwards.
Portal styles load with the component; all formerly encapsulated type/host rules
are explicitly scoped. Accordion behavior, region values and form bindings remain.

Nine isolated real-animation tests (three regions by three dismissal paths) failed
before the fix with terminal opacity 1 rather than 0 and pass after it. They also
check values, detachment and visible reopening. All 66 ChromeHeadless tests,
source layout, production build, restored development build and whitespace checks
pass. The existing unused mfe-remote-summary.ts warning remains. No hosted visual
verification, live record writes, commit, push or deployment performed.
