# Source organization

This admin remote follows the same feature-first convention as the other admin authoring remotes. This checkout contains its own implementation; sibling repositories are not required.

```text
src/
  main.ts, bootstrap.ts, index.html, styles.scss
  app/
    app.ts, app.config.ts, app.routes.ts
    features/
      mfe-remotes/
        pages/catalog/                    # Routed catalog, local VM and page-only views
        components/remote-configuration/  # Reused configuration/form workspace and dialogs
        api/                              # Stateless HTTP and external storage adapters
        state/                            # Singleton catalog and command orchestration
        models/                           # Domain/view types and contract adapters
        forms/                            # Typed form factories and payload projection
```

Create a category only when it contains code. Other supported categories are `utils/` for pure helpers and `config/` for feature configuration. Add `src/environments/` only when environment-specific code exists; this remote currently uses same-origin API URLs.

Keep a page's dedicated presentation components and view models beside that page. Move a component into `components/` when reused by multiple pages or orchestration contexts. The catalog edit form and creation wizard share basic/integration field views from the named `remote-configuration` workspace. Creation owns one typed form and URL verification state in its page-scoped `CreateMfeViewModel`. Keep its local view model beside the form; factories and shared control types belong in `forms/`.

Existing file names and exported symbols are retained. `app.routes.ts` remains the public federation route entry. Bootstrap, HTTP contracts, provider lifetimes and federation exports remain compatible. Catalog routing additionally exposes `new-mfe-remote` and `list-mfe-remotes/:remoteId`.

Tests live in `testing/app/features/mfe-remotes/`, mirroring production responsibility folders. `testing/app/app.spec.ts` covers the root app. Scenario suites may cover several modules in one area. Never import tests into production source.

Run `npm run check:layout` to detect misplaced application files, unknown feature categories, source-tree specs and test folders without corresponding source folders. Run the existing unit suite and production build after moving files. Keep this guide and the architecture source map current. Historical feature records retain the paths used at delivery.

Catalog reads are initialized by the scoped catalog VM and owned by the singleton
store, without route resolvers. The VM bridges its RxJS view state to a read-only
signal with `toSignal`; request lifetime is independent of that view's subscription.
