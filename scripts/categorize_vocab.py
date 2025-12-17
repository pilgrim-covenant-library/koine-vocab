#!/usr/bin/env python3
"""
Categorize vocabulary words with semantic categories.
Uses pattern matching, keyword detection, and known word lists.
"""

import json
import os
import re

# Known proper names (biblical figures)
NAMES = {
    'Ἰησοῦς', 'Χριστός', 'Πέτρος', 'Παῦλος', 'Ἰωάννης', 'Μαρία', 'Μάρθα',
    'Ἀβραάμ', 'Μωϋσῆς', 'Δαυίδ', 'Ἰακώβ', 'Ἰσραήλ', 'Πιλᾶτος', 'Ἡρῴδης',
    'Βαρναβᾶς', 'Σίμων', 'Τιμόθεος', 'Φίλιππος', 'Ἀνδρέας', 'Θωμᾶς',
    'Ματθαῖος', 'Ἰούδας', 'Στέφανος', 'Σατανᾶς', 'Λάζαρος', 'Ἠλίας',
    'Ἰωσήφ', 'Σολομών', 'Σαμουήλ', 'Ἀδάμ', 'Εὔα', 'Καῖσαρ'
}

# Known places
PLACES = {
    'Ἰερουσαλήμ', 'Ἱεροσόλυμα', 'Γαλιλαία', 'Ἰουδαία', 'Σαμάρεια',
    'Ἰορδάνης', 'Βηθλέεμ', 'Ναζαρέθ', 'Καπερναούμ', 'Ῥώμη', 'Ἀθῆναι',
    'Κόρινθος', 'Ἔφεσος', 'Ἀντιόχεια', 'Δαμασκός', 'Αἴγυπτος', 'Σιών',
    'Βαβυλών', 'Γαλατία', 'Μακεδονία', 'Ἀχαΐα', 'Ἀσία', 'Κρήτη'
}

# Theological term patterns
THEOLOGICAL_PATTERNS = [
    r'sin', r'salv', r'grace', r'faith', r'righteous', r'holy', r'spirit',
    r'gospel', r'kingdom', r'eternal', r'redeem', r'forgive', r'covenant',
    r'bapti', r'resurrect', r'sanctif', r'justify', r'atone', r'glory',
    r'bless', r'worship', r'pray', r'prophecy', r'messiah', r'christ',
    r'cross', r'blood', r'lamb', r'sacrifice', r'temple', r'altar'
]

# Body part patterns
BODY_PATTERNS = [
    r'\bhand\b', r'\bfoot\b', r'\bfeet\b', r'\beye\b', r'\bear\b', r'\bmouth\b',
    r'\bhead\b', r'\bheart\b', r'\bface\b', r'\bflesh\b', r'\bbody\b', r'\bblood\b',
    r'\bbone\b', r'\btongue\b', r'\btooth\b', r'\bhair\b', r'\barm\b', r'\bleg\b',
    r'\bneck\b', r'\bfinger\b', r'\bkne\b'
]

# Time-related patterns
TIME_PATTERNS = [
    r'\bday\b', r'\bnight\b', r'\bhour\b', r'\btime\b', r'\byear\b', r'\bmonth\b',
    r'\bweek\b', r'\bsabbath\b', r'\bmorning\b', r'\bevening\b', r'\bseason\b',
    r'\bage\b', r'\beternity\b', r'\bforever\b', r'\bnow\b', r'\bthen\b',
    r'\bmoment\b', r'\bera\b', r'\bgeneration\b'
]

# Family relation patterns
FAMILY_PATTERNS = [
    r'\bfather\b', r'\bmother\b', r'\bson\b', r'\bdaughter\b', r'\bbrother\b',
    r'\bsister\b', r'\bchild\b', r'\bparent\b', r'\bhusband\b', r'\bwife\b',
    r'\bwidow\b', r'\borphan\b', r'\bfamily\b', r'\bancestor\b', r'\bdescend'
]

# Nature patterns
NATURE_PATTERNS = [
    r'\bsea\b', r'\bwater\b', r'\bheaven\b', r'\bearth\b', r'\bsky\b', r'\bstar\b',
    r'\bsun\b', r'\bmoon\b', r'\bwind\b', r'\bfire\b', r'\blight\b', r'\bdark\b',
    r'\bmountain\b', r'\bhill\b', r'\briver\b', r'\btree\b', r'\bfruit\b', r'\bseed\b',
    r'\bfield\b', r'\bvine\b', r'\bwheat\b', r'\bfish\b', r'\bbird\b', r'\banimal\b',
    r'\bsheep\b', r'\bwolf\b', r'\blion\b', r'\bcloud\b', r'\brain\b', r'\bstone\b'
]

# Abstract concept patterns
ABSTRACT_PATTERNS = [
    r'\btruth\b', r'\bwisdom\b', r'\bknowledge\b', r'\bpower\b', r'\bstrength\b',
    r'\bpeace\b', r'\bhope\b', r'\blife\b', r'\bdeath\b', r'\bjudg', r'\blaw\b',
    r'\bword\b', r'\bname\b', r'\bwill\b', r'\bway\b', r'\bwork\b', r'\bplan\b',
    r'\bpurpose\b', r'\bmystery\b', r'\bsecret\b', r'\brevelat'
]

# Emotion patterns
EMOTION_PATTERNS = [
    r'\blove\b', r'\bjoy\b', r'\bfear\b', r'\banger\b', r'\bsorrow\b', r'\bgrief\b',
    r'\bhappy\b', r'\bsad\b', r'\bweep\b', r'\bcry\b', r'\blaugh\b', r'\bhate\b',
    r'\bdesire\b', r'\bhope\b', r'\bworry\b', r'\banxious\b', r'\bpeace\b',
    r'\bcomfort\b', r'\bafraid\b'
]

# Religious practice patterns
RELIGIOUS_PATTERNS = [
    r'\bpray\b', r'\bworship\b', r'\boffering\b', r'\bsacrifice\b', r'\btemple\b',
    r'\bsynagogue\b', r'\bchurch\b', r'\bpriest\b', r'\blevite\b', r'\bpharisee\b',
    r'\bsadducee\b', r'\bscribe\b', r'\bfeast\b', r'\bfasting\b', r'\btith',
    r'\bcircumci', r'\bclean\b', r'\bunclean\b', r'\bpure\b', r'\bimpure\b'
]

# Authority patterns
AUTHORITY_PATTERNS = [
    r'\bking\b', r'\blord\b', r'\bruler\b', r'\bmaster\b', r'\bservant\b', r'\bslave\b',
    r'\bauthority\b', r'\bpower\b', r'\bthrone\b', r'\bcrown\b', r'\bgovernor\b',
    r'\bjudge\b', r'\bcaptain\b', r'\bcommand\b', r'\breign\b', r'\bdomin'
]

# Speech/communication patterns
SPEECH_PATTERNS = [
    r'\bsay\b', r'\bspeak\b', r'\btell\b', r'\bword\b', r'\bvoice\b', r'\bcall\b',
    r'\bcry\b', r'\bshout\b', r'\bteach\b', r'\bpreach\b', r'\bproclaim\b',
    r'\bannounce\b', r'\bdeclare\b', r'\bwitness\b', r'\btestif', r'\bconfess\b',
    r'\bask\b', r'\banswer\b', r'\bquestion\b', r'\bwrite\b', r'\bread\b'
]

# Action verb patterns (for verbs not caught by other categories)
ACTION_PATTERNS = [
    r'\bgo\b', r'\bcome\b', r'\bwalk\b', r'\brun\b', r'\bsend\b', r'\bsee\b',
    r'\bhear\b', r'\btake\b', r'\bgive\b', r'\bdo\b', r'\bmake\b', r'\bput\b',
    r'\bset\b', r'\bbring\b', r'\blead\b', r'\bfollow\b', r'\bfind\b', r'\bseek\b',
    r'\bleave\b', r'\benter\b', r'\bopen\b', r'\bclose\b', r'\beat\b', r'\bdrink\b',
    r'\bsleep\b', r'\brise\b', r'\bfall\b', r'\bstand\b', r'\bsit\b', r'\blie\b'
]

def matches_patterns(text: str, patterns: list) -> bool:
    """Check if text matches any of the given patterns."""
    text_lower = text.lower()
    for pattern in patterns:
        if re.search(pattern, text_lower):
            return True
    return False

def categorize_word(word: dict) -> str:
    """Determine the semantic category for a word."""
    greek = word.get('greek', '')
    gloss = word.get('gloss', '')
    definition = word.get('definition', '')
    pos = word.get('partOfSpeech', '')
    combined_text = f"{gloss} {definition}"

    # Check for proper names
    if any(name in greek for name in NAMES):
        return 'name'

    # Check for places
    if any(place in greek for place in PLACES):
        return 'place'

    # Check gloss/definition for category patterns
    if matches_patterns(combined_text, THEOLOGICAL_PATTERNS):
        return 'theological'

    if matches_patterns(combined_text, BODY_PATTERNS):
        return 'body'

    if matches_patterns(combined_text, TIME_PATTERNS):
        return 'time'

    if matches_patterns(combined_text, FAMILY_PATTERNS):
        return 'family'

    if matches_patterns(combined_text, NATURE_PATTERNS):
        return 'nature'

    if matches_patterns(combined_text, EMOTION_PATTERNS):
        return 'emotion'

    if matches_patterns(combined_text, RELIGIOUS_PATTERNS):
        return 'religious'

    if matches_patterns(combined_text, AUTHORITY_PATTERNS):
        return 'authority'

    if matches_patterns(combined_text, SPEECH_PATTERNS):
        return 'speech'

    if matches_patterns(combined_text, ABSTRACT_PATTERNS):
        return 'abstract'

    # For verbs not caught by specific categories
    if pos == 'verb' and matches_patterns(combined_text, ACTION_PATTERNS):
        return 'action'

    # Default
    return 'general'

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    vocab_path = os.path.join(script_dir, '..', 'src', 'data', 'vocabulary.json')

    with open(vocab_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    words = data.get('words', [])
    print(f"Processing {len(words)} words...")

    # Category counts for stats
    category_counts = {}

    for word in words:
        category = categorize_word(word)
        word['semanticCategory'] = category
        category_counts[category] = category_counts.get(category, 0) + 1

    # Save updated vocabulary
    with open(vocab_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved updated vocabulary to {vocab_path}")
    print("\nCategory distribution:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        pct = count / len(words) * 100
        print(f"  {cat}: {count} ({pct:.1f}%)")

if __name__ == '__main__':
    main()
