# Remote domains handoff

Implemented locally; deployment integration pending. Date: 2026-10-30.

## Delivered

- service-mfe-orchestrator: MfeRemoteDomain enum (admin/workshop), optional domains array in persistence/DTOs/OpenAPI, per-item/array validation and domain endpoint with optional archived filtering. Update validation rejects null. Existing isAdmin remains for older clients.
- mfe-shell-admin and mfe-shell-workshop: request their respective /api/mfe-remotes/domain/{domain} endpoint and accept service-selected records without local isAdmin filtering.
- mfe-user-journey-admin-mfe-orchestrator: themed multi-select in basic fields and creation step one, two remaining route capability toggles, typed domains payloads across type transitions and updates. Legacy isAdmin stripped from writes.

Missing domains retain prior shell membership; explicit arrays override it for both types, including [] meaning neither shell. Legacy structural remotes with false/missing isAdmin belong to both; admin structural records belong only to admin. A new form defaults to Workshop. Saving a legacy form persists its inferred domains. All catalog records remain visible through the original unfiltered list.

## Verification

- Service: 12 Jest tests pass; service build/OpenAPI generation pass.
- Contracts: generation and TypeScript build pass. The existing generator emits MfeRemoteDomain as a union type. Generated sources are build-time products and were removed after checking; tracked source entry point preserved.
- Admin remote: layout passes, 70 ChromeHeadless tests pass, production build passes with the existing unused-summary warning.
- Admin shell: production build and all 6 ChromeHeadless tests pass.
- Workshop shell: production build and the focused domain-loading test pass. Full suite reports 1 pass and 2 failures in unchanged src/app/app.spec.ts: missing ActivatedRoute provider. The old title assertion also refers to a starter heading. No unrelated App test changes made.
- Shell builds retain dependency optimization/unused-source warnings.
- Admin remote checks used a temporary copy of locally generated contract dist in node_modules; the original installed package was restored. No manifests/lockfiles/version numbers changed. Until the user upgrades contracts, the admin remote source requires the newly generated MfeRemoteDomain/domains declarations.
- No live database, gateway, deployment, auth or federation integration was exercised. Tests use query/HTTP doubles plus real DTO, Mongoose schema and Material control validation.

## User-owned release order

1. Publish contracts from the updated service/OpenAPI using the repository release process and chosen next version.
2. Upgrade the admin remote contract dependency and lockfile to that release (and shell dependencies as desired; their new request paths compile against the current DTO package).
3. Deploy the service, then both shells, then the admin configuration remote. Start editing domain assignments after both shells use the new endpoint; old shells still use isAdmin and do not honor explicit domain selections.
4. Confirm each shell loads assigned journey and structural remotes; edit a remote to both domains and verify it loads in both; clear domains and verify neither loads it. Verify existing legacy records retain membership, unknown domain returns 400, and writes persist through the real gateway/auth/database.

No data backfill is required. Do not remove the missing-domain fallback until all legacy records have explicit assignments and old writers are retired. Domain placement is independent of authorization.
