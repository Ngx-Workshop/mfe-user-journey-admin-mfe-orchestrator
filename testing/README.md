# Unit tests

`testing/app` mirrors `src/app`, with feature suites under `testing/app/features/mfe-remotes`. Root app coverage remains in `testing/app/app.spec.ts`.

- `api/`: development storage key conventions.
- `state/`: catalog/model/VM scenarios, request ordering, errors and URL reads.
- `components/remote-configuration/form-mfe/`: form view-model scenarios including factory behavior, type transitions and cancellation.

Scenario suites can cover several modules without requiring a spec for every source file. Put new tests under the corresponding production responsibility folder; never import testing code from application code.

Run `npm run check:layout` and `npm test -- --watch=false --browsers=ChromeHeadless`. Test discovery in angular.json is relative to src; TypeScript includes `testing/**/*.ts`. HTTP and broker doubles do not establish live persistence or authorization. See [development](../docs/development.md).
