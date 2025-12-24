from main import _fetch_markdown_impl


def main() -> None:
    content = _fetch_markdown_impl("https://github.com/alexeygrigorev/minsearch")
    print("Characters:", len(content))

    


if __name__ == "__main__":
    main()
