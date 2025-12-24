import requests
from fastmcp import FastMCP

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

if __name__ == "__main__":
    mcp.run()
