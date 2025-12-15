/**
 * Erasmian Pronunciation System for Koine Greek
 *
 * Erasmian pronunciation (also called "Academic" or "Reconstructed" pronunciation)
 * attempts to represent ancient Greek sounds, as opposed to Modern Greek pronunciation.
 */

// Greek diphthongs and their Erasmian pronunciations
const DIPHTHONGS: [string, string, string][] = [
  // [Greek, IPA, English respelling]
  ['αι', 'ai̯', 'eye'],
  ['ει', 'ei̯', 'ay'],
  ['οι', 'oi̯', 'oy'],
  ['υι', 'yi̯', 'wee'],
  ['αυ', 'au̯', 'ow'],
  ['ευ', 'eu̯', 'eh-oo'],
  ['ηυ', 'ɛːu̯', 'ay-oo'],
  ['ου', 'oː', 'oo'],
  // Iota subscript combinations (rare in vocabulary, but included)
  ['ᾳ', 'aːi̯', 'ah-ee'],
  ['ῃ', 'ɛːi̯', 'ay-ee'],
  ['ῳ', 'ɔːi̯', 'oh-ee'],
];

// Single vowels with Erasmian pronunciations
const VOWELS: Record<string, [string, string]> = {
  // [IPA, English respelling]
  'α': ['a', 'ah'],
  'ά': ['a', 'ah'],
  'ὰ': ['a', 'ah'],
  'ᾶ': ['aː', 'ah'],
  'ε': ['e', 'eh'],
  'έ': ['e', 'eh'],
  'ὲ': ['e', 'eh'],
  'η': ['ɛː', 'ay'],
  'ή': ['ɛː', 'ay'],
  'ὴ': ['ɛː', 'ay'],
  'ῆ': ['ɛː', 'ay'],
  'ι': ['i', 'ee'],
  'ί': ['i', 'ee'],
  'ὶ': ['i', 'ee'],
  'ῖ': ['iː', 'ee'],
  'ϊ': ['i', 'ee'],
  'ΐ': ['i', 'ee'],
  'ο': ['o', 'o'],
  'ό': ['o', 'o'],
  'ὸ': ['o', 'o'],
  'υ': ['y', 'oo'],
  'ύ': ['y', 'oo'],
  'ὺ': ['y', 'oo'],
  'ῦ': ['yː', 'oo'],
  'ϋ': ['y', 'oo'],
  'ΰ': ['y', 'oo'],
  'ω': ['ɔː', 'oh'],
  'ώ': ['ɔː', 'oh'],
  'ὼ': ['ɔː', 'oh'],
  'ῶ': ['ɔː', 'oh'],
};

// Consonants with Erasmian pronunciations
const CONSONANTS: Record<string, [string, string]> = {
  // [IPA, English respelling]
  'β': ['b', 'b'],
  'γ': ['g', 'g'],
  'δ': ['d', 'd'],
  'ζ': ['zd', 'zd'],
  'θ': ['tʰ', 'th'],
  'κ': ['k', 'k'],
  'λ': ['l', 'l'],
  'μ': ['m', 'm'],
  'ν': ['n', 'n'],
  'ξ': ['ks', 'ks'],
  'π': ['p', 'p'],
  'ρ': ['r', 'r'],
  'ῥ': ['rʰ', 'rh'],
  'σ': ['s', 's'],
  'ς': ['s', 's'],
  'τ': ['t', 't'],
  'φ': ['pʰ', 'ph'],
  'χ': ['kʰ', 'kh'],
  'ψ': ['ps', 'ps'],
};

// Consonant clusters with special pronunciations
const CONSONANT_CLUSTERS: [string, string, string][] = [
  ['γγ', 'ŋg', 'ng'],
  ['γκ', 'ŋk', 'nk'],
  ['γξ', 'ŋks', 'nks'],
  ['γχ', 'ŋkʰ', 'nkh'],
];

// Breathing marks
const ROUGH_BREATHING = ['ἁ', 'ἑ', 'ἡ', 'ἱ', 'ὁ', 'ὑ', 'ὡ', 'Ἁ', 'Ἑ', 'Ἡ', 'Ἱ', 'Ὁ', 'Ὑ', 'Ὡ'];
const SMOOTH_BREATHING = ['ἀ', 'ἐ', 'ἠ', 'ἰ', 'ὀ', 'ὐ', 'ὠ', 'Ἀ', 'Ἐ', 'Ἠ', 'Ἰ', 'Ὀ', 'Ὠ'];

// Map breathing marks to base vowels
const BREATHING_TO_BASE: Record<string, string> = {
  'ἁ': 'α', 'ἑ': 'ε', 'ἡ': 'η', 'ἱ': 'ι', 'ὁ': 'ο', 'ὑ': 'υ', 'ὡ': 'ω',
  'Ἁ': 'α', 'Ἑ': 'ε', 'Ἡ': 'η', 'Ἱ': 'ι', 'Ὁ': 'ο', 'Ὑ': 'υ', 'Ὡ': 'ω',
  'ἀ': 'α', 'ἐ': 'ε', 'ἠ': 'η', 'ἰ': 'ι', 'ὀ': 'ο', 'ὐ': 'υ', 'ὠ': 'ω',
  'Ἀ': 'α', 'Ἐ': 'ε', 'Ἠ': 'η', 'Ἰ': 'ι', 'Ὀ': 'ο', 'Ὠ': 'ω',
  // With accents
  'ἅ': 'α', 'ἕ': 'ε', 'ἥ': 'η', 'ἵ': 'ι', 'ὅ': 'ο', 'ὕ': 'υ', 'ὥ': 'ω',
  'ἄ': 'α', 'ἔ': 'ε', 'ἤ': 'η', 'ἴ': 'ι', 'ὄ': 'ο', 'ὔ': 'υ', 'ὤ': 'ω',
  'ἃ': 'α', 'ἓ': 'ε', 'ἣ': 'η', 'ἳ': 'ι', 'ὃ': 'ο', 'ὓ': 'υ', 'ὣ': 'ω',
  'ἂ': 'α', 'ἒ': 'ε', 'ἢ': 'η', 'ἲ': 'ι', 'ὂ': 'ο', 'ὒ': 'υ', 'ὢ': 'ω',
  'ἇ': 'α', 'ἧ': 'η', 'ἷ': 'ι', 'ὗ': 'υ', 'ὧ': 'ω',
  'ἆ': 'α', 'ἦ': 'η', 'ἶ': 'ι', 'ὖ': 'υ', 'ὦ': 'ω',
};

/**
 * Check if a character has rough breathing
 */
function hasRoughBreathing(char: string): boolean {
  return ROUGH_BREATHING.includes(char) || char in BREATHING_TO_BASE && ROUGH_BREATHING.includes(char);
}

/**
 * Normalize Greek text by removing accents and breathing marks
 */
export function normalizeGreek(text: string): string {
  let result = text.toLowerCase();

  // Replace breathing mark characters with base vowels
  for (const [breathing, base] of Object.entries(BREATHING_TO_BASE)) {
    result = result.replace(new RegExp(breathing, 'g'), base);
  }

  // Remove remaining diacritics
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');

  return result;
}

/**
 * Convert Greek text to IPA (International Phonetic Alphabet)
 */
export function toIPA(greek: string): string {
  let result = '';
  const text = greek.toLowerCase();
  let i = 0;

  while (i < text.length) {
    let matched = false;

    // Check for rough breathing at word start (adds 'h')
    if (i === 0 || text[i - 1] === ' ') {
      if (hasRoughBreathing(text[i])) {
        result += 'h';
      }
    }

    // Check for consonant clusters first
    for (const [cluster, ipa] of CONSONANT_CLUSTERS) {
      if (text.slice(i, i + cluster.length) === cluster) {
        result += ipa;
        i += cluster.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for diphthongs
    for (const [diphthong, ipa] of DIPHTHONGS) {
      if (text.slice(i, i + diphthong.length) === diphthong) {
        result += ipa;
        i += diphthong.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Get base character (handle breathing marks)
    let char = text[i];
    if (char in BREATHING_TO_BASE) {
      char = BREATHING_TO_BASE[char];
    }

    // Check for vowels
    if (char in VOWELS) {
      result += VOWELS[char][0];
      i++;
      continue;
    }

    // Check for consonants
    if (char in CONSONANTS) {
      result += CONSONANTS[char][0];
      i++;
      continue;
    }

    // Pass through other characters (spaces, punctuation)
    result += char;
    i++;
  }

  return result;
}

/**
 * Convert Greek text to English-speaker-friendly pronunciation guide
 */
export function toErasmianRespelling(greek: string): string {
  let result = '';
  const text = greek.toLowerCase();
  let i = 0;

  while (i < text.length) {
    let matched = false;

    // Check for rough breathing at word start (adds 'h')
    const isWordStart = i === 0 || text[i - 1] === ' ';
    if (isWordStart && hasRoughBreathing(text[i])) {
      result += 'h';
    }

    // Check for consonant clusters first
    for (const [cluster, , respelling] of CONSONANT_CLUSTERS) {
      if (text.slice(i, i + cluster.length) === cluster) {
        result += respelling;
        i += cluster.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for diphthongs
    for (const [diphthong, , respelling] of DIPHTHONGS) {
      if (text.slice(i, i + diphthong.length) === diphthong) {
        result += respelling;
        i += diphthong.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Get base character (handle breathing marks)
    let char = text[i];
    if (char in BREATHING_TO_BASE) {
      char = BREATHING_TO_BASE[char];
    }

    // Check for vowels
    if (char in VOWELS) {
      result += VOWELS[char][1];
      i++;
      continue;
    }

    // Check for consonants
    if (char in CONSONANTS) {
      result += CONSONANTS[char][1];
      i++;
      continue;
    }

    // Handle spaces
    if (char === ' ') {
      result += ' ';
      i++;
      continue;
    }

    // Skip other characters
    i++;
  }

  return result;
}

/**
 * Break a Greek word into syllables (simplified algorithm)
 */
export function syllabify(greek: string): string[] {
  const text = normalizeGreek(greek);
  const syllables: string[] = [];
  let current = '';

  const vowels = new Set(['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']);
  const diphthongSeconds = new Set(['ι', 'υ']);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    const prevChar = text[i - 1];

    current += char;

    // Check if this is a vowel
    if (vowels.has(char)) {
      // Check if this might be part of a diphthong
      if (diphthongSeconds.has(nextChar) && vowels.has(char)) {
        // Continue to include the diphthong
        continue;
      }

      // Check if next char is a consonant followed by vowel (split before single consonant)
      if (nextChar && !vowels.has(nextChar)) {
        const afterNext = text[i + 2];
        if (afterNext && vowels.has(afterNext)) {
          // Single consonant between vowels goes with following syllable
          syllables.push(current);
          current = '';
          continue;
        }
        // Otherwise, continue building
        continue;
      }

      // End of word or vowel followed by vowel (not diphthong)
      if (!nextChar || vowels.has(nextChar)) {
        syllables.push(current);
        current = '';
      }
    }
  }

  if (current) {
    syllables.push(current);
  }

  return syllables;
}

/**
 * Get detailed pronunciation breakdown for a Greek word
 */
export interface PronunciationBreakdown {
  greek: string;
  ipa: string;
  respelling: string;
  syllables: string[];
  syllableRespellings: string[];
}

export function getPronunciationBreakdown(greek: string): PronunciationBreakdown {
  const syllables = syllabify(greek);

  return {
    greek,
    ipa: toIPA(greek),
    respelling: toErasmianRespelling(greek),
    syllables,
    syllableRespellings: syllables.map(s => toErasmianRespelling(s)),
  };
}

/**
 * Common Greek vocabulary with pre-verified pronunciations
 * These are hand-checked for accuracy
 */
export const VERIFIED_PRONUNCIATIONS: Record<string, string> = {
  'καί': 'kye',
  'ὁ': 'ho',
  'ἡ': 'hay',
  'τό': 'to',
  'ἐν': 'en',
  'δέ': 'deh',
  'εἰς': 'ays',
  'αὐτός': 'ow-TOS',
  'οὗτος': 'HOO-tos',
  'ἐκ': 'ek',
  'ἐγώ': 'eh-GOH',
  'σύ': 'soo',
  'λέγω': 'LEH-goh',
  'θεός': 'theh-OS',
  'ἄνθρωπος': 'AN-throh-pos',
  'κύριος': 'KOO-ree-os',
  'Ἰησοῦς': 'ee-ay-SOOS',
  'Χριστός': 'khris-TOS',
  'πνεῦμα': 'PNYOO-mah',
  'λόγος': 'LO-gos',
  'ἀγάπη': 'ah-GAH-pay',
  'πίστις': 'PIS-tis',
  'ἐλπίς': 'el-PIS',
  'χάρις': 'KHAH-ris',
  'ἁμαρτία': 'hah-mar-TEE-ah',
  'ζωή': 'zoh-AY',
  'θάνατος': 'THAH-nah-tos',
  'κόσμος': 'KOS-mos',
  'οὐρανός': 'oo-rah-NOS',
  'γῆ': 'gay',
  'ἔργον': 'ER-gon',
  'ἡμέρα': 'hay-MEH-rah',
  'ὥρα': 'HOH-rah',
  'ὁδός': 'ho-DOS',
  'ἀλήθεια': 'ah-LAY-thay-ah',
  'δόξα': 'DOK-sah',
  'βασιλεία': 'bah-see-LAY-ah',
  'ἐκκλησία': 'ek-klay-SEE-ah',
  'ἀδελφός': 'ah-del-PHOS',
  'πατήρ': 'pah-TAYR',
  'υἱός': 'hwee-OS',
  'μήτηρ': 'MAY-tayr',
  'γυνή': 'goo-NAY',
  'ἀνήρ': 'ah-NAYR',
  'παῖς': 'pice',
  'δοῦλος': 'DOO-los',
  'ὄνομα': 'O-no-mah',
  'λαός': 'lah-OS',
  'ἔθνος': 'ETH-nos',
};

/**
 * Get the best pronunciation for a Greek word
 * Uses verified pronunciations if available, otherwise generates one
 */
export function getBestPronunciation(greek: string): string {
  // Check for verified pronunciation
  const normalized = greek.toLowerCase();
  if (normalized in VERIFIED_PRONUNCIATIONS) {
    return VERIFIED_PRONUNCIATIONS[normalized];
  }

  // Generate pronunciation
  return toErasmianRespelling(greek);
}

/**
 * Audio playback using Web Speech API with Erasmian-like settings
 * Note: True Erasmian pronunciation requires recorded audio, but we can
 * approximate it by using slower speech rate and Greek voice
 */
let speechSynthesis: SpeechSynthesis | null = null;
let greekVoice: SpeechSynthesisVoice | null = null;
let initialized = false;

export async function initializeErasmianSpeech(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    speechSynthesis = window.speechSynthesis;

    const findVoice = () => {
      const voices = speechSynthesis?.getVoices() || [];

      // Prefer Greek voice for authentic sound
      greekVoice = voices.find(v => v.lang.startsWith('el')) || null;

      // Fallback to English for pronunciation guide reading
      if (!greekVoice) {
        greekVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB') || voices[0] || null;
      }

      initialized = true;
      resolve(!!greekVoice);
    };

    if (speechSynthesis?.getVoices().length) {
      findVoice();
    } else {
      speechSynthesis?.addEventListener('voiceschanged', findVoice, { once: true });
      setTimeout(() => { if (!initialized) findVoice(); }, 1000);
    }
  });
}

export function speakErasmian(greek: string, rate = 0.7): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(greek);

    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    // Slower rate for learning pronunciation
    utterance.lang = greekVoice?.lang.startsWith('el') ? 'el-GR' : 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error));

    speechSynthesis.speak(utterance);
  });
}

export function stopErasmianSpeech(): void {
  speechSynthesis?.cancel();
}
