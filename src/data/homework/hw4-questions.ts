import type { MCQQuestion, TranslationQuestion, HomeworkQuestion, VerseWord } from '@/types/homework';

// HW4 Section ID type
export type HW4SectionId = 1 | 2 | 3 | 4 | 5 | 6;

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
// UTILITY: Create verb parsing question with randomized options
// =============================================================================
const createVerbQuestion = (
  id: string,
  greek: string,
  person: string,
  number: string,
  tense: string,
  voice: string,
  mood: string,
  lexicalForm: string,
  meaning: string
): MCQQuestion => {
  const correctAnswer = `${person} Person ${number}`;

  const persons = ['1st', '2nd', '3rd'];
  const numbers = ['Singular', 'Plural'];

  const wrongOptions: string[] = [];
  for (const p of persons) {
    for (const n of numbers) {
      const option = `${p} Person ${n}`;
      if (option !== correctAnswer) {
        wrongOptions.push(option);
      }
    }
  }

  const shuffled = shuffleArray(wrongOptions).slice(0, 3);
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `Parse this verb form:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${person.toLowerCase()} person ${number.toLowerCase()} ${tense.toLowerCase()} ${voice.toLowerCase()} ${mood.toLowerCase()} from ${lexicalForm} (${meaning}).`,
    category: `${tense}-${voice}-${mood}`,
  };
};

// =============================================================================
// UTILITY: Create participle parsing question with randomized options
// =============================================================================
const createParticipleQuestion = (
  id: string,
  greek: string,
  grammaticalCase: string,
  number: string,
  tense: string,
  voice: string,
  gender: string,
  lexicalForm: string,
  meaning: string
): MCQQuestion => {
  const correctAnswer = `${grammaticalCase} ${number}`;

  const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
  const numbers = ['Singular', 'Plural'];

  const wrongOptions: string[] = [];
  for (const c of cases) {
    for (const n of numbers) {
      const option = `${c} ${n}`;
      if (option !== correctAnswer) {
        wrongOptions.push(option);
      }
    }
  }

  const shuffled = shuffleArray(wrongOptions).slice(0, 3);
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `Parse this participle form (case and number):`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${tense.toLowerCase()} ${voice.toLowerCase()} ${gender.toLowerCase()} participle from ${lexicalForm} (${meaning}).`,
    category: `${tense}-${voice}-participle`,
  };
};

// =============================================================================
// UTILITY: Create pronoun parsing question with randomized options
// =============================================================================
const createPronounQuestion = (
  id: string,
  greek: string,
  person: string,
  grammaticalCase: string,
  number: string,
  lexicalForm: string
): MCQQuestion => {
  const correctAnswer = `${person} Person ${grammaticalCase} ${number}`;

  const persons = ['1st', '2nd'];
  const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
  const numbers = ['Singular', 'Plural'];

  const wrongOptions: string[] = [];
  for (const p of persons) {
    for (const c of cases) {
      for (const n of numbers) {
        const option = `${p} Person ${c} ${n}`;
        if (option !== correctAnswer) {
          wrongOptions.push(option);
        }
      }
    }
  }

  const shuffled = shuffleArray(wrongOptions).slice(0, 3);
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...shuffled];
  options.splice(correctIndex, 0, correctAnswer);

  return {
    id,
    type: 'mcq',
    question: `Parse this personal pronoun:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${person.toLowerCase()} person ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} from ${lexicalForm}.`,
    category: 'pronoun-parsing',
  };
};

// =============================================================================
// SECTION 1: Future Active Indicative of λύω (10 questions)
// =============================================================================
// Q1: Meaning of the tense
// Q2-Q7: Parse each person/number form
// Q8-Q10: Biblical verse identification

const section1QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning of the Future tense
  {
    id: 's1-q1',
    type: 'mcq',
    question: 'What does the Future tense convey in Greek?',
    options: [
      'Action that is yet to occur',
      'Continuous action in the present',
      'Completed action in the past',
      'Repeated action in the past',
    ],
    correctIndex: 0,
    explanation: 'The Future tense in Greek conveys action that has not yet happened but is expected to occur. It is formed by adding a sigma (σ) between the verb stem and the connecting vowel/ending.',
    category: 'tense-meaning',
  },

  // Q2: 1st person singular - λύσω
  createVerbQuestion('s1-q2', 'λύσω', '1st', 'Singular', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q3: 2nd person singular - λύσεις
  createVerbQuestion('s1-q3', 'λύσεις', '2nd', 'Singular', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q4: 3rd person singular - λύσει
  createVerbQuestion('s1-q4', 'λύσει', '3rd', 'Singular', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q5: 1st person plural - λύσομεν
  createVerbQuestion('s1-q5', 'λύσομεν', '1st', 'Plural', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q6: 2nd person plural - λύσετε
  createVerbQuestion('s1-q6', 'λύσετε', '2nd', 'Plural', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q7: 3rd person plural - λύσουσι(ν)
  createVerbQuestion('s1-q7', 'λύσουσι(ν)', '3rd', 'Plural', 'Future', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q8: Biblical verse - Matthew 16:18 (I will build)
  {
    id: 's1-q8',
    type: 'mcq',
    question: 'In Matthew 16:18, identify the person and number of the underlined verb:',
    greek: '**οἰκοδομήσω** μου τὴν ἐκκλησίαν',
    vocabHelp: 'οἰκοδομέω = I build; ἐκκλησία = church/assembly',
    options: [
      '1st Person Singular',
      '3rd Person Singular',
      '1st Person Plural',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'οἰκοδομήσω is 1st person singular future active indicative from οἰκοδομέω. Jesus declares: "I will build my church."',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - John 14:26 (he will teach)
  {
    id: 's1-q9',
    type: 'mcq',
    question: 'In John 14:26, identify the person and number of the underlined verb:',
    greek: 'ἐκεῖνος ὑμᾶς **διδάξει** πάντα',
    vocabHelp: 'ἐκεῖνος = that one/he; διδάσκω = I teach; πάντα = all things',
    options: [
      '3rd Person Singular',
      '2nd Person Plural',
      '3rd Person Plural',
      '1st Person Singular',
    ],
    correctIndex: 0,
    explanation: 'διδάξει is 3rd person singular future active indicative from διδάσκω. "He (the Holy Spirit) will teach you all things."',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - Romans 6:14 (sin will not rule)
  {
    id: 's1-q10',
    type: 'mcq',
    question: 'In Romans 6:14, identify the person and number of the underlined verb:',
    greek: 'ἁμαρτία γὰρ ὑμῶν οὐ **κυριεύσει**',
    vocabHelp: 'ἁμαρτία = sin; κυριεύω = I rule/have dominion',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'κυριεύσει is 3rd person singular future active indicative from κυριεύω. "For sin will not rule over you."',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 2: Present Active Masculine Participles (12 questions)
// =============================================================================

const section2QuestionsBase: MCQQuestion[] = [
  // Q1: What is a participle?
  {
    id: 's2-q1',
    type: 'mcq',
    question: 'What is a participle?',
    options: [
      'A verbal adjective that shares characteristics of both verbs and adjectives',
      'A type of conjunction that connects clauses',
      'A noun form derived from a verb',
      'An adverb that modifies the main verb',
    ],
    correctIndex: 0,
    explanation: 'A participle is a verbal adjective. Like a verb, it has tense and voice. Like an adjective, it has case, number, and gender, and can modify nouns.',
    category: 'grammar-concept',
  },

  // Q2: Nominative Singular - λύων
  createParticipleQuestion('s2-q2', 'λύων', 'Nominative', 'Singular', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q3: Genitive Singular - λύοντος
  createParticipleQuestion('s2-q3', 'λύοντος', 'Genitive', 'Singular', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q4: Dative Singular - λύοντι
  createParticipleQuestion('s2-q4', 'λύοντι', 'Dative', 'Singular', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q5: Accusative Singular - λύοντα
  createParticipleQuestion('s2-q5', 'λύοντα', 'Accusative', 'Singular', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q6: Nominative Plural - λύοντες
  createParticipleQuestion('s2-q6', 'λύοντες', 'Nominative', 'Plural', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q7: Genitive Plural - λυόντων
  createParticipleQuestion('s2-q7', 'λυόντων', 'Genitive', 'Plural', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q8: Dative Plural - λύουσι(ν)
  createParticipleQuestion('s2-q8', 'λύουσι(ν)', 'Dative', 'Plural', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q9: Accusative Plural - λύοντας
  createParticipleQuestion('s2-q9', 'λύοντας', 'Accusative', 'Plural', 'Present', 'Active', 'Masculine', 'λύω', 'loosing'),

  // Q10: Biblical verse - John 3:16 (the one believing)
  {
    id: 's2-q10',
    type: 'mcq',
    question: 'In John 3:16, what is the case and number of the underlined participle?',
    greek: 'ἵνα πᾶς ὁ **πιστεύων** εἰς αὐτόν',
    vocabHelp: 'πιστεύω = I believe; πᾶς = everyone; ἵνα = in order that',
    options: [
      'Nominative Singular',
      'Accusative Singular',
      'Genitive Singular',
      'Nominative Plural',
    ],
    correctIndex: 0,
    explanation: 'πιστεύων is nominative singular masculine present active participle from πιστεύω. "Everyone who believes (the one believing) in him."',
    category: 'biblical-parsing',
  },

  // Q11: Biblical verse - Mark 1:4 (the one baptizing)
  {
    id: 's2-q11',
    type: 'mcq',
    question: 'In Mark 1:4, what is the case and number of the underlined participle?',
    greek: 'ἐγένετο Ἰωάννης ὁ **βαπτίζων** ἐν τῇ ἐρήμῳ',
    vocabHelp: 'βαπτίζω = I baptize; ἔρημος = wilderness; γίνομαι = I become/appear',
    options: [
      'Nominative Singular',
      'Genitive Singular',
      'Dative Singular',
      'Accusative Singular',
    ],
    correctIndex: 0,
    explanation: 'βαπτίζων is nominative singular masculine present active participle from βαπτίζω. "John the one baptizing (the Baptist) appeared in the wilderness."',
    category: 'biblical-parsing',
  },

  // Q12: Biblical verse - Matthew 7:24 (the one hearing)
  {
    id: 's2-q12',
    type: 'mcq',
    question: 'In Matthew 7:24, what is the case and number of the underlined participle?',
    greek: 'πᾶς ὅστις **ἀκούων** μου τοὺς λόγους',
    vocabHelp: 'ἀκούω = I hear; λόγος = word; ὅστις = whoever',
    options: [
      'Nominative Singular',
      'Accusative Singular',
      'Nominative Plural',
      'Genitive Singular',
    ],
    correctIndex: 0,
    explanation: 'ἀκούων is nominative singular masculine present active participle from ἀκούω. "Everyone who hears (the one hearing) my words."',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 3: 1st Aorist Active Masculine Participles (12 questions)
// =============================================================================

const section3QuestionsBase: MCQQuestion[] = [
  // Q1: How does the aorist participle differ from present?
  {
    id: 's3-q1',
    type: 'mcq',
    question: 'How does the aorist participle differ from the present participle?',
    options: [
      'The aorist participle views action as simple/completed, while the present views it as ongoing',
      'The aorist participle is always in past time, while the present is always in present time',
      'The aorist participle can only modify subjects, while the present can modify any noun',
      'The aorist participle has no case forms, while the present does',
    ],
    correctIndex: 0,
    explanation: 'The aorist participle views the action as a simple, completed whole (aspect), while the present participle views it as continuous or ongoing. Outside the indicative mood, tense reflects aspect, not time.',
    category: 'grammar-concept',
  },

  // Q2: Nominative Singular - λύσας
  createParticipleQuestion('s3-q2', 'λύσας', 'Nominative', 'Singular', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q3: Genitive Singular - λύσαντος
  createParticipleQuestion('s3-q3', 'λύσαντος', 'Genitive', 'Singular', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q4: Dative Singular - λύσαντι
  createParticipleQuestion('s3-q4', 'λύσαντι', 'Dative', 'Singular', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q5: Accusative Singular - λύσαντα
  createParticipleQuestion('s3-q5', 'λύσαντα', 'Accusative', 'Singular', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q6: Nominative Plural - λύσαντες
  createParticipleQuestion('s3-q6', 'λύσαντες', 'Nominative', 'Plural', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q7: Genitive Plural - λυσάντων
  createParticipleQuestion('s3-q7', 'λυσάντων', 'Genitive', 'Plural', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q8: Dative Plural - λύσασι(ν)
  createParticipleQuestion('s3-q8', 'λύσασι(ν)', 'Dative', 'Plural', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q9: Accusative Plural - λύσαντας
  createParticipleQuestion('s3-q9', 'λύσαντας', 'Accusative', 'Plural', 'Aorist', 'Active', 'Masculine', 'λύω', 'having loosed'),

  // Q10: Biblical verse - Acts 1:24 (having prayed)
  {
    id: 's3-q10',
    type: 'mcq',
    question: 'In Acts 1:24, what is the case and number of the underlined participle?',
    greek: 'καὶ **προσευξάμενοι** εἶπαν',
    vocabHelp: 'προσεύχομαι = I pray; εἶπον = I said',
    options: [
      'Nominative Plural',
      'Genitive Plural',
      'Accusative Plural',
      'Nominative Singular',
    ],
    correctIndex: 0,
    explanation: 'προσευξάμενοι is nominative plural masculine aorist middle participle from προσεύχομαι. "And having prayed, they said..." The aorist participle indicates the prayer was completed before the speaking.',
    category: 'biblical-parsing',
  },

  // Q11: Biblical verse - Matthew 2:10 (having seen)
  {
    id: 's3-q11',
    type: 'mcq',
    question: 'In Matthew 2:10, what is the case and number of the underlined participle?',
    greek: '**ἰδόντες** δὲ τὸν ἀστέρα ἐχάρησαν',
    vocabHelp: 'ὁράω/εἶδον = I see; ἀστήρ = star; χαίρω = I rejoice',
    options: [
      'Nominative Plural',
      'Accusative Plural',
      'Nominative Singular',
      'Genitive Plural',
    ],
    correctIndex: 0,
    explanation: 'ἰδόντες is nominative plural masculine aorist active participle from ὁράω. "Having seen the star, they rejoiced." The magi (plural) saw the star before rejoicing.',
    category: 'biblical-parsing',
  },

  // Q12: Biblical verse - Luke 15:20 (having risen)
  {
    id: 's3-q12',
    type: 'mcq',
    question: 'In Luke 15:20, what is the case and number of the underlined participle?',
    greek: 'καὶ **ἀναστὰς** ἦλθεν πρὸς τὸν πατέρα αὐτοῦ',
    vocabHelp: 'ἀνίστημι = I rise/get up; ἔρχομαι = I come/go; πατήρ = father',
    options: [
      'Nominative Singular',
      'Accusative Singular',
      'Nominative Plural',
      'Dative Singular',
    ],
    correctIndex: 0,
    explanation: 'ἀναστάς is nominative singular masculine aorist active participle from ἀνίστημι. "And having risen, he went to his father." The prodigal son rose up before going.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 4: 1st & 2nd Person Personal Pronouns (18 questions)
// =============================================================================

const section4QuestionsBase: MCQQuestion[] = [
  // Q1: What is special about personal pronouns?
  {
    id: 's4-q1',
    type: 'mcq',
    question: 'What is special about 1st and 2nd person personal pronouns in Greek?',
    options: [
      'They have no gender distinction — the same forms serve masculine, feminine, and neuter',
      'They only appear in the nominative case',
      'They are always enclitic (unstressed)',
      'They use the same declension pattern as 3rd person pronouns',
    ],
    correctIndex: 0,
    explanation: 'Unlike 3rd person pronouns (αὐτός, αὐτή, αὐτό) which distinguish gender, 1st and 2nd person pronouns (ἐγώ, σύ) have no gender forms — "I" and "you" are the same regardless of gender.',
    category: 'grammar-concept',
  },

  // --- 1st Person Pronouns (Q2–Q9) ---

  // Q2: ἐγώ - 1st person nominative singular
  createPronounQuestion('s4-q2', 'ἐγώ', '1st', 'Nominative', 'Singular', 'ἐγώ'),

  // Q3: ἐμοῦ/μου - 1st person genitive singular
  createPronounQuestion('s4-q3', 'ἐμοῦ (μου)', '1st', 'Genitive', 'Singular', 'ἐγώ'),

  // Q4: ἐμοί/μοι - 1st person dative singular
  createPronounQuestion('s4-q4', 'ἐμοί (μοι)', '1st', 'Dative', 'Singular', 'ἐγώ'),

  // Q5: ἐμέ/με - 1st person accusative singular
  createPronounQuestion('s4-q5', 'ἐμέ (με)', '1st', 'Accusative', 'Singular', 'ἐγώ'),

  // Q6: ἡμεῖς - 1st person nominative plural
  createPronounQuestion('s4-q6', 'ἡμεῖς', '1st', 'Nominative', 'Plural', 'ἐγώ'),

  // Q7: ἡμῶν - 1st person genitive plural
  createPronounQuestion('s4-q7', 'ἡμῶν', '1st', 'Genitive', 'Plural', 'ἐγώ'),

  // Q8: ἡμῖν - 1st person dative plural
  createPronounQuestion('s4-q8', 'ἡμῖν', '1st', 'Dative', 'Plural', 'ἐγώ'),

  // Q9: ἡμᾶς - 1st person accusative plural
  createPronounQuestion('s4-q9', 'ἡμᾶς', '1st', 'Accusative', 'Plural', 'ἐγώ'),

  // --- 2nd Person Pronouns (Q10–Q17) ---

  // Q10: σύ - 2nd person nominative singular
  createPronounQuestion('s4-q10', 'σύ', '2nd', 'Nominative', 'Singular', 'σύ'),

  // Q11: σοῦ/σου - 2nd person genitive singular
  createPronounQuestion('s4-q11', 'σοῦ (σου)', '2nd', 'Genitive', 'Singular', 'σύ'),

  // Q12: σοί/σοι - 2nd person dative singular
  createPronounQuestion('s4-q12', 'σοί (σοι)', '2nd', 'Dative', 'Singular', 'σύ'),

  // Q13: σέ/σε - 2nd person accusative singular
  createPronounQuestion('s4-q13', 'σέ (σε)', '2nd', 'Accusative', 'Singular', 'σύ'),

  // Q14: ὑμεῖς - 2nd person nominative plural
  createPronounQuestion('s4-q14', 'ὑμεῖς', '2nd', 'Nominative', 'Plural', 'σύ'),

  // Q15: ὑμῶν - 2nd person genitive plural
  createPronounQuestion('s4-q15', 'ὑμῶν', '2nd', 'Genitive', 'Plural', 'σύ'),

  // Q16: ὑμῖν - 2nd person dative plural
  createPronounQuestion('s4-q16', 'ὑμῖν', '2nd', 'Dative', 'Plural', 'σύ'),

  // Q17: ὑμᾶς - 2nd person accusative plural
  createPronounQuestion('s4-q17', 'ὑμᾶς', '2nd', 'Accusative', 'Plural', 'σύ'),

  // Q18: Biblical verse - John 14:6 (ἐγώ εἰμι)
  {
    id: 's4-q18',
    type: 'mcq',
    question: 'In John 14:6, what is the case and number of the underlined pronoun?',
    greek: '**ἐγώ** εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή',
    vocabHelp: 'ὁδός = way; ἀλήθεια = truth; ζωή = life',
    options: [
      '1st Person Nominative Singular',
      '1st Person Accusative Singular',
      '2nd Person Nominative Singular',
      '1st Person Nominative Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐγώ is 1st person nominative singular. Jesus emphatically declares: "I am the way, the truth, and the life." The explicit pronoun adds emphasis since the verb εἰμί already indicates 1st person.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 5: Conjunctions (10 questions)
// =============================================================================

const section5QuestionsBase: MCQQuestion[] = [
  // Q1: καί
  {
    id: 's5-q1',
    type: 'mcq',
    question: 'What does the conjunction καί mean?',
    options: [
      'and / also / even',
      'but / however',
      'for / because',
      'therefore / so',
    ],
    correctIndex: 0,
    explanation: 'καί is the most common Greek conjunction, meaning "and," "also," or "even." It is used over 9,000 times in the New Testament to connect words, phrases, and clauses.',
    category: 'conjunction-meaning',
  },

  // Q2: δέ
  {
    id: 's5-q2',
    type: 'mcq',
    question: 'What does the conjunction δέ typically mean?',
    options: [
      'but / and / now (mild contrast or continuation)',
      'for / because (giving a reason)',
      'in order that (purpose)',
      'if (conditional)',
    ],
    correctIndex: 0,
    explanation: 'δέ is a postpositive conjunction (never first in its clause) meaning "but," "and," or "now." It indicates mild contrast or narrative continuation. It is softer than ἀλλά.',
    category: 'conjunction-meaning',
  },

  // Q3: ὅτι
  {
    id: 's5-q3',
    type: 'mcq',
    question: 'What are the two main meanings of ὅτι?',
    options: [
      '"that" (introducing content) and "because" (giving reason)',
      '"if" (conditional) and "when" (temporal)',
      '"but" (contrast) and "also" (addition)',
      '"or" (alternative) and "than" (comparison)',
    ],
    correctIndex: 0,
    explanation: 'ὅτι serves double duty: (1) "that" introducing indirect speech or content clauses (e.g., "I know that..."), and (2) "because" introducing causal clauses (e.g., "because he loved...").',
    category: 'conjunction-meaning',
  },

  // Q4: γάρ
  {
    id: 's5-q4',
    type: 'mcq',
    question: 'What does the conjunction γάρ mean, and where does it appear in its clause?',
    options: [
      '"for / because" — postpositive (never first word)',
      '"and" — always first word in clause',
      '"but" — can appear anywhere',
      '"therefore" — always last word in clause',
    ],
    correctIndex: 0,
    explanation: 'γάρ means "for" or "because" and provides explanatory or supporting reason. Like δέ, it is postpositive — it never stands first in its clause (typically second position).',
    category: 'conjunction-meaning',
  },

  // Q5: ἀλλά
  {
    id: 's5-q5',
    type: 'mcq',
    question: 'How does ἀλλά differ from δέ?',
    options: [
      'ἀλλά expresses strong contrast ("but/rather"), while δέ is mild contrast',
      'ἀλλά means "and," while δέ means "but"',
      'ἀλλά is postpositive, while δέ is not',
      'ἀλλά is only used in questions, while δέ is used in statements',
    ],
    correctIndex: 0,
    explanation: 'ἀλλά marks strong adversative contrast ("but," "rather," "on the contrary"), often after a negative statement. δέ is much milder and can mean simply "and" or "now" with slight contrast.',
    category: 'conjunction-meaning',
  },

  // Q6: ἐάν vs εἰ
  {
    id: 's5-q6',
    type: 'mcq',
    question: 'What is the difference between εἰ and ἐάν?',
    options: [
      'εἰ is used with indicative ("if/since"), ἐάν with subjunctive ("if/whenever")',
      'εἰ means "but" and ἐάν means "and"',
      'εἰ is used in questions and ἐάν in answers',
      'εἰ is singular and ἐάν is plural',
    ],
    correctIndex: 0,
    explanation: 'Both mean "if," but εἰ takes the indicative mood (presenting the condition as assumed or real), while ἐάν (= εἰ + ἄν) takes the subjunctive mood (presenting the condition as contingent or possible).',
    category: 'conjunction-meaning',
  },

  // Q7: ἵνα
  {
    id: 's5-q7',
    type: 'mcq',
    question: 'What does the conjunction ἵνα express?',
    options: [
      'Purpose ("in order that") or result ("so that")',
      'Time ("when" or "while")',
      'Contrast ("but" or "however")',
      'Addition ("and also")',
    ],
    correctIndex: 0,
    explanation: 'ἵνα introduces purpose or result clauses and takes the subjunctive mood. It answers "why?" or "for what purpose?" Example: "He came ἵνα he might save us."',
    category: 'conjunction-meaning',
  },

  // Q8: οὖν
  {
    id: 's5-q8',
    type: 'mcq',
    question: 'What does the conjunction οὖν mean?',
    options: [
      'therefore / then / accordingly',
      'but / however / nevertheless',
      'and / also / even',
      'because / since / for',
    ],
    correctIndex: 0,
    explanation: 'οὖν is an inferential conjunction meaning "therefore," "then," or "accordingly." It draws a conclusion from what precedes. Like γάρ and δέ, it is postpositive.',
    category: 'conjunction-meaning',
  },

  // Q9: Which conjunction fits this context?
  {
    id: 's5-q9',
    type: 'mcq',
    question: 'Which conjunction best fills the blank? "God loved the world, ___ he gave his only Son."',
    options: [
      'ὅτι (because)',
      'ἀλλά (but)',
      'οὖν (therefore)',
      'ἤ (or)',
    ],
    correctIndex: 0,
    explanation: 'The giving is the evidence/result of the loving, so ὅτι ("because/so that") fits. This echoes John 3:16: "God so loved the world that (ὅτι/ὥστε) he gave..."',
    category: 'conjunction-usage',
  },

  // Q10: τέ and ἤ
  {
    id: 's5-q10',
    type: 'mcq',
    question: 'What do τέ and ἤ mean respectively?',
    options: [
      'τέ = "and/both" (connecting closely related items); ἤ = "or/than"',
      'τέ = "but"; ἤ = "and"',
      'τέ = "because"; ἤ = "therefore"',
      'τέ = "if"; ἤ = "then"',
    ],
    correctIndex: 0,
    explanation: 'τέ is an enclitic conjunction meaning "and" or "both" that connects closely related items (often paired as τέ...καί = "both...and"). ἤ means "or" (alternative) or "than" (comparison).',
    category: 'conjunction-meaning',
  },
];

// =============================================================================
// SECTION 6: Verse Translation — Mark 1–4 (10 questions)
// =============================================================================
// Students type freeform English translations; scored by scoreTranslation().
// Each verse includes word-level annotations for clickable Greek text.

const section6QuestionsBase: TranslationQuestion[] = [
  // Q1: Mark 1:1 — Genitives, articles, nouns (7 words)
  {
    id: 's6-q1',
    type: 'translation',
    reference: 'Mark 1:1',
    greek: 'Ἀρχὴ τοῦ εὐαγγελίου Ἰησοῦ Χριστοῦ υἱοῦ θεοῦ.',
    transliteration: 'Archē tou euangeliou Iēsou Christou huiou theou.',
    referenceTranslation: 'The beginning of the gospel of Jesus Christ, the Son of God.',
    keyTerms: ['beginning', 'gospel', 'Jesus', 'Christ', 'Son', 'God'],
    difficulty: 1,
    words: [
      { surface: 'Ἀρχὴ', lemma: 'ἀρχή', strongs: 'G746', gloss: 'beginning',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἀρχή', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'τοῦ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'genitive', number: 'singular', gender: 'neuter' } },
      { surface: 'εὐαγγελίου', lemma: 'εὐαγγέλιον', strongs: 'G2098', gloss: 'gospel',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'εὐαγγέλιον', case: 'genitive', number: 'singular', gender: 'neuter' } },
      { surface: 'Ἰησοῦ', lemma: 'Ἰησοῦς', strongs: 'G2424', gloss: 'Jesus',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'Ἰησοῦς', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'Χριστοῦ', lemma: 'Χριστός', strongs: 'G5547', gloss: 'Christ/Anointed',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'Χριστός', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'υἱοῦ', lemma: 'υἱός', strongs: 'G5207', gloss: 'son',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'υἱός', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'θεοῦ.', lemma: 'θεός', strongs: 'G2316', gloss: 'God',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'θεός', case: 'genitive', number: 'singular', gender: 'masculine' } },
    ],
  },

  // Q2: Mark 1:4 — Participles (βαπτίζων, κηρύσσων), prepositions (13 words)
  {
    id: 's6-q2',
    type: 'translation',
    reference: 'Mark 1:4',
    greek: 'ἐγένετο Ἰωάννης ὁ βαπτίζων ἐν τῇ ἐρήμῳ καὶ κηρύσσων βάπτισμα μετανοίας εἰς ἄφεσιν ἁμαρτιῶν.',
    transliteration: 'egeneto Iōannēs ho baptizōn en tē erēmō kai kēryssōn baptisma metanoias eis aphesin hamartiōn.',
    referenceTranslation: 'John appeared, baptizing in the wilderness and proclaiming a baptism of repentance for the forgiveness of sins.',
    keyTerms: ['John', 'baptizing', 'wilderness', 'proclaiming', 'repentance', 'forgiveness', 'sins'],
    difficulty: 2,
    words: [
      { surface: 'ἐγένετο', lemma: 'γίνομαι', strongs: 'G1096', gloss: 'appeared/came',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'γίνομαι', tense: 'aorist', voice: 'middle', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'Ἰωάννης', lemma: 'Ἰωάννης', strongs: 'G2491', gloss: 'John',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'Ἰωάννης', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'βαπτίζων', lemma: 'βαπτίζω', strongs: 'G907', gloss: 'baptizing',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'βαπτίζω', tense: 'present', voice: 'active', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἐν', lemma: 'ἐν', strongs: 'G1722', gloss: 'in',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἐν', case: 'dative', number: 'singular', gender: 'neuter' } },
      { surface: 'τῇ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'dative', number: 'singular', gender: 'feminine' } },
      { surface: 'ἐρήμῳ', lemma: 'ἔρημος', strongs: 'G2048', gloss: 'wilderness',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἔρημος', case: 'dative', number: 'singular', gender: 'feminine' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καί', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'κηρύσσων', lemma: 'κηρύσσω', strongs: 'G2784', gloss: 'proclaiming',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'κηρύσσω', tense: 'present', voice: 'active', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'βάπτισμα', lemma: 'βάπτισμα', strongs: 'G908', gloss: 'baptism',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'βάπτισμα', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'μετανοίας', lemma: 'μετάνοια', strongs: 'G3341', gloss: 'repentance',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'μετάνοια', case: 'genitive', number: 'singular', gender: 'feminine' } },
      { surface: 'εἰς', lemma: 'εἰς', strongs: 'G1519', gloss: 'for/into',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'εἰς', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'ἄφεσιν', lemma: 'ἄφεσις', strongs: 'G859', gloss: 'forgiveness',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἄφεσις', case: 'accusative', number: 'singular', gender: 'feminine' } },
      { surface: 'ἁμαρτιῶν.', lemma: 'ἁμαρτία', strongs: 'G266', gloss: 'sins',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἁμαρτία', case: 'genitive', number: 'plural', gender: 'feminine' } },
    ],
  },

  // Q3: Mark 1:7 — Comparative (ἰσχυρότερος), aorist participle (κύψας), infinitive (λῦσαι) (14 words)
  {
    id: 's6-q3',
    type: 'translation',
    reference: 'Mark 1:7',
    greek: 'ἔρχεται ὁ ἰσχυρότερός μου ὀπίσω μου, οὗ οὐκ εἰμὶ ἱκανὸς κύψας λῦσαι τὸν ἱμάντα τῶν ὑποδημάτων αὐτοῦ.',
    transliteration: 'erchetai ho ischyroteros mou opisō mou, hou ouk eimi hikanos kypsas lysai ton himanta tōn hypodēmatōn autou.',
    referenceTranslation: 'After me comes the one who is mightier than I, the strap of whose sandals I am not worthy to stoop down and untie.',
    keyTerms: ['comes', 'mightier', 'worthy', 'sandals', 'untie'],
    difficulty: 3,
    words: [
      { surface: 'ἔρχεται', lemma: 'ἔρχομαι', strongs: 'G2064', gloss: 'comes',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἔρχομαι', tense: 'present', voice: 'middle', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἰσχυρότερός', lemma: 'ἰσχυρός', strongs: 'G2478', gloss: 'mightier',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'ἰσχυρός', case: 'nominative', number: 'singular', gender: 'masculine', degree: 'comparative' } },
      { surface: 'μου', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'me',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'ὀπίσω', lemma: 'ὀπίσω', strongs: 'G3694', gloss: 'after/behind',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ὀπίσω', case: 'genitive', number: 'singular', gender: 'neuter' } },
      { surface: 'μου,', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'me',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'οὗ', lemma: 'ὅς', strongs: 'G3739', gloss: 'whose',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ὅς', case: 'genitive', number: 'singular', gender: 'masculine', type: 'relative' } },
      { surface: 'οὐκ', lemma: 'οὐ', strongs: 'G3756', gloss: 'not',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'οὐ', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'εἰμὶ', lemma: 'εἰμί', strongs: 'G1510', gloss: 'I am',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '1st', number: 'singular' } },
      { surface: 'ἱκανὸς', lemma: 'ἱκανός', strongs: 'G2425', gloss: 'worthy/sufficient',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'ἱκανός', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'κύψας', lemma: 'κύπτω', strongs: 'G2955', gloss: 'stooping',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'κύπτω', tense: 'aorist', voice: 'active', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'λῦσαι', lemma: 'λύω', strongs: 'G3089', gloss: 'to untie',
        parsing: { partOfSpeech: 'infinitive', lexicalForm: 'λύω', tense: 'aorist', voice: 'active' } },
      { surface: 'τὸν', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἱμάντα', lemma: 'ἱμάς', strongs: 'G2438', gloss: 'strap',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἱμάς', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'τῶν', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'genitive', number: 'plural', gender: 'neuter' } },
      { surface: 'ὑποδημάτων', lemma: 'ὑπόδημα', strongs: 'G5266', gloss: 'sandals',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ὑπόδημα', case: 'genitive', number: 'plural', gender: 'neuter' } },
      { surface: 'αὐτοῦ.', lemma: 'αὐτός', strongs: 'G846', gloss: 'his',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'αὐτός', case: 'genitive', number: 'singular', gender: 'masculine', type: 'personal' } },
    ],
  },

  // Q4: Mark 1:11 — Pronouns (σύ), εἰμί forms, aorist (εὐδόκησα) (7 words)
  {
    id: 's6-q4',
    type: 'translation',
    reference: 'Mark 1:11',
    greek: 'σὺ εἶ ὁ υἱός μου ὁ ἀγαπητός, ἐν σοὶ εὐδόκησα.',
    transliteration: 'sy ei ho huios mou ho agapētos, en soi eudokēsa.',
    referenceTranslation: 'You are my beloved Son; with you I am well pleased.',
    keyTerms: ['Son', 'beloved', 'pleased'],
    difficulty: 1,
    words: [
      { surface: 'σὺ', lemma: 'σύ', strongs: 'G4771', gloss: 'you',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'nominative', number: 'singular', person: '2nd', type: 'personal' } },
      { surface: 'εἶ', lemma: 'εἰμί', strongs: 'G1510', gloss: 'are',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '2nd', number: 'singular' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'υἱός', lemma: 'υἱός', strongs: 'G5207', gloss: 'Son',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'υἱός', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'μου', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'my',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἀγαπητός,', lemma: 'ἀγαπητός', strongs: 'G27', gloss: 'beloved',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'ἀγαπητός', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἐν', lemma: 'ἐν', strongs: 'G1722', gloss: 'in/with',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἐν', case: 'dative', number: 'singular', gender: 'neuter' } },
      { surface: 'σοὶ', lemma: 'σύ', strongs: 'G4771', gloss: 'you',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'dative', number: 'singular', person: '2nd', type: 'personal' } },
      { surface: 'εὐδόκησα.', lemma: 'εὐδοκέω', strongs: 'G2106', gloss: 'I am pleased',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εὐδοκέω', tense: 'aorist', voice: 'active', mood: 'indicative', person: '1st', number: 'singular' } },
    ],
  },

  // Q5: Mark 1:15 — Perfect (πεπλήρωται), perfective (ἤγγικεν), imperatives (12 words)
  {
    id: 's6-q5',
    type: 'translation',
    reference: 'Mark 1:15',
    greek: 'πεπλήρωται ὁ καιρὸς καὶ ἤγγικεν ἡ βασιλεία τοῦ θεοῦ· μετανοεῖτε καὶ πιστεύετε ἐν τῷ εὐαγγελίῳ.',
    transliteration: 'peplērōtai ho kairos kai ēngiken hē basileia tou theou; metanoeite kai pisteuete en tō euangeliō.',
    referenceTranslation: 'The time is fulfilled, and the kingdom of God is at hand; repent and believe in the gospel.',
    keyTerms: ['time', 'fulfilled', 'kingdom', 'God', 'repent', 'believe', 'gospel'],
    difficulty: 2,
    words: [
      { surface: 'πεπλήρωται', lemma: 'πληρόω', strongs: 'G4137', gloss: 'is fulfilled',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'πληρόω', tense: 'perfect', voice: 'passive', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'καιρὸς', lemma: 'καιρός', strongs: 'G2540', gloss: 'time',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καιρός', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καί', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'ἤγγικεν', lemma: 'ἐγγίζω', strongs: 'G1448', gloss: 'is at hand',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἐγγίζω', tense: 'perfect', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ἡ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'βασιλεία', lemma: 'βασιλεία', strongs: 'G932', gloss: 'kingdom',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'βασιλεία', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'τοῦ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'θεοῦ·', lemma: 'θεός', strongs: 'G2316', gloss: 'God',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'θεός', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'μετανοεῖτε', lemma: 'μετανοέω', strongs: 'G3340', gloss: 'repent!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'μετανοέω', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καί', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'πιστεύετε', lemma: 'πιστεύω', strongs: 'G4100', gloss: 'believe!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'πιστεύω', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'ἐν', lemma: 'ἐν', strongs: 'G1722', gloss: 'in',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἐν', case: 'dative', number: 'singular', gender: 'neuter' } },
      { surface: 'τῷ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'dative', number: 'singular', gender: 'neuter' } },
      { surface: 'εὐαγγελίῳ.', lemma: 'εὐαγγέλιον', strongs: 'G2098', gloss: 'gospel',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'εὐαγγέλιον', case: 'dative', number: 'singular', gender: 'neuter' } },
    ],
  },

  // Q6: Mark 1:17 — Future (ποιήσω), infinitive (γενέσθαι), pronouns (7 words)
  {
    id: 's6-q6',
    type: 'translation',
    reference: 'Mark 1:17',
    greek: 'δεῦτε ὀπίσω μου, καὶ ποιήσω ὑμᾶς γενέσθαι ἁλιεῖς ἀνθρώπων.',
    transliteration: 'deute opisō mou, kai poiēsō hymas genesthai halieis anthrōpōn.',
    referenceTranslation: 'Follow me, and I will make you become fishers of men.',
    keyTerms: ['follow', 'make', 'fishers', 'men'],
    difficulty: 2,
    words: [
      { surface: 'δεῦτε', lemma: 'δεῦτε', strongs: 'G1205', gloss: 'come!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'δεῦτε', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'ὀπίσω', lemma: 'ὀπίσω', strongs: 'G3694', gloss: 'after/behind',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ὀπίσω', case: 'genitive', number: 'singular', gender: 'neuter' } },
      { surface: 'μου,', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'me',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καί', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'ποιήσω', lemma: 'ποιέω', strongs: 'G4160', gloss: 'I will make',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ποιέω', tense: 'future', voice: 'active', mood: 'indicative', person: '1st', number: 'singular' } },
      { surface: 'ὑμᾶς', lemma: 'σύ', strongs: 'G4771', gloss: 'you (pl.)',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'accusative', number: 'plural', person: '2nd', type: 'personal' } },
      { surface: 'γενέσθαι', lemma: 'γίνομαι', strongs: 'G1096', gloss: 'to become',
        parsing: { partOfSpeech: 'infinitive', lexicalForm: 'γίνομαι', tense: 'aorist', voice: 'middle' } },
      { surface: 'ἁλιεῖς', lemma: 'ἁλιεύς', strongs: 'G231', gloss: 'fishers',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἁλιεύς', case: 'accusative', number: 'plural', gender: 'masculine' } },
      { surface: 'ἀνθρώπων.', lemma: 'ἄνθρωπος', strongs: 'G444', gloss: 'of men',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἄνθρωπος', case: 'genitive', number: 'plural', gender: 'masculine' } },
    ],
  },

  // Q7: Mark 2:5 — Present passive (ἀφίενται), vocative (τέκνον) (5 words)
  {
    id: 's6-q7',
    type: 'translation',
    reference: 'Mark 2:5',
    greek: 'τέκνον, ἀφίενταί σου αἱ ἁμαρτίαι.',
    transliteration: 'teknon, aphientai sou hai hamartiai.',
    referenceTranslation: 'Son, your sins are forgiven.',
    keyTerms: ['son', 'sins', 'forgiven'],
    difficulty: 1,
    words: [
      { surface: 'τέκνον,', lemma: 'τέκνον', strongs: 'G5043', gloss: 'child/son',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'τέκνον', case: 'vocative', number: 'singular', gender: 'neuter' } },
      { surface: 'ἀφίενταί', lemma: 'ἀφίημι', strongs: 'G863', gloss: 'are forgiven',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἀφίημι', tense: 'present', voice: 'passive', mood: 'indicative', person: '3rd', number: 'plural' } },
      { surface: 'σου', lemma: 'σύ', strongs: 'G4771', gloss: 'your',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'genitive', number: 'singular', person: '2nd', type: 'personal' } },
      { surface: 'αἱ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'plural', gender: 'feminine' } },
      { surface: 'ἁμαρτίαι.', lemma: 'ἁμαρτία', strongs: 'G266', gloss: 'sins',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἁμαρτία', case: 'nominative', number: 'plural', gender: 'feminine' } },
    ],
  },

  // Q8: Mark 2:17 — Participles (ἰσχύοντες, ἔχοντες), contrast (ἀλλά) (10 words)
  {
    id: 's6-q8',
    type: 'translation',
    reference: 'Mark 2:17',
    greek: 'οὐ χρείαν ἔχουσιν οἱ ἰσχύοντες ἰατροῦ ἀλλ᾿ οἱ κακῶς ἔχοντες.',
    transliteration: 'ou chreian echousin hoi ischyontes iatrou all\' hoi kakōs echontes.',
    referenceTranslation: 'Those who are well have no need of a physician, but those who are sick.',
    keyTerms: ['well', 'need', 'physician', 'sick'],
    difficulty: 2,
    words: [
      { surface: 'οὐ', lemma: 'οὐ', strongs: 'G3756', gloss: 'not',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'οὐ', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'χρείαν', lemma: 'χρεία', strongs: 'G5532', gloss: 'need',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'χρεία', case: 'accusative', number: 'singular', gender: 'feminine' } },
      { surface: 'ἔχουσιν', lemma: 'ἔχω', strongs: 'G2192', gloss: 'have',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἔχω', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'plural' } },
      { surface: 'οἱ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the ones',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'ἰσχύοντες', lemma: 'ἰσχύω', strongs: 'G2480', gloss: 'being strong',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'ἰσχύω', tense: 'present', voice: 'active', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'ἰατροῦ', lemma: 'ἰατρός', strongs: 'G2395', gloss: 'physician',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἰατρός', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'ἀλλ᾿', lemma: 'ἀλλά', strongs: 'G235', gloss: 'but',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἀλλά', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'οἱ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the ones',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'κακῶς', lemma: 'κακῶς', strongs: 'G2560', gloss: 'badly/sick',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'κακῶς', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'ἔχοντες.', lemma: 'ἔχω', strongs: 'G2192', gloss: 'having',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'ἔχω', tense: 'present', voice: 'active', case: 'nominative', number: 'plural', gender: 'masculine' } },
    ],
  },

  // Q9: Mark 2:28 — εἰμί, article chains, genitives (8 words)
  {
    id: 's6-q9',
    type: 'translation',
    reference: 'Mark 2:28',
    greek: 'κύριός ἐστιν ὁ υἱὸς τοῦ ἀνθρώπου καὶ τοῦ σαββάτου.',
    transliteration: 'kyrios estin ho huios tou anthrōpou kai tou sabbatou.',
    referenceTranslation: 'The Son of Man is lord even of the Sabbath.',
    keyTerms: ['Son', 'Man', 'lord', 'Sabbath'],
    difficulty: 1,
    words: [
      { surface: 'κύριός', lemma: 'κύριος', strongs: 'G2962', gloss: 'lord',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'κύριος', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἐστιν', lemma: 'εἰμί', strongs: 'G1510', gloss: 'is',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'υἱὸς', lemma: 'υἱός', strongs: 'G5207', gloss: 'Son',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'υἱός', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'τοῦ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'ἀνθρώπου', lemma: 'ἄνθρωπος', strongs: 'G444', gloss: 'Man',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἄνθρωπος', case: 'genitive', number: 'singular', gender: 'masculine' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and/even',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'καί', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'τοῦ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'genitive', number: 'singular', gender: 'neuter' } },
      { surface: 'σαββάτου.', lemma: 'σάββατον', strongs: 'G4521', gloss: 'Sabbath',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'σάββατον', case: 'genitive', number: 'singular', gender: 'neuter' } },
    ],
  },

  // Q10: Mark 4:9 — 3rd person imperative (ἀκουέτω), relative pronoun, infinitive (5 words)
  {
    id: 's6-q10',
    type: 'translation',
    reference: 'Mark 4:9',
    greek: 'ὃς ἔχει ὦτα ἀκούειν ἀκουέτω.',
    transliteration: 'hos echei ōta akouein akouetō.',
    referenceTranslation: 'He who has ears to hear, let him hear.',
    keyTerms: ['ears', 'hear'],
    difficulty: 1,
    words: [
      { surface: 'ὃς', lemma: 'ὅς', strongs: 'G3739', gloss: 'who',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ὅς', case: 'nominative', number: 'singular', gender: 'masculine', type: 'relative' } },
      { surface: 'ἔχει', lemma: 'ἔχω', strongs: 'G2192', gloss: 'has',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἔχω', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὦτα', lemma: 'οὖς', strongs: 'G3775', gloss: 'ears',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'οὖς', case: 'accusative', number: 'plural', gender: 'neuter' } },
      { surface: 'ἀκούειν', lemma: 'ἀκούω', strongs: 'G191', gloss: 'to hear',
        parsing: { partOfSpeech: 'infinitive', lexicalForm: 'ἀκούω', tense: 'present', voice: 'active' } },
      { surface: 'ἀκουέτω.', lemma: 'ἀκούω', strongs: 'G191', gloss: 'let him hear',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἀκούω', tense: 'present', voice: 'active', mood: 'imperative', person: '3rd', number: 'singular' } },
    ],
  },
];

// =============================================================================
// Export questions in stable order (no shuffling to avoid SSR/hydration mismatches)
// =============================================================================
export const section1Questions: MCQQuestion[] = section1QuestionsBase;
export const section2Questions: MCQQuestion[] = section2QuestionsBase;
export const section3Questions: MCQQuestion[] = section3QuestionsBase;
export const section4Questions: MCQQuestion[] = section4QuestionsBase;
export const section5Questions: MCQQuestion[] = section5QuestionsBase;
export const section6Questions: TranslationQuestion[] = section6QuestionsBase;

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

export function getQuestionsForHW4Section(sectionId: HW4SectionId): HomeworkQuestion[] {
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
    case 6:
      return section6Questions;
    default:
      return [];
  }
}

export function getHW4QuestionById(sectionId: HW4SectionId, questionId: string): HomeworkQuestion | undefined {
  const questions = getQuestionsForHW4Section(sectionId);
  return questions.find(q => q.id === questionId);
}

export function getHW4TotalQuestions(): number {
  return (
    section1Questions.length +
    section2Questions.length +
    section3Questions.length +
    section4Questions.length +
    section5Questions.length +
    section6Questions.length
  );
}
