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
- [ ] X002: Publish the shared header-slot library and align shell/remote dependency
  and strict singleton versions; verify after clean installs (AC-009).
