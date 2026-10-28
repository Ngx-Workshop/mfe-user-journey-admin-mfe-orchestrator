# Tasks: catalog routing
- [x] T001 Implement routes, route selection and missing state (FR-001/003, AC-001/003).
- [x] T002 Implement routed creation and completion navigation (FR-002, AC-002).
- [x] T003 Update real-template router regressions; run layout, unit tests and build.
- [x] T004 Update architecture/development, index and handoff with actual evidence.

## Evidence and Constitution Check
T001/T002: Public routes, route-derived catalog VM and scoped creation VM implemented;
HTTP contracts, authentication guard, federation exports and storage preserved.
T003: 34 ChromeHeadless tests pass; layout and production build pass.
T004: Architecture, development, source organization and feature index updated.
Hosted integration remains a separate acceptance check; no external changes required.

- [x] T005 Move creation to new-mfe-remote and implement URL/details/integration wizard (FR-004/AC-004).
- [x] T006 Verify URL gating/cancellation, step navigation, payload projection, creation recovery and shell-relative cancel; update handoff.

Wizard follow-up evidence: 35 ChromeHeadless tests pass, including linear header
navigation, malformed/pending/failed verification, stale request cancellation,
URL-change invalidation, Back preservation, structural integration payloads through
shared projection, failed creation retry and shell-relative new route/cancel.
Production build and layout pass. Existing unused summary warning remains.

- [x] T007 Normalize default list route to its first persisted ID (FR-005/AC-005).
  Verify: 47 ChromeHeadless tests pass, including delayed data/cached default URL,
  query/fragment preservation, replaceState, empty and explicit/missing ID handling;
  shell-relative list action returns to the first remote.
