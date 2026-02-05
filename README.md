# MFE Orchestrator<br><sup>MFE User Journey - Admin</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" style="max-width: 100%;height: 132px;" alt="Module Federation" />

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
   - Requires the backing API to expose `/api/mfe-remotes`, `/api/mfe-remotes/auth-test`, and related CRUD routes.
3. Serve a watchable production-style bundle (useful when hosted by another shell):
   - `npm run dev:bundle` (runs a production watch and serves the built assets via `http-server` on port 4201).
4. Build for production:
   - `npm run build` (outputs to `dist/mfe-user-journey-admin-mfe-orchestrator`).
5. Run unit tests:
   - `npm test`.
6. Run the module-federation dev server helper (from `@angular-architects/module-federation`):
   - `npm run run:all`.

### Architectural overview

- Entry points
  - `src/main.ts` dynamically imports `bootstrap.ts`, which bootstraps `App` with `appConfig`.
  - Module federation config in `webpack.config.js` names the remote `ngx-seed-mfe` and exposes `./Component` and `./Routes` from `src/app` via `remoteEntry.js`.
- Application configuration
  - `appConfig` (`src/app/app.config.ts`) wires zoneless change detection, global error listeners, async animations, `HttpClient` (with DI interceptors), and `ReactiveFormsModule`.
  - Root component `App` (`src/app/app.ts`) is a minimal `router-outlet` suitable for dynamic loading.
- Routing and guards
  - Routes (`src/app/app.routes.ts`) protect all children with `userAuthenticatedGuard` from `@tmdjr/ngx-user-metadata` and resolve data with `mfeRemoteResolver`.
  - `mfeRemoteResolver` (`src/app/resolvers/mfe-remote.resolver.ts`) fetches remote definitions before activation.
- Data layer
  - `ApiMfeRemotes` (`src/app/services/api-mfe-remotes.ts`) owns CRUD calls to `/api/mfe-remotes`, keeps a BehaviorSubject cache, enriches data with `isDevMode` flags from local storage, and offers helpers to verify remote URLs.
- Feature flow
  - `ListMfeRemotes` (`src/app/routes/list-mfe-remotes.ts`) renders the hero header plus a searchable list of remotes; uses `ApiMfeRemotes` for updates, archive/unarchive, and deletion.
  - `Hero` (`src/app/components/hero.ts`) opens `CreateMFEDialog` to create new remotes.
  - `MfeRemoteCard` (`src/app/components/mfe-remote-card.ts`) shows each remote in a Material accordion with update, archive, delete, dev-mode, and preview actions.
  - Dialogs: `DevModeOptions` toggles local dev overrides (stored via `@tmdjr/ngx-local-storage-client`), `MfePreview` loads a remote module via `loadRemoteModule`, and `ConfirmDeleteDialog` handles destructive confirmation. `CreateMFEDialog` reuses the shared form for creation.
- Forms
  - `MfeForm` (`src/app/components/form-mfe/form-mfe.ts`) builds typed reactive forms for both user-journey and structural MFEs, toggling fields for routes/auth/admin or structural subtype/overrides. Subforms live in `form-mfe-basic-fields.ts`, `form-mfe-structural-fields.ts`, `form-mfe-structural-overrides.ts`, and `form-mfe-structural-subtypes.ts`.
- UI and styling
  - Angular Material components, CDK accordion, and custom SCSS live in component styles and `src/styles.scss`; animations decorate accordion transitions and visual dev-mode cues.

### Integration notes

- Remote entry is served from `http://localhost:4201/remoteEntry.js` by default; host shells should reference remote `ngx-seed-mfe` with exposures `./Component` or `./Routes`.
- Guards and resolvers assume user metadata and backend auth are available; ensure the consuming shell provides auth context compatible with `@tmdjr/ngx-user-metadata`.
- Dev mode overrides persist in both `localStorage` and `@tmdjr/ngx-local-storage-client` using the remote `_id` as the key (prefixed with `mfe-remotes:` for browser storage).
