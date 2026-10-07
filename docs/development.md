# Development and verification

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

The inherited suite has 15 tests covering store/VM behavior, storage key conventions, text URL reads and root outlet rendering. Mutations and storage are mocked; those tests do not prove live backend authorization, database persistence or cross-origin broker behavior. Earlier live checks in this chat covered catalog search/selection, an unsaved create draft, both type transitions and entry URL readability. Current migration evidence belongs in [002 handoff](../specs/002-source-organization/handoff.md).

Run layout, unit tests and a production build after moving files. If a local static bundle server is already running, restore a development build after production verification. Do not run deployment workflows or change live records merely to verify docs/layout.

## Existing limits

Federation configuration still names the remote `ngx-seed-mfe`. Its Material/CDK shared root entries require 20.1.0 although installed packages are 21.1.0; secondary entry-point sharing and duplicate component warnings need a separately scoped compatibility review. This migration preserves those settings.

The deployment workflow currently builds the development configuration. Verification of a production build here does not change that workflow or establish a deployment. The README links to local context; optional Spec Kit helper scripts may create branches or overwrite plans/agent files, so read their source before use. Ordinary Markdown editing is the default.
