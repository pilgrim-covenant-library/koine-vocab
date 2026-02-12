import type { MCQQuestion, HomeworkQuestion } from '@/types/homework';

// HW3 Section ID type
export type HW3SectionId = 1 | 2 | 3 | 4 | 5;

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

  // Generate plausible wrong options (same format: Person Number)
  const persons = ['1st', '2nd', '3rd'];
  const numbers = ['Singular', 'Plural'];

  const wrongOptions: string[] = [];

  // Generate all possible combinations except the correct one
  for (const p of persons) {
    for (const n of numbers) {
      const option = `${p} Person ${n}`;
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
    question: `Parse this verb form:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${person.toLowerCase()} person ${number.toLowerCase()} ${tense.toLowerCase()} ${voice.toLowerCase()} ${mood.toLowerCase()} from ${lexicalForm} (${meaning}).`,
    category: `${tense}-${voice}-${mood}`,
  };
};

// =============================================================================
// SECTION 1: Present Active Indicative of λύω (10 questions)
// =============================================================================
// Q1: Meaning of the tense
// Q2-Q7: Parse each person/number form
// Q8-Q10: Biblical verse identification

const section1QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning of the Present tense
  {
    id: 's1-q1',
    type: 'mcq',
    question: 'What does the Present tense typically convey in Greek?',
    options: [
      'Continuous or ongoing action',
      'Completed action in the past',
      'One-time action in the past',
      'Action that will happen in the future',
    ],
    correctIndex: 0,
    explanation: 'The Present tense in Greek typically conveys continuous, ongoing, or repeated action. It focuses on the process or duration of the action rather than its completion.',
    category: 'tense-meaning',
  },

  // Q2: 3rd person singular - λύει
  createVerbQuestion('s1-q2', 'λύει', '3rd', 'Singular', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q3: 2nd person plural - λύετε
  createVerbQuestion('s1-q3', 'λύετε', '2nd', 'Plural', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q4: 1st person singular - λύω
  createVerbQuestion('s1-q4', 'λύω', '1st', 'Singular', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q5: 3rd person plural - λύουσι(ν)
  createVerbQuestion('s1-q5', 'λύουσι(ν)', '3rd', 'Plural', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q6: 1st person plural - λύομεν
  createVerbQuestion('s1-q6', 'λύομεν', '1st', 'Plural', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q7: 2nd person singular - λύεις
  createVerbQuestion('s1-q7', 'λύεις', '2nd', 'Singular', 'Present', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q8: Biblical verse - Matthew 18:18 (present active indicative)
  {
    id: 's1-q8',
    type: 'mcq',
    question: 'In Matthew 18:18, identify the person and number of the underlined verb:',
    greek: 'ὅσα ἐὰν δήσητε... καὶ ὅσα ἐὰν **λύσητε**',
    vocabHelp: 'δέω = I bind; λύω = I loose; ὅσα ἐάν = whatever',
    options: [
      '2nd Person Plural',
      '3rd Person Singular',
      '1st Person Plural',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'λύσητε is 2nd person plural (aorist subjunctive, but testing person/number recognition). Jesus addresses the disciples (plural "you").',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - John 5:39 (present active indicative)
  {
    id: 's1-q9',
    type: 'mcq',
    question: 'In John 5:39, identify the person and number of the underlined verb:',
    greek: '**ἐραυνᾶτε** τὰς γραφάς',
    vocabHelp: 'ἐραυνάω = I search/examine; γραφή = scripture',
    options: [
      '2nd Person Plural',
      '3rd Person Plural',
      '2nd Person Singular',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐραυνᾶτε is 2nd person plural present active indicative from ἐραυνάω. Jesus says to the Jewish leaders: "You (plural) search the scriptures."',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - Romans 8:28 (present active indicative)
  {
    id: 's1-q10',
    type: 'mcq',
    question: 'In Romans 8:28, identify the person and number of the underlined verb:',
    greek: 'τοῖς ἀγαπῶσιν τὸν θεὸν πάντα **συνεργεῖ**',
    vocabHelp: 'ἀγαπάω = I love; συνεργέω = I work together; πάντα = all things',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'συνεργεῖ is 3rd person singular present active indicative from συνεργέω. "All things work together" (singular subject πάντα takes singular verb in Greek).',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 2: Imperfect Active Indicative of λύω (10 questions)
// =============================================================================

const section2QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning of the Imperfect tense
  {
    id: 's2-q1',
    type: 'mcq',
    question: 'What does the Imperfect tense typically convey in Greek?',
    options: [
      'Continuous action in the past',
      'Completed action in the past',
      'One-time action in the past',
      'Action happening right now',
    ],
    correctIndex: 0,
    explanation: 'The Imperfect tense conveys continuous, repeated, or ongoing action in past time. It often describes background actions or habitual past behavior.',
    category: 'tense-meaning',
  },

  // Q2: 3rd person singular - ἔλυε(ν)
  createVerbQuestion('s2-q2', 'ἔλυε(ν)', '3rd', 'Singular', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q3: 2nd person plural - ἐλύετε
  createVerbQuestion('s2-q3', 'ἐλύετε', '2nd', 'Plural', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q4: 1st person singular - ἔλυον
  createVerbQuestion('s2-q4', 'ἔλυον', '1st', 'Singular', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q5: 3rd person plural - ἔλυον
  createVerbQuestion('s2-q5', 'ἔλυον', '3rd', 'Plural', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q6: 1st person plural - ἐλύομεν
  createVerbQuestion('s2-q6', 'ἐλύομεν', '1st', 'Plural', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q7: 2nd person singular - ἔλυες
  createVerbQuestion('s2-q7', 'ἔλυες', '2nd', 'Singular', 'Imperfect', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q8: Biblical verse - Mark 1:21 (imperfect teaching)
  {
    id: 's2-q8',
    type: 'mcq',
    question: 'In Mark 1:21, identify the person and number of the underlined verb:',
    greek: 'εἰσελθὼν εἰς τὴν συναγωγὴν **ἐδίδασκεν**',
    vocabHelp: 'εἰσέρχομαι = I enter; συναγωγή = synagogue; διδάσκω = I teach',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'ἐδίδασκεν is 3rd person singular imperfect active indicative from διδάσκω. Jesus (he) was teaching continuously.',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - Matthew 4:23 (imperfect healing)
  {
    id: 's2-q9',
    type: 'mcq',
    question: 'In Matthew 4:23, identify the person and number of the underlined verb:',
    greek: '**ἐθεράπευεν** πᾶσαν νόσον καὶ πᾶσαν μαλακίαν',
    vocabHelp: 'θεραπεύω = I heal; νόσος = disease; μαλακία = sickness',
    options: [
      '3rd Person Singular',
      '1st Person Singular',
      '3rd Person Plural',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐθεράπευεν is 3rd person singular imperfect active indicative from θεραπεύω. Jesus was healing (continuous past action) every disease.',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - Mark 6:56 (imperfect saving)
  {
    id: 's2-q10',
    type: 'mcq',
    question: 'In Mark 6:56, identify the person and number of the underlined verb:',
    greek: 'ὅσοι ἂν ἥψαντο αὐτοῦ **ἐσῴζοντο**',
    vocabHelp: 'ἅπτομαι = I touch; σῴζω = I save/heal; ὅσοι = as many as',
    options: [
      '3rd Person Plural',
      '3rd Person Singular',
      '1st Person Plural',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐσῴζοντο is 3rd person plural imperfect passive indicative from σῴζω. "As many as touched him were being healed" - continuous past action.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 3: Present Active Indicative of εἰμί (10 questions)
// =============================================================================

const section3QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning/usage of εἰμί
  {
    id: 's3-q1',
    type: 'mcq',
    question: 'What is special about the verb εἰμί in Greek?',
    options: [
      'It is a linking verb (copula) meaning "to be"',
      'It is a transitive verb meaning "to do"',
      'It always takes a direct object',
      'It only appears in the past tense',
    ],
    correctIndex: 0,
    explanation: 'εἰμί is the Greek verb "to be." It is a linking verb (copula) that connects the subject to a predicate nominative or adjective. It is highly irregular.',
    category: 'verb-meaning',
  },

  // Q2: 3rd person singular - ἐστί(ν)
  createVerbQuestion('s3-q2', 'ἐστί(ν)', '3rd', 'Singular', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q3: 2nd person plural - ἐστέ
  createVerbQuestion('s3-q3', 'ἐστέ', '2nd', 'Plural', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q4: 1st person singular - εἰμί
  createVerbQuestion('s3-q4', 'εἰμί', '1st', 'Singular', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q5: 3rd person plural - εἰσί(ν)
  createVerbQuestion('s3-q5', 'εἰσί(ν)', '3rd', 'Plural', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q6: 1st person plural - ἐσμέν
  createVerbQuestion('s3-q6', 'ἐσμέν', '1st', 'Plural', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q7: 2nd person singular - εἶ
  createVerbQuestion('s3-q7', 'εἶ', '2nd', 'Singular', 'Present', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q8: Biblical verse - John 8:58 (famous ἐγὼ εἰμί)
  {
    id: 's3-q8',
    type: 'mcq',
    question: 'In John 8:58, identify the person and number of the underlined verb:',
    greek: 'πρὶν Ἀβραὰμ γενέσθαι ἐγὼ **εἰμί**',
    vocabHelp: 'πρίν = before; γίνομαι = I become; ἐγώ = I',
    options: [
      '1st Person Singular',
      '3rd Person Singular',
      '2nd Person Singular',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'εἰμί is 1st person singular present active indicative. This is Jesus\' famous "I AM" declaration, echoing the divine name from Exodus 3:14.',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - Matthew 5:14 (you are the light)
  {
    id: 's3-q9',
    type: 'mcq',
    question: 'In Matthew 5:14, identify the person and number of the underlined verb:',
    greek: 'ὑμεῖς **ἐστε** τὸ φῶς τοῦ κόσμου',
    vocabHelp: 'ὑμεῖς = you (plural); φῶς = light; κόσμος = world',
    options: [
      '2nd Person Plural',
      '3rd Person Plural',
      '2nd Person Singular',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐστε is 2nd person plural present active indicative from εἰμί. Jesus tells his disciples: "You (all) are the light of the world."',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - John 10:30 (I and the Father are one)
  {
    id: 's3-q10',
    type: 'mcq',
    question: 'In John 10:30, identify the person and number of the underlined verb:',
    greek: 'ἐγὼ καὶ ὁ πατὴρ ἓν **ἐσμεν**',
    vocabHelp: 'πατήρ = father; ἕν = one',
    options: [
      '1st Person Plural',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐσμεν is 1st person plural present active indicative from εἰμί. "I and the Father are one" - the "we" includes Jesus and the Father.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 4: Imperfect Active Indicative of εἰμί (10 questions)
// =============================================================================

const section4QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning of imperfect εἰμί
  {
    id: 's4-q1',
    type: 'mcq',
    question: 'How is the imperfect of εἰμί typically translated?',
    options: [
      '"was" or "were" (continuous state in the past)',
      '"will be" (future state)',
      '"has been" (completed state)',
      '"might be" (potential state)',
    ],
    correctIndex: 0,
    explanation: 'The imperfect of εἰμί is translated "was/were" and describes a continuous state of being in past time. It emphasizes duration or description.',
    category: 'tense-meaning',
  },

  // Q2: 3rd person singular - ἦν
  createVerbQuestion('s4-q2', 'ἦν', '3rd', 'Singular', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q3: 2nd person plural - ἦτε
  createVerbQuestion('s4-q3', 'ἦτε', '2nd', 'Plural', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q4: 1st person singular - ἤμην
  createVerbQuestion('s4-q4', 'ἤμην', '1st', 'Singular', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q5: 3rd person plural - ἦσαν
  createVerbQuestion('s4-q5', 'ἦσαν', '3rd', 'Plural', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q6: 1st person plural - ἦμεν
  createVerbQuestion('s4-q6', 'ἦμεν', '1st', 'Plural', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q7: 2nd person singular - ἦς
  createVerbQuestion('s4-q7', 'ἦς', '2nd', 'Singular', 'Imperfect', 'Active', 'Indicative', 'εἰμί', 'I am'),

  // Q8: Biblical verse - John 1:1 (famous ἦν)
  {
    id: 's4-q8',
    type: 'mcq',
    question: 'In John 1:1, identify the person and number of the underlined verb:',
    greek: 'ἐν ἀρχῇ **ἦν** ὁ λόγος',
    vocabHelp: 'ἀρχή = beginning; λόγος = word',
    options: [
      '3rd Person Singular',
      '1st Person Singular',
      '3rd Person Plural',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἦν is 3rd person singular imperfect active indicative from εἰμί. "The Word was" - describing the eternal pre-existence of the Logos.',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - Matthew 4:18 (they were fishermen)
  {
    id: 's4-q9',
    type: 'mcq',
    question: 'In Matthew 4:18, identify the person and number of the underlined verb:',
    greek: '**ἦσαν** γὰρ ἁλιεῖς',
    vocabHelp: 'γάρ = for (explanatory); ἁλιεύς = fisherman',
    options: [
      '3rd Person Plural',
      '3rd Person Singular',
      '1st Person Plural',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἦσαν is 3rd person plural imperfect active indicative from εἰμί. "For they were fishermen" - describing Peter and Andrew\'s occupation.',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - Luke 2:7 (there was no room)
  {
    id: 's4-q10',
    type: 'mcq',
    question: 'In Luke 2:7, identify the person and number of the underlined verb:',
    greek: 'οὐκ **ἦν** αὐτοῖς τόπος ἐν τῷ καταλύματι',
    vocabHelp: 'τόπος = place/room; κατάλυμα = inn/guest room',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'ἦν is 3rd person singular imperfect active indicative from εἰμί. "There was no room for them" - the singular verb with τόπος as subject.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 5: First Aorist Active Indicative of λύω (10 questions)
// =============================================================================

const section5QuestionsBase: MCQQuestion[] = [
  // Q1: Meaning of the Aorist tense
  {
    id: 's5-q1',
    type: 'mcq',
    question: 'What does the Aorist tense typically convey in Greek?',
    options: [
      'Simple, undefined action (often past)',
      'Continuous action in the present',
      'Action that will happen repeatedly',
      'Action that might happen',
    ],
    correctIndex: 0,
    explanation: 'The Aorist tense views action as a simple, undefined whole without emphasis on duration or completion. In the indicative mood, it typically refers to past time.',
    category: 'tense-meaning',
  },

  // Q2: 3rd person singular - ἔλυσε(ν)
  createVerbQuestion('s5-q2', 'ἔλυσε(ν)', '3rd', 'Singular', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q3: 2nd person plural - ἐλύσατε
  createVerbQuestion('s5-q3', 'ἐλύσατε', '2nd', 'Plural', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q4: 1st person singular - ἔλυσα
  createVerbQuestion('s5-q4', 'ἔλυσα', '1st', 'Singular', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q5: 3rd person plural - ἔλυσαν
  createVerbQuestion('s5-q5', 'ἔλυσαν', '3rd', 'Plural', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q6: 1st person plural - ἐλύσαμεν
  createVerbQuestion('s5-q6', 'ἐλύσαμεν', '1st', 'Plural', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q7: 2nd person singular - ἔλυσας
  createVerbQuestion('s5-q7', 'ἔλυσας', '2nd', 'Singular', 'Aorist', 'Active', 'Indicative', 'λύω', 'I loose/destroy'),

  // Q8: Biblical verse - John 2:19 (aorist imperative, but testing person/number)
  {
    id: 's5-q8',
    type: 'mcq',
    question: 'In John 2:19, identify the person and number of the underlined verb:',
    greek: '**λύσατε** τὸν ναὸν τοῦτον',
    vocabHelp: 'ναός = temple; οὗτος = this',
    options: [
      '2nd Person Plural',
      '3rd Person Singular',
      '1st Person Plural',
      '3rd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'λύσατε is 2nd person plural (aorist imperative). Jesus commands the Jews (plural "you"): "Destroy this temple."',
    category: 'biblical-parsing',
  },

  // Q9: Biblical verse - Matthew 26:65 (he blasphemed)
  {
    id: 's5-q9',
    type: 'mcq',
    question: 'In Matthew 26:65, identify the person and number of the underlined verb:',
    greek: '**ἐβλασφήμησεν**· τί ἔτι χρείαν ἔχομεν μαρτύρων;',
    vocabHelp: 'βλασφημέω = I blaspheme; χρεία = need; μάρτυς = witness',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '1st Person Singular',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'ἐβλασφήμησεν is 3rd person singular aorist active indicative from βλασφημέω. The high priest declares: "He blasphemed!"',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse - John 1:3 (all things came into being)
  {
    id: 's5-q10',
    type: 'mcq',
    question: 'In John 1:3, identify the person and number of the underlined verb:',
    greek: 'πάντα δι᾽ αὐτοῦ **ἐγένετο**',
    vocabHelp: 'πάντα = all things; διά + gen = through; γίνομαι = I become/come into being',
    options: [
      '3rd Person Singular',
      '1st Person Singular',
      '3rd Person Plural',
      '2nd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἐγένετο is 3rd person singular aorist middle indicative from γίνομαι. "All things came into being through him" - πάντα (neuter plural) takes a singular verb.',
    category: 'biblical-parsing',
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

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

export function getQuestionsForHW3Section(sectionId: HW3SectionId): HomeworkQuestion[] {
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

export function getHW3QuestionById(sectionId: HW3SectionId, questionId: string): HomeworkQuestion | undefined {
  const questions = getQuestionsForHW3Section(sectionId);
  return questions.find(q => q.id === questionId);
}

export function getHW3TotalQuestions(): number {
  return (
    section1Questions.length +
    section2Questions.length +
    section3Questions.length +
    section4Questions.length +
    section5Questions.length
  );
}
