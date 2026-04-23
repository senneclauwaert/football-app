from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models import Item, ItemStatus, Category, User
from app.schemas import ItemOut, ItemUpdate, ItemCreate, PaginatedItems
from app.auth import get_current_user, require_admin

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def get_prefix(category_name: str) -> str:
    words = category_name.replace("&", "").replace("-", " ").split()
    if len(words) == 1:
        return words[0][:3].upper()
    elif len(words) == 2:
        return (words[0][:2] + words[1][0]).upper()
    else:
        return "".join(w[0] for w in words[:3]).upper()


def generate_sku(category_id: int, db: Session) -> str:
    cat    = db.query(Category).filter(Category.id == category_id).first()
    prefix = get_prefix(cat.name) if cat else "GEN"

    existing = db.query(Item).filter(Item.sku.like(f"{prefix}-%")).all()
    nums = []
    for item in existing:
        try:
            nums.append(int(item.sku.split("-")[1]))
        except Exception:
            pass
    next_num = max(nums) + 1 if nums else 1
    return f"{prefix}-{str(next_num).zfill(5)}"


# ── PUBLIC ───────────────────────────────────────────────

@router.get("/", response_model=PaginatedItems)
@limiter.limit("60/minute")
def get_all_items(
    request:     Request,
    page:        int        = Query(1, ge=1),
    per_page:    int        = Query(20, ge=1, le=100),
    category_id: int        = Query(None),
    status:      ItemStatus = Query(None),
    search:      str        = Query(None),
    db:          Session    = Depends(get_db),
):
    query = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.supplier),
        joinedload(Item.warehouse),
    )
    if category_id:
        query = query.filter(Item.category_id == category_id)
    if status:
        query = query.filter(Item.status == status)
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return {"total": total, "page": page, "per_page": per_page, "items": items}


@router.get("/{item_id}", response_model=ItemOut)
@limiter.limit("60/minute")
def get_item(request: Request, item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.supplier),
        joinedload(Item.warehouse),
    ).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# ── ADMIN ONLY ───────────────────────────────────────────

@router.post("/", response_model=ItemOut)
@limiter.limit("30/minute")
def create_item(
    request:      Request,
    payload:      ItemCreate,
    db:           Session = Depends(get_db),
    current_user: User   = Depends(require_admin),
):
    data = payload.model_dump()
    if not data.get("sku"):
        data["sku"] = generate_sku(data["category_id"], db)
    item = Item(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ItemOut)
@limiter.limit("30/minute")
def update_item(
    request:      Request,
    item_id:      int,
    payload:      ItemUpdate,
    db:           Session = Depends(get_db),
    current_user: User   = Depends(require_admin),
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
@limiter.limit("20/minute")
def delete_item(
    request:      Request,
    item_id:      int,
    db:           Session = Depends(get_db),
    current_user: User   = Depends(require_admin),
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": f"Item {item_id} deleted"}