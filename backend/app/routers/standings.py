from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Standing, Competition
from app.schemas import StandingOut, StandingCreate, StandingUpdate, CompetitionOut
from app.auth import require_admin

router = APIRouter()


@router.get("/competitions", response_model=List[CompetitionOut])
def list_competitions(db: Session = Depends(get_db)):
    return db.query(Competition).all()


@router.get("", response_model=List[StandingOut])
def list_standings(competition_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Standing)
    if competition_id:
        q = q.filter(Standing.competition_id == competition_id)
    return q.order_by(Standing.position).all()


@router.post("", response_model=List[StandingOut])
def bulk_upsert_standings(
    entries: List[StandingCreate],
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    result = []
    for entry in entries:
        data = entry.model_dump()
        existing = (
            db.query(Standing)
            .filter(
                Standing.competition_id == data["competition_id"],
                Standing.season_id == data["season_id"],
                Standing.team_name == data["team_name"],
            )
            .first()
        )
        if existing:
            for field, value in data.items():
                setattr(existing, field, value)
            result.append(existing)
        else:
            s = Standing(**data)
            db.add(s)
            result.append(s)
    db.commit()
    for s in result:
        db.refresh(s)
    return result


@router.put("/{standing_id}", response_model=StandingOut)
def update_standing(
    standing_id: int,
    data: StandingUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    standing = db.query(Standing).filter(Standing.id == standing_id).first()
    if not standing:
        raise HTTPException(status_code=404, detail="Klassement niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(standing, field, value)
    db.commit()
    db.refresh(standing)
    return standing
