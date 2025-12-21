.PHONY: backend frontend dev

backend:
	cd backend && uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000

frontend:
	cd frontend && npm run dev -- --host 127.0.0.1 --port 8080

dev:
	@bash -lc 'set -euo pipefail; \
	trap "kill 0" INT TERM EXIT; \
	(cd backend && uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000) & \
	(cd frontend && npm run dev -- --host 127.0.0.1 --port 8080) & \
	wait'
