# Constitution — MFE orchestrator remote

Version: 1.0.0 · Ratified: 2026-10-07 · Last amended: 2026-10-07

Adapted from the document editor's local workflow and the user's orchestrator MVVM/source-organization requirements. This constitution governs future work; it does not certify inherited behavior.

## 1. Code quality and MVVM

Use strict TypeScript, standalone Angular components, typed reactive forms and idiomatic RxJS/signals in the zoneless application. Stateless HTTP and persistence adapters own requests only. The singleton domain model owns catalog data, mutation queues and persistence orchestration. Route/form view models own scoped search, selection, drafts and verification. Components orchestrate UI or present typed inputs/events; multiple orchestration layers are valid. Keep subjects private and handle failures at orchestration boundaries. Use cancellation for replaceable reads and serialization for ordered writes.

## 2. Meaningful verification

Cover changed logic and regressions with deterministic tests. Verify payload filtering, type transitions, error recovery, write ordering and cancellation when affected. Keep specs outside `src`, mirrored under `testing/app`. Run the layout check and appropriate tests/build after moves. Distinguish mocked checks, builds, live reads and real persistence verification; never claim one proves another.

## 3. Truthful user experience

Use Angular Material and the established theme. Make loading, empty, validation, pending and error states accurate. Preserve recoverable catalog data and edits. Prevent ambiguous duplicate actions where applicable. Treat development overrides as local settings, not server catalog edits. Do not present URL readability as proof that a federation module is valid or trustworthy.

## 4. Accessibility

Use semantic HTML, keyboard-operable controls, useful labels, deliberate dialog focus behavior, visible selection and responsive layouts. Preserve the existing Material focus handling and host integration classes when moving views.

## 5. Simple design and uniform source layout

Keep component HTML and SCSS inline in TypeScript. Use BEM for owned classes. Aim around 230 lines, splitting at meaningful boundaries rather than moving templates/styles into separate files. Follow the feature-first categories in docs/source-organization.md. Keep page-specific views beside their page; group reused configuration/form workspaces in components. Avoid empty placeholders and unrelated behavior changes during structural work.

## 6. Integration boundaries

The shell owns navigation composition, auth context and dependency sharing. Preserve default App, named Routes, `remoteEntry.js`, `./Component`, `./Routes` and inherited federation name `ngx-seed-mfe` until a deliberate migration. The backend owns remote records, validation and authorization; a frontend authentication guard is not an administrator permission boundary. Use published orchestrator DTOs, strip server metadata and UI flags from update payloads, and preserve the remote ID. The storage broker uses the bare remote ID; the shell mirror uses `mfe-remotes:<id>`. Record service/shell compatibility and delivery order before changing these contracts.

## Workflow and governance

Read AGENTS.md and linked local context before implementation. Maintain spec, plan, tasks and handoff for substantive changes with requirement/scenario IDs and a Constitution Check. Keep enduring facts in docs and feature progress in specs. Readiness findings remain separate from the current authorized scope. Amend principles intentionally with a version/date, rationale and review of dependent templates/docs. No workflow stage adds an approval gate to already-authorized work.

## Adoption record

Initial adoption on 2026-10-07 formalizes the preceding MVVM refactor, external test tree and current source-organization request. Orchestrator-specific templates and context replace document-authoring assumptions. Existing federation/shared-version discrepancies are recorded as findings; this migration does not change them.
