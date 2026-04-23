"""
One-time bootstrap: fetch ALL historical data from RBFA and populate the DB.

Usage (from /backend directory with venv activated):
    python -m scraper.bootstrap
"""

import logging
import sys
import os

# Allow running from backend/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import Season
from scraper.sync import run_full_sync

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def ensure_current_season(db):
    """Create the current season if it doesn't exist yet."""
    existing = db.query(Season).filter_by(is_current=True).first()
    if not existing:
        from datetime import datetime
        now = datetime.now()
        if now.month >= 8:
            start, end = now.year, now.year + 1
        else:
            start, end = now.year - 1, now.year
        name = f"{start}-{end}"
        season = Season(name=name, start_year=start, end_year=end, is_current=True)
        db.add(season)
        db.commit()
        logger.info("Created season: %s", name)


def main():
    logger.info("=== Toekomst Relegem — RBFA Bootstrap ===")
    db = SessionLocal()
    try:
        ensure_current_season(db)
        summary = run_full_sync(db)
        logger.info("Bootstrap complete:")
        for key, val in summary.items():
            logger.info("  %-12s %d", key + ":", val)
    except Exception:
        logger.exception("Bootstrap failed")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
