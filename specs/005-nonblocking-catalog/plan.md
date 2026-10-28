# Plan: nonblocking catalog
Status: Implemented; hosted integration pending · Updated: 2026-10-27

## Technical Context
**Language/Version**: TypeScript ~5.9.3 / Angular 21.1.0
**Primary Dependencies**: RxJS 7.8.2 / Angular RxJS interop
**Storage**: Existing root MfeRemotesStore BehaviorSubject
**Project Type**: Federated Angular admin remote

## Design
Remove resolver from public routes and delete unused resolver source. CatalogViewModel
calls root ensureLoaded on list/detail activation; creation does not require data.
Root store tracks loaded/loading and coalesces scheduled/in-flight reads, using the
existing command queue for initial reads, explicit refresh and post-mutation reads.
Make load private so reads cannot bypass ordering. Successful empty results count as
loaded; errors retain cached data and allow retry. Add toSignal(viewModel$,
requireSync:true) once per scoped VM; templates read that signal while RxJS remains
the single store/orchestration source. Signal reads never initiate HTTP.

## Verification / Constitution Check
HTTP-double tests: initial/concurrent load reuse, empty cache, failure/retry,
refresh and write ordering. Router tests leave HTTP unanswered while completing
navigation across IDs/creation and back; prove one read and loading/error transitions.
Keep existing forms, create callbacks, lifecycle, theme and viewport behavior covered.
Run layout, full ChromeHeadless suite and production/development builds. No API or
shell contract changes, new dependencies or deviations.
