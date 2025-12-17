#!/usr/bin/env python3
"""
Add morphology data from STEPBible TBESG lexicon to vocabulary.json

Data source: STEPBible-Data (CC BY 4.0)
https://github.com/STEPBible/STEPBible-Data
"""

import json
import re
import sys
import unicodedata

# Morphology code mappings
MORPH_TYPE = {
    'N': 'noun',
    'V': 'verb',
    'A': 'adjective',
    'ADV': 'adverb',
    'ART': 'article',
    'T': 'article',          # alternate code
    'COND': 'conditional',
    'CONJ': 'conjunction',
    'COR': 'correlative',
    'D': 'demonstrative',    # demonstrative pronoun
    'DEMP': 'demonstrative pronoun',
    'IMPP': 'impersonal pronoun',
    'INTG': 'interrogative',
    'INJ': 'interjection',
    'NEG': 'negative',
    'P': 'pronoun',          # general pronoun
    'PART': 'particle',
    'PRT': 'particle',       # alternate code
    'PRT-N': 'negative particle',
    'PREP': 'preposition',
    'PERP': 'personal pronoun',
    'POSP': 'possessive pronoun',
    'REFP': 'reflexive pronoun',
    'RELP': 'relative pronoun',
    'A-NUI': 'numeral adjective',
}

GENDER = {
    'M': 'masculine',
    'F': 'feminine',
    'N': 'neuter',
    'C': 'common',
}

def parse_morph(morph_code):
    """Parse STEPBible morphology code into structured data."""
    if not morph_code or morph_code == '-':
        return None

    # Format: Language:Type-Gender-Extra
    # Examples: G:N-F (Greek Noun Feminine), G:V (Greek Verb), N:N-M-P (Name Noun Male Person)

    parts = morph_code.split(':')
    if len(parts) < 2:
        return None

    language = parts[0]  # G=Greek, H=Hebrew, N=Name
    rest = parts[1]

    result = {
        'language': language,
    }

    # Split by dash
    components = rest.split('-')

    # First component is the type
    if components:
        type_code = components[0].upper()
        if type_code in MORPH_TYPE:
            result['type'] = MORPH_TYPE[type_code]
        else:
            result['type'] = type_code.lower()

    # Second component is typically gender
    if len(components) > 1:
        gender_code = components[1].upper()
        # Handle composite like "M/F" or just single letter
        if gender_code and gender_code[0] in GENDER:
            result['gender'] = GENDER[gender_code[0]]
        if 'S' in gender_code:
            result['number'] = 'singular'
        if 'P' in gender_code:
            result['number'] = 'plural'

    # Third component is extra info (for names: P=Person, L=Location, etc.)
    if len(components) > 2:
        extra = components[2].upper()
        if extra == 'P':
            result['category'] = 'person'
        elif extra == 'L':
            result['category'] = 'location'
        elif extra == 'T':
            result['category'] = 'title'
        elif extra == 'LI':
            result['category'] = 'indeclinable'

    return result


def normalize_greek(text):
    """Normalize Greek text by removing accents/diacritics for comparison."""
    if not text:
        return ''
    # Remove parenthetical suffixes like (ς), (ν)
    text = re.sub(r'\([^)]+\)', '', text)
    # Normalize to NFD form (decomposed), then strip combining marks
    normalized = unicodedata.normalize('NFD', text)
    # Remove combining diacritical marks (category 'Mn')
    stripped = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    # Convert to lowercase for comparison
    return stripped.lower()


def get_active_form(middle_form):
    """Convert middle/passive form to active form for verb matching."""
    if not middle_form:
        return None
    # Common patterns: -ομαι -> -ω, -εομαι -> -εω
    if middle_form.endswith('ομαι'):
        return middle_form[:-4] + 'ω'
    if middle_form.endswith('εομαι'):
        return middle_form[:-5] + 'εω'
    if middle_form.endswith('μαι'):
        return middle_form[:-3] + 'μι'
    return None


# Manual mapping for words with irregular forms that don't match automatically
MANUAL_STRONGS = {
    'οὕτω(ς)': 'G3779',      # οὕτως in TBESG
    'ἀπόλλυμι': 'G622',      # ἀπολλύω in TBESG
    'εὐαγγελίζω': 'G2097',   # εὐαγγελίζομαι in TBESG
    'δείκνυμι': 'G1166',     # δεικνύω in TBESG
}


def load_tbesg(filepath):
    """Load and parse TBESG lexicon data.

    Returns:
        tuple: (lexicon_by_strong, lexicon_by_greek)
    """
    lexicon_by_strong = {}
    lexicon_by_greek = {}

    with open(filepath, 'r', encoding='utf-8') as f:
        in_data = False
        for line in f:
            line = line.strip()

            # Skip until we reach the data section
            if line.startswith('eStrong\t'):
                in_data = True
                continue

            if not in_data:
                continue

            # Skip empty lines and comment lines
            if not line or line.startswith('$') or line.startswith('-'):
                continue

            # Parse tab-separated fields
            fields = line.split('\t')
            if len(fields) < 7:
                continue

            estrong = fields[0].strip()
            greek = fields[3].strip() if len(fields) > 3 else ''
            transliteration = fields[4].strip() if len(fields) > 4 else ''
            morph = fields[5].strip() if len(fields) > 5 else ''
            gloss = fields[6].strip() if len(fields) > 6 else ''

            # Skip if not a valid Strong's number
            if not re.match(r'^G\d+', estrong):
                continue

            # Extract the base Strong's number (without letter suffixes)
            base_strong = re.match(r'(G\d+)', estrong).group(1)

            # Normalize to remove leading zeros (G0846 -> G846)
            normalized_strong = 'G' + str(int(base_strong[1:]))

            entry = {
                'estrong': estrong,
                'strong': normalized_strong,
                'greek': greek,
                'transliteration': transliteration,
                'morph_code': morph,
                'morph': parse_morph(morph),
                'gloss': gloss,
            }

            # Only store first entry for each Strong's number
            if normalized_strong not in lexicon_by_strong:
                lexicon_by_strong[normalized_strong] = entry

            # Also index by normalized Greek word
            # Handle multiple forms separated by comma (e.g., "α, Ἀλφα")
            for greek_form in greek.split(','):
                greek_form = greek_form.strip()
                if greek_form:
                    norm = normalize_greek(greek_form)
                    if norm and norm not in lexicon_by_greek:
                        lexicon_by_greek[norm] = entry

    return lexicon_by_strong, lexicon_by_greek

def main():
    # Load vocabulary.json
    vocab_path = '/home/jonathan/koine-vocab/src/data/vocabulary.json'
    tbesg_path = '/tmp/tbesg.txt'

    print(f"Loading vocabulary from {vocab_path}...")
    with open(vocab_path, 'r', encoding='utf-8') as f:
        vocab_data = json.load(f)

    print(f"Loading TBESG lexicon from {tbesg_path}...")
    lexicon_by_strong, lexicon_by_greek = load_tbesg(tbesg_path)
    print(f"Loaded {len(lexicon_by_strong)} entries by Strong's, {len(lexicon_by_greek)} by Greek word")

    # Match and add morphology
    matched_by_strong = 0
    matched_by_greek = 0
    unmatched = []

    for word in vocab_data['words']:
        strongs = word.get('strongs', word.get('id', ''))
        greek = word.get('greek', '')

        entry = None

        # First check manual mapping for irregular words
        if greek in MANUAL_STRONGS:
            manual_strong = MANUAL_STRONGS[greek]
            if manual_strong in lexicon_by_strong:
                entry = lexicon_by_strong[manual_strong]
                matched_by_strong += 1
                word['strongs'] = manual_strong
        # Then try to match by Strong's number
        elif strongs in lexicon_by_strong:
            entry = lexicon_by_strong[strongs]
            matched_by_strong += 1
        else:
            # Fall back to matching by normalized Greek word
            norm_greek = normalize_greek(greek)
            if norm_greek in lexicon_by_greek:
                entry = lexicon_by_greek[norm_greek]
                matched_by_greek += 1
                # Also add the Strong's number reference
                word['strongs'] = entry['strong']

        # Try alternate forms if still no match
        if not entry and greek not in MANUAL_STRONGS:
            # Try active form for middle/deponent verbs
            active = get_active_form(greek)
            if active:
                norm_active = normalize_greek(active)
                if norm_active in lexicon_by_greek:
                    entry = lexicon_by_greek[norm_active]
                    matched_by_greek += 1
                    word['strongs'] = entry['strong']

        if entry:
            # Add morphology data
            if entry['morph']:
                word['morphology'] = entry['morph']
        else:
            unmatched.append((strongs, greek))

    total_matched = matched_by_strong + matched_by_greek
    print(f"\nMatched: {total_matched} words")
    print(f"  - By Strong's: {matched_by_strong}")
    print(f"  - By Greek word: {matched_by_greek}")
    print(f"Unmatched: {len(unmatched)} words")

    if unmatched:
        print("\nUnmatched words (first 20):")
        for strong, greek in unmatched[:20]:
            print(f"  {strong}: {greek}")

    # Save updated vocabulary
    output_path = vocab_path
    print(f"\nSaving updated vocabulary to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)

    print("Done!")

if __name__ == '__main__':
    main()
