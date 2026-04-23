"""
Seeds the Toekomst Relegem database with:
  - 1 admin user
  - 1 current season
  - 13 teams (all age groups)
  - competitions per team
  - sample matches (past + upcoming)
  - players for first team + reserves
  - standings
  - shop items
  - events
  - news articles
  - sponsors
"""

import bcrypt
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal

from app.database import SessionLocal
from app.models import (
    User, UserRole,
    Season,
    Team, AgeGroup,
    Player, PlayerPosition,
    Competition, CompetitionType,
    Match, MatchStatus, MatchEvent, MatchEventType, MatchLineup,
    Standing,
    ShopItem, ShopCategory,
    Event,
    News,
    Sponsor,
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed() -> None:
    db = SessionLocal()
    try:
        # ── WIPE ──────────────────────────────────────────────────────────
        print("Clearing existing data...")
        for model in [MatchLineup, MatchEvent, Match, Standing, Player,
                      Competition, Team, Season, ShopItem, Event, News, Sponsor, User]:
            db.query(model).delete()
        db.commit()

        # ── ADMIN USER ────────────────────────────────────────────────────
        print("Seeding admin user...")
        admin = User(
            email="admin@toekomstrelegem.be",
            username="admin",
            password=hash_password("admin123"),
            role=UserRole.admin,
            is_active=True,
        )
        db.add(admin)
        db.commit()

        # ── SEASON ────────────────────────────────────────────────────────
        print("Seeding season...")
        season = Season(name="2024-2025", start_year=2024, end_year=2025, is_current=True)
        db.add(season)
        db.commit()

        # ── TEAMS ─────────────────────────────────────────────────────────
        print("Seeding 13 teams...")
        teams_data = [
            (AgeGroup.first_team, "Toekomst Relegem A", "eerste-ploeg", "A", "Kevin Janssen"),
            (AgeGroup.reserves,   "Toekomst Relegem B", "reserves",     "B", "Luc Peeters"),
            (AgeGroup.u17,        "Toekomst Relegem U17", "u17",        "U17", "Thomas De Smet"),
            (AgeGroup.u16,        "Toekomst Relegem U16", "u16",        "U16", "Nico Willems"),
            (AgeGroup.u15,        "Toekomst Relegem U15", "u15",        "U15", "Bram Claes"),
            (AgeGroup.u13,        "Toekomst Relegem U13", "u13",        "U13", "Pieter Moons"),
            (AgeGroup.u12,        "Toekomst Relegem U12", "u12",        "U12", "Dirk Smeets"),
            (AgeGroup.u11,        "Toekomst Relegem U11", "u11",        "U11", "Jan Bogaerts"),
            (AgeGroup.u10,        "Toekomst Relegem U10", "u10",        "U10", "Marc Leclercq"),
            (AgeGroup.u9,         "Toekomst Relegem U9",  "u9",         "U9",  "Koen Vermeersch"),
            (AgeGroup.u8,         "Toekomst Relegem U8",  "u8",         "U8",  "Wout Stevens"),
            (AgeGroup.u7,         "Toekomst Relegem U7",  "u7",         "U7",  "Stef Nijs"),
            (AgeGroup.u6,         "Toekomst Relegem U6",  "u6",         "U6",  "Raf Gooris"),
        ]
        teams: dict[AgeGroup, Team] = {}
        for age_group, name, slug, short_name, coach in teams_data:
            t = Team(
                name=name,
                slug=slug,
                age_group=age_group,
                short_name=short_name,
                coach=coach,
                color="#FF6200",
                is_active=True,
            )
            db.add(t)
            db.flush()
            teams[age_group] = t
        db.commit()

        # ── COMPETITIONS ──────────────────────────────────────────────────
        print("Seeding competitions...")
        comp_a = Competition(name="Nationale 3 Afd. A", type=CompetitionType.league,
                             season_id=season.id, rbfa_series_id="NAT3A-2425")
        comp_b = Competition(name="Provinciale 1 Brabant", type=CompetitionType.league,
                             season_id=season.id, rbfa_series_id="PROV1BRA-2425")
        cup_a  = Competition(name="Provinciale Beker", type=CompetitionType.cup,
                             season_id=season.id, rbfa_series_id="CUPBRA-2425")
        db.add_all([comp_a, comp_b, cup_a])
        db.commit()

        # ── PLAYERS (first team + reserves) ───────────────────────────────
        print("Seeding players...")
        first_team_players_data = [
            (1,  "Mathias", "Declercq",  PlayerPosition.goalkeeper, date(1995, 3, 12)),
            (4,  "Senne",   "Bogaert",   PlayerPosition.defender,   date(1998, 7, 22)),
            (5,  "Dries",   "Vandenberghe", PlayerPosition.defender, date(1997, 11, 5)),
            (6,  "Ruben",   "Maes",      PlayerPosition.defender,   date(2000, 1, 18)),
            (3,  "Jonas",   "Claes",     PlayerPosition.defender,   date(1999, 9, 30)),
            (8,  "Kevin",   "Willems",   PlayerPosition.midfielder, date(1996, 4, 14)),
            (6,  "Bram",    "De Backer", PlayerPosition.midfielder, date(2001, 6, 25)),
            (10, "Pieter",  "Lemmens",   PlayerPosition.midfielder, date(1998, 2, 8)),
            (7,  "Arne",    "Van Dyck",  PlayerPosition.forward,    date(2002, 8, 19)),
            (9,  "Thomas",  "Goossens",  PlayerPosition.forward,    date(1999, 12, 3)),
            (11, "Wout",    "Hermans",   PlayerPosition.forward,    date(2003, 5, 7)),
        ]
        first_team = teams[AgeGroup.first_team]
        players: list[Player] = []
        for jersey, first, last, pos, dob in first_team_players_data:
            p = Player(
                first_name=first, last_name=last,
                jersey_number=jersey, position=pos,
                date_of_birth=dob, is_active=True,
                team_id=first_team.id,
                appearances=18, goals=3 if pos == PlayerPosition.forward else 0,
            )
            db.add(p)
            db.flush()
            players.append(p)
        db.commit()

        # ── MATCHES ───────────────────────────────────────────────────────
        print("Seeding matches...")
        now = datetime.now(timezone.utc)

        past_opponents = [
            ("FC Dilbeek", True,  2, 1, MatchStatus.finished, -35),
            ("Strombeek FC", False, 0, 0, MatchStatus.finished, -28),
            ("JS Ganshoren", True,  3, 0, MatchStatus.finished, -21),
            ("Pajot United", False, 1, 2, MatchStatus.finished, -14),
            ("SK Merchtem",  True,  1, 1, MatchStatus.finished, -7),
        ]
        upcoming_opponents = [
            ("Eendracht Aalst", True,  None, None, MatchStatus.scheduled, 7),
            ("White Star Bruxelles", False, None, None, MatchStatus.scheduled, 14),
            ("RCS Brainois", True, None, None, MatchStatus.scheduled, 21),
        ]

        all_match_data = past_opponents + upcoming_opponents
        matches: list[Match] = []
        for i, (opp, is_home, home_sc, away_sc, status, day_offset) in enumerate(all_match_data, 1):
            m = Match(
                match_date=now + timedelta(days=day_offset),
                is_home=is_home,
                opponent_name=opp,
                home_score=home_sc,
                away_score=away_sc,
                status=status,
                matchday=i,
                venue="Sportpark Relegem" if is_home else f"Terrein {opp}",
                team_id=first_team.id,
                competition_id=comp_a.id,
                season_id=season.id,
                formation="4-3-3",
            )
            db.add(m)
            db.flush()
            matches.append(m)

        db.commit()

        # ── MATCH EVENTS (for past matches) ───────────────────────────────
        print("Seeding match events...")
        finished = [m for m in matches if m.status == MatchStatus.finished]
        scorer = players[9]   # Thomas Goossens
        assist = players[7]   # Pieter Lemmens
        yc_player = players[3]  # Ruben Maes

        for match in finished[:3]:
            db.add(MatchEvent(
                match_id=match.id, type=MatchEventType.goal,
                minute=23, player_id=scorer.id,
                player_name=f"{scorer.first_name} {scorer.last_name}", is_our_team=True,
            ))
            db.add(MatchEvent(
                match_id=match.id, type=MatchEventType.yellow_card,
                minute=55, player_id=yc_player.id,
                player_name=f"{yc_player.first_name} {yc_player.last_name}", is_our_team=True,
            ))
        db.commit()

        # ── LINEUPS (for most recent finished match) ───────────────────────
        print("Seeding lineup for last match...")
        last_match = finished[-1]
        positions = [
            (50, 10), (20, 30), (40, 30), (60, 30), (80, 30),
            (25, 55), (50, 55), (75, 55), (20, 75), (50, 75), (80, 75),
        ]
        for player, (px, py) in zip(players[:11], positions):
            db.add(MatchLineup(
                match_id=last_match.id,
                player_id=player.id,
                player_name=f"{player.first_name} {player.last_name}",
                jersey_number=player.jersey_number,
                position_x=px, position_y=py,
                is_starting=True, is_our_team=True,
            ))
        db.commit()

        # ── STANDINGS ─────────────────────────────────────────────────────
        print("Seeding standings...")
        table_data = [
            ("Eendracht Aalst",        1, 18, 14, 2, 2, 42, 15, 27, 44, False),
            ("Toekomst Relegem A",     2, 18, 12, 3, 3, 38, 20, 18, 39, True),
            ("JS Ganshoren",           3, 18, 11, 2, 5, 33, 22, 11, 35, False),
            ("White Star Bruxelles",   4, 18, 10, 3, 5, 30, 24,  6, 33, False),
            ("SK Merchtem",            5, 18,  9, 4, 5, 28, 25,  3, 31, False),
            ("FC Dilbeek",             6, 18,  8, 3, 7, 25, 27, -2, 27, False),
            ("RCS Brainois",           7, 18,  7, 3, 8, 24, 28, -4, 24, False),
            ("Strombeek FC",           8, 18,  6, 4, 8, 22, 30, -8, 22, False),
            ("Pajot United",           9, 18,  5, 2,11, 19, 33,-14, 17, False),
            ("Sporting Asse",         10, 18,  3, 2,13, 15, 40,-25, 11, False),
        ]
        for team_name, pos, played, won, drawn, lost, gf, ga, gd, pts, is_us in table_data:
            db.add(Standing(
                position=pos, team_name=team_name,
                played=played, won=won, drawn=drawn, lost=lost,
                goals_for=gf, goals_against=ga, goal_diff=gd, points=pts,
                is_us=is_us,
                competition_id=comp_a.id, season_id=season.id,
            ))
        db.commit()

        # ── SHOP ITEMS ────────────────────────────────────────────────────
        print("Seeding shop items...")
        shop_items = [
            ShopItem(name="Thuisshirt 2024-2025", description="Officieel thuisshirt oranje/zwart.",
                     price=Decimal("59.99"), category="shirt",
                     sizes=["S", "M", "L", "XL", "XXL"], stock_quantity=50,
                     is_available=True, sort_order=1, color_label="Oranje/Zwart"),
            ShopItem(name="Uitshirt 2024-2025", description="Officieel uitshirt wit/zwart.",
                     price=Decimal("59.99"), category="shirt",
                     sizes=["S", "M", "L", "XL"], stock_quantity=35,
                     is_available=True, sort_order=2, color_label="Wit/Zwart"),
            ShopItem(name="Clubsjaal", description="Warme clubsjaal met clubkleuren.",
                     price=Decimal("19.99"), category="scarf",
                     sizes=None, stock_quantity=100,
                     is_available=True, sort_order=3, color_label="Oranje/Zwart"),
            ShopItem(name="Trainingsjack", description="Lichtgewicht trainingsjack.",
                     price=Decimal("49.99"), category="jacket",
                     sizes=["S", "M", "L", "XL", "XXL"], stock_quantity=20,
                     is_available=True, sort_order=4, color_label="Zwart"),
            ShopItem(name="Snapback Cap", description="Snapback cap met borduursel.",
                     price=Decimal("24.99"), category="cap",
                     sizes=None, stock_quantity=60,
                     is_available=True, sort_order=5, color_label="Oranje"),
            ShopItem(name="Kindershirt 2024-2025", description="Thuisshirt voor kinderen (maat 116–164).",
                     price=Decimal("44.99"), category="kids",
                     sizes=["116", "128", "140", "152", "164"], stock_quantity=30,
                     is_available=True, sort_order=6, color_label="Oranje/Zwart"),
        ]
        db.add_all(shop_items)
        db.commit()

        # ── EVENTS ────────────────────────────────────────────────────────
        print("Seeding events...")
        events = [
            Event(title="Jaarlijkse clubavond", description="Gezellige avond voor alle leden en supporters.",
                  date=datetime(2025, 5, 10, 19, 0, tzinfo=timezone.utc),
                  location="Clubhuis Relegem", is_published=True, event_type="social", price=Decimal("0")),
            Event(title="Jeugdtornooi U10-U12", description="Zomertornooi voor de jeugd.",
                  date=datetime(2025, 6, 14, 9, 0, tzinfo=timezone.utc),
                  location="Sportpark Relegem", is_published=True, event_type="tournament", price=Decimal("5")),
            Event(title="Sponsordiner 2025", description="Exclusief diner voor sponsors en partners.",
                  date=datetime(2025, 4, 26, 18, 30, tzinfo=timezone.utc),
                  location="Restaurant De Kroon, Relegem", is_published=True, event_type="sponsor", price=Decimal("45")),
            Event(title="Kampioenenviering", description="Feest voor alle kampioenen van dit seizoen.",
                  date=datetime(2025, 6, 28, 17, 0, tzinfo=timezone.utc),
                  location="Sportpark Relegem", is_published=True, event_type="celebration", price=Decimal("0")),
        ]
        db.add_all(events)
        db.commit()

        # ── NEWS ──────────────────────────────────────────────────────────
        print("Seeding news...")
        news = [
            News(title="3-0 zege tegen JS Ganshoren!",
                 category="match",
                 tldr="Dominant optreden met drie doelpunten zonder tegengoal.",
                 body="Toekomst Relegem haalde in eigen huis stevig uit tegen JS Ganshoren. "
                      "Doelpunten van Goossens (2x) en Hermans bezorgden de ploeg drie kostbare punten.",
                 is_pinned=True, is_published=True),
            News(title="Nieuwe shirtsponsor voor seizoen 2025-2026",
                 category="club",
                 tldr="We verwelkomen een nieuwe shirtsponsor voor volgend seizoen.",
                 body="Toekomst Relegem is verheugd een nieuwe shirtsponsor te mogen verwelkomen. "
                      "Meer details volgen binnenkort.",
                 is_pinned=False, is_published=True),
            News(title="U15 wint provinciale beker",
                 category="youth",
                 tldr="Onze U15 kroonde zich tot provinciekampioen na spannende finale.",
                 body="In een spannende finale versloeg onze U15 Eendracht Aalst met 2-1 na verlengingen.",
                 is_pinned=False, is_published=True),
            News(title="Inschrijvingen seizoen 2025-2026 open",
                 category="club",
                 tldr="Vanaf 1 mei kunnen spelers zich inschrijven voor volgend seizoen.",
                 body="Alle leeftijdsgroepen van U6 tot en met de eerste ploeg zijn welkom. "
                      "Inschrijven kan via de website of op het secretariaat.",
                 is_pinned=False, is_published=True),
        ]
        db.add_all(news)
        db.commit()

        # ── SPONSORS ──────────────────────────────────────────────────────
        print("Seeding sponsors...")
        sponsors = [
            Sponsor(name="Garage Van Acker", tier="main", sector="Automotive",
                    website="https://example.be", is_active=True, sort_order=1),
            Sponsor(name="Bakkerij De Mol", tier="gold", sector="Voeding",
                    website="https://example.be", is_active=True, sort_order=2),
            Sponsor(name="Elektro Peeters", tier="gold", sector="Elektronica",
                    website="https://example.be", is_active=True, sort_order=3),
            Sponsor(name="Notaris Claes & Partners", tier="silver", sector="Juridisch",
                    website="https://example.be", is_active=True, sort_order=4),
            Sponsor(name="Frituur 't Hoekje", tier="silver", sector="Horeca",
                    website="https://example.be", is_active=True, sort_order=5),
            Sponsor(name="Tuinaanleg Hermans", tier="bronze", sector="Tuin",
                    website="https://example.be", is_active=True, sort_order=6),
        ]
        db.add_all(sponsors)
        db.commit()

        # ── SUMMARY ───────────────────────────────────────────────────────
        print("\nSeeding complete!")
        print(f"  {db.query(User).count()} users")
        print(f"  {db.query(Team).count()} teams")
        print(f"  {db.query(Player).count()} players")
        print(f"  {db.query(Match).count()} matches")
        print(f"  {db.query(Standing).count()} standing rows")
        print(f"  {db.query(ShopItem).count()} shop items")
        print(f"  {db.query(Event).count()} events")
        print(f"  {db.query(News).count()} news articles")
        print(f"  {db.query(Sponsor).count()} sponsors")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
