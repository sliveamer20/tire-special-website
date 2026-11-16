# React Frontend Migration — Completion Report

**Date:** 2026-11-16  
**Status:** COMPLETE for the requested frontend migration. The existing public API and backend are unchanged.

## React-owned behavior

- Shared header, footer, active navigation, responsive menu, theme toggle, and `tsTheme` persistence now live in `src/components/SiteChrome.jsx` and `ThemeProvider`.
- Home and Tires finders, validation-by-existing-API behavior, loading/error/empty/result views, quantity-specific retail display, sorting, filters, and keyboard-operable tire details now live in `src/components/TireSearch.jsx`. The fetch boundary is isolated in `src/services/tireSearch.js`; in-flight requests are abortable and duplicate concurrent submissions are guarded.
- The booking form, required name/phone validation, local confirmation, and reset flow are React-controlled in `src/components/Booking.jsx`. It remains client-side only and does not submit appointments.
- Ask a Mechanic now uses React conversation state, clarification answers, diagnosis cards, and dialog lifecycle in `src/components/MechanicAssistant.jsx` and `src/data/diagnosisEngine.js`. The 78 symptom groups and 76 scenarios were retained as module data in `src/data/mechanic-knowledge-base.js`.
- Background images use an `IntersectionObserver` with effect cleanup. GSAP hero/section reveals use the installed local package, respect reduced-motion preference, and are reverted on unmount.
- `src/main.jsx` owns all page composition and parsing. The seven independent `.html` routes and static-host/no-fallback approach remain in place.

## Legacy script disposition

Removed after replacing their active UI behavior:

- `assets/site.js` — shared shell injection, finder/results, booking handlers, backgrounds, and reveals are now React-owned.
- `assets/api.js` — replaced by the isolated adapter `src/services/tireSearch.js`.
- `assets/mechanic/ui.js` and `assets/mechanic/diagnosis-engine.js` — replaced by React conversation/dialog and the ES-module diagnosis engine.
- `assets/mechanic/knowledge-base.js` — its data was moved to `src/data/mechanic-knowledge-base.js`; the global script was removed.
- `theme.js` — theme variables are in `src/theme.css`; theme state and persistence are React-owned.

No legacy frontend scripts remain in the active pages or Vite copy configuration. The only active page script is the Vite React module entry. `assets/site.css` remains as presentation CSS, not a script or event-handler dependency. Historical reports still mention the removed files when describing past architecture; those are archival references only.

## API/backend boundary

The browser still issues the existing read-only `GET /api/tires/search?width=…&ratio=…&diameter=…` request. `window.TS_API_BASE` and the existing public fallback origin remain supported. All search interaction checks used local browser route mocks; no live supplier request was made. No backend, supplier, pricing-rule, credential, or server-configuration files were changed. The browser bundle contains no supplier credentials or wholesale pricing rules.

## Files changed

- React entry and components: `src/main.jsx`, `src/components/SiteChrome.jsx`, `src/components/TireSearch.jsx`, `src/components/Booking.jsx`, `src/components/MechanicAssistant.jsx`.
- React data/service/styles: `src/data/diagnosisEngine.js`, `src/data/mechanic-knowledge-base.js`, `src/services/tireSearch.js`, `src/theme.css`.
- Build/docs/dependencies: `vite.config.js`, `README.md`, `package.json`, `package-lock.json`.
- Removed the `theme.js`, `assets/site.js`, `assets/api.js`, and three `assets/mechanic/*.js` legacy files.
- Removed the `theme.js` reference from all seven root HTML pages. Backend files and the pre-existing `scraps/` deletions were left untouched.

## Verification performed

- `npm run build` — passed after the final source changes; Vite produced all seven static pages.
- `npm uninstall lenis` — removed the unused dependency; package audit reported 0 vulnerabilities. GSAP 3.12.5 is installed locally.
- Production preview via `npm run preview -- --host 127.0.0.1`:
  - Opened `/`, `/index.html`, `/tires.html`, `/services.html`, `/promotions.html`, `/book.html`, `/contact.html`, and `/privacy.html` directly; all showed the expected page heading and shared React shell.
  - Browser back/forward navigation worked between Home and Tires. Mobile navigation opened and closed after route selection.
  - Theme toggle changed the root theme. Reduced-motion preference was detected and the reveal animation setup was skipped.
  - Booking validation, local success message/name rendering, and reset behavior passed.
  - A local mock returned tire results; quantity changed the displayed tier price, details opened as an accessible dialog, and Escape closed it. Separate mocks exercised empty and HTTP-error states. The error case made one API request; no duplicate request was observed.
  - Ask a Mechanic produced clarification questions for the mocked `shimmy` prompt; answering a question rendered a diagnosis. Dialog focus moved to the composer and returned to the trigger after Escape.
  - A copied static build served at `/repo/` loaded `/repo/`, `/repo/tires.html`, and `/repo/book.html` with no failed asset requests.
  - Browser console had no application errors in the final clean run. The intentionally mocked HTTP 500 produced its expected error state.
- Screenshot review compared the existing baseline images with current full-page captures at 320, 390, 768, and 1440px after animations and image loading settled. The page content and layout were visually consistent at all four widths; 768px and 1440px were particularly close to the baseline.
- 320px horizontal overflow remains (measured document width 363px at a 320px viewport). The previous migration checkpoint already documented baseline overflow at 320px; it was not redesigned as part of this behavior migration. At 390, 768, and 1440px, no horizontal overflow was measured.
- Repository checks found no active references to the removed loaders, no inline page event handlers, and no remaining old mechanic globals in `src/`.

No automated test script is currently defined in `package.json`; the above interaction checks were performed in the production preview with browser automation and local API mocks.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Deferred / remaining

- Priority Tire-style search redesign, React Bits, visual redesign, dashboard/CMS, hosting migration, and new supplier integrations remain deferred.
- Existing 320px horizontal overflow remains as noted above.
- Booking intentionally remains a local-only confirmation flow; adding backend appointment submission requires a separate backend task.
- No commit, push, or deployment was performed.
