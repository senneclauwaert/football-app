from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserOut, UserUpdate
from app.auth import require_admin

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=list[UserOut])
@limiter.limit("60/minute")
def get_all_users(
    request: Request,
    db:      Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserOut)
@limiter.limit("60/minute")
def get_user(
    request: Request,
    user_id: int,
    db:      Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
@limiter.limit("30/minute")
def update_user(
    request: Request,
    user_id: int,
    payload: UserUpdate,
    db:      Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
@limiter.limit("20/minute")
def delete_user(
    request: Request,
    user_id: int,
    db:      Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted"}