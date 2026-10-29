# Tasks

Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md)

- [x] T001: Install/share 21.0.1; add standalone and hosted theme/overlay contracts (AC-001/004).
- [x] T002: Migrate catalog, configuration, statuses, buttons and responsive layout (AC-001/002/005).
- [x] T003: Migrate dialogs, form surfaces and public overlay classes (AC-003/004).
- [x] T004: Verify UI regressions, layout, production build and desktop/mobile fixture; record evidence and context docs.
- [ ] X001: Verify the rebuilt remote in the deployed updated admin shell without changing live catalog records.

Evidence: clean Node 22/npm 10 install, layout check, all 19 tests and production build passed.
Fixture browser checks passed for conflicting shell palette styles, select overlays, search/type
transitions and widths down to 320px. See [handoff](handoff.md) for boundaries and screenshots.

- [x] T005: Remove hero, make action bar full width, and compact the responsive workspace
  and wide form layout (AC-006/007).
- [x] T006: Run layout, interaction tests and production build for the Mission Control refinement.

- [x] T007: Measure available rail space and scroll long catalogs; add a 60-remote
  viewport containment regression (AC-008).
- [x] T008: Bind the configuration panel heading to the selected remote name (AC-009).
- [x] T009: Compose metadata/actions and ID in the heading row, removing duplicate
  context heading using the shared ngxPanelHeader slot (AC-009).
- [x] X002: Confirm the published shared header-slot library and align shell/remote dependency
  and strict singleton versions; verify after clean installs (AC-009).

- [x] T010: Collapse Route capabilities and apply shared expansion tokens to both
  integration accordions; verify retained edits/count/save and styles (AC-010).

- [x] T011: Move Delete/Archive into the Integration behavior lifecycle accordion;
  keep save footer and omit lifecycle controls during creation (AC-011).
- [x] T012: Replace shell radios with themed labelled selects using existing values (AC-012).
- [x] T013: Verify lifecycle confirmation/archive, create omission and select payloads;
  run layout/tests/builds and record evidence (AC-011/012).

- [x] T014: Add valid-only debounced existing-record autosave, remove save footer,
  retain newer drafts across refreshes and cancel replaced forms (AC-013).
- [x] T015: Add response-backed save notifications, three-second success timeout
  and failed-save retry in the action bar (AC-014).
- [x] T016: Verify debounce/invalid/initial/duplicate/selection behavior, refresh
  preservation, actual write completion, timeout, failure/retry, serialized status
  and existing lifecycle/select/create regressions (AC-013/014).

- [x] T017: Enable shared staggered heading intro keyed to selected ID (AC-015).
- [x] T018: Verify shared library/demo/Storybook/package, replay/reduced-motion/mobile and remote regressions/build (AC-015).


- [x] T019 (AC-016): Reproduce the final-frame opacity reset for selection,
  outside click and Escape using StructuralFields with real Material animations.
- [x] T020 (AC-016): Retain the fade's final frame through a unique public
  panelClass; keep component CSS scoped and available to federated overlays.
- [x] T021 (AC-016): Verify all three regressions, value preservation, detachment,
  reopening, full unit suite, layout and production/development builds. Record
  hosted verification limits in the handoff.

- [x] T022 (AC-017): Reproduce Structural placement terminal opacity reset for
  selection/outside click/Escape, apply the independently scoped panel fix, verify
  control values/detachment/reopening, and run suite/layout/builds.

- [x] T023 (AC-018): Reproduce the opacity reset in all three shell override
  selects for selection/outside click/Escape, apply scoped final-frame retention,
  and verify the real animations, values, detachment and reopening.
