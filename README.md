# Tire Special & Auto Repair — Website

A static multi-page website for Tire Special & Auto Repair (Tampa, FL). Plain HTML, CSS and JavaScript — no build step, no framework. Ready to deploy to GitHub Pages.

## Pages
- `index.html` — Home
- `tires.html` — Tires
- `services.html` — Auto Services
- `promotions.html` — Promotions
- `book.html` — Book an appointment (client-side form)
- `contact.html` — Contact & map
- `privacy.html` — Privacy Policy

## Shared files
- `assets/site.css` — all styling (light/dark theme via CSS variables)
- `assets/site.js` — injects the shared header/footer, mobile menu, tire-size finder, booking form, and scroll animations
- `theme.js` — light/dark mode: auto by time of day, manual toggle, remembered per visitor
- `assets/` — logos (`logo-light.png`, `logo-dark.png`) and photos

## Third-party
Google Fonts and GSAP are loaded from CDNs.

## Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. In **Settings → Pages**, set **Source** to the `main` branch, root (`/`).
3. The site publishes at `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub serves all files as-is.

## Local preview
Open `index.html` directly, or run a static server:

```
python3 -m http.server
```

then visit http://localhost:8000
