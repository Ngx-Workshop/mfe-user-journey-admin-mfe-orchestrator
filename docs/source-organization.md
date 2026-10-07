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
        resolvers/                        # Route data resolution
```

Create a category only when it contains code. Other supported categories are `utils/` for pure helpers and `config/` for feature configuration. Add `src/environments/` only when environment-specific code exists; this remote currently uses same-origin API URLs.

Keep a page's dedicated presentation components and view models beside that page. Move a component into `components/` when reused by multiple pages or orchestration contexts. The configuration form serves both the catalog edit card and the create dialog, so it lives in the named `remote-configuration` workspace. Keep its local view model beside the form; factories and shared control types belong in `forms/`.

Existing file names and exported symbols are retained. `app.routes.ts` remains the public federation route entry. Bootstrap, route URLs, HTTP contracts, provider lifetimes and federation exports are unchanged by this layout.

Tests live in `testing/app/features/mfe-remotes/`, mirroring production responsibility folders. `testing/app/app.spec.ts` covers the root app. Scenario suites may cover several modules in one area. Never import tests into production source.

Run `npm run check:layout` to detect misplaced application files, unknown feature categories, source-tree specs and test folders without corresponding source folders. Run the existing unit suite and production build after moving files. Keep this guide and the architecture source map current. Historical feature records retain the paths used at delivery.
