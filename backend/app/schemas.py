from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


# ── ENUMS ────────────────────────────────────────────────

class UserRole(str, Enum):
    admin   = "admin"
    premium = "premium"
    normal  = "normal"

class ItemStatus(str, Enum):
    active       = "active"
    backordered  = "backordered"
    discontinued = "discontinued"

class OrderStatus(str, Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class MovementType(str, Enum):
    incoming   = "incoming"
    outgoing   = "outgoing"
    transfer   = "transfer"
    adjustment = "adjustment"


# ── CATEGORY ─────────────────────────────────────────────

class CategoryOut(BaseModel):
    id:          int
    name:        str
    description: Optional[str]
    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name:        str
    description: Optional[str] = None


# ── SUPPLIER ─────────────────────────────────────────────

class SupplierOut(BaseModel):
    id:      int
    name:    str
    email:   Optional[str]
    phone:   Optional[str]
    address: Optional[str]
    class Config:
        from_attributes = True

class SupplierCreate(BaseModel):
    name:    str
    email:   Optional[str] = None
    phone:   Optional[str] = None
    address: Optional[str] = None

class SupplierUpdate(BaseModel):
    name:    Optional[str] = None
    email:   Optional[str] = None
    phone:   Optional[str] = None
    address: Optional[str] = None


# ── WAREHOUSE ─────────────────────────────────────────────

class WarehouseOut(BaseModel):
    id:       int
    name:     str
    city:     str
    address:  Optional[str]
    capacity: Optional[int]
    class Config:
        from_attributes = True

class WarehouseCreate(BaseModel):
    name:     str
    city:     str
    address:  Optional[str] = None
    capacity: Optional[int] = None

class WarehouseUpdate(BaseModel):
    name:     Optional[str] = None
    city:     Optional[str] = None
    address:  Optional[str] = None
    capacity: Optional[int] = None


# ── USER ─────────────────────────────────────────────────

class UserOut(BaseModel):
    id:         int
    email:      str
    username:   str
    role:       UserRole
    is_active:  bool
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email:     Optional[str]      = None
    username:  Optional[str]      = None
    role:      Optional[UserRole] = None
    is_active: Optional[bool]     = None


# ── ITEM ─────────────────────────────────────────────────

class ItemOut(BaseModel):
    id:              int
    name:            str
    sku:             str
    description:     Optional[str]
    image_url:       Optional[str]
    price:           float
    cost:            Optional[float]
    quantity:        int
    reorder_level:   int
    reorder_qty:     int
    sales_volume:    Optional[int]
    turnover_rate:   Optional[int]
    date_received:   Optional[date]
    expiration_date: Optional[date]
    status:          ItemStatus
    created_at:      Optional[datetime]
    category:        Optional[CategoryOut]
    supplier:        Optional[SupplierOut]
    warehouse:       Optional[WarehouseOut]
    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    name:          str
    sku:           Optional[str]   = None
    description:   Optional[str]   = None
    image_url:     Optional[str]   = None
    price:         float
    cost:          Optional[float] = None
    quantity:      int             = 0
    reorder_level: int             = 10
    reorder_qty:   int             = 50
    status:        ItemStatus      = ItemStatus.active
    category_id:   int
    supplier_id:   Optional[int]   = None
    warehouse_id:  Optional[int]   = None

class ItemUpdate(BaseModel):
    name:          Optional[str]        = None
    description:   Optional[str]        = None
    image_url:     Optional[str]        = None
    price:         Optional[float]      = None
    cost:          Optional[float]      = None
    quantity:      Optional[int]        = None
    reorder_level: Optional[int]        = None
    reorder_qty:   Optional[int]        = None
    status:        Optional[ItemStatus] = None
    category_id:   Optional[int]        = None
    supplier_id:   Optional[int]        = None
    warehouse_id:  Optional[int]        = None

class PaginatedItems(BaseModel):
    total:    int
    page:     int
    per_page: int
    items:    list[ItemOut]


# ── ORDER ─────────────────────────────────────────────────

class OrderItemOut(BaseModel):
    id:         int
    quantity:   int
    unit_price: float
    item_id:    int
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id:         int
    status:     OrderStatus
    total:      float
    notes:      Optional[str]
    user_id:    int
    created_at: Optional[datetime]
    items:      list[OrderItemOut]
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: int
    notes:   Optional[str] = None


# ── STOCK MOVEMENT ────────────────────────────────────────

class MovementOut(BaseModel):
    id:            int
    type:          MovementType
    quantity:      int
    notes:         Optional[str]
    item_id:       int
    warehouse_id:  Optional[int]
    created_by_id: int
    created_at:    Optional[datetime]
    class Config:
        from_attributes = True

class MovementCreate(BaseModel):
    type:          MovementType
    quantity:      int
    notes:         Optional[str] = None
    item_id:       int
    warehouse_id:  Optional[int] = None
    created_by_id: int