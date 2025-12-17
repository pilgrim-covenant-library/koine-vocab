#!/usr/bin/env python3
"""
Fetch Greek NT verses from OpenGNT keyedFeatures dataset.
Creates verse data for the koine-vocab passage translation feature.
"""

import csv
import json
import zipfile
import urllib.request
import io
import os
import re
from collections import defaultdict

# Book ID mappings (OpenGNT uses numeric codes 40-66)
BOOK_MAP = {
    40: ("matt", "Matthew"),
    41: ("mark", "Mark"),
    42: ("luke", "Luke"),
    43: ("john", "John"),
    44: ("acts", "Acts"),
    45: ("rom", "Romans"),
    46: ("1cor", "1 Corinthians"),
    47: ("2cor", "2 Corinthians"),
    48: ("gal", "Galatians"),
    49: ("eph", "Ephesians"),
    50: ("phil", "Philippians"),
    51: ("col", "Colossians"),
    52: ("1thess", "1 Thessalonians"),
    53: ("2thess", "2 Thessalonians"),
    54: ("1tim", "1 Timothy"),
    55: ("2tim", "2 Timothy"),
    56: ("titus", "Titus"),
    57: ("phlm", "Philemon"),
    58: ("heb", "Hebrews"),
    59: ("jas", "James"),
    60: ("1pet", "1 Peter"),
    61: ("2pet", "2 Peter"),
    62: ("1john", "1 John"),
    63: ("2john", "2 John"),
    64: ("3john", "3 John"),
    65: ("jude", "Jude"),
    66: ("rev", "Revelation"),
}

# Famous/important verses to extract (book_code, chapter, verse)
# These are theologically significant, famous, and grammatically varied
FAMOUS_VERSES = [
    # Matthew
    (40, 1, 21), (40, 3, 2), (40, 4, 4), (40, 5, 3), (40, 5, 8), (40, 5, 9),
    (40, 5, 14), (40, 5, 16), (40, 5, 44), (40, 6, 9), (40, 6, 10), (40, 6, 11),
    (40, 6, 12), (40, 6, 13), (40, 6, 33), (40, 7, 7), (40, 7, 12), (40, 11, 28),
    (40, 11, 29), (40, 16, 18), (40, 16, 24), (40, 18, 20), (40, 22, 37), (40, 22, 39),
    (40, 28, 18), (40, 28, 19), (40, 28, 20),
    # Mark
    (41, 1, 1), (41, 1, 15), (41, 8, 34), (41, 8, 35), (41, 10, 45), (41, 12, 30),
    (41, 12, 31), (41, 16, 15), (41, 16, 16),
    # Luke
    (42, 1, 37), (42, 2, 10), (42, 2, 11), (42, 2, 14), (42, 4, 18), (42, 6, 31),
    (42, 9, 23), (42, 10, 27), (42, 11, 9), (42, 15, 7), (42, 19, 10), (42, 23, 34),
    (42, 24, 6), (42, 24, 7),
    # John (many already exist, add more)
    (43, 1, 4), (43, 1, 5), (43, 1, 9), (43, 1, 10), (43, 1, 11), (43, 1, 12),
    (43, 1, 16), (43, 1, 17), (43, 1, 18), (43, 3, 3), (43, 3, 5), (43, 3, 7),
    (43, 3, 17), (43, 3, 18), (43, 3, 19), (43, 3, 36), (43, 4, 24), (43, 5, 24),
    (43, 6, 35), (43, 6, 37), (43, 6, 40), (43, 6, 47), (43, 6, 68), (43, 7, 37),
    (43, 7, 38), (43, 8, 12), (43, 8, 31), (43, 8, 32), (43, 8, 34), (43, 8, 36),
    (43, 10, 9), (43, 10, 10), (43, 10, 11), (43, 10, 27), (43, 10, 28), (43, 10, 30),
    (43, 11, 25), (43, 11, 35), (43, 12, 32), (43, 12, 46), (43, 13, 34), (43, 13, 35),
    (43, 14, 15), (43, 14, 21), (43, 14, 23), (43, 14, 27), (43, 15, 5), (43, 15, 12),
    (43, 15, 13), (43, 16, 33), (43, 17, 3), (43, 17, 17), (43, 20, 29), (43, 20, 31),
    (43, 21, 17),
    # Acts
    (44, 1, 8), (44, 2, 38), (44, 2, 42), (44, 4, 12), (44, 16, 31), (44, 17, 28),
    (44, 20, 35),
    # Romans
    (45, 1, 16), (45, 1, 17), (45, 3, 23), (45, 5, 1), (45, 5, 8), (45, 6, 23),
    (45, 8, 1), (45, 8, 18), (45, 8, 26), (45, 8, 28), (45, 8, 31), (45, 8, 37),
    (45, 8, 38), (45, 8, 39), (45, 10, 9), (45, 10, 10), (45, 10, 17), (45, 11, 33),
    (45, 12, 1), (45, 12, 2), (45, 12, 9), (45, 12, 10), (45, 12, 12), (45, 12, 21),
    (45, 13, 8), (45, 15, 13),
    # 1 Corinthians
    (46, 1, 18), (46, 2, 9), (46, 6, 19), (46, 6, 20), (46, 10, 13), (46, 10, 31),
    (46, 12, 27), (46, 13, 1), (46, 13, 4), (46, 13, 7), (46, 13, 8), (46, 13, 13),
    (46, 15, 3), (46, 15, 4), (46, 15, 10), (46, 15, 55), (46, 15, 57), (46, 16, 13),
    # 2 Corinthians
    (47, 4, 18), (47, 5, 7), (47, 5, 17), (47, 5, 21), (47, 9, 7), (47, 12, 9),
    (47, 12, 10),
    # Galatians
    (48, 2, 20), (48, 3, 28), (48, 5, 1), (48, 5, 22), (48, 5, 23), (48, 6, 9),
    # Ephesians
    (49, 2, 8), (49, 2, 9), (49, 2, 10), (49, 3, 20), (49, 4, 32), (49, 5, 25),
    (49, 6, 10), (49, 6, 11), (49, 6, 12),
    # Philippians
    (50, 1, 6), (50, 1, 21), (50, 2, 3), (50, 2, 5), (50, 2, 8), (50, 2, 9),
    (50, 2, 10), (50, 2, 11), (50, 3, 13), (50, 3, 14), (50, 4, 4), (50, 4, 6),
    (50, 4, 7), (50, 4, 8), (50, 4, 13), (50, 4, 19),
    # Colossians
    (51, 1, 15), (51, 1, 16), (51, 1, 17), (51, 2, 9), (51, 3, 1), (51, 3, 2),
    (51, 3, 12), (51, 3, 13), (51, 3, 17), (51, 3, 23),
    # 1 Thessalonians
    (52, 4, 3), (52, 5, 16), (52, 5, 17), (52, 5, 18),
    # 2 Thessalonians
    (53, 3, 3),
    # 1 Timothy
    (54, 2, 5), (54, 4, 12), (54, 6, 6), (54, 6, 10), (54, 6, 12),
    # 2 Timothy
    (55, 1, 7), (55, 2, 15), (55, 3, 16), (55, 3, 17), (55, 4, 7),
    # Titus
    (56, 2, 11), (56, 3, 5),
    # Hebrews
    (58, 4, 12), (58, 4, 16), (58, 10, 25), (58, 11, 1), (58, 11, 6), (58, 12, 1),
    (58, 12, 2), (58, 13, 5), (58, 13, 8),
    # James
    (59, 1, 2), (59, 1, 5), (59, 1, 17), (59, 1, 22), (59, 2, 17), (59, 4, 7),
    (59, 5, 16),
    # 1 Peter
    (60, 2, 9), (60, 2, 24), (60, 3, 15), (60, 4, 8), (60, 5, 7), (60, 5, 8),
    # 2 Peter
    (61, 1, 21), (61, 3, 9),
    # 1 John
    (62, 1, 9), (62, 2, 1), (62, 2, 2), (62, 2, 15), (62, 3, 1), (62, 3, 16),
    (62, 3, 18), (62, 4, 8), (62, 4, 10), (62, 4, 11), (62, 4, 18), (62, 4, 19),
    (62, 5, 3), (62, 5, 11), (62, 5, 12), (62, 5, 13),
    # Jude
    (65, 1, 24), (65, 1, 25),
    # Revelation
    (66, 1, 8), (66, 3, 20), (66, 21, 4), (66, 22, 13), (66, 22, 17), (66, 22, 20),
    (66, 22, 21),
]


def download_and_extract(url: str) -> bytes:
    """Download a zip file and extract its contents."""
    print(f"Downloading {url}...")
    response = urllib.request.urlopen(url)
    zip_data = io.BytesIO(response.read())

    with zipfile.ZipFile(zip_data) as zf:
        # Get the first file in the archive
        name = zf.namelist()[0]
        print(f"Extracting {name}...")
        return zf.read(name)


def parse_bracket_field(text: str) -> list:
    """Parse a field like 〔a｜b｜c〕 into a list."""
    # Remove brackets and split by ｜
    text = text.strip('〔〕')
    return text.split('｜')


def extract_greek_word(tantt_field: str) -> str:
    """Extract the Greek word from TANTT field like 'BIMNRSTWH=Βίβλος=G0976=N-NSF;'"""
    # Extract the Greek word which is the second part after =
    parts = tantt_field.split('=')
    if len(parts) >= 2:
        return parts[1]
    return ""


def parse_keyed_features(csv_data: bytes) -> dict:
    """Parse the keyedFeatures CSV and aggregate by verse."""
    verses = defaultdict(lambda: {"greek_words": [], "translations": []})

    # Decode and parse (tab-separated)
    text = csv_data.decode('utf-8')
    lines = text.strip().split('\n')

    # Skip header
    for line in lines[1:]:
        if not line.strip():
            continue

        parts = line.split('\t')
        if len(parts) < 11:
            continue

        try:
            # Parse verse reference from column 5 (index 4)
            ref_field = parts[4]  # 〔book｜chapter｜verse〕
            ref_parts = parse_bracket_field(ref_field)
            if len(ref_parts) >= 3:
                book = int(ref_parts[0])
                chapter = int(ref_parts[1])
                verse = int(ref_parts[2])

                # Extract Greek word from TANTT field (column 8, index 7)
                tantt_field = parts[7]  # 〔TANTT〕
                tantt_content = tantt_field.strip('〔〕')
                greek_word = extract_greek_word(tantt_content)

                # Extract translation from column 11 (index 10)
                # Format: 〔TBESG｜IT｜LT｜ST｜Español〕
                trans_field = parts[10] if len(parts) > 10 else ""
                trans_parts = parse_bracket_field(trans_field)

                # Use LT (Literal Translation, index 2) for clean translation
                translation = trans_parts[2] if len(trans_parts) > 2 else ""

                # Clean up translation (remove brackets for cleaner reading)
                translation = translation.replace('[', '').replace(']', '')

                key = (book, chapter, verse)
                if greek_word:
                    verses[key]["greek_words"].append(greek_word)
                if translation and translation != '-':
                    verses[key]["translations"].append(translation)

        except (ValueError, IndexError) as e:
            continue

    return verses


def create_verse_entry(book_code: int, chapter: int, verse: int,
                       greek_text: str, translation: str, tier: int = 2) -> dict:
    """Create a verse entry in the expected format."""
    book_id, book_name = BOOK_MAP.get(book_code, ("unknown", "Unknown"))

    return {
        "id": f"{book_id}-{chapter}-{verse}",
        "book": book_id,
        "chapter": chapter,
        "verse": verse,
        "reference": f"{book_name} {chapter}:{verse}",
        "greek": greek_text,
        "transliteration": "",  # Will need to be added separately
        "referenceTranslation": translation,
        "keyTerms": [],  # Will need to be added separately
        "difficulty": tier,
        "notes": "",
        "tier": tier
    }


def main():
    # Download the keyedFeatures data
    url = "https://raw.githubusercontent.com/eliranwong/OpenGNT/master/OpenGNT_keyedFeatures.csv.zip"

    try:
        csv_data = download_and_extract(url)
        verses = parse_keyed_features(csv_data)

        print(f"\nParsed {len(verses)} total verses from OpenGNT")

        # Create verse entries for our famous verses
        output_verses = []
        missing = []

        for book_code, chapter, verse_num in FAMOUS_VERSES:
            key = (book_code, chapter, verse_num)
            if key in verses:
                data = verses[key]
                greek_text = " ".join(data["greek_words"])
                translation = " ".join(data["translations"])

                # Clean up the text
                greek_text = re.sub(r'\s+', ' ', greek_text).strip()
                translation = re.sub(r'\s+', ' ', translation).strip()

                # Assign difficulty tier based on verse length
                word_count = len(greek_text.split())
                if word_count <= 10:
                    tier = 1
                elif word_count <= 20:
                    tier = 2
                else:
                    tier = 3

                entry = create_verse_entry(book_code, chapter, verse_num,
                                          greek_text, translation, tier)
                output_verses.append(entry)
            else:
                book_id, book_name = BOOK_MAP.get(book_code, ("unknown", "Unknown"))
                missing.append(f"{book_name} {chapter}:{verse_num}")

        print(f"\nCreated {len(output_verses)} verse entries")
        if missing:
            print(f"Missing verses ({len(missing)}): {', '.join(missing[:10])}...")

        # Save to a temporary JSON file
        output_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "new_verses.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_verses, f, ensure_ascii=False, indent=2)

        print(f"\nSaved to {output_path}")

        # Also print a few sample verses
        print("\nSample verses:")
        for v in output_verses[:3]:
            print(f"  {v['reference']}: {v['greek'][:50]}...")
            print(f"    → {v['referenceTranslation'][:60]}...")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
