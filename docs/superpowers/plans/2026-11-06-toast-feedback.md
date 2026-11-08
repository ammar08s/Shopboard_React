# Toast feedback implementation plan

**Goal:** Explain the result of user actions with reusable, accessible notifications using existing React and plain CSS.

**Architecture:** Shared toast types, reducer, timer lifecycle, and useToasts own notifications. App keeps the queue mounted across navigation and passes a typed notification callback into feature actions/forms. ToastRegion renders up to three Toast components; each Toast manages its timer and pause state. Feature hooks report actual mutation/storage outcomes.

**Spec:** design.md, action feedback. No new dependency or external component.

## Tasks

- [x] Write/run failing tests for bounded/deduplicated queues, dismissal, timed dismissal, persistent errors, and timer cleanup.
- [x] Implement shared Toast/ToastRegion, queue hook and timer module. Use success/error/info variants, dismiss controls, polite/assertive announcements, six-second success/info timers, paused timers on hover/focus, and reduced-motion CSS.
- [x] Integrate cart add/quantity/remove/clear and limits/storage errors; admin create/update/delete/category deletion and validation/cancellation; login/logout and retry feedback. Preserve inline actionable validation and request states without duplicate success announcements.
- [x] Update README component tree, props/state ownership and design.md. Review touched code with React/composition/code-simplifier guidance. All 32 tests, lint, build, formatting and render checks pass. Browser inventory was rechecked and still reports an unavailable host; live UI, responsive/assistive-technology interaction, and React DevTools checks remain unverified.

Errors remain until dismissed or evicted by newer notifications. Repeated identical messages replace the older copy. Notifications do not persist or take keyboard focus. Existing local changes and feature boundaries are preserved. No commits or branch changes requested.

## Review record

Independent read-only review identified an Important live-region issue. Fixed it by keeping empty polite/status and assertive/alert containers mounted from startup, with separately tracked announcement events and keyed content for repeated actions. Added a regression observed RED then GREEN so dismissal cannot re-announce older messages. The minor short-viewport finding was addressed with newest-first visual ordering. Render checks verify mounted announcement containers, error content, ordering, dismiss controls, View cart action, admin wiring, and all 24 component paths in README.
