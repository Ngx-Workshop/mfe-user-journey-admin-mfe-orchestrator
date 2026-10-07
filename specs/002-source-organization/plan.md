# Implementation plan: Workflow and source organization

Status: Complete
Spec: [spec.md](spec.md) · Updated: 2026-10-07

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Material/CDK 21.1.0, RxJS 7.8.2, orchestrator contracts ^0.0.54, Module Federation 20.0.0
**Storage**: Existing singleton catalog and browser/broker overrides; backend owns persistence
**Project Type**: Host-mounted Angular administrator remote

## Design and requirement mapping

| Requirement | Approach                                                                                              | Files/boundaries                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| FR-001      | Adapt Markdown workflow, templates, constitution and optional adapters; author local context          | AGENTS.md, .specify, .github/agents, .github/prompts, docs                     |
| FR-002      | Move feature source by responsibility, keep page-local VM/views together                              | src/app/features/mfe-remotes; app.routes.ts import paths                       |
| FR-003      | Relocate specs and rewrite static/dynamic/type imports                                                | testing/app/features/mfe-remotes; existing discovery unchanged                 |
| FR-004      | Preserve logic and contracts; extract existing form factory/type definitions into appropriate folders | forms/mfe-remote-form.ts, models/app.types.ts; provider declarations unchanged |
| FR-005      | Add layout script/current docs; retain earlier plan as historical feature evidence                    | scripts/check-source-layout.mjs, package.json, specs/001 and 002               |

The architecture map names every current responsibility. Existing component file names/symbols remain. The form VM stays beside its workspace; RemoteForm moves to the pure form factory and UrlVerificationState to models. No Angular configuration/webpack/lockfile change is necessary.

## Verification plan

AC-001: Review local links, no document-editor-specific residues, actual source paths and feature status consistency. AC-002: Run check:layout and confirm no specs/testing imports under src. AC-003: Run all unit tests and production build, compare public boundaries against baseline, then restore the development bundle for any existing static local server. AC-004: Bash syntax checks plus explicit `SPECIFY_FEATURE=002-source-organization` read-only prerequisite discovery.

## Contracts, risks and migration

No producer/consumer contract changes, database migration or external-owner action. Import/lazy-load mistakes are the main risk and are checked by tests/build. Preserve .github/workflows/deploy.yml and all sibling repositories. Optional scripts are copied but mutation-producing setup/context helpers are not executed. Readiness issues are recorded without being implemented as extra scope.

## Constitution Check

All applicable principles are preserved. Source moves improve separation; scoped lifetimes and inline views remain. Verification evidence is recorded after commands finish; prior live checks are not relabeled as current integration acceptance.
