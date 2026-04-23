"""football_schema

Revision ID: a001_football_schema
Revises: b15c599ea2bb
Create Date: 2026-04-23

"""

from alembic import op
import sqlalchemy as sa

revision = "a001_football_schema"
down_revision = "b15c599ea2bb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Drop old inventory tables ─────────────────────────
    op.drop_table("stock_movements")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("items")
    op.drop_table("warehouses")
    op.drop_table("suppliers")
    op.drop_table("categories")

    # Recreate users table with new schema (drop & recreate)
    op.drop_table("users")

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("admin", name="userrole"),
            nullable=False,
            server_default="admin",
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # ── New football tables ───────────────────────────────

    op.create_table(
        "seasons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(20), nullable=False, unique=True),
        sa.Column("start_year", sa.Integer(), nullable=False),
        sa.Column("end_year", sa.Integer(), nullable=False),
        sa.Column("is_current", sa.Boolean(), server_default=sa.text("false")),
    )
    op.create_index("ix_seasons_is_current", "seasons", ["is_current"])

    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column(
            "age_group",
            sa.Enum(
                "first_team",
                "reserves",
                "u17",
                "u16",
                "u15",
                "u13",
                "u12",
                "u11",
                "u10",
                "u9",
                "u8",
                "u7",
                "u6",
                name="agegroup",
            ),
            nullable=False,
        ),
        sa.Column("logo_url", sa.String(500)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("rbfa_team_id", sa.String(100), unique=True),
    )
    op.create_index("ix_teams_slug", "teams", ["slug"])
    op.create_index("ix_teams_age_group", "teams", ["age_group"])
    op.create_index("ix_teams_rbfa_team_id", "teams", ["rbfa_team_id"])

    op.create_table(
        "players",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("jersey_number", sa.Integer()),
        sa.Column(
            "position",
            sa.Enum(
                "goalkeeper", "defender", "midfielder", "forward", name="playerposition"
            ),
        ),
        sa.Column("photo_url", sa.String(500)),
        sa.Column("date_of_birth", sa.Date()),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("rbfa_player_id", sa.String(100)),
        sa.Column("team_id", sa.Integer(), sa.ForeignKey("teams.id"), nullable=False),
    )
    op.create_index("ix_players_team_id", "players", ["team_id"])
    op.create_index("ix_players_rbfa_player_id", "players", ["rbfa_player_id"])

    op.create_table(
        "competitions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "type",
            sa.Enum("league", "cup", "friendly", name="competitiontype"),
            server_default="league",
        ),
        sa.Column("rbfa_series_id", sa.String(100), unique=True),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id")),
    )
    op.create_index(
        "ix_competitions_rbfa_series_id", "competitions", ["rbfa_series_id"]
    )

    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("match_date", sa.DateTime(timezone=True)),
        sa.Column(
            "is_home", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column("opponent_name", sa.String(255), nullable=False),
        sa.Column("opponent_logo_url", sa.String(500)),
        sa.Column("opponent_rbfa_id", sa.String(100)),
        sa.Column("home_score", sa.Integer()),
        sa.Column("away_score", sa.Integer()),
        sa.Column(
            "status",
            sa.Enum(
                "scheduled",
                "live",
                "finished",
                "postponed",
                "cancelled",
                name="matchstatus",
            ),
            nullable=False,
            server_default="scheduled",
        ),
        sa.Column("matchday", sa.Integer()),
        sa.Column("venue", sa.String(255)),
        sa.Column("rbfa_match_id", sa.String(100), unique=True),
        sa.Column("team_id", sa.Integer(), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("competition_id", sa.Integer(), sa.ForeignKey("competitions.id")),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id")),
    )
    op.create_index("ix_matches_match_date", "matches", ["match_date"])
    op.create_index("ix_matches_status", "matches", ["status"])
    op.create_index("ix_matches_rbfa_match_id", "matches", ["rbfa_match_id"])
    op.create_index("ix_matches_team_status", "matches", ["team_id", "status"])
    op.create_index("ix_matches_team_season", "matches", ["team_id", "season_id"])

    op.create_table(
        "match_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "type",
            sa.Enum(
                "goal",
                "own_goal",
                "penalty",
                "yellow_card",
                "red_card",
                "second_yellow",
                "sub_in",
                "sub_out",
                name="matcheventtype",
            ),
            nullable=False,
        ),
        sa.Column("minute", sa.Integer()),
        sa.Column("player_name", sa.String(255)),
        sa.Column("is_our_team", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "match_id", sa.Integer(), sa.ForeignKey("matches.id"), nullable=False
        ),
        sa.Column("player_id", sa.Integer(), sa.ForeignKey("players.id")),
    )
    op.create_index("ix_match_events_match_id", "match_events", ["match_id"])

    op.create_table(
        "match_lineups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_name", sa.String(255)),
        sa.Column("jersey_number", sa.Integer()),
        sa.Column("position_x", sa.Float()),
        sa.Column("position_y", sa.Float()),
        sa.Column("is_starting", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("is_our_team", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "match_id", sa.Integer(), sa.ForeignKey("matches.id"), nullable=False
        ),
        sa.Column("player_id", sa.Integer(), sa.ForeignKey("players.id")),
    )
    op.create_index("ix_match_lineups_match_id", "match_lineups", ["match_id"])

    op.create_table(
        "standings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("position", sa.Integer()),
        sa.Column("team_name", sa.String(255), nullable=False),
        sa.Column("team_logo_url", sa.String(500)),
        sa.Column("rbfa_team_id", sa.String(100)),
        sa.Column("played", sa.Integer(), server_default=sa.text("0")),
        sa.Column("won", sa.Integer(), server_default=sa.text("0")),
        sa.Column("drawn", sa.Integer(), server_default=sa.text("0")),
        sa.Column("lost", sa.Integer(), server_default=sa.text("0")),
        sa.Column("goals_for", sa.Integer(), server_default=sa.text("0")),
        sa.Column("goals_against", sa.Integer(), server_default=sa.text("0")),
        sa.Column("goal_diff", sa.Integer(), server_default=sa.text("0")),
        sa.Column("points", sa.Integer(), server_default=sa.text("0")),
        sa.Column("is_us", sa.Boolean(), server_default=sa.text("false")),
        sa.Column(
            "last_updated", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column(
            "competition_id",
            sa.Integer(),
            sa.ForeignKey("competitions.id"),
            nullable=False,
        ),
        sa.Column(
            "season_id", sa.Integer(), sa.ForeignKey("seasons.id"), nullable=False
        ),
    )
    op.create_index(
        "ix_standings_comp_season", "standings", ["competition_id", "season_id"]
    )

    op.create_table(
        "shop_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column(
            "category",
            sa.Enum("shirt", "scarf", "hat", "other", name="shopcategory"),
            server_default="other",
        ),
        sa.Column("sizes", sa.JSON()),
        sa.Column("stock_quantity", sa.Integer(), server_default=sa.text("0")),
        sa.Column("is_available", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), server_default=sa.text("0")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_email", sa.String(255), nullable=False),
        sa.Column("customer_phone", sa.String(50)),
        sa.Column("customer_address", sa.Text()),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "paid",
                "shipped",
                "delivered",
                "cancelled",
                name="orderstatus",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("total", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("mollie_payment_id", sa.String(100)),
        sa.Column("notes", sa.Text()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_mollie_payment_id", "orders", ["mollie_payment_id"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("size", sa.String(20)),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column(
            "shop_item_id", sa.Integer(), sa.ForeignKey("shop_items.id"), nullable=False
        ),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_shop_item_id", "order_items", ["shop_item_id"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True)),
        sa.Column("location", sa.String(255)),
        sa.Column("image_url", sa.String(500)),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("registration_url", sa.String(500)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_events_date", "events", ["date"])
    op.create_index("ix_events_is_published", "events", ["is_published"])

    op.create_table(
        "scraper_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("run_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "status",
            sa.Enum("running", "success", "error", name="scraperstatus"),
            server_default="running",
        ),
        sa.Column("matches_updated", sa.Integer(), server_default=sa.text("0")),
        sa.Column("standings_updated", sa.Integer(), server_default=sa.text("0")),
        sa.Column("players_updated", sa.Integer(), server_default=sa.text("0")),
        sa.Column("error_message", sa.Text()),
        sa.Column("duration_seconds", sa.Float()),
    )
    op.create_index("ix_scraper_runs_run_at", "scraper_runs", ["run_at"])


def downgrade() -> None:
    op.drop_table("scraper_runs")
    op.drop_table("events")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("shop_items")
    op.drop_table("standings")
    op.drop_table("match_lineups")
    op.drop_table("match_events")
    op.drop_table("matches")
    op.drop_table("competitions")
    op.drop_table("players")
    op.drop_table("teams")
    op.drop_table("seasons")
    op.drop_table("users")
    # Drop enums
    for enum_name in [
        "userrole",
        "agegroup",
        "playerposition",
        "competitiontype",
        "matchstatus",
        "matcheventtype",
        "orderstatus",
        "shopcategory",
        "scraperstatus",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
