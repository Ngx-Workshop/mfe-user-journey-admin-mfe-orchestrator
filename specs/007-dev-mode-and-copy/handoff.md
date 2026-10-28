# Handoff: development override and clipboard controls
Status: Implemented; hosted integration pending · Updated: 2026-10-27

## Delivered behavior
- AC-001: Development override toggle and full-width entry field share one grid row;
  compact label leaves the input most of the available width. Selected switch
  track/icon/state layers use --ngx-color-warning through public Material overrides.
  Existing loading/disabled and persistence behavior remains intact.
- AC-002: Configure development mode gets warning color/glow from stored isDevMode;
  disabling dev mode removes the glow after store state updates.
- AC-003: Remote ID is a labelled keyboard-operable button copying the persisted ID
  through CdkCopyToClipboard, with tooltip/live feedback on success or failure.
- AC-004: The Remote entry URL prefix link icon is a labelled icon button copying
  the current form-control value in edit and creation views. Empty values disable
  copying; input edits clear feedback. Copy does not submit/verify/edit form values.

## Verification
- `npm run check:layout`: PASS.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless`: PASS, 49 tests.
- Real-template checks cover same-row centers/input width, selected warning token,
  loading/disabled transitions, dev launcher glow and existing persistence arguments.
- Clipboard tests use a CDK Clipboard double and verify exact ID/current edited URL,
  success/failure feedback and disabled empty copying. OS clipboard permission and
  deployed browser behavior remain integration checks.
- `npm run build`: PASS with existing unused mfe-remote-summary.ts warning.
- Development output restored for the running local server.
- `git diff --check`: PASS.

## Contracts and next step
No API/DTO, storage-key, shared version, authentication or federation changes.
No deployment, package publish or live catalog write. Review the modal/header and
copy controls in the authenticated shell to complete hosted integration acceptance.
Architecture, development and feature index now describe the delivered UI.

## Remote ID presentation refinement — 2026-10-27
ID copying now uses a focusable text span with role=button and Enter/Space handlers,
without Material/Ngx button decoration. Clipboard directive, tooltip and live feedback
remain. Regression checks mouse, Enter and Space all copy only the persisted ID.

Refinement verification: 50 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Development bundle
restored for the running local server.
