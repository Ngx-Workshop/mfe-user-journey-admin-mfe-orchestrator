# Orchestrator client contracts

Source: `src/app/features/mfe-remotes/api/api-mfe-remotes.ts` and published `@tmdjr/ngx-mfe-orchestrator-contracts` ^0.0.54 declarations. This describes the local client; it is not a live backend compatibility certification.

| Operation         | Request                                                          | Client response            | Orchestration                                                                                     |
| ----------------- | ---------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| Catalog           | `GET /api/mfe-remotes`                                           | `MfeRemoteDto[]`           | Read with broker keys; cached per store lifetime; nonblocking initial load, explicit/post-write refresh; retain prior catalog on failure                                            |
| Create            | `POST /api/mfe-remotes`, `CreateMfeRemoteDto`                    | `MfeRemoteDto`             | Serialize write, then refresh                                                                     |
| Update            | `PATCH /api/mfe-remotes/{id}`, `UpdateMfeRemoteDto`              | `MfeRemoteDto`             | Remove `_id`, `lastUpdated`, `version`, `__v`, `isDevMode`, `archived` from body; filter type fields; refresh |
| Archive/unarchive | `PATCH /api/mfe-remotes/{id}/archive` or `/unarchive`, null body | `MfeRemoteDto`             | Choose action from current archived flag; refresh                                                 |
| Delete            | `DELETE /api/mfe-remotes/{id}`, no body                          | `void`                     | Refresh after success                                                                             |
| URL verification  | `GET <remoteEntryUrl>`, text response                            | Text, projected to boolean | Cancellable read; HTTP/CORS failures become verification error                                    |

Remote IDs are persisted `_id` values; names and URLs are not mutation identifiers. Form projection emits domains for both types, structural subtype and false route/auth flags for structural remotes; user journeys emit route/auth flags and structural overrides. The legacy isAdmin field is omitted from form/store writes. The update command omits irrelevant type fields. This migration preserves that behavior and does not define how the server removes previously stored irrelevant fields.

`DevModeStorage` calls `keys()`, `getItem(id)`, `setItem(id,url)` or `removeItem(id)` on the broker. The browser mirror uses `mfe-remotes:<id>` and is changed after the broker operation succeeds. These are local development settings, not HTTP catalog writes. No distributed transaction across both stores is implied.

Preview uses Module Federation `loadRemoteModule` with type `module`, the entry URL, exposed module `./Component` and its default component export. A readable JavaScript file is not proof of those exports or safe execution.

## Ownership and compatibility

`service-mfe-orchestrator` owns the remote records, DTO producer, validation and administrator authorization. The gateway owns same-origin routing; the admin shell owns auth context, mount path, shared singletons and local override consumption. Contracts or shared-version changes require a named producer/consumer handoff and ordered compatibility verification. This layout/workflow migration changes none of these interfaces and publishes/deploys nothing.

## Remote domains — 2026-10-30

The service adds optional `domains: MfeRemoteDomain[]` with `admin` and `workshop` values.
The generated package represents this enum as a union type, matching its existing generation settings.
Both shells now request `GET /api/mfe-remotes/domain/admin` or `/domain/workshop`,
without local membership filtering. The endpoint also accepts the existing optional
`archived=true|false` filter. Omitted archived returns both statuses, preserving prior shell behavior.
The administrator catalog still requests the unfiltered list.

An explicit array controls membership for both remote types; `[]` means neither shell.
Missing fields retain legacy rules: admin gets admin-flagged or structural records;
workshop gets records whose admin flag is false/missing. The basic-fields multi-select
uses the same fallback, persists explicit domains when edited/saved, and appears in
creation step one. It is independent of route/auth capabilities and retained across type changes.
Unsupported values, duplicate entries, scalar values and null are rejected on create/update.

Publish/regenerate contracts from service OpenAPI, upgrade the admin remote's contract
dependency, deploy the service before both shells, then deploy the admin remote. Begin
domain changes after both shells have switched endpoints. The user owns publication,
version upgrades and deployment. See [009 handoff](../specs/009-remote-domains/handoff.md).
