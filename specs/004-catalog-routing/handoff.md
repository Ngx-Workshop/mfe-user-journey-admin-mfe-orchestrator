# Handoff: catalog configuration routes
Status: Implemented; hosted integration pending · Updated: 2026-10-27

## Delivered behavior
- AC-001: `list-mfe-remotes/:remoteId` restores persisted-ID configuration; selection updates URL. Navigation remains relative to shell mount; browser history works.
- AC-002: `new-mfe-remote` renders the three-step wizard in the catalog workspace. Creation is explicit and blocked while pending. Failures retain draft for retry; successful POST/refresh opens returned ID. Cancel returns to catalog; destroyed creation VM ignores late responses.
- AC-003: Missing/deleted IDs show Remote not found. Filtering does not change ID-routed detail. Base catalog retains existing search/first-match behavior.

- AC-004: URL verification → display name/description → integration behavior. Linear step/header navigation enforces URL success and required name. URL edits clear verification and cancel stale requests. Back preserves draft. Create is guarded by final-step position, form validity and verification success. Existing edit forms still display all fields.

## Verification
- `npm run check:layout`: PASS.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless`: PASS, 35 tests. Router scenarios and form interactions use store doubles; store creation completion/retry uses HTTP doubles.
- `npm run build`: PASS; existing unused `mfe-remote-summary.ts` warning.
- Development bundle restored for the existing local server after production verification.
- `git diff --check`: PASS.

## Compatibility and next step
No DTO, HTTP, storage, dependency, auth guard, federation export or host mount changes.
No external-owner contract change or delivery ordering needed. No deployments or live
writes performed. Verify direct-link reload, configuration selection and create/cancel
in the deployed authenticated shell before declaring hosted integration complete.
Architecture, development, source organization and feature index now describe routing.

## Creation presentation refinement — 2026-10-27
Creation hides the catalog rail, centers the responsive wizard at max-width 765px,
uses the panel glass background and chevron Continue buttons, and omits Back buttons.
Prior steps remain accessible via step headers. Existing wizard regression uses
header navigation and checks creation layout/presentation.

Refinement verification: layout and whitespace checks PASS; all 35 ChromeHeadless
tests PASS; production build PASS with the existing unused summary warning.
Development bundle restored after production verification for the local server.

## Creation exit action — 2026-10-27
The creation route replaces the top New remote action with Back to List and removes
the wizard Cancel control. Back to List navigates relative to the shell mount;
configuration/catalog routes retain New remote. Existing exit/late-completion
regressions now use the top action.

Exit-action verification: all 35 ChromeHeadless tests PASS, including shell-mounted
Back to List and ignored late completion; layout/whitespace and production build
PASS. Existing unused summary warning remains. Development bundle restored.

## Final creation action placement — 2026-10-27
Create now uses the chevron shape in the panel actions footer via `ngxPanelActions`.
The action appears only on the final step and preserves submission guards. Existing
wizard regressions check footer placement, chevron shape and absence on earlier steps.

Panel-action verification: 35 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Development bundle
restored for the existing local server.

## Consistent wizard action footer — 2026-10-27
Both Continue buttons now use the panel actions slot alongside final-step Create.
Only the current step action is rendered; all use chevron shape. Linear stepper
navigation, validation and submission guards remain in place. Existing regressions
verify footer placement/shape for both Continue buttons and final Create.

Footer verification: 35 ChromeHeadless tests PASS; layout/whitespace and production
build PASS with the existing unused summary warning. Return-navigation assertions
match the current workspace label MFE Remote List. Development output restored.

## Creation viewport fill — 2026-10-27
The creation route now fills the remaining dynamic viewport with a flex-column
host and growing creation grid. A measured document offset accounts for shell
chrome without hardcoded header sizes; resize observation is cleaned up on destroy.
The wizard keeps its centered max width and natural height. A layout regression
checks viewport coverage below simulated shell chrome.

Height verification: all 36 ChromeHeadless tests PASS, including the viewport-fill
regression; layout/whitespace and production build PASS with the existing unused
summary warning. Development output restored for the running local server.

## First-remote default route — 2026-10-27
The base list route now navigates to the first record's persisted ID after data
arrives, or from cached state, without blocking route activation or issuing another
GET. Navigation uses replaceUrl and preserves query/fragment and shell mount paths.
Empty catalogs keep the base route; explicit and unknown IDs remain unchanged.
MFE Remote List exits creation to the first remote when available. Search keeps the
ID-routed selection. Local tests cover URL replacement and the nonblocking cache flow.

Default-route verification: 47 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Development output
restored for the running local server.
