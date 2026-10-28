# Tasks: development settings and copy controls
- [x] T001 Implement dialog row/warning switch and active header glow (FR-001/002).
- [x] T002 Add accessible current-value copy controls/feedback (FR-003/004).
- [x] T003 Verify real templates, state changes, copy failures and full regression/build checks.
- [x] T004 Update context/index and final handoff with evidence.

Evidence: all 49 ChromeHeadless tests PASS. Real dialog geometry/theme token and
state transitions tested with store doubles; copy success/failure/current-value
behavior tested with a CDK Clipboard double. Layout/whitespace and production build
PASS; existing unused summary warning remains. Development output restored.
Architecture, development, feature index and handoff updated. No contract changes.
