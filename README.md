# Code Collab Hub

## Requirements

- Node.js 18+ (or a recent LTS)
- npm

## Environment

Create a `.env` file with your Supabase settings:

```sh
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
# Optional: override Pyodide CDN URL for Python WASM execution
VITE_PYODIDE_URL=https://cdn.jsdelivr.net/pyodide/v0.26.1/full/
```

## Supabase CLI

`npm run dev:server` and `npm run dev:all` require the Supabase CLI.
Install it from https://supabase.com/docs/guides/cli.
If you are only working on the UI, you can skip the CLI and just run `npm run dev`.
If you need full client/server integration (sessions and real-time updates), use the CLI.

## Install

```sh
npm install
```

## Run

```sh
# Start the Vite dev server
npm run dev

# Start client + Supabase server together
npm run dev:all

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Preview the production build locally
npm run preview
```

## Test

```sh
# Run integration tests once
npm run test

# Watch mode
npm run test:watch

# Lint the codebase
npm run lint
```

## Docker

```sh
# Build the image
docker build -t code-collab-hub .

# Run client + Supabase in one container
docker run --rm -it -p 8080:8080 -p 54321:54321 -p 54322:54322 -p 54323:54323 -p 54324:54324 code-collab-hub
```
