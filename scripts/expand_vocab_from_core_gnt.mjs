#!/usr/bin/env node

/**
 * Expand vocabulary from core-gnt-vocab lemma list
 * Downloads lemmas from jtauber's core-gnt-vocab and appends to vocabulary.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEMMA_URL = 'https://raw.githubusercontent.com/jtauber/core-gnt-vocab/master/lemma_95.txt';
const VOCAB_PATH = join(__dirname, '..', 'src', 'data', 'vocabulary.json');
const TARGET_COUNT = 550;

// Simple transliteration map for Greek to Latin characters
const TRANSLITERATION_MAP = {
  'α': 'a', 'ά': 'a', 'ὰ': 'a', 'ᾶ': 'a', 'ἀ': 'a', 'ἁ': 'ha', 'ἄ': 'a', 'ἅ': 'ha',
  'ἂ': 'a', 'ἃ': 'ha', 'ἆ': 'a', 'ἇ': 'ha', 'ᾳ': 'a', 'ᾴ': 'a', 'ᾲ': 'a', 'ᾷ': 'a',
  'ᾀ': 'a', 'ᾁ': 'ha', 'ᾄ': 'a', 'ᾅ': 'ha', 'ᾂ': 'a', 'ᾃ': 'ha', 'ᾆ': 'a', 'ᾇ': 'ha',
  'β': 'b',
  'γ': 'g',
  'δ': 'd',
  'ε': 'e', 'έ': 'e', 'ὲ': 'e', 'ἐ': 'e', 'ἑ': 'he', 'ἔ': 'e', 'ἕ': 'he', 'ἒ': 'e', 'ἓ': 'he',
  'ζ': 'z',
  'η': 'ē', 'ή': 'ē', 'ὴ': 'ē', 'ῆ': 'ē', 'ἠ': 'ē', 'ἡ': 'hē', 'ἤ': 'ē', 'ἥ': 'hē',
  'ἢ': 'ē', 'ἣ': 'hē', 'ἦ': 'ē', 'ἧ': 'hē', 'ῃ': 'ē', 'ῄ': 'ē', 'ῂ': 'ē', 'ῇ': 'ē',
  'ᾐ': 'ē', 'ᾑ': 'hē', 'ᾔ': 'ē', 'ᾕ': 'hē', 'ᾒ': 'ē', 'ᾓ': 'hē', 'ᾖ': 'ē', 'ᾗ': 'hē',
  'θ': 'th',
  'ι': 'i', 'ί': 'i', 'ὶ': 'i', 'ῖ': 'i', 'ἰ': 'i', 'ἱ': 'hi', 'ἴ': 'i', 'ἵ': 'hi',
  'ἲ': 'i', 'ἳ': 'hi', 'ἶ': 'i', 'ἷ': 'hi', 'ϊ': 'i', 'ΐ': 'i', 'ῒ': 'i', 'ῗ': 'i',
  'κ': 'k',
  'λ': 'l',
  'μ': 'm',
  'ν': 'n',
  'ξ': 'x',
  'ο': 'o', 'ό': 'o', 'ὸ': 'o', 'ὀ': 'o', 'ὁ': 'ho', 'ὄ': 'o', 'ὅ': 'ho', 'ὂ': 'o', 'ὃ': 'ho',
  'π': 'p',
  'ρ': 'r', 'ῥ': 'rh', 'ῤ': 'r',
  'σ': 's', 'ς': 's',
  'τ': 't',
  'υ': 'y', 'ύ': 'y', 'ὺ': 'y', 'ῦ': 'y', 'ὐ': 'y', 'ὑ': 'hy', 'ὔ': 'y', 'ὕ': 'hy',
  'ὒ': 'y', 'ὓ': 'hy', 'ὖ': 'y', 'ὗ': 'hy', 'ϋ': 'y', 'ΰ': 'y', 'ῢ': 'y', 'ῧ': 'y',
  'φ': 'ph',
  'χ': 'ch',
  'ψ': 'ps',
  'ω': 'ō', 'ώ': 'ō', 'ὼ': 'ō', 'ῶ': 'ō', 'ὠ': 'ō', 'ὡ': 'hō', 'ὤ': 'ō', 'ὥ': 'hō',
  'ὢ': 'ō', 'ὣ': 'hō', 'ὦ': 'ō', 'ὧ': 'hō', 'ῳ': 'ō', 'ῴ': 'ō', 'ῲ': 'ō', 'ῷ': 'ō',
  'ᾠ': 'ō', 'ᾡ': 'hō', 'ᾤ': 'ō', 'ᾥ': 'hō', 'ᾢ': 'ō', 'ᾣ': 'hō', 'ᾦ': 'ō', 'ᾧ': 'hō',
  // Uppercase
  'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'Ē', 'Θ': 'Th',
  'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
  'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'Ph', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'Ō',
  'Ἀ': 'A', 'Ἁ': 'Ha', 'Ἐ': 'E', 'Ἑ': 'He', 'Ἠ': 'Ē', 'Ἡ': 'Hē', 'Ἰ': 'I', 'Ἱ': 'Hi',
  'Ὀ': 'O', 'Ὁ': 'Ho', 'Ὑ': 'Hy', 'Ὠ': 'Ō', 'Ὡ': 'Hō',
};

function transliterate(greek) {
  let result = '';
  for (const char of greek) {
    result += TRANSLITERATION_MAP[char] || char;
  }
  return result;
}

function inferPartOfSpeech(gloss) {
  const lowerGloss = gloss.toLowerCase();

  // Verb indicators
  if (lowerGloss.startsWith('i ') || lowerGloss.includes('to ')) {
    return 'verb';
  }

  // Article
  if (lowerGloss === 'the') {
    return 'article';
  }

  // Conjunctions
  if (['and', 'but', 'or', 'for', 'if', 'that', 'because', 'so', 'yet', 'nor'].some(c => lowerGloss === c || lowerGloss.startsWith(c + ','))) {
    return 'conjunction';
  }

  // Prepositions
  if (['in', 'into', 'from', 'to', 'with', 'by', 'on', 'upon', 'through', 'before', 'after', 'under', 'over', 'against', 'among', 'between', 'around', 'toward'].some(p => lowerGloss === p || lowerGloss.startsWith(p + ','))) {
    return 'preposition';
  }

  // Pronouns
  if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'which', 'what', 'this', 'that', 'self', 'one'].some(p => lowerGloss === p || lowerGloss.startsWith(p + ','))) {
    return 'pronoun';
  }

  // Particles
  if (['not', 'indeed', 'therefore', 'then', 'now', 'ever', 'never'].some(p => lowerGloss === p || lowerGloss.startsWith(p + ','))) {
    return 'particle';
  }

  // Adverbs
  if (lowerGloss.endsWith('ly') || ['here', 'there', 'where', 'when', 'how', 'why', 'thus', 'so', 'now', 'then', 'always', 'often'].some(a => lowerGloss === a)) {
    return 'adverb';
  }

  // Adjectives often have patterns
  if (['good', 'bad', 'great', 'small', 'new', 'old', 'other', 'same', 'own', 'whole', 'all', 'every', 'each', 'many', 'much', 'few', 'first', 'last', 'true', 'false', 'holy', 'evil', 'righteous', 'faithful'].some(a => lowerGloss.includes(a))) {
    return 'adjective';
  }

  // Default to noun
  return 'noun';
}

function calculateTier(frequency) {
  if (frequency >= 500) return 1;
  if (frequency >= 100) return 2;
  if (frequency >= 50) return 3;
  if (frequency >= 25) return 4;
  return 5;
}

async function main() {
  console.log('Fetching lemma list from core-gnt-vocab...');

  // Fetch the lemma file
  const response = await fetch(LEMMA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.trim().split('\n');

  console.log(`Downloaded ${lines.length} lemmas`);

  // Parse lemmas: format is "lemma [count] gloss"
  const newLemmas = [];
  for (const line of lines) {
    // Match pattern: Greek word, [number], rest is gloss
    const match = line.match(/^(.+?)\s+\[(\d+)\]\s+(.+)$/);
    if (match) {
      const [, greek, countStr, gloss] = match;
      newLemmas.push({
        greek: greek.trim(),
        frequency: parseInt(countStr, 10),
        gloss: gloss.trim(),
      });
    }
  }

  console.log(`Parsed ${newLemmas.length} lemmas`);

  // Load existing vocabulary
  const vocabData = JSON.parse(readFileSync(VOCAB_PATH, 'utf-8'));
  const existingWords = vocabData.words;

  console.log(`Existing vocabulary has ${existingWords.length} words`);

  // Get existing Greek words (normalized) for deduplication
  const existingGreekSet = new Set(
    existingWords.map(w => w.greek.toLowerCase().normalize('NFD'))
  );

  // Infer schema from first existing entry
  const schemaKeys = Object.keys(existingWords[0]);
  console.log(`Schema keys: ${schemaKeys.join(', ')}`);

  // Track the highest numeric ID to continue from
  let maxNumericId = 0;
  for (const word of existingWords) {
    const numMatch = word.id.match(/\d+/);
    if (numMatch) {
      maxNumericId = Math.max(maxNumericId, parseInt(numMatch[0], 10));
    }
  }

  // Add new lemmas until we reach target
  let added = 0;
  let nextId = maxNumericId + 1;

  // Sort by frequency descending to add most common words first
  newLemmas.sort((a, b) => b.frequency - a.frequency);

  for (const lemma of newLemmas) {
    if (existingWords.length >= TARGET_COUNT) {
      break;
    }

    // Check if already exists
    const normalizedGreek = lemma.greek.toLowerCase().normalize('NFD');
    if (existingGreekSet.has(normalizedGreek)) {
      continue;
    }

    // Create new entry matching schema
    const partOfSpeech = inferPartOfSpeech(lemma.gloss);
    const tier = calculateTier(lemma.frequency);
    const transliteration = transliterate(lemma.greek);

    const newEntry = {
      id: `G${nextId}`,
      greek: lemma.greek,
      transliteration: transliteration,
      gloss: lemma.gloss,
      definition: lemma.gloss.charAt(0).toUpperCase() + lemma.gloss.slice(1),
      partOfSpeech: partOfSpeech,
      frequency: lemma.frequency,
      tier: tier,
      strongs: `G${nextId}`,
    };

    existingWords.push(newEntry);
    existingGreekSet.add(normalizedGreek);
    nextId++;
    added++;
  }

  console.log(`Added ${added} new words`);
  console.log(`Total vocabulary now: ${existingWords.length} words`);

  // Sort by frequency descending for consistent ordering
  existingWords.sort((a, b) => b.frequency - a.frequency);

  // Write back
  writeFileSync(VOCAB_PATH, JSON.stringify(vocabData, null, 2) + '\n');

  console.log(`Vocabulary saved to ${VOCAB_PATH}`);

  // Verify
  const verification = JSON.parse(readFileSync(VOCAB_PATH, 'utf-8'));
  console.log(`Verification: ${verification.words.length} words in file`);

  if (verification.words.length >= TARGET_COUNT) {
    console.log(`Success! Vocabulary has ${verification.words.length} entries (target: ${TARGET_COUNT})`);
  } else {
    console.log(`Warning: Only ${verification.words.length} entries (target: ${TARGET_COUNT})`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
