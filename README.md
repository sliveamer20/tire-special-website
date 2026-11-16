# Tire Special & Auto Repair — Website

A React-powered, multi-page website for Tire Special & Auto Repair (Tampa, FL). Vite builds each existing `.html` route independently, keeping the page copy in the static output while React takes ownership of the shared shell and interactions. Direct links and static hosting do not require an SPA fallback.

## Pages
- `index.html` — Home
- `tires.html` — Tires
- `services.html` — Auto Services
- `promotions.html` — Promotions
- `book.html` — Book an appointment (client-side form)
- `contact.html` — Contact & map
- `privacy.html` — Privacy Policy

## Frontend
- `src/main.jsx` — React entry, shared page shell, and animation lifecycle.
- `src/pages/` — the original page content fragments, included in each HTML output and parsed into React elements at runtime.
- `src/components/` — React-owned site chrome, tire finder, booking flow, and Ask a Mechanic dialog.
- `src/data/` — local mechanic symptom/scenario data and diagnosis engine.
- `src/services/tireSearch.js` — isolated adapter for the existing public tire-search endpoint.
- `assets/site.css` — existing presentation styles, retained for visual compatibility.
- `assets/` and root-level images — existing logos, photos, icons and search styles.

The frontend keeps the existing tire-search GET contract and public API-origin override. It does not change the backend or supplier behavior. The current booking interface is still client-side only; submitting it does not send an appointment request. Ask a Mechanic uses the retained local knowledge base and rule-based diagnosis module.

## Local development
Install the frontend dependencies and start Vite:

```sh
npm install
npm run dev
```

Create and preview the static production build:

```sh
npm run build
npm run preview
```

Vite writes all seven routes and their assets to `dist/`. Publish that generated directory with the existing static host's supported build-output configuration. No server-side route fallback is needed.

## Third-party
Google Fonts are loaded from Google Fonts. GSAP is installed locally and used for page reveals with a reduced-motion check and React cleanup.

## GitHub Pages
The existing `.nojekyll` marker is retained. GitHub Pages must serve the Vite build output (`dist/`) rather than the unbuilt source directory; the repository does not include a Pages workflow or verified hosted Pages settings. The Vite build uses relative asset URLs for repository subpaths.

`.nojekyll` is included so GitHub serves all files as-is.

## Local preview
Use `npm run dev` for development or `npm run build && npm run preview` for production-output preview.
