# Tasks: Workflow and source organization

Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Updated: 2026-10-07

- [x] T001 — Audit references and baseline; choose feature/category ownership. Covers FR-001/002, AC-001/002. Evidence: docs/source-organization.md and plan.
- [x] T002 — Move production/tests, rewrite imports and extract form factory/domain types. Depends on T001. Covers FR-002/003/004, AC-002/003. Evidence: current source tree; final checks tracked below.
- [x] T003 — Adapt local Spec Kit infrastructure, orchestrator docs and feature records. Depends on T001. Covers FR-001/005, AC-001/004. Evidence: AGENTS.md, .specify, docs, specs.
- [x] T004 — Add check:layout and update README/testing guide. Depends on T002. Covers FR-005, AC-002. Evidence: package.json and scripts/check-source-layout.mjs.
- [x] T005 — Run layout, 15-test suite, production build, helper/link/contract checks; restore development bundle and finalize handoff/index. Depends on T002–T004. Covers all acceptance scenarios. Evidence: layout passed; 15/15 tests passed; production/development builds passed; helper syntax/discovery, local links, source equivalence and formatting checks passed. See handoff.

## External work

None required. Readiness follow-ups are not tasks authorized by this migration.

## Constitution Check

No deviation. This task list distinguishes delivered edits from checks still awaiting evidence.
