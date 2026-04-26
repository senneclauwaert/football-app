import time
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Event,
    Match,
    News,
    Order,
    Player,
    ScraperRun,
    ScraperStatus,
    ShopItem,
    Sponsor,
    Team,
    User,
)
from app.schemas import AdminStats, ScraperRunOut
from app.auth import require_admin
from scraper.sync import run_full_sync

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/scraper/runs", response_model=list[ScraperRunOut])
def list_scraper_runs(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> list[ScraperRunOut]:
    return db.query(ScraperRun).order_by(ScraperRun.run_at.desc()).limit(20).all()


@router.post("/scraper/run", response_model=ScraperRunOut)
def trigger_scraper(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> ScraperRunOut:
    run = ScraperRun(status=ScraperStatus.running)
    db.add(run)
    db.commit()
    db.refresh(run)

    start = time.time()
    try:
        summary = run_full_sync(db)
        run.status = ScraperStatus.success
        run.matches_updated = summary.get("events", 0)
        run.standings_updated = summary.get("standings", 0)
        run.players_updated = summary.get("players", 0)
    except Exception as e:
        logger.exception("Scraper failed: %s", e)
        run.status = ScraperStatus.error
        run.error_message = str(e)
    finally:
        run.duration_seconds = round(time.time() - start, 1)
        db.commit()
        db.refresh(run)

    return run


@router.get("/stats", response_model=AdminStats)
def get_stats(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> AdminStats:
    return AdminStats(
        teams=db.query(Team).filter(Team.is_active.is_(True)).count(),
        players=db.query(Player).filter(Player.is_active.is_(True)).count(),
        matches=db.query(Match).count(),
        products=db.query(ShopItem).filter(ShopItem.is_available.is_(True)).count(),
        events=db.query(Event).filter(Event.is_published.is_(True)).count(),
        news=db.query(News).filter(News.is_published.is_(True)).count(),
        orders=db.query(Order).count(),
        sponsors=db.query(Sponsor).filter(Sponsor.is_active.is_(True)).count(),
    )
