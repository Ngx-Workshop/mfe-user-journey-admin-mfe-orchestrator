# Handoff: staged catalog introduction
Status: Implemented; hosted visual review pending · Updated: 2026-10-27

## Delivered sequence
1. CATALOG / SELECT and REMOTE CONFIGURATION panels fade in together over 240ms.
2. Remote rows reveal starting at 260ms with 40ms staggering (index cap 12).
   Child configuration panels grow from 150px to their measured natural height
   over 420ms, staggered at 280/400ms.
3. Child panel content fades in at 820/900ms, after the height-growth phase.

The generic boot effect is removed, including its scaling and exit behavior.
Height animation uses WAAPI and backwards fill only; completion restores automatic
height and unclipped overflow. Projected form content stays mounted and its state
is preserved. Resize, focus, reduced-motion preference changes and destruction
cancel animations and show the live layout. Reduced-motion users skip the sequence.
Cached reads do not destroy/recreate existing panel nodes. No network/render waits,
new dependency, DTO, auth, storage or federation changes.

## Verification
- `npm run check:layout`: PASS.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless`: PASS, 46 tests.
- Real browser animation timelines verify initial 150px height, measured end height,
  hidden content until the final phase, later intrinsic content growth, resize
  cancellation and reduced-motion bypass. Existing refresh tests retain node identity.
- `npm run build`: PASS, existing unused mfe-remote-summary.ts warning only.
- Development output restored for the running local server.
- `git diff --check`: PASS.

## Next step
Review the visual pacing in the authenticated shell. Local browser layout/animation
tests do not establish deployed visual integration. Current architecture and feature
index updated; no external-owner contract change or deployment was performed.

## Catalog rail sizing repair — 2026-10-27
Removed the rail host's percentage height and explicitly align it to the grid start.
The rail's own content now determines panel chrome, independent of the animated
configuration row. Its existing viewport cap, internal scrolling and opacity stagger
remain. A browser-layout regression simulates a two-column workspace and advances
native child-panel growth through six phases, checking stable usable list height.

Regression evidence: restoring height:100% reproduces the new test failure (the
list shrinks to 16px). With natural height/align-self:start, all 50 tests pass and
list height stays within 2px across the sampled growth timeline. The restored
percentage-height run was diagnostic only; the working tree retains the fix.

Refinement verification: 50 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Development bundle
restored for the running local server.
