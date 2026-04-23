"""
Sync RBFA data into the local database.
All functions accept a SQLAlchemy Session and update models in-place.
"""

import re
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import (
    Team,
    Player,
    Competition,
    Match,
    MatchEvent,
    Standing,
    AgeGroup,
    CompetitionType,
    MatchStatus,
    MatchEventType,
    Season,
)
from scraper import rbfa_client

logger = logging.getLogger(__name__)


# ── HELPERS ──────────────────────────────────────────────


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text


def _map_age_group(name: str) -> AgeGroup:
    """Map RBFA team name to AgeGroup enum."""
    lower = name.lower()
    if "eerste elftal" in lower or "1ste elftal" in lower:
        return AgeGroup.first_team
    if "reserv" in lower:
        return AgeGroup.reserves
    # Extract "u17", "u16" etc.
    match = re.search(r"\bu(\d+)\b", lower)
    if match:
        age = int(match.group(1))
        mapping = {
            17: AgeGroup.u17,
            16: AgeGroup.u16,
            15: AgeGroup.u15,
            13: AgeGroup.u13,
            12: AgeGroup.u12,
            11: AgeGroup.u11,
            10: AgeGroup.u10,
            9: AgeGroup.u9,
            8: AgeGroup.u8,
            7: AgeGroup.u7,
            6: AgeGroup.u6,
        }
        if age in mapping:
            return mapping[age]
    return AgeGroup.first_team


def _map_state(state: str) -> MatchStatus:
    mapping = {
        "planned": MatchStatus.scheduled,
        "finished": MatchStatus.finished,
        "postponed": MatchStatus.postponed,
        "cancelled": MatchStatus.cancelled,
        "forfeitByOneTeam": MatchStatus.finished,
        "live": MatchStatus.live,
    }
    return mapping.get(state, MatchStatus.scheduled)


def _map_event_kind(kind: str) -> MatchEventType | None:
    mapping = {
        "goal": MatchEventType.goal,
        "owngoal": MatchEventType.own_goal,
        "yellow": MatchEventType.yellow_card,
        "red": MatchEventType.red_card,
        "secondyellow": MatchEventType.second_yellow,
        "in": MatchEventType.sub_in,
        "out": MatchEventType.sub_out,
        "penalty": MatchEventType.penalty,
    }
    return mapping.get(kind)


def _parse_datetime(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        # Handle ISO 8601 with or without timezone
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        logger.warning("Could not parse datetime: %s", raw)
        return None


def _calculate_scores(events: list, is_home: bool) -> tuple[int, int]:
    """
    Calculate home_score and away_score from match events.
    Returns (our_score, opponent_score).
    """
    home_goals = 0
    away_goals = 0
    for group in events:
        for e in group.get("home", []):
            k = e.get("kind", "")
            if k == "goal":
                home_goals += 1
            elif k == "owngoal":
                away_goals += 1  # own goal by home team → away scores
        for e in group.get("away", []):
            k = e.get("kind", "")
            if k == "goal":
                away_goals += 1
            elif k == "owngoal":
                home_goals += 1  # own goal by away team → home scores
    return (home_goals, away_goals)


def _get_or_create_current_season(db: Session) -> Season:
    season = db.query(Season).filter_by(is_current=True).first()
    if not season:
        # Create a default season
        now = datetime.now()
        year = now.year
        # Football season spans two calendar years (Aug-May)
        if now.month >= 8:
            start, end = year, year + 1
        else:
            start, end = year - 1, year
        name = f"{start}-{end}"
        season = db.query(Season).filter_by(name=name).first()
        if not season:
            season = Season(name=name, start_year=start, end_year=end, is_current=True)
            db.add(season)
            db.flush()
    return season


def _get_or_create_competition(db: Session, series: dict) -> Competition:
    series_id = series["id"]
    comp = db.query(Competition).filter_by(rbfa_series_id=series_id).first()
    if not comp:
        comp = Competition(
            name=series.get("name", series_id),
            rbfa_series_id=series_id,
            type=CompetitionType.league,
        )
        db.add(comp)
        db.flush()
    return comp


# ── SYNC FUNCTIONS ────────────────────────────────────────


def sync_teams(db: Session) -> int:
    """
    Fetch all teams for Toekomst Relegem from RBFA and upsert into DB.
    Returns number of teams synced.
    """
    teams_data = rbfa_client.get_club_teams()
    count = 0
    for t in teams_data:
        team = db.query(Team).filter_by(rbfa_team_id=t["id"]).first()
        if not team:
            slug = _slugify(t["name"])
            # Ensure slug uniqueness
            base_slug = slug
            i = 1
            while db.query(Team).filter_by(slug=slug).first():
                slug = f"{base_slug}-{i}"
                i += 1
            team = Team(
                name=t["name"],
                slug=slug,
                age_group=_map_age_group(t["name"]),
                rbfa_team_id=t["id"],
                is_active=True,
            )
            db.add(team)
            logger.info("Created team: %s (%s)", t["name"], t["id"])
        else:
            team.name = t["name"]
        count += 1

    db.commit()
    logger.info("Synced %d teams", count)
    return count


def sync_players(db: Session) -> int:
    """
    Sync players for all active teams.
    Returns total number of player records upserted.
    """
    teams = db.query(Team).filter_by(is_active=True).all()
    total = 0
    for team in teams:
        if not team.rbfa_team_id:
            continue
        try:
            players_data = rbfa_client.get_team_members(team.rbfa_team_id)
        except Exception as e:
            logger.warning("Failed to fetch players for team %s: %s", team.name, e)
            continue

        for p in players_data:
            player = (
                db.query(Player)
                .filter_by(rbfa_player_id=p["id"], team_id=team.id)
                .first()
            )
            if not player:
                player = Player(
                    first_name=p.get("firstName", ""),
                    last_name=p.get("lastName", ""),
                    rbfa_player_id=p["id"],
                    team_id=team.id,
                    is_active=True,
                )
                db.add(player)
            else:
                player.first_name = p.get("firstName", player.first_name)
                player.last_name = p.get("lastName", player.last_name)
            total += 1

        db.commit()
        logger.info("Synced %d players for %s", len(players_data), team.name)

    return total


def sync_matches(db: Session) -> int:
    """
    Sync match calendars for all active teams.
    Returns number of match records upserted.
    """
    teams = db.query(Team).filter_by(is_active=True).all()
    total = 0
    seen_series: dict[str, Competition] = {}

    for team in teams:
        if not team.rbfa_team_id:
            continue
        try:
            calendar = rbfa_client.get_team_calendar(team.rbfa_team_id)
        except Exception as e:
            logger.warning("Failed to fetch calendar for team %s: %s", team.name, e)
            continue

        for m in calendar:
            rbfa_id = m["id"]

            # Get or create competition
            competition = None
            if m.get("series"):
                s = m["series"]
                if s["id"] not in seen_series:
                    seen_series[s["id"]] = _get_or_create_competition(db, s)
                competition = seen_series[s["id"]]

            # Determine home/away and opponent
            home_team_id = m["homeTeam"]["id"]
            is_home = home_team_id == team.rbfa_team_id
            opponent = m["awayTeam"] if is_home else m["homeTeam"]

            match = db.query(Match).filter_by(rbfa_match_id=rbfa_id).first()
            if not match:
                match = Match(rbfa_match_id=rbfa_id, team_id=team.id)
                db.add(match)

            match.team_id = team.id
            match.competition_id = competition.id if competition else None
            match.match_date = _parse_datetime(m.get("startTime"))
            match.status = _map_state(m.get("state", "planned"))
            match.is_home = is_home
            match.opponent_name = opponent["name"]
            match.opponent_rbfa_id = opponent["id"]

            total += 1

        db.commit()
        logger.info("Synced %d matches for %s", len(calendar), team.name)

    return total


def sync_match_events(db: Session) -> int:
    """
    For all finished matches that have no events yet, fetch full detail
    and populate match_events + calculate scores.
    Returns number of matches updated.
    """
    # Find finished matches with no events
    finished = (
        db.query(Match)
        .filter(Match.status == MatchStatus.finished)
        .filter(~Match.events.any())
        .all()
    )

    updated = 0
    for match in finished:
        try:
            detail = rbfa_client.get_match_detail(match.rbfa_match_id)
        except Exception as e:
            logger.warning(
                "Failed to fetch detail for match %s: %s", match.rbfa_match_id, e
            )
            continue
        if not detail:
            continue

        events = detail.get("events") or []

        # Calculate and store scores
        home_score, away_score = _calculate_scores(events, match.is_home)
        match.home_score = home_score
        match.away_score = away_score

        # Persist events
        for group in events:
            for side, is_our in [("home", match.is_home), ("away", not match.is_home)]:
                for e in group.get(side, []):
                    kind = _map_event_kind(e.get("kind", ""))
                    if kind is None:
                        continue
                    event = MatchEvent(
                        match_id=match.id,
                        type=kind,
                        minute=e.get("minute"),
                        is_our_team=is_our,
                    )
                    db.add(event)

        updated += 1

    db.commit()
    logger.info("Synced events for %d finished matches", updated)
    return updated


def sync_standings(db: Session) -> int:
    """
    Sync standings for all competitions that have matches.
    Returns number of standing rows upserted.
    """
    competitions = (
        db.query(Competition).filter(Competition.rbfa_series_id.isnot(None)).all()
    )

    total = 0
    season = _get_or_create_current_season(db)

    for comp in competitions:
        try:
            result = rbfa_client.get_series_rankings(comp.rbfa_series_id)
        except Exception as e:
            logger.warning("Failed to fetch rankings for %s: %s", comp.name, e)
            continue
        if not result:
            continue

        # Clear existing standings for this competition+season
        db.query(Standing).filter_by(
            competition_id=comp.id, season_id=season.id
        ).delete()

        rankings = result.get("rankings") or []
        for rank_group in rankings:
            teams = rank_group.get("teams") or []
            for team_data in teams:
                name = team_data.get("name", "")
                # Mark if this is Toekomst Relegem
                is_us = "relegem" in name.lower() or "toekomst" in name.lower()
                standing = Standing(
                    competition_id=comp.id,
                    season_id=season.id,
                    team_name=name,
                    team_logo_url=team_data.get("logo"),
                    position=team_data.get("position"),
                    points=team_data.get("points", 0),
                    goals_for=team_data.get("goalsFor", 0),
                    goals_against=team_data.get("goalsAgainst", 0),
                    goal_diff=team_data.get("goalDifference", 0),
                    is_us=is_us,
                )
                db.add(standing)
                total += 1

        db.commit()
        logger.info("Synced standings for %s", comp.name)

    return total


def run_full_sync(db: Session) -> dict:
    """
    Run a complete sync: teams → players → matches → events → standings.
    Returns a summary dict with counts.
    """
    logger.info("Starting full RBFA sync")
    summary = {}

    summary["teams"] = sync_teams(db)
    summary["players"] = sync_players(db)
    summary["matches"] = sync_matches(db)
    summary["events"] = sync_match_events(db)
    summary["standings"] = sync_standings(db)

    logger.info("Full sync complete: %s", summary)
    return summary
