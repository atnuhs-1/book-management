import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

# タイトルから本の情報を取得（あいまい一致検索）
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
        results.append({
            "title": volume_info.get("title", ""),
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "published_date": volume_info.get("publishedDate"),
            "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
            "genres": volume_info.get("categories", []),
        })
    return results

# ISBNから本の情報を取得
def fetch_book_info_by_isbn(isbn: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        print("❌ APIリクエスト失敗:", response.status_code)
        return None

    data = response.json()
    # print("📦 Google Books APIのレスポンス:", data)  # ← APIレスポンス全体の確認用

    if "items" not in data:
        return None

    for item in data["items"]:
        volume_info = item.get("volumeInfo", {})
        print("🔍 各 volume_info:", volume_info)  # ← 各候補を確認

        for identifier in volume_info.get("industryIdentifiers", []):
            if identifier["type"] == "ISBN_13" and identifier["identifier"] == isbn:
                print("🎯 対象の volume_info:", volume_info)
                return {
                    "title": volume_info.get("title"),
                    "authors": ", ".join(volume_info.get("authors", [])),
                    "publisher": volume_info.get("publisher"),
                    "published_date": volume_info.get("publishedDate"),
                    "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
                    "genres": volume_info.get("categories", []),  # ← ジャンル情報
                }

    # フォールバック（完全一致しない場合の最初の候補を返す）
    volume_info = data["items"][0].get("volumeInfo", {})
    print("⚠️ フォールバック volume_info:", volume_info)
    return {
        "title": volume_info.get("title"),
        "authors": ", ".join(volume_info.get("authors", [])),
        "publisher": volume_info.get("publisher"),
        "published_date": volume_info.get("publishedDate"),
        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
        "genres": volume_info.get("categories", []),  # ← フォールバックでも確認
    }
