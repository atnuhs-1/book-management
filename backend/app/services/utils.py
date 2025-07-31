import re
from datetime import datetime

def extract_volume(title: str) -> str | None:
    patterns = [
        r"[第\s]*([0-9０-９]{1,3})\s*巻",
        r"\(?第?([0-9０-９]{1,3})\)?\s*巻",
        r"([0-9０-９]{1,3})\s*巻",
        r"（?([0-9０-９]{1,3})）?",
    ]
    for pattern in patterns:
        match = re.search(pattern, title)
        if match:
            return match.group(1)
    return None

def parse_published_date(pub_date_str: str | None) -> datetime.date:
    try:
        if pub_date_str and len(pub_date_str) == 4:
            return datetime.strptime(pub_date_str, "%Y").date()
        elif pub_date_str:
            return datetime.strptime(pub_date_str, "%Y-%m-%d").date()
    except:
        pass
    return datetime(2000, 1, 1).date()
