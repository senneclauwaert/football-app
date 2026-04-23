# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack football club app for **Toekomst Relegem** (Belgian football club). Language: **Dutch**. Color scheme: orange (#FF6200), black, white.

Backend: FastAPI + SQLAlchemy + PostgreSQL. Frontend: React 19 + Vite + Tailwind CSS v4. All services run via Docker Compose.

Features: FotMob-style match center with pitch lineup view, team/player pages (1st team + reserves + U6–U17), full e-commerce fan shop (Mollie payments), club events, and a daily RBFA web scraper.

## Commands

### Docker (recommended)
```bash
docker-compose up        # Start all services (db, backend on :8000, frontend on :5173)
docker-compose down      # Stop all services
```

### Backend (from `/backend`)
```bash
uv pip install           # Install dependencies from pyproject.toml

alembic upgrade head     # Apply DB migrations
alembic downgrade -1     # Rollback last migration
alembic revision --autogenerate -m "description"  # Generate new migration

python seeder.py         # Seed DB with admin user, all 13 teams, sample shop/events
```

### Frontend (from `/frontend`)
```bash
npm run dev              # Dev server at http://localhost:5173
npm run build            # Production build
npm run lint             # ESLint
```

### Testing
```bash
cd backend && pytest tests/
```

## Architecture

### Backend (`/backend/app/`)
- `main.py` — FastAPI app init, CORS, SlowAPI rate limiting, APScheduler startup (daily scraper cron at 02:00), router registration
- `models.py` — 13 SQLAlchemy ORM models (see schema below)
- `schemas.py` — All Pydantic request/response schemas
- `auth.py` — JWT (HS256, 24h), bcrypt, `require_admin` dependency
- `database.py` — SQLAlchemy engine + `get_db` dependency
- `routers/` — teams, players, matches, standings, shop, events, admin (orders + scraper)

### Scraper (`/backend/scraper/`)
- `rbfa_client.py` — HTTP/Playwright client targeting RBFA internal API
- `parser.py` — Extracts matches, standings, lineups from RBFA responses
- `sync.py` — Upserts scraped data into DB using `rbfa_match_id` / `rbfa_team_id` as unique keys
- `scheduler.py` — APScheduler daily cron; also manually triggerable via `POST /api/admin/scraper/run`

### Frontend (`/frontend/src/`)
- `App.jsx` — All route definitions; `<ProtectedRoute>` wraps admin pages (role=admin)
- `context/AuthContext.jsx` — JWT + user state in localStorage; `useAuth()` hook
- `context/CartContext.jsx` — Shop cart state with size tracking per item
- `api/` — One file per domain: `matches.js`, `teams.js`, `shop.js`, `events.js`, `admin.js`
- `pages/` — Public: Home, Wedstrijden (matches), WedstrijdDetail, Ploegen, PloegenDetail, Shop, Afrekenen (checkout), Evenementen. Admin: Dashboard, Wedstrijden, Opstelling (lineup editor), Ploegen, Spelers, Shop, Bestellingen, Evenementen, Scraper
- `components/` — MatchCard, MatchField (SVG pitch), MatchEvents, MatchdaySelector, PlayerAvatar, TeamBadge, ShopCard, CartDrawer, PitchEditor (drag & drop admin lineup), ScraperPanel

### Data Flow
React Query → `src/api/` fetch → FastAPI routers → SQLAlchemy ORM → PostgreSQL

Scraper: APScheduler → `rbfa_client.py` → `parser.py` → `sync.py` → PostgreSQL

### Auth Flow
Admin login → JWT → localStorage → `Authorization: Bearer` header → `get_current_user` → `require_admin`

## Database

13 tables: `users`, `seasons`, `teams`, `players`, `competitions`, `matches`, `match_events`, `match_lineups`, `standings`, `shop_items`, `orders`, `order_items`, `events`, `scraper_runs`.

Key relationships:
- `matches` → `team_id`, `competition_id`, `season_id`
- `match_events` + `match_lineups` → `match_id`, `player_id` (nullable — uses `player_name` string fallback for opponents)
- `match_lineups` has `position_x`/`position_y` (0–100 float) for pitch rendering
- `orders` → `order_items` → `shop_item_id`; `mollie_payment_id` stored for payment webhooks

Teams age groups: `first_team`, `reserves`, `u17`, `u16`, `u15`, `u13`, `u12`, `u11`, `u10`, `u9`, `u8`, `u7`, `u6`

## Environment Variables

```
POSTGRES_DB=toekomstrelegem
POSTGRES_USER=admin
POSTGRES_PASSWORD=...
DATABASE_URL=postgresql://admin:...@db:5432/toekomstrelegem
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MOLLIE_API_KEY=...
VITE_API_URL=http://localhost:8000/api   # frontend .env
```

## E-commerce Flow

Guest checkout → `POST /api/orders/` creates order (pending) + Mollie payment → user redirected to Mollie → Mollie webhook `POST /api/orders/webhook` sets status=paid → confirmation page `/shop/bedankt?order_id=X`
