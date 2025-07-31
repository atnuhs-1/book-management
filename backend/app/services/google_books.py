import os
import re
import json
import requests
import unicodedata
import time
from dotenv import load_dotenv
from typing import List

# from app.services.rakuten_books import supplement_isbn_with_rakuten

load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
RAKUTEN_APP_ID = os.getenv("RAKUTEN_APP_ID")


def extract_isbn(volume_info: dict) -> str | None:
    for identifier in volume_info.get("industryIdentifiers", []):
        if identifier.get("type") == "ISBN_13":
            return identifier.get("identifier")
    return None


def search_books_by_title(title: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}&maxResults=20"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        print("❌ タイトル検索失敗:", response.status_code)
        return []

    data = response.json()
    print("🔍 タイトル検索レスポンス:", data)

    results = []
    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {})
        result = {
            "title": volume_info.get("title", ""),
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "published_date": volume_info.get("publishedDate"),
            "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
            "genres": volume_info.get("categories", []),
            "isbn": extract_isbn(volume_info),
        }
        results.append(result)

    results = supplement_isbn_with_rakuten(results)

    return results


def fetch_book_info_by_isbn(isbn: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        print("❌ APIリクエスト失敗:", response.status_code)
        return None

    data = response.json()
    if "items" not in data:
        return None

    for item in data["items"]:
        volume_info = item.get("volumeInfo", {})
        for identifier in volume_info.get("industryIdentifiers", []):
            if identifier["type"] == "ISBN_13" and identifier["identifier"] == isbn:
                return {
                    "title": volume_info.get("title"),
                    "authors": ", ".join(volume_info.get("authors", [])),
                    "publisher": volume_info.get("publisher"),
                    "published_date": volume_info.get("publishedDate"),
                    "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
                    "genres": volume_info.get("categories", []),
                }

    volume_info = data["items"][0].get("volumeInfo", {})
    return {
        "title": volume_info.get("title"),
        "authors": ", ".join(volume_info.get("authors", [])),
        "publisher": volume_info.get("publisher"),
        "published_date": volume_info.get("publishedDate"),
        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
        "genres": volume_info.get("categories", []),
    }


def search_books_by_title_rakuten(title: str):
    if not RAKUTEN_APP_ID:
        raise ValueError("RAKUTEN_APP_ID is not set in .env")

    url = "https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404"
    params = {
        "format": "json",
        "keyword": title,
        "applicationId": RAKUTEN_APP_ID,
        "hits": 20,
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("❌ Rakuten APIリクエスト失敗:", response.status_code)
        return []

    data = response.json()
    print("🔍 Rakuten レスポンス:", data)

    results = []
    for item in data.get("Items", []):
        book = item.get("Item", {})
        if not book.get("isbn"):
            continue
        results.append({
            "title": book.get("title", ""),
            "authors": [book.get("author", "")] if book.get("author") else [],
            "publisher": book.get("publisherName", ""),
            "published_date": book.get("salesDate", ""),
            "cover_image_url": book.get("largeImageUrl", ""),
            "description": book.get("itemCaption", ""),
            "isbn": book.get("isbn", "")
        })

    return results


def normalize_title(title: str) -> str:
    if title is None:
        return ""
    # 全角→半角変換、記号・空白除去、小文字化
    title = unicodedata.normalize("NFKC", title)
    title = re.sub(r"[（）()\-\sー・　_]", "", title)  # よくある揺れの記号除去
    title = title.lower()
    return title.strip()


def supplement_isbn_with_rakuten(books: List[dict]) -> List[dict]:
    supplemented_books = []
    for book in books:
        if book.get("isbn"):
            supplemented_books.append(book)
            continue

        title = book.get("title")
        if not title:
            supplemented_books.append(book)
            continue

        try:
            time.sleep(1.1)
            rakuten_results = search_books_by_title_rakuten(title)
        except Exception as e:
            print(f"⚠️ 楽天API失敗: {e}")
            supplemented_books.append(book)
            continue

        found_isbn = None
        for item in rakuten_results:
            rakuten_title = item.get("title")
            isbn = item.get("isbn")
            if normalize_title(title) in normalize_title(rakuten_title) and isbn:
                found_isbn = isbn
                break

        if found_isbn:
            print(f"✅ ISBN補完成功: {title} → {found_isbn}")
            book["isbn"] = found_isbn
        else:
            print(f"⚠️ 補完失敗: {title}")

        supplemented_books.append(book)

    return supplemented_books

# if __name__ == "__main__":
#     test_title = "ブルーロック（１８）"
#     books = search_books_by_title(test_title)
#     books_with_isbn = supplement_isbn_with_rakuten(books)
#     print(json.dumps(books_with_isbn, ensure_ascii=False, indent=2))
