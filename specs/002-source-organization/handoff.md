# Handoff: Workflow and source organization

Status: Complete
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)
Updated: 2026-10-07

## Delivered structure

Feature source/tests now live in the mirrored `mfe-remotes` feature tree. Existing form construction is under `forms`, shared domain/control types under `models`. Catalog-only views/local VM remain together under `pages/catalog`; the reused configuration/form workspace, local form VM and dialogs remain together under `components/remote-configuration`. Public app route exports remain at `src/app/app.routes.ts`.

The local workflow, six templates, constitution, five optional Bash helpers and nine agent/prompt adapters are adapted for this remote. AGENTS.md links to self-contained orchestrator architecture, contracts, development, readiness, source-organization and adoption docs. Historical refactor evidence is preserved under 001; the README and feature index point to current context. No sibling feature histories were copied.

## Acceptance and verification evidence

| Scenario/check | Command or method                                                                                                                                | Result | Evidence/limitation                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001         | Local Markdown link check across 20 maintained context/feature files, plus repository-specific residue review                                    | PASS   | Local links resolve; no document-domain assumptions remain in active orchestrator context/templates                                                         |
| AC-002         | `npm run check:layout` and production/test isolation scan                                                                                        | PASS   | Documented categories and mirrored test folders; no specs or testing imports under src                                                                      |
| AC-003         | `npm test -- --watch=false --browsers=ChromeHeadless` with local CHROME_BIN                                                                      | PASS   | All 15 tests discovered and passed; HTTP/broker doubles retained                                                                                            |
| AC-003         | `npm run build`                                                                                                                                  | PASS   | Production build and template checks completed without Angular/build warnings                                                                               |
| AC-003         | `npm run build -- --configuration development`                                                                                                   | PASS   | Final development bundle restored for the existing static server                                                                                            |
| AC-003         | TypeScript declaration-structure comparison against baseline across 35 source/test files, normalizing import locations and redundant parentheses | PASS   | Existing declarations preserved, including extracted form functions/types; new domain type is the moved verification union                                  |
| AC-003         | Byte comparison against baseline                                                                                                                 | PASS   | webpack configs, angular.json, package-lock.json and deployment workflow unchanged; provider scopes, HTTP/storage behavior and route path strings preserved |
| AC-004         | `bash -n` on all five helpers                                                                                                                    | PASS   | Syntax only; mutation-producing helpers not run                                                                                                             |
| AC-004         | `SPECIFY_FEATURE=002-source-organization bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`               | PASS   | Explicitly selects this folder and discovers tasks; no branch creation or artifact overwrite                                                                |
| Quality        | Prettier check on source/tests/layout script and `git diff --check`                                                                              | PASS   | No formatting/whitespace failures                                                                                                                           |

The npm environment prints an inherited unknown-user-config notice for `scripts-prepend-node-path`; it does not fail these commands. No live UI/persistence checks were repeated for this structural migration. Earlier sampled live evidence remains explicitly historical under 001; production/test equivalence and existing automated checks establish this migration's acceptance scope.

## Contracts and external handoff

No API/DTO, storage-key, provider-lifetime, route URL, dependency-version, federation-export or deployment-workflow change. No external-owner action is required. No package was published, deployment triggered, issue created or live record mutated. Readiness findings remain follow-up work rather than migration tasks.

## Remaining work and next action

None within FR-001–005 / AC-001–004. Changes remain uncommitted for review. Future work starts through AGENTS.md and the feature index; add a new feature record only for the next requested substantive change.

## Context maintenance

AGENTS.md, README, .specify workflow/constitution/templates, docs, testing/README and feature records now describe this remote and current paths. The previous root REFACTOR-PLAN.md is preserved as [001 implementation record](../001-mvvm-refactor/implementation-record.md), labeled historical. Optional helper caveats and current integration evidence gaps are documented locally.
