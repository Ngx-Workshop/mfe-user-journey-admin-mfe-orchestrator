# Nonblocking shared catalog loading
Status: Implemented; hosted integration pending · Created: 2026-10-27

## Problem and requirements
A resolver starts GET /api/mfe-remotes on every catalog route activation; Angular
waits for its Observable before rendering. Administrators need immediate navigation
and shared, reactive catalog state.

- FR-001 / AC-001: Activate list/detail/creation routes without waiting for catalog HTTP or storage. Render initial loading/error accurately, without premature empty/not-found UI.
- FR-002 / AC-002: Share one catalog per root store lifetime. List/detail ensure initial load; concurrent/repeated ensures and route re-entry reuse in-flight/successful data, including an empty successful response. Creation alone needs no catalog request.
- FR-003 / AC-003: Refresh on explicit refresh/retry and after successful catalog mutations. Serialize operations so older reads cannot overwrite later mutation refreshes. Failed initial reads permit retry; failed refreshes retain prior data.
- FR-004 / AC-004: Use signals at the UI boundary without duplicating the existing RxJS store state. Catalog reads continue after a page is destroyed and update subsequent routes reactively.

## Boundaries and Constitution Check
Keep root store ownership, scoped view models, stateless adapters, DTO projection,
authentication, federation exports and dev-mode keys. No timer-based expiry or
cross-session persistence. External changes are visible through explicit refresh
or a fresh application session. Local router/HTTP-double tests establish acceptance;
live shell/backend integration remains separate. No deviations.
