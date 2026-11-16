# React Frontend Migration — Partial Handoff

**Date:** 2026-11-16  
**Status: PARTIAL.** The existing seven-page site now has a React hydration/static-output foundation, but not all frontend behavior has been migrated out of legacy JavaScript. This is not reported as a complete React migration.

## Original and selected architecture

The original frontend was a static seven-page HTML site with a shared stylesheet, a theme initializer, a minified shared DOM-manipulating script, a separate tire API wrapper, and three local Ask a Mechanic scripts. The backend is a separate Express service. Navigation uses relative links to `.html` URLs; the README described GitHub Pages branch-root hosting, and `.nojekyll` is present. No sitemap, robots file, canonical URL, JSON-LD, language switcher, Pages workflow, or host-specific fallback configuration was found in the inspected tree.

The migration uses **Vite multi-page static output plus React 19 hydration**, not client-side routing. This keeps each current `.html` route and direct-refresh behavior and does not require a host rewrite. Existing page text/markup is retained as page fragments, parsed into React elements with `html-react-parser`, and inserted into each static HTML output before hydration. Original CSS and external fonts/GSAP are preserved. Existing runtime media/scripts are copied into `dist/`; relative URLs support repository subpaths.

This is a transition foundation, not a finished component/state migration: the shared React page shell hydrates the content, while the existing `assets/site.js`, `assets/api.js`, and `assets/mechanic/` code still performs important UI changes and interaction handling. Those scripts are loaded once in sequence after hydration for compatibility. The next phase must transfer those responsibilities into React components/hooks before the legacy handlers are removed.

## Dependency/tooling decisions

- Added React and React DOM **19.3.1**, `html-react-parser` **5.2.17**, and Vite **6.4.6**; `package-lock.json` uses lockfile v3.
- Kept the pre-existing `lenis` dependency; it is not newly integrated.
- Vite is a build tool only; no new frontend framework, router, backend, or supplier integration was added.
- Relative build URLs and multiple HTML entrypoints preserve `.html` routes and support a static host with no SPA fallback.
- The build prints a Vite advisory that the retained classic `theme.js` script cannot be bundled as a module; it is deliberately copied and referenced as the original classic script. This warning did not prevent the build or preview checks.

## Route migration matrix

| Public URL | React/static output | Existing behavior status |
|---|---|---|
| `/` and `/index.html` | `index.html` entry and home fragment | Content and tire finder preserved; shared interactions remain legacy-backed |
| `/tires.html` | independent page entry | Content and tire finder preserved; shared interactions remain legacy-backed |
| `/services.html` | independent page entry | Content preserved; shared interactions remain legacy-backed |
| `/promotions.html` | independent page entry | Content preserved; shared interactions remain legacy-backed |
| `/book.html` | independent page entry | Content, validation, and existing local-only success/reset flow preserved |
| `/contact.html` | independent page entry | Contact, email, telephone, map and directions content preserved |
| `/privacy.html` | independent page entry | Policy content preserved |

All seven generated routes returned HTTP 200 in local production-preview checks. Direct `.html` navigation and browser back/forward were exercised. No client-side route fallback is used.

## Files changed, added, and removed

- **Modified:** `index.html`, `tires.html`, `services.html`, `promotions.html`, `book.html`, `contact.html`, `privacy.html` (original head metadata retained; main content moved to React source fragments and build root inserted); `README.md`; `package.json`.
- **Added:** `package-lock.json`; `vite.config.js`; `src/main.jsx`; `src/pages/{index,tires,services,promotions,book,contact,privacy}.html`; progress checkpoint; screenshot evidence; this report.
- **Removed:** no source files. Legacy styles, API wrapper, mechanic scripts, and original media are retained because they remain referenced/needed.
- `dist/` was generated for build and browser checks, then removed; `npm run build` recreates it.
- The two pre-existing deletions `scraps/mob-finder.png` and `scraps/tp-finder-mobile.png` remain deleted; no other pre-existing work was reverted or discarded.

## Functionality preserved and evidence

- Existing page content, fonts, CSS, layouts, images, image backgrounds, theme, responsive rules, navigation, contact links, map iframe/directions, and existing reveal animations are retained.
- Existing tire search contract remains GET `/api/tires/search?width=…&ratio=…&diameter=…`, with the existing API origin selection and response handling. A local mock was used for a search check; the UI made one request and rendered a result with the existing quantity/price presentation. Live supplier behavior was not tested, and repeated live requests were avoided.
- Ask a Mechanic still calls the existing local diagnosis engine. Local browser check opened the dialog and a “brake noise” input presented the current clarification questions. Full conversation branches and diagnosis safety/content were not retested.
- Booking validation and the existing local success/reset behavior were exercised. As noted in the pre-existing audit, the page does **not** submit a booking request to the shop; this migration did not invent or imply a backend contract.
- Mobile menu navigation, back/forward navigation, and basic subdirectory hosting were exercised.
- No backend files, pricing rules, supplier credentials, supplier session data, or server configuration were changed. Newly added frontend/report content contains no credentials, tokens, supplier sessions, wholesale prices, or secret configuration. `TS_API_BASE` behavior remains public frontend configuration with the existing Railway fallback; no private environment values were bundled.

## Visual comparison and responsive evidence

Original-state screenshots were captured from the committed HTML (`git show HEAD:<page>`) and unchanged site assets, then compared with the React production preview after scrolling through existing reveal sections:

| Viewport | Before | After | PNG SHA-256 match |
|---:|---|---|---|
| 320px | [baseline](2026-11-16_baseline-home-320.png) | [React](2026-11-16_react-home-320.png) | Yes |
| 390px | [baseline](2026-11-16_baseline-home-390.png) | [React](2026-11-16_react-home-390.png) | Yes |
| 768px | [baseline](2026-11-16_baseline-home-768.png) | [React](2026-11-16_react-home-768.png) | Yes |
| 1440px | [baseline](2026-11-16_baseline-home-1440.png) | [React](2026-11-16_react-home-1440.png) | Yes |

The identical screenshots establish visual equivalence for those captured home-page states; they do not validate every interaction, page, device, or animation timing. At 320px, both baseline and migrated pages have `scrollWidth=363` due to the pre-existing shared header `.head-actions` overflow. Other measured document widths were 390, 768, and 1440 at their matching viewports. The existing overflow was documented, not redesigned in this task.

## Build, checks and performance notes

- `npm run build` — **passed**; generated all seven static `.html` files and relative assets. Vite output showed shared React/parser JS at 260.36 kB (81.77 kB gzip) plus page-content chunks; the first combined page bundle was reduced by splitting page content. Original frontend was not bundled as one comparable production artifact, so no complete performance equivalence claim is made; React adds client JS compared with the former static markup.
- `git diff --check` — **passed**; Git printed only a line-ending notice for `README.md`.
- Browser route smoke — **passed** for all seven URLs; 200 responses, existing titles/main content, shared header/footer; no page/console errors in the tested production-preview flow.
- Fixture-based tire search — **passed for the exercised success path**; one mocked request, result card and price/quantity presentation. Empty/error/retry states, all filters/detail dialogs, and keyboard operation were not exhaustively tested.
- Booking — empty validation and existing local success flow checked; the success state remains non-persistent and is not a delivered appointment.
- Mechanic — drawer and first clarification flow checked; complete round limits and all diagnosis outcomes not exhaustively tested.
- Subdirectory simulation — `/repo/` and `/repo/tires.html` loaded React, media and relative assets without failed requests.
- No maintained frontend test suite or CI gate was introduced. No live supplier request was issued.

## SEO, language and hosting

Existing document titles, descriptions, `lang="en"`, viewport metadata, font links and route-specific static HTML content remain in the generated pages. No existing canonical, structured data, robots directive, or sitemap reference was found to preserve. The original site is English-only in the inspected pages; no bilingual functionality is claimed or added.

The build emits static multi-page output in `dist/` with the `.html` paths and relative resources intact; it requires no server fallback. The README now explains that the host must publish the generated `dist/` output. The repository documents branch-root GitHub Pages as its previous workflow but contains no build/deployment workflow, and actual hosted Pages settings were not inspected or changed. No deployment was performed.

## Pre-existing defects and remaining work

- The appointment form’s success is local-only; no request reaches the shop (`Reports/PROJECT_AUDIT_REPORT.md`, BUG-001).
- The audit records known mechanic safety-priority, contradictory-content, and clarification limitations (BUG-005–009). They were not changed or expanded here.
- The 320px shared-header overflow predates the migration and remains.
- Main interactions are not yet React-owned; the current compatibility loader still lets legacy scripts mutate the hydrated DOM. Migrate navigation/footer, theme, search states/filter/details, mechanic conversation, booking UI, background loading and animation lifecycle into components/hooks, with request/listener cleanup and fixture tests.
- Verify keyboard/focus behavior, search validation/error/retry, quantity tiers and filters, all mechanic round/result branches, all-page responsive states, and production host publishing of `dist/` before calling the migration complete.

## Local commands and handoff

```sh
npm install
npm run dev
# Production static build and local preview
npm run build
npm run preview
```

Next, migrate legacy interaction ownership one feature at a time while retaining each compatibility script until its React replacement passes regression checks. Do not change backend/supplier code without separately demonstrated need.

**Priority Tire-inspired search redesign and React Bits remain deferred.** No dashboard/CMS, new supplier integration, backend rewrite, or visual redesign was started. **Nothing was committed, pushed, or deployed.**
