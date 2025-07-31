import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

# ISBNから本の情報を取得
def fetch_book_info_by_isbn(isbn: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        return None

    data = response.json()
    if "items" not in data:
        return None

    for item in data["items"]:
        for identifier in item["volumeInfo"].get("industryIdentifiers", []):
            if identifier["type"] == "ISBN_13" and identifier["identifier"] == isbn:
                volume_info = item["volumeInfo"]
                return {
                    "title": volume_info.get("title"),
                    "authors": ", ".join(volume_info.get("authors", [])),
                    "publisher": volume_info.get("publisher"),
                    "published_date": volume_info.get("publishedDate"),
                    "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
                   # "genres": volume_info.get("categories", []),  # ← ジャンル情報を追加
                }

    # フォールバック（ISBNが完全一致しない場合）
    volume_info = data["items"][0]["volumeInfo"]
    return {
        "title": volume_info.get("title"),
        "authors": ", ".join(volume_info.get("authors", [])),
        "publisher": volume_info.get("publisher"),
        "published_date": volume_info.get("publishedDate"),
        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
      #  "genres": volume_info.get("categories", []),  # ← ジャンル情報を追加
    }

# タイトルから本の情報を取得（あいまい一致強化）
def search_books_by_title(title: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}&maxResults=20"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {})
        result = {
            "title": volume_info.get("title", ""),
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "published_date": volume_info.get("publishedDate"),
            "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
            "genres": volume_info.get("categories", []),  # ← ジャンル情報を追加
        }
        results.append(result)

    return results
