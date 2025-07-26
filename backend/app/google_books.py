# backend/app/google_books.py
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
                }

    # フォールバック（ISBNが完全一致しない場合）
    volume_info = data["items"][0]["volumeInfo"]
    return {
        "title": volume_info.get("title"),
        "authors": ", ".join(volume_info.get("authors", [])),
        "publisher": volume_info.get("publisher"),
        "published_date": volume_info.get("publishedDate"),
        "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
    }

# タイトルから本の情報を取得
def search_books_by_title(title: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}"
    if API_KEY:
        url += f"&key={API_KEY}"

    response = requests.get(url)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {})
        item_title = volume_info.get("title", "")

        # 「完全一致」に近いものを優先（副題などを含めた柔軟な一致）
        if title.lower() not in item_title.lower():
            continue

        result = {
            "title": item_title,
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "published_date": volume_info.get("publishedDate"),
            "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
            # "isbn": next(
            #     (
            #         i['identifier']
            #         for i in volume_info.get("industryIdentifiers", [])
            #         if i["type"].startswith("ISBN")
            #     ),
            #     None
            # ),
        }
        results.append(result)

    return results
