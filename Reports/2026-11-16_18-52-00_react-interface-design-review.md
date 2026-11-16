# React Interface Design Review

**Date:** 2026-11-16  
**Scope:** Read-only review before redesign; no application files changed.

## Review scope and method

Reviewed the seven public routes in the existing React/Vite preview: Home (`/`), Tires, Services, Promotions, Book, Contact, and Privacy. Inspected shared chrome, React components, page fragments, theme and site CSS, service adapter, Vite configuration, package metadata, and available assets. Read the three requested migration reports. The repository has no separate design-system, PRD, app-flow, or frontend-guidelines documents.

Started the local app with `npm run dev -- --host 127.0.0.1`; preview URL: `http://127.0.0.1:5173/`.

Loaded each route at 320, 390, 768, and 1440 CSS pixels (900px height for the route sweep), measuring document/body widths and page landmarks. Also opened the mobile navigation, switched theme, opened Ask a Mechanic, and submitted the appointment form empty. These are browser-observed checks; this was not a full accessibility or visual-regression test. No screenshots were retained with this report.

## Findings (prioritized)

### High — shared layout overflows at 320px

- **Page/component:** All seven pages; shared `SiteHeader` / `.head-actions`.
- **Evidence:** At a 320px viewport, every route measured 358px document and body width. On Home, the shared action group reaches x=358; the hamburger reaches x=358 (viewport ends at x=320). At 390, 768, and 1440px, the route sweep measured no horizontal document overflow.
- **Customer impact:** On the narrowest common phone width, the page can be horizontally scrollable and the menu control extends beyond the viewport, making navigation harder to discover/use.
- **Priority:** High.
- **Later direction:** Rework the narrow-header layout and minimum-width behavior; verify the whole shared shell at 320px, not just the main content. Avoid relying on body-level overflow clipping to conceal it.

### Medium — visual hierarchy is built from repeated inline styles

- **Page/component:** All content pages; `src/pages/*.html` and `assets/site.css`.
- **Evidence:** Route fragments carry extensive per-element inline layout, type, and color values; several informational routes reuse nearly identical breadcrumb/hero markup. The site CSS is a single minified line. This is a code-based consistency observation, not a claim of pixel-level visual mismatch.
- **Customer impact:** Related pages may be harder to keep visually consistent and responsive as content changes; spacing and type refinements are more difficult to apply coherently.
- **Priority:** Medium.
- **Later direction:** Establish a small set of reusable page/section patterns and design tokens, then migrate styles incrementally while retaining recognizable brand character and page-specific content.

### Medium — booking validation relies on custom client-side feedback

- **Page/component:** Book; `Booking.jsx`.
- **Evidence:** Browser-observed empty submission kept the booking page in place. Source inspection confirms only trimmed name and phone are checked in React; missing values reveal an inline error, and a valid-looking submission produces a local confirmation rather than sending an appointment. The inspected form fields do not declare native `required` attributes.
- **Customer impact:** Customers may interpret the confirmation as a booked appointment unless the local-only nature and phone confirmation are unmistakable. Custom-only validation can also be less robust for assistive technology if errors are not announced/focused.
- **Priority:** Medium.
- **Later direction:** Make the request-versus-confirmation distinction prominent and ensure required fields, inline errors, focus handling, and status announcements are clear. Keep the existing limitation explicit until a real submission endpoint is in scope.

### Low — mobile menu duplicates navigation links in the DOM

- **Page/component:** Shared header; `SiteChrome.jsx`.
- **Evidence:** At 390px, the menu button opened and `aria-expanded` became `true`. The rendered navigation then exposed both the six standard-case links and a second six-link uppercase set. This is a browser snapshot observation; whether assistive technology announces both depends on the hidden-state styling/semantics and was not exhaustively tested.
- **Customer impact:** Duplicate navigation can create extra focus stops or confusing announcements if both sets are exposed while the menu is open.
- **Priority:** Low.
- **Later direction:** Prefer one semantic navigation list with responsive presentation; verify closed/open focus order and screen-reader exposure.

### Low — development preview reports a missing favicon

- **Page/component:** Shared document shell / static assets.
- **Evidence:** Initial Home load logged a 404 for `/favicon.ico`. No other application console error was identified in the inspected initial log; React DevTools informational messages are development-only.
- **Customer impact:** Usually minor; browser tab identity may lack a site icon, and the console is noisy in development.
- **Priority:** Low.
- **Later direction:** During a separate assets pass, either provide the intended favicon or remove/repoint the stale request.

## Behaviors and design worth preserving

- The seven existing `.html` routes remain directly addressable, with page-specific titles and familiar shared header/footer navigation.
- Shared theme control is present, and the browser interaction changed the document theme to light. The exact initial-theme schedule/storage behavior is implemented in `SiteChrome.jsx`.
- The 390px mobile menu opens and reports expanded state; retain the direct access to all six public destinations.
- Booking communicates that the shop will call to confirm and that no payment is needed; keep that reassurance while clarifying that the current React flow is local-only.
- Ask a Mechanic opens a labeled modal dialog with example prompts and a disabled Diagnose button when empty. Source inspection shows Escape handling, focus containment/restoration, and symptom clarification states; only the empty dialog was exercised in this review.
- Keep the existing business contact details, service-oriented information, and the recognizable high-contrast yellow/charcoal brand palette as redesign inputs.

## Coverage and limitations

- **Routes/viewports:** All seven routes loaded at 320, 390, 768, and 1440px; route sweep measured layout widths and top-level landmarks. The detailed 320px overflow-element inspection was on Home; the same 358px document width was measured on all routes.
- **Interactions:** Mobile menu open at 390px; theme toggle clicked; Ask a Mechanic opened and inspected in its empty state; Book empty submit clicked. Tire finder, API result/error states, populated booking success/reset, mechanic diagnosis/clarification, keyboard-only traversal, reduced-motion behavior, and focus visibility were not fully tested.
- **Assets:** Files were inventoried, but a complete visual audit of every image, crop, contrast pair, and loading state was not performed. Early image `naturalWidth` checks can report lazily loaded or theme-hidden logo variants; those were not treated as confirmed missing assets.
- **Console:** The observed favicon 404 is separate from application behavior; no backend/API requests were deliberately exercised.
- No automated accessibility audit, screen-reader test, cross-browser check, or comparison against a baseline screenshot was performed. Browser automation timings and DOM measurements are evidence, not a substitute for a human visual review of every scroll position.

## Recommendation for the next design phase

Start with the shared 320px header/overflow issue, then define typography, spacing, and reusable page-section patterns across the seven existing routes. Preserve route/content behavior and the brand palette while separately specifying accessible menu, booking feedback, and dialog states. Agree on the redesign direction before implementing it; this review makes no redesign changes.

## Verification and changes

- Read-only inspection only; no application, style, content, dependency, configuration, or backend changes were made.
- Local Vite preview was used for route and interaction checks; all seven routes returned their expected page titles and an `h1` in the route sweep.
- This report is the sole file created for this review task.
- Not committed, pushed, or deployed.
