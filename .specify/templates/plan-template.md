# Implementation plan: <feature>

Status: Draft
Spec: [spec.md](spec.md)
Updated: <date>

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0 (verify package.json)
**Primary Dependencies**: Angular Material/CDK 21.1.0, RxJS 7.8.2, ngx-mfe-orchestrator-contracts ^0.0.54, Module Federation 20.0.0
**Storage**: Singleton in-memory catalog; browser and broker dev overrides; remote records owned by service-mfe-orchestrator
**Project Type**: Host-mounted Angular administrator MFE catalog remote

## Source baseline

<Commit/reference, relevant source files, current behavior, and inherited
limitations that affect this feature. Verify dependency versions from manifests.>

Feature code belongs under `src/app/features/mfe-remotes` and specs mirror it under
`testing/app/features/mfe-remotes`. Follow docs/source-organization.md: page-only
views/VMs stay beside the page; reused workspaces belong in components; typed form
factories in forms; domain types in models. Keep public routes in src/app/app.routes.ts.

## Design and requirement mapping

| Requirement | Approach | Files/boundaries affected |
| --- | --- | --- |
| FR-001 | <Concrete approach> | <Actual paths and integration points> |

## Constitution Check

<For each applicable principle: satisfied, N/A with reason, or an explicit
deviation with rationale/impact/follow-up. Revisit after implementation.>

## Data, API, and integration contracts

<Requests, responses, validation, access policy, ownership, generated artifacts,
and compatibility. Include host exports/routes for frontend changes or DTO/
schema/OpenAPI changes for services as applicable. Mark unchanged boundaries.>

## External dependencies and delivery order

| Owner repository | Required contract/change | Compatibility and ordering | Local fallback / pending check |
| --- | --- | --- | --- |
| <Owner or none> | <Exact dependency> | <Producer/consumer sequence> | <Test double and verification limit> |

## Verification plan

| Acceptance scenario | Check/test | Environment or prerequisites |
| --- | --- | --- |
| AC-001 | <Observable check and test path/command> | <Local, test DB, host, etc.> |

<Use the repo development guide. Distinguish unit/build checks from integration.>

## Risks and migration

<Relevant failure modes, data migration, backward compatibility, rollout/rollback,
or N/A with explanation. Avoid unrelated deployment work.>

## Decisions and open questions

<Resolved choices with evidence; unresolved decisions and which tasks they block.>

## Orchestrator-specific review

Review docs/api-contracts.md and docs/orchestrator-readiness.md. Record affected
remote IDs, type-specific request fields, archive state, development overrides,
URL verification and preview behavior. Preserve shell mount routes, federation
exposures and dependency compatibility. Distinguish HTTP readability from module
loadability, and authentication from server-enforced administrator authorization.
