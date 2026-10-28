# Tasks: nonblocking catalog
- [x] T001 Remove resolver and add cached/coalesced, serialized store loading (FR-001/002/003).
- [x] T002 Bridge VM to a signal and render honest initial loading/error states (FR-001/004).
- [x] T003 Test pending HTTP navigation, caching/empty/error/retry, mutation ordering and existing regressions.
- [x] T004 Update architecture/source organization/development/index and verification handoff.

## Evidence
T001: No route resolver; root ensureLoaded/refresh tracks loaded/loading and coalesces
reads through the serialized command queue. load is private.
T002: Scoped toSignal bridge supplies templates; initial loading/error guards avoid
false empty/not-found states. Refresh catalog provides explicit external-data reload.
T003: 42 ChromeHeadless tests pass, including pending HTTP/broker navigation,
cached empty data, creation without reads, concurrent ensures, failed initial retry,
retained refresh data and write/read ordering. Layout and production build pass.
T004: Context docs, feature index and handoff updated. HTTP/DTO/auth/federation/storage
boundaries preserved. Hosted auth, federation and backend writes remain unverified.
