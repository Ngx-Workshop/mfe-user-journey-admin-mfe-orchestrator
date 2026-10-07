# Feature: Orchestrator workflow and uniform source organization

Status: Complete
Feature ID: 002-source-organization
Created: 2026-10-07 · Updated: 2026-10-07
Request/source: User requested the document editor's Spec Kit-like context adapted to this remote and the assessment repository's source-organization convention applied here.

## Problem and audience

Maintainers need the same local implementation workflow and folder responsibilities across admin remotes. This remote had no adopted workflow, a stale README source map and flat services/components/view-model folders despite its completed MVVM refactor.

## Scope

Adapt local workflow/templates/helpers and orchestrator docs; record relevant prior/current features; organize feature source/tests; update imports and add layout checks. No feature behavior, dependency versions, API, auth, data migration, deployment or external issue creation is in scope.

## Current behavior and evidence

Baseline `9728861` has `src/app/services`, `routes`, `components`, `state`, `view-models` and `app.types.ts`. Specs already live under `testing/app`; four suites contain 15 tests. REFACTOR-PLAN.md records prior behavior/verification. It must remain accessible as historical evidence rather than imply its flat paths are current.

## Requirements

- FR-001: Provide self-contained, orchestrator-specific AGENTS, constitution, workflow, templates, context docs and optional helpers, with no sibling runtime dependency or copied document feature histories.
- FR-002: Group feature code under `src/app/features/mfe-remotes` with documented responsibility categories; root app files remain app.ts, app.config.ts and app.routes.ts.
- FR-003: Mirror test responsibility folders under `testing/app/features/mfe-remotes`, keeping root app coverage, all 15 tests and production/test isolation.
- FR-004: Preserve route URLs, API/payload behavior, provider scopes, storage keys, federation exports and dependency versions.
- FR-005: Add a layout command and current source map, preserve historical refactor evidence and document actual verification results/limits.

## Acceptance scenarios

- AC-001: A maintainer can enter through AGENTS.md, select 001/002 from specs/README.md and follow local documents/templates without another checkout. Covers FR-001/005.
- AC-002: `npm run check:layout` passes for the documented feature tree and mirrored tests. Source contains no specs or imports from testing. Covers FR-002/003/005.
- AC-003: The complete existing 15-test suite and production build pass after imports/lazy loads move. Provider declarations, URLs, federation entries and adapter behavior remain compatible by source comparison. Covers FR-003/004.
- AC-004: Optional Bash helpers pass syntax checks and read-only prerequisite discovery selects 002 explicitly without switching branches or overwriting artifacts. Covers FR-001.

## Boundaries and decisions

Use `mfe-remotes` as the feature name. Catalog-only views/local VM belong in pages/catalog. The configuration workspace/form serves edit and create contexts, so it belongs in components/remote-configuration; factories belong in forms and shared view/domain types in models. Empty environment/utils/config placeholders are unnecessary. Live write integration is not acceptance scope for file moves; existing readiness findings remain visible.

## Constitution Check

Preserve MVVM and scoped state, inline BEM views, strict typing and tests. Feature records distinguish historical evidence from new checks. Optional helpers add no approval/delegation/branch requirement. No principle exception is needed.
