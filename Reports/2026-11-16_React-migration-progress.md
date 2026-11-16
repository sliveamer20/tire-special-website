# React Migration Progress Checkpoint

**Date:** 2026-11-16  
**Status:** PARTIAL — React/static-render foundation and seven pages are in place; interactive logic is still owned by legacy scripts.

## Completed

- Inspected project instructions, current working tree, all seven original pages, current shared CSS/JS/theme/API files, backend route/controller contract, audit report and latest cleanup report.
- Preserved the two pre-existing deletions under `scraps/`; backend and supplier code were not changed.
- Added React 19, React DOM, `html-react-parser`, and Vite 6.4.6 with a locked dependency tree.
- Kept separate Vite entries for `index.html`, `tires.html`, `services.html`, `promotions.html`, `book.html`, `contact.html`, and `privacy.html`. Each generated static page contains its original content before React hydration; there is no SPA fallback dependency.
- Preserved existing CSS, media, fonts, page titles/descriptions, English language metadata, relative links, theme behavior, and root-level `.nojekyll` marker. Vite copies the unchanged assets and uses relative bundle paths.
- Retained the current tire-search and mechanic scripts through an ordered compatibility loader. No live supplier search was made in testing.
- Updated `README.md` with development/build/preview instructions and the fact that GitHub Pages must publish the build output.

## Verification evidence

- `npm run build`: passed; seven HTML outputs generated. Most recent build output was removed after verification so `dist/` is not left as a generated working-tree artifact.
- `git diff --check`: passed (Git emitted only its standard LF-to-CRLF notice for `README.md`).
- Production-preview browser check: all seven public URLs returned HTTP 200 with title, main content, shared header and footer.
- React-vs-original screenshots are in `Reports/`: `2026-11-16_baseline-home-{320,390,768,1440}.png` and `2026-11-16_react-home-{320,390,768,1440}.png`. The paired PNG file hashes match at all four viewport widths after scrolling to reveal the existing animated sections.
- At 320/390/768/1440 CSS pixels, scroll widths were 363/390/768/1440. Original Git-HEAD baseline measurements were identical; the 320px overflow is a pre-existing shared-header issue.
- Existing tire-search UI was exercised with a local mocked API response: one request, result card and user-visible retail/quantity presentation. The root-route API loader omission discovered during testing was corrected. No live supplier behavior was exercised.
- Booking empty-submit validation and the existing local-only success/reset flow were checked. The mechanic panel opened and a local “brake noise” interaction produced its existing clarification questions.
- Mobile menu navigation, direct `.html` navigation, browser back/forward, relative assets under a simulated `/repo/` subdirectory, and absence of browser page/console errors were checked.

## Files and preservation

- Modified: seven top-level `.html` route shells, `README.md`, `package.json`.
- Added: `package-lock.json`, `vite.config.js`, `src/main.jsx`, seven preserved page-content fragments under `src/pages/`, this checkpoint, final report, and screenshot evidence.
- Removed: no project source files. Existing legacy frontend scripts/CSS remain as the compatibility layer.
- Pre-existing untracked instructions/reports/config and the two tracked `scraps/` deletions were preserved. Nothing was committed, pushed, or deployed.

## Outstanding work — next concrete action

Complete the behavior migration: move header/footer/mobile navigation, theme toggle, tire search (including request, quantity/filter/detail/error states), booking form, mechanic conversation, background loading, and GSAP lifecycle into React components/hooks; then remove only the legacy handlers replaced and verify state/keyboard behavior with fixtures. Add a maintained UI test command and repeat route/base-path/screenshot checks. The new Priority Tire-inspired search, React Bits, backend changes and redesign remain deferred.

## Resume

1. Read this checkpoint and `Reports/2026-11-16_17-49-49_react-frontend-migration-partial.md`.
2. Keep `assets/site.js`, `assets/api.js`, and `assets/mechanic/` untouched until each interaction has a React replacement and regression check.
3. Run `npm install`, `npm run dev`, and `npm run build`; use `npm run preview` after building.
