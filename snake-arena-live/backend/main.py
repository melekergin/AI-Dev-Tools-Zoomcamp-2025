from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from enum import Enum
from typing import Generator, Optional

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Boolean, DateTime, Integer, JSON, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


class Direction(str, Enum):
    up = "UP"
    down = "DOWN"
    left = "LEFT"
    right = "RIGHT"


class GameMode(str, Enum):
    walls = "walls"
    pass_through = "pass-through"


class Position(BaseModel):
    x: int
    y: int


class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    high_score: int = Field(alias="highScore")
    created_at: str = Field(alias="createdAt")

    model_config = ConfigDict(populate_by_name=True)


class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    played_at: str = Field(alias="playedAt")

    model_config = ConfigDict(populate_by_name=True)


class LivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: list[Position]
    food: Position
    direction: Direction
    is_playing: bool = Field(alias="isPlaying")

    model_config = ConfigDict(populate_by_name=True)


class AuthResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None


class ApiResponseUser(BaseModel):
    success: bool
    data: Optional[User] = None
    error: Optional[str] = None


class ApiResponseLeaderboardList(BaseModel):
    success: bool
    data: list[LeaderboardEntry] | None = None
    error: Optional[str] = None


class ApiResponseLeaderboardEntry(BaseModel):
    success: bool
    data: Optional[LeaderboardEntry] = None
    error: Optional[str] = None


class ApiResponseLivePlayerList(BaseModel):
    success: bool
    data: list[LivePlayer] | None = None
    error: Optional[str] = None


class ApiResponseLivePlayer(BaseModel):
    success: bool
    data: Optional[LivePlayer] = None
    error: Optional[str] = None


class ApiResponseNull(BaseModel):
    success: bool
    data: Optional[None] = None
    error: Optional[str] = None


class ApiResponseError(BaseModel):
    success: bool
    error: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class SubmitScoreRequest(BaseModel):
    score: int
    mode: GameMode


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    high_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LeaderboardEntryModel(Base):
    __tablename__ = "leaderboard_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    mode: Mapped[str] = mapped_column(String, nullable=False)
    played_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LivePlayerModel(Base):
    __tablename__ = "live_players"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    mode: Mapped[str] = mapped_column(String, nullable=False)
    snake: Mapped[list[dict[str, int]]] = mapped_column(JSON, nullable=False)
    food: Mapped[dict[str, int]] = mapped_column(JSON, nullable=False)
    direction: Mapped[str] = mapped_column(String, nullable=False)
    is_playing: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class SessionModel(Base):
    __tablename__ = "sessions"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


def make_engine(database_url: str):
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(database_url, connect_args=connect_args)


def normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def to_iso(value: datetime) -> str:
    normalized = normalize_datetime(value)
    return normalized.isoformat().replace("+00:00", "Z")


def user_to_schema(user: UserModel) -> User:
    return User(
        id=user.id,
        username=user.username,
        email=user.email,
        high_score=user.high_score,
        created_at=to_iso(user.created_at),
    )


def leaderboard_to_schema(entry: LeaderboardEntryModel) -> LeaderboardEntry:
    return LeaderboardEntry(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        mode=GameMode(entry.mode),
        played_at=to_iso(entry.played_at),
    )


def live_player_to_schema(player: LivePlayerModel) -> LivePlayer:
    return LivePlayer(
        id=player.id,
        username=player.username,
        score=player.score,
        mode=GameMode(player.mode),
        snake=player.snake,
        food=player.food,
        direction=Direction(player.direction),
        is_playing=player.is_playing,
    )


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./snake_arena.db")
engine = make_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


api_app = FastAPI(title="Snake Arena API")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_database(db: Session) -> None:
    if db.execute(select(UserModel)).first():
        return

    users = [
        UserModel(
            id="1",
            username="SnakeMaster",
            email="player1@test.com",
            password="password123",
            high_score=1250,
            created_at=datetime(2024, 1, 15, tzinfo=timezone.utc),
        ),
        UserModel(
            id="2",
            username="VenomStrike",
            email="player2@test.com",
            password="password123",
            high_score=980,
            created_at=datetime(2024, 2, 20, tzinfo=timezone.utc),
        ),
        UserModel(
            id="3",
            username="CobraKai",
            email="player3@test.com",
            password="password123",
            high_score=820,
            created_at=datetime(2024, 3, 5, tzinfo=timezone.utc),
        ),
        UserModel(
            id="4",
            username="SerpentKing",
            email="player4@test.com",
            password="password123",
            high_score=750,
            created_at=datetime(2024, 3, 22, tzinfo=timezone.utc),
        ),
        UserModel(
            id="5",
            username="Sidewinder",
            email="player5@test.com",
            password="password123",
            high_score=420,
            created_at=datetime(2024, 4, 1, tzinfo=timezone.utc),
        ),
    ]

    leaderboard_entries = [
        LeaderboardEntryModel(
            id="1",
            username="SnakeMaster",
            score=1250,
            mode="walls",
            played_at=datetime(2024, 12, 5, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="2",
            username="VenomStrike",
            score=980,
            mode="pass-through",
            played_at=datetime(2024, 12, 4, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="3",
            username="PyThonX",
            score=875,
            mode="walls",
            played_at=datetime(2024, 12, 3, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="4",
            username="CobraKai",
            score=820,
            mode="pass-through",
            played_at=datetime(2024, 12, 2, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="5",
            username="SerpentKing",
            score=750,
            mode="walls",
            played_at=datetime(2024, 12, 1, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="6",
            username="ViperVenom",
            score=680,
            mode="pass-through",
            played_at=datetime(2024, 11, 30, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="7",
            username="Anaconda99",
            score=620,
            mode="walls",
            played_at=datetime(2024, 11, 29, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="8",
            username="RattleSnake",
            score=550,
            mode="walls",
            played_at=datetime(2024, 11, 28, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="9",
            username="BoomSlang",
            score=480,
            mode="walls",
            played_at=datetime(2024, 11, 27, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="10",
            username="Sidewinder",
            score=420,
            mode="pass-through",
            played_at=datetime(2024, 11, 26, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="11",
            username="GhostAdder",
            score=390,
            mode="walls",
            played_at=datetime(2024, 11, 25, tzinfo=timezone.utc),
        ),
        LeaderboardEntryModel(
            id="12",
            username="Pythonic",
            score=360,
            mode="pass-through",
            played_at=datetime(2024, 11, 24, tzinfo=timezone.utc),
        ),
    ]

    live_players = [
        LivePlayerModel(
            id="live1",
            username="PyThonX",
            score=45,
            mode="walls",
            snake=[{"x": 5, "y": 5}, {"x": 4, "y": 5}, {"x": 3, "y": 5}],
            food={"x": 10, "y": 8},
            direction="RIGHT",
            is_playing=True,
        ),
        LivePlayerModel(
            id="live2",
            username="CobraKai",
            score=32,
            mode="pass-through",
            snake=[{"x": 12, "y": 7}, {"x": 12, "y": 6}, {"x": 12, "y": 5}],
            food={"x": 3, "y": 12},
            direction="DOWN",
            is_playing=True,
        ),
        LivePlayerModel(
            id="live3",
            username="SerpentKing",
            score=78,
            mode="walls",
            snake=[
                {"x": 8, "y": 10},
                {"x": 9, "y": 10},
                {"x": 10, "y": 10},
                {"x": 11, "y": 10},
            ],
            food={"x": 2, "y": 5},
            direction="LEFT",
            is_playing=True,
        ),
        LivePlayerModel(
            id="live4",
            username="BoomSlang",
            score=64,
            mode="pass-through",
            snake=[{"x": 1, "y": 1}, {"x": 1, "y": 2}, {"x": 1, "y": 3}],
            food={"x": 14, "y": 9},
            direction="UP",
            is_playing=True,
        ),
        LivePlayerModel(
            id="live5",
            username="RattleSnake",
            score=12,
            mode="walls",
            snake=[{"x": 6, "y": 14}, {"x": 6, "y": 13}, {"x": 6, "y": 12}],
            food={"x": 9, "y": 3},
            direction="RIGHT",
            is_playing=True,
        ),
    ]

    db.add_all(users + leaderboard_entries + live_players)
    db.commit()


@api_app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


@api_app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, request: Request) -> AuthResponse:
    with SessionLocal() as db:
        user = db.execute(select(UserModel).where(UserModel.email == payload.email)).scalar_one_or_none()
        if not user or user.password != payload.password:
            return AuthResponse(success=False, error="Invalid email or password")

        token = secrets.token_urlsafe(16)
        db.add(SessionModel(token=token, email=user.email, created_at=datetime.now(timezone.utc)))
        db.commit()

        response.set_cookie("session", token, httponly=True)
        return AuthResponse(success=True, user=user_to_schema(user))


@api_app.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, response: Response, request: Request) -> AuthResponse:
    with SessionLocal() as db:
        existing = db.execute(select(UserModel).where(UserModel.email == payload.email)).scalar_one_or_none()
        if existing:
            return AuthResponse(success=False, error="Email already exists")

        now = datetime.now(timezone.utc)
        user_id = str(int(now.timestamp() * 1000))
        user = UserModel(
            id=user_id,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            high_score=0,
            created_at=now,
        )
        db.add(user)

        token = secrets.token_urlsafe(16)
        db.add(SessionModel(token=token, email=user.email, created_at=now))

        db.commit()
        response.set_cookie("session", token, httponly=True)
        return AuthResponse(success=True, user=user_to_schema(user))


@api_app.post("/auth/logout", response_model=ApiResponseNull)
def logout(response: Response, request: Request) -> ApiResponseNull:
    token = request.cookies.get("session")
    if token:
        with SessionLocal() as db:
            session_entry = db.get(SessionModel, token)
            if session_entry:
                db.delete(session_entry)
                db.commit()
    response.delete_cookie("session")
    return ApiResponseNull(success=True, data=None)


@api_app.get("/auth/me", response_model=ApiResponseUser)
def get_current_user(request: Request) -> ApiResponseUser:
    token = request.cookies.get("session")
    if not token:
        return ApiResponseUser(success=True, data=None)

    with SessionLocal() as db:
        session_entry = db.get(SessionModel, token)
        if not session_entry:
            return ApiResponseUser(success=True, data=None)
        user = db.execute(select(UserModel).where(UserModel.email == session_entry.email)).scalar_one_or_none()
        return ApiResponseUser(success=True, data=user_to_schema(user) if user else None)


@api_app.get("/leaderboard", response_model=ApiResponseLeaderboardList)
def get_leaderboard(request: Request, mode: GameMode | None = None) -> ApiResponseLeaderboardList:
    with SessionLocal() as db:
        stmt = select(LeaderboardEntryModel)
        if mode:
            stmt = stmt.where(LeaderboardEntryModel.mode == mode.value)
        entries = db.execute(stmt).scalars().all()
        entries.sort(key=lambda entry: entry.score, reverse=True)
        return ApiResponseLeaderboardList(
            success=True,
            data=[leaderboard_to_schema(entry) for entry in entries],
        )


@api_app.post("/scores", response_model=ApiResponseLeaderboardEntry)
def submit_score(payload: SubmitScoreRequest, request: Request) -> ApiResponseLeaderboardEntry | JSONResponse:
    token = request.cookies.get("session")
    if not token:
        return JSONResponse(
            status_code=401,
            content=ApiResponseError(success=False, error="Must be logged in to submit score").model_dump(),
        )

    with SessionLocal() as db:
        session_entry = db.get(SessionModel, token)
        if not session_entry:
            return JSONResponse(
                status_code=401,
                content=ApiResponseError(success=False, error="Must be logged in to submit score").model_dump(),
            )
        user = db.execute(select(UserModel).where(UserModel.email == session_entry.email)).scalar_one_or_none()
        if not user:
            return JSONResponse(
                status_code=401,
                content=ApiResponseError(success=False, error="Must be logged in to submit score").model_dump(),
            )

        now = datetime.now(timezone.utc)
        entry = LeaderboardEntryModel(
            id=str(int(now.timestamp() * 1000)),
            username=user.username,
            score=payload.score,
            mode=payload.mode.value,
            played_at=now,
        )
        db.add(entry)

        if payload.score > user.high_score:
            user.high_score = payload.score

        db.commit()
        return ApiResponseLeaderboardEntry(success=True, data=leaderboard_to_schema(entry))


@api_app.get("/live-players", response_model=ApiResponseLivePlayerList)
def get_live_players(request: Request) -> ApiResponseLivePlayerList:
    with SessionLocal() as db:
        players = db.execute(select(LivePlayerModel)).scalars().all()
        return ApiResponseLivePlayerList(
            success=True,
            data=[live_player_to_schema(player) for player in players],
        )


@api_app.get("/live-players/{player_id}", response_model=ApiResponseLivePlayer)
def get_live_player(player_id: str, request: Request) -> ApiResponseLivePlayer:
    with SessionLocal() as db:
        player = db.get(LivePlayerModel, player_id)
        return ApiResponseLivePlayer(success=True, data=live_player_to_schema(player) if player else None)


FRONTEND_DIST = os.getenv(
    "FRONTEND_DIST",
    os.path.join(os.path.dirname(__file__), "frontend_dist"),
)

app = FastAPI(title="Snake Arena")
app.mount("/api", api_app)

if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
