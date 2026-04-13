#!/usr/bin/env python3
"""
Fill in missing transliterations, keyTerms, and notes for all 224 incomplete
NT verses in nt-verses.json.  Also fixes garbled referenceTranslations and
adds verses for three empty books (Philemon, 2 John, 3 John).
"""

import json
import re
import unicodedata
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "nt-verses.json"

# ---------------------------------------------------------------------------
# Greek-to-Latin transliteration engine
# ---------------------------------------------------------------------------

# Mapping of Greek lowercase letters to Latin equivalents
GREEK_MAP = {
    "α": "a", "β": "b", "γ": "g", "δ": "d", "ε": "e",
    "ζ": "z", "η": "ē", "θ": "th", "ι": "i", "κ": "k",
    "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o",
    "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t",
    "υ": "y", "φ": "ph", "χ": "ch", "ψ": "ps", "ω": "ō",
    # archaic / rare
    "ϝ": "w", "ϛ": "st", "ϙ": "q", "ϡ": "ss",
}

DIGRAPHS = {
    "ου": "ou", "αι": "ai", "ει": "ei", "οι": "oi",
    "αυ": "au", "ευ": "eu", "ηυ": "ēu", "υι": "ui",
}

# Proper nouns that should be capitalized in transliteration
PROPER_NOUNS = {
    "Ἰησοῦ", "Ἰησοῦς", "Ἰησοῦν", "Χριστοῦ", "Χριστὸς", "Χριστός",
    "Πέτρος", "Πέτρον", "Πέτρου", "Σίμων", "Σίμωνος",
    "Μωϋσέως", "Μωϋσῆς", "Δαυίδ", "Ἀβραάμ", "Ἰσαάκ",
    "Ἰωάννου", "Ἰωάννης", "Παῦλος", "Τιμόθεος", "Φιλήμονι",
    "Γαΐῳ", "Ἰσραήλ", "Ἕλλην", "Ἰουδαῖος",
}


def strip_accents(ch: str) -> str:
    """Remove combining diacriticals but keep the base letter."""
    decomposed = unicodedata.normalize("NFD", ch)
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn")


def has_rough_breathing(word: str) -> bool:
    """Check if the first vowel carries a rough breathing mark."""
    decomposed = unicodedata.normalize("NFD", word)
    saw_vowel = False
    for ch in decomposed:
        if ch.lower() in "αεηιουω":
            saw_vowel = True
        if saw_vowel and ch == "\u0314":  # combining reversed comma above
            return True
        if saw_vowel and unicodedata.category(ch) == "Ll":
            break
    # Also check for single precomposed rough-breathing chars
    if word and word[0] in "ἁἅἃἇἑἕἓἡἥἣἧἱἵἳἷὁὅὃὑὕὓὗὡὥὣὧ":
        return True
    if word and word[0] in "Ἁ Ἅ Ἃ Ἇ Ἑ Ἕ Ἓ Ἡ Ἥ Ἣ Ἧ Ἱ Ἵ Ἳ Ἷ Ὁ Ὅ Ὃ Ὑ Ὕ Ὓ Ὗ Ὡ Ὥ Ὣ Ὧ".split():
        return True
    return False


def transliterate_word(word: str) -> str:
    """Transliterate a single Greek word to scholarly Latin."""
    if not word:
        return word

    # Check if this is a proper noun (should be capitalized)
    is_proper = word[0].isupper() or any(word.startswith(strip_accents(pn)[:3]) for pn in PROPER_NOUNS if strip_accents(pn)[:3])
    # More precise: check if the raw word (or its accent-stripped form) is in proper nouns
    word_stripped = strip_accents(word).lower()
    is_proper = word[0].isupper()

    # Check rough breathing
    add_h = has_rough_breathing(word)

    # Strip all accents/breathings for transliteration mapping
    # but we process the original to detect digraphs on base letters
    lower = word.lower()
    # Normalize and get base letters
    base_chars = []
    for ch in lower:
        stripped = strip_accents(ch)
        if stripped:
            base_chars.append(stripped)

    # Now transliterate from base_chars
    result = []
    i = 0
    while i < len(base_chars):
        ch = base_chars[i]
        # Check for digraphs
        if i + 1 < len(base_chars):
            pair = ch + base_chars[i + 1]
            if pair in DIGRAPHS:
                result.append(DIGRAPHS[pair])
                i += 2
                continue
        # Double gamma -> ng
        if ch == "γ" and i + 1 < len(base_chars) and base_chars[i + 1] in ("γ", "κ", "ξ", "χ"):
            result.append("n")
            i += 1
            continue
        # Single character
        if ch in GREEK_MAP:
            result.append(GREEK_MAP[ch])
        elif ch in " \t\n":
            result.append(ch)
        elif ch in ".,;·:!?'\"()-–—":
            result.append(ch)
        elif ch == "᾽" or ch == "᾿" or ch == "\u1fbd" or ch == "\u1fbf":
            pass  # skip breathing marks that survived
        else:
            result.append(ch)
        i += 1

    text = "".join(result)

    # Add h- prefix for rough breathing
    if add_h and text and text[0] not in ("h",):
        text = "h" + text

    # Capitalize if proper noun
    if is_proper:
        text = text[0].upper() + text[1:] if text else text

    return text


def transliterate_greek(greek_text: str) -> str:
    """Transliterate a full Greek sentence."""
    # Split on whitespace, keeping punctuation attached
    tokens = re.findall(r"[\w\u0370-\u03FF\u1F00-\u1FFF]+|[^\w\s]|\s+", greek_text)
    result = []
    for token in tokens:
        if re.match(r"[\u0370-\u03FF\u1F00-\u1FFF]", token):
            result.append(transliterate_word(token))
        else:
            result.append(token)
    return "".join(result)


# ---------------------------------------------------------------------------
# Verse-specific data: keyTerms, notes, and translation fixes
# ---------------------------------------------------------------------------

# For each incomplete verse, provide keyTerms, notes, and optionally a fixed
# referenceTranslation.  The transliteration is auto-generated.

VERSE_DATA = {
    # ---- MATTHEW ----
    "matt-1-21": {
        "keyTerms": ["give birth", "son", "Jesus", "save", "people", "sins"],
        "notes": "Future indicatives τέξεται, σώσει. Name Ἰησοῦν explained etymologically.",
        "fixedTranslation": "She shall give birth to a son, and you shall call his name Jesus, for it is he who shall save his people from their sins.",
    },
    "matt-3-2": {
        "keyTerms": ["repent", "kingdom", "heaven", "drawn near"],
        "notes": "Present imperative μετανοεῖτε — continuous call. Perfect ἤγγικεν — the kingdom has arrived and remains near.",
        "fixedTranslation": 'And saying, "Repent, for the kingdom of heaven has drawn near."',
    },
    "matt-4-4": {
        "keyTerms": ["written", "bread", "alone", "live", "word", "mouth", "God"],
        "notes": "Perfect passive γέγραπται introduces OT quotation (Deut 8:3). Dative ἐπ᾽ ἄρτῳ.",
    },
    "matt-5-8": {
        "keyTerms": ["blessed", "pure", "heart", "see", "God"],
        "notes": "Sixth Beatitude. Dative of reference τῇ καρδίᾳ. Future deponent ὄψονται.",
        "fixedTranslation": "Blessed are the pure in heart, for they will see God.",
    },
    "matt-5-9": {
        "keyTerms": ["blessed", "peacemakers", "sons", "God", "called"],
        "notes": "Seventh Beatitude. Compound noun εἰρηνοποιοί. Future passive κληθήσονται.",
        "fixedTranslation": "Blessed are the peacemakers, for they will be called sons of God.",
    },
    "matt-5-14": {
        "keyTerms": ["light", "world", "city", "hill", "hidden"],
        "notes": "Predicate nominative τὸ φῶς. Aorist passive infinitive κρυβῆναι.",
    },
    "matt-5-16": {
        "keyTerms": ["shine", "light", "men", "good works", "glorify", "Father"],
        "notes": "Aorist imperative λαμψάτω. Purpose clause with ὅπως + subjunctive.",
        "fixedTranslation": "In the same way, let your light shine before men, so that they may see your good works and glorify your Father who is in heaven.",
    },
    "matt-5-44": {
        "keyTerms": ["love", "enemies", "pray", "persecuting"],
        "notes": "Present imperatives ἀγαπᾶτε, προσεύχεσθε — continuous action. Substantival participle τῶν διωκόντων.",
        "fixedTranslation": "But I say to you, love your enemies and pray for those who persecute you,",
    },
    "matt-6-10": {
        "keyTerms": ["kingdom", "come", "will", "done", "heaven", "earth"],
        "notes": "Two aorist passive imperatives ἐλθέτω, γενηθήτω. Comparative ὡς...καί construction.",
        "fixedTranslation": "Your kingdom come, your will be done, on earth as it is in heaven.",
    },
    "matt-6-11": {
        "keyTerms": ["bread", "daily", "give", "today"],
        "notes": "Aorist imperative δός. Rare adjective ἐπιούσιον — meaning debated (daily/necessary).",
    },
    "matt-6-12": {
        "keyTerms": ["forgive", "debts", "forgiven", "debtors"],
        "notes": "Aorist imperative ἄφες. Aorist ἀφήκαμεν — completed action of forgiveness.",
        "fixedTranslation": "And forgive us our debts, as we also have forgiven our debtors.",
    },
    "matt-6-13": {
        "keyTerms": ["lead", "temptation", "deliver", "evil"],
        "notes": "Aorist subjunctive εἰσενέγκῃς with μή — prohibition. Aorist imperative ῥῦσαι.",
        "fixedTranslation": "And do not lead us into temptation, but deliver us from evil.",
    },
    "matt-6-33": {
        "keyTerms": ["seek", "first", "kingdom", "God", "righteousness", "given"],
        "notes": "Present imperative ζητεῖτε — continuous seeking. Future passive προστεθήσεται.",
    },
    "matt-7-7": {
        "keyTerms": ["ask", "given", "seek", "find", "knock", "opened"],
        "notes": "Three present imperatives (αἰτεῖτε, ζητεῖτε, κρούετε) paired with future passives. Continuous action.",
    },
    "matt-7-12": {
        "keyTerms": ["desire", "men", "do", "law", "prophets"],
        "notes": "Golden Rule. ὅσα ἐάν + subjunctive — indefinite relative clause. Present imperative ποιεῖτε.",
        "fixedTranslation": "Therefore whatever you desire that men should do to you, so also do to them, for this is the law and the prophets.",
    },
    "matt-11-29": {
        "keyTerms": ["yoke", "learn", "gentle", "humble", "heart", "rest", "souls"],
        "notes": "Aorist imperatives ἄρατε, μάθετε. Predicate adjectives πραΰς, ταπεινός.",
    },
    "matt-16-18": {
        "keyTerms": ["Peter", "rock", "build", "church", "gates", "Hades", "prevail"],
        "notes": "Wordplay Πέτρος/πέτρα. Future active οἰκοδομήσω. Genitive τοῦ ᾅδου.",
        "fixedTranslation": "And I also say to you that you are Peter, and on this rock I will build my church, and the gates of Hades will not prevail against it.",
    },
    "matt-16-24": {
        "keyTerms": ["Jesus", "disciples", "deny", "himself", "cross", "follow"],
        "notes": "Third class condition εἴ τις θέλει. Aorist imperatives ἀπαρνησάσθω, ἀράτω. Present imperative ἀκολουθείτω — continuous following.",
        "fixedTranslation": 'Then Jesus said to his disciples, "If anyone desires to come after me, let him deny himself, take up his cross, and follow me."',
    },
    "matt-18-20": {
        "keyTerms": ["two", "three", "gathered", "name", "midst"],
        "notes": "Perfect passive participle συνηγμένοι. Periphrastic εἰμί ἐν μέσῳ.",
        "fixedTranslation": '"For where two or three are gathered together in my name, there I am in their midst."',
    },
    "matt-22-39": {
        "keyTerms": ["second", "love", "neighbor", "yourself"],
        "notes": "Future indicative ἀγαπήσεις used as imperative (Semitism). Reflexive pronoun σεαυτόν.",
    },
    "matt-28-18": {
        "keyTerms": ["Jesus", "authority", "given", "heaven", "earth"],
        "notes": "Aorist passive ἐδόθη — divine passive. Attributive πᾶσα ἐξουσία.",
        "fixedTranslation": 'And Jesus came and spoke to them, saying, "All authority in heaven and on earth has been given to me."',
    },
    "matt-28-20": {
        "keyTerms": ["teaching", "observe", "commanded", "behold", "always", "end", "age"],
        "notes": "Present participle διδάσκοντες — attendant circumstance. ἰδού + nominative for emphasis.",
        "fixedTranslation": "teaching them to observe all things that I commanded you. And behold, I am with you always, even to the end of the age.",
    },

    # ---- MARK ----
    "mark-8-34": {
        "keyTerms": ["crowd", "disciples", "deny", "himself", "cross", "follow"],
        "notes": "Aorist participle προσκαλεσάμενος. Three imperatives: ἀπαρνησάσθω, ἀράτω, ἀκολουθείτω.",
        "fixedTranslation": 'And having called the crowd together with his disciples, he said to them, "If anyone desires to come after me, let him deny himself, take up his cross, and follow me."',
    },
    "mark-8-35": {
        "keyTerms": ["save", "life", "lose", "gospel", "find"],
        "notes": "Conditional with ἐάν + subjunctive. Paradox: σῶσαι/ἀπολέσει.",
        "fixedTranslation": "For whoever desires to save his life will lose it, but whoever loses his life for my sake and the gospel's will save it.",
    },
    "mark-10-45": {
        "keyTerms": ["Son of Man", "came", "served", "serve", "give", "life", "ransom", "many"],
        "notes": "Purpose infinitives διακονηθῆναι, διακονῆσαι, δοῦναι. λύτρον ἀντί — ransom-price.",
    },
    "mark-12-30": {
        "keyTerms": ["love", "Lord", "God", "heart", "soul", "mind", "strength"],
        "notes": "Future indicative ἀγαπήσεις as imperative. Shema quotation (Deut 6:5). Fourfold ἐξ ὅλης.",
        "fixedTranslation": "And you shall love the Lord your God with all your heart, and with all your soul, and with all your mind, and with all your strength.",
    },
    "mark-12-31": {
        "keyTerms": ["second", "love", "neighbor", "yourself", "commandment", "greater"],
        "notes": "Comparative μείζων — no commandment greater than these two.",
        "fixedTranslation": "The second is this: 'You shall love your neighbor as yourself.' There is no other commandment greater than these.",
    },
    "mark-16-15": {
        "keyTerms": ["go", "world", "proclaim", "gospel", "creation"],
        "notes": "Aorist participle πορευθέντες + aorist imperative κηρύξατε. Universal scope: πάσῃ τῇ κτίσει.",
        "fixedTranslation": 'And he said to them, "Go into all the world and proclaim the gospel to all creation."',
    },
    "mark-16-16": {
        "keyTerms": ["believed", "baptized", "saved", "disbelieved", "condemned"],
        "notes": "Aorist participles πιστεύσας, βαπτισθείς. Future passives σωθήσεται, κατακριθήσεται.",
        "fixedTranslation": "The one who has believed and has been baptized will be saved, but the one who has disbelieved will be condemned.",
    },

    # ---- LUKE ----
    "luke-1-37": {
        "keyTerms": ["impossible", "God", "nothing", "word"],
        "notes": "Future active ἀδυνατήσει. παρὰ τοῦ θεοῦ — nothing is impossible 'with' God.",
        "fixedTranslation": "For nothing will be impossible with God.",
    },
    "luke-2-11": {
        "keyTerms": ["born", "today", "Savior", "Christ", "Lord", "David", "city"],
        "notes": "Aorist passive ἐτέχθη. Triple title: σωτήρ, χριστός, κύριος.",
    },
    "luke-2-14": {
        "keyTerms": ["glory", "highest", "God", "earth", "peace", "men", "pleased"],
        "notes": "Genitive εὐδοκίας modifies ἀνθρώποις — 'men of [God's] good pleasure.'",
    },
    "luke-4-18": {
        "keyTerms": ["Spirit", "Lord", "anointed", "preach", "poor", "sent", "captives", "freedom", "blind", "sight", "oppressed"],
        "notes": "Isaiah 61:1 quotation. Aorist ἔχρισέν, perfect ἀπέσταλκέν.",
    },
    "luke-6-31": {
        "keyTerms": ["desire", "men", "do", "likewise"],
        "notes": "Golden Rule (Lukan form). Present subjunctive ποιῶσιν. ὁμοίως — 'in the same way.'",
        "fixedTranslation": "And as you desire that men should do to you, do likewise to them.",
    },
    "luke-9-23": {
        "keyTerms": ["deny", "himself", "cross", "daily", "follow"],
        "notes": "Imperfect ἔλεγεν — habitual teaching. Luke adds καθ᾽ ἡμέραν (daily). Three imperatives.",
        "fixedTranslation": 'And he was saying to all, "If anyone desires to come after me, let him deny himself, take up his cross daily, and follow me."',
    },
    "luke-10-27": {
        "keyTerms": ["love", "Lord", "God", "heart", "soul", "strength", "mind", "neighbor"],
        "notes": "Combines Deut 6:5 and Lev 19:18. Aorist participle ἀποκριθείς.",
        "fixedTranslation": "And he answered, 'You shall love the Lord your God with all your heart, and with all your soul, and with all your strength, and with all your mind; and your neighbor as yourself.'",
    },
    "luke-11-9": {
        "keyTerms": ["ask", "given", "seek", "find", "knock", "opened"],
        "notes": "Three present imperatives matched with future passives. κἀγώ = καὶ ἐγώ (crasis).",
        "fixedTranslation": "And I say to you: Ask and it will be given to you; seek and you will find; knock and it will be opened to you.",
    },
    "luke-15-7": {
        "keyTerms": ["joy", "heaven", "sinner", "repenting", "righteous", "repentance"],
        "notes": "Future ἔσται. Present participle μετανοοῦντι — a sinner who is repenting.",
    },
    "luke-19-10": {
        "keyTerms": ["Son of Man", "came", "seek", "save", "lost"],
        "notes": "Purpose infinitives ζητῆσαι, σῶσαι. Perfect participle τὸ ἀπολωλός — 'the one having been lost.'",
    },
    "luke-23-34": {
        "keyTerms": ["Father", "forgive", "know", "doing", "garments", "lots"],
        "notes": "Present imperative ἄφες. Causal γάρ — reason for forgiveness request.",
    },
    "luke-24-6": {
        "keyTerms": ["risen", "remember", "told", "Galilee"],
        "notes": "Aorist passive ἠγέρθη — divine passive. Aorist imperative μνήσθητε.",
    },
    "luke-24-7": {
        "keyTerms": ["Son of Man", "delivered", "hands", "sinful", "crucified", "rise", "third day"],
        "notes": "Infinitives παραδοθῆναι, σταυρωθῆναι, ἀναστῆναι. δεῖ — divine necessity.",
    },

    # ---- JOHN ----
    "john-1-4": {
        "keyTerms": ["life", "light", "men"],
        "notes": "Imperfect ἦν — continuous past existence. ζωή and φῶς as theological concepts.",
        "fixedTranslation": "In him was life, and the life was the light of men.",
    },
    "john-1-5": {
        "keyTerms": ["light", "shines", "darkness", "overcome"],
        "notes": "Present φαίνει — the light keeps shining. Aorist κατέλαβεν — ambiguous: 'comprehend' or 'overcome.'",
    },
    "john-1-9": {
        "keyTerms": ["true", "light", "enlightens", "every", "man", "world"],
        "notes": "Periphrastic imperfect Ἦν...ἐρχόμενον. ἀληθινόν — 'genuine/real' light.",
        "fixedTranslation": "The true light, which enlightens every man, was coming into the world.",
    },
    "john-1-10": {
        "keyTerms": ["world", "made", "through", "knew"],
        "notes": "Three uses of κόσμος. Aorist ἐγένετο — came into being. Aorist ἔγνω — the world did not know.",
        "fixedTranslation": "He was in the world, and the world was made through him, and the world did not know him.",
    },
    "john-1-11": {
        "keyTerms": ["own", "came", "receive"],
        "notes": "τὰ ἴδια (neuter) = his own things/place; οἱ ἴδιοι (masculine) = his own people. Aorist παρέλαβον.",
        "fixedTranslation": "He came to his own, and his own people did not receive him.",
    },
    "john-1-12": {
        "keyTerms": ["received", "gave", "right", "children", "God", "believe", "name"],
        "notes": "Aorist ἔλαβον, ἔδωκεν. ἐξουσία — authority/right. Epexegetical infinitive γενέσθαι.",
    },
    "john-1-16": {
        "keyTerms": ["fullness", "received", "grace", "upon", "grace"],
        "notes": "ἐκ τοῦ πληρώματος — from the fullness. χάριν ἀντὶ χάριτος — grace replacing grace.",
    },
    "john-1-17": {
        "keyTerms": ["law", "Moses", "grace", "truth", "Jesus Christ"],
        "notes": "Contrast: νόμος through Moses vs. χάρις and ἀλήθεια through Jesus Christ.",
    },
    "john-1-18": {
        "keyTerms": ["God", "seen", "only", "Son", "bosom", "Father", "declared"],
        "notes": "Perfect ἑώρακεν — no one has ever seen. Aorist ἐξηγήσατο — 'he has made known/exegeted.'",
    },
    "john-3-3": {
        "keyTerms": ["truly", "born", "above", "again", "see", "kingdom", "God"],
        "notes": "Double ἀμήν — solemn affirmation unique to John. ἄνωθεν — ambiguous: 'from above' or 'again.'",
        "fixedTranslation": 'Jesus answered and said to him, "Truly, truly, I say to you, unless one is born from above, he cannot see the kingdom of God."',
    },
    "john-3-5": {
        "keyTerms": ["truly", "born", "water", "Spirit", "enter", "kingdom", "God"],
        "notes": "ἐξ ὕδατος καὶ πνεύματος — single preposition governs both nouns. Aorist subjunctive γεννηθῇ.",
        "fixedTranslation": 'Jesus answered, "Truly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God."',
    },
    "john-3-7": {
        "keyTerms": ["wonder", "born", "above", "necessary"],
        "notes": "Aorist subjunctive θαυμάσῃς with μή — prohibition. δεῖ — impersonal 'it is necessary.'",
    },
    "john-3-17": {
        "keyTerms": ["God", "sent", "Son", "world", "judge", "saved"],
        "notes": "Purpose clauses with ἵνα + subjunctive: κρίνῃ (judge) vs. σωθῇ (be saved).",
    },
    "john-3-18": {
        "keyTerms": ["believes", "judged", "already", "name", "only", "Son", "God"],
        "notes": "Present participle ὁ πιστεύων — ongoing belief. Perfect κέκριται — permanent state.",
    },
    "john-3-19": {
        "keyTerms": ["judgment", "light", "come", "world", "loved", "darkness"],
        "notes": "Perfect ἐλήλυθεν — the light has come and remains. Aorist ἠγάπησαν — they loved.",
        "fixedTranslation": "And this is the judgment: the light has come into the world, and men loved the darkness rather than the light, for their deeds were evil.",
    },
    "john-3-36": {
        "keyTerms": ["believes", "Son", "eternal life", "disobeys", "see", "wrath", "God"],
        "notes": "Present participles ὁ πιστεύων, ὁ ἀπειθῶν. Contrast: ἔχει (has) vs. οὐκ ὄψεται (will not see).",
        "fixedTranslation": "The one who believes in the Son has eternal life, but the one who disobeys the Son will not see life, but the wrath of God remains on him.",
    },
    "john-4-24": {
        "keyTerms": ["God", "spirit", "worship", "truth"],
        "notes": "Predicate nominative πνεῦμα ὁ θεός. δεῖ + infinitive — must worship.",
    },
    "john-5-24": {
        "keyTerms": ["truly", "word", "hearing", "believing", "sent", "eternal life", "judgment", "death", "life"],
        "notes": "Double ἀμήν. Substantival participles ὁ ἀκούων, πιστεύων. Perfect μεταβέβηκεν — permanent transfer.",
        "fixedTranslation": '"Truly, truly, I say to you, the one who hears my word and believes him who sent me has eternal life. He does not come into judgment, but has passed from death to life."',
    },
    "john-6-35": {
        "keyTerms": ["Jesus", "bread", "life", "comes", "hunger", "believes", "thirst"],
        "notes": "First 'I am' statement with predicate. οὐ μή + subjunctive — emphatic negation.",
        "fixedTranslation": 'Jesus said to them, "I am the bread of life. The one who comes to me shall never hunger, and the one who believes in me shall never thirst."',
    },
    "john-6-37": {
        "keyTerms": ["Father", "gives", "come", "throw out"],
        "notes": "Neuter πᾶν ὅ — collective 'all that.' οὐ μὴ ἐκβάλω ἔξω — emphatic double negative.",
    },
    "john-6-40": {
        "keyTerms": ["will", "Father", "sees", "Son", "believes", "eternal life", "raise", "last day"],
        "notes": "Purpose clause ἵνα. Present participles ὁ θεωρῶν, πιστεύων. Future ἀναστήσω.",
    },
    "john-6-47": {
        "keyTerms": ["truly", "believes", "eternal life"],
        "notes": "Double ἀμήν. Present participle ὁ πιστεύων — ongoing faith.",
        "fixedTranslation": "Truly, truly, I say to you, the one who believes has eternal life.",
    },
    "john-6-68": {
        "keyTerms": ["Lord", "words", "eternal life"],
        "notes": "Deliberative future ἀπελευσόμεθα — 'where shall we go?' ῥήματα ζωῆς αἰωνίου — words of eternal life.",
    },
    "john-7-37": {
        "keyTerms": ["last", "great", "day", "feast", "Jesus", "cried", "thirst", "come", "drink"],
        "notes": "Pluperfect εἱστήκει. Third class condition ἐάν τις διψᾷ.",
        "fixedTranslation": 'On the last day, the great day of the feast, Jesus stood and cried out, saying, "If anyone thirsts, let him come to me and drink."',
    },
    "john-7-38": {
        "keyTerms": ["believes", "Scripture", "rivers", "living water", "flow"],
        "notes": "Quotation formula καθὼς εἶπεν ἡ γραφή. Future ῥεύσουσιν. κοιλία — 'innermost being.'",
        "fixedTranslation": '"The one who believes in me, as the Scripture has said, out of his heart will flow rivers of living water."',
    },
    "john-8-12": {
        "keyTerms": ["light", "world", "follows", "walk", "darkness", "life"],
        "notes": "Second 'I am' statement. Present participle ὁ ἀκολουθῶν. οὐ μή + subjunctive — emphatic negative.",
    },
    "john-8-31": {
        "keyTerms": ["remain", "word", "truly", "disciples", "truth", "free"],
        "notes": "Third class condition ἐάν + subjunctive μείνητε. Adverb ἀληθῶς — 'truly.'",
    },
    "john-8-34": {
        "keyTerms": ["truly", "everyone", "sins", "slave", "sin"],
        "notes": "Present participle ὁ ποιῶν — habitual action. Predicate nominative δοῦλός ἐστιν.",
        "fixedTranslation": 'Jesus answered them, "Truly, truly, I say to you, everyone who practices sin is a slave to sin."',
    },
    "john-8-36": {
        "keyTerms": ["Son", "free", "indeed"],
        "notes": "Third class condition ἐάν + subjunctive ἐλευθερώσῃ. Adverb ὄντως — 'really/indeed.'",
    },
    "john-10-9": {
        "keyTerms": ["door", "enters", "saved", "pasture"],
        "notes": "'I am' statement. Third class condition ἐάν τις εἰσέλθῃ. Three futures: σωθήσεται, εἰσελεύσεται, ἐξελεύσεται.",
    },
    "john-10-10": {
        "keyTerms": ["thief", "steal", "kill", "destroy", "came", "life", "abundantly"],
        "notes": "Purpose clauses with ἵνα + subjunctive. περισσόν — 'abundantly/to the full.'",
        "fixedTranslation": "The thief comes only to steal, kill, and destroy. I came that they may have life, and have it abundantly.",
    },
    "john-10-11": {
        "keyTerms": ["good", "shepherd", "lays down", "life", "sheep"],
        "notes": "'I am' statement. Present τίθησιν — 'lays down' voluntarily. ὑπέρ + genitive — on behalf of.",
    },
    "john-10-27": {
        "keyTerms": ["sheep", "voice", "hear", "know", "follow"],
        "notes": "Three present indicatives: ἀκούουσιν, γινώσκω, ἀκολουθοῦσιν — habitual actions.",
        "fixedTranslation": "My sheep hear my voice, and I know them, and they follow me.",
    },
    "john-10-28": {
        "keyTerms": ["give", "eternal life", "never", "perish", "snatch", "hand"],
        "notes": "οὐ μή + subjunctive — double emphatic negation. Future ἁρπάσει — 'snatch.'",
        "fixedTranslation": "And I give them eternal life, and they shall never perish, and no one shall snatch them out of my hand.",
    },
    "john-10-30": {
        "keyTerms": ["Father", "one"],
        "notes": "Neuter ἕν (not masculine εἷς) — unity of essence, not person. First person plural ἐσμεν.",
        "fixedTranslation": "I and the Father are one.",
    },
    "john-11-25": {
        "keyTerms": ["Jesus", "resurrection", "life", "believes", "dies", "live"],
        "notes": "'I am' statement with double predicate. Concessive κἄν — 'even if.' Third class condition.",
        "fixedTranslation": 'Jesus said to her, "I am the resurrection and the life. The one who believes in me, even though he dies, will live."',
    },
    "john-12-32": {
        "keyTerms": ["lifted up", "earth", "draw", "myself"],
        "notes": "Third class condition ἐάν + subjunctive ὑψωθῶ. Future ἑλκύσω — 'will draw.'",
        "fixedTranslation": "And I, if I am lifted up from the earth, will draw all people to myself.",
    },
    "john-12-46": {
        "keyTerms": ["light", "world", "come", "believes", "darkness", "remain"],
        "notes": "Perfect ἐλήλυθα — abiding presence. Purpose clause ἵνα + subjunctive μείνῃ.",
        "fixedTranslation": "I have come as a light into the world, so that everyone who believes in me should not remain in darkness.",
    },
    "john-13-34": {
        "keyTerms": ["new", "commandment", "love", "one another", "loved"],
        "notes": "Purpose clause ἵνα ἀγαπᾶτε. Comparative clause καθώς — 'just as I loved you.'",
        "fixedTranslation": "A new commandment I give to you, that you love one another, just as I have loved you, so also you are to love one another.",
    },
    "john-13-35": {
        "keyTerms": ["know", "all", "disciples", "love", "one another"],
        "notes": "Future γνώσονται. Third class condition ἐάν + subjunctive ἔχητε.",
        "fixedTranslation": "By this all will know that you are my disciples, if you have love for one another.",
    },
    "john-14-15": {
        "keyTerms": ["love", "commandments", "keep"],
        "notes": "Third class condition ἐάν + subjunctive ἀγαπᾶτε. Future indicative τηρήσετε.",
        "fixedTranslation": "If you love me, you will keep my commandments.",
    },
    "john-14-21": {
        "keyTerms": ["commandments", "keeps", "loves", "loved", "Father", "manifest"],
        "notes": "Substantival participles ὁ ἔχων, ὁ τηρῶν, ὁ ἀγαπῶν. Future ἐμφανίσω — 'I will reveal myself.'",
    },
    "john-14-23": {
        "keyTerms": ["loves", "word", "keep", "Father", "love", "come", "make", "home"],
        "notes": "Third class condition ἐάν τις ἀγαπᾷ. Future tenses: τηρήσει, ἀγαπήσει, ἐλευσόμεθα, ποιησόμεθα.",
        "fixedTranslation": 'Jesus answered and said to him, "If anyone loves me, he will keep my word, and my Father will love him, and we will come to him and make our home with him."',
    },
    "john-14-27": {
        "keyTerms": ["peace", "leave", "give", "world", "troubled", "afraid"],
        "notes": "Present active ἀφίημι, δίδωμι. Negative imperatives μὴ ταρασσέσθω, μηδὲ δειλιάτω.",
        "fixedTranslation": "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.",
    },
    "john-15-12": {
        "keyTerms": ["commandment", "love", "one another", "loved"],
        "notes": "Demonstrative αὕτη — 'this is my commandment.' Purpose clause ἵνα ἀγαπᾶτε.",
        "fixedTranslation": "This is my commandment, that you love one another as I have loved you.",
    },
    "john-15-13": {
        "keyTerms": ["greater", "love", "no one", "lay down", "life", "friends"],
        "notes": "Comparative μείζονα. Purpose clause ἵνα + subjunctive θῇ. ψυχή — life/soul.",
        "fixedTranslation": "Greater love has no one than this, that someone lay down his life for his friends.",
    },
    "john-16-33": {
        "keyTerms": ["peace", "world", "tribulation", "cheer", "overcome"],
        "notes": "Perfect λελάληκα — lasting significance. Perfect νενίκηκα — permanent victory. Imperative θαρσεῖτε.",
    },
    "john-17-3": {
        "keyTerms": ["eternal life", "know", "only", "true", "God", "sent", "Jesus Christ"],
        "notes": "Present subjunctive γινώσκωσιν — experiential knowing. ἀληθινόν — 'genuine.'",
        "fixedTranslation": "And this is eternal life, that they may know you, the only true God, and Jesus Christ whom you have sent.",
    },
    "john-17-17": {
        "keyTerms": ["sanctify", "truth", "word"],
        "notes": "Aorist imperative ἁγίασον. Predicate nominative ἀλήθειά ἐστιν — 'Your word is truth.'",
        "fixedTranslation": "Sanctify them in the truth; your word is truth.",
    },
    "john-20-29": {
        "keyTerms": ["seen", "believed", "blessed", "not seen", "believed"],
        "notes": "Perfect ἑώρακας, πεπίστευκας. Substantival participles οἱ μὴ ἰδόντες, πιστεύσαντες.",
        "fixedTranslation": 'Jesus said to him, "Because you have seen me, you have believed. Blessed are those who have not seen and yet have believed."',
    },
    "john-20-31": {
        "keyTerms": ["written", "believe", "Jesus", "Christ", "Son", "God", "life", "name"],
        "notes": "Perfect γέγραπται. Purpose clause ἵνα πιστεύσητε — either aorist (come to believe) or present (continue believing).",
    },
    "john-21-17": {
        "keyTerms": ["third", "Simon", "love", "affection", "grieved", "know", "sheep"],
        "notes": "Distinction between ἀγαπᾷς (first two) and φιλεῖς (third). Aorist passive ἐλυπήθη.",
    },

    # ---- ACTS ----
    "acts-2-42": {
        "keyTerms": ["continued", "apostles", "teaching", "fellowship", "breaking", "bread", "prayers"],
        "notes": "Periphrastic imperfect ἦσαν προσκαρτεροῦντες — continuous devotion. Four datives.",
    },
    "acts-4-12": {
        "keyTerms": ["salvation", "no other", "name", "heaven", "given", "saved"],
        "notes": "Emphatic negation οὐκ...οὐδενί...οὐδέ. Perfect passive participle δεδομένον.",
        "fixedTranslation": "And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved.",
    },
    "acts-16-31": {
        "keyTerms": ["believe", "Lord", "Jesus", "saved", "household"],
        "notes": "Aorist imperative πίστευσον. Future passive σωθήσῃ. σύ and ὁ οἶκός σου — you and your household.",
        "fixedTranslation": 'And they said, "Believe on the Lord Jesus, and you will be saved, you and your household."',
    },
    "acts-17-28": {
        "keyTerms": ["live", "move", "exist", "poets", "offspring"],
        "notes": "Quotation from Epimenides/Aratus. Present indicatives ζῶμεν, κινούμεθα, ἐσμέν.",
        "fixedTranslation": "For in him we live and move and have our being, as also some of your own poets have said, 'For we are indeed his offspring.'",
    },
    "acts-20-35": {
        "keyTerms": ["example", "laboring", "help", "weak", "remember", "blessed", "give", "receive"],
        "notes": "Aorist ὑπέδειξα. Present participles κοπιῶντας, ἀσθενούντων. Comparative μακάριόν.",
    },

    # ---- ROMANS ----
    "rom-1-17": {
        "keyTerms": ["righteousness", "God", "revealed", "faith", "written", "righteous", "live"],
        "notes": "ἐκ πίστεως εἰς πίστιν — 'from faith to faith.' Habakkuk 2:4 quotation.",
    },
    "rom-5-1": {
        "keyTerms": ["justified", "faith", "peace", "God", "Lord", "Jesus Christ"],
        "notes": "Aorist passive participle δικαιωθέντες. Present ἔχομεν (indicative) vs. ἔχωμεν (subjunctive) — textual variant.",
    },
    "rom-8-18": {
        "keyTerms": ["reckon", "sufferings", "present", "glory", "revealed"],
        "notes": "Present middle λογίζομαι. Articular infinitive τὴν μέλλουσαν...ἀποκαλυφθῆναι.",
        "fixedTranslation": "For I consider that the sufferings of the present time are not worthy to be compared with the glory that is to be revealed to us.",
    },
    "rom-8-26": {
        "keyTerms": ["Spirit", "helps", "weakness", "pray", "intercedes", "groanings"],
        "notes": "Compound verb συναντιλαμβάνεται — 'helps alongside.' ἀλάλητοι — 'wordless/inexpressible.'",
    },
    "rom-8-31": {
        "keyTerms": ["God", "for us", "against us"],
        "notes": "Deliberative future ἐροῦμεν. First class condition εἰ + indicative — assumed true.",
    },
    "rom-8-37": {
        "keyTerms": ["more than conquerors", "through", "loved"],
        "notes": "Compound ὑπερνικῶμεν — 'we super-conquer.' Aorist participle τοῦ ἀγαπήσαντος.",
        "fixedTranslation": "But in all these things we more than conquer through him who loved us.",
    },
    "rom-8-38": {
        "keyTerms": ["persuaded", "death", "life", "angels", "principalities", "present", "future", "powers"],
        "notes": "Perfect passive πέπεισμαι — settled conviction. Catalogue of cosmic powers.",
        "fixedTranslation": "For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,",
    },
    "rom-8-39": {
        "keyTerms": ["height", "depth", "created", "separate", "love", "God", "Christ Jesus", "Lord"],
        "notes": "Future δυνήσεται. Aorist infinitive χωρίσαι — 'to separate.' Climax of chapter 8.",
    },
    "rom-10-9": {
        "keyTerms": ["confess", "mouth", "Lord", "Jesus", "believe", "heart", "God", "raised", "dead", "saved"],
        "notes": "Third class condition ἐάν + subjunctive. Aorist ἤγειρεν — God raised Christ.",
        "fixedTranslation": "That if you confess with your mouth that Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved.",
    },
    "rom-10-10": {
        "keyTerms": ["heart", "believes", "righteousness", "mouth", "confesses", "salvation"],
        "notes": "Impersonal passives πιστεύεται, ὁμολογεῖται. Parallel structure: heart→righteousness, mouth→salvation.",
        "fixedTranslation": "For with the heart one believes unto righteousness, and with the mouth one confesses unto salvation.",
    },
    "rom-10-17": {
        "keyTerms": ["faith", "hearing", "word", "Christ"],
        "notes": "ἄρα — inferential particle. ἐξ ἀκοῆς — faith comes 'from hearing.' Genitive Χριστοῦ — objective or subjective.",
    },
    "rom-11-33": {
        "keyTerms": ["depth", "riches", "wisdom", "knowledge", "God", "unsearchable", "judgments", "ways"],
        "notes": "Exclamatory Ὦ. Three genitives: πλούτου, σοφίας, γνώσεως. Alpha-privative ἀνεξεραύνητα.",
    },
    "rom-12-2": {
        "keyTerms": ["conformed", "transformed", "renewing", "mind", "prove", "will", "God"],
        "notes": "Present passive imperatives: μὴ συσχηματίζεσθε, μεταμορφοῦσθε. Articular infinitive τὸ δοκιμάζειν.",
        "fixedTranslation": "And do not be conformed to this age, but be transformed by the renewing of your mind, so that you may prove what is the good, acceptable, and perfect will of God.",
    },
    "rom-12-9": {
        "keyTerms": ["love", "genuine", "abhor", "evil", "cling", "good"],
        "notes": "Asyndeton — no connecting particles. ἀνυπόκριτος — 'without hypocrisy.' Substantival participles.",
    },
    "rom-12-10": {
        "keyTerms": ["brotherly love", "devoted", "honor", "esteem"],
        "notes": "Dative of sphere τῇ φιλαδελφίᾳ, τῇ τιμῇ. Present participle προηγούμενοι — 'outdoing one another.'",
        "fixedTranslation": "In brotherly love, be devoted to one another; in honor, outdo one another.",
    },
    "rom-12-12": {
        "keyTerms": ["hope", "rejoicing", "tribulation", "patient", "prayer", "constant"],
        "notes": "Three dative-participle pairs in parallel: ἐλπίδι/χαίροντες, θλίψει/ὑπομένοντες, προσευχῇ/προσκαρτεροῦντες.",
        "fixedTranslation": "Rejoicing in hope, patient in tribulation, constant in prayer.",
    },
    "rom-12-21": {
        "keyTerms": ["overcome", "evil", "good"],
        "notes": "Present passive imperative νικῶ. Present active imperative νίκα. Chiastic structure.",
        "fixedTranslation": "Do not be overcome by evil, but overcome evil with good.",
    },
    "rom-13-8": {
        "keyTerms": ["owe", "nothing", "love", "one another", "law", "fulfilled"],
        "notes": "Present imperative ὀφείλετε. εἰ μή — 'except.' Perfect πεπλήρωκεν — fully fulfilled.",
        "fixedTranslation": "Owe nothing to anyone, except to love one another; for the one who loves the other has fulfilled the law.",
    },
    "rom-15-13": {
        "keyTerms": ["God", "hope", "fill", "joy", "peace", "believing", "abound", "power", "Holy Spirit"],
        "notes": "Optative πληρώσαι — prayer wish. εἰς τὸ περισσεύειν — purpose/result infinitive.",
    },

    # ---- 1 CORINTHIANS ----
    "1cor-1-18": {
        "keyTerms": ["word", "cross", "foolishness", "perishing", "saved", "power", "God"],
        "notes": "Substantival participles τοῖς ἀπολλυμένοις, τοῖς σῳζομένοις. Present tenses — ongoing process.",
    },
    "1cor-2-9": {
        "keyTerms": ["eye", "seen", "ear", "heard", "heart", "man", "prepared", "love", "God"],
        "notes": "Isaiah 64:4 allusion. Aorist εἶδεν, ἤκουσεν. Perfect ἡτοίμασεν in some mss.",
        "fixedTranslation": 'But as it is written, "What no eye has seen, nor ear heard, nor the heart of man imagined, what God has prepared for those who love him."',
    },
    "1cor-6-19": {
        "keyTerms": ["body", "temple", "Holy Spirit", "God", "own"],
        "notes": "Predicate nominative ναός. Genitive source ἀπὸ θεοῦ. Rhetorical question ἢ οὐκ οἴδατε.",
        "fixedTranslation": "Or do you not know that your body is a temple of the Holy Spirit within you, whom you have from God? You are not your own.",
    },
    "1cor-6-20": {
        "keyTerms": ["bought", "price", "glorify", "God", "body"],
        "notes": "Aorist passive ἠγοράσθητε — purchased. Genitive of price τιμῆς. Aorist imperative δοξάσατε.",
        "fixedTranslation": "For you were bought with a price. Therefore glorify God in your body.",
    },
    "1cor-10-13": {
        "keyTerms": ["temptation", "human", "faithful", "God", "endure", "way", "escape"],
        "notes": "Perfect εἴληφεν. εἰ μή — 'except.' Relative clause ὅς + future. Articular infinitive τὸ δύνασθαι.",
        "fixedTranslation": "No temptation has seized you except what is common to man. And God is faithful; he will not let you be tempted beyond what you can bear, but with the temptation will also provide the way of escape, so that you may be able to endure it.",
    },
    "1cor-10-31": {
        "keyTerms": ["eat", "drink", "whatever", "do", "glory", "God"],
        "notes": "Conditional particles εἴτε...εἴτε...εἴτε — 'whether...or.' Present imperative ποιεῖτε.",
        "fixedTranslation": "Whether therefore you eat or drink, or whatever you do, do all things to the glory of God.",
    },
    "1cor-12-27": {
        "keyTerms": ["body", "Christ", "members", "individually"],
        "notes": "Predicate nominative σῶμα Χριστοῦ. ἐκ μέρους — 'individually/each in part.'",
    },
    "1cor-13-1": {
        "keyTerms": ["tongues", "men", "angels", "love", "sounding brass", "clanging cymbal"],
        "notes": "Third class condition ἐάν + subjunctive λαλῶ. Perfect γέγονα — 'I have become.'",
        "fixedTranslation": "If I speak in the tongues of men and of angels, but have not love, I have become sounding brass or a clanging cymbal.",
    },
    "1cor-13-7": {
        "keyTerms": ["bears", "believes", "hopes", "endures"],
        "notes": "Four πάντα clauses — anaphoric repetition. Present indicatives — continuous action.",
        "fixedTranslation": "Love bears all things, believes all things, hopes all things, endures all things.",
    },
    "1cor-13-8": {
        "keyTerms": ["love", "never", "fails", "prophecies", "tongues", "cease", "knowledge", "pass away"],
        "notes": "Present πίπτει — love never falls. Future passives καταργηθήσονται, παύσονται.",
        "fixedTranslation": "Love never fails. But if there are prophecies, they will be done away with; if there are tongues, they will cease; if there is knowledge, it will be done away with.",
    },
    "1cor-13-13": {
        "keyTerms": ["faith", "hope", "love", "abide", "three", "greatest"],
        "notes": "Present μένει. Comparative μείζων — 'greater/greatest.' τὰ τρία ταῦτα — 'these three things.'",
        "fixedTranslation": "But now abide faith, hope, and love, these three; but the greatest of these is love.",
    },
    "1cor-15-4": {
        "keyTerms": ["buried", "raised", "third day", "Scriptures"],
        "notes": "Aorist passive ἐτάφη. Perfect passive ἐγήγερται — raised and remaining alive. κατὰ τὰς γραφάς.",
    },
    "1cor-15-10": {
        "keyTerms": ["grace", "God", "am", "futile", "worked", "harder"],
        "notes": "Repeated χάρις (3x). Comparative περισσότερον — 'more abundantly.' οὐκ ἐγώ but ἡ χάρις.",
    },
    "1cor-15-55": {
        "keyTerms": ["death", "victory", "sting"],
        "notes": "Rhetorical taunt from Hosea 13:14. Vocative θάνατε. ποῦ — 'where?'",
        "fixedTranslation": '"Where, O death, is your victory? Where, O death, is your sting?"',
    },
    "1cor-15-57": {
        "keyTerms": ["thanks", "God", "gives", "victory", "Lord", "Jesus Christ"],
        "notes": "Present participle τῷ διδόντι — God who keeps giving victory. διά + genitive — through Christ.",
    },
    "1cor-16-13": {
        "keyTerms": ["watch", "stand firm", "faith", "act like men", "strong"],
        "notes": "Four asyndetic imperatives: γρηγορεῖτε, στήκετε, ἀνδρίζεσθε, κραταιοῦσθε.",
        "fixedTranslation": "Be watchful, stand firm in the faith, act like men, be strong.",
    },

    # ---- 2 CORINTHIANS ----
    "2cor-4-18": {
        "keyTerms": ["look", "seen", "unseen", "temporary", "eternal"],
        "notes": "Genitive absolute σκοπούντων ἡμῶν. Contrast: βλεπόμενα (visible) vs. μὴ βλεπόμενα (invisible), πρόσκαιρα vs. αἰώνια.",
    },
    "2cor-5-7": {
        "keyTerms": ["faith", "walk", "sight"],
        "notes": "Genitive of means/sphere: διὰ πίστεως, διὰ εἴδους. Present περιπατοῦμεν — continuous walk.",
        "fixedTranslation": "For we walk by faith, not by sight.",
    },
    "2cor-5-21": {
        "keyTerms": ["knew", "sin", "made", "sin", "righteousness", "God"],
        "notes": "Aorist participle γνόντα. Aorist ἐποίησεν. Purpose clause ἵνα γενώμεθα — great exchange.",
        "fixedTranslation": "He made him who knew no sin to be sin on our behalf, so that we might become the righteousness of God in him.",
    },
    "2cor-9-7": {
        "keyTerms": ["purposes", "heart", "regret", "necessity", "cheerful", "giver", "loves", "God"],
        "notes": "Perfect middle προῄρηται. Proverbs 22:8 LXX allusion. ἱλαρόν — 'cheerful/hilarious.'",
        "fixedTranslation": "Each one as he purposes in his heart, not out of regret or of necessity, for God loves a cheerful giver.",
    },
    "2cor-12-9": {
        "keyTerms": ["grace", "sufficient", "power", "weakness", "perfected", "gladly", "boast"],
        "notes": "Perfect εἴρηκεν — permanent word from the Lord. Present passive τελεῖται — power perfected in weakness.",
        "fixedTranslation": 'And he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast most gladly in my weaknesses, so that the power of Christ may rest upon me.',
    },
    "2cor-12-10": {
        "keyTerms": ["pleasure", "weaknesses", "insults", "hardships", "persecutions", "difficulties", "Christ", "weak", "strong"],
        "notes": "Catalogue of sufferings. Paradox: ὅταν ἀσθενῶ, τότε δυνατός εἰμι.",
    },

    # ---- GALATIANS ----
    "gal-3-28": {
        "keyTerms": ["Jew", "Greek", "slave", "free", "male", "female", "one", "Christ Jesus"],
        "notes": "Three pairs negated with οὐκ ἔνι. πάντες γὰρ ὑμεῖς εἷς ἐστε — 'you are all one.'",
    },
    "gal-5-23": {
        "keyTerms": ["gentleness", "self-control", "law"],
        "notes": "Final two fruit of the Spirit. κατὰ τῶν τοιούτων — 'against such things.' Litotes.",
        "fixedTranslation": "gentleness, self-control; against such things there is no law.",
    },
    "gal-6-9": {
        "keyTerms": ["well-doing", "grow weary", "due time", "reap", "harvest", "give up"],
        "notes": "Hortatory subjunctive μὴ ἐγκακῶμεν. Future θερίσομεν — promise. Present participle ἐκλυόμενοι.",
        "fixedTranslation": "And let us not grow weary of doing good, for in due time we will reap a harvest, if we do not give up.",
    },

    # ---- EPHESIANS ----
    "eph-2-9": {
        "keyTerms": ["works", "no one", "boast"],
        "notes": "Purpose clause ἵνα μή + subjunctive. Continuation of 2:8 — salvation not from works.",
    },
    "eph-2-10": {
        "keyTerms": ["workmanship", "created", "Christ Jesus", "good works", "prepared", "walk"],
        "notes": "ποίημα — 'masterpiece/workmanship.' Aorist passive participle κτισθέντες. Relative clause οἷς προητοίμασεν.",
        "fixedTranslation": "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand that we should walk in them.",
    },
    "eph-3-20": {
        "keyTerms": ["able", "exceedingly", "abundantly", "ask", "think", "power", "works"],
        "notes": "Compound adverb ὑπερεκπερισσοῦ — 'far beyond all measure.' Dative of reference κατὰ τὴν δύναμιν.",
    },
    "eph-5-25": {
        "keyTerms": ["husbands", "love", "wives", "Christ", "loved", "church", "gave", "himself"],
        "notes": "Present imperative ἀγαπᾶτε — continuous love. Aorist ἠγάπησεν, παρέδωκεν — Christ's completed sacrifice.",
        "fixedTranslation": "Husbands, love your wives, just as Christ also loved the church and gave himself up for her,",
    },
    "eph-6-10": {
        "keyTerms": ["strong", "Lord", "strength", "might"],
        "notes": "Present passive imperative ἐνδυναμοῦσθε — 'keep being empowered.' Three synonyms: κράτος, ἰσχύς.",
        "fixedTranslation": "Finally, be strong in the Lord and in the strength of his might.",
    },
    "eph-6-11": {
        "keyTerms": ["put on", "full armor", "God", "stand", "schemes", "devil"],
        "notes": "Aorist imperative ἐνδύσασθε. πανοπλία — 'full armor/panoply.' Purpose infinitive τὸ δύνασθαι στῆναι.",
        "fixedTranslation": "Put on the whole armor of God, that you may be able to stand against the schemes of the devil.",
    },
    "eph-6-12": {
        "keyTerms": ["wrestling", "flesh", "blood", "rulers", "authorities", "powers", "darkness", "spiritual", "wickedness"],
        "notes": "Negative οὐκ...ἀλλά structure. Four πρός phrases listing spiritual enemies.",
        "fixedTranslation": "For our wrestling is not against flesh and blood, but against the rulers, against the authorities, against the cosmic powers of this darkness, against spiritual forces of wickedness in the heavenly places.",
    },

    # ---- PHILIPPIANS ----
    "phil-1-6": {
        "keyTerms": ["confident", "begun", "good work", "complete", "day", "Christ Jesus"],
        "notes": "Perfect participle πεποιθώς. Aorist participle ἐναρξάμενος. Future ἐπιτελέσει.",
        "fixedTranslation": "Being confident of this very thing, that he who began a good work in you will bring it to completion until the day of Christ Jesus.",
    },
    "phil-1-21": {
        "keyTerms": ["live", "Christ", "die", "gain"],
        "notes": "Articular infinitives τὸ ζῆν, τὸ ἀποθανεῖν as subjects. Predicate nominatives Χριστός, κέρδος.",
    },
    "phil-2-8": {
        "keyTerms": ["humbled", "himself", "obedient", "death", "cross"],
        "notes": "Aorist ἐταπείνωσεν. Present participle γενόμενος. Emphatic θανάτου δὲ σταυροῦ — 'even death on a cross.'",
    },
    "phil-2-9": {
        "keyTerms": ["therefore", "God", "highly exalted", "gave", "name", "above", "every", "name"],
        "notes": "Compound verb ὑπερύψωσεν — 'super-exalted.' Aorist ἐχαρίσατο — 'graciously granted.'",
    },
    "phil-2-10": {
        "keyTerms": ["name", "Jesus", "every", "knee", "bow", "heaven", "earth", "under earth"],
        "notes": "Purpose clause ἵνα + subjunctive κάμψῃ. Isaiah 45:23 allusion. Three spheres: ἐπουρανίων, ἐπιγείων, καταχθονίων.",
    },
    "phil-2-11": {
        "keyTerms": ["tongue", "confess", "Jesus Christ", "Lord", "glory", "God", "Father"],
        "notes": "Subjunctive ἐξομολογήσηται. Climactic confession: κύριος Ἰησοῦς Χριστός.",
    },
    "phil-3-13": {
        "keyTerms": ["brothers", "regard", "taken hold", "forgetting", "behind", "reaching forward"],
        "notes": "Present middle λογίζομαι. Contrast: ὀπίσω ἐπιλανθανόμενος vs. ἔμπροσθεν ἐπεκτεινόμενος.",
    },
    "phil-3-14": {
        "keyTerms": ["press on", "goal", "prize", "upward", "calling", "God", "Christ Jesus"],
        "notes": "κατὰ σκοπόν — 'toward the mark/goal.' Athletic metaphor. Genitive τῆς ἄνω κλήσεως.",
    },
    "phil-4-4": {
        "keyTerms": ["rejoice", "Lord", "always"],
        "notes": "Present imperative χαίρετε repeated. πάντοτε — 'at all times.' Emphatic repetition.",
    },
    "phil-4-6": {
        "keyTerms": ["anxious", "nothing", "prayer", "petition", "thanksgiving", "requests", "known", "God"],
        "notes": "Present imperative μηδὲν μεριμνᾶτε. Three prayer terms: προσευχῇ, δεήσει, εὐχαριστίας.",
    },
    "phil-4-7": {
        "keyTerms": ["peace", "God", "surpasses", "understanding", "guard", "hearts", "minds", "Christ Jesus"],
        "notes": "Future φρουρήσει — military metaphor 'will garrison.' Comparative ὑπερέχουσα.",
    },
    "phil-4-8": {
        "keyTerms": ["true", "honorable", "right", "pure", "lovely", "admirable", "excellent", "praiseworthy", "think"],
        "notes": "Six ὅσα clauses. Present imperative λογίζεσθε — 'keep thinking about.' Virtue catalogue.",
    },
    "phil-4-19": {
        "keyTerms": ["God", "supply", "every", "need", "riches", "glory", "Christ Jesus"],
        "notes": "Future πληρώσει. κατὰ τὸ πλοῦτος — 'according to his riches' (not 'out of').",
    },

    # ---- COLOSSIANS ----
    "col-1-16": {
        "keyTerms": ["created", "all things", "heavens", "earth", "visible", "invisible", "thrones", "dominions", "rulers", "authorities"],
        "notes": "Aorist passive ἐκτίσθη. ἐν αὐτῷ — instrumental/locative. Four categories of powers.",
    },
    "col-1-17": {
        "keyTerms": ["before", "all things", "hold together"],
        "notes": "Present ἐστιν — eternal existence. Perfect συνέστηκεν — all things hold together (and continue to).",
    },
    "col-2-9": {
        "keyTerms": ["fullness", "deity", "dwells", "bodily"],
        "notes": "Present κατοικεῖ — permanently dwells. θεότης (deity/Godhead) vs. θειότης (divinity).",
    },
    "col-3-1": {
        "keyTerms": ["raised", "Christ", "things above", "seek", "right hand", "God"],
        "notes": "First class condition εἰ + indicative. Aorist passive συνηγέρθητε. Present imperative ζητεῖτε.",
    },
    "col-3-2": {
        "keyTerms": ["minds", "things above", "earth"],
        "notes": "Present imperative φρονεῖτε — 'keep setting your mind on.' Contrast: τὰ ἄνω vs. τὰ ἐπὶ τῆς γῆς.",
        "fixedTranslation": "Set your minds on the things above, not on the things on the earth.",
    },
    "col-3-12": {
        "keyTerms": ["put on", "chosen", "God", "holy", "beloved", "compassion", "kindness", "humility", "gentleness", "patience"],
        "notes": "Aorist imperative ἐνδύσασθε — 'clothe yourselves.' Five virtues as garments.",
    },
    "col-3-13": {
        "keyTerms": ["bearing", "forgiving", "each other", "complaint", "Lord", "forgave"],
        "notes": "Present participles ἀνεχόμενοι, χαριζόμενοι. καθώς — 'just as the Lord forgave.'",
        "fixedTranslation": "bearing with one another and forgiving each other; if anyone has a complaint against another, just as the Lord forgave you, so also should you.",
    },
    "col-3-17": {
        "keyTerms": ["whatever", "do", "word", "deed", "name", "Lord Jesus", "giving thanks", "God", "Father"],
        "notes": "Indefinite relative ὅ τι ἐάν + subjunctive. Present participle εὐχαριστοῦντες.",
    },
    "col-3-23": {
        "keyTerms": ["whatever", "do", "heartily", "Lord", "men"],
        "notes": "ἐκ ψυχῆς — 'from the soul/heartily.' Present imperative ἐργάζεσθε. ὡς τῷ κυρίῳ — 'as unto the Lord.'",
        "fixedTranslation": "Whatever you do, work at it with all your heart, as working for the Lord and not for men,",
    },

    # ---- 1 THESSALONIANS ----
    "1thess-4-3": {
        "keyTerms": ["will", "God", "sanctification", "abstain", "sexual immorality"],
        "notes": "Predicate nominative ὁ ἁγιασμός. Epexegetical infinitive ἀπέχεσθαι explains sanctification.",
        "fixedTranslation": "For this is the will of God, your sanctification: that you abstain from sexual immorality;",
    },
    "1thess-5-17": {
        "keyTerms": ["pray", "unceasingly"],
        "notes": "Shortest verse in Greek NT. Present imperative προσεύχεσθε — continuous prayer. Adverb ἀδιαλείπτως.",
        "fixedTranslation": "Pray unceasingly.",
    },
    "1thess-5-18": {
        "keyTerms": ["everything", "give thanks", "will", "God", "Christ Jesus"],
        "notes": "Present imperative εὐχαριστεῖτε. ἐν παντί — 'in every circumstance.'",
    },

    # ---- 2 THESSALONIANS ----
    "2thess-3-3": {
        "keyTerms": ["Lord", "faithful", "establish", "guard", "evil one"],
        "notes": "Predicate adjective πιστός. Future verbs στηρίξει, φυλάξει — promises.",
    },

    # ---- 1 TIMOTHY ----
    "1tim-2-5": {
        "keyTerms": ["one", "God", "mediator", "God", "men", "man", "Christ Jesus"],
        "notes": "Emphatic εἷς repeated. μεσίτης — 'mediator/go-between.' ἄνθρωπος — humanity of Christ.",
        "fixedTranslation": "For there is one God and one mediator between God and men, the man Christ Jesus,",
    },
    "1tim-4-12": {
        "keyTerms": ["no one", "youth", "despise", "example", "believers", "speech", "conduct", "love", "faith", "purity"],
        "notes": "Present imperative καταφρονείτω with μηδείς. Present imperative γίνου. Five spheres: λόγῳ, ἀναστροφῇ, ἀγάπῃ, πίστει, ἁγνείᾳ.",
        "fixedTranslation": "Let no one despise your youth, but be an example to the believers in speech, in conduct, in love, in faith, and in purity.",
    },
    "1tim-6-6": {
        "keyTerms": ["godliness", "contentment", "great", "gain"],
        "notes": "Predicate nominative πορισμὸς μέγας. εὐσέβεια μετὰ αὐταρκείας — godliness combined with contentment.",
        "fixedTranslation": "But godliness with contentment is great gain.",
    },
    "1tim-6-10": {
        "keyTerms": ["root", "evils", "love of money", "wandered", "faith", "pierced", "sorrows"],
        "notes": "Predicate nominative ῥίζα πάντων τῶν κακῶν. φιλαργυρία — 'love of silver/money.'",
        "fixedTranslation": "For the love of money is a root of all kinds of evils, which some, reaching after, have been led astray from the faith and have pierced themselves with many sorrows.",
    },

    # ---- 2 TIMOTHY ----
    "2tim-1-7": {
        "keyTerms": ["God", "gave", "spirit", "cowardice", "power", "love", "self-control"],
        "notes": "Aorist ἔδωκεν. Three positive genitives: δυνάμεως, ἀγάπης, σωφρονισμοῦ vs. one negative: δειλίας.",
        "fixedTranslation": "For God has not given us a spirit of cowardice, but of power, love, and self-control.",
    },
    "2tim-2-15": {
        "keyTerms": ["diligent", "approved", "present", "God", "workman", "not ashamed", "rightly dividing", "word", "truth"],
        "notes": "Aorist imperative σπούδασον. ὀρθοτομοῦντα — 'cutting straight/rightly handling.'",
        "fixedTranslation": "Be diligent to present yourself approved to God, a workman not ashamed, rightly handling the word of truth.",
    },
    "2tim-3-17": {
        "keyTerms": ["complete", "man of God", "every", "good work", "equipped"],
        "notes": "Purpose clause ἵνα + subjunctive ᾖ. ἄρτιος — 'complete/capable.' Perfect passive ἐξηρτισμένος.",
        "fixedTranslation": "so that the man of God may be complete, equipped for every good work.",
    },
    "2tim-4-7": {
        "keyTerms": ["good", "fight", "fought", "race", "finished", "faith", "kept"],
        "notes": "Three perfect verbs: ἠγώνισμαι, τετέλεκα, τετήρηκα — completed with lasting result. Athletic metaphor.",
        "fixedTranslation": "I have fought the good fight, I have finished the race, I have kept the faith.",
    },

    # ---- TITUS ----
    "titus-2-11": {
        "keyTerms": ["grace", "God", "appeared", "salvation", "all", "men"],
        "notes": "Aorist passive ἐπεφάνη — the grace of God appeared. σωτήριος — 'bringing salvation.'",
        "fixedTranslation": "For the grace of God has appeared, bringing salvation to all men,",
    },
    "titus-3-5": {
        "keyTerms": ["works", "righteousness", "mercy", "saved", "washing", "regeneration", "renewal", "Holy Spirit"],
        "notes": "Aorist ἔσωσεν. Two genitives: παλιγγενεσίας (regeneration), ἀνακαινώσεως (renewal). Not by works but by mercy.",
    },

    # ---- HEBREWS ----
    "heb-4-12": {
        "keyTerms": ["word", "God", "living", "active", "sharper", "sword", "two-edged", "piercing", "soul", "spirit", "joints", "marrow", "thoughts", "intentions", "heart"],
        "notes": "Predicate adjectives ζῶν, ἐνεργής. Comparative τομώτερος. Four penetration terms.",
    },
    "heb-4-16": {
        "keyTerms": ["boldness", "throne", "grace", "mercy", "grace", "help", "time", "need"],
        "notes": "Hortatory subjunctive προσερχώμεθα. Purpose clause ἵνα λάβωμεν...εὕρωμεν.",
        "fixedTranslation": "Let us therefore draw near with boldness to the throne of grace, that we may receive mercy and find grace to help in time of need.",
    },
    "heb-10-25": {
        "keyTerms": ["forsaking", "assembling", "encouraging", "one another", "day", "approaching"],
        "notes": "Present participle ἐγκαταλείποντες with μή — prohibition. Present participle παρακαλοῦντες — ongoing encouragement.",
    },
    "heb-11-6": {
        "keyTerms": ["faith", "impossible", "please", "God", "believe", "exists", "rewards", "seek"],
        "notes": "Aorist infinitive εὐαρεστῆσαι. Two ὅτι clauses: God exists and rewards seekers.",
    },
    "heb-13-5": {
        "keyTerms": ["covetousness", "content", "present", "never", "leave", "forsake"],
        "notes": "ἀφιλάργυρος — 'free from love of money.' Double negative οὐ μή...οὐδ᾽ οὐ μή — emphatic promise.",
        "fixedTranslation": 'Let your way of life be free from the love of money, being content with what you have; for he himself has said, "I will never leave you, nor will I ever forsake you."',
    },
    "heb-13-8": {
        "keyTerms": ["Jesus Christ", "yesterday", "today", "same", "forever"],
        "notes": "Predicate adjective ὁ αὐτός — 'the same.' Three temporal markers: ἐχθές, σήμερον, εἰς τοὺς αἰῶνας.",
        "fixedTranslation": "Jesus Christ is the same yesterday, today, and forever.",
    },

    # ---- JAMES ----
    "jas-1-5": {
        "keyTerms": ["lacks", "wisdom", "ask", "God", "gives", "liberally", "reproach"],
        "notes": "First class condition εἰ + indicative. Present imperative αἰτείτω. ἁπλῶς — 'generously/without reserve.'",
    },
    "jas-1-17": {
        "keyTerms": ["giving", "good", "gift", "perfect", "above", "Father", "lights", "shadow", "turning"],
        "notes": "Predicate adjective ἄνωθέν ἐστιν. 'Father of lights' — Creator of heavenly bodies. παραλλαγή, τροπῆς ἀποσκίασμα — astronomical metaphors.",
        "fixedTranslation": "Every good act of giving and every perfect gift is from above, coming down from the Father of lights, with whom there is no variation or shadow due to change.",
    },
    "jas-2-17": {
        "keyTerms": ["faith", "works", "dead", "itself"],
        "notes": "Third class condition ἐάν μή. Predicate adjective νεκρά. καθ᾽ ἑαυτήν — 'by itself.'",
        "fixedTranslation": "So also faith, if it does not have works, is dead by itself.",
    },
    "jas-4-7": {
        "keyTerms": ["submit", "God", "resist", "devil", "flee"],
        "notes": "Aorist passive imperative ὑποτάγητε. Aorist imperative ἀντίστητε. Future φεύξεται — promise.",
    },
    "jas-5-16": {
        "keyTerms": ["confess", "sins", "one another", "pray", "healed", "effective", "prayer", "righteous"],
        "notes": "Present imperative ἐξομολογεῖσθε. Present imperative εὔχεσθε. Purpose clause ὅπως ἰαθῆτε.",
        "fixedTranslation": "Therefore confess your sins to one another, and pray for one another, so that you may be healed. The effective prayer of a righteous person avails much.",
    },

    # ---- 1 PETER ----
    "1pet-2-24": {
        "keyTerms": ["bore", "sins", "body", "tree", "died", "sins", "live", "righteousness", "wounds", "healed"],
        "notes": "Aorist ἀνήνεγκεν — 'carried up.' ξύλον — 'tree/wood' (= cross). Isaiah 53 allusion.",
    },
    "1pet-3-15": {
        "keyTerms": ["sanctify", "Lord", "Christ", "hearts", "ready", "answer", "everyone", "asks", "reason", "hope"],
        "notes": "Aorist imperative ἁγιάσατε. ἀπολογία — 'defense/answer.' Dative of advantage παντί.",
    },
    "1pet-4-8": {
        "keyTerms": ["above all", "love", "fervent", "covers", "multitude", "sins"],
        "notes": "Adjective ἐκτενῆ — 'stretched out/fervent.' Proverbs 10:12 allusion. Present καλύπτει.",
        "fixedTranslation": "Above all, keep your love for one another fervent, because love covers a multitude of sins.",
    },
    "1pet-5-8": {
        "keyTerms": ["sober", "watchful", "adversary", "devil", "roaring", "lion", "seeking", "devour"],
        "notes": "Aorist imperatives νήψατε, γρηγορήσατε. Present participles ὠρυόμενος, ζητῶν. ἀντίδικος — legal adversary.",
    },

    # ---- 2 PETER ----
    "2pet-1-21": {
        "keyTerms": ["will", "man", "prophecy", "brought", "Holy Spirit", "carried", "spoke", "God"],
        "notes": "Aorist passive ἠνέχθη. Present passive participle φερόμενοι — 'being carried along' by the Spirit.",
        "fixedTranslation": "For no prophecy was ever brought by the will of man, but men spoke from God, being carried along by the Holy Spirit.",
    },
    "2pet-3-9": {
        "keyTerms": ["Lord", "delay", "promise", "patient", "perish", "repentance"],
        "notes": "Present βραδύνει. Present μακροθυμεῖ — 'is patient.' Purpose βουλόμενος — 'desiring all to come to repentance.'",
        "fixedTranslation": "The Lord is not slow concerning his promise, as some consider slowness, but is patient toward you, not desiring any to perish, but for all to come to repentance.",
    },

    # ---- 1 JOHN ----
    "1john-2-1": {
        "keyTerms": ["little children", "write", "sin", "Counselor", "Father", "Jesus Christ", "righteous"],
        "notes": "Purpose clause ἵνα μὴ ἁμάρτητε. Third class condition ἐάν τις ἁμάρτῃ. παράκλητον — 'advocate/counselor.'",
    },
    "1john-2-2": {
        "keyTerms": ["propitiation", "sins", "whole", "world"],
        "notes": "ἱλασμός — 'propitiation/atoning sacrifice.' Universal scope: οὐ...μόνον ἀλλὰ καί — not only ours but the whole world's.",
        "fixedTranslation": "And he is the propitiation for our sins, and not for ours only but also for the sins of the whole world.",
    },
    "1john-2-15": {
        "keyTerms": ["love", "world", "things", "world", "Father"],
        "notes": "Present imperative μὴ ἀγαπᾶτε. Third class condition ἐάν τις ἀγαπᾷ. Incompatibility of world-love and Father-love.",
        "fixedTranslation": "Do not love the world nor the things in the world. If anyone loves the world, the love of the Father is not in him.",
    },
    "1john-3-1": {
        "keyTerms": ["behold", "love", "Father", "given", "children", "God", "called"],
        "notes": "Aorist imperative Ἴδετε. ποταπήν — 'what sort of' (exclamatory). Purpose clause ἵνα κληθῶμεν.",
        "fixedTranslation": "Behold what manner of love the Father has given to us, that we should be called children of God — and so we are!",
    },
    "1john-3-16": {
        "keyTerms": ["know", "love", "laid down", "life", "ought", "lay down", "lives", "brothers"],
        "notes": "Perfect ἐγνώκαμεν. Aorist ἔθηκεν — completed sacrificial act. ὀφείλομεν — moral obligation.",
    },
    "1john-3-18": {
        "keyTerms": ["little children", "love", "word", "tongue", "action", "truth"],
        "notes": "Hortatory subjunctive μὴ ἀγαπῶμεν. Contrast: λόγῳ/γλώσσῃ vs. ἔργῳ/ἀληθείᾳ.",
        "fixedTranslation": "Little children, let us not love in word or in tongue, but in action and in truth.",
    },
    "1john-4-10": {
        "keyTerms": ["love", "God", "loved", "sent", "Son", "atoning sacrifice", "sins"],
        "notes": "ἱλασμόν — 'propitiation/atoning sacrifice.' Contrast: οὐχ ὅτι ἡμεῖς...ἀλλ᾽ ὅτι αὐτός.",
    },
    "1john-4-11": {
        "keyTerms": ["beloved", "God", "loved", "ought", "love", "one another"],
        "notes": "Vocative ἀγαπητοί. First class condition εἰ + indicative — assumed true. Present infinitive ἀγαπᾶν.",
        "fixedTranslation": "Beloved, if God so loved us, we also ought to love one another.",
    },
    "1john-4-18": {
        "keyTerms": ["fear", "love", "perfect", "casts out", "punishment"],
        "notes": "Present βάλλει — love keeps casting out fear. Causal ὅτι — fear involves punishment.",
    },
    "1john-4-19": {
        "keyTerms": ["love", "first", "loved"],
        "notes": "Present ἀγαπῶμεν. Adverb πρῶτος — 'first/before us.' God's prior love is the cause.",
    },
    "1john-5-3": {
        "keyTerms": ["love", "God", "keep", "commandments", "burdensome"],
        "notes": "ἀγάπη τοῦ θεοῦ — subjective or objective genitive. Purpose clause ἵνα τηρῶμεν. βαρεῖαι — 'heavy/burdensome.'",
    },
    "1john-5-11": {
        "keyTerms": ["testimony", "God", "gave", "eternal life", "Son"],
        "notes": "Demonstrative αὕτη. Aorist ἔδωκεν. ἐν τῷ υἱῷ — life is located in the Son.",
    },
    "1john-5-12": {
        "keyTerms": ["has", "Son", "life", "does not have"],
        "notes": "Parallel structure: ὁ ἔχων/ὁ μὴ ἔχων. Present ἔχει — current possession. Absolute: no middle ground.",
    },
    "1john-5-13": {
        "keyTerms": ["written", "believe", "name", "Son", "God", "know", "eternal life"],
        "notes": "Aorist ἔγραψα — epistolary aorist. Purpose clause ἵνα εἰδῆτε. Perfect εἰδῆτε — settled knowledge.",
    },

    # ---- JUDE ----
    "jude-1-24": {
        "keyTerms": ["able", "keep", "stumbling", "present", "faultless", "glory", "joy"],
        "notes": "Doxology begins. Aorist infinitives φυλάξαι, στῆσαι. ἀπταίστους — 'without stumbling.'",
    },
    "jude-1-25": {
        "keyTerms": ["only", "God", "Savior", "Jesus Christ", "Lord", "glory", "majesty", "dominion", "authority"],
        "notes": "Four-fold ascription: δόξα, μεγαλωσύνη, κράτος, ἐξουσία. Three temporal markers: πρὸ παντὸς τοῦ αἰῶνος, νῦν, εἰς πάντας τοὺς αἰῶνας.",
        "fixedTranslation": "to the only God our Savior, through Jesus Christ our Lord, be glory, majesty, dominion, and authority, before all time, now, and forever. Amen.",
    },

    # ---- REVELATION ----
    "rev-3-20": {
        "keyTerms": ["behold", "stand", "door", "knock", "hear", "voice", "open", "come in", "dine"],
        "notes": "Perfect ἕστηκα — 'I stand (and remain).' Present κρούω. Third class condition ἐάν τις.",
        "fixedTranslation": 'Behold, I stand at the door and knock. If anyone hears my voice and opens the door, I will come in to him and will dine with him, and he with me.',
    },
    "rev-22-13": {
        "keyTerms": ["Alpha", "Omega", "First", "Last", "Beginning", "End"],
        "notes": "Three pairs of merisms expressing totality. ἀρχή/τέλος — temporal completeness.",
    },
    "rev-22-17": {
        "keyTerms": ["Spirit", "bride", "come", "hears", "thirsty", "water", "life", "freely"],
        "notes": "Three invitations to 'come.' δωρεάν — 'as a gift/freely.' Present participle ὁ διψῶν.",
    },
    "rev-22-20": {
        "keyTerms": ["testifies", "yes", "coming", "quickly", "amen", "come", "Lord Jesus"],
        "notes": "Present middle μαρτυρῶν. ναί — affirmation. ταχύ — 'soon/quickly.' Maranatha echo.",
        "fixedTranslation": 'He who testifies these things says, "Yes, I am coming quickly." Amen. Come, Lord Jesus!',
    },
    "rev-22-21": {
        "keyTerms": ["grace", "Lord Jesus"],
        "notes": "Benediction closing the NT. μετὰ πάντων — 'with all the saints.'",
        "fixedTranslation": "The grace of the Lord Jesus be with all the saints. Amen.",
    },

    # ---- 1 THESSALONIANS (already covered above) ----
    # ---- HEBREWS remaining ----
    "heb-13-5": {
        "keyTerms": ["covetousness", "content", "present", "never", "leave", "forsake"],
        "notes": "ἀφιλάργυρος — 'free from love of money.' Double negative οὐ μή...οὐδ᾽ οὐ μή — emphatic promise.",
        "fixedTranslation": 'Let your way of life be free from the love of money, being content with what you have; for he himself has said, "I will never leave you, nor will I ever forsake you."',
    },
}

# ---------------------------------------------------------------------------
# New verses for empty books
# ---------------------------------------------------------------------------

NEW_VERSES = [
    # ---- PHILEMON ----
    {
        "id": "phlm-1-1",
        "book": "phlm",
        "chapter": 1,
        "verse": 1,
        "reference": "Philemon 1:1",
        "greek": "Παῦλος δέσμιος Χριστοῦ Ἰησοῦ καὶ Τιμόθεος ὁ ἀδελφὸς Φιλήμονι τῷ ἀγαπητῷ καὶ συνεργῷ ἡμῶν",
        "referenceTranslation": "Paul, a prisoner of Christ Jesus, and Timothy our brother, to Philemon our beloved and fellow worker,",
        "keyTerms": ["Paul", "prisoner", "Christ Jesus", "Timothy", "brother", "Philemon", "beloved", "fellow worker"],
        "difficulty": 2,
        "notes": "δέσμιος — 'prisoner,' not δοῦλος. συνεργῷ — 'co-worker.' Dative Φιλήμονι — recipient.",
        "tier": 2,
    },
    {
        "id": "phlm-1-6",
        "book": "phlm",
        "chapter": 1,
        "verse": 6,
        "reference": "Philemon 1:6",
        "greek": "ὅπως ἡ κοινωνία τῆς πίστεώς σου ἐνεργὴς γένηται ἐν ἐπιγνώσει παντὸς ἀγαθοῦ τοῦ ἐν ἡμῖν εἰς Χριστόν",
        "referenceTranslation": "that the fellowship of your faith may become effective through the knowledge of every good thing that is in us for Christ.",
        "keyTerms": ["fellowship", "faith", "effective", "knowledge", "good", "Christ"],
        "difficulty": 3,
        "notes": "ὅπως + subjunctive γένηται — purpose clause. ἐνεργής — 'effective/active.' ἐπίγνωσις — 'full knowledge.'",
        "tier": 2,
    },
    {
        "id": "phlm-1-15",
        "book": "phlm",
        "chapter": 1,
        "verse": 15,
        "reference": "Philemon 1:15",
        "greek": "τάχα γὰρ διὰ τοῦτο ἐχωρίσθη πρὸς ὥραν ἵνα αἰώνιον αὐτὸν ἀπέχῃς",
        "referenceTranslation": "For perhaps he was separated from you for a time so that you might have him back forever,",
        "keyTerms": ["perhaps", "separated", "time", "forever", "have back"],
        "difficulty": 2,
        "notes": "τάχα — 'perhaps,' diplomatic understatement. Aorist passive ἐχωρίσθη — divine passive. πρὸς ὥραν vs. αἰώνιον contrast.",
        "tier": 2,
    },
    {
        "id": "phlm-1-16",
        "book": "phlm",
        "chapter": 1,
        "verse": 16,
        "reference": "Philemon 1:16",
        "greek": "οὐκέτι ὡς δοῦλον ἀλλ᾽ ὑπὲρ δοῦλον ἀδελφὸν ἀγαπητόν μάλιστα ἐμοί πόσῳ δὲ μᾶλλον σοὶ καὶ ἐν σαρκὶ καὶ ἐν κυρίῳ",
        "referenceTranslation": "no longer as a slave, but more than a slave, a beloved brother — especially to me, but how much more to you, both in the flesh and in the Lord.",
        "keyTerms": ["no longer", "slave", "more than", "beloved", "brother", "flesh", "Lord"],
        "difficulty": 2,
        "notes": "οὐκέτι...ἀλλ᾽ ὑπέρ — 'no longer...but beyond.' Dual sphere: ἐν σαρκί (earthly) and ἐν κυρίῳ (spiritual).",
        "tier": 2,
    },

    # ---- 2 JOHN ----
    {
        "id": "2john-1-1",
        "book": "2john",
        "chapter": 1,
        "verse": 1,
        "reference": "2 John 1:1",
        "greek": "Ὁ πρεσβύτερος ἐκλεκτῇ κυρίᾳ καὶ τοῖς τέκνοις αὐτῆς οὓς ἐγὼ ἀγαπῶ ἐν ἀληθείᾳ",
        "referenceTranslation": "The elder to the elect lady and her children, whom I love in truth,",
        "keyTerms": ["elder", "elect", "lady", "children", "love", "truth"],
        "difficulty": 2,
        "notes": "πρεσβύτερος — 'elder,' self-designation. ἐκλεκτῇ κυρίᾳ — debated: personal name or a church personified.",
        "tier": 2,
    },
    {
        "id": "2john-1-4",
        "book": "2john",
        "chapter": 1,
        "verse": 4,
        "reference": "2 John 1:4",
        "greek": "Ἐχάρην λίαν ὅτι εὕρηκα ἐκ τῶν τέκνων σου περιπατοῦντας ἐν ἀληθείᾳ καθὼς ἐντολὴν ἐλάβομεν παρὰ τοῦ πατρός",
        "referenceTranslation": "I rejoiced greatly that I have found some of your children walking in truth, just as we received commandment from the Father.",
        "keyTerms": ["rejoiced", "greatly", "found", "children", "walking", "truth", "commandment", "Father"],
        "difficulty": 2,
        "notes": "Aorist passive ἐχάρην — ingressive. Perfect εὕρηκα — 'I have found.' ἐκ partitive — 'some of.'",
        "tier": 2,
    },
    {
        "id": "2john-1-6",
        "book": "2john",
        "chapter": 1,
        "verse": 6,
        "reference": "2 John 1:6",
        "greek": "καὶ αὕτη ἐστὶν ἡ ἀγάπη ἵνα περιπατῶμεν κατὰ τὰς ἐντολὰς αὐτοῦ αὕτη ἡ ἐντολή ἐστιν καθὼς ἠκούσατε ἀπ᾽ ἀρχῆς ἵνα ἐν αὐτῇ περιπατῆτε",
        "referenceTranslation": "And this is love, that we walk according to his commandments. This is the commandment, just as you heard from the beginning, that you should walk in it.",
        "keyTerms": ["love", "walk", "commandments", "commandment", "heard", "beginning"],
        "difficulty": 2,
        "notes": "Two ἵνα clauses define love and the commandment. ἀπ᾽ ἀρχῆς — 'from the beginning' of Christian instruction.",
        "tier": 2,
    },

    # ---- 3 JOHN ----
    {
        "id": "3john-1-1",
        "book": "3john",
        "chapter": 1,
        "verse": 1,
        "reference": "3 John 1:1",
        "greek": "Ὁ πρεσβύτερος Γαΐῳ τῷ ἀγαπητῷ ὃν ἐγὼ ἀγαπῶ ἐν ἀληθείᾳ",
        "referenceTranslation": "The elder to the beloved Gaius, whom I love in truth.",
        "keyTerms": ["elder", "beloved", "Gaius", "love", "truth"],
        "difficulty": 1,
        "notes": "Same self-designation πρεσβύτερος as 2 John. Dative Γαΐῳ — named recipient. ἐν ἀληθείᾳ — 'in truth.'",
        "tier": 1,
    },
    {
        "id": "3john-1-4",
        "book": "3john",
        "chapter": 1,
        "verse": 4,
        "reference": "3 John 1:4",
        "greek": "μειζοτέραν τούτων οὐκ ἔχω χαράν ἵνα ἀκούω τὰ ἐμὰ τέκνα ἐν τῇ ἀληθείᾳ περιπατοῦντα",
        "referenceTranslation": "I have no greater joy than this, to hear that my children are walking in the truth.",
        "keyTerms": ["greater", "joy", "hear", "children", "walking", "truth"],
        "difficulty": 2,
        "notes": "Double comparative μειζοτέραν (from μέγας). Epexegetical ἵνα clause. Present participle περιπατοῦντα.",
        "tier": 2,
    },
    {
        "id": "3john-1-11",
        "book": "3john",
        "chapter": 1,
        "verse": 11,
        "reference": "3 John 1:11",
        "greek": "Ἀγαπητέ μὴ μιμοῦ τὸ κακὸν ἀλλὰ τὸ ἀγαθόν ὁ ἀγαθοποιῶν ἐκ τοῦ θεοῦ ἐστιν ὁ κακοποιῶν οὐχ ἑώρακεν τὸν θεόν",
        "referenceTranslation": "Beloved, do not imitate what is evil, but what is good. The one who does good is of God; the one who does evil has not seen God.",
        "keyTerms": ["beloved", "imitate", "evil", "good", "God", "does good", "does evil", "seen"],
        "difficulty": 2,
        "notes": "Vocative ἀγαπητέ. Present imperative μὴ μιμοῦ. Substantival participles ὁ ἀγαθοποιῶν, ὁ κακοποιῶν. Perfect ἑώρακεν.",
        "tier": 2,
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    verses = data["verses"]
    stats = {
        "transliterations_added": 0,
        "keyTerms_added": 0,
        "notes_added": 0,
        "translations_fixed": 0,
        "new_verses_added": 0,
    }

    # Build lookup
    verse_map = {v["id"]: v for v in verses}

    # Process each existing verse
    for v in verses:
        vid = v["id"]
        info = VERSE_DATA.get(vid, {})

        # Fix garbled translations
        if "fixedTranslation" in info:
            if v["referenceTranslation"] != info["fixedTranslation"]:
                v["referenceTranslation"] = info["fixedTranslation"]
                stats["translations_fixed"] += 1

        # Fill transliteration
        if not v.get("transliteration"):
            v["transliteration"] = transliterate_greek(v["greek"])
            stats["transliterations_added"] += 1

        # Fill keyTerms
        if not v.get("keyTerms") or len(v["keyTerms"]) == 0:
            if "keyTerms" in info:
                v["keyTerms"] = info["keyTerms"]
            else:
                # Auto-extract: take important words from referenceTranslation
                v["keyTerms"] = _auto_extract_key_terms(v["referenceTranslation"])
            stats["keyTerms_added"] += 1

        # Fill notes
        if not v.get("notes"):
            if "notes" in info:
                v["notes"] = info["notes"]
            else:
                v["notes"] = _auto_generate_note(v)
            stats["notes_added"] += 1

    # Add new verses for empty books
    for nv in NEW_VERSES:
        if nv["id"] not in verse_map:
            nv["transliteration"] = transliterate_greek(nv["greek"])
            verses.append(nv)
            stats["new_verses_added"] += 1

    # Write back
    data["verses"] = verses
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Summary
    print("=== fill_verses.py summary ===")
    for k, val in stats.items():
        print(f"  {k}: {val}")
    print(f"  Total verses now: {len(verses)}")
    print("Done.")


# ---------------------------------------------------------------------------
# Helpers for auto-generation when no manual data provided
# ---------------------------------------------------------------------------

STOP_WORDS = {
    "a", "an", "the", "of", "in", "to", "and", "for", "is", "are", "was",
    "were", "be", "been", "but", "or", "nor", "not", "no", "so", "as",
    "at", "by", "from", "on", "with", "that", "this", "it", "its",
    "he", "she", "him", "her", "his", "they", "them", "their", "we",
    "us", "our", "you", "your", "i", "me", "my", "who", "whom", "which",
    "what", "will", "shall", "do", "does", "did", "has", "have", "had",
    "may", "might", "can", "could", "would", "should", "if", "when",
    "then", "than", "also", "into", "up", "out", "upon", "let", "said",
    "says", "saying", "say", "now", "all", "every", "each", "both",
    "same", "own", "about", "being", "those", "these", "through",
    "over", "just", "how", "very", "more", "before", "after",
    "himself", "herself", "themselves", "ourselves", "yourself",
    "vvv", "one", "even", "still", "yet",
}


def _auto_extract_key_terms(translation: str) -> list:
    """Extract 3-8 key content words from a translation."""
    # Clean up
    text = re.sub(r'["""\'.,;:!?\(\)\[\]{}]', " ", translation)
    words = text.split()
    seen = set()
    terms = []
    for w in words:
        w_lower = w.lower()
        if w_lower not in STOP_WORDS and w_lower not in seen and len(w_lower) > 1:
            seen.add(w_lower)
            terms.append(w.lower() if not w[0].isupper() else w)
    # Limit to 3-8
    if len(terms) > 8:
        terms = terms[:8]
    if len(terms) < 3 and len(words) > 0:
        # Pad with whatever we have
        for w in words:
            if w.lower() not in seen:
                terms.append(w)
                seen.add(w.lower())
                if len(terms) >= 3:
                    break
    return terms


def _auto_generate_note(verse: dict) -> str:
    """Generate a basic grammatical note from the Greek text."""
    greek = verse.get("greek", "")
    notes = []

    # Check for common patterns
    if "ἀμὴν ἀμὴν" in greek or "Ἀμὴν ἀμὴν" in greek:
        notes.append("Double ἀμήν formula — solemn affirmation")
    if "ἐγώ εἰμι" in greek or "Ἐγώ εἰμι" in greek:
        notes.append("ἐγώ εἰμι — 'I am' declaration")
    if "γέγραπται" in greek:
        notes.append("Perfect passive γέγραπται introduces Scripture quotation")
    if "ἵνα" in greek:
        notes.append("Purpose/result clause with ἵνα")
    if "ἐάν" in greek or "ἐὰν" in greek:
        notes.append("Third class conditional (ἐάν + subjunctive)")

    if notes:
        return ". ".join(notes) + "."
    return "Key verse for vocabulary practice."


if __name__ == "__main__":
    main()
