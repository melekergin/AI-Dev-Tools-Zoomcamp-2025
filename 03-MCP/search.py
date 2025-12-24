from __future__ import annotations

from pathlib import Path
import zipfile
import urllib.request

from minsearch import Index


FASTMCP_ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
FASTMCP_ZIP_NAME = "fastmcp-main.zip"


def download_fastmcp_zip(zip_path: Path) -> None:
    if zip_path.exists():
        return
    urllib.request.urlretrieve(FASTMCP_ZIP_URL, zip_path)


def strip_first_path_component(path: str) -> str:
    normalized = path.replace("\\", "/")
    parts = normalized.split("/", 1)
    return parts[1] if len(parts) > 1 else parts[0]


def iter_markdown_from_zip(zip_path: Path) -> list[dict[str, str]]:
    docs: list[dict[str, str]] = []
    try:
        with zipfile.ZipFile(zip_path) as archive:
            for name in archive.namelist():
                if name.endswith("/"):
                    continue
                lower_name = name.lower()
                if not (lower_name.endswith(".md") or lower_name.endswith(".mdx")):
                    continue
                content = archive.read(name).decode("utf-8", errors="replace")
                docs.append(
                    {
                        "filename": strip_first_path_component(name),
                        "content": content,
                    }
                )
    except zipfile.BadZipFile:
        print(f"Skipping non-zip file: {zip_path.name}")
    return docs


def load_documents(workdir: Path) -> list[dict[str, str]]:
    zip_files = sorted(workdir.glob("*.zip"))
    docs: list[dict[str, str]] = []
    for zip_path in zip_files:
        docs.extend(iter_markdown_from_zip(zip_path))
    return docs


def build_index(docs: list[dict[str, str]]) -> Index:
    index = Index(text_fields=["content", "filename"], keyword_fields=[])
    index.fit(docs)
    return index


def search(index: Index, query: str, limit: int = 5) -> list[dict[str, str]]:
    return index.search(query, num_results=limit)


def main() -> None:
    zip_path = Path.cwd() / FASTMCP_ZIP_NAME
    download_fastmcp_zip(zip_path)

    docs = load_documents(Path.cwd())
    index = build_index(docs)

    query = "demo"
    results = search(index, query, limit=5)

    print(f"Query: {query}")
    for i, doc in enumerate(results, start=1):
        print(f"{i}. {doc['filename']}")


if __name__ == "__main__":
    main()
