# Plan

Export NgxEntrance standalone directive for fade and intrinsic-height growth. Keep sequencing inputs in consumers. Export expansion-theme and warning-slide-toggle mixins from the existing theme entry point; scope consumer inclusion locally so current host global styles remain compatible.

Constitution check: public Angular/Material/CDK APIs only; no private DOM, form recreation, domain changes or shared-version changes. Local preview replaces installed package assets only, with a backup; registry manifests/locks stay intact until a real release exists.

Verify through focused browser motion/policy checks, existing MFE integration tests, production builds, story typechecking and packed consumer. Hosted acceptance remains a release follow-up.
