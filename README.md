# Toekomst Relegem — Club App

Full-stack web app for **Toekomst Relegem**, a Belgian football club. Built as a digital home for the club: live match data, team pages, a fan shop, and a daily scraper syncing results from the RBFA.

## Features

- **Match center** — FotMob-style match detail pages with pitch lineup view, match events, and live scores
- **Teams & players** — pages for all 13 squads (1st team, reserves, U6–U17)
- **Fan shop** — full e-commerce with cart, checkout, and Mollie payment integration
- **Club events** — event listings and detail pages
- **Admin dashboard** — manage matches, lineups (drag & drop pitch editor), players, teams, orders, and trigger the scraper manually
- **RBFA scraper** — daily cron job that syncs match results, standings, and lineups from the official Belgian football federation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 15 |
| Auth | JWT (HS256), bcrypt |
| Payments | Mollie API |
| Scraper | Python, Playwright, APScheduler |
| Infra | Docker Compose, Nginx |

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 20+ (for local frontend dev without Docker)
- Python 3.11+ with [uv](https://github.com/astral-sh/uv) (for local backend dev without Docker)

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/senneclauwaert/football-app.git
cd football-app

# 2. Copy the example env file and fill in your values
cp .env.example .env

# 3. Start all services (db, backend on :8000, frontend on :5173)
docker-compose up

# 4. Apply database migrations (first run only)
docker-compose exec backend alembic upgrade head

# 5. Seed the database with teams, admin user, and sample data
docker-compose exec backend python seeder.py
```

The app will be available at `http://localhost:5173`. The API is at `http://localhost:8000/api`.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
POSTGRES_DB=toekomstrelegem
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_password

DATABASE_URL=postgresql://admin:your_password@db:5432/toekomstrelegem
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

MOLLIE_API_KEY=your_mollie_key

DOMAIN=your_domain                  # production only
VITE_API_URL=http://localhost:8000/api  # frontend
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, scheduler, routers
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # JWT + bcrypt
│   │   └── routers/         # teams, players, matches, shop, events, admin
│   ├── scraper/
│   │   ├── rbfa_client.py   # HTTP/Playwright client for RBFA API
│   │   ├── parser.py        # Extracts matches, standings, lineups
│   │   ├── sync.py          # Upserts scraped data into DB
│   │   └── scheduler.py     # APScheduler daily cron (02:00)
│   └── migrations/          # Alembic migrations
├── frontend/
│   └── src/
│       ├── api/             # One file per domain (matches, teams, shop…)
│       ├── components/      # MatchCard, Pitch, CartDrawer, etc.
│       ├── context/         # AuthContext, CartContext
│       └── pages/           # Public + admin pages
├── nginx/
│   └── nginx.conf           # Reverse proxy config (production)
├── docker-compose.yml       # Local development
├── docker-compose.prod.yml  # Production
└── DEPLOY.md                # Step-by-step Azure VM deployment guide
```

## Database

13 tables: `users`, `seasons`, `teams`, `players`, `competitions`, `matches`, `match_events`, `match_lineups`, `standings`, `shop_items`, `orders`, `order_items`, `events`.

```bash
# Generate a new migration after changing models.py
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec backend alembic upgrade head
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for the full guide to deploying on an Azure VM with a free DuckDNS domain and Let's Encrypt SSL.

Quick summary:
1. Provision an Azure B2ls_v2 Ubuntu VM
2. Set up DuckDNS free subdomain pointing to the VM IP
3. Install Docker on the VM
4. Clone the repo, create `.env`
5. Run Certbot to get an SSL certificate
6. `docker compose -f docker-compose.prod.yml up -d --build`

## Admin Access

After seeding, log in at `/admin` with the credentials set in `seeder.py`. The admin panel allows managing all content and triggering a manual RBFA scrape.

## License

Private — Toekomst Relegem. Not open for public use.
