# Handoff: nonblocking shared catalog
Status: Implemented; hosted integration pending · Updated: 2026-10-27

## Delivered behavior
- AC-001: Removed the catalog resolver. Navigation renders list/detail loading or
creation immediately, without waiting for HTTP or broker keys. Initial loading/error
states cannot falsely show an empty catalog or missing remote.
- AC-002: Root store owns cached catalog data, loaded/loading flags and request
subscriptions. Repeated ensures reuse scheduled/in-flight reads and successfully
loaded data, including empty results. Creation alone makes no catalog read.
- AC-003: Explicit Refresh catalog/Retry reloads data. Successful writes retain their
post-write refresh. All reads/writes run through the existing serialized queue;
load is private. Concurrent manual/initial requests are coalesced. Failed initial
loads allow retry; failed refreshes retain the previous successful catalog.
- AC-004: One toSignal(viewModel$, requireSync:true) per scoped catalog VM exposes
read-only UI state. RxJS remains the store/network source; signal reads do not
start HTTP. Navigating away does not cancel the root-owned shared request.

## Verification
- `npm run check:layout`: PASS.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless`: PASS, 42 tests.
- Real Angular Router + HTTP doubles prove navigation completion while HTTP and
broker reads remain pending, catalog sharing across routes and recovery through
Retry/Refresh catalog. Store tests cover concurrent ensures, cached empty data,
failure/retry and ordering of initial read, mutation and post-write read.
- `npm run build`: PASS with the existing unused mfe-remote-summary.ts warning.
- Development bundle restored for the existing local server after production checks.
- `git diff --check`: PASS.

## Compatibility and next step
No HTTP/DTO, storage-key, shared-dependency, authentication or federation changes.
No TTL/polling added: external changes require Refresh catalog or a new app session.
No service/shell handoff or deployment required for these local changes. Verify
navigation with delayed real API/broker responses in the authenticated deployed
shell before claiming hosted integration; no live writes were performed.
Architecture, API contracts, source organization, development and feature index updated.

## Catalog progress presentation — 2026-10-27
Catalog reads now show an indeterminate Material progress bar labelled Loading
remotes or Refreshing remotes. The shared loading state controls visibility; cached
configuration stays visible during refresh. Initial load, broker wait, refresh,
success and failure transitions are covered by existing router/HTTP regressions.

Progress-bar verification: 42 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Development output
restored for the local server.

## Loading background viewport fill — 2026-10-27
Apply the existing measured viewport minimum height to all catalog route hosts,
not only creation. Loading/progress and error backgrounds fill the available screen
below shell chrome; creation layout and long-content scrolling remain intact.
A real-layout regression checks pending and failed reads and changed shell offsets.

Loading-height verification: all 43 ChromeHeadless tests PASS; layout/whitespace
and production build PASS with the existing unused summary warning. Development
bundle restored for the running local server.

## Staggered arrival after loading — 2026-10-27
Use existing NgxPanel boot entrance for the rail, configuration/empty workspace,
form sections and create panel. Delay configuration by 90ms and form sections by
180/260ms. Reduced-motion removes delays; shared component shortens lifecycle motion.
Native element insertion triggers entry without timers, delayed requests or state
resets. Refresh regression retains panel/field element identity so cached content
is not destroyed and reintroduced during background reads.

Stagger verification: all 43 ChromeHeadless tests PASS; layout/whitespace and
production build PASS with the existing unused summary warning. Shared boot/heading
reduced-motion CSS and public motion API inspected locally; deployed visual motion
review remains separate. Development output restored for the running local server.

The initial boot-motion trial is superseded by [006 staged introduction](../006-staged-panel-intro/handoff.md), which implements the user's corrected fade/grow/content sequence.

## Refresh action removal — 2026-10-27
Removed Refresh catalog from the action bar and its unused input/output bindings.
Retry remains available for request failures; store-driven/post-mutation refreshes
continue to update the catalog. Router regressions use the store refresh command
to retain coverage of cached-content/progress behavior without a manual toolbar action.

Refresh-removal verification: all 46 ChromeHeadless tests PASS; layout/whitespace
and production build PASS with the existing unused summary warning. Development
output restored for the local server.

## Silent form-save refresh — 2026-10-27
Form updates and Retry save now request a silent post-PATCH catalog refresh. Loading
and command ordering still track the request, but showProgress is false so the
existing saving/saved/error indicator is the only save feedback. Initial reads,
foreground retries and other catalog refreshes retain the progress bar. A real form/
HTTP regression holds PATCH and GET open to check no progress during autosave.

Silent-save verification: all 51 ChromeHeadless tests PASS; the integration test
holds PATCH and post-save GET pending and observes only saving/saved feedback,
then confirms a foreground refresh still shows progress. Layout/whitespace and
production build PASS with the existing unused summary warning. Development output
restored for the running local server.
