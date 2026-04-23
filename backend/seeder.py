"""
Seeds the database with:
  - 3 users (admin, premium, normal)
  - 7 categories (from CSV)
  - 21 suppliers (3 per category)
  - 3 warehouses (Brussels, Antwerp, Ghent)
  - ~989 items (from CSV) with proper SKUs
  - Sample stock movements
  - Sample orders
"""

import os
import time
import pandas as pd
import random
import requests
from datetime import datetime
import bcrypt

from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole,
    Category, Supplier, Warehouse,
    Item, ItemStatus,
    Order, OrderItem, OrderStatus,
    StockMovement, MovementType,
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def parse_price(p):
    return float(str(p).replace("$", "").strip())


def parse_date(d):
    try:
        return datetime.strptime(str(d).strip(), "%m/%d/%Y").date()
    except Exception:
        return None


def map_status(s):
    return {
        "Active":       ItemStatus.active,
        "Backordered":  ItemStatus.backordered,
        "Discontinued": ItemStatus.discontinued,
    }.get(s, ItemStatus.active)


def get_prefix(category_name: str) -> str:
    words = category_name.replace("&", "").replace("-", " ").split()
    if len(words) == 1:
        return words[0][:3].upper()
    elif len(words) == 2:
        return (words[0][:2] + words[1][0]).upper()
    else:
        return "".join(w[0] for w in words[:3]).upper()


_image_cache = {}

def get_image_url(product_name: str, sku: str) -> str:
    if product_name in _image_cache:
        return _image_cache[product_name]
    try:
        api_key = os.getenv("PEXELS_API_KEY")
        if not api_key:
            raise ValueError("No API key")
        headers = {"Authorization": api_key}
        params  = {"query": f"{product_name} food", "per_page": 1}
        res     = requests.get(
            "https://api.pexels.com/v1/search",
            headers=headers,
            params=params,
            timeout=5
        ).json()
        url = res["photos"][0]["src"]["medium"]
        _image_cache[product_name] = url
        time.sleep(0.2)
        return url
    except Exception:
        fallback = f"https://picsum.photos/seed/{sku}/400/400"
        _image_cache[product_name] = fallback
        return fallback


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── WIPE ─────────────────────────────────────────
        print("🗑️  Clearing existing data...")
        db.query(StockMovement).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Item).delete()
        db.query(Supplier).delete()
        db.query(Warehouse).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()

        # ── USERS ────────────────────────────────────────
        print("👤 Seeding users...")
        users = [
            User(
                email    = "admin@inventory.com",
                username = "admin",
                password = hash_password("admin123"),
                role     = UserRole.admin,
            ),
            User(
                email    = "premium@inventory.com",
                username = "premium",
                password = hash_password("premium123"),
                role     = UserRole.premium,
            ),
            User(
                email    = "user@inventory.com",
                username = "user",
                password = hash_password("user123"),
                role     = UserRole.normal,
            ),
        ]
        db.add_all(users)
        db.commit()

        # ── WAREHOUSES ───────────────────────────────────
        print("🏬 Seeding warehouses...")
        warehouses = [
            Warehouse(name="Brussels Main",   city="Brussels", address="Rue de la Loi 100, 1000 Brussels", capacity=10000),
            Warehouse(name="Antwerp Storage", city="Antwerp",  address="Meir 50, 2000 Antwerp",            capacity=8000),
            Warehouse(name="Ghent Hub",       city="Ghent",    address="Korenmarkt 10, 9000 Ghent",        capacity=6000),
        ]
        db.add_all(warehouses)
        db.commit()

        # ── CSV ──────────────────────────────────────────
        print("📖 Reading CSV...")
        df = pd.read_csv("data/grocery.csv").dropna(subset=["Catagory"])

        # ── CATEGORIES ───────────────────────────────────
        print("📦 Seeding categories...")
        category_map = {}
        for name in df["Catagory"].unique():
            cat = Category(name=name, description=f"{name} products")
            db.add(cat)
            db.flush()
            category_map[name] = cat.id
        db.commit()

        # ── SUPPLIERS ────────────────────────────────────
        print("🏭 Seeding suppliers...")
        supplier_templates = {
            "Grains & Pulses":     ["European Grains Co", "Bulk Foods BV",      "Harvest Partners"],
            "Beverages":           ["Belgian Beverages",  "DrinkSource EU",     "Premium Drinks Ltd"],
            "Fruits & Vegetables": ["Fresh Farm Belgium", "EuroProduce",        "Green Valley Co"],
            "Oils & Fats":         ["Golden Oil Trading", "Mediterranean Oils", "PureFats Imports"],
            "Dairy":               ["Belgian Dairy Co",   "Farmhouse Dairies",  "Nordic Dairy BV"],
            "Bakery":              ["Artisan Bakers",     "Flour Power BV",     "European Bakeries"],
            "Seafood":             ["North Sea Seafood",  "Ocean Catch EU",     "Fresh Fish Trading"],
        }

        supplier_map = {}
        for cat_name, names in supplier_templates.items():
            if cat_name not in category_map:
                continue
            for sname in names:
                sup = Supplier(
                    name    = sname,
                    email   = f"contact@{sname.lower().replace(' ', '')}.be",
                    phone   = f"+32 {random.randint(2,9)} {random.randint(100,999)} {random.randint(1000,9999)}",
                    address = random.choice([
                        "Brussels, Belgium",
                        "Antwerp, Belgium",
                        "Ghent, Belgium",
                        "Rotterdam, Netherlands",
                        "Paris, France",
                    ]),
                )
                db.add(sup)
                db.flush()
                supplier_map.setdefault(cat_name, []).append(sup.id)
        db.commit()

        # ── ITEMS ────────────────────────────────────────
        unique_products = df.drop_duplicates(subset=["Product_ID"])
        print(f"🛒 Seeding {len(unique_products)} items...")
        print("   fetching images from Pexels...\n")

        items_added = []
        seen_skus   = set()
        sku_counters = {}

        for i, (_, row) in enumerate(unique_products.iterrows()):
            cat_name  = row["Catagory"]
            cat_id    = category_map.get(cat_name)
            prefix    = get_prefix(cat_name) if cat_name else "GEN"

            # generate clean SKU
            sku_counters[prefix] = sku_counters.get(prefix, 0) + 1
            sku = f"{prefix}-{str(sku_counters[prefix]).zfill(5)}"

            if sku in seen_skus:
                continue
            seen_skus.add(sku)

            sup_id    = random.choice(supplier_map.get(cat_name, [None]))
            wh_id     = random.choice(warehouses).id
            price     = parse_price(row["Unit_Price"])
            cost      = round(price * random.uniform(0.4, 0.6), 2)
            name      = str(row["Product_Name"]).strip()
            image_url = get_image_url(name, sku)

            print(f"   [{i+1}/{len(unique_products)}] {name} ({sku}) → {image_url[:50]}...")

            item = Item(
                name            = name,
                sku             = sku,
                description     = f"{row['Product_Name']} — sourced from {row['Supplier_Name']}",
                image_url       = image_url,
                price           = price,
                cost            = cost,
                quantity        = int(row["Stock_Quantity"]),
                reorder_level   = int(row["Reorder_Level"]),
                reorder_qty     = int(row["Reorder_Quantity"]),
                sales_volume    = int(row["Sales_Volume"]),
                turnover_rate   = int(row["Inventory_Turnover_Rate"]),
                date_received   = parse_date(row["Date_Received"]),
                expiration_date = parse_date(row["Expiration_Date"]),
                status          = map_status(row["Status"]),
                category_id     = cat_id,
                supplier_id     = sup_id,
                warehouse_id    = wh_id,
            )
            db.add(item)
            items_added.append(item)

        db.commit()
        print(f"\n   → {len(items_added)} items inserted")

        # ── STOCK MOVEMENTS ──────────────────────────────
        print("📊 Seeding stock movements...")
        movements = []
        for item in random.sample(items_added, min(200, len(items_added))):
            for _ in range(random.randint(1, 3)):
                movements.append(StockMovement(
                    type          = random.choice(list(MovementType)),
                    quantity      = random.randint(1, 50),
                    notes         = f"Auto-generated for {item.name}",
                    item_id       = item.id,
                    warehouse_id  = item.warehouse_id,
                    created_by_id = users[0].id,
                ))
        db.add_all(movements)
        db.commit()

        # ── ORDERS ───────────────────────────────────────
        print("🧾 Seeding orders...")
        for _ in range(25):
            order = Order(
                status  = random.choice(list(OrderStatus)),
                notes   = "Sample order",
                user_id = random.choice([users[1].id, users[2].id]),
            )
            db.add(order)
            db.flush()

            total = 0
            for item in random.sample(items_added, random.randint(1, 5)):
                qty = random.randint(1, 5)
                db.add(OrderItem(
                    order_id   = order.id,
                    item_id    = item.id,
                    quantity   = qty,
                    unit_price = item.price,
                ))
                total += item.price * qty
            order.total = round(total, 2)
        db.commit()

        # ── SUMMARY ──────────────────────────────────────
        print("\n✅ Seeding complete!")
        print(f"   👤 {db.query(User).count()} users")
        print(f"   📦 {db.query(Category).count()} categories")
        print(f"   🏭 {db.query(Supplier).count()} suppliers")
        print(f"   🏬 {db.query(Warehouse).count()} warehouses")
        print(f"   🛒 {db.query(Item).count()} items")
        print(f"   📊 {db.query(StockMovement).count()} stock movements")
        print(f"   🧾 {db.query(Order).count()} orders")
        print(f"\n   SKU prefixes used: {list(sku_counters.keys())}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()