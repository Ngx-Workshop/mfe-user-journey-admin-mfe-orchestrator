# MFE Orchestrator<br><sup>MFE User Journey - Admin</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" style="max-width: 100%;height: 132px;" alt="Module Federation" />

Angular micro-frontend (remote) for the **Admin MFE Orchestrator** user journey in the NGX Workshop ecosystem.

Angular 21 standalone micro-frontend (remote) for the NGX Workshop admin experience. It lists, creates, updates, previews, archives, and deletes MFE remotes that are consumed by a host shell via module federation.

### What you get

- Standalone Angular + zoneless change detection, Material UI, and async animations.
- Module federation remote (`ngx-seed-mfe`) exposing `./Component` and `./Routes` with `remoteEntry.js`.
- CRUD flows against `/api/mfe-remotes` with dev-mode overrides stored in local storage.
- Live preview of a remote via `loadRemoteModule` and a search-driven list view.

### Getting started

1. Install dependencies:
   - `npm install`
2. Run the dev server (serves `remoteEntry.js` on port 4201):
   - `npm start`
   - Requires API/auth routing for `/api/mfe-remotes` and its CRUD routes; see the development guide for standalone versus shell origins.
3. Serve a watchable production-style bundle (useful when hosted by another shell):
   - `npm run dev:bundle` (runs a development watch and serves the built assets via `http-server` on port 4201).
4. Build for production:
   - `npm run build` (outputs to `dist/mfe-user-journey-admin-mfe-orchestrator`).
5. Run unit tests:
   - `npm test`.
6. Run the module-federation dev server helper (from `@angular-architects/module-federation`):
   - `npm run run:all`.

### Repository context and organization

Start with [AGENTS.md](AGENTS.md), the [local workflow](.specify/README.md), [architecture](docs/architecture.md), [development guide](docs/development.md) and [feature index](specs/README.md).

Feature code lives under `src/app/features/mfe-remotes`, following the [source-organization convention](docs/source-organization.md). Stateless adapters live in `api`, shared model/commands in `state`, typed factories in `forms`, domain types in `models`, and route resolution in `resolvers`. Catalog-only views/local VM live in `pages/catalog`; reused edit/create form and configuration views live in `components/remote-configuration`.

Specs mirror these folders under `testing/app/features/mfe-remotes`; root app coverage remains in `testing/app/app.spec.ts`. See [testing](testing/README.md). Run `npm run check:layout`, `npm test -- --watch=false --browsers=ChromeHeadless` and `npm run build` after moving source.

`src/app/app.routes.ts` remains the public federation route entry and guards/resolves `list-mfe-remotes`. `ApiMfeRemotes` makes stateless requests; `MfeRemotesStore` owns root catalog state, ordered writes, refreshes and errors. Scoped catalog/form VMs derive UI state. Components keep inline HTML/SCSS and BEM classes. The earlier refactor plan is retained as a [historical implementation record](specs/001-mvvm-refactor/implementation-record.md).

### Integration notes

- Remote entry is served from `http://localhost:4201/remoteEntry.js` by default; host shells should reference remote `ngx-seed-mfe` with exposures `./Component` or `./Routes`.
- Guards and resolvers assume user metadata and backend auth are available; ensure the consuming shell provides auth context compatible with `@tmdjr/ngx-user-metadata`.
- Dev mode overrides persist in both `localStorage` and `@tmdjr/ngx-local-storage-client` using the remote `_id` as the key (prefixed with `mfe-remotes:` for browser storage).
