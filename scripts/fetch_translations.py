#!/usr/bin/env python3
"""
Fetch proper English translations from bible-api.com (World English Bible).
Updates verses that have awkward interlinear translations.
"""

import json
import os
import urllib.request
import urllib.error
import time
import re

# Book name mappings for API
BOOK_NAME_MAP = {
    "matt": "Matthew",
    "mark": "Mark",
    "luke": "Luke",
    "john": "John",
    "acts": "Acts",
    "rom": "Romans",
    "1cor": "1 Corinthians",
    "2cor": "2 Corinthians",
    "gal": "Galatians",
    "eph": "Ephesians",
    "phil": "Philippians",
    "col": "Colossians",
    "1thess": "1 Thessalonians",
    "2thess": "2 Thessalonians",
    "1tim": "1 Timothy",
    "2tim": "2 Timothy",
    "titus": "Titus",
    "phlm": "Philemon",
    "heb": "Hebrews",
    "jas": "James",
    "1pet": "1 Peter",
    "2pet": "2 Peter",
    "1john": "1 John",
    "2john": "2 John",
    "3john": "3 John",
    "jude": "Jude",
    "rev": "Revelation",
}


def fetch_verse_translation(book_id: str, chapter: int, verse: int) -> str | None:
    """Fetch translation from bible-api.com (World English Bible)."""
    book_name = BOOK_NAME_MAP.get(book_id, book_id)
    # Format: "John 3:16" or "1 Corinthians 13:4"
    reference = f"{book_name} {chapter}:{verse}"

    # URL encode the reference
    encoded_ref = urllib.parse.quote(reference)
    url = f"https://bible-api.com/{encoded_ref}"

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode('utf-8'))

        text = data.get("text", "").strip()
        # Clean up the text
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"  Error fetching {reference}: {e}")
        return None


def is_awkward_translation(translation: str) -> bool:
    """Check if translation looks like interlinear word-by-word format."""
    if not translation:
        return True

    # Signs of interlinear translation:
    # - Random capitalization in middle of sentence
    # - Orphaned words at end
    # - Words like "And" at start followed by lowercase
    # - Very short translation for long verse
    # - Quotation marks in wrong places

    awkward_patterns = [
        r'\b[A-Z][a-z]+\s+[a-z]+\s+[A-Z]',  # Random caps
        r'\.\s*[a-z]+$',  # Lowercase word after period at end
        r'^[A-Z][a-z]+\s+[a-z]+\s+And\b',  # "Word word And"
        r'\b(the|a|an|of|in|to)\s+\.$',  # Article before period
        r'\bHis\s+[a-z]',  # "His word" (possessive before lowercase)
    ]

    for pattern in awkward_patterns:
        if re.search(pattern, translation):
            return True

    return False


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.join(script_dir, "..")

    verses_path = os.path.join(base_dir, "src", "data", "nt-verses.json")
    with open(verses_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    verses = data.get("verses", [])
    books = data.get("books", [])

    # Find verses that need better translations
    needs_update = []
    for i, verse in enumerate(verses):
        translation = verse.get("referenceTranslation", "")
        if is_awkward_translation(translation):
            needs_update.append((i, verse))

    print(f"Found {len(needs_update)} verses that may need better translations")

    if not needs_update:
        print("No verses need updating!")
        return

    # Limit updates to avoid hitting rate limits (15 req / 30 sec)
    max_updates = min(len(needs_update), 250)
    print(f"Will update up to {max_updates} verses...")

    updated = 0
    failed = 0

    for idx, (i, verse) in enumerate(needs_update[:max_updates]):
        book_id = verse["book"]
        chapter = verse["chapter"]
        verse_num = verse["verse"]
        ref = verse.get("reference", f"{book_id} {chapter}:{verse_num}")

        print(f"[{idx+1}/{max_updates}] Fetching {ref}...")

        new_translation = fetch_verse_translation(book_id, chapter, verse_num)

        if new_translation:
            verses[i]["referenceTranslation"] = new_translation
            updated += 1
            print(f"  ✓ Updated: {new_translation[:60]}...")
        else:
            failed += 1
            print(f"  ✗ Failed to fetch")

        # Rate limiting: 15 requests per 30 seconds = 1 request per 2 seconds
        time.sleep(2.1)

    print(f"\nUpdated: {updated}, Failed: {failed}")

    # Save updated verses
    data["verses"] = verses
    with open(verses_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved to {verses_path}")


if __name__ == "__main__":
    main()
