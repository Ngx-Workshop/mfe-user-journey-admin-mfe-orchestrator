# Handoff: MVVM refactor

Status: Implemented; live writes not exercised
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)
Recorded: 2026-10-07

The earlier work separated adapters, root catalog model and scoped VMs; typed and canceled form streams; split inline BEM/OnPush views; fixed dev storage keys and JavaScript URL verification; moved specs outside source.

Prior evidence in this chat: development and production builds passed, all 15 unit tests passed, formatting/whitespace checks passed. In the hosted shell using the local override, catalog search/selection, unsaved draft validation, both type transitions and real entry text readability were checked. The draft was canceled. Mutations/broker writes were tested with doubles; no live records/settings were changed for smoke testing.

No contract change or external-owner action was required for the refactor. Real persistence/admin denial and broader federation compatibility remain evidence gaps in [readiness](../../docs/orchestrator-readiness.md). They require a separately requested integration scope.

Current paths and newly executed checks belong to [002](../002-source-organization/handoff.md). [The historical plan](implementation-record.md) preserves original context; use [architecture](../../docs/architecture.md) for current ownership and paths.
