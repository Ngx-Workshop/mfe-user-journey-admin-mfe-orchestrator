# Tasks: MVVM refactor

Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Recorded: 2026-10-07

These completed tasks summarize earlier work in this chat; they are not new verification claims.

- [x] T001 — Separate HTTP/broker adapters and singleton model. Covers FR-001 / AC-001; verified by ordering/failure/payload tests.
- [x] T002 — Introduce scoped catalog/form VMs and typed form streams. Covers FR-002 / AC-002; verified by replacement/type/cancellation tests.
- [x] T003 — Split views and apply inline BEM/OnPush conventions. Covers FR-003 / AC-003; verified by source review and development/production builds.
- [x] T004 — Move specs outside src and update discovery/imports. Covers FR-004 / AC-004; verified by 15 passing tests and application type check.
- [x] T005 — Preserve historical plan and explicit evidence limits in the local workflow. Verified by this record and the 002 migration.

## Constitution Check

No required principle deviation. Full live persistence/authorization was not claimed or part of this task's executed verification; readiness docs preserve the integration gap.
