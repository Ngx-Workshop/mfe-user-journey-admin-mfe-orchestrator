# Workflow and source-layout adoption

Adopted 2026-10-07 from the document editor's local Markdown Spec Kit adaptation and the assessment remote's source-organization convention. Baseline: `9728861`. This checkout now owns all context and tools; sibling checkouts are not runtime/development prerequisites.

## Migrated and adapted

- `.specify/README.md`, six templates, constitution and five optional Bash helpers.
- Nine `.github/agents/speckit.*.agent.md` adapters and nine prompt wrappers. Repository context points to local orchestrator docs and takes precedence over generic helper instructions.
- `AGENTS.md` and orchestrator architecture, API contracts, development, readiness and source-organization docs.
- Root `specs/README.md` with local feature records. Document-editor feature histories were not copied.
- Feature-first source and mirrored test folders plus a local `check:layout` script.

The earlier `REFACTOR-PLAN.md` is retained as `specs/001-mvvm-refactor/implementation-record.md`, explicitly marked historical. Record 001 captures preceding work; record 002 captures this migration and its actual verification.

## Compatibility and limits

No Angular/service/package version, route URL, provider lifetime, storage key, API contract, federation exposure or deployment workflow is intentionally changed. Form construction and common control/domain types move to their documented responsibility folders. No dependency installation, Spec Kit CLI, new environment file, issue creation or deployment is required.

The copied helpers are optional compatibility adapters. `create-new-feature.sh` may create/switch a branch; `setup-plan.sh` may overwrite a plan; `update-agent-context.sh` may rewrite agent files. This migration uses ordinary edits and syntax/read-only checks, and preserves the manually maintained AGENTS.md. Use explicit feature selection rather than inferring intent from the current branch or highest feature number.

Readiness findings remain separate from acceptance of this structural migration. See [002 handoff](../specs/002-source-organization/handoff.md) for executed checks and limits.
