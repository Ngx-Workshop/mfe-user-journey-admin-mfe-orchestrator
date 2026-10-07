# Orchestrator readiness findings

Reviewed 2026-10-07 from local source. These are follow-up findings and evidence gaps, not approved feature scope or claims of live failures.

| Area                 | Current observation                                                                                         | Remaining verification or decision                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog/model        | Error recovery and ordered writes have unit coverage; initial resolution populates root state               | Exercise real API failures and refresh recovery in a suitable integration environment                                                        |
| Writes               | Create/update/archive/delete are tested with HTTP doubles                                                   | Verify persisted DTO compatibility, stale-record/archive conflicts and backend administrator denial before claiming full CRUD acceptance     |
| Forms                | Typed validation, both type transitions, input replacement and verification cancellation have unit coverage | Add focused UI regressions for save errors and preserving unsaved edits as shared catalog/dev flags refresh                                  |
| Pending UX           | Store exposes pending state and serializes commands; route shows progress                                   | Review duplicate user submissions and whether controls/dialogs should block while pending                                                    |
| Development settings | Broker and mirror use the documented keys; badge updates follow success                                     | Verify broker unavailability, mirror-write failure, rapid edits and failure messages inside the dev dialog; two stores are not atomic        |
| URL verification     | Successful text GET establishes readability                                                                 | Not an export validator or security review; CORS and arbitrary URL behavior depend on the remote                                             |
| Preview              | Loads `./Component` default export and shows a load error                                                   | Verify module incompatibility, missing exports, nested routing/DI and cleanup in the shell                                                   |
| Federation           | Legacy name and strict singleton entries are retained                                                       | Review Material/CDK root version mismatch and secondary entry points with shell owner; no version changes are authorized by layout migration |
| Test coverage        | Four suites, 15 tests before this migration                                                                 | Unit doubles/builds do not prove live authorization or persistence; increase coverage when related behavior changes                          |

The current work migrates context and file organization. Select any follow-up through the local feature workflow when the user requests it.
