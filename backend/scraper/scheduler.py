"""
APScheduler setup for daily RBFA sync.
Attached to FastAPI app lifespan so it starts/stops with the server.
"""

import logging
import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.models import ScraperRun, ScraperStatus
from scraper.sync import run_full_sync

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone="Europe/Brussels")


def _scraper_job():
    """The actual job run by APScheduler."""
    db = SessionLocal()
    run = ScraperRun(status=ScraperStatus.running)
    db.add(run)
    db.commit()
    db.refresh(run)

    start = time.time()
    try:
        summary = run_full_sync(db)
        run.status            = ScraperStatus.success
        run.matches_updated   = summary.get("matches", 0)
        run.standings_updated = summary.get("standings", 0)
        run.players_updated   = summary.get("players", 0)
    except Exception as exc:
        logger.exception("Scraper job failed")
        run.status        = ScraperStatus.error
        run.error_message = str(exc)
    finally:
        run.duration_seconds = round(time.time() - start, 2)
        db.commit()
        db.close()


def run_now() -> int:
    """
    Trigger a scraper run immediately (used by admin API endpoint).
    Returns the ScraperRun ID.
    """
    db = SessionLocal()
    run = ScraperRun(status=ScraperStatus.running)
    db.add(run)
    db.commit()
    db.refresh(run)
    run_id = run.id

    start = time.time()
    try:
        summary = run_full_sync(db)
        run.status            = ScraperStatus.success
        run.matches_updated   = summary.get("matches", 0)
        run.standings_updated = summary.get("standings", 0)
        run.players_updated   = summary.get("players", 0)
    except Exception as exc:
        logger.exception("Manual scraper run failed")
        run.status        = ScraperStatus.error
        run.error_message = str(exc)
    finally:
        run.duration_seconds = round(time.time() - start, 2)
        db.commit()
        db.close()

    return run_id


@asynccontextmanager
async def lifespan(app):
    """FastAPI lifespan: start scheduler on startup, stop on shutdown."""
    # Daily at 02:00 Brussels time
    scheduler.add_job(
        _scraper_job,
        CronTrigger(hour=2, minute=0),
        id="daily_rbfa_sync",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started — daily RBFA sync at 02:00 Brussels time")
    yield
    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped")
