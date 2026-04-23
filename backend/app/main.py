from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from scraper.scheduler import lifespan
from app.routers import auth
from app.routers import teams, players, matches, standings, shop, events, news, sponsors, admin

limiter = Limiter(default_limits=["200/minute"], key_func=get_remote_address)

app = FastAPI(title="Toekomst Relegem API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(teams.router,     prefix="/api/teams",     tags=["teams"])
app.include_router(players.router,   prefix="/api/players",   tags=["players"])
app.include_router(matches.router,   prefix="/api/matches",   tags=["matches"])
app.include_router(standings.router, prefix="/api/standings", tags=["standings"])
app.include_router(shop.router,      prefix="/api/shop",      tags=["shop"])
app.include_router(events.router,    prefix="/api/events",    tags=["events"])
app.include_router(news.router,      prefix="/api/news",      tags=["news"])
app.include_router(sponsors.router,  prefix="/api/sponsors",  tags=["sponsors"])
app.include_router(admin.router,     prefix="/api/admin",     tags=["admin"])


@app.get("/")
def root():
    return {"status": "ok", "club": "Toekomst Relegem"}
