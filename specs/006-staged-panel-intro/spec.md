# Staged catalog panel introduction
Status: Implemented; hosted visual review pending · Created: 2026-10-27

The requested sequence replaces the rejected generic boot effect.
- FR-001 / AC-001: Fade CATALOG / SELECT and REMOTE CONFIGURATION panels together, without collapse/scaling.
- FR-002 / AC-002: Then stagger remote list item reveals; bound the overall delay for long lists and preserve existing nodes on refresh.
- FR-003 / AC-003: Grow configuration children from 150px to measured intrinsic height, then fade their projected content. Return to automatic sizing for future edits, accordions and responsive layouts.
- FR-004 / AC-004: Respect reduced motion; cancel on resize, focus/preference change or destruction. Do not delay navigation/network or recreate form state for motion.

Constitution Check: scoped presentation changes only; inline styles, accessible
focus/reduced motion, root request lifecycle and persisted IDs remain intact.
No shared dependency, DTO, auth, storage or federation changes.
