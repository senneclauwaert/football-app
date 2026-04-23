from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.database import get_db
from app.models import Match, MatchEvent, MatchLineup
from app.schemas import (
    MatchOut, MatchCreate, MatchUpdate,
    MatchEventOut, MatchEventCreate,
    MatchLineupOut, MatchLineupEntry,
)
from app.auth import require_admin

router = APIRouter()


def _load_match(match_id: int, db: Session) -> Match:
    match = (
        db.query(Match)
        .options(joinedload(Match.events), joinedload(Match.lineups))
        .filter(Match.id == match_id)
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Wedstrijd niet gevonden")
    return match


@router.get("", response_model=List[MatchOut])
def list_matches(
    team_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(Match)
        .options(joinedload(Match.events), joinedload(Match.lineups))
    )
    if team_id:
        q = q.filter(Match.team_id == team_id)
    if status:
        q = q.filter(Match.status == status)
    return q.order_by(Match.match_date.desc()).all()


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    return _load_match(match_id, db)


@router.post("", response_model=MatchOut)
def create_match(data: MatchCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    match = Match(**data.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return _load_match(match.id, db)


@router.put("/{match_id}", response_model=MatchOut)
def update_match(match_id: int, data: MatchUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Wedstrijd niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(match, field, value)
    db.commit()
    return _load_match(match_id, db)


@router.delete("/{match_id}")
def delete_match(match_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Wedstrijd niet gevonden")
    db.delete(match)
    db.commit()
    return {"ok": True}


@router.post("/{match_id}/events", response_model=MatchEventOut)
def add_match_event(
    match_id: int,
    data: MatchEventCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Wedstrijd niet gevonden")
    event = MatchEvent(match_id=match_id, **data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{match_id}/events/{event_id}")
def remove_match_event(
    match_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    event = db.query(MatchEvent).filter(
        MatchEvent.id == event_id, MatchEvent.match_id == match_id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event niet gevonden")
    db.delete(event)
    db.commit()
    return {"ok": True}


@router.put("/{match_id}/lineup", response_model=List[MatchLineupOut])
def replace_lineup(
    match_id: int,
    entries: List[MatchLineupEntry],
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Wedstrijd niet gevonden")
    # Delete existing lineup
    db.query(MatchLineup).filter(MatchLineup.match_id == match_id).delete()
    # Insert new lineup
    new_entries = []
    for entry in entries:
        lineup = MatchLineup(match_id=match_id, **entry.model_dump())
        db.add(lineup)
        new_entries.append(lineup)
    db.commit()
    for e in new_entries:
        db.refresh(e)
    return new_entries
