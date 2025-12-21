# Snake Arena Backend

## Setup

```bash
uv sync
```

## Run the server

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with docs at `http://127.0.0.1:8000/docs`.

## Database configuration

By default the backend uses SQLite at `backend/snake_arena.db`. To use Postgres, set `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/snake_arena"
```

## Sample requests

Login (sets a session cookie):

```bash
curl -i -X POST http://127.0.0.1:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"player1@test.com","password":"password123"}'
```

Get leaderboard:

```bash
curl http://127.0.0.1:8000/leaderboard
```

Submit score (replace SESSION with the cookie from login):

```bash
curl -X POST http://127.0.0.1:8000/scores \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=SESSION' \
  -d '{"score":900,"mode":"walls"}'
```

List live players:

```bash
curl http://127.0.0.1:8000/live-players
```

## Run tests

```bash
uv run pytest
```
