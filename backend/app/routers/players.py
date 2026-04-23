from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Player, User
from app.schemas import PlayerCreate, PlayerOut, PlayerUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=list[PlayerOut])
def list_players(
    team_id: int | None = None, db: Session = Depends(get_db)
) -> list[PlayerOut]:
    q = db.query(Player).filter(Player.is_active.is_(True))
    if team_id:
        q = q.filter(Player.team_id == team_id)
    return q.order_by(Player.jersey_number).all()


@router.get("/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: Session = Depends(get_db)) -> PlayerOut:
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Speler niet gevonden")
    return player


@router.post("", response_model=PlayerOut)
def create_player(
    data: PlayerCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> PlayerOut:
    player = Player(**data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.put("/{player_id}", response_model=PlayerOut)
def update_player(
    player_id: int,
    data: PlayerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> PlayerOut:
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Speler niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(player, field, value)
    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}")
def delete_player(
    player_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Speler niet gevonden")
    player.is_active = False
    db.commit()
    return {"ok": True}
