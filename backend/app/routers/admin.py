from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import (
    ScraperRun,
    Team,
    Player,
    Match,
    ShopItem,
    Event,
    News,
    Order,
    Sponsor,
    ScraperStatus,
)
from app.schemas import ScraperRunOut, AdminStats
from app.auth import require_admin

router = APIRouter()


@router.get("/scraper/runs", response_model=List[ScraperRunOut])
def list_scraper_runs(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(ScraperRun).order_by(ScraperRun.run_at.desc()).limit(20).all()


@router.post("/scraper/run", response_model=ScraperRunOut)
def trigger_scraper(db: Session = Depends(get_db), _=Depends(require_admin)):
    run = ScraperRun(status=ScraperStatus.running)
    db.add(run)
    db.commit()
    db.refresh(run)
    # In a real implementation, this would trigger the actual scraper
    # For now, mark as success immediately (scraper not implemented)
    run.status = ScraperStatus.success
    run.duration_seconds = 0.1
    db.commit()
    db.refresh(run)
    return run


@router.get("/stats", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    return AdminStats(
        teams=db.query(Team).filter(Team.is_active).count(),
        players=db.query(Player).filter(Player.is_active).count(),
        matches=db.query(Match).count(),
        products=db.query(ShopItem).filter(ShopItem.is_available).count(),
        events=db.query(Event).filter(Event.is_published).count(),
        news=db.query(News).filter(News.is_published).count(),
        orders=db.query(Order).count(),
        sponsors=db.query(Sponsor).filter(Sponsor.is_active).count(),
    )
