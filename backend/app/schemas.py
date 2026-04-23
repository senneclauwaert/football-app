from pydantic import BaseModel, ConfigDict
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
    logo_url: str | None = None
    is_active: bool = True
    rbfa_team_id: str | None = None
    short_name: str | None = None
    coach: str | None = None
    assistant_coach: str | None = None
    color: str | None = None


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    age_group: str | None = None
    logo_url: str | None = None
    is_active: bool | None = None
    rbfa_team_id: str | None = None
    short_name: str | None = None
    coach: str | None = None
    assistant_coach: str | None = None
    color: str | None = None


class TeamOut(TeamBase):
    id: int
    player_count: int | None = 0

    model_config = ConfigDict(from_attributes=True)


# ── PLAYERS ──────────────────────────────────────────────


class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    jersey_number: int | None = None
    position: str | None = None
    photo_url: str | None = None
    date_of_birth: date | None = None
    is_active: bool = True
    rbfa_player_id: str | None = None
    team_id: int
    goals: int = 0
    assists: int = 0
    appearances: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    bio: str | None = None
    joined_year: str | None = None


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    jersey_number: int | None = None
    position: str | None = None
    photo_url: str | None = None
    date_of_birth: date | None = None
    is_active: bool | None = None
    rbfa_player_id: str | None = None
    team_id: int | None = None
    goals: int | None = None
    assists: int | None = None
    appearances: int | None = None
    yellow_cards: int | None = None
    red_cards: int | None = None
    bio: str | None = None
    joined_year: str | None = None


class PlayerOut(PlayerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ── MATCH EVENTS ─────────────────────────────────────────


class MatchEventBase(BaseModel):
    type: str
    minute: int | None = None
    player_name: str | None = None
    is_our_team: bool = True
    player_id: int | None = None


class MatchEventCreate(MatchEventBase):
    pass


class MatchEventOut(MatchEventBase):
    id: int
    match_id: int

    model_config = ConfigDict(from_attributes=True)


# ── MATCH LINEUPS ────────────────────────────────────────


class MatchLineupEntry(BaseModel):
    player_name: str | None = None
    jersey_number: int | None = None
    position_x: float | None = None
    position_y: float | None = None
    is_starting: bool = True
    is_our_team: bool = True
    player_id: int | None = None


class MatchLineupOut(MatchLineupEntry):
    id: int
    match_id: int

    model_config = ConfigDict(from_attributes=True)


# ── MATCHES ──────────────────────────────────────────────


class MatchBase(BaseModel):
    match_date: datetime | None = None
    is_home: bool = True
    opponent_name: str
    opponent_logo_url: str | None = None
    opponent_rbfa_id: str | None = None
    home_score: int | None = None
    away_score: int | None = None
    status: str = "scheduled"
    matchday: int | None = None
    venue: str | None = None
    rbfa_match_id: str | None = None
    team_id: int
    competition_id: int | None = None
    season_id: int | None = None
    formation: str | None = None
    live_minute: int | None = None
    motm_player_id: int | None = None


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    match_date: datetime | None = None
    is_home: bool | None = None
    opponent_name: str | None = None
    opponent_logo_url: str | None = None
    home_score: int | None = None
    away_score: int | None = None
    status: str | None = None
    matchday: int | None = None
    venue: str | None = None
    team_id: int | None = None
    competition_id: int | None = None
    season_id: int | None = None
    formation: str | None = None
    live_minute: int | None = None
    motm_player_id: int | None = None


class MatchOut(MatchBase):
    id: int
    events: list[MatchEventOut] = []
    lineups: list[MatchLineupOut] = []

    model_config = ConfigDict(from_attributes=True)


# ── STANDINGS ────────────────────────────────────────────


class StandingBase(BaseModel):
    position: int | None = None
    team_name: str
    team_logo_url: str | None = None
    rbfa_team_id: str | None = None
    played: int = 0
    won: int = 0
    drawn: int = 0
    lost: int = 0
    goals_for: int = 0
    goals_against: int = 0
    goal_diff: int = 0
    points: int = 0
    is_us: bool = False
    form: str | None = None
    competition_id: int
    season_id: int


class StandingCreate(StandingBase):
    pass


class StandingUpdate(BaseModel):
    position: int | None = None
    team_name: str | None = None
    played: int | None = None
    won: int | None = None
    drawn: int | None = None
    lost: int | None = None
    goals_for: int | None = None
    goals_against: int | None = None
    goal_diff: int | None = None
    points: int | None = None
    is_us: bool | None = None
    form: str | None = None


class StandingOut(StandingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ── COMPETITIONS ─────────────────────────────────────────


class CompetitionOut(BaseModel):
    id: int
    name: str
    type: str
    rbfa_series_id: str | None = None
    season_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


# ── SHOP ─────────────────────────────────────────────────


class ShopItemBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category: str = "other"
    sizes: list[str] | None = None
    stock_quantity: int = 0
    is_available: bool = True
    sort_order: int = 0
    color_label: str | None = None


class ShopItemCreate(ShopItemBase):
    pass


class ShopItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    image_url: str | None = None
    category: str | None = None
    sizes: list[str] | None = None
    stock_quantity: int | None = None
    is_available: bool | None = None
    sort_order: int | None = None
    color_label: str | None = None


class ShopItemOut(ShopItemBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ── ORDERS ───────────────────────────────────────────────


class OrderItemCreate(BaseModel):
    shop_item_id: int
    size: str | None = None
    quantity: int
    unit_price: Decimal


class OrderItemOut(BaseModel):
    id: int
    shop_item_id: int
    size: str | None = None
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str | None = None
    customer_address: str | None = None
    notes: str | None = None
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    customer_phone: str | None = None
    customer_address: str | None = None
    status: str
    total: Decimal | None = None
    mollie_payment_id: str | None = None
    notes: str | None = None
    created_at: datetime | None = None
    items: list[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)


# ── EVENTS ───────────────────────────────────────────────


class EventBase(BaseModel):
    title: str
    description: str | None = None
    date: datetime
    end_date: datetime | None = None
    location: str | None = None
    image_url: str | None = None
    is_published: bool = False
    registration_url: str | None = None
    event_type: str | None = None
    price: Decimal | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date: datetime | None = None
    end_date: datetime | None = None
    location: str | None = None
    image_url: str | None = None
    is_published: bool | None = None
    registration_url: str | None = None
    event_type: str | None = None
    price: Decimal | None = None


class EventOut(EventBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ── NEWS ─────────────────────────────────────────────────


class NewsBase(BaseModel):
    title: str
    category: str | None = None
    tldr: str | None = None
    body: str | None = None
    image_url: str | None = None
    is_pinned: bool = False
    is_published: bool = True


class NewsCreate(NewsBase):
    pass


class NewsUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    tldr: str | None = None
    body: str | None = None
    image_url: str | None = None
    is_pinned: bool | None = None
    is_published: bool | None = None


class NewsOut(NewsBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ── SPONSORS ─────────────────────────────────────────────


class SponsorBase(BaseModel):
    name: str
    tier: str | None = None
    sector: str | None = None
    logo_url: str | None = None
    website: str | None = None
    is_active: bool = True
    sort_order: int = 0


class SponsorCreate(SponsorBase):
    pass


class SponsorUpdate(BaseModel):
    name: str | None = None
    tier: str | None = None
    sector: str | None = None
    logo_url: str | None = None
    website: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class SponsorOut(SponsorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ── SCRAPER ──────────────────────────────────────────────


class ScraperRunOut(BaseModel):
    id: int
    run_at: datetime | None = None
    status: str
    matches_updated: int = 0
    standings_updated: int = 0
    players_updated: int = 0
    error_message: str | None = None
    duration_seconds: float | None = None

    model_config = ConfigDict(from_attributes=True)


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
