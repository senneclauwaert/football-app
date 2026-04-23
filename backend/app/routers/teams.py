from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Team, Player
from app.schemas import TeamOut, TeamCreate, TeamUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.is_active == True).order_by(Team.age_group).all()
    result = []
    for t in teams:
        out = TeamOut.model_validate(t)
        out.player_count = db.query(Player).filter(Player.team_id == t.id, Player.is_active == True).count()
        result.append(out)
    return result


@router.get("/{slug}", response_model=TeamOut)
def get_team(slug: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.slug == slug).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    out = TeamOut.model_validate(team)
    out.player_count = db.query(Player).filter(Player.team_id == team.id, Player.is_active == True).count()
    return out


@router.post("", response_model=TeamOut)
def create_team(data: TeamCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    team = Team(**data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    out.player_count = 0
    return out


@router.put("/{team_id}", response_model=TeamOut)
def update_team(team_id: int, data: TeamUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    out.player_count = db.query(Player).filter(Player.team_id == team.id, Player.is_active == True).count()
    return out


@router.delete("/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    team.is_active = False
    db.commit()
    return {"ok": True}
