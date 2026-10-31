# Remote domains

FR-001: A remote can target admin, workshop, both, or neither through an enum-backed domains array; keep isAdmin for compatibility.
FR-002: Shells request GET /api/mfe-remotes/domain/{domain}; the catalog retains its unfiltered endpoint. Invalid domains return 400.
FR-003: Replace the Admin only toggle with a multi-select in basic fields and creation step one. Preserve selections across type transitions and saves.
FR-004: Missing domains retain legacy membership: admin gets isAdmin or structural; workshop gets non-admin. Explicit arrays, including empty arrays, override legacy membership.

AC-001: Each shell receives only assigned remotes, including structural remotes.
AC-002: Existing records retain membership until an explicit domains edit is saved.
AC-003: Multi-select edits create/update payloads and invalid domain values are rejected.
