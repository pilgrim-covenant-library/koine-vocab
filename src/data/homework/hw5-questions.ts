import type { MCQQuestion, TranslationQuestion, HomeworkQuestion, VerseWord } from '@/types/homework';

// HW5 Section ID type
export type HW5SectionId = 1 | 2 | 3 | 4 | 5 | 6;

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

// Helper: Get plausible alternative tenses for wrong answers
const getTenseAlternatives = (tense: string, mood: string): string[] => {
  if (mood === 'Imperative') {
    // For imperatives: Present ↔ Aorist confusion
    return tense === 'Present' ? ['Aorist'] : ['Present'];
  }

  // For indicative: all tenses are fair game
  const allTenses = ['Present', 'Imperfect', 'Aorist', 'Future'];
  return allTenses.filter(t => t !== tense);
};

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
  const correctAnswer = `${person} Person ${number}, ${tense} ${voice}`;

  // Define pools for generating wrong options
  const persons = ['1st', '2nd', '3rd'];
  const numbers = ['Singular', 'Plural'];
  const tenseAlternatives = getTenseAlternatives(tense, mood);

  const wrongOptions: string[] = [];

  // Strategy: 50% tense confusion, 50% person/number errors

  // Generate tense confusion options (correct person/number, wrong tense)
  for (const wrongTense of tenseAlternatives) {
    wrongOptions.push(`${person} Person ${number}, ${wrongTense} ${voice}`);
  }

  // Generate person/number error options (correct tense, wrong person/number)
  for (const p of persons) {
    for (const n of numbers) {
      if (p !== person || n !== number) {
        wrongOptions.push(`${p} Person ${n}, ${tense} ${voice}`);
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
    question: `Identify the person, number, tense, and voice of this verb form:`,
    greek,
    options,
    correctIndex,
    explanation: `${greek} is ${person.toLowerCase()} person ${number.toLowerCase()} ${tense.toLowerCase()} ${voice.toLowerCase()} ${mood.toLowerCase()} from ${lexicalForm} (${meaning}).`,
    category: `${tense}-${voice}-${mood}`,
  };
};

// =============================================================================
// SECTION 1: Imperative Mood (12 questions)
// =============================================================================
// 2 concept Qs, 8 form-parsing Qs (jumbled), 2 biblical verse Qs

const section1QuestionsBase: MCQQuestion[] = [
  // Q1: What is the imperative mood?
  {
    id: 'h5s1-q1',
    type: 'mcq',
    question: 'What does the imperative mood express in Greek?',
    options: [
      'A command, request, or exhortation',
      'A statement of fact',
      'A wish or possibility',
      'A condition or hypothesis',
    ],
    correctIndex: 0,
    explanation: 'The imperative mood is used for commands, requests, and exhortations. In Greek it has 2nd and 3rd person forms (but no 1st person — the subjunctive is used instead for "let us..." expressions).',
    category: 'grammar-concept',
  },

  // Q2: Present vs aorist imperative aspect
  {
    id: 'h5s1-q2',
    type: 'mcq',
    question: 'What is the difference between the present imperative and the aorist imperative?',
    options: [
      'Present = ongoing/repeated action; Aorist = simple/single action',
      'Present = polite request; Aorist = harsh command',
      'Present = future command; Aorist = past command',
      'There is no difference in meaning',
    ],
    correctIndex: 0,
    explanation: 'The present imperative commands continuous or repeated action ("keep doing X"), while the aorist imperative commands a simple, one-time action ("do X"). This is aspectual, not temporal.',
    category: 'grammar-concept',
  },

  // Parsing Qs — JUMBLED order (not 2sg, 3sg, 2pl, 3pl sequential)

  // Q3: 3rd person plural present active imperative — λυέτωσαν
  createVerbQuestion('h5s1-q3', 'λυέτωσαν', '3rd', 'Plural', 'Present', 'Active', 'Imperative', 'λύω', 'let them loose'),

  // Q4: 2nd person singular aorist active imperative — λῦσον
  createVerbQuestion('h5s1-q4', 'λῦσον', '2nd', 'Singular', 'Aorist', 'Active', 'Imperative', 'λύω', 'loose!'),

  // Q5: 2nd person plural present active imperative — λύετε
  createVerbQuestion('h5s1-q5', 'λύετε', '2nd', 'Plural', 'Present', 'Active', 'Imperative', 'λύω', 'keep loosing!'),

  // Q6: 3rd person singular aorist active imperative — λυσάτω
  createVerbQuestion('h5s1-q6', 'λυσάτω', '3rd', 'Singular', 'Aorist', 'Active', 'Imperative', 'λύω', 'let him loose'),

  // Q7: 2nd person singular present active imperative — λῦε
  createVerbQuestion('h5s1-q7', 'λῦε', '2nd', 'Singular', 'Present', 'Active', 'Imperative', 'λύω', 'keep loosing!'),

  // Q8: 2nd person plural aorist active imperative — λύσατε
  createVerbQuestion('h5s1-q8', 'λύσατε', '2nd', 'Plural', 'Aorist', 'Active', 'Imperative', 'λύω', 'loose!'),

  // Q9: 3rd person singular present active imperative — λυέτω
  createVerbQuestion('h5s1-q9', 'λυέτω', '3rd', 'Singular', 'Present', 'Active', 'Imperative', 'λύω', 'let him keep loosing'),

  // Q10: 3rd person plural aorist active imperative — λυσάτωσαν
  createVerbQuestion('h5s1-q10', 'λυσάτωσαν', '3rd', 'Plural', 'Aorist', 'Active', 'Imperative', 'λύω', 'let them loose'),

  // Q11: Biblical verse — Mark 1:15 μετανοεῖτε
  {
    id: 'h5s1-q11',
    type: 'mcq',
    question: 'In Mark 1:15, identify the person and number of the underlined imperative:',
    greek: '**μετανοεῖτε** καὶ πιστεύετε ἐν τῷ εὐαγγελίῳ',
    vocabHelp: 'μετανοέω = I repent; πιστεύω = I believe; εὐαγγέλιον = gospel',
    options: [
      '2nd Person Plural',
      '3rd Person Singular',
      '2nd Person Singular',
      '3rd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'μετανοεῖτε is 2nd person plural present active imperative from μετανοέω. Jesus commands: "Repent (you all) and believe in the gospel."',
    category: 'biblical-parsing',
  },

  // Q12: Biblical verse — Mark 4:9 ἀκουέτω
  {
    id: 'h5s1-q12',
    type: 'mcq',
    question: 'In Mark 4:9, identify the person and number of the underlined imperative:',
    greek: 'ὃς ἔχει ὦτα ἀκούειν **ἀκουέτω**',
    vocabHelp: 'ἀκούω = I hear; οὖς (ὦτα) = ear(s); ἔχω = I have',
    options: [
      '3rd Person Singular',
      '2nd Person Singular',
      '2nd Person Plural',
      '3rd Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἀκουέτω is 3rd person singular present active imperative from ἀκούω. "He who has ears to hear, let him hear." The -έτω ending marks 3rd person singular imperative.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 2: Passive Voice (16 questions)
// =============================================================================
// 2 concept Qs, 6 present passive, 6 imperfect passive, 2 biblical verse Qs

const section2QuestionsBase: MCQQuestion[] = [
  // Q1: What is the passive voice?
  {
    id: 'h5s2-q1',
    type: 'mcq',
    question: 'What does the passive voice indicate?',
    options: [
      'The subject receives the action of the verb',
      'The subject performs the action',
      'The subject acts on itself',
      'The subject acts in its own interest',
    ],
    correctIndex: 0,
    explanation: 'In the passive voice, the subject is acted upon rather than performing the action. For example, "The man is loosed" (passive) vs. "The man looses" (active).',
    category: 'grammar-concept',
  },

  // Q2: How is the present passive formed?
  {
    id: 'h5s2-q2',
    type: 'mcq',
    question: 'How are present/imperfect passive forms distinguished from active forms?',
    options: [
      'By using middle/passive personal endings (-μαι, -σαι, -ται, etc.)',
      'By adding a prefix πα- to the verb stem',
      'By changing the verb stem vowel',
      'By adding -θη- between stem and ending',
    ],
    correctIndex: 0,
    explanation: 'Present and imperfect passive use the middle/passive personal endings (-μαι, -σαι, -ται, -μεθα, -σθε, -νται). The -θη- marker is only used in the aorist passive.',
    category: 'grammar-concept',
  },

  // Present passive indicative — JUMBLED
  // Q3: 3pl — λύονται
  createVerbQuestion('h5s2-q3', 'λύονται', '3rd', 'Plural', 'Present', 'Passive', 'Indicative', 'λύω', 'they are being loosed'),

  // Q4: 1sg — λύομαι
  createVerbQuestion('h5s2-q4', 'λύομαι', '1st', 'Singular', 'Present', 'Passive', 'Indicative', 'λύω', 'I am being loosed'),

  // Q5: 2pl — λύεσθε
  createVerbQuestion('h5s2-q5', 'λύεσθε', '2nd', 'Plural', 'Present', 'Passive', 'Indicative', 'λύω', 'you (pl.) are being loosed'),

  // Q6: 3sg — λύεται
  createVerbQuestion('h5s2-q6', 'λύεται', '3rd', 'Singular', 'Present', 'Passive', 'Indicative', 'λύω', 'he/she/it is being loosed'),

  // Q7: 1pl — λυόμεθα
  createVerbQuestion('h5s2-q7', 'λυόμεθα', '1st', 'Plural', 'Present', 'Passive', 'Indicative', 'λύω', 'we are being loosed'),

  // Q8: 2sg — λύῃ
  createVerbQuestion('h5s2-q8', 'λύῃ', '2nd', 'Singular', 'Present', 'Passive', 'Indicative', 'λύω', 'you are being loosed'),

  // Imperfect passive indicative — JUMBLED
  // Q9: 2sg — ἐλύου
  createVerbQuestion('h5s2-q9', 'ἐλύου', '2nd', 'Singular', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'you were being loosed'),

  // Q10: 3pl — ἐλύοντο
  createVerbQuestion('h5s2-q10', 'ἐλύοντο', '3rd', 'Plural', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'they were being loosed'),

  // Q11: 1sg — ἐλυόμην
  createVerbQuestion('h5s2-q11', 'ἐλυόμην', '1st', 'Singular', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'I was being loosed'),

  // Q12: 1pl — ἐλυόμεθα
  createVerbQuestion('h5s2-q12', 'ἐλυόμεθα', '1st', 'Plural', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'we were being loosed'),

  // Q13: 3sg — ἐλύετο
  createVerbQuestion('h5s2-q13', 'ἐλύετο', '3rd', 'Singular', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'he/she/it was being loosed'),

  // Q14: 2pl — ἐλύεσθε
  createVerbQuestion('h5s2-q14', 'ἐλύεσθε', '2nd', 'Plural', 'Imperfect', 'Passive', 'Indicative', 'λύω', 'you (pl.) were being loosed'),

  // Q15: Biblical verse — Mark 2:5 ἀφίενταί
  {
    id: 'h5s2-q15',
    type: 'mcq',
    question: 'In Mark 2:5, identify the person and number of the underlined passive verb:',
    greek: 'τέκνον, **ἀφίενταί** σου αἱ ἁμαρτίαι',
    vocabHelp: 'ἀφίημι = I forgive/release; ἁμαρτία = sin; τέκνον = child',
    options: [
      '3rd Person Plural',
      '3rd Person Singular',
      '2nd Person Singular',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἀφίενται is 3rd person plural present passive indicative from ἀφίημι. "Child, your sins are forgiven." The sins (plural subject) are being forgiven (passive).',
    category: 'biblical-parsing',
  },

  // Q16: Biblical verse — Matt 5:4 παρακληθήσονται
  {
    id: 'h5s2-q16',
    type: 'mcq',
    question: 'In Matthew 5:4, identify the person and number of the underlined passive verb:',
    greek: 'μακάριοι οἱ πενθοῦντες, ὅτι αὐτοὶ **παρακληθήσονται**',
    vocabHelp: 'μακάριος = blessed; πενθέω = I mourn; παρακαλέω = I comfort',
    options: [
      '3rd Person Plural',
      '3rd Person Singular',
      '2nd Person Plural',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'παρακληθήσονται is 3rd person plural future passive indicative from παρακαλέω. "Blessed are those who mourn, for they shall be comforted." The -θησ- marks the future passive.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 3: ἔρχομαι (16 questions)
// =============================================================================
// 2 concept Qs, 6 present indicative, 6 imperfect indicative, 2 biblical

const section3QuestionsBase: MCQQuestion[] = [
  // Q1: What is a deponent verb?
  {
    id: 'h5s3-q1',
    type: 'mcq',
    question: 'What is a deponent verb?',
    options: [
      'A verb with middle/passive forms but active meaning',
      'A verb that can only be used in the passive voice',
      'A verb that has no finite forms',
      'A verb that only appears in the aorist tense',
    ],
    correctIndex: 0,
    explanation: 'A deponent verb has middle or passive morphology but carries an active meaning. ἔρχομαι ("I come/go") looks middle (-ομαι ending) but means "I come" (active sense).',
    category: 'grammar-concept',
  },

  // Q2: Why does ἔρχομαι use middle forms?
  {
    id: 'h5s3-q2',
    type: 'mcq',
    question: 'Why does ἔρχομαι use middle/passive endings despite having active meaning?',
    options: [
      'It is a deponent verb — it "set aside" (deponere) its active forms historically',
      'Because coming/going is always reflexive',
      'Because it was originally a passive verb that changed meaning',
      'It is an error that was never corrected in the manuscripts',
    ],
    correctIndex: 0,
    explanation: 'ἔρχομαι is deponent from the Latin deponere ("to set aside"). These verbs historically lost their active forms. Some scholars now argue the middle voice simply expresses self-involvement in the action of coming/going.',
    category: 'grammar-concept',
  },

  // Present indicative of ἔρχομαι — JUMBLED
  // Q3: 3sg — ἔρχεται
  createVerbQuestion('h5s3-q3', 'ἔρχεται', '3rd', 'Singular', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'he/she comes'),

  // Q4: 1pl — ἐρχόμεθα
  createVerbQuestion('h5s3-q4', 'ἐρχόμεθα', '1st', 'Plural', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'we come'),

  // Q5: 2sg — ἔρχῃ
  createVerbQuestion('h5s3-q5', 'ἔρχῃ', '2nd', 'Singular', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'you come'),

  // Q6: 3pl — ἔρχονται
  createVerbQuestion('h5s3-q6', 'ἔρχονται', '3rd', 'Plural', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'they come'),

  // Q7: 1sg — ἔρχομαι
  createVerbQuestion('h5s3-q7', 'ἔρχομαι', '1st', 'Singular', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'I come'),

  // Q8: 2pl — ἔρχεσθε
  createVerbQuestion('h5s3-q8', 'ἔρχεσθε', '2nd', 'Plural', 'Present', 'Middle', 'Indicative', 'ἔρχομαι', 'you (pl.) come'),

  // Imperfect indicative of ἔρχομαι — JUMBLED
  // Q9: 2pl — ἤρχεσθε
  createVerbQuestion('h5s3-q9', 'ἤρχεσθε', '2nd', 'Plural', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'you (pl.) were coming'),

  // Q10: 3sg — ἤρχετο
  createVerbQuestion('h5s3-q10', 'ἤρχετο', '3rd', 'Singular', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'he/she was coming'),

  // Q11: 1sg — ἠρχόμην
  createVerbQuestion('h5s3-q11', 'ἠρχόμην', '1st', 'Singular', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'I was coming'),

  // Q12: 3pl — ἤρχοντο
  createVerbQuestion('h5s3-q12', 'ἤρχοντο', '3rd', 'Plural', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'they were coming'),

  // Q13: 1pl — ἠρχόμεθα
  createVerbQuestion('h5s3-q13', 'ἠρχόμεθα', '1st', 'Plural', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'we were coming'),

  // Q14: 2sg — ἤρχου
  createVerbQuestion('h5s3-q14', 'ἤρχου', '2nd', 'Singular', 'Imperfect', 'Middle', 'Indicative', 'ἔρχομαι', 'you were coming'),

  // Q15: Biblical verse — Mark 1:7 ἔρχεται
  {
    id: 'h5s3-q15',
    type: 'mcq',
    question: 'In Mark 1:7, identify the person and number of the underlined verb:',
    greek: '**ἔρχεται** ὁ ἰσχυρότερός μου ὀπίσω μου',
    vocabHelp: 'ἔρχομαι = I come; ἰσχυρός = strong/mighty; ὀπίσω = after/behind',
    options: [
      '3rd Person Singular',
      '1st Person Singular',
      '3rd Person Plural',
      '2nd Person Singular',
    ],
    correctIndex: 0,
    explanation: 'ἔρχεται is 3rd person singular present middle indicative from ἔρχομαι. John says: "After me comes the one mightier than I." Despite the middle form -εται, it has active meaning (deponent).',
    category: 'biblical-parsing',
  },

  // Q16: Biblical verse — John 1:9 ἐρχόμενον
  {
    id: 'h5s3-q16',
    type: 'mcq',
    question: 'In John 1:9, what form is the underlined word ἐρχόμενον?',
    greek: 'τὸ φῶς τὸ ἀληθινὸν ὃ φωτίζει πάντα ἄνθρωπον **ἐρχόμενον** εἰς τὸν κόσμον',
    vocabHelp: 'φῶς = light; ἀληθινός = true; φωτίζω = I enlighten; κόσμος = world',
    options: [
      'Present middle participle (accusative singular neuter/masculine)',
      'Imperfect middle indicative (3rd person singular)',
      'Present active indicative (1st person singular)',
      'Aorist middle imperative (2nd person singular)',
    ],
    correctIndex: 0,
    explanation: 'ἐρχόμενον is a present middle participle from ἔρχομαι (accusative singular). "The true light that enlightens every person was coming into the world." As a deponent verb, the middle participle has active meaning.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 4: Future Tense — Middle, Passive, εἰμί (22 questions)
// =============================================================================
// 2 concept Qs, 6 future middle of λύω, 6 future passive of λύω, 6 future of εἰμί, 2 biblical

const section4QuestionsBase: MCQQuestion[] = [
  // Q1: Future middle vs future passive
  {
    id: 'h5s4-q1',
    type: 'mcq',
    question: 'How do the future middle and future passive differ in form?',
    options: [
      'Future middle uses -σ- + middle endings; future passive uses -θησ- + middle endings',
      'They use the same forms, like the present',
      'Future middle uses active endings; future passive uses passive endings',
      'Future middle adds -μ-; future passive adds -π-',
    ],
    correctIndex: 0,
    explanation: 'Unlike the present tense where middle and passive share forms, in the future they diverge: future middle = stem + σ + middle endings (λύσομαι); future passive = stem + θησ + middle endings (λυθήσομαι).',
    category: 'grammar-concept',
  },

  // Q2: Future of εἰμί
  {
    id: 'h5s4-q2',
    type: 'mcq',
    question: 'How does the future of εἰμί ("I will be") compare to other future forms?',
    options: [
      'It uses middle endings (ἔσομαι, ἔσῃ, ἔσται...) like a deponent verb',
      'It uses the same forms as the present tense of εἰμί',
      'It adds -σ- to the present forms without changing endings',
      'It is entirely irregular with no recognizable pattern',
    ],
    correctIndex: 0,
    explanation: 'The future of εἰμί (ἔσομαι, ἔσῃ, ἔσται, ἐσόμεθα, ἔσεσθε, ἔσονται) uses middle/deponent endings. The stem ἐσ- plus middle endings creates a regular-looking deponent future.',
    category: 'grammar-concept',
  },

  // Future middle of λύω — JUMBLED
  // Q3: 3pl — λύσονται
  createVerbQuestion('h5s4-q3', 'λύσονται', '3rd', 'Plural', 'Future', 'Middle', 'Indicative', 'λύω', 'they will loose for themselves'),

  // Q4: 2sg — λύσῃ
  createVerbQuestion('h5s4-q4', 'λύσῃ', '2nd', 'Singular', 'Future', 'Middle', 'Indicative', 'λύω', 'you will loose for yourself'),

  // Q5: 1pl — λυσόμεθα
  createVerbQuestion('h5s4-q5', 'λυσόμεθα', '1st', 'Plural', 'Future', 'Middle', 'Indicative', 'λύω', 'we will loose for ourselves'),

  // Q6: 1sg — λύσομαι
  createVerbQuestion('h5s4-q6', 'λύσομαι', '1st', 'Singular', 'Future', 'Middle', 'Indicative', 'λύω', 'I will loose for myself'),

  // Q7: 3sg — λύσεται
  createVerbQuestion('h5s4-q7', 'λύσεται', '3rd', 'Singular', 'Future', 'Middle', 'Indicative', 'λύω', 'he/she will loose for him/herself'),

  // Q8: 2pl — λύσεσθε
  createVerbQuestion('h5s4-q8', 'λύσεσθε', '2nd', 'Plural', 'Future', 'Middle', 'Indicative', 'λύω', 'you (pl.) will loose for yourselves'),

  // Future passive of λύω — JUMBLED
  // Q9: 2sg — λυθήσῃ
  createVerbQuestion('h5s4-q9', 'λυθήσῃ', '2nd', 'Singular', 'Future', 'Passive', 'Indicative', 'λύω', 'you will be loosed'),

  // Q10: 1pl — λυθησόμεθα
  createVerbQuestion('h5s4-q10', 'λυθησόμεθα', '1st', 'Plural', 'Future', 'Passive', 'Indicative', 'λύω', 'we will be loosed'),

  // Q11: 3sg — λυθήσεται
  createVerbQuestion('h5s4-q11', 'λυθήσεται', '3rd', 'Singular', 'Future', 'Passive', 'Indicative', 'λύω', 'he/she/it will be loosed'),

  // Q12: 3pl — λυθήσονται
  createVerbQuestion('h5s4-q12', 'λυθήσονται', '3rd', 'Plural', 'Future', 'Passive', 'Indicative', 'λύω', 'they will be loosed'),

  // Q13: 1sg — λυθήσομαι
  createVerbQuestion('h5s4-q13', 'λυθήσομαι', '1st', 'Singular', 'Future', 'Passive', 'Indicative', 'λύω', 'I will be loosed'),

  // Q14: 2pl — λυθήσεσθε
  createVerbQuestion('h5s4-q14', 'λυθήσεσθε', '2nd', 'Plural', 'Future', 'Passive', 'Indicative', 'λύω', 'you (pl.) will be loosed'),

  // Future of εἰμί — JUMBLED
  // Q15: 3sg — ἔσται
  createVerbQuestion('h5s4-q15', 'ἔσται', '3rd', 'Singular', 'Future', 'Middle', 'Indicative', 'εἰμί', 'he/she/it will be'),

  // Q16: 1sg — ἔσομαι
  createVerbQuestion('h5s4-q16', 'ἔσομαι', '1st', 'Singular', 'Future', 'Middle', 'Indicative', 'εἰμί', 'I will be'),

  // Q17: 2pl — ἔσεσθε
  createVerbQuestion('h5s4-q17', 'ἔσεσθε', '2nd', 'Plural', 'Future', 'Middle', 'Indicative', 'εἰμί', 'you (pl.) will be'),

  // Q18: 3pl — ἔσονται
  createVerbQuestion('h5s4-q18', 'ἔσονται', '3rd', 'Plural', 'Future', 'Middle', 'Indicative', 'εἰμί', 'they will be'),

  // Q19: 1pl — ἐσόμεθα
  createVerbQuestion('h5s4-q19', 'ἐσόμεθα', '1st', 'Plural', 'Future', 'Middle', 'Indicative', 'εἰμί', 'we will be'),

  // Q20: 2sg — ἔσῃ
  createVerbQuestion('h5s4-q20', 'ἔσῃ', '2nd', 'Singular', 'Future', 'Middle', 'Indicative', 'εἰμί', 'you will be'),

  // Q21: Biblical verse — Matt 5:48 ἔσεσθε
  {
    id: 'h5s4-q21',
    type: 'mcq',
    question: 'In Matthew 5:48, identify the person and number of the underlined verb:',
    greek: '**ἔσεσθε** οὖν ὑμεῖς τέλειοι ὡς ὁ πατὴρ ὑμῶν ὁ οὐράνιος τέλειός ἐστιν',
    vocabHelp: 'τέλειος = perfect/complete; πατήρ = father; οὐράνιος = heavenly',
    options: [
      '2nd Person Plural',
      '3rd Person Plural',
      '2nd Person Singular',
      '1st Person Plural',
    ],
    correctIndex: 0,
    explanation: 'ἔσεσθε is 2nd person plural future middle indicative from εἰμί. "You shall be perfect, as your heavenly Father is perfect." The -εσθε ending marks 2nd person plural.',
    category: 'biblical-parsing',
  },

  // Q22: Biblical verse — Matt 16:19 λυθήσεται
  {
    id: 'h5s4-q22',
    type: 'mcq',
    question: 'In Matthew 16:19, identify the person and number of the underlined verb:',
    greek: 'ὃ ἐὰν λύσῃς ἐπὶ τῆς γῆς ἔσται λελυμένον ἐν τοῖς οὐρανοῖς',
    vocabHelp: 'λύω = I loose/bind; γῆ = earth; οὐρανός = heaven',
    options: [
      '3rd Person Singular',
      '3rd Person Plural',
      '2nd Person Singular',
      '1st Person Singular',
    ],
    correctIndex: 0,
    explanation: 'ἔσται is 3rd person singular future middle indicative from εἰμί, and λελυμένον is a perfect passive participle from λύω. "Whatever you loose on earth shall be loosed in heaven." This verse features both future εἰμί and a periphrastic construction.',
    category: 'biblical-parsing',
  },
];

// =============================================================================
// SECTION 5: Aorist Passive Indicative of λύω (14 questions)
// =============================================================================
// 2 concept Qs, 6 aorist passive parsing (jumbled), 6 biblical verses with aorist passive

const section5QuestionsBase: MCQQuestion[] = [
  // Q1: What is the aorist passive?
  {
    id: 'h5s5-q1',
    type: 'mcq',
    question: 'How is the aorist passive formed in Greek?',
    options: [
      'With the -θη- marker between stem and ending, plus secondary active endings',
      'With the same endings as present passive',
      'With the -σ- marker like aorist active',
      'With middle/passive endings and no special marker',
    ],
    correctIndex: 0,
    explanation: 'The aorist passive uses the distinctive -θη- (theta) marker between the stem and ending, with secondary active endings (not middle/passive). Example: ἐλύθην (I was loosed) = ἐ + λυ + θη + ν.',
    category: 'grammar-concept',
  },

  // Q2: Aorist passive vs present/imperfect passive
  {
    id: 'h5s5-q2',
    type: 'mcq',
    question: 'How does the aorist passive differ from the present and imperfect passive?',
    options: [
      'Aorist passive uses -θη- and secondary active endings; present/imperfect use middle/passive endings',
      'They use identical forms; only context differs',
      'Aorist passive adds augment; present/imperfect do not',
      'Aorist passive only exists in 3rd person forms',
    ],
    correctIndex: 0,
    explanation: 'The aorist passive is formed differently than other passives: it uses the -θη- marker with secondary active endings (-ν, -ς, -, -μεν, -τε, -σαν) rather than middle/passive endings (-μαι, -σαι, -ται, etc.).',
    category: 'grammar-concept',
  },

  // Aorist passive indicative — JUMBLED order
  // Q3: 3sg — ἐλύθη
  createVerbQuestion('h5s5-q3', 'ἐλύθη', '3rd', 'Singular', 'Aorist', 'Passive', 'Indicative', 'λύω', 'he/she/it was loosed'),

  // Q4: 2pl — ἐλύθητε
  createVerbQuestion('h5s5-q4', 'ἐλύθητε', '2nd', 'Plural', 'Aorist', 'Passive', 'Indicative', 'λύω', 'you (pl.) were loosed'),

  // Q5: 1sg — ἐλύθην
  createVerbQuestion('h5s5-q5', 'ἐλύθην', '1st', 'Singular', 'Aorist', 'Passive', 'Indicative', 'λύω', 'I was loosed'),

  // Q6: 3pl — ἐλύθησαν
  createVerbQuestion('h5s5-q6', 'ἐλύθησαν', '3rd', 'Plural', 'Aorist', 'Passive', 'Indicative', 'λύω', 'they were loosed'),

  // Q7: 1pl — ἐλύθημεν
  createVerbQuestion('h5s5-q7', 'ἐλύθημεν', '1st', 'Plural', 'Aorist', 'Passive', 'Indicative', 'λύω', 'we were loosed'),

  // Q8: 2sg — ἐλύθης
  createVerbQuestion('h5s5-q8', 'ἐλύθης', '2nd', 'Singular', 'Aorist', 'Passive', 'Indicative', 'λύω', 'you were loosed'),

  // Q9: Biblical verse — Matthew 3:13 (Jesus was baptized)
  {
    id: 'h5s5-q9',
    type: 'mcq',
    question: 'In Matthew 3:13, identify the person and number of the underlined verb:',
    greek: 'τότε παραγίνεται ὁ Ἰησοῦς... τοῦ **βαπτισθῆναι** ὑπ᾿ αὐτοῦ',
    vocabHelp: 'παραγίνομαι = I come/arrive; βαπτίζω = I baptize; ὑπό = by',
    options: [
      'Aorist passive infinitive',
      '3rd Person Singular, Aorist Passive',
      '1st Person Singular, Aorist Passive',
      'Present passive infinitive',
    ],
    correctIndex: 0,
    explanation: 'βαπτισθῆναι is an aorist passive infinitive from βαπτίζω. "Jesus came... to be baptized by him." The -θη- marks the aorist passive, -ναι is the infinitive ending.',
    category: 'biblical-parsing',
  },

  // Q10: Biblical verse — John 1:14 (became flesh)
  {
    id: 'h5s5-q10',
    type: 'mcq',
    question: 'In John 1:14, identify the person and number of the underlined verb:',
    greek: 'καὶ ὁ λόγος σὰρξ **ἐγένετο**',
    vocabHelp: 'λόγος = word; σάρξ = flesh; γίνομαι = I become',
    options: [
      '3rd Person Singular, Aorist Middle',
      '3rd Person Singular, Aorist Passive',
      '3rd Person Plural, Aorist Middle',
      '1st Person Singular, Aorist Middle',
    ],
    correctIndex: 0,
    explanation: 'ἐγένετο is 3rd person singular aorist middle indicative from γίνομαι. "And the Word became flesh." γίνομαι is deponent (middle form, active meaning) and does not have an aorist passive form.',
    category: 'biblical-parsing',
  },

  // Q11: Biblical verse — Matthew 28:6 (he was raised)
  {
    id: 'h5s5-q11',
    type: 'mcq',
    question: 'In Matthew 28:6, identify the person and number of the underlined verb:',
    greek: 'οὐκ ἔστιν ὧδε· **ἠγέρθη** γὰρ καθὼς εἶπεν',
    vocabHelp: 'ὧδε = here; ἐγείρω = I raise; καθώς = just as',
    options: [
      '3rd Person Singular, Aorist Passive',
      '3rd Person Singular, Aorist Active',
      '3rd Person Plural, Aorist Passive',
      '1st Person Singular, Aorist Passive',
    ],
    correctIndex: 0,
    explanation: 'ἠγέρθη is 3rd person singular aorist passive indicative from ἐγείρω. "He is not here; for he was raised, just as he said." The augment ἠ- + γερ- + θη marker shows aorist passive.',
    category: 'biblical-parsing',
  },

  // Q12: Biblical verse — John 1:6 (a man was sent)
  {
    id: 'h5s5-q12',
    type: 'mcq',
    question: 'In John 1:6, identify the person and number of the underlined verb:',
    greek: 'ἐγένετο ἄνθρωπος **ἀπεσταλμένος** παρὰ θεοῦ',
    vocabHelp: 'ἄνθρωπος = man; ἀποστέλλω = I send; παρά = from',
    options: [
      'Perfect passive participle (nominative singular masculine)',
      '3rd Person Singular, Aorist Passive',
      'Aorist passive participle (nominative singular masculine)',
      'Present passive participle (nominative singular masculine)',
    ],
    correctIndex: 0,
    explanation: 'ἀπεσταλμένος is a perfect passive participle (not aorist passive) from ἀποστέλλω. "There came a man sent from God." Perfect passive participles use -μεν- (not -θη-) and emphasize the completed state.',
    category: 'biblical-parsing',
  },

  // Q13: Biblical verse — Luke 7:50 (your faith has saved you)
  {
    id: 'h5s5-q13',
    type: 'mcq',
    question: 'In Luke 7:50, identify the person and number of the underlined verb:',
    greek: 'ἡ πίστις σου **σέσωκέν** σε',
    vocabHelp: 'πίστις = faith; σῴζω = I save',
    options: [
      '3rd Person Singular, Perfect Active',
      '3rd Person Singular, Aorist Passive',
      '3rd Person Singular, Aorist Active',
      '2nd Person Singular, Perfect Passive',
    ],
    correctIndex: 0,
    explanation: 'σέσωκέν is 3rd person singular perfect active indicative from σῴζω. "Your faith has saved you." Perfect active, not aorist passive. The reduplication σε- + σωκ- marks the perfect tense.',
    category: 'biblical-parsing',
  },

  // Q14: Biblical verse — Mark 2:5 revisited with aorist passive context
  {
    id: 'h5s5-q14',
    type: 'mcq',
    question: 'Compare: Present passive "ἀφίενταί σου αἱ ἁμαρτίαι" vs. Aorist passive "ἀφέθησάν σου αἱ ἁμαρτίαι". What is the difference?',
    greek: 'ἀφίενται (present) vs. ἀφέθησαν (aorist)',
    vocabHelp: 'ἀφίημι = I forgive/release',
    options: [
      'Present emphasizes ongoing state; aorist emphasizes completed action',
      'They mean exactly the same thing',
      'Present is always future; aorist is always past',
      'Present uses -θη-; aorist does not',
    ],
    correctIndex: 0,
    explanation: 'Present passive (ἀφίενται) = "are being forgiven" (ongoing). Aorist passive (ἀφέθησαν) = "were forgiven" (completed action). The aorist passive uses -θη- marker; present passive does not.',
    category: 'grammar-concept',
  },
];

// =============================================================================
// SECTION 6: Verse Practice (10 translation questions)
// =============================================================================
// Covers imperative, present/future/aorist passive, ἔρχομαι, and future forms (no perfect tense)

const section6QuestionsBase: TranslationQuestion[] = [
  // Q1: Matt 7:7 — Imperatives (αἰτεῖτε, ζητεῖτε, κρούετε) + Future passives (δοθήσεται, ἀνοιγήσεται)
  {
    id: 'h5s6-q1',
    type: 'translation',
    reference: 'Matthew 7:7',
    greek: 'αἰτεῖτε καὶ δοθήσεται ὑμῖν· ζητεῖτε καὶ εὑρήσετε· κρούετε καὶ ἀνοιγήσεται ὑμῖν.',
    transliteration: 'aiteite kai dothēsetai hymin; zēteite kai heurēsete; krouete kai anoigēsetai hymin.',
    referenceTranslation: 'Ask and it will be given to you; seek and you will find; knock and it will be opened to you.',
    keyTerms: ['ask', 'given', 'seek', 'find', 'knock', 'opened'],
    difficulty: 2,
    words: [
      { surface: 'αἰτεῖτε', lemma: 'αἰτέω', strongs: 'G154', gloss: 'ask!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'αἰτέω', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'δοθήσεται', lemma: 'δίδωμι', strongs: 'G1325', gloss: 'it will be given',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'δίδωμι', tense: 'future', voice: 'passive', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὑμῖν·', lemma: 'σύ', strongs: 'G4771', gloss: 'to you',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'dative', number: 'plural', type: 'personal' } },
      { surface: 'ζητεῖτε', lemma: 'ζητέω', strongs: 'G2212', gloss: 'seek!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ζητέω', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'εὑρήσετε·', lemma: 'εὑρίσκω', strongs: 'G2147', gloss: 'you will find',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εὑρίσκω', tense: 'future', voice: 'active', mood: 'indicative', person: '2nd', number: 'plural' } },
      { surface: 'κρούετε', lemma: 'κρούω', strongs: 'G2925', gloss: 'knock!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'κρούω', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'ἀνοιγήσεται', lemma: 'ἀνοίγω', strongs: 'G455', gloss: 'it will be opened',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἀνοίγω', tense: 'future', voice: 'passive', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὑμῖν.', lemma: 'σύ', strongs: 'G4771', gloss: 'to you',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'dative', number: 'plural', type: 'personal' } },
    ],
  },

  // Q2: Mark 2:5 — Passive (ἀφίενται)
  {
    id: 'h5s6-q2',
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

  // Q3: John 14:6 — Future/εἰμί/imperative
  {
    id: 'h5s6-q3',
    type: 'translation',
    reference: 'John 14:6',
    greek: 'ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή· οὐδεὶς ἔρχεται πρὸς τὸν πατέρα εἰ μὴ δι᾿ ἐμοῦ.',
    transliteration: 'egō eimi hē hodos kai hē alētheia kai hē zōē; oudeis erchetai pros ton patera ei mē di emou.',
    referenceTranslation: 'I am the way, the truth, and the life. No one comes to the Father except through me.',
    keyTerms: ['way', 'truth', 'life', 'comes', 'Father'],
    difficulty: 2,
    words: [
      { surface: 'ἐγώ', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'I',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'nominative', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'εἰμι', lemma: 'εἰμί', strongs: 'G1510', gloss: 'am',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '1st', number: 'singular' } },
      { surface: 'ἡ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'ὁδὸς', lemma: 'ὁδός', strongs: 'G3598', gloss: 'way',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ὁδός', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'ἡ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'ἀλήθεια', lemma: 'ἀλήθεια', strongs: 'G225', gloss: 'truth',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἀλήθεια', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'ἡ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'ζωή·', lemma: 'ζωή', strongs: 'G2222', gloss: 'life',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ζωή', case: 'nominative', number: 'singular', gender: 'feminine' } },
      { surface: 'οὐδεὶς', lemma: 'οὐδείς', strongs: 'G3762', gloss: 'no one',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'οὐδείς', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἔρχεται', lemma: 'ἔρχομαι', strongs: 'G2064', gloss: 'comes',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἔρχομαι', tense: 'present', voice: 'middle', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'πρὸς', lemma: 'πρός', strongs: 'G4314', gloss: 'to',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'πρός' } },
      { surface: 'τὸν', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'πατέρα', lemma: 'πατήρ', strongs: 'G3962', gloss: 'Father',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'πατήρ', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'εἰ', lemma: 'εἰ', strongs: 'G1487', gloss: 'if',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'εἰ' } },
      { surface: 'μὴ', lemma: 'μή', strongs: 'G3361', gloss: 'not',
        parsing: { partOfSpeech: 'particle', lexicalForm: 'μή' } },
      { surface: 'δι᾿', lemma: 'διά', strongs: 'G1223', gloss: 'through',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'διά' } },
      { surface: 'ἐμοῦ.', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'me',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
    ],
  },

  // Q4: Matt 5:4 — Future passive (παρακληθήσονται)
  {
    id: 'h5s6-q4',
    type: 'translation',
    reference: 'Matthew 5:4',
    greek: 'μακάριοι οἱ πενθοῦντες, ὅτι αὐτοὶ παρακληθήσονται.',
    transliteration: 'makarioi hoi penthountes, hoti autoi paraklēthēsontai.',
    referenceTranslation: 'Blessed are those who mourn, for they shall be comforted.',
    keyTerms: ['blessed', 'mourn', 'comforted'],
    difficulty: 1,
    words: [
      { surface: 'μακάριοι', lemma: 'μακάριος', strongs: 'G3107', gloss: 'blessed',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'μακάριος', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'οἱ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the ones',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'πενθοῦντες,', lemma: 'πενθέω', strongs: 'G3996', gloss: 'mourning',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'πενθέω', tense: 'present', voice: 'active', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'ὅτι', lemma: 'ὅτι', strongs: 'G3754', gloss: 'because/for',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'ὅτι' } },
      { surface: 'αὐτοὶ', lemma: 'αὐτός', strongs: 'G846', gloss: 'they',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'αὐτός', case: 'nominative', number: 'plural', gender: 'masculine', type: 'personal' } },
      { surface: 'παρακληθήσονται.', lemma: 'παρακαλέω', strongs: 'G3870', gloss: 'shall be comforted',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'παρακαλέω', tense: 'future', voice: 'passive', mood: 'indicative', person: '3rd', number: 'plural' } },
    ],
  },

  // Q5: Matt 5:48 — Future εἰμί (ἔσεσθε)
  {
    id: 'h5s6-q5',
    type: 'translation',
    reference: 'Matthew 5:48',
    greek: 'ἔσεσθε οὖν ὑμεῖς τέλειοι ὡς ὁ πατὴρ ὑμῶν ὁ οὐράνιος τέλειός ἐστιν.',
    transliteration: 'esesthe oun hymeis teleioi hōs ho patēr hymōn ho ouranios teleios estin.',
    referenceTranslation: 'You therefore must be perfect, as your heavenly Father is perfect.',
    keyTerms: ['perfect', 'Father', 'heavenly'],
    difficulty: 2,
    words: [
      { surface: 'ἔσεσθε', lemma: 'εἰμί', strongs: 'G1510', gloss: 'you will be',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'future', voice: 'middle', mood: 'indicative', person: '2nd', number: 'plural' } },
      { surface: 'οὖν', lemma: 'οὖν', strongs: 'G3767', gloss: 'therefore',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'οὖν' } },
      { surface: 'ὑμεῖς', lemma: 'σύ', strongs: 'G4771', gloss: 'you (pl.)',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'nominative', number: 'plural', person: '2nd', type: 'personal' } },
      { surface: 'τέλειοι', lemma: 'τέλειος', strongs: 'G5046', gloss: 'perfect',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'τέλειος', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'ὡς', lemma: 'ὡς', strongs: 'G5613', gloss: 'as',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'ὡς' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'πατὴρ', lemma: 'πατήρ', strongs: 'G3962', gloss: 'Father',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'πατήρ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ὑμῶν', lemma: 'σύ', strongs: 'G4771', gloss: 'your',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'σύ', case: 'genitive', number: 'plural', person: '2nd', type: 'personal' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'οὐράνιος', lemma: 'οὐράνιος', strongs: 'G3770', gloss: 'heavenly',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'οὐράνιος', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'τέλειός', lemma: 'τέλειος', strongs: 'G5046', gloss: 'perfect',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'τέλειος', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἐστιν.', lemma: 'εἰμί', strongs: 'G1510', gloss: 'is',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
    ],
  },

  // Q6: Mark 1:7 — ἔρχομαι (ἔρχεται)
  {
    id: 'h5s6-q6',
    type: 'translation',
    reference: 'Mark 1:7',
    greek: 'ἔρχεται ὁ ἰσχυρότερός μου ὀπίσω μου.',
    transliteration: 'erchetai ho ischyroteros mou opisō mou.',
    referenceTranslation: 'After me comes the one who is mightier than I.',
    keyTerms: ['comes', 'mightier', 'after'],
    difficulty: 1,
    words: [
      { surface: 'ἔρχεται', lemma: 'ἔρχομαι', strongs: 'G2064', gloss: 'comes',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἔρχομαι', tense: 'present', voice: 'middle', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the one',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἰσχυρότερός', lemma: 'ἰσχυρός', strongs: 'G2478', gloss: 'mightier',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'ἰσχυρός', case: 'nominative', number: 'singular', gender: 'masculine', degree: 'comparative' } },
      { surface: 'μου', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'than I',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
      { surface: 'ὀπίσω', lemma: 'ὀπίσω', strongs: 'G3694', gloss: 'after/behind',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'ὀπίσω' } },
      { surface: 'μου.', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'me',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', person: '1st', type: 'personal' } },
    ],
  },

  // Q7: Matthew 28:6 — Aorist passive (ἠγέρθη) + imperatives
  {
    id: 'h5s6-q7',
    type: 'translation',
    reference: 'Matthew 28:6',
    greek: 'οὐκ ἔστιν ὧδε· ἠγέρθη γὰρ καθὼς εἶπεν. δεῦτε ἴδετε τὸν τόπον ὅπου ἔκειτο.',
    transliteration: 'ouk estin hōde; ēgerthē gar kathōs eipen. deute idete ton topon hopou ekeito.',
    referenceTranslation: 'He is not here, for he was raised just as he said. Come, see the place where he lay.',
    keyTerms: ['raised', 'come', 'see', 'place', 'lay'],
    difficulty: 2,
    words: [
      { surface: 'οὐκ', lemma: 'οὐ', strongs: 'G3756', gloss: 'not',
        parsing: { partOfSpeech: 'particle', lexicalForm: 'οὐ' } },
      { surface: 'ἔστιν', lemma: 'εἰμί', strongs: 'G1510', gloss: 'is',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'ὧδε·', lemma: 'ὧδε', strongs: 'G5602', gloss: 'here',
        parsing: { partOfSpeech: 'adverb', lexicalForm: 'ὧδε' } },
      { surface: 'ἠγέρθη', lemma: 'ἐγείρω', strongs: 'G1453', gloss: 'was raised',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ἐγείρω', tense: 'aorist', voice: 'passive', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'γὰρ', lemma: 'γάρ', strongs: 'G1063', gloss: 'for',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'γάρ' } },
      { surface: 'καθὼς', lemma: 'καθώς', strongs: 'G2531', gloss: 'just as',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καθώς' } },
      { surface: 'εἶπεν.', lemma: 'λέγω', strongs: 'G3004', gloss: 'he said',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'λέγω', tense: 'aorist', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'δεῦτε', lemma: 'δεῦτε', strongs: 'G1205', gloss: 'come!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'δεῦτε', tense: 'present', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'ἴδετε', lemma: 'ὁράω', strongs: 'G3708', gloss: 'see!',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'ὁράω', tense: 'aorist', voice: 'active', mood: 'imperative', person: '2nd', number: 'plural' } },
      { surface: 'τὸν', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'τόπον', lemma: 'τόπος', strongs: 'G5117', gloss: 'place',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'τόπος', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'ὅπου', lemma: 'ὅπου', strongs: 'G3699', gloss: 'where',
        parsing: { partOfSpeech: 'adverb', lexicalForm: 'ὅπου' } },
      { surface: 'ἔκειτο.', lemma: 'κεῖμαι', strongs: 'G2749', gloss: 'he lay',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'κεῖμαι', tense: 'imperfect', voice: 'middle', mood: 'indicative', person: '3rd', number: 'singular' } },
    ],
  },

  // Q8: Mark 4:9 — 3rd person imperative (ἀκουέτω)
  {
    id: 'h5s6-q8',
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

  // Q9: John 1:9 — ἔρχομαι participle (ἐρχόμενον)
  {
    id: 'h5s6-q9',
    type: 'translation',
    reference: 'John 1:9',
    greek: 'ἦν τὸ φῶς τὸ ἀληθινόν, ὃ φωτίζει πάντα ἄνθρωπον, ἐρχόμενον εἰς τὸν κόσμον.',
    transliteration: 'ēn to phōs to alēthinon, ho phōtizei panta anthrōpon, erchomenon eis ton kosmon.',
    referenceTranslation: 'The true light, which gives light to everyone, was coming into the world.',
    keyTerms: ['light', 'true', 'gives light', 'coming', 'world'],
    difficulty: 2,
    words: [
      { surface: 'ἦν', lemma: 'εἰμί', strongs: 'G1510', gloss: 'was',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'imperfect', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'τὸ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'φῶς', lemma: 'φῶς', strongs: 'G5457', gloss: 'light',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'φῶς', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'τὸ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'ἀληθινόν,', lemma: 'ἀληθινός', strongs: 'G228', gloss: 'true',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'ἀληθινός', case: 'nominative', number: 'singular', gender: 'neuter' } },
      { surface: 'ὃ', lemma: 'ὅς', strongs: 'G3739', gloss: 'which',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ὅς', case: 'nominative', number: 'singular', gender: 'neuter', type: 'relative' } },
      { surface: 'φωτίζει', lemma: 'φωτίζω', strongs: 'G5461', gloss: 'enlightens',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'φωτίζω', tense: 'present', voice: 'active', mood: 'indicative', person: '3rd', number: 'singular' } },
      { surface: 'πάντα', lemma: 'πᾶς', strongs: 'G3956', gloss: 'every',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'πᾶς', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἄνθρωπον,', lemma: 'ἄνθρωπος', strongs: 'G444', gloss: 'person',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ἄνθρωπος', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'ἐρχόμενον', lemma: 'ἔρχομαι', strongs: 'G2064', gloss: 'coming',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'ἔρχομαι', tense: 'present', voice: 'middle', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'εἰς', lemma: 'εἰς', strongs: 'G1519', gloss: 'into',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'εἰς' } },
      { surface: 'τὸν', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'accusative', number: 'singular', gender: 'masculine' } },
      { surface: 'κόσμον.', lemma: 'κόσμος', strongs: 'G2889', gloss: 'world',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'κόσμος', case: 'accusative', number: 'singular', gender: 'masculine' } },
    ],
  },

  // Q10: Matt 10:22 — Future middle εἰμί (ἔσεσθε) + future passive (σωθήσεται) + present passive participle
  {
    id: 'h5s6-q10',
    type: 'translation',
    reference: 'Matthew 10:22',
    greek: 'καὶ ἔσεσθε μισούμενοι ὑπὸ πάντων διὰ τὸ ὄνομά μου· ὁ δὲ ὑπομείνας εἰς τέλος οὗτος σωθήσεται.',
    transliteration: 'kai esesthe misoumenoi hypo pantōn dia to onoma mou; ho de hypomeinas eis telos houtos sōthēsetai.',
    referenceTranslation: 'And you will be hated by all on account of my name, but the one who endures to the end will be saved.',
    keyTerms: ['hated', 'all', 'name', 'endures', 'end', 'saved'],
    difficulty: 3,
    words: [
      { surface: 'καὶ', lemma: 'καί', strongs: 'G2532', gloss: 'and',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'καί' } },
      { surface: 'ἔσεσθε', lemma: 'εἰμί', strongs: 'G1510', gloss: 'you will be',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'εἰμί', tense: 'future', voice: 'middle', mood: 'indicative', person: '2nd', number: 'plural' } },
      { surface: 'μισούμενοι', lemma: 'μισέω', strongs: 'G3404', gloss: 'hated',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'μισέω', tense: 'present', voice: 'passive', case: 'nominative', number: 'plural', gender: 'masculine' } },
      { surface: 'ὑπὸ', lemma: 'ὑπό', strongs: 'G5259', gloss: 'by',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'ὑπό' } },
      { surface: 'πάντων', lemma: 'πᾶς', strongs: 'G3956', gloss: 'all',
        parsing: { partOfSpeech: 'adjective', lexicalForm: 'πᾶς', case: 'genitive', number: 'plural', gender: 'masculine' } },
      { surface: 'διὰ', lemma: 'διά', strongs: 'G1223', gloss: 'on account of',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'διά' } },
      { surface: 'τὸ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'ὄνομά', lemma: 'ὄνομα', strongs: 'G3686', gloss: 'name',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'ὄνομα', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'μου·', lemma: 'ἐγώ', strongs: 'G1473', gloss: 'my',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'ἐγώ', case: 'genitive', number: 'singular', type: 'personal' } },
      { surface: 'ὁ', lemma: 'ὁ', strongs: 'G3588', gloss: 'the (one)',
        parsing: { partOfSpeech: 'article', lexicalForm: 'ὁ', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'δὲ', lemma: 'δέ', strongs: 'G1161', gloss: 'but',
        parsing: { partOfSpeech: 'conjunction', lexicalForm: 'δέ' } },
      { surface: 'ὑπομείνας', lemma: 'ὑπομένω', strongs: 'G5278', gloss: 'having endured',
        parsing: { partOfSpeech: 'participle', lexicalForm: 'ὑπομένω', tense: 'aorist', voice: 'active', case: 'nominative', number: 'singular', gender: 'masculine' } },
      { surface: 'εἰς', lemma: 'εἰς', strongs: 'G1519', gloss: 'to/until',
        parsing: { partOfSpeech: 'preposition', lexicalForm: 'εἰς' } },
      { surface: 'τέλος', lemma: 'τέλος', strongs: 'G5056', gloss: 'end',
        parsing: { partOfSpeech: 'noun', lexicalForm: 'τέλος', case: 'accusative', number: 'singular', gender: 'neuter' } },
      { surface: 'οὗτος', lemma: 'οὗτος', strongs: 'G3778', gloss: 'this one',
        parsing: { partOfSpeech: 'pronoun', lexicalForm: 'οὗτος', case: 'nominative', number: 'singular', gender: 'masculine', type: 'demonstrative' } },
      { surface: 'σωθήσεται.', lemma: 'σῴζω', strongs: 'G4982', gloss: 'will be saved',
        parsing: { partOfSpeech: 'verb', lexicalForm: 'σῴζω', tense: 'future', voice: 'passive', mood: 'indicative', person: '3rd', number: 'singular' } },
    ],
  },
];

// =============================================================================
// Export questions in stable order (no shuffling to avoid SSR/hydration mismatches)
// =============================================================================
export const hw5Section1Questions: MCQQuestion[] = section1QuestionsBase; // Imperatives
export const hw5Section2Questions: MCQQuestion[] = section2QuestionsBase; // Passive Voice
export const hw5Section3Questions: MCQQuestion[] = section3QuestionsBase; // ἔρχομαι (was Section 4)
export const hw5Section4Questions: MCQQuestion[] = section4QuestionsBase; // Future Tense (was Section 5)
export const hw5Section5Questions: MCQQuestion[] = section5QuestionsBase; // Aorist Passive (NEW)
export const hw5Section6Questions: TranslationQuestion[] = section6QuestionsBase; // Verse Practice

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

export function getQuestionsForHW5Section(sectionId: HW5SectionId): HomeworkQuestion[] {
  switch (sectionId) {
    case 1:
      return hw5Section1Questions;
    case 2:
      return hw5Section2Questions;
    case 3:
      return hw5Section3Questions;
    case 4:
      return hw5Section4Questions;
    case 5:
      return hw5Section5Questions;
    case 6:
      return hw5Section6Questions;
    default:
      return [];
  }
}

export function getHW5QuestionById(sectionId: HW5SectionId, questionId: string): HomeworkQuestion | undefined {
  const questions = getQuestionsForHW5Section(sectionId);
  return questions.find(q => q.id === questionId);
}

export function getHW5TotalQuestions(): number {
  return (
    hw5Section1Questions.length +
    hw5Section2Questions.length +
    hw5Section3Questions.length +
    hw5Section4Questions.length +
    hw5Section5Questions.length +
    hw5Section6Questions.length
  );
}
