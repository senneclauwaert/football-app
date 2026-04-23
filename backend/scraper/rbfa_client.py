"""
GraphQL client for the RBFA datalake API.
Endpoint: https://datalake-prod2018.rbfa.be/graphql
No authentication required for public club/match data.
Note: ID parameters must be type ID! (not String!) in GraphQL variables.
"""

import requests
import logging

GRAPHQL_URL = "https://datalake-prod2018.rbfa.be/graphql"
CLUB_ID = "2507"  # Toekomst Relegem

logger = logging.getLogger(__name__)

_session = requests.Session()
_session.headers.update({"Content-Type": "application/json"})


def _gql(query: str, variables: dict = None) -> dict:
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    resp = _session.post(GRAPHQL_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "errors" in data:
        logger.warning("GraphQL errors: %s", data["errors"])
    return data.get("data", {})


# ── CLUB & TEAMS ─────────────────────────────────────────

def get_club_teams() -> list[dict]:
    """Return all teams for club 2507 with id, name, clubId."""
    data = _gql("""
        query {
            clubTeams(clubId: "2507", language: nl) {
                id
                name
                clubId
                clubName
            }
        }
    """)
    return data.get("clubTeams") or []


def get_team(team_id: str) -> dict | None:
    """Return basic team info."""
    data = _gql("""
        query GetTeam($teamId: ID!) {
            team(teamId: $teamId, language: nl) {
                id
                name
                clubId
                clubName
            }
        }
    """, {"teamId": team_id})
    return data.get("team")


def get_team_members(team_id: str) -> list[dict]:
    """Return players for a team. Fields: id, firstName, lastName."""
    data = _gql("""
        query GetTeamMembers($teamId: ID!) {
            teamMembers(teamId: $teamId, language: nl) {
                players {
                    id
                    firstName
                    lastName
                }
            }
        }
    """, {"teamId": team_id})
    members = data.get("teamMembers") or {}
    return members.get("players") or []


# ── CALENDAR & MATCHES ───────────────────────────────────

def get_team_calendar(team_id: str) -> list[dict]:
    """
    Return full match calendar for a team.
    Fields: id, state, startTime, homeTeam{id,name}, awayTeam{id,name}, series{id,name}
    """
    data = _gql("""
        query GetCalendar($teamId: ID!) {
            teamCalendar(teamId: $teamId, language: nl, sortByDate: asc) {
                id
                state
                startTime
                homeTeam { id name }
                awayTeam { id name }
                series   { id name }
            }
        }
    """, {"teamId": team_id})
    return data.get("teamCalendar") or []


def get_match_detail(match_id: str) -> dict | None:
    """
    Return full match detail including events.
    Events structure: [{home:[{kind,minute},...], away:[{kind,minute},...]}]
    kind values: goal, owngoal, yellow, red, secondyellow, in, out
    """
    data = _gql("""
        query GetMatch($matchId: ID!) {
            matchDetail(matchId: $matchId, language: nl) {
                id
                state
                startTime
                title
                showScore
                homeTeam { id name }
                awayTeam { id name }
                events {
                    home { kind minute }
                    away { kind minute }
                }
            }
        }
    """, {"matchId": match_id})
    return data.get("matchDetail")


# ── STANDINGS ────────────────────────────────────────────

def get_series_rankings(series_id: str) -> dict | None:
    """Return standings for a competition series."""
    data = _gql("""
        query GetRankings($seriesId: ID!) {
            seriesRankings(seriesId: $seriesId, language: nl) {
                rankings {
                    teams {
                        name
                        position
                        points
                        goalsFor
                        goalsAgainst
                        goalDifference
                        logo
                    }
                }
            }
        }
    """, {"seriesId": series_id})
    return data.get("seriesRankings")


def get_series(series_id: str) -> dict | None:
    data = _gql("""
        query GetSeries($seriesId: ID!) {
            series(seriesId: $seriesId, language: nl) {
                id
                name
            }
        }
    """, {"seriesId": series_id})
    return data.get("series")
