from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.routers import inventory, auth

from app.routers import inventory, users, orders, suppliers, warehouses, categories, movements

limiter = Limiter(default_limits=["100/minute"], key_func=get_remote_address)

app = FastAPI(title="Inventory API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(inventory.router,   prefix="/api/inventory",   tags=["inventory"])
app.include_router(users.router,       prefix="/api/users",       tags=["users"])
# app.include_router(orders.router,      prefix="/api/orders",      tags=["orders"])
# app.include_router(suppliers.router,   prefix="/api/suppliers",   tags=["suppliers"])
# app.include_router(warehouses.router,  prefix="/api/warehouses",  tags=["warehouses"])
# app.include_router(categories.router,  prefix="/api/categories",  tags=["categories"])
# app.include_router(movements.router,   prefix="/api/movements",   tags=["movements"])

@app.get("/")
def root():
    return {"status": "ok"}