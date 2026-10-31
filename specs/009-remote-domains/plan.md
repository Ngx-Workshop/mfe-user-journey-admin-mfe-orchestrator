# Plan

Add MfeRemoteDomain in the service schema and OpenAPI DTOs; optional storage preserves detection of legacy records. Query MongoDB for explicit membership or missing-field legacy membership. Validate route parameters and each array element. Regenerate OpenAPI/contracts. Consumers use the generated union type (the current generator uses union types).

Remove isAdmin from form controls/writes while retaining the service property. Initialize legacy forms using the same membership rules as the endpoint. Store projection strips legacy isAdmin. Add a Material multi-select in all/url basic-field modes, putting it in the first creation step.

Constitution Check: typed forms, stateless API adapter, singleton store ownership, inline themed Material UI, preserved IDs/routes/federation, focused regression tests. No deviations.

External-owner handoff: service-mfe-orchestrator produces optional domains: MfeRemoteDomain[] and GET domain/{domain}; both shells consume the endpoint, and the admin remote consumes the new DTO property/type. User publishes/upgrades contracts and deploys service before updated consumers. Old clients may retain isAdmin-based behavior until upgraded; domain edits should begin after both shells are deployed. No database migration is required because missing-field fallback preserves legacy membership.

Verification: service query/validation/schema tests, generated contract build, shell builds, admin form/store/UI tests and production build. Local consumer verification may use temporary generated declarations, restored afterward; published dependency versions are user-owned.
