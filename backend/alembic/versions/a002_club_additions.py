"""club_additions

Revision ID: a002_club_additions
Revises: a001_football_schema
Create Date: 2026-04-23
"""
from alembic import op
import sqlalchemy as sa

revision = "a002_club_additions"
down_revision = "a001_football_schema"
branch_labels = None
depends_on = None


def upgrade():
    # Teams
    op.add_column('teams', sa.Column('short_name', sa.String(10)))
    op.add_column('teams', sa.Column('coach', sa.String(255)))
    op.add_column('teams', sa.Column('assistant_coach', sa.String(255)))
    op.add_column('teams', sa.Column('color', sa.String(7)))

    # Players
    op.add_column('players', sa.Column('goals', sa.Integer(), server_default='0'))
    op.add_column('players', sa.Column('assists', sa.Integer(), server_default='0'))
    op.add_column('players', sa.Column('appearances', sa.Integer(), server_default='0'))
    op.add_column('players', sa.Column('yellow_cards', sa.Integer(), server_default='0'))
    op.add_column('players', sa.Column('red_cards', sa.Integer(), server_default='0'))
    op.add_column('players', sa.Column('bio', sa.Text()))
    op.add_column('players', sa.Column('joined_year', sa.String(10)))

    # Matches
    op.add_column('matches', sa.Column('formation', sa.String(20)))
    op.add_column('matches', sa.Column('live_minute', sa.Integer()))
    op.add_column('matches', sa.Column('motm_player_id', sa.Integer(), sa.ForeignKey('players.id'), nullable=True))
    op.create_index('ix_matches_season_id', 'matches', ['season_id'])

    # Standings
    op.add_column('standings', sa.Column('form', sa.String(10)))

    # Events
    op.add_column('events', sa.Column('event_type', sa.String(20)))
    op.add_column('events', sa.Column('price', sa.Numeric(10, 2), server_default='0'))

    # Shop items — change category enum to varchar, add color_label
    # First remove the server default which references the enum type
    op.execute("ALTER TABLE shop_items ALTER COLUMN category DROP DEFAULT")
    op.alter_column('shop_items', 'category',
        type_=sa.String(50),
        postgresql_using='category::text',
        existing_nullable=True)
    op.execute('DROP TYPE IF EXISTS shopcategory CASCADE')
    op.add_column('shop_items', sa.Column('color_label', sa.String(100)))

    # News table
    op.create_table('news',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('category', sa.String(50)),
        sa.Column('tldr', sa.Text()),
        sa.Column('body', sa.Text()),
        sa.Column('image_url', sa.String(500)),
        sa.Column('is_pinned', sa.Boolean(), server_default='false'),
        sa.Column('is_published', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_news_id', 'news', ['id'])
    op.create_index('ix_news_is_published', 'news', ['is_published'])

    # Sponsors table
    op.create_table('sponsors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('tier', sa.String(20)),
        sa.Column('sector', sa.String(100)),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('website', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
    )
    op.create_index('ix_sponsors_id', 'sponsors', ['id'])


def downgrade():
    op.drop_table('sponsors')
    op.drop_table('news')
    op.drop_column('shop_items', 'color_label')
    op.drop_column('events', 'price')
    op.drop_column('events', 'event_type')
    op.drop_column('standings', 'form')
    op.drop_index('ix_matches_season_id', 'matches')
    op.drop_column('matches', 'motm_player_id')
    op.drop_column('matches', 'live_minute')
    op.drop_column('matches', 'formation')
    op.drop_column('players', 'joined_year')
    op.drop_column('players', 'bio')
    op.drop_column('players', 'red_cards')
    op.drop_column('players', 'yellow_cards')
    op.drop_column('players', 'appearances')
    op.drop_column('players', 'assists')
    op.drop_column('players', 'goals')
    op.drop_column('teams', 'color')
    op.drop_column('teams', 'assistant_coach')
    op.drop_column('teams', 'coach')
    op.drop_column('teams', 'short_name')
