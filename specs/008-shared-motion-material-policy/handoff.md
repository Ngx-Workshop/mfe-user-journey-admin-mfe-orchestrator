# Handoff

Status: Implemented locally; release/hosted integration pending. Date: 2026-10-27.

## Delivered

Exported NgxEntrance with fade/grow modes, configurable delay/duration/start height,
natural-height restoration, focus/resize/preference cancellation and destruction
cleanup. Existing panel/heading APIs are unchanged. Public opt-in expansion-theme()
and warning-slide-toggle() mixins own the exact prior Material override policy.
The MFE consumes them; it retains sequence, responsive layout, form/domain state,
routes, storage, API contracts and dialog classes. Shared story and package consumer
exercise public exports. Remote motion test host now uses the directive explicitly.

## Verification

PASS: shared library, demo, Storybook, story typecheck and packed Angular/Sass consumer.
PASS: nine existing panel browser tests; five new entrance/policy browser tests.
PASS: all 51 remote ChromeHeadless tests, layout check and production build.
PASS: rendered shared policy screenshot inspected at /tmp/ngx-motion-material-policy.png.
Existing Material Sass deprecation, Storybook size and unused remote-summary warnings remain.
No live API writes or hosted acceptance performed.

## Local package preview and release order

The remote installed package's fesm2022/, types/ and styles/ directories contain
built producer assets from ngx-workshop-design-system/dist/ngx-workshop-ui.
Original directories are backed up at /var/folders/82/rylsmb_n1p591809975j19t80000gn/T/ngx-motion-material-original-adb6y1dt.
To refresh preview: build the library and copy those three directories over the
remote's node_modules/@tmdjr/ngx-workshop-design-system/ equivalents. To remove
preview: restore the backup directories or npm ci. Registry package manifests,
lockfiles and strict singleton versions remain 21.0.4; clean installs lack the new
APIs until a real release is adopted. Do not deploy the remote against 21.0.4.

X001 owner/order: release ngx-workshop-design-system using its existing main workflow;
then pin the observed published version in mfe-shell-admin and this remote, regenerate
locks and match strict federation requirements in both. Build/deploy shell before
remote so an older singleton cannot supply missing exports. Verify hosted loading,
selection, staged entrances/reduced motion, dialogs, warning-toggle colors and
accordion retained edits. Component-scoped Sass needs no additional shell global
policy. No guessed release pin, commit, push, package publication or deployment made.
