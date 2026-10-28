# Shared motion and Material policy

FR-001: Share fade/grow/reveal mechanics, reduced-motion handling, focus/resize cancellation and destruction cleanup without recreating forms. Consumers choose timing and sequence.
FR-002: Own accordion and warning-toggle visual policy in public Sass mixins; Material retains control behavior.
FR-003: Preserve catalog routing, state, persistence, overlay classes and existing staged timings.
AC-001: Reduced motion exposes content immediately; focus/resize cancels introductions; finished growth restores natural height.
AC-002: Accordion and warning toggle retain semantic colors and interactions in embedded forms and dialogs.
AC-003: Library/demo/Storybook and packed consumer compile; migrated MFE tests/build pass against the local package preview.
Release integration: publish producer first, align shell/remote package locks and strict singleton versions with the actual release, then verify hosted behavior. No guessed release number.
