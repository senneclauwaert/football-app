from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import ShopItem, Order, OrderItem
from app.schemas import (
    ShopItemOut,
    ShopItemCreate,
    ShopItemUpdate,
    OrderOut,
    OrderCreate,
    OrderUpdate,
)
from app.auth import require_admin

router = APIRouter()


# ── SHOP ITEMS ───────────────────────────────────────────


@router.get("/items", response_model=List[ShopItemOut])
def list_products(db: Session = Depends(get_db)):
    return (
        db.query(ShopItem)
        .filter(ShopItem.is_available)
        .order_by(ShopItem.sort_order, ShopItem.name)
        .all()
    )


@router.get("/items/all", response_model=List[ShopItemOut])
def list_all_products(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(ShopItem).order_by(ShopItem.sort_order, ShopItem.name).all()


@router.get("/items/{item_id}", response_model=ShopItemOut)
def get_product(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product niet gevonden")
    return item


@router.post("/items", response_model=ShopItemOut)
def create_product(
    data: ShopItemCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    item = ShopItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/items/{item_id}", response_model=ShopItemOut)
def update_product(
    item_id: int,
    data: ShopItemUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}")
def delete_product(
    item_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product niet gevonden")
    item.is_available = False
    db.commit()
    return {"ok": True}


# ── ORDERS ───────────────────────────────────────────────


@router.post("/orders", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    total = sum(item.unit_price * item.quantity for item in data.items)
    order = Order(
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        customer_phone=data.customer_phone,
        customer_address=data.customer_address,
        notes=data.notes,
        total=total,
    )
    db.add(order)
    db.flush()
    for item_data in data.items:
        oi = OrderItem(
            order_id=order.id,
            shop_item_id=item_data.shop_item_id,
            size=item_data.size,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )
        db.add(oi)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), _=Depends(require_admin)):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )


@router.put("/orders/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    data: OrderUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order
