# Agent entry point — mfe-user-journey-admin-mfe-orchestrator

This repository owns the Ngx-Workshop administrator MFE remote catalog and configuration experience. All required repository context is local.

## Read before implementation

1. [Constitution](.specify/memory/constitution.md): durable engineering rules.
2. [Architecture](docs/architecture.md): ownership, routes, current source map and data flow.
3. [Development](docs/development.md): commands and verification limits.
4. [Workflow](.specify/README.md): specify → plan → tasks → implement → verify.
5. [Feature index](specs/README.md): select work from the user's request.
6. [HTTP contracts](docs/api-contracts.md), [readiness review](docs/orchestrator-readiness.md), [migration record](docs/seed-adoption.md) and [source organization](docs/source-organization.md).

## Working rules

- Inspect source and git status; preserve unrelated work.
- Maintain local spec, plan, tasks and handoff for substantive behavior changes. Small documentation/mechanical changes need only a concise verification record.
- Distinguish observed code, intended behavior and verified outcomes. Readiness findings are a backlog, not authorization to implement all findings.
- Preserve the relative `list-mfe-remotes` route, persisted remote `_id`, default App, named Routes, federation exposures and shared dependency versions unless the user requests a contract migration.
- Keep HTTP/persistence adapters stateless. Singleton `MfeRemotesStore` orchestrates shared catalog data and writes; route/form view models own scoped UI state. Components must not call adapters directly.
- Keep HTML and SCSS inline, use BEM for owned classes and target roughly 230 lines per component. Split by responsibility; the count is not a hard gate.
- Follow `src/app/features/mfe-remotes` categories and mirror them under `testing/app/features/mfe-remotes`. Keep page-only views and view models beside their page, reusable workspaces under `components`, form factories under `forms`, domain types under `models` and exported Routes in `src/app/app.routes.ts`.
- Run `npm run check:layout` after moves and the relevant tests/build. Record actual passes, failures and unavailable integration checks separately. Empty suites/builds do not establish working user journeys.
- Preserve HTTP contracts and both development-override key conventions. Backend authorization remains the service's responsibility. URL verification proves readability, not safe execution or valid federation exports.
- Resolve routine choices locally; ask only for consequential missing decisions. The workflow does not require repeated permission to perform authorized work.
- Update affected context docs. Record exact external-owner handoffs before contract changes. Do not publish packages, deploy, create issues or send messages merely to validate this workflow.

This is a repository-local Markdown workflow inspired by Spec Kit. Optional adapters are provided; no sibling repository or CLI installation is required.
