import type { MCQQuestion, HW2SectionId, HomeworkQuestion } from '@/types/homework';

// =============================================================================
// UTILITY: Shuffle array using Fisher-Yates algorithm
// =============================================================================
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// =============================================================================
// UTILITY: Create noun parsing question with randomized options
// =============================================================================
const createNounQuestion = (
  id: string,
  greek: string,
  caseStr: string,
  number: string,
  paradigm: string,
  meaning: string
): MCQQuestion => {
  const correctAnswer = `${caseStr} ${number}`;

  // Generate plausible wrong options (same format: Case Number)
  const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
  const numbers = ['Singular', 'Plural'];

  const wrongOptions: string[] = [];

  // Generate all possible combinations except the correct one
  for (const c of cases) {
    for (const n of numbers) {
      const option = `${c} ${n}`;
      if (option !== correctAnswer) {
        wrongOptions.push(option);
      }
    }
  }

  // Shuffle and take 3 wrong options
  const shuffled = shuffleArray(wrongOptions).slice(0, 3);

  // Insert correct answer at random position
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `Parse this noun form:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${correctAnswer.toLowerCase()} from ${paradigm} (${meaning}).`,
    category: paradigm,
  };
};

// =============================================================================
// UTILITY: Create pronoun parsing question with randomized options
// =============================================================================
const createPronounQuestion = (
  id: string,
  greek: string,
  person: string,
  caseStr: string,
  number: string,
  gender?: string,
  thirdPersonOnly?: boolean
): MCQQuestion => {
  // For thirdPersonOnly mode (e.g., αὐτός): omit person label since it's always 3rd person
  // Format: "Genitive Singular Masculine" instead of "3rd Person Genitive Singular Masculine"
  const correctAnswer = thirdPersonOnly
    ? `${caseStr} ${number} ${gender}`
    : gender
      ? `${person} ${caseStr} ${number} ${gender}`
      : `${person} ${caseStr} ${number}`;

  const persons = ['1st Person', '2nd Person', '3rd Person'];
  const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
  const numbers = ['Singular', 'Plural'];
  const genders = ['Masculine', 'Feminine', 'Neuter'];

  const wrongOptions: string[] = [];

  if (thirdPersonOnly && gender) {
    // 3rd person only mode: vary only case, number, gender (no person variations)
    for (const c of cases) {
      for (const n of numbers) {
        for (const g of genders) {
          const option = `${c} ${n} ${g}`;
          if (option !== correctAnswer && wrongOptions.length < 12) {
            wrongOptions.push(option);
          }
        }
      }
    }
  } else if (gender) {
    // 3rd person with person labels: include gender
    for (const p of persons) {
      for (const c of cases) {
        for (const n of numbers) {
          for (const g of genders) {
            const option = `${p} ${c} ${n} ${g}`;
            if (option !== correctAnswer && wrongOptions.length < 12) {
              wrongOptions.push(option);
            }
          }
        }
      }
    }
  } else {
    // 1st/2nd person: no gender
    for (const p of ['1st Person', '2nd Person']) {
      for (const c of cases) {
        for (const n of numbers) {
          const option = `${p} ${c} ${n}`;
          if (option !== correctAnswer && wrongOptions.length < 12) {
            wrongOptions.push(option);
          }
        }
      }
    }
  }

  // Shuffle and take 3 wrong options
  const shuffled = shuffleArray(wrongOptions).slice(0, 3);

  // Insert correct answer at random position
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `Parse this pronoun:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${correctAnswer.toLowerCase()}.`,
    category: thirdPersonOnly ? 'autos' : person.toLowerCase().replace(' ', '-'),
  };
};

// =============================================================================
// SECTION 1: Masculine Nouns (24 questions)
// 2nd Declension Masculine (λόγος, ἄνθρωπος, θεός)
// =============================================================================

const section1QuestionsBase: MCQQuestion[] = [
  // 2nd Declension Masculine - λόγος (8 forms)
  createNounQuestion('s1-q1', 'λόγος', 'Nominative', 'Singular', 'λόγος', 'word'),
  createNounQuestion('s1-q2', 'λόγου', 'Genitive', 'Singular', 'λόγος', 'word'),
  createNounQuestion('s1-q3', 'λόγῳ', 'Dative', 'Singular', 'λόγος', 'word'),
  createNounQuestion('s1-q4', 'λόγον', 'Accusative', 'Singular', 'λόγος', 'word'),
  createNounQuestion('s1-q5', 'λόγοι', 'Nominative', 'Plural', 'λόγος', 'word'),
  createNounQuestion('s1-q6', 'λόγων', 'Genitive', 'Plural', 'λόγος', 'word'),
  createNounQuestion('s1-q7', 'λόγοις', 'Dative', 'Plural', 'λόγος', 'word'),
  createNounQuestion('s1-q8', 'λόγους', 'Accusative', 'Plural', 'λόγος', 'word'),

  // 2nd Declension Masculine - ἄνθρωπος (8 forms)
  createNounQuestion('s1-q11', 'ἄνθρωπος', 'Nominative', 'Singular', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q12', 'ἀνθρώπου', 'Genitive', 'Singular', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q13', 'ἀνθρώπῳ', 'Dative', 'Singular', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q14', 'ἄνθρωπον', 'Accusative', 'Singular', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q15', 'ἄνθρωποι', 'Nominative', 'Plural', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q16', 'ἀνθρώπων', 'Genitive', 'Plural', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q17', 'ἀνθρώποις', 'Dative', 'Plural', 'ἄνθρωπος', 'man'),
  createNounQuestion('s1-q18', 'ἀνθρώπους', 'Accusative', 'Plural', 'ἄνθρωπος', 'man'),

  // 2nd Declension Masculine - θεός (8 forms)
  createNounQuestion('s1-q21', 'θεός', 'Nominative', 'Singular', 'θεός', 'god'),
  createNounQuestion('s1-q22', 'θεοῦ', 'Genitive', 'Singular', 'θεός', 'god'),
  createNounQuestion('s1-q23', 'θεῷ', 'Dative', 'Singular', 'θεός', 'god'),
  createNounQuestion('s1-q24', 'θεόν', 'Accusative', 'Singular', 'θεός', 'god'),
  createNounQuestion('s1-q25', 'θεοί', 'Nominative', 'Plural', 'θεός', 'god'),
  createNounQuestion('s1-q26', 'θεῶν', 'Genitive', 'Plural', 'θεός', 'god'),
  createNounQuestion('s1-q27', 'θεοῖς', 'Dative', 'Plural', 'θεός', 'god'),
  createNounQuestion('s1-q28', 'θεούς', 'Accusative', 'Plural', 'θεός', 'god'),
];

// =============================================================================
// SECTION 2: Feminine Nouns (24 questions)
// 1st Decl Eta (ἀρχή) + 1st Decl Alpha Pure (καρδία) + 1st Decl Alpha Impure (δόξα)
// =============================================================================

const section2QuestionsBase: MCQQuestion[] = [
  // 1st Declension Eta Stem - ἀρχή (8 forms, excluding duplicate voc/nom)
  createNounQuestion('s2-q1', 'ἀρχή', 'Nominative', 'Singular', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q2', 'ἀρχῆς', 'Genitive', 'Singular', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q3', 'ἀρχῇ', 'Dative', 'Singular', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q4', 'ἀρχήν', 'Accusative', 'Singular', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q5', 'ἀρχαί', 'Nominative', 'Plural', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q6', 'ἀρχῶν', 'Genitive', 'Plural', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q7', 'ἀρχαῖς', 'Dative', 'Plural', 'ἀρχή', 'beginning'),
  createNounQuestion('s2-q8', 'ἀρχάς', 'Accusative', 'Plural', 'ἀρχή', 'beginning'),

  // 1st Declension Alpha Pure - καρδία (8 forms)
  createNounQuestion('s2-q9', 'καρδία', 'Nominative', 'Singular', 'καρδία', 'heart'),
  createNounQuestion('s2-q10', 'καρδίας', 'Genitive', 'Singular', 'καρδία', 'heart'),
  createNounQuestion('s2-q11', 'καρδίᾳ', 'Dative', 'Singular', 'καρδία', 'heart'),
  createNounQuestion('s2-q12', 'καρδίαν', 'Accusative', 'Singular', 'καρδία', 'heart'),
  createNounQuestion('s2-q13', 'καρδίαι', 'Nominative', 'Plural', 'καρδία', 'heart'),
  createNounQuestion('s2-q14', 'καρδιῶν', 'Genitive', 'Plural', 'καρδία', 'heart'),
  createNounQuestion('s2-q15', 'καρδίαις', 'Dative', 'Plural', 'καρδία', 'heart'),
  createNounQuestion('s2-q16', 'καρδίας', 'Accusative', 'Plural', 'καρδία', 'heart'),

  // 1st Declension Alpha Impure - δόξα (8 forms)
  createNounQuestion('s2-q17', 'δόξα', 'Nominative', 'Singular', 'δόξα', 'glory'),
  createNounQuestion('s2-q18', 'δόξης', 'Genitive', 'Singular', 'δόξα', 'glory'),
  createNounQuestion('s2-q19', 'δόξῃ', 'Dative', 'Singular', 'δόξα', 'glory'),
  createNounQuestion('s2-q20', 'δόξαν', 'Accusative', 'Singular', 'δόξα', 'glory'),
  createNounQuestion('s2-q21', 'δόξαι', 'Nominative', 'Plural', 'δόξα', 'glory'),
  createNounQuestion('s2-q22', 'δοξῶν', 'Genitive', 'Plural', 'δόξα', 'glory'),
  createNounQuestion('s2-q23', 'δόξαις', 'Dative', 'Plural', 'δόξα', 'glory'),
  createNounQuestion('s2-q24', 'δόξας', 'Accusative', 'Plural', 'δόξα', 'glory'),
];

// =============================================================================
// SECTION 3: Neuter Nouns (24 questions)
// 2nd Declension Neuter (ἔργον, τέκνον, εὐαγγέλιον)
// =============================================================================

const section3QuestionsBase: MCQQuestion[] = [
  // 2nd Declension Neuter - ἔργον (8 forms)
  createNounQuestion('s3-q1', 'ἔργον', 'Nominative', 'Singular', 'ἔργον', 'work'),
  createNounQuestion('s3-q2', 'ἔργου', 'Genitive', 'Singular', 'ἔργον', 'work'),
  createNounQuestion('s3-q3', 'ἔργῳ', 'Dative', 'Singular', 'ἔργον', 'work'),
  createNounQuestion('s3-q4', 'ἔργον', 'Accusative', 'Singular', 'ἔργον', 'work'),
  createNounQuestion('s3-q5', 'ἔργα', 'Nominative', 'Plural', 'ἔργον', 'work'),
  createNounQuestion('s3-q6', 'ἔργων', 'Genitive', 'Plural', 'ἔργον', 'work'),
  createNounQuestion('s3-q7', 'ἔργοις', 'Dative', 'Plural', 'ἔργον', 'work'),
  createNounQuestion('s3-q8', 'ἔργα', 'Accusative', 'Plural', 'ἔργον', 'work'),

  // 2nd Declension Neuter - τέκνον (8 forms)
  createNounQuestion('s3-q11', 'τέκνον', 'Nominative', 'Singular', 'τέκνον', 'child'),
  createNounQuestion('s3-q12', 'τέκνου', 'Genitive', 'Singular', 'τέκνον', 'child'),
  createNounQuestion('s3-q13', 'τέκνῳ', 'Dative', 'Singular', 'τέκνον', 'child'),
  createNounQuestion('s3-q14', 'τέκνον', 'Accusative', 'Singular', 'τέκνον', 'child'),
  createNounQuestion('s3-q15', 'τέκνα', 'Nominative', 'Plural', 'τέκνον', 'child'),
  createNounQuestion('s3-q16', 'τέκνων', 'Genitive', 'Plural', 'τέκνον', 'child'),
  createNounQuestion('s3-q17', 'τέκνοις', 'Dative', 'Plural', 'τέκνον', 'child'),
  createNounQuestion('s3-q18', 'τέκνα', 'Accusative', 'Plural', 'τέκνον', 'child'),

  // 2nd Declension Neuter - εὐαγγέλιον (8 forms)
  createNounQuestion('s3-q21', 'εὐαγγέλιον', 'Nominative', 'Singular', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q22', 'εὐαγγελίου', 'Genitive', 'Singular', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q23', 'εὐαγγελίῳ', 'Dative', 'Singular', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q24', 'εὐαγγέλιον', 'Accusative', 'Singular', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q25', 'εὐαγγέλια', 'Nominative', 'Plural', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q26', 'εὐαγγελίων', 'Genitive', 'Plural', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q27', 'εὐαγγελίοις', 'Dative', 'Plural', 'εὐαγγέλιον', 'gospel'),
  createNounQuestion('s3-q28', 'εὐαγγέλια', 'Accusative', 'Plural', 'εὐαγγέλιον', 'gospel'),
];

// =============================================================================
// SECTION 4: Personal Pronouns (24 questions)
// 3rd Person αὐτός - all 24 forms (3 genders × 4 cases × 2 numbers)
// =============================================================================

const section4QuestionsBase: MCQQuestion[] = [
  // Masculine (8 forms) - thirdPersonOnly=true since αὐτός is exclusively 3rd person
  createPronounQuestion('s4-q1', 'αὐτός', '3rd Person', 'Nominative', 'Singular', 'Masculine', true),
  createPronounQuestion('s4-q2', 'αὐτοῦ', '3rd Person', 'Genitive', 'Singular', 'Masculine', true),
  createPronounQuestion('s4-q3', 'αὐτῷ', '3rd Person', 'Dative', 'Singular', 'Masculine', true),
  createPronounQuestion('s4-q4', 'αὐτόν', '3rd Person', 'Accusative', 'Singular', 'Masculine', true),
  createPronounQuestion('s4-q5', 'αὐτοί', '3rd Person', 'Nominative', 'Plural', 'Masculine', true),
  createPronounQuestion('s4-q6', 'αὐτῶν', '3rd Person', 'Genitive', 'Plural', 'Masculine', true),
  createPronounQuestion('s4-q7', 'αὐτοῖς', '3rd Person', 'Dative', 'Plural', 'Masculine', true),
  createPronounQuestion('s4-q8', 'αὐτούς', '3rd Person', 'Accusative', 'Plural', 'Masculine', true),

  // Feminine (8 forms)
  createPronounQuestion('s4-q9', 'αὐτή', '3rd Person', 'Nominative', 'Singular', 'Feminine', true),
  createPronounQuestion('s4-q10', 'αὐτῆς', '3rd Person', 'Genitive', 'Singular', 'Feminine', true),
  createPronounQuestion('s4-q11', 'αὐτῇ', '3rd Person', 'Dative', 'Singular', 'Feminine', true),
  createPronounQuestion('s4-q12', 'αὐτήν', '3rd Person', 'Accusative', 'Singular', 'Feminine', true),
  createPronounQuestion('s4-q13', 'αὐταί', '3rd Person', 'Nominative', 'Plural', 'Feminine', true),
  createPronounQuestion('s4-q14', 'αὐτῶν', '3rd Person', 'Genitive', 'Plural', 'Feminine', true),
  createPronounQuestion('s4-q15', 'αὐταῖς', '3rd Person', 'Dative', 'Plural', 'Feminine', true),
  createPronounQuestion('s4-q16', 'αὐτάς', '3rd Person', 'Accusative', 'Plural', 'Feminine', true),

  // Neuter (8 forms)
  createPronounQuestion('s4-q17', 'αὐτό', '3rd Person', 'Nominative', 'Singular', 'Neuter', true),
  createPronounQuestion('s4-q18', 'αὐτοῦ', '3rd Person', 'Genitive', 'Singular', 'Neuter', true),
  createPronounQuestion('s4-q19', 'αὐτῷ', '3rd Person', 'Dative', 'Singular', 'Neuter', true),
  createPronounQuestion('s4-q20', 'αὐτό', '3rd Person', 'Accusative', 'Singular', 'Neuter', true),
  createPronounQuestion('s4-q21', 'αὐτά', '3rd Person', 'Nominative', 'Plural', 'Neuter', true),
  createPronounQuestion('s4-q22', 'αὐτῶν', '3rd Person', 'Genitive', 'Plural', 'Neuter', true),
  createPronounQuestion('s4-q23', 'αὐτοῖς', '3rd Person', 'Dative', 'Plural', 'Neuter', true),
  createPronounQuestion('s4-q24', 'αὐτά', '3rd Person', 'Accusative', 'Plural', 'Neuter', true),
];

// =============================================================================
// SECTION 5: Prepositions (40 questions)
// Comprehensive coverage: 16 prepositions × meaning + usage + discrimination
// =============================================================================

const section5QuestionsBase: MCQQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PART A: Meaning Identification (16 questions) - "What does X mean?"
  // ═══════════════════════════════════════════════════════════════════════════

  // Core prepositions (10)
  {
    id: 's5-q1',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ἐν',
    options: shuffleArray(['in, on, among', 'from, out of', 'into, to, for', 'through, on account of']),
    correctIndex: 0,
    explanation: 'ἐν means "in, on, among" - used for location or sphere.',
    category: 'meaning',
  },
  {
    id: 's5-q2',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'εἰς',
    options: shuffleArray(['into, to, for', 'in, on, among', 'from, away from', 'with, after']),
    correctIndex: 0,
    explanation: 'εἰς means "into, to, for" - indicates motion toward.',
    category: 'meaning',
  },
  {
    id: 's5-q3',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ἐκ / ἐξ',
    options: shuffleArray(['from, out of', 'into, to', 'on, upon', 'with']),
    correctIndex: 0,
    explanation: 'ἐκ/ἐξ means "from, out of" - indicates source or origin.',
    category: 'meaning',
  },
  {
    id: 's5-q4',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ἀπό',
    options: shuffleArray(['from, away from', 'to, toward', 'in, among', 'through']),
    correctIndex: 0,
    explanation: 'ἀπό means "from, away from" - indicates separation.',
    category: 'meaning',
  },
  {
    id: 's5-q5',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'πρός',
    options: shuffleArray(['to, toward, with', 'from, away', 'in, on', 'under']),
    correctIndex: 0,
    explanation: 'πρός means "to, toward, with" - indicates direction or relation.',
    category: 'meaning',
  },
  {
    id: 's5-q6',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'διά',
    options: shuffleArray(['through, on account of', 'around, about', 'above, over', 'before']),
    correctIndex: 0,
    explanation: 'διά means "through" or "on account of" depending on context.',
    category: 'meaning',
  },
  {
    id: 's5-q7',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'μετά',
    options: shuffleArray(['with, after', 'before, in front of', 'under', 'against']),
    correctIndex: 0,
    explanation: 'μετά means "with" or "after" depending on context.',
    category: 'meaning',
  },
  {
    id: 's5-q8',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ἐπί',
    options: shuffleArray(['on, upon, over', 'under, below', 'beside', 'without']),
    correctIndex: 0,
    explanation: 'ἐπί means "on, upon, at, over" - very versatile preposition.',
    category: 'meaning',
  },
  {
    id: 's5-q9',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ὑπό',
    options: shuffleArray(['by, under', 'over, above', 'beside', 'around']),
    correctIndex: 0,
    explanation: 'ὑπό means "by" (agency) or "under."',
    category: 'meaning',
  },
  {
    id: 's5-q10',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'σύν',
    options: shuffleArray(['with', 'without', 'against', 'before']),
    correctIndex: 0,
    explanation: 'σύν means "with" - indicates accompaniment or association.',
    category: 'meaning',
  },

  // Additional prepositions (6)
  {
    id: 's5-q11',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'παρά',
    options: shuffleArray(['beside, from, contrary to', 'through, by means of', 'under, below', 'over, above']),
    correctIndex: 0,
    explanation: 'παρά means "beside, from (the side of), alongside, contrary to."',
    category: 'meaning',
  },
  {
    id: 's5-q12',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'περί',
    options: shuffleArray(['about, concerning, around', 'through, on account of', 'under, by', 'into, to']),
    correctIndex: 0,
    explanation: 'περί means "about, concerning, around."',
    category: 'meaning',
  },
  {
    id: 's5-q13',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'κατά',
    options: shuffleArray(['down, according to, against', 'up, above, over', 'beside, near', 'with, together']),
    correctIndex: 0,
    explanation: 'κατά means "down, according to, against, throughout."',
    category: 'meaning',
  },
  {
    id: 's5-q14',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ὑπέρ',
    options: shuffleArray(['over, above, on behalf of', 'under, below, by', 'beside, near', 'against, opposite']),
    correctIndex: 0,
    explanation: 'ὑπέρ means "over, above, on behalf of, for."',
    category: 'meaning',
  },
  {
    id: 's5-q15',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'ἀντί',
    options: shuffleArray(['instead of, in place of', 'with, together', 'after, behind', 'beside, near']),
    correctIndex: 0,
    explanation: 'ἀντί means "instead of, in place of, for."',
    category: 'meaning',
  },
  {
    id: 's5-q16',
    type: 'mcq',
    question: 'What does this preposition mean?',
    greek: 'πρό',
    options: shuffleArray(['before, in front of', 'after, behind', 'beside, near', 'under, below']),
    correctIndex: 0,
    explanation: 'πρό means "before, in front of" (in time or place).',
    category: 'meaning',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PART B: Fill-in-the-Blank (16 questions) - "Which preposition means X?"
  // ═══════════════════════════════════════════════════════════════════════════

  // Core prepositions (10)
  {
    id: 's5-q17',
    type: 'mcq',
    question: 'Which preposition means "in" or "among"?',
    options: shuffleArray(['ἐν', 'εἰς', 'ἐκ', 'ἀπό']),
    correctIndex: 0,
    explanation: 'ἐν means "in, on, among" - used for location.',
    category: 'usage',
  },
  {
    id: 's5-q18',
    type: 'mcq',
    question: 'Which preposition indicates motion "into" something?',
    options: shuffleArray(['εἰς', 'ἐν', 'ἐκ', 'πρός']),
    correctIndex: 0,
    explanation: 'εἰς means "into, to, for" - indicates motion toward.',
    category: 'usage',
  },
  {
    id: 's5-q19',
    type: 'mcq',
    question: 'Which preposition means "out of" or "from" (source)?',
    options: shuffleArray(['ἐκ / ἐξ', 'ἀπό', 'διά', 'ὑπό']),
    correctIndex: 0,
    explanation: 'ἐκ/ἐξ means "from, out of" - indicates source or origin.',
    category: 'usage',
  },
  {
    id: 's5-q20',
    type: 'mcq',
    question: 'Which preposition means "away from" (separation)?',
    options: shuffleArray(['ἀπό', 'ἐκ', 'πρός', 'μετά']),
    correctIndex: 0,
    explanation: 'ἀπό means "from, away from" - indicates separation.',
    category: 'usage',
  },
  {
    id: 's5-q21',
    type: 'mcq',
    question: 'Which preposition means "toward" or "to" (direction)?',
    options: shuffleArray(['πρός', 'ἀπό', 'ἐν', 'σύν']),
    correctIndex: 0,
    explanation: 'πρός means "to, toward, with" - indicates direction.',
    category: 'usage',
  },
  {
    id: 's5-q22',
    type: 'mcq',
    question: 'Which preposition means "through" or "on account of"?',
    options: shuffleArray(['διά', 'μετά', 'ἐπί', 'ὑπό']),
    correctIndex: 0,
    explanation: 'διά means "through" or "on account of" depending on context.',
    category: 'usage',
  },
  {
    id: 's5-q23',
    type: 'mcq',
    question: 'Which preposition can mean both "with" and "after"?',
    options: shuffleArray(['μετά', 'σύν', 'πρός', 'ἐπί']),
    correctIndex: 0,
    explanation: 'μετά means "with" or "after" depending on context.',
    category: 'usage',
  },
  {
    id: 's5-q24',
    type: 'mcq',
    question: 'Which preposition means "on," "upon," or "over"?',
    options: shuffleArray(['ἐπί', 'ὑπό', 'διά', 'μετά']),
    correctIndex: 0,
    explanation: 'ἐπί means "on, upon, over."',
    category: 'usage',
  },
  {
    id: 's5-q25',
    type: 'mcq',
    question: 'Which preposition indicates agency ("by") or means "under"?',
    options: shuffleArray(['ὑπό', 'ἐπί', 'διά', 'σύν']),
    correctIndex: 0,
    explanation: 'ὑπό means "by" (agency) or "under."',
    category: 'usage',
  },
  {
    id: 's5-q26',
    type: 'mcq',
    question: 'Which preposition means "with" (accompaniment)?',
    options: shuffleArray(['σύν', 'μετά', 'πρός', 'ἐπί']),
    correctIndex: 0,
    explanation: 'σύν means "with" - indicates accompaniment.',
    category: 'usage',
  },

  // Additional prepositions (6)
  {
    id: 's5-q27',
    type: 'mcq',
    question: 'Which preposition means "beside" or "from the side of"?',
    options: shuffleArray(['παρά', 'περί', 'πρός', 'πρό']),
    correctIndex: 0,
    explanation: 'παρά means "beside, from (the side of), alongside."',
    category: 'usage',
  },
  {
    id: 's5-q28',
    type: 'mcq',
    question: 'Which preposition means "about" or "concerning"?',
    options: shuffleArray(['περί', 'παρά', 'διά', 'κατά']),
    correctIndex: 0,
    explanation: 'περί means "about, concerning, around."',
    category: 'usage',
  },
  {
    id: 's5-q29',
    type: 'mcq',
    question: 'Which preposition means "according to" or "down"?',
    options: shuffleArray(['κατά', 'ἀνά', 'μετά', 'ἐπί']),
    correctIndex: 0,
    explanation: 'κατά means "down, according to, against, throughout."',
    category: 'usage',
  },
  {
    id: 's5-q30',
    type: 'mcq',
    question: 'Which preposition means "on behalf of" or "over"?',
    options: shuffleArray(['ὑπέρ', 'ὑπό', 'ἐπί', 'περί']),
    correctIndex: 0,
    explanation: 'ὑπέρ means "over, above, on behalf of."',
    category: 'usage',
  },
  {
    id: 's5-q31',
    type: 'mcq',
    question: 'Which preposition means "instead of" or "in place of"?',
    options: shuffleArray(['ἀντί', 'μετά', 'πρό', 'σύν']),
    correctIndex: 0,
    explanation: 'ἀντί means "instead of, in place of."',
    category: 'usage',
  },
  {
    id: 's5-q32',
    type: 'mcq',
    question: 'Which preposition means "before" (in time or place)?',
    options: shuffleArray(['πρό', 'μετά', 'πρός', 'παρά']),
    correctIndex: 0,
    explanation: 'πρό means "before, in front of."',
    category: 'usage',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PART C: NT Fill-in-the-Blank (8 questions) - Real verses with preposition blanks
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 's5-q33',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: '_____ ἀρχῇ ἦν ὁ λόγος',
    vocabHelp: 'ἀρχή = beginning; ἦν = was; λόγος = word',
    options: shuffleArray(['ἐν', 'εἰς', 'ἐκ', 'ἀπό']),
    correctIndex: 0,
    explanation: 'John 1:1 — ἐν ἀρχῇ (in the beginning). ἐν indicates sphere/location, not motion.',
    category: 'nt-context',
  },
  {
    id: 's5-q34',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'πᾶς ὁ πιστεύων _____ αὐτόν',
    vocabHelp: 'πᾶς = everyone; πιστεύων = believing; αὐτόν = him',
    options: shuffleArray(['εἰς', 'ἐν', 'πρός', 'μετά']),
    correctIndex: 0,
    explanation: 'John 3:16 — πιστεύων εἰς αὐτόν (believing into him). εἰς shows the direction of faith.',
    category: 'nt-context',
  },
  {
    id: 's5-q35',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'δικαιούμενοι _____ τῆς ἀπολυτρώσεως',
    vocabHelp: 'δικαιούμενοι = being justified; ἀπολύτρωσις = redemption',
    options: shuffleArray(['διά', 'ἐκ', 'ὑπό', 'ἀπό']),
    correctIndex: 0,
    explanation: 'Romans 3:24 — διὰ τῆς ἀπολυτρώσεως (through the redemption). διά + genitive = means/agency.',
    category: 'nt-context',
  },
  {
    id: 's5-q36',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'φωνὴ _____ τῶν οὐρανῶν',
    vocabHelp: 'φωνή = voice; οὐρανός = heaven',
    options: shuffleArray(['ἐκ', 'ἀπό', 'ἐν', 'διά']),
    correctIndex: 0,
    explanation: 'Matthew 3:17 — φωνὴ ἐκ τῶν οὐρανῶν (a voice out of the heavens). ἐκ indicates source/origin.',
    category: 'nt-context',
  },
  {
    id: 's5-q37',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'ἦλθεν Ἰησοῦς _____ Ναζαρέτ',
    vocabHelp: 'ἦλθεν = came; Ναζαρέτ = Nazareth',
    options: shuffleArray(['ἀπό', 'ἐκ', 'παρά', 'διά']),
    correctIndex: 0,
    explanation: 'Mark 1:9 — ἀπὸ Ναζαρέτ (from Nazareth). ἀπό indicates separation/departure from a place.',
    category: 'nt-context',
  },
  {
    id: 's5-q38',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'ὁ λόγος σὰρξ ἐγένετο καὶ ἐσκήνωσεν _____ ἡμῶν',
    vocabHelp: 'σάρξ = flesh; ἐγένετο = became; ἐσκήνωσεν = dwelt/tabernacled',
    options: shuffleArray(['μετά', 'σύν', 'ἐν', 'παρά']),
    correctIndex: 0,
    explanation: "John 1:14 — ἐσκήνωσεν μεθ' ἡμῶν (dwelt with us). μετά + genitive = accompaniment.",
    category: 'nt-context',
  },
  {
    id: 's5-q39',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: "εἰ ὁ θεὸς _____ ἡμῶν, τίς καθ' ἡμῶν;",
    vocabHelp: 'εἰ = if; θεός = God; τίς = who?; καθ\' = against',
    options: shuffleArray(['ὑπέρ', 'ὑπό', 'περί', 'μετά']),
    correctIndex: 0,
    explanation: 'Romans 8:31 — ὁ θεὸς ὑπὲρ ἡμῶν (God is for us). ὑπέρ = on behalf of, for.',
    category: 'nt-context',
  },
  {
    id: 's5-q40',
    type: 'mcq',
    question: 'Fill in the blank with the correct preposition:',
    greek: 'οὐκ _____ ἄρτῳ μόνῳ ζήσεται ὁ ἄνθρωπος',
    vocabHelp: 'ἄρτος = bread; μόνος = alone; ζήσεται = will live; ἄνθρωπος = man',
    options: shuffleArray(['ἐπί', 'ἐν', 'διά', 'μετά']),
    correctIndex: 0,
    explanation: "Matthew 4:4 — ἐπ' ἄρτῳ μόνῳ (upon bread alone). ἐπί + dative = basis/upon.",
    category: 'nt-context',
  },
];

// Fix the correctIndex for section 5 questions (since shuffleArray changes order)
const fixPrepositionQuestions = (questions: MCQQuestion[]): MCQQuestion[] => {
  return questions.map(q => {
    // For questions that have a known correct answer pattern
    const correctAnswers: Record<string, string> = {
      // Part A: Meaning identification (16 questions)
      's5-q1': 'in, on, among',
      's5-q2': 'into, to, for',
      's5-q3': 'from, out of',
      's5-q4': 'from, away from',
      's5-q5': 'to, toward, with',
      's5-q6': 'through, on account of',
      's5-q7': 'with, after',
      's5-q8': 'on, upon, over',
      's5-q9': 'by, under',
      's5-q10': 'with',
      's5-q11': 'beside, from, contrary to',
      's5-q12': 'about, concerning, around',
      's5-q13': 'down, according to, against',
      's5-q14': 'over, above, on behalf of',
      's5-q15': 'instead of, in place of',
      's5-q16': 'before, in front of',
      // Part B: Fill-in-the-blank (16 questions)
      's5-q17': 'ἐν',
      's5-q18': 'εἰς',
      's5-q19': 'ἐκ / ἐξ',
      's5-q20': 'ἀπό',
      's5-q21': 'πρός',
      's5-q22': 'διά',
      's5-q23': 'μετά',
      's5-q24': 'ἐπί',
      's5-q25': 'ὑπό',
      's5-q26': 'σύν',
      's5-q27': 'παρά',
      's5-q28': 'περί',
      's5-q29': 'κατά',
      's5-q30': 'ὑπέρ',
      's5-q31': 'ἀντί',
      's5-q32': 'πρό',
      // Part C: NT fill-in-the-blank questions (8 questions)
      's5-q33': 'ἐν',     // John 1:1 - ἐν ἀρχῇ
      's5-q34': 'εἰς',    // John 3:16 - πιστεύων εἰς
      's5-q35': 'διά',    // Romans 3:24 - διὰ τῆς ἀπολυτρώσεως
      's5-q36': 'ἐκ',     // Matthew 3:17 - ἐκ τῶν οὐρανῶν
      's5-q37': 'ἀπό',    // Mark 1:9 - ἀπὸ Ναζαρέτ
      's5-q38': 'μετά',   // John 1:14 - μεθ' ἡμῶν
      's5-q39': 'ὑπέρ',   // Romans 8:31 - ὑπὲρ ἡμῶν
      's5-q40': 'ἐπί',    // Matthew 4:4 - ἐπ' ἄρτῳ
    };

    const correctAnswer = correctAnswers[q.id];
    if (correctAnswer) {
      const correctIndex = q.options.findIndex(opt => opt === correctAnswer);
      return { ...q, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
    }
    return q;
  });
};

// Export the questions with randomized order
export const section1Questions: MCQQuestion[] = shuffleArray(section1QuestionsBase);
export const section2Questions: MCQQuestion[] = shuffleArray(section2QuestionsBase);
export const section3Questions: MCQQuestion[] = shuffleArray(section3QuestionsBase);
export const section4Questions: MCQQuestion[] = shuffleArray(section4QuestionsBase);
export const section5Questions: MCQQuestion[] = fixPrepositionQuestions(shuffleArray(section5QuestionsBase));

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

export function getQuestionsForHW2Section(sectionId: HW2SectionId): HomeworkQuestion[] {
  switch (sectionId) {
    case 1:
      return section1Questions;
    case 2:
      return section2Questions;
    case 3:
      return section3Questions;
    case 4:
      return section4Questions;
    case 5:
      return section5Questions;
    default:
      return [];
  }
}

export function getHW2QuestionById(sectionId: HW2SectionId, questionId: string): HomeworkQuestion | undefined {
  const questions = getQuestionsForHW2Section(sectionId);
  return questions.find(q => q.id === questionId);
}

export function getHW2TotalQuestions(): number {
  return (
    section1Questions.length +
    section2Questions.length +
    section3Questions.length +
    section4Questions.length +
    section5Questions.length
  );
}
