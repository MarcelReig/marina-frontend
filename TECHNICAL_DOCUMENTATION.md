### Marina Full‑Stack Technical Documentation

#### Overview
Marina is a full‑stack web application composed of a Flask API backend and a React (Vite) frontend. The system provides a portfolio module and a small shop/inventory module, including media upload to Cloudinary and authenticated management areas.

This document explains the architecture, directories, runtime, dependencies, and key design decisions so new developers can contribute quickly.

---

### Repository Layout

- Backend (Flask): `/marina-backend`
  - Entrypoints: `app.py`, `run.py`, `wsgi.py`
  - App package: `app/`
    - `api/` REST blueprints: `auth.py`, `portfolio.py`, `store.py`
    - `services/` integrations: `cloudinary_service.py`, `auth_service.py`
    - `utils/` decorators, validators
    - `templates/` admin views (Jinja)
    - `models/` user model(s)
  - Config: `config.py`, `.flaskenv`, `gunicorn_config.py`
  - Migrations: `migrations/` (Flask-Migrate-ready if added later)
  - Static: `static/` (assets)

- Frontend (React/Vite): `/marina-frontend`
  - Source: `src/`
    - `components/` feature components (portfolio, shop, layout, auth)
    - `context/` auth context + hooks
    - `api/` axios client + base URL resolver
    - `routes/` routing and protected routes
    - `style/` SCSS modules
  - Config/build: `vite.config.js`
  - Static: `public/`

Deployed artifacts for the frontend live under `marina-frontend/dist/` after `vite build`.

---

### Backend: Flask API

- Framework: Flask 2.2
- Persistence: MongoDB via PyMongo (Flask-PyMongo)
- Auth: JWT (Flask-JWT-Extended) + optional session (Flask-Login for admin views)
- CORS: Flask-Cors
- Media: Cloudinary SDK

Key blueprints (in `app/api/`):
- `GET /api/portfolio` → list portfolio items ordered by `display_order` then `_id`
- `GET /api/portfolio/<id>` → fetch single item
- `POST /api/portfolio` (admin) → create; uploads images to Cloudinary; sets next `display_order`
- `PUT /api/portfolio/<id>` (admin) → update; supports base64 or existing URLs
- `PUT /api/portfolio/reorder` (admin) → persist order by sequential `display_order`
- `DELETE /api/portfolio/<id>` (admin)
- `DELETE /api/portfolio/clear-all` (admin)

Store (shop) endpoints mirror portfolio:
- `GET /api/store` | `GET /api/store/<id>`
- `POST /api/store` (admin) | `PUT /api/store/<id>` (admin)
- `PUT /api/store/reorder` (admin)
- `DELETE /api/store/<id>` (admin)

Security
- Admin-only endpoints are protected with `@admin_required` (JWT bearer expected in `Authorization` header). Refresh token support is wired on the frontend.

Configuration
- `config.py` and environment variables define Mongo URI, JWT secrets, Cloudinary credentials, and CORS origins.

---

### Backend Dependencies (requirements.txt)

- Flask, Werkzeug, Jinja2, Click
- Flask-Cors
- Flask-JWT-Extended, PyJWT
- Flask-PyMongo, pymongo, dnspython
- Flask-Login, Flask-WTF, WTForms
- python-dotenv
- cloudinary
- requests
- gunicorn (production server)

See `/marina-backend/requirements.txt` for exact versions.

---

### Frontend: React Application

- Build tool: Vite 5
- Framework: React 18
- Router: React Router v6
- Styling: SCSS modules compiled via `sass`
- HTTP: axios instance with interceptors for JWT auth/refresh
- DnD: Atlassian Pragmatic Drag & Drop (element adapters)
- UX: react-hot-toast for notifications, react-dropzone for file uploads
- Media: yet-another-react-lightbox, react-photo-album (for galleries)

Folder highlights
- `src/components/portfolio/`
  - `PortfolioContainer.jsx` (list/home)
  - `PortfolioItem.jsx` (card)
  - `PortfolioSidebarList.jsx`, `PortfolioForm.jsx` (manager)
- `src/components/shop/`
  - `InventorySidebarList.jsx`, `InventoryForm.jsx`
- `src/context/` Auth context and hooks
- `src/api/http.js` axios client; `src/api/base.js` environment-based API URL
- `src/routes/` guarded routes for admin areas

Runtime configuration
- `.env` variables (Vite) expected:
  - `VITE_FLASK_API_DEV_URL` (dev) or `VITE_FLASK_API_URL` (prod) pointing to Flask base; code ensures `/api` suffix.

---

### Frontend Dependencies (package.json)

Runtime:
- `react`, `react-dom`
- `react-router-dom`
- `axios`
- `sass`
- `prop-types`
- `react-hot-toast`
- `react-dropzone`
- `@fortawesome/*` (icons)
- `@atlaskit/pragmatic-drag-and-drop*` (DnD)
- `yet-another-react-lightbox`, `react-photo-album`

Dev:
- `vite`, `@vitejs/plugin-react`
- `eslint` + react plugins
- `@types/react`, `@types/react-dom`

---

### Drag & Drop (Pragmatic DnD)

- Both portfolio and inventory sidebars implement drag handles, item drop targets, and a global monitor.
- Reorder mapping accounts for filtered views and persists full ordered ID list to the backend via `PUT /reorder`.
- Visual feedback via data attributes (`data-is-drag-over`, `data-is-drop-target`), styled in SCSS.
- Native browser drag of images disabled (`draggable={false}` + CSS) and global `dragover/drop` suppression to avoid the copy cursor outside targets.

References
- Pragmatic Board example and guidelines inspired the implementation.

---

### Authentication Flow

- JWT access token stored in `sessionStorage` (`token`) and refresh token (`refresh_token`).
- Axios interceptor attaches `Authorization: Bearer <token>` to requests.
- On 401, attempts refresh token flow via `/token/refresh` (backend endpoint expected) and retries once; otherwise redirects to `/auth`.

---

### Media Uploads

- Portfolio: thumbnail and gallery accept base64 strings (from `react-dropzone`) and upload to Cloudinary.
- Update flow supports mixing existing URLs and new base64 images.
- Store: single product image upload to Cloudinary.

---

### Local Development

Backend
- Create virtualenv / use `.venv` (optional).
- Install deps: `pip install -r requirements.txt`.
- Set environment variables (Mongo, JWT secret, Cloudinary keys). See `config.py`.
- Run: `flask run` (or `python run.py`) bound to configured host/port.

Frontend
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build` → outputs `dist/`

---

### Deployment Notes

- Backend: gunicorn using `wsgi.py`. Ensure environment variables configured on the host. Reverse proxy (NGINX) should forward to gunicorn.
- Frontend: static hosting of `dist/` (e.g., Vercel/Netlify or NGINX). Configure API base URLs via environment variables.

---

### Testing & Linting

- Frontend: ESLint configured via `.eslintrc.cjs`.
- Backend: tests directory scaffolded (`/marina-backend/tests/`). Add pytest or unittest as needed.

---

### Pending Work: Stripe Payments

Goal: Accept payments for store items.

Proposed architecture
- Backend (Flask):
  - Add `stripe` SDK and environment variables (secret/public keys).
  - Endpoints:
    - `POST /api/checkout/session` → create Checkout Session (line items, success/cancel URLs).
    - `POST /api/webhooks/stripe` → handle events (payment_intent.succeeded, checkout.session.completed).
  - Secure webhook endpoint with Stripe signature verification.

- Frontend (React):
  - Add `@stripe/stripe-js` and `@stripe/react-stripe-js`.
  - Create Checkout button/component that calls backend to create a session and redirects to Stripe Checkout.
  - Success/Cancel routes to display status.

Data considerations
- Store items should include a stable `price` in smallest currency unit (e.g., cents) and optional `stripe_price_id` if using predefined prices.
- Order records (optional) for reconciliation.

---

### Roadmap / Improvements

- Access control: granular roles and per-endpoint authorization policies.
- Validation: stronger request validation (pydantic or marshmallow) and consistent error payloads.
- Observability: structured logging, request IDs, and error reporting (Sentry).
- Caching: CDN for images, HTTP cache headers for public GET endpoints.
- Pagination and search on public lists.
- Image processing: generate responsive sizes/thumbnails via Cloudinary transformations.
- A11y: keyboard DnD support and improved focus states.
- Testing: e2e tests (Playwright) and API tests (pytest + Flask testing client).
- CI: lint + tests on push; build previews for frontend.

---

### Appendix: Environment Variables (suggested)

Backend
- `MONGO_URI`, `JWT_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (pending)

Frontend (Vite)
- `VITE_FLASK_API_DEV_URL`
- `VITE_FLASK_API_URL`

---

If anything is unclear or missing, open an issue or ping the maintainers.
