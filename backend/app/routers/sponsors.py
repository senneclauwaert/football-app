from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Sponsor
from app.schemas import SponsorOut, SponsorCreate, SponsorUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=List[SponsorOut])
def list_sponsors(db: Session = Depends(get_db)):
    return (
        db.query(Sponsor)
        .filter(Sponsor.is_active)
        .order_by(Sponsor.sort_order, Sponsor.name)
        .all()
    )


@router.post("", response_model=SponsorOut)
def create_sponsor(
    data: SponsorCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    sponsor = Sponsor(**data.model_dump())
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)
    return sponsor


@router.put("/{sponsor_id}", response_model=SponsorOut)
def update_sponsor(
    sponsor_id: int,
    data: SponsorUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(sponsor, field, value)
    db.commit()
    db.refresh(sponsor)
    return sponsor


@router.delete("/{sponsor_id}")
def delete_sponsor(
    sponsor_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor niet gevonden")
    sponsor.is_active = False
    db.commit()
    return {"ok": True}
