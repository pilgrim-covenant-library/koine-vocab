#!/usr/bin/env python3
"""
Merge new OpenGNT verses with existing nt-verses.json.
Keeps existing verses when duplicates exist (they have better translations).
Normalizes book IDs and cleans up translations.
"""

import json
import os
import re

# Canonical book ID mappings (normalize to short form)
BOOK_ID_MAP = {
    "matthew": "matt",
    "mark": "mark",
    "luke": "luke",
    "john": "john",
    "acts": "acts",
    "romans": "rom",
    "1corinthians": "1cor",
    "2corinthians": "2cor",
    "galatians": "gal",
    "ephesians": "eph",
    "philippians": "phil",
    "colossians": "col",
    "1thessalonians": "1thess",
    "2thessalonians": "2thess",
    "1timothy": "1tim",
    "2timothy": "2tim",
    "titus": "titus",
    "philemon": "phlm",
    "hebrews": "heb",
    "james": "jas",
    "1peter": "1pet",
    "2peter": "2pet",
    "1john": "1john",
    "2john": "2john",
    "3john": "3john",
    "jude": "jude",
    "revelation": "rev",
    # Already normalized
    "matt": "matt",
    "rom": "rom",
    "1cor": "1cor",
    "2cor": "2cor",
    "gal": "gal",
    "eph": "eph",
    "phil": "phil",
    "col": "col",
    "1thess": "1thess",
    "2thess": "2thess",
    "1tim": "1tim",
    "2tim": "2tim",
    "phlm": "phlm",
    "heb": "heb",
    "jas": "jas",
    "1pet": "1pet",
    "2pet": "2pet",
}

def normalize_book_id(book_id: str) -> str:
    """Normalize book ID to canonical form."""
    return BOOK_ID_MAP.get(book_id.lower(), book_id)


def make_verse_key(verse: dict) -> str:
    """Create unique key for verse deduplication."""
    book = normalize_book_id(verse["book"])
    chapter = verse["chapter"]
    verse_num = verse.get("verse", 0)
    return f"{book}-{chapter}-{verse_num}"


def clean_translation(translation: str) -> str:
    """Clean up interlinear translation to be more readable."""
    # Remove extra spaces
    translation = re.sub(r'\s+', ' ', translation).strip()

    # Fix common patterns from word-by-word translations
    # Remove orphaned punctuation
    translation = re.sub(r'\s+([,;:.!?])', r'\1', translation)

    # Fix capitalization after periods
    def capitalize_after_period(match):
        return match.group(1) + match.group(2).upper()
    translation = re.sub(r'(\. )([a-z])', capitalize_after_period, translation)

    # Capitalize first letter
    if translation and translation[0].islower():
        translation = translation[0].upper() + translation[1:]

    return translation


def normalize_verse(verse: dict) -> dict:
    """Normalize a verse entry."""
    book = normalize_book_id(verse["book"])
    chapter = verse["chapter"]
    verse_num = verse.get("verse", 0)

    return {
        "id": f"{book}-{chapter}-{verse_num}",
        "book": book,
        "chapter": chapter,
        "verse": verse_num,
        "reference": verse.get("reference", ""),
        "greek": verse.get("greek", ""),
        "transliteration": verse.get("transliteration", ""),
        "referenceTranslation": clean_translation(verse.get("referenceTranslation", "")),
        "keyTerms": verse.get("keyTerms", []),
        "difficulty": verse.get("difficulty", 2),
        "notes": verse.get("notes", ""),
        "tier": verse.get("tier", 2)
    }


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.join(script_dir, "..")

    # Load existing verses
    existing_path = os.path.join(base_dir, "src", "data", "nt-verses.json")
    with open(existing_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)

    existing_verses = existing_data.get("verses", [])
    books = existing_data.get("books", [])

    # Load new verses
    new_path = os.path.join(base_dir, "src", "data", "new_verses.json")
    with open(new_path, 'r', encoding='utf-8') as f:
        new_verses = json.load(f)

    print(f"Existing verses: {len(existing_verses)}")
    print(f"New verses from OpenGNT: {len(new_verses)}")

    # Create lookup of existing verses
    existing_keys = set()
    normalized_existing = []

    for verse in existing_verses:
        normalized = normalize_verse(verse)
        key = make_verse_key(normalized)
        existing_keys.add(key)
        normalized_existing.append(normalized)

    print(f"Unique existing verses: {len(existing_keys)}")

    # Add new verses that don't exist
    added = 0
    skipped = 0

    for verse in new_verses:
        normalized = normalize_verse(verse)
        key = make_verse_key(normalized)

        if key not in existing_keys:
            normalized_existing.append(normalized)
            existing_keys.add(key)
            added += 1
        else:
            skipped += 1

    print(f"Added new verses: {added}")
    print(f"Skipped duplicates: {skipped}")
    print(f"Total verses: {len(normalized_existing)}")

    # Sort verses by book order, chapter, verse
    book_order = {b["id"]: i for i, b in enumerate(books)}

    def sort_key(v):
        book_idx = book_order.get(v["book"], 100)
        return (book_idx, v["chapter"], v["verse"])

    normalized_existing.sort(key=sort_key)

    # Write output
    output_data = {
        "books": books,
        "verses": normalized_existing
    }

    with open(existing_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved merged verses to {existing_path}")

    # Print stats by book
    book_counts = {}
    for v in normalized_existing:
        book = v["book"]
        book_counts[book] = book_counts.get(book, 0) + 1

    print("\nVerses per book:")
    for book in books:
        count = book_counts.get(book["id"], 0)
        if count > 0:
            print(f"  {book['name']}: {count}")


if __name__ == "__main__":
    main()
