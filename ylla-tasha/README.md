# Ylla Tasha | يلا طشة — Independent HTML Pages

This version contains **real independent HTML files**. Each page includes its actual markup; no React, TypeScript, Vite, or client-side component-rendering runtime is required.

## Pages
- `index.html` — Home
- `discover.html` — Discover Jordan
- `stay-dine.html` — Stay & Dine
- `out-about.html` — Out & About
- `celebrate-jordan.html` — Celebrate Jordan
- `go-with-me.html` — Go With Me
- `trip-planner.html` — Trip Planner
- `place-details.html` — Place details (Petra demo)
- `my-account.html` — Account
- `admin-dashboard.html` — Admin dashboard

## Assets and styling
- `css/style.css` — original Figma-derived visual styling
- `css/improvements.css` — larger typography and anchor navigation styles
- `js/site.js` — shared vanilla JavaScript behaviors
- `jordan/` and `public/assets/` — original images and icons

## Run
Open the project with VS Code and **Live Server**, then open `index.html`. A local server is recommended for consistent asset loading.

## Important limits
The HTML pages were derived from the current frontend demo, so they preserve its visual markup and CSS classes, but **not every React demo interaction has a working vanilla equivalent yet**. Navigation, mobile menu, favorites and simple filters are implemented; complex trip planning, account operations, booking and admin actions require additional JavaScript and backend integration. Live APIs and databases are not connected. The project should be visually compared with the Figma preview before claiming pixel-perfect fidelity.
