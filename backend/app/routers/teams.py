from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Competition, Match, Player, Team
from app.schemas import CompetitionOut, TeamCreate, TeamOut, TeamUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=list[TeamOut])
def list_teams(db: Session = Depends(get_db)) -> list[TeamOut]:
    teams = (
        db.query(Team).filter(Team.is_active.is_(True)).order_by(Team.age_group).all()
    )
    result = []
    for t in teams:
        out = TeamOut.model_validate(t)
        out.player_count = (
            db.query(Player)
            .filter(Player.team_id == t.id, Player.is_active.is_(True))
            .count()
        )
        result.append(out)
    return result


@router.get("/{team_id}/competitions", response_model=list[CompetitionOut])
def get_team_competitions(
    team_id: int, db: Session = Depends(get_db)
) -> list[CompetitionOut]:
    return (
        db.query(Competition)
        .join(Match, Match.competition_id == Competition.id)
        .filter(Match.team_id == team_id, Competition.id.isnot(None))
        .distinct()
        .all()
    )


@router.get("/{slug}", response_model=TeamOut)
def get_team(slug: str, db: Session = Depends(get_db)) -> TeamOut:
    team = db.query(Team).filter(Team.slug == slug).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    out = TeamOut.model_validate(team)
    out.player_count = (
        db.query(Player)
        .filter(Player.team_id == team.id, Player.is_active.is_(True))
        .count()
    )
    return out


@router.post("", response_model=TeamOut)
def create_team(
    data: TeamCreate, db: Session = Depends(get_db), _: Team = Depends(require_admin)
) -> TeamOut:
    team = Team(**data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    out.player_count = 0
    return out


@router.put("/{team_id}", response_model=TeamOut)
def update_team(
    team_id: int,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    _: Team = Depends(require_admin),
) -> TeamOut:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    out.player_count = (
        db.query(Player)
        .filter(Player.team_id == team.id, Player.is_active.is_(True))
        .count()
    )
    return out


@router.delete("/{team_id}")
def delete_team(
    team_id: int, db: Session = Depends(get_db), _: Team = Depends(require_admin)
) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team niet gevonden")
    team.is_active = False
    db.commit()
    return {"ok": True}
