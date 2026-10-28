# Development and verification

## Build toolchain compatibility

Keep `@angular-devkit/build-angular` pinned to `21.2.26` and the npm webpack
override at `5.105.2`. Builder `21.2.28` uses webpack `5.112.0`, whose federation
identifiers break `license-webpack-plugin@4.0.2` with an undefined `trim` error.
Both pins keep one compatible webpack runtime. Keep license extraction enabled;
validate a normal production build and non-empty `3rdpartylicenses.txt` before
removing these pins after an upstream fix.
Regenerate the lockfile with CI's Node 22/npm 10, then verify with `npm ci`;
npm 11 can omit optional peer entries required by npm 10.

## Setup and commands

Use the installed project dependencies or `npm ci` with the checked-in lockfile. Node 22 is the version configured by the current deployment workflow.

| Command                                               | Purpose                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `npm start`                                           | Angular development server on port 4201                        |
| `npm run dev:bundle`                                  | Watch development bundles and serve static assets on port 4201 |
| `npm run check:layout`                                | Validate feature categories and mirrored test folders          |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Run all unit tests                                             |
| `npm run build`                                       | Production bundle and Angular template checks                  |
| `npm run build -- --configuration development`        | Development bundle, useful for the local shell override        |

If Chrome is not discovered on macOS, set `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` for the test command. Karma discovers `../testing/**/*.spec.ts` relative to `src`; `tsconfig.spec.json` includes the testing tree. Production configuration includes only `src` and excludes source-tree specs defensively. See [test layout](../testing/README.md).

The hosted shell can load `http://localhost:4201/remoteEntry.js` through its configured development override. Same-origin `/api/mfe-remotes` requests depend on the shell/gateway origin. A standalone localhost app has no checked-in API proxy and needs suitable API/auth routing. No new environment files or services are required for this structural migration.

## Verification scope

The suite has 19 tests: the original 15 cover store/VM behavior, storage keys,
text URL reads and the root outlet; four catalog UI regressions cover search/empty
recovery, disabled/valid save, themed create dialog/type projection and confirmed
deletion with archived status. These use real component templates with mocked
store commands. They do not prove backend authorization, database persistence,
deployed federation or cross-origin broker behavior. Design-system migration
evidence belongs in [003 handoff](../specs/003-design-system-migration/handoff.md).

Run layout, unit tests and a production build after moving files. If a local static bundle server is already running, restore a development build after production verification. Do not run deployment workflows or change live records merely to verify docs/layout.

## Existing limits

Federation still names the remote `ngx-seed-mfe`. Material/CDK root and secondary
entries share strict 21.1.0, matching the shell. The new design-system singleton
requires 21.0.4 in both applications; upgrade and rebuild them together when
changing that requirement. Hosted visual integration requires the shell's global
theme scopes described in [architecture](architecture.md).

The deployment workflow currently builds the development configuration. Verification of a production build here does not change that workflow or establish a deployment. The README links to local context; optional Spec Kit helper scripts may create branches or overwrite plans/agent files, so read their source before use. Ordinary Markdown editing is the default.

Autosave verification now includes 29 tests. Jasmine clock tests validate the
500ms debounce and 3000ms success notification lifetime without wall-clock waits;
real-template interaction tests verify ID-bearing autosave, no initial/create
updates, lifecycle controls, shell selects and action-bar save/error/retry messages.
These remain local doubles, not backend persistence or hosted integration evidence.

## Deployment lockfile repair — 2026-10-27

Actions run 40453494492 failed before compilation: npm 10.9.9 rejected the lockfile
for missing optional peer entries @emnapi/core 1.11.3, @emnapi/runtime 1.11.3 and
@emnapi/wasi-threads 1.2.3. Regenerated the lockfile in an isolated directory
without node_modules using Node 22.23.4/npm 10.9.9, preserving existing dependency
versions except the intended design-system upgrade to published 21.0.4.
The shell uses the same package and strict federation version.

Use CI's toolchain when changing dependencies, for example:

```sh
npm exec --yes --package=node@22.23.4 --package=npm@10.9.9 --call 'npm install --package-lock-only'
npm exec --yes --package=node@22.23.4 --package=npm@10.9.9 --call 'npm ci'
```

If a lockfile regeneration still omits platform/optional entries, copy the manifests
to an empty directory, regenerate there and inspect the diff before replacing the
repository lockfile. Preserve the normal npm ci deployment gate. Deploy the matching
shell before the remote to satisfy strict singleton requirements.

Verified the repair with clean npm ci, production and deployment-development builds
in both repositories using Node 22.23.4/npm 10.9.9. All 29 remote tests and three
shell tests pass against published 21.0.4. Local preview package copies are no longer
needed. The original Actions attempt has not been rerun; commit/push the changes
and deploy the matching shell before the remote.

## Catalog routing — 2026-10-27

The suite now has 34 passing tests. RouterTestingHarness checks use the public
route definitions with authentication bypassed and a mocked store, including
ID links, back navigation, shell-relative creation/cancel, missing/deleted IDs,
creation validation/type projection, failed draft retry and ignored late completion.
Store HTTP tests verify creation completion occurs after refresh and failed creates
can be retried. These checks do not establish deployed shell routing, real auth or
backend persistence. The production build retains the existing unused
`mfe-remote-summary.ts` warning.

## Creation wizard — 2026-10-27

Creation now uses `new-mfe-remote` (hosted at `/mfe-orchestrator/new-mfe-remote`).
The former `list-mfe-remotes/new` creation route is removed. The 35-test suite
additionally checks three-step ordering, linear header navigation, required URL/name,
URL checking/failure/retry, stale verification cancellation and Back preservation.
Creation verification remains the existing HTTP text-read check. Production build
passes with the existing unused summary warning; development output is restored
for the running local server. Hosted authentication and live persistence remain
outside local test evidence.

## Nonblocking shared catalog — 2026-10-27

The 42-test suite includes real-router/HTTP-double regressions that complete
navigation before catalog HTTP and broker reads resolve, navigate across list/detail/
creation with one shared read, and verify explicit refresh/error recovery. Store tests
cover cached empty results, concurrent ensures, failed initial retry, and ordering
between initial reads, writes and post-write refreshes. Templates consume the scoped
VM's `toSignal` bridge. The root RxJS store owns state and request subscriptions.
These checks do not establish live backend persistence or hosted auth/federation.

## Development override and copy controls — 2026-10-27

The 49-test suite covers the modal's same-row control geometry, broker loading/
disabled states, selected warning token, dev launcher glow transitions, toggle
persistence and clipboard ID/current edited URL values. Clipboard success/failure
uses a CDK Clipboard double; this verifies UI and exact requested values, not OS
clipboard permissions in a deployed browser. Existing storage-key, form, router,
nonblocking loading and animation suites remain covered.

The 50-test suite also covers mouse/Enter/Space copying from the plain-text remote
ID and rail-height stability while adjacent child-panel animations advance. The
rail regression fails with percentage height and passes with natural height.
