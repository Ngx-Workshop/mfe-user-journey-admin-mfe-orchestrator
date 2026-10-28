# Tasks: staged panel introduction
- [x] T001 Replace boot with outer fades and stagger row reveals (FR-001/002).
- [x] T002 Animate child heights and separate content reveal with cancellation (FR-003/004).
- [x] T003 Verify real animation timelines, intrinsic growth, resize and reduced motion; run full tests/layout/build.
- [x] T004 Update current architecture, index and final handoff with actual evidence.

Evidence: all 46 ChromeHeadless tests PASS, including controlled native animation
timelines for 150px → intrinsic height, deferred content opacity, later content
height changes, resize cancellation and reduced-motion bypass. Existing router,
cache, form and mutation regressions pass. Layout/whitespace and production build
pass; development output restored. Hosted visual review remains separate.
