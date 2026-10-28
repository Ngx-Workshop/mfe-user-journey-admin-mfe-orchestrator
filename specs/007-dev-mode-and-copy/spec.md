# Development override and clipboard controls
Status: Implemented; hosted integration pending · Created: 2026-10-27

- FR-001 / AC-001: Place Development override toggle and URL field on one row, with the URL field taking remaining dialog width. Preserve local storage behavior and loading/disabled states. Use --ngx-color-warning for the enabled switch.
- FR-002 / AC-002: Configure development mode has a warning-colored glow only when the stored remote isDevMode flag is true.
- FR-003 / AC-003: Render the remote ID as keyboard-operable clickable text that copies only the persisted ID.
- FR-004 / AC-004: Make the Remote entry URL prefix icon a labelled copy button, copying the current input value, disabled when empty. Neither copy control saves, verifies nor mutates form data; provide honest success/failure feedback.

Constitution Check: reuse Angular Material/CDK, inline BEM styles and semantic theme
tokens; preserve HTTP/DTO, dev storage keys, federation and data ownership. Test
real templates with clipboard/store doubles; no external contract change required.
