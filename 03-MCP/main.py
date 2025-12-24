from pathlib import Path

import requests
from fastmcp import FastMCP

from search import build_index, download_fastmcp_zip, load_documents, search as search_index

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


@mcp.tool
def fetch_markdown(url: str, timeout_s: int = 10) -> str:
    """Fetch page content as markdown via Jina Reader."""
    return _fetch_markdown_impl(url, timeout_s)


def _fetch_markdown_impl(url: str, timeout_s: int = 10) -> str:
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    response = requests.get(f"https://r.jina.ai/{url}", timeout=timeout_s)
    response.raise_for_status()
    return response.text


@mcp.tool
def search_docs(query: str, limit: int = 5) -> list[dict[str, str]]:
    """Search markdown/mdx docs from local zip archives using minsearch."""
    download_fastmcp_zip(Path.cwd() / "fastmcp-main.zip")
    docs = load_documents(Path.cwd())
    index = build_index(docs)
    return search_index(index, query, limit=limit)

if __name__ == "__main__":
    mcp.run()
