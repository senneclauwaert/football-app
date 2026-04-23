from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    ForeignKey, DateTime, Date, Enum, Text, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


# ── ENUMS ────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin   = "admin"
    premium = "premium"
    normal  = "normal"


class ItemStatus(str, enum.Enum):
    active       = "active"
    backordered  = "backordered"
    discontinued = "discontinued"


class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class MovementType(str, enum.Enum):
    incoming   = "incoming"
    outgoing   = "outgoing"
    transfer   = "transfer"
    adjustment = "adjustment"


# ── USERS ────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    username   = Column(String(100), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)
    role       = Column(Enum(UserRole), default=UserRole.normal, nullable=False, index=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orders    = relationship("Order", back_populates="user")
    movements = relationship("StockMovement", back_populates="created_by")


# ── CATEGORIES ───────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)

    items = relationship("Item", back_populates="category")


# ── SUPPLIERS ────────────────────────────────────────────

class Supplier(Base):
    __tablename__ = "suppliers"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False, index=True)
    email      = Column(String(255), unique=True)
    phone      = Column(String(50))
    address    = Column(Text)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("Item", back_populates="supplier")


# ── WAREHOUSES ───────────────────────────────────────────

class Warehouse(Base):
    __tablename__ = "warehouses"

    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String(255), nullable=False, index=True)
    city      = Column(String(100), nullable=False, index=True)
    address   = Column(Text)
    capacity  = Column(Integer)
    is_active = Column(Boolean, default=True)

    items     = relationship("Item", back_populates="warehouse")
    movements = relationship("StockMovement", back_populates="warehouse")


# ── ITEMS ────────────────────────────────────────────────

class Item(Base):
    __tablename__ = "items"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(255), nullable=False, index=True)
    sku             = Column(String(100), unique=True, nullable=False, index=True)
    description     = Column(Text)
    image_url       = Column(String(500))

    price           = Column(Float, nullable=False)
    cost            = Column(Float)
    quantity        = Column(Integer, default=0, index=True)
    reorder_level   = Column(Integer, default=10)
    reorder_qty     = Column(Integer, default=50)

    sales_volume    = Column(Integer, default=0)
    turnover_rate   = Column(Integer, default=0)

    date_received   = Column(Date)
    expiration_date = Column(Date, index=True)

    status          = Column(Enum(ItemStatus), default=ItemStatus.active, index=True)

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    category_id     = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id     = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    warehouse_id    = Column(Integer, ForeignKey("warehouses.id"), nullable=True)

    category        = relationship("Category",  back_populates="items")
    supplier        = relationship("Supplier",  back_populates="items")
    warehouse       = relationship("Warehouse", back_populates="items")
    order_items     = relationship("OrderItem", back_populates="item")
    movements       = relationship("StockMovement", back_populates="item")

    __table_args__ = (
        Index("ix_items_category_id",  "category_id"),
        Index("ix_items_supplier_id",  "supplier_id"),
        Index("ix_items_warehouse_id", "warehouse_id"),
        Index("ix_items_name_status",  "name", "status"),
    )


# ── ORDERS ───────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    status     = Column(Enum(OrderStatus), default=OrderStatus.pending, index=True)
    total      = Column(Float, default=0.0)
    notes      = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)

    user  = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

    __table_args__ = (
        Index("ix_orders_user_status", "user_id", "status"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    item_id    = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)

    order = relationship("Order", back_populates="items")
    item  = relationship("Item",  back_populates="order_items")


# ── STOCK MOVEMENTS ──────────────────────────────────────

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id            = Column(Integer, primary_key=True, index=True)
    type          = Column(Enum(MovementType), nullable=False, index=True)
    quantity      = Column(Integer, nullable=False)
    notes         = Column(Text)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    item_id       = Column(Integer, ForeignKey("items.id"),      nullable=False, index=True)
    warehouse_id  = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"),      nullable=False)

    item       = relationship("Item",      back_populates="movements")
    warehouse  = relationship("Warehouse", back_populates="movements")
    created_by = relationship("User",      back_populates="movements")