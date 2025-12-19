import type {
  TransliterationQuestion,
  VerseQuestion,
  MCQQuestion,
} from '@/types/homework';

// =============================================================================
// SECTION 1: 10 Most Common NT Words (Transliteration)
// =============================================================================

export const section1Questions: TransliterationQuestion[] = [
  {
    id: 's1-q1',
    type: 'transliteration',
    greek: 'ὁ',
    answer: 'ho',
    variants: ['o'],
    gloss: 'the (masculine nominative singular)',
  },
  {
    id: 's1-q2',
    type: 'transliteration',
    greek: 'καί',
    answer: 'kai',
    variants: [],
    gloss: 'and, also, even',
  },
  {
    id: 's1-q3',
    type: 'transliteration',
    greek: 'αὐτός',
    answer: 'autos',
    variants: ['αutos'],
    gloss: 'he, she, it, self',
  },
  {
    id: 's1-q4',
    type: 'transliteration',
    greek: 'δέ',
    answer: 'de',
    variants: [],
    gloss: 'but, and, now',
  },
  {
    id: 's1-q5',
    type: 'transliteration',
    greek: 'ἐν',
    answer: 'en',
    variants: [],
    gloss: 'in, on, among',
  },
  {
    id: 's1-q6',
    type: 'transliteration',
    greek: 'εἰμί',
    answer: 'eimi',
    variants: [],
    gloss: 'I am, to be',
  },
  {
    id: 's1-q7',
    type: 'transliteration',
    greek: 'λέγω',
    answer: 'lego',
    variants: ['legoo'],
    gloss: 'I say, I speak',
  },
  {
    id: 's1-q8',
    type: 'transliteration',
    greek: 'οὐ',
    answer: 'ou',
    variants: ['u'],
    gloss: 'not, no',
  },
  {
    id: 's1-q9',
    type: 'transliteration',
    greek: 'ὅς',
    answer: 'hos',
    variants: ['os'],
    gloss: 'who, which, what',
  },
  {
    id: 's1-q10',
    type: 'transliteration',
    greek: 'θεός',
    answer: 'theos',
    variants: [],
    gloss: 'God, god',
  },
];

// =============================================================================
// SECTION 2: 5 Verse Transliterations
// =============================================================================

export const section2Questions: VerseQuestion[] = [
  {
    id: 's2-q1',
    type: 'verse',
    reference: 'John 1:1a',
    greek: 'Ἐν ἀρχῇ ἦν ὁ λόγος',
    answer: 'en arche en ho logos',
    variants: [
      'en archē ēn ho logos',
      'en arche hn ho logos',
    ],
  },
  {
    id: 's2-q2',
    type: 'verse',
    reference: 'Matthew 5:3a',
    greek: 'Μακάριοι οἱ πτωχοί',
    answer: 'makarioi hoi ptochoi',
    variants: [
      'makarioi oi ptochoi',
    ],
  },
  {
    id: 's2-q3',
    type: 'verse',
    reference: 'John 3:16a',
    greek: 'οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον',
    answer: 'houtos gar egapesen ho theos ton kosmon',
    variants: [
      'houtos gar ēgapēsen ho theos ton kosmon',
      'outos gar egapesen ho theos ton kosmon',
    ],
  },
  {
    id: 's2-q4',
    type: 'verse',
    reference: 'Matthew 6:9b',
    greek: 'Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς',
    answer: 'pater hemon ho en tois ouranois',
    variants: [
      'pater hēmōn ho en tois ouranois',
    ],
  },
  {
    id: 's2-q5',
    type: 'verse',
    reference: 'John 14:6a',
    greek: 'ἐγώ εἰμι ἡ ὁδός',
    answer: 'ego eimi he hodos',
    variants: [
      'ego eimi hē hodos',
      'egoo eimi he hodos',
    ],
  },
];

// =============================================================================
// SECTION 3: Grammar Terms MCQ (10 questions)
// =============================================================================

export const section3Questions: MCQQuestion[] = [
  {
    id: 's3-q1',
    type: 'mcq',
    question: 'What is a noun?',
    options: [
      'A word that names a person, place, thing, or idea',
      'A word that describes an action',
      'A word that modifies a verb',
      'A word that connects clauses',
    ],
    correctIndex: 0,
    explanation: 'A noun is a naming word. Examples: "God" (θεός), "word" (λόγος), "love" (ἀγάπη).',
    category: 'noun',
  },
  {
    id: 's3-q2',
    type: 'mcq',
    question: 'What is a verb?',
    options: [
      'A word that replaces a noun',
      'A word that expresses action, occurrence, or state of being',
      'A word that shows location',
      'A word that names something',
    ],
    correctIndex: 1,
    explanation: 'Verbs express actions or states. Examples: "I say" (λέγω), "I am" (εἰμί), "I love" (ἀγαπάω).',
    category: 'verb',
  },
  {
    id: 's3-q3',
    type: 'mcq',
    question: 'What is an adjective?',
    options: [
      'A word that connects sentences',
      'A word that replaces a noun',
      'A word that describes or modifies a noun',
      'A word that expresses action',
    ],
    correctIndex: 2,
    explanation: 'Adjectives describe nouns. Examples: "good" (ἀγαθός), "holy" (ἅγιος), "great" (μέγας).',
    category: 'adjective',
  },
  {
    id: 's3-q4',
    type: 'mcq',
    question: 'What is an adverb?',
    options: [
      'A word that modifies a verb, adjective, or other adverb',
      'A word that names a person',
      'A word that shows possession',
      'A word that connects nouns',
    ],
    correctIndex: 0,
    explanation: 'Adverbs modify verbs, adjectives, or other adverbs. Examples: "truly" (ἀληθῶς), "now" (νῦν).',
    category: 'adverb',
  },
  {
    id: 's3-q5',
    type: 'mcq',
    question: 'What is a pronoun?',
    options: [
      'A word that describes an action',
      'A word that shows time',
      'A word that replaces a noun',
      'A word that expresses emotion',
    ],
    correctIndex: 2,
    explanation: 'Pronouns replace nouns to avoid repetition. Examples: "I" (ἐγώ), "you" (σύ), "he" (αὐτός).',
    category: 'pronoun',
  },
  {
    id: 's3-q6',
    type: 'mcq',
    question: 'What is an article?',
    options: [
      'A word that shows direction',
      'A small word that indicates definiteness (like "the")',
      'A word that expresses strong emotion',
      'A word that ends a sentence',
    ],
    correctIndex: 1,
    explanation: 'Greek has a definite article (ὁ, ἡ, τό = "the") but no indefinite article ("a/an").',
    category: 'article',
  },
  {
    id: 's3-q7',
    type: 'mcq',
    question: 'What is a preposition?',
    options: [
      'A word that describes a noun',
      'A word that shows relationship between words (e.g., in, on, with)',
      'A word that replaces a verb',
      'A word that expresses a question',
    ],
    correctIndex: 1,
    explanation: 'Prepositions show relationships. Examples: "in" (ἐν), "from" (ἀπό), "with" (σύν).',
    category: 'preposition',
  },
  {
    id: 's3-q8',
    type: 'mcq',
    question: 'What is a conjunction?',
    options: [
      'A word that ends a sentence',
      'A word that describes a verb',
      'A word that connects words, phrases, or clauses',
      'A word that shows ownership',
    ],
    correctIndex: 2,
    explanation: 'Conjunctions connect elements. Examples: "and" (καί), "but" (ἀλλά), "for" (γάρ).',
    category: 'conjunction',
  },
  {
    id: 's3-q9',
    type: 'mcq',
    question: 'What is a participle?',
    options: [
      'A verb form that functions as an adjective (verbal adjective)',
      'A word that expresses ownership',
      'A word that asks questions',
      'A word that shows time',
    ],
    correctIndex: 0,
    explanation: 'Participles are verbal adjectives, often translated with "-ing" or "-ed" in English. Example: "saying" (λέγων).',
    category: 'participle',
  },
  {
    id: 's3-q10',
    type: 'mcq',
    question: 'What is a particle?',
    options: [
      'A large word with many syllables',
      'A word that only appears at the end of sentences',
      'A small invariable word that adds nuance (e.g., "not", "indeed")',
      'A word that replaces an adjective',
    ],
    correctIndex: 2,
    explanation: 'Particles are small words that add meaning. Examples: "not" (οὐ), "indeed" (μέν), "therefore" (οὖν).',
    category: 'particle',
  },
];

// =============================================================================
// SECTION 4: Greek Cases MCQ (5 questions)
// =============================================================================

export const section4Questions: MCQQuestion[] = [
  {
    id: 's4-q1',
    type: 'mcq',
    question: 'What is the function of the NOMINATIVE case?',
    options: [
      'Shows possession or source',
      'Indicates the subject of the verb',
      'Marks the direct object',
      'Used for direct address',
    ],
    correctIndex: 1,
    explanation: 'The nominative case identifies the subject - who or what performs the action. Example: "ὁ θεός ἀγαπᾷ" (God loves).',
    category: 'nominative',
  },
  {
    id: 's4-q2',
    type: 'mcq',
    question: 'What is the function of the GENITIVE case?',
    options: [
      'Indicates the subject',
      'Used for direct address',
      'Shows possession, source, or separation (often translated "of")',
      'Marks the direct object',
    ],
    correctIndex: 2,
    explanation: 'The genitive shows possession, origin, or separation. Example: "υἱὸς τοῦ θεοῦ" (son of God).',
    category: 'genitive',
  },
  {
    id: 's4-q3',
    type: 'mcq',
    question: 'What is the function of the DATIVE case?',
    options: [
      'Marks the direct object',
      'Indicates the indirect object (often translated "to" or "for")',
      'Shows the subject of the sentence',
      'Indicates possession',
    ],
    correctIndex: 1,
    explanation: 'The dative marks the indirect object - to whom or for whom. Example: "λέγει αὐτῷ" (he says to him).',
    category: 'dative',
  },
  {
    id: 's4-q4',
    type: 'mcq',
    question: 'What is the function of the ACCUSATIVE case?',
    options: [
      'Shows the indirect object',
      'Indicates possession',
      'Marks the direct object of the verb',
      'Used for calling someone by name',
    ],
    correctIndex: 2,
    explanation: 'The accusative marks the direct object - what receives the action. Example: "ἀγαπᾷ τὸν κόσμον" (loves the world).',
    category: 'accusative',
  },
  {
    id: 's4-q5',
    type: 'mcq',
    question: 'What is the function of the VOCATIVE case?',
    options: [
      'Marks the direct object',
      'Used for direct address (calling or speaking to someone)',
      'Shows possession',
      'Indicates the subject',
    ],
    correctIndex: 1,
    explanation: 'The vocative is used for direct address. Example: "Κύριε" (O Lord), "Πάτερ" (Father).',
    category: 'vocative',
  },
];

// =============================================================================
// SECTION 5: Article Paradigm MCQ (24 questions)
// Parse all forms of the Greek article
// =============================================================================

// Helper to create article parsing questions
const createArticleQuestion = (
  id: string,
  greek: string,
  caseStr: string,
  number: string,
  gender: string
): MCQQuestion => {
  const correctAnswer = `${caseStr} ${number} ${gender}`;

  // Generate plausible wrong options
  const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
  const numbers = ['Singular', 'Plural'];
  const genders = ['Masculine', 'Feminine', 'Neuter'];

  const wrongOptions: string[] = [];

  // Add options with one element changed
  for (const c of cases) {
    for (const n of numbers) {
      for (const g of genders) {
        const option = `${c} ${n} ${g}`;
        if (option !== correctAnswer && wrongOptions.length < 10) {
          wrongOptions.push(option);
        }
      }
    }
  }

  // Shuffle and take 3 wrong options
  const shuffled = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

  // Insert correct answer at random position
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `What is the case, number, and gender of this article form?`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${correctAnswer.toLowerCase()}.`,
    category: `${gender.toLowerCase()}-${number.toLowerCase()}`,
  };
};

export const section5Questions: MCQQuestion[] = [
  // Masculine Singular
  createArticleQuestion('s5-q1', 'ὁ', 'Nominative', 'Singular', 'Masculine'),
  createArticleQuestion('s5-q2', 'τοῦ', 'Genitive', 'Singular', 'Masculine'),
  createArticleQuestion('s5-q3', 'τῷ', 'Dative', 'Singular', 'Masculine'),
  createArticleQuestion('s5-q4', 'τόν', 'Accusative', 'Singular', 'Masculine'),

  // Masculine Plural
  createArticleQuestion('s5-q5', 'οἱ', 'Nominative', 'Plural', 'Masculine'),
  createArticleQuestion('s5-q6', 'τῶν', 'Genitive', 'Plural', 'Masculine'),
  createArticleQuestion('s5-q7', 'τοῖς', 'Dative', 'Plural', 'Masculine'),
  createArticleQuestion('s5-q8', 'τούς', 'Accusative', 'Plural', 'Masculine'),

  // Feminine Singular
  createArticleQuestion('s5-q9', 'ἡ', 'Nominative', 'Singular', 'Feminine'),
  createArticleQuestion('s5-q10', 'τῆς', 'Genitive', 'Singular', 'Feminine'),
  createArticleQuestion('s5-q11', 'τῇ', 'Dative', 'Singular', 'Feminine'),
  createArticleQuestion('s5-q12', 'τήν', 'Accusative', 'Singular', 'Feminine'),

  // Feminine Plural
  createArticleQuestion('s5-q13', 'αἱ', 'Nominative', 'Plural', 'Feminine'),
  createArticleQuestion('s5-q14', 'τῶν', 'Genitive', 'Plural', 'Feminine'),
  createArticleQuestion('s5-q15', 'ταῖς', 'Dative', 'Plural', 'Feminine'),
  createArticleQuestion('s5-q16', 'τάς', 'Accusative', 'Plural', 'Feminine'),

  // Neuter Singular
  createArticleQuestion('s5-q17', 'τό', 'Nominative', 'Singular', 'Neuter'),
  createArticleQuestion('s5-q18', 'τοῦ', 'Genitive', 'Singular', 'Neuter'),
  createArticleQuestion('s5-q19', 'τῷ', 'Dative', 'Singular', 'Neuter'),
  createArticleQuestion('s5-q20', 'τό', 'Accusative', 'Singular', 'Neuter'),

  // Neuter Plural
  createArticleQuestion('s5-q21', 'τά', 'Nominative', 'Plural', 'Neuter'),
  createArticleQuestion('s5-q22', 'τῶν', 'Genitive', 'Plural', 'Neuter'),
  createArticleQuestion('s5-q23', 'τοῖς', 'Dative', 'Plural', 'Neuter'),
  createArticleQuestion('s5-q24', 'τά', 'Accusative', 'Plural', 'Neuter'),
];

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

import type { SectionId, HomeworkQuestion } from '@/types/homework';

export function getQuestionsForSection(sectionId: SectionId): HomeworkQuestion[] {
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

export function getQuestionById(sectionId: SectionId, questionId: string): HomeworkQuestion | undefined {
  const questions = getQuestionsForSection(sectionId);
  return questions.find(q => q.id === questionId);
}

export function getTotalQuestions(): number {
  return (
    section1Questions.length +
    section2Questions.length +
    section3Questions.length +
    section4Questions.length +
    section5Questions.length
  );
}
