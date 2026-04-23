from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Numeric,
    ForeignKey,
    DateTime,
    Date,
    Enum,
    Text,
    Index,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


# ── ENUMS ────────────────────────────────────────────────


class UserRole(str, enum.Enum):
    admin = "admin"


class AgeGroup(str, enum.Enum):
    first_team = "first_team"
    reserves = "reserves"
    u17 = "u17"
    u16 = "u16"
    u15 = "u15"
    u13 = "u13"
    u12 = "u12"
    u11 = "u11"
    u10 = "u10"
    u9 = "u9"
    u8 = "u8"
    u7 = "u7"
    u6 = "u6"


class PlayerPosition(str, enum.Enum):
    goalkeeper = "goalkeeper"
    defender = "defender"
    midfielder = "midfielder"
    forward = "forward"


class CompetitionType(str, enum.Enum):
    league = "league"
    cup = "cup"
    friendly = "friendly"


class MatchStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    finished = "finished"
    postponed = "postponed"
    cancelled = "cancelled"


class MatchEventType(str, enum.Enum):
    goal = "goal"
    own_goal = "own_goal"
    penalty = "penalty"
    yellow_card = "yellow_card"
    red_card = "red_card"
    second_yellow = "second_yellow"
    sub_in = "sub_in"
    sub_out = "sub_out"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class ShopCategory(str, enum.Enum):
    shirt = "shirt"
    scarf = "scarf"
    hat = "hat"
    jacket = "jacket"
    cap = "cap"
    accessory = "accessory"
    kids = "kids"
    other = "other"


class ScraperStatus(str, enum.Enum):
    running = "running"
    success = "success"
    error = "error"


# ── USERS ────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.admin, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ── SEASONS ──────────────────────────────────────────────


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, nullable=False)  # "2024-2025"
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)
    is_current = Column(Boolean, default=False, index=True)

    competitions = relationship("Competition", back_populates="season")
    matches = relationship("Match", back_populates="season")
    standings = relationship("Standing", back_populates="season")


# ── TEAMS ────────────────────────────────────────────────


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    age_group = Column(Enum(AgeGroup), nullable=False, index=True)
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    rbfa_team_id = Column(String(100), unique=True, index=True)
    short_name = Column(String(10))
    coach = Column(String(255))
    assistant_coach = Column(String(255))
    color = Column(String(7))  # hex like #ff6a13

    players = relationship("Player", back_populates="team")
    matches = relationship("Match", back_populates="team")


# ── PLAYERS ──────────────────────────────────────────────


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    jersey_number = Column(Integer)
    position = Column(Enum(PlayerPosition))
    photo_url = Column(String(500))
    date_of_birth = Column(Date)
    is_active = Column(Boolean, default=True)
    rbfa_player_id = Column(String(100), index=True)
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    appearances = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    bio = Column(Text)
    joined_year = Column(String(10))

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    team = relationship("Team", back_populates="players")
    match_events = relationship("MatchEvent", back_populates="player")
    match_lineups = relationship("MatchLineup", back_populates="player")


# ── COMPETITIONS ─────────────────────────────────────────


class Competition(Base):
    __tablename__ = "competitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(CompetitionType), default=CompetitionType.league)
    rbfa_series_id = Column(String(100), unique=True, index=True)

    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=True)
    season = relationship("Season", back_populates="competitions")
    matches = relationship("Match", back_populates="competition")
    standings = relationship("Standing", back_populates="competition")


# ── MATCHES ──────────────────────────────────────────────


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_date = Column(DateTime(timezone=True), index=True)
    is_home = Column(Boolean, nullable=False, default=True)
    opponent_name = Column(String(255), nullable=False)
    opponent_logo_url = Column(String(500))
    opponent_rbfa_id = Column(String(100))
    home_score = Column(Integer)
    away_score = Column(Integer)
    status = Column(
        Enum(MatchStatus), default=MatchStatus.scheduled, nullable=False, index=True
    )
    matchday = Column(Integer)
    venue = Column(String(255))
    rbfa_match_id = Column(String(100), unique=True, index=True)
    formation = Column(String(20))  # "4-3-3"
    live_minute = Column(Integer)
    motm_player_id = Column(Integer, ForeignKey("players.id"), nullable=True)

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id"), nullable=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=True, index=True)

    team = relationship("Team", back_populates="matches")
    competition = relationship("Competition", back_populates="matches")
    season = relationship("Season", back_populates="matches")
    events = relationship(
        "MatchEvent", back_populates="match", cascade="all, delete-orphan"
    )
    lineups = relationship(
        "MatchLineup", back_populates="match", cascade="all, delete-orphan"
    )
    motm_player = relationship("Player", foreign_keys="Match.motm_player_id")

    __table_args__ = (
        Index("ix_matches_team_status", "team_id", "status"),
        Index("ix_matches_team_season", "team_id", "season_id"),
    )


# ── MATCH EVENTS ─────────────────────────────────────────


class MatchEvent(Base):
    __tablename__ = "match_events"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(MatchEventType), nullable=False)
    minute = Column(Integer)
    player_name = Column(String(255))  # fallback when no FK
    is_our_team = Column(Boolean, default=True)

    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)

    match = relationship("Match", back_populates="events")
    player = relationship("Player", back_populates="match_events")


# ── MATCH LINEUPS ────────────────────────────────────────


class MatchLineup(Base):
    __tablename__ = "match_lineups"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(255))
    jersey_number = Column(Integer)
    position_x = Column(Float)  # 0-100, left to right
    position_y = Column(Float)  # 0-100, bottom to top
    is_starting = Column(Boolean, default=True)
    is_our_team = Column(Boolean, default=True)

    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)

    match = relationship("Match", back_populates="lineups")
    player = relationship("Player", back_populates="match_lineups")


# ── STANDINGS ────────────────────────────────────────────


class Standing(Base):
    __tablename__ = "standings"

    id = Column(Integer, primary_key=True, index=True)
    position = Column(Integer)
    team_name = Column(String(255), nullable=False)
    team_logo_url = Column(String(500))
    rbfa_team_id = Column(String(100))
    played = Column(Integer, default=0)
    won = Column(Integer, default=0)
    drawn = Column(Integer, default=0)
    lost = Column(Integer, default=0)
    goals_for = Column(Integer, default=0)
    goals_against = Column(Integer, default=0)
    goal_diff = Column(Integer, default=0)
    points = Column(Integer, default=0)
    is_us = Column(Boolean, default=False)
    form = Column(String(10))  # "WWDWL"
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    competition_id = Column(
        Integer, ForeignKey("competitions.id"), nullable=False, index=True
    )
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False, index=True)

    competition = relationship("Competition", back_populates="standings")
    season = relationship("Season", back_populates="standings")

    __table_args__ = (Index("ix_standings_comp_season", "competition_id", "season_id"),)


# ── SHOP ITEMS ───────────────────────────────────────────


class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500))
    category = Column(String(50), default="other", index=True)
    sizes = Column(JSON)  # ["XS","S","M","L","XL","XXL"]
    stock_quantity = Column(Integer, default=0)
    is_available = Column(Boolean, default=True, index=True)
    sort_order = Column(Integer, default=0)
    color_label = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order_items = relationship("OrderItem", back_populates="shop_item")


# ── ORDERS ───────────────────────────────────────────────


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50))
    customer_address = Column(Text)
    status = Column(
        Enum(OrderStatus), default=OrderStatus.pending, nullable=False, index=True
    )
    total = Column(Numeric(10, 2), default=0)
    mollie_payment_id = Column(String(100), index=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    size = Column(String(20))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    shop_item_id = Column(
        Integer, ForeignKey("shop_items.id"), nullable=False, index=True
    )

    order = relationship("Order", back_populates="items")
    shop_item = relationship("ShopItem", back_populates="order_items")


# ── EVENTS ───────────────────────────────────────────────


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True))
    location = Column(String(255))
    image_url = Column(String(500))
    is_published = Column(Boolean, default=False, index=True)
    registration_url = Column(String(500))
    event_type = Column(String(20))  # social, tournament, celebration, sponsor
    price = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ── SCRAPER RUNS ─────────────────────────────────────────


class ScraperRun(Base):
    __tablename__ = "scraper_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    status = Column(Enum(ScraperStatus), default=ScraperStatus.running)
    matches_updated = Column(Integer, default=0)
    standings_updated = Column(Integer, default=0)
    players_updated = Column(Integer, default=0)
    error_message = Column(Text)
    duration_seconds = Column(Float)


# ── NEWS ─────────────────────────────────────────────────


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50))  # match, youth, club, event
    tldr = Column(Text)
    body = Column(Text)
    image_url = Column(String(500))
    is_pinned = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ── SPONSORS ─────────────────────────────────────────────


class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    tier = Column(String(20))  # main, gold, silver, bronze
    sector = Column(String(100))
    logo_url = Column(String(500))
    website = Column(String(500))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
