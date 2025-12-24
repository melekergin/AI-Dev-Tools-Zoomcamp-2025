# 03-MCP

Small MCP demo project with:
- An MCP tool that fetches webpage content as markdown via Jina Reader.
- A search script that indexes markdown/mdx docs from zip archives using minsearch.

## Setup

Install dependencies:

```powershell
uv sync
```

## MCP server

Run the MCP server:

```powershell
uv run python main.py
```

Tools:
- `add(a, b)` adds two numbers.
- `fetch_markdown(url, timeout_s=10)` fetches a page via `https://r.jina.ai/`.

## Codex CLI integration

Register the MCP server with Codex CLI:

```powershell
codex mcp add jina-reader -- uv run python main.py
```

Verify it:

```powershell
codex mcp list
```

## Search demo

`search.py` downloads the FastMCP repo zip (if missing), reads all local `*.zip` files,
indexes `.md` and `.mdx` content with minsearch, and runs a test query.

Run the search demo:

```powershell
uv run python search.py
```

Example custom query (prints the top result filename):

```powershell
uv run python -c "from search import load_documents, build_index, search; from pathlib import Path; docs=load_documents(Path.cwd()); index=build_index(docs); results=search(index, 'demo', limit=5); print(results[0]['filename'] if results else 'NO_RESULTS')"
```

## Tests

Run the Jina Reader fetch test:

```powershell
uv run python test.py
```
