from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import News, User
from app.schemas import NewsCreate, NewsOut, NewsUpdate
from app.auth import require_admin

router = APIRouter()


@router.get("", response_model=list[NewsOut])
def list_news(db: Session = Depends(get_db)) -> list[NewsOut]:
    return (
        db.query(News)
        .filter(News.is_published.is_(True))
        .order_by(News.is_pinned.desc(), News.created_at.desc())
        .all()
    )


@router.get("/all", response_model=list[NewsOut])
def list_all_news(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> list[NewsOut]:
    return db.query(News).order_by(News.created_at.desc()).all()


@router.get("/{news_id}", response_model=NewsOut)
def get_news(news_id: int, db: Session = Depends(get_db)) -> NewsOut:
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Nieuwsbericht niet gevonden")
    return item


@router.post("", response_model=NewsOut)
def create_news(
    data: NewsCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> NewsOut:
    item = News(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{news_id}", response_model=NewsOut)
def update_news(
    news_id: int,
    data: NewsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> NewsOut:
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Nieuwsbericht niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}")
def delete_news(
    news_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Nieuwsbericht niet gevonden")
    db.delete(item)
    db.commit()
    return {"ok": True}
