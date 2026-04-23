from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ── AUTH ─────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str


# ── TEAMS ────────────────────────────────────────────────

class TeamBase(BaseModel):
    name: str
    slug: str
    age_group: str
    logo_url: Optional[str] = None
    is_active: bool = True
    rbfa_team_id: Optional[str] = None
    short_name: Optional[str] = None
    coach: Optional[str] = None
    assistant_coach: Optional[str] = None
    color: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    age_group: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    rbfa_team_id: Optional[str] = None
    short_name: Optional[str] = None
    coach: Optional[str] = None
    assistant_coach: Optional[str] = None
    color: Optional[str] = None

class TeamOut(TeamBase):
    id: int
    player_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ── PLAYERS ──────────────────────────────────────────────

class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    jersey_number: Optional[int] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    is_active: bool = True
    rbfa_player_id: Optional[str] = None
    team_id: int
    goals: int = 0
    assists: int = 0
    appearances: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    bio: Optional[str] = None
    joined_year: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    jersey_number: Optional[int] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    is_active: Optional[bool] = None
    rbfa_player_id: Optional[str] = None
    team_id: Optional[int] = None
    goals: Optional[int] = None
    assists: Optional[int] = None
    appearances: Optional[int] = None
    yellow_cards: Optional[int] = None
    red_cards: Optional[int] = None
    bio: Optional[str] = None
    joined_year: Optional[str] = None

class PlayerOut(PlayerBase):
    id: int

    class Config:
        from_attributes = True


# ── MATCH EVENTS ─────────────────────────────────────────

class MatchEventBase(BaseModel):
    type: str
    minute: Optional[int] = None
    player_name: Optional[str] = None
    is_our_team: bool = True
    player_id: Optional[int] = None

class MatchEventCreate(MatchEventBase):
    pass

class MatchEventOut(MatchEventBase):
    id: int
    match_id: int

    class Config:
        from_attributes = True


# ── MATCH LINEUPS ────────────────────────────────────────

class MatchLineupEntry(BaseModel):
    player_name: Optional[str] = None
    jersey_number: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    is_starting: bool = True
    is_our_team: bool = True
    player_id: Optional[int] = None

class MatchLineupOut(MatchLineupEntry):
    id: int
    match_id: int

    class Config:
        from_attributes = True


# ── MATCHES ──────────────────────────────────────────────

class MatchBase(BaseModel):
    match_date: Optional[datetime] = None
    is_home: bool = True
    opponent_name: str
    opponent_logo_url: Optional[str] = None
    opponent_rbfa_id: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: str = "scheduled"
    matchday: Optional[int] = None
    venue: Optional[str] = None
    rbfa_match_id: Optional[str] = None
    team_id: int
    competition_id: Optional[int] = None
    season_id: Optional[int] = None
    formation: Optional[str] = None
    live_minute: Optional[int] = None
    motm_player_id: Optional[int] = None

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    match_date: Optional[datetime] = None
    is_home: Optional[bool] = None
    opponent_name: Optional[str] = None
    opponent_logo_url: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: Optional[str] = None
    matchday: Optional[int] = None
    venue: Optional[str] = None
    team_id: Optional[int] = None
    competition_id: Optional[int] = None
    season_id: Optional[int] = None
    formation: Optional[str] = None
    live_minute: Optional[int] = None
    motm_player_id: Optional[int] = None

class MatchOut(MatchBase):
    id: int
    events: List[MatchEventOut] = []
    lineups: List[MatchLineupOut] = []

    class Config:
        from_attributes = True


# ── STANDINGS ────────────────────────────────────────────

class StandingBase(BaseModel):
    position: Optional[int] = None
    team_name: str
    team_logo_url: Optional[str] = None
    rbfa_team_id: Optional[str] = None
    played: int = 0
    won: int = 0
    drawn: int = 0
    lost: int = 0
    goals_for: int = 0
    goals_against: int = 0
    goal_diff: int = 0
    points: int = 0
    is_us: bool = False
    form: Optional[str] = None
    competition_id: int
    season_id: int

class StandingCreate(StandingBase):
    pass

class StandingUpdate(BaseModel):
    position: Optional[int] = None
    team_name: Optional[str] = None
    played: Optional[int] = None
    won: Optional[int] = None
    drawn: Optional[int] = None
    lost: Optional[int] = None
    goals_for: Optional[int] = None
    goals_against: Optional[int] = None
    goal_diff: Optional[int] = None
    points: Optional[int] = None
    is_us: Optional[bool] = None
    form: Optional[str] = None

class StandingOut(StandingBase):
    id: int

    class Config:
        from_attributes = True


# ── COMPETITIONS ─────────────────────────────────────────

class CompetitionOut(BaseModel):
    id: int
    name: str
    type: str
    rbfa_series_id: Optional[str] = None
    season_id: Optional[int] = None

    class Config:
        from_attributes = True


# ── SHOP ─────────────────────────────────────────────────

class ShopItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    category: str = "other"
    sizes: Optional[List[str]] = None
    stock_quantity: int = 0
    is_available: bool = True
    sort_order: int = 0
    color_label: Optional[str] = None

class ShopItemCreate(ShopItemBase):
    pass

class ShopItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    sizes: Optional[List[str]] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None
    sort_order: Optional[int] = None
    color_label: Optional[str] = None

class ShopItemOut(ShopItemBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── ORDERS ───────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    shop_item_id: int
    size: Optional[str] = None
    quantity: int
    unit_price: Decimal

class OrderItemOut(BaseModel):
    id: int
    shop_item_id: int
    size: Optional[str] = None
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    status: str
    total: Optional[Decimal] = None
    mollie_payment_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True


# ── EVENTS ───────────────────────────────────────────────

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_published: bool = False
    registration_url: Optional[str] = None
    event_type: Optional[str] = None
    price: Optional[Decimal] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None
    registration_url: Optional[str] = None
    event_type: Optional[str] = None
    price: Optional[Decimal] = None

class EventOut(EventBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── NEWS ─────────────────────────────────────────────────

class NewsBase(BaseModel):
    title: str
    category: Optional[str] = None
    tldr: Optional[str] = None
    body: Optional[str] = None
    image_url: Optional[str] = None
    is_pinned: bool = False
    is_published: bool = True

class NewsCreate(NewsBase):
    pass

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    tldr: Optional[str] = None
    body: Optional[str] = None
    image_url: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_published: Optional[bool] = None

class NewsOut(NewsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── SPONSORS ─────────────────────────────────────────────

class SponsorBase(BaseModel):
    name: str
    tier: Optional[str] = None
    sector: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class SponsorCreate(SponsorBase):
    pass

class SponsorUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    sector: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class SponsorOut(SponsorBase):
    id: int

    class Config:
        from_attributes = True


# ── SCRAPER ──────────────────────────────────────────────

class ScraperRunOut(BaseModel):
    id: int
    run_at: Optional[datetime] = None
    status: str
    matches_updated: int = 0
    standings_updated: int = 0
    players_updated: int = 0
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None

    class Config:
        from_attributes = True


# ── ADMIN STATS ──────────────────────────────────────────

class AdminStats(BaseModel):
    teams: int
    players: int
    matches: int
    products: int
    events: int
    news: int
    orders: int
    sponsors: int
