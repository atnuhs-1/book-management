# backend/app/google_books.py
import requests

# ISBNから本の情報を取得
def fetch_book_info_by_isbn(isbn: str):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    response = requests.get(url)
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

    # 該当ISBNが見つからない場合のフォールバック
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
    response = requests.get(url)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {})
        title_result = volume_info.get("title", "")

        # 入力タイトルを含まないものは除外（部分一致フィルタ）
        if title.lower() not in title_result.lower():
            continue

        result = {
            "title": title_result,
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "published_date": volume_info.get("publishedDate"),
            "cover_image_url": volume_info.get("imageLinks", {}).get("thumbnail"),
            "isbn": next(
                (
                    i['identifier']
                    for i in volume_info.get("industryIdentifiers", [])
                    if i["type"].startswith("ISBN")
                ),
                None
            ),
        }
        results.append(result)

    return results
