<p align="center">
  <img src="logo.png" alt="Auction House logo" width="120" />
</p>

# Auction House

A multi‑page auction marketplace built with Vite and Tailwind CSS. Browse active listings, place bids, create your own listings, and manage your profile — fast, mobile‑first, and deploy‑ready.

## Features

* **Browse & search** active listings with sort and pagination
* **Live countdown** ("Ends in …") on cards and detail pages
* **Skeleton shimmers** while content loads (grids + detail page)
* **Authentication** (login/register) with redirect back to the intended page (`?next=`)
* **Create/Edit listings** with media support
* **Profile dashboard** (listings, bids, wins) + credits badge in header
* **Mobile hamburger** navigation (`<details>/<summary>`) with logout
* **Copy‑to‑clipboard share** with a tiny toast
* **SEO helpers** for dynamic titles/descriptions on listing pages

## Prerequisites

* **Node.js** v20+
* **npm**
* A modern browser

## Getting Started

### Installation

```bash
npm install
```

### Running the project (dev)

```bash
npm run dev
```

This starts Vite’s dev server. Open the printed URL, then navigate between pages (e.g. `/index.html`, `/listing.html?id=…`).

### Building for production

```bash
npm run build
```

Outputs a static site in `dist/`.

### Previewing the production build

```bash
npm run preview
```

Serves the `dist/` folder locally so you can sanity‑check before deploying.

## Environment Variables

*No environment variables are required.*

The API endpoints are configured in the source (see `src/config/endpoints.js`). If you want to point the client at a different backend, you can introduce an environment override later (e.g. `VITE_API_BASE_URL`) and read it in your endpoints module.

## Available Scripts

* `npm run dev` — start development server
* `npm run build` — build for production
* `npm run preview` — preview the production build

## Technologies

* **Vite 7** (multi‑page app)
* **Tailwind CSS 4** (utility‑first styling)
* **Vanilla JavaScript**, **HTML**, **CSS**

## Project Structure

```
/
├─ index.html, listing.html, seller.html, profile.html, …
├─ /src
│  ├─ main.js                # entry that routes to per‑page modules
│  ├─ style.css              # Tailwind v4 + small utilities
│  ├─ /pages                 # page controllers (login, register, listing, …)
│  ├─ /ui                    # UI components (cards, header, skeletons, …)
│  ├─ /api                   # API clients (auth, listings, profile)
│  └─ /utils                 # helpers (dates, session, validators, …)
└─ vite.config.js, package.json
```

## Author

* **remylian**

---

### Deployment Notes

* Build with `npm run build` and deploy the `dist/` folder to Netlify/Vercel.
* Absolute links like `/listing.html` work fine on Netlify/Vercel. If you use GitHub Pages under a subpath, switch them to relative links or configure a `base`.
