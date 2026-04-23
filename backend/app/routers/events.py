from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Event
from app.schemas import EventOut, EventCreate, EventUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).filter(Event.is_published).order_by(Event.date).all()


@router.get("/all", response_model=List[EventOut])
def list_all_events(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Event).order_by(Event.date).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evenement niet gevonden")
    return event


@router.post("", response_model=EventOut)
def create_event(
    data: EventCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    event = Event(**data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    data: EventUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evenement niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evenement niet gevonden")
    db.delete(event)
    db.commit()
    return {"ok": True}
