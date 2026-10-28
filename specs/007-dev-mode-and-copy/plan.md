# Plan: development settings and clipboard controls
Status: Implemented; hosted integration pending · Updated: 2026-10-27

## Technical Context
**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: Installed Material/CDK 21.1.0 and Ngx design system
**Storage**: Existing MfeRemotesStore/DevModeStorage
**Project Type**: Federated Angular admin remote

DevModeOptions: compact toggle label plus auto/minmax grid row and full-width input;
use public mat.slide-toggle-overrides for warning selected states. Header accepts
MfeRemoteDtoExtraProps and applies warning glow from persisted dev-mode state.
MfeInfoGroup and MfeBasicFields use CdkCopyToClipboard with native labelled buttons,
current values and success/failure signals/live regions. URL retains its link icon
inside the prefix button and never emits a URL edit/verification event on copy.

Verify dialog row geometry, disabled/loading states, selected theme token/glow,
toggle persistence, exact ID and edited URL copying, empty URL and clipboard failure.
Run existing forms/router/animation tests, layout and production/development builds.
No new dependency, adapter, payload or federation changes; no deviations.
