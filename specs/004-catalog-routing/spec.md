# Catalog configuration routes
Status: Implemented; hosted integration pending · Created: 2026-10-27

## Requirements and acceptance
- FR-001 / AC-001: Selecting a catalog remote opens `list-mfe-remotes/:remoteId`, using persisted `_id`. Direct navigation, reload and browser history restore that remote. Preserve the base catalog route and host-relative navigation.
- FR-002 / AC-002: New remote opens `new-mfe-remote` with a three-step creation wizard. Cancel returns to the catalog. Successful creation opens the returned remote ID; failures retain the draft, display the store error and permit retry. Disable duplicate submissions while pending.
- FR-003 / AC-003: Unknown/deleted IDs show an explicit missing remote state. Search filters the rail without replacing a routed selection. Base catalog retains its existing first-match/empty behavior.

- FR-004 / AC-004: Creation at `/mfe-orchestrator/new-mfe-remote` starts with URL verification, then display name/description, then integration behavior. Gate each step, retain values on Back, reset verification and cancel stale requests on URL edits. Require final-step validity and current URL verification before Create. Existing remote edit forms remain unchanged apart from preventing verification of invalid URLs.

- FR-005 / AC-005: After nonblocking catalog loading, normalize the default list URL to the first persisted ID in catalog order using history replacement. Reuse cached data, preserve query/fragment and shell-relative paths, retain base for empty/error states, and do not replace explicit IDs or creation.

## Boundaries and Constitution Check
Keep authentication, singleton store, DTOs, autosave, lifecycle, preview, dev storage and federation exports intact. No external owner change or data migration. Use scoped UI state, inline accessible templates and mirrored tests. Verify routes with Angular Router and mocked store/API, layout and production build. Hosted deployment and real persistence remain separate integration checks.
