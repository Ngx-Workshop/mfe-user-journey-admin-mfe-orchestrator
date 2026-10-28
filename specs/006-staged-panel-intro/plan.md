# Plan: staged catalog introduction
Status: Implemented; hosted visual review pending · Updated: 2026-10-27

## Technical Context
**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Existing NgxPanel plus browser Web Animations API
**Storage**: No data changes
**Project Type**: Federated Angular admin remote

Remove shared boot motion in rail/card/empty/create panels and add scoped opacity
keyframes (240ms). Fade row hosts with 260ms + capped 40ms index delay. FormSection
measures its rendered height afterNextRender, animates host height from 150px with
280/400ms delay and 420ms duration, then fades projected content at 820/900ms.
Use backwards fill only; no fixed final height or persistent clipping. Cancel and
clean up on viewport/preference/focus changes and destruction. Reduced motion skips
WAAPI and CSS fades. Keep mutation/refresh state unchanged.

Verification: control real browser animation timelines in mirrored FormSection tests;
check initial 150px, measured final height, deferred content and subsequent intrinsic
growth; cover reduced-motion/resize. Retain router/cache/form regressions and run
layout, full tests, production build and restore development output. No deviations.
