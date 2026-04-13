import type { MCQQuestion, TranslationQuestion, HomeworkQuestion } from '@/types/homework';

// HW7 Section ID type
export type HW7SectionId = 1 | 2 | 3 | 4 | 5 | 6;

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
// UTILITY: Create verb form parsing question with randomized options
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
  question: `Parse this ${tense.toLowerCase()} ${voice.toLowerCase()} ${mood.toLowerCase()} verb form (person and number):`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is ${person.toLowerCase()} person ${number.toLowerCase()} ${tense.toLowerCase()} ${voice.toLowerCase()} ${mood.toLowerCase()} from ${lexicalForm} (${meaning}).`,
  category: `${tense}-${voice}-${mood}`,
 };
};

// =============================================================================
// SECTION 1: Middle/Passive Participles (12 questions)
// =============================================================================

const hw7Section1Questions: MCQQuestion[] = [
 // Q1: Concept - recognizing middle/passive participle ending
 {
  id: 'h7s1-q1',
  type: 'mcq',
  question: 'Which ending is the telltale sign of a middle or passive participle in any tense?',
  options: ['-ντ-', '-μενος / -μένη / -μενον', '-σα-', '-κώς / -κυῖα / -κός'],
  correctIndex: 1,
  explanation: 'The -μενος/-μένη/-μενον ending immediately identifies a participle as middle or passive. Active participles use different endings (-ων/-ουσα/-ον for present, -σας/-σασα/-σαν for aorist, -κώς/-κυῖα/-κός for perfect).',
  category: 'concept',
 },
 // Q2: Concept - aorist passive marker
 {
  id: 'h7s1-q2',
  type: 'mcq',
  question: 'What is the distinctive marker of the aorist passive participle?',
  options: ['-σα- tense marker', '-κ- tense marker', '-θε- (or -θει-) marker', '-μεν- ending'],
  correctIndex: 2,
  explanation: 'The aorist passive participle uses the -θε- (or -θει-) marker, as in λυθείς, distinguishing it from aorist middle forms.',
  category: 'concept',
 },
 // Q3-Q6: Present middle/passive participle parsing
 createParticipleQuestion('h7s1-q3', 'λυόμενος', 'Nominative', 'Singular', 'Present', 'Middle/Passive', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s1-q4', 'λυομένου', 'Genitive', 'Singular', 'Present', 'Middle/Passive', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s1-q5', 'λυομένη', 'Nominative', 'Singular', 'Present', 'Middle/Passive', 'Feminine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s1-q6', 'λυομένοις', 'Dative', 'Plural', 'Present', 'Middle/Passive', 'Masculine', 'λύω', 'I loose'),
 // Q7-Q8: Aorist middle participle parsing
 createParticipleQuestion('h7s1-q7', 'λυσάμενος', 'Nominative', 'Singular', 'Aorist', 'Middle', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s1-q8', 'λυσαμένην', 'Accusative', 'Singular', 'Aorist', 'Middle', 'Feminine', 'λύω', 'I loose'),
 // Q9-Q10: Aorist passive participle parsing
 createParticipleQuestion('h7s1-q9', 'λυθείς', 'Nominative', 'Singular', 'Aorist', 'Passive', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s1-q10', 'λυθεῖσα', 'Nominative', 'Singular', 'Aorist', 'Passive', 'Feminine', 'λύω', 'I loose'),
 // Q11-Q12: Biblical application
 {
  id: 'h7s1-q11',
  type: 'mcq',
  question: 'In Matt 11:25, ἀποκριθεὶς ὁ Ἰησοῦς εἶπεν — what kind of participle is ἀποκριθείς?',
  greek: 'ἀποκριθείς',
  options: ['Present middle participle', 'Aorist middle participle', 'Aorist passive participle (deponent)', 'Perfect passive participle'],
  correctIndex: 2,
  explanation: 'ἀποκριθείς is an aorist passive participle from ἀποκρίνομαι (deponent verb). The -θείς ending marks it as aorist passive. As a deponent, it is translated actively: "having answered."',
  category: 'biblical-application',
 },
 {
  id: 'h7s1-q12',
  type: 'mcq',
  question: 'In Mark 1:9, βαπτισθεὶς εἰς τὸν Ἰορδάνην — what kind of participle is βαπτισθείς?',
  greek: 'βαπτισθείς',
  options: ['Present passive participle', 'Aorist active participle', 'Aorist passive participle', 'Perfect passive participle'],
  correctIndex: 2,
  explanation: 'βαπτισθείς is an aorist passive participle from βαπτίζω: "having been baptized." The -θείς ending is the telltale sign of the aorist passive participle.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 2: Perfect Tense Indicative (12 questions)
// =============================================================================

const hw7Section2Questions: MCQQuestion[] = [
 // Q1: Concept - perfect tense meaning
 {
  id: 'h7s2-q1',
  type: 'mcq',
  question: 'What is the primary significance of the Greek perfect tense?',
  options: ['Simple past action', 'Completed action with ongoing results in the present', 'Future completed action', 'Repeated past action'],
  correctIndex: 1,
  explanation: 'The Greek perfect tense expresses a completed action whose results continue into the present. For example, γέγραπται describes a past writing whose authority persists.',
  category: 'concept',
 },
 // Q2: Concept - perfect tense markers
 {
  id: 'h7s2-q2',
  type: 'mcq',
  question: 'What are the two key markers that identify the perfect active indicative?',
  options: ['Augment + -σα', 'Reduplication + -κα', 'Augment + -κε', '-θη- + primary endings'],
  correctIndex: 1,
  explanation: 'The perfect active indicative is identified by reduplication (λε- in λέλυκα) and the -κα tense marker, distinguishing it from all other tenses.',
  category: 'concept',
 },
 // Q3-Q7: Perfect active indicative
 createVerbQuestion('h7s2-q3', 'λέλυκα', '1st', 'Singular', 'Perfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q4', 'λέλυκας', '2nd', 'Singular', 'Perfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q5', 'λέλυκε(ν)', '3rd', 'Singular', 'Perfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q6', 'λελύκαμεν', '1st', 'Plural', 'Perfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q7', 'λελύκασι(ν)', '3rd', 'Plural', 'Perfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 // Q8-Q12: Perfect middle/passive indicative
 createVerbQuestion('h7s2-q8', 'λέλυμαι', '1st', 'Singular', 'Perfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q9', 'λέλυσαι', '2nd', 'Singular', 'Perfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q10', 'λέλυται', '3rd', 'Singular', 'Perfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q11', 'λελύμεθα', '1st', 'Plural', 'Perfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s2-q12', 'λέλυνται', '3rd', 'Plural', 'Perfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
];

// =============================================================================
// SECTION 3: Perfect Participles (12 questions)
// =============================================================================

const hw7Section3Questions: MCQQuestion[] = [
 // Q1: Concept - recognizing perfect active participle
 {
  id: 'h7s3-q1',
  type: 'mcq',
  question: 'How can you recognize a perfect active participle like λελυκώς?',
  options: ['It has an augment (ἐ-) before the stem', 'It has reduplication (λε-) plus the -κώς/-κυῖα/-κός ending', 'It has the -μενος ending with reduplication', 'It has the -θείς ending'],
  correctIndex: 1,
  explanation: 'The perfect active participle combines reduplication (λε-) with distinctive endings: -κώς (masc nom sg), -κυῖα (fem nom sg), -κός (neut nom sg). Compare with perfect middle/passive which uses -μένος instead.',
  category: 'concept',
 },
 // Q2: Concept - distinguishing perfect mid/pass from perfect active participle
 {
  id: 'h7s3-q2',
  type: 'mcq',
  question: 'What distinguishes a perfect middle/passive participle (like λελυμένος) from a perfect active participle (like λελυκώς)?',
  options: ['The middle/passive has no reduplication', 'The middle/passive uses -μένος/-μένη/-μένον instead of -κώς/-κυῖα/-κός', 'The middle/passive adds an augment', 'The middle/passive uses -θείς/-θεῖσα/-θέν endings'],
  correctIndex: 1,
  explanation: 'Both have reduplication (λε-), but the perfect middle/passive participle uses the -μένος/-μένη/-μένον ending (λελυμένος), while the perfect active uses -κώς/-κυῖα/-κός (λελυκώς).',
  category: 'concept',
 },
 // Q3-Q7: Perfect active participle parsing
 createParticipleQuestion('h7s3-q3', 'λελυκώς', 'Nominative', 'Singular', 'Perfect', 'Active', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q4', 'λελυκότος', 'Genitive', 'Singular', 'Perfect', 'Active', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q5', 'λελυκυῖα', 'Nominative', 'Singular', 'Perfect', 'Active', 'Feminine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q6', 'λελυκός', 'Nominative', 'Singular', 'Perfect', 'Active', 'Neuter', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q7', 'λελυκότες', 'Nominative', 'Plural', 'Perfect', 'Active', 'Masculine', 'λύω', 'I loose'),
 // Q8-Q10: Perfect middle/passive participle parsing
 createParticipleQuestion('h7s3-q8', 'λελυμένος', 'Nominative', 'Singular', 'Perfect', 'Middle/Passive', 'Masculine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q9', 'λελυμένη', 'Nominative', 'Singular', 'Perfect', 'Middle/Passive', 'Feminine', 'λύω', 'I loose'),
 createParticipleQuestion('h7s3-q10', 'λελυμένον', 'Accusative', 'Singular', 'Perfect', 'Middle/Passive', 'Neuter', 'λύω', 'I loose'),
 // Q11-Q12: Biblical application
 {
  id: 'h7s3-q11',
  type: 'mcq',
  question: 'In 1 John 1:1, ὃ ἑωράκαμεν... ὃ ἐθεασάμεθα — what tense is ἑωράκαμεν?',
  greek: 'ἑωράκαμεν',
  options: ['Aorist active indicative', 'Perfect active indicative', 'Pluperfect active indicative', 'Imperfect active indicative'],
  correctIndex: 1,
  explanation: 'ἑωράκαμεν is perfect active indicative 1st person plural from ὁράω. The perfect tense emphasizes the lasting impact of their eyewitness experience.',
  category: 'biblical-application',
 },
 {
  id: 'h7s3-q12',
  type: 'mcq',
  question: 'In Luke 1:1, τῶν πεπληροφορημένων ἐν ἡμῖν πραγμάτων — what kind of participle is πεπληροφορημένων?',
  greek: 'πεπληροφορημένων',
  options: ['Present passive participle', 'Aorist passive participle', 'Perfect passive participle', 'Perfect active participle'],
  correctIndex: 2,
  explanation: 'πεπληροφορημένων is a perfect passive participle (genitive plural) from πληροφορέω. The reduplication (πε-) and -μένων ending identify it as perfect middle/passive: "things having been fully accomplished."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 4: Pluperfect Tense (12 questions)
// =============================================================================

const hw7Section4Questions: MCQQuestion[] = [
 // Q1: Concept - pluperfect meaning
 {
  id: 'h7s4-q1',
  type: 'mcq',
  question: 'What does the pluperfect tense express in Greek?',
  options: ['A simple past action', 'A past state resulting from an even earlier completed action', 'A future completed action', 'A present state from a past action'],
  correctIndex: 1,
  explanation: 'The pluperfect expresses a past state that resulted from an even earlier completed action. It is the "past of the perfect" — the results that existed at a past point in time.',
  category: 'concept',
 },
 // Q2: Concept - pluperfect markers
 {
  id: 'h7s4-q2',
  type: 'mcq',
  question: 'What are the key markers that identify the pluperfect active indicative?',
  options: ['Reduplication only', 'Augment + reduplication + secondary endings', 'Augment + -σα endings', 'Reduplication + -κα endings'],
  correctIndex: 1,
  explanation: 'The pluperfect active is identified by (optional) augment + reduplication + κ + secondary endings: (ἐ)λελύκειν. The augment is often omitted in Koine Greek.',
  category: 'concept',
 },
 // Q3-Q7: Pluperfect active
 createVerbQuestion('h7s4-q3', '(ἐ)λελύκειν', '1st', 'Singular', 'Pluperfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q4', '(ἐ)λελύκεις', '2nd', 'Singular', 'Pluperfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q5', '(ἐ)λελύκει', '3rd', 'Singular', 'Pluperfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q6', '(ἐ)λελύκειμεν', '1st', 'Plural', 'Pluperfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q7', '(ἐ)λελύκεισαν', '3rd', 'Plural', 'Pluperfect', 'Active', 'Indicative', 'λύω', 'I loose'),
 // Q8-Q12: Pluperfect middle/passive
 createVerbQuestion('h7s4-q8', '(ἐ)λελύμην', '1st', 'Singular', 'Pluperfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q9', '(ἐ)λέλυσο', '2nd', 'Singular', 'Pluperfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q10', '(ἐ)λέλυτο', '3rd', 'Singular', 'Pluperfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q11', '(ἐ)λελύμεθα', '1st', 'Plural', 'Pluperfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
 createVerbQuestion('h7s4-q12', '(ἐ)λέλυντο', '3rd', 'Plural', 'Pluperfect', 'Middle/Passive', 'Indicative', 'λύω', 'I loose'),
];

// =============================================================================
// SECTION 5: Subjunctive Mood (12 questions)
// =============================================================================

const hw7Section5Questions: MCQQuestion[] = [
 // Q1: Concept - subjunctive usage
 {
  id: 'h7s5-q1',
  type: 'mcq',
  question: 'What is the primary use of the subjunctive mood in Greek?',
  options: ['Stating facts', 'Expressing purpose, possibility, or contingency (often with ἵνα or ἐάν)', 'Giving direct commands', 'Describing past events'],
  correctIndex: 1,
  explanation: 'The subjunctive mood expresses purpose (ἵνα = "in order that"), possibility, or contingency (ἐάν = "if"). It describes potential rather than actual actions.',
  category: 'concept',
 },
 // Q2: Concept - subjunctive markers
 {
  id: 'h7s5-q2',
  type: 'mcq',
  question: 'How are subjunctive forms distinguished from indicative forms?',
  options: ['By adding an augment', 'By lengthened connecting vowels: ο→ω, ε→η', 'By using secondary endings', 'By reduplication of the stem'],
  correctIndex: 1,
  explanation: 'The subjunctive is identified by lengthened connecting vowels: short ο becomes ω, and short ε becomes η. Compare indicative λύομεν with subjunctive λύωμεν.',
  category: 'concept',
 },
 // Q3-Q6: Present active subjunctive
 createVerbQuestion('h7s5-q3', 'λύω', '1st', 'Singular', 'Present', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 createVerbQuestion('h7s5-q4', 'λύῃς', '2nd', 'Singular', 'Present', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 createVerbQuestion('h7s5-q5', 'λύωμεν', '1st', 'Plural', 'Present', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 createVerbQuestion('h7s5-q6', 'λύωσι(ν)', '3rd', 'Plural', 'Present', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 // Q7-Q9: Aorist active subjunctive
 createVerbQuestion('h7s5-q7', 'λύσω', '1st', 'Singular', 'Aorist', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 createVerbQuestion('h7s5-q8', 'λύσῃ', '3rd', 'Singular', 'Aorist', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 createVerbQuestion('h7s5-q9', 'λύσωμεν', '1st', 'Plural', 'Aorist', 'Active', 'Subjunctive', 'λύω', 'I loose'),
 // Q10-Q11: Present subjunctive of εἰμί
 createVerbQuestion('h7s5-q10', 'ὦ', '1st', 'Singular', 'Present', 'Active', 'Subjunctive', 'εἰμί', 'I am'),
 createVerbQuestion('h7s5-q11', 'ᾖ', '3rd', 'Singular', 'Present', 'Active', 'Subjunctive', 'εἰμί', 'I am'),
 // Q12: Biblical application
 {
  id: 'h7s5-q12',
  type: 'mcq',
  question: 'In John 3:16, ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται ἀλλʼ ἔχῃ ζωὴν αἰώνιον — what mood are ἀπόληται and ἔχῃ?',
  greek: 'ἵνα... μὴ ἀπόληται ἀλλʼ ἔχῃ',
  options: ['Indicative mood', 'Imperative mood', 'Subjunctive mood (purpose clause with ἵνα)', 'Optative mood'],
  correctIndex: 2,
  explanation: 'Both ἀπόληται (aorist middle subjunctive) and ἔχῃ (present active subjunctive) are in the subjunctive mood, triggered by ἵνα expressing purpose: "in order that... he might not perish but have eternal life."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 6: Verse Practice (10 translation questions)
// =============================================================================

const hw7Section6Questions: TranslationQuestion[] = [
 // V1: John 3:16 - ἵνα + subjunctive
 {
  id: 'h7s6-q1',
  type: 'translation',
  reference: 'John 3:16',
  greek: 'οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον, ὥστε τὸν υἱὸν τὸν μονογενῆ ἔδωκεν, ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται ἀλλʼ ἔχῃ ζωὴν αἰώνιον.',
  transliteration: 'houtōs gar ēgapēsen ho theos ton kosmon, hōste ton huion ton monogenē edōken, hina pas ho pisteuōn eis auton mē apolētai all\' echē zōēn aiōnion.',
  referenceTranslation: 'For God so loved the world that he gave his only-begotten Son, in order that everyone who believes in him might not perish but have eternal life.',
  keyTerms: ['loved', 'world', 'only-begotten', 'Son', 'believes', 'perish', 'eternal life'],
  difficulty: 2,
  notes: 'ἵνα + subjunctive (ἀπόληται, ἔχῃ) expresses purpose; πιστεύων is a present active participle',
  vocabHelp: 'ἀγαπάω = love; κόσμος = world; μονογενής = only-begotten; πιστεύω = believe; ἀπόλλυμι = perish; ζωή = life; αἰώνιος = eternal',
  words: [
   { surface: 'οὕτως', lemma: 'οὕτως', gloss: 'so/thus', parsing: { pos: 'adverb' } },
   { surface: 'γὰρ', lemma: 'γάρ', gloss: 'for', parsing: { pos: 'conjunction' } },
   { surface: 'ἠγάπησεν', lemma: 'ἀγαπάω', gloss: 'loved', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεὸς', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'κόσμον,', lemma: 'κόσμος', gloss: 'world', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὥστε', lemma: 'ὥστε', gloss: 'so that', parsing: { pos: 'conjunction' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'υἱὸν', lemma: 'υἱός', gloss: 'Son', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'μονογενῆ', lemma: 'μονογενής', gloss: 'only-begotten', parsing: { pos: 'adjective', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἔδωκεν,', lemma: 'δίδωμι', gloss: 'he gave', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἵνα', lemma: 'ἵνα', gloss: 'in order that', parsing: { pos: 'conjunction' } },
   { surface: 'πᾶς', lemma: 'πᾶς', gloss: 'everyone', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the (one)', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'πιστεύων', lemma: 'πιστεύω', gloss: 'believing', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'εἰς', lemma: 'εἰς', gloss: 'in/into', parsing: { pos: 'preposition' } },
   { surface: 'αὐτὸν', lemma: 'αὐτός', gloss: 'him', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'μὴ', lemma: 'μή', gloss: 'not', parsing: { pos: 'adverb' } },
   { surface: 'ἀπόληται', lemma: 'ἀπόλλυμι', gloss: 'might perish', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Subjunctive', person: '3rd', number: 'Singular' } },
   { surface: 'ἀλλʼ', lemma: 'ἀλλά', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'ἔχῃ', lemma: 'ἔχω', gloss: 'might have', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Subjunctive', person: '3rd', number: 'Singular' } },
   { surface: 'ζωὴν', lemma: 'ζωή', gloss: 'life', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'αἰώνιον.', lemma: 'αἰώνιος', gloss: 'eternal', parsing: { pos: 'adjective', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
  ],
 },

 // V2: John 17:3 - ἵνα γινώσκωσιν (subjunctive)
 {
  id: 'h7s6-q2',
  type: 'translation',
  reference: 'John 17:3',
  greek: 'αὕτη δέ ἐστιν ἡ αἰώνιος ζωή, ἵνα γινώσκωσιν σὲ τὸν μόνον ἀληθινὸν θεόν.',
  transliteration: 'hautē de estin hē aiōnios zōē, hina ginōskōsin se ton monon alēthinon theon.',
  referenceTranslation: 'And this is eternal life, that they may know you, the only true God.',
  keyTerms: ['eternal', 'life', 'know', 'only', 'true', 'God'],
  difficulty: 2,
  notes: 'γινώσκωσιν is present active subjunctive 3P from γινώσκω, in a ἵνα purpose clause',
  vocabHelp: 'αἰώνιος = eternal; ζωή = life; γινώσκω = know; μόνος = only; ἀληθινός = true',
  words: [
   { surface: 'αὕτη', lemma: 'οὗτος', gloss: 'this', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δέ', lemma: 'δέ', gloss: 'and/but', parsing: { pos: 'conjunction' } },
   { surface: 'ἐστιν', lemma: 'εἰμί', gloss: 'is', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἡ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'αἰώνιος', lemma: 'αἰώνιος', gloss: 'eternal', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ζωή,', lemma: 'ζωή', gloss: 'life', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἵνα', lemma: 'ἵνα', gloss: 'that/in order that', parsing: { pos: 'conjunction' } },
   { surface: 'γινώσκωσιν', lemma: 'γινώσκω', gloss: 'they may know', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Subjunctive', person: '3rd', number: 'Plural' } },
   { surface: 'σὲ', lemma: 'σύ', gloss: 'you', parsing: { pos: 'pronoun', case: 'Accusative', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'μόνον', lemma: 'μόνος', gloss: 'only', parsing: { pos: 'adjective', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἀληθινὸν', lemma: 'ἀληθινός', gloss: 'true', parsing: { pos: 'adjective', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεόν.', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V3: 1 John 1:1 - ἑωράκαμεν (perfect active)
 {
  id: 'h7s6-q3',
  type: 'translation',
  reference: '1 John 1:1',
  greek: 'ὃ ἦν ἀπʼ ἀρχῆς, ὃ ἀκηκόαμεν, ὃ ἑωράκαμεν τοῖς ὀφθαλμοῖς ἡμῶν.',
  transliteration: 'ho ēn ap\' archēs, ho akēkoamen, ho heōrakamen tois ophthalmois hēmōn.',
  referenceTranslation: 'That which was from the beginning, which we have heard, which we have seen with our eyes.',
  keyTerms: ['beginning', 'heard', 'seen', 'eyes'],
  difficulty: 2,
  notes: 'ἀκηκόαμεν and ἑωράκαμεν are both perfect active indicative 1P, emphasizing lasting testimony',
  vocabHelp: 'ἀρχή = beginning; ἀκούω = hear; ὁράω = see; ὀφθαλμός = eye',
  words: [
   { surface: 'ὃ', lemma: 'ὅς', gloss: 'that which', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἦν', lemma: 'εἰμί', gloss: 'was', parsing: { pos: 'verb', tense: 'Imperfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἀπʼ', lemma: 'ἀπό', gloss: 'from', parsing: { pos: 'preposition' } },
   { surface: 'ἀρχῆς,', lemma: 'ἀρχή', gloss: 'beginning', parsing: { pos: 'noun', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ὃ', lemma: 'ὅς', gloss: 'which', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἀκηκόαμεν,', lemma: 'ἀκούω', gloss: 'we have heard', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '1st', number: 'Plural' } },
   { surface: 'ὃ', lemma: 'ὅς', gloss: 'which', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἑωράκαμεν', lemma: 'ὁράω', gloss: 'we have seen', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '1st', number: 'Plural' } },
   { surface: 'τοῖς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Dative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'ὀφθαλμοῖς', lemma: 'ὀφθαλμός', gloss: 'eyes', parsing: { pos: 'noun', case: 'Dative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'ἡμῶν.', lemma: 'ἐγώ', gloss: 'our', parsing: { pos: 'pronoun', case: 'Genitive', number: 'Plural' } },
  ],
 },

 // V4: Heb 11:17 - προσενήνοχεν (perfect active)
 {
  id: 'h7s6-q4',
  type: 'translation',
  reference: 'Heb 11:17',
  greek: 'πίστει προσενήνοχεν Ἀβραὰμ τὸν Ἰσαὰκ πειραζόμενος.',
  transliteration: 'pistei prosenēnochen Abraam ton Isaak peirazomenos.',
  referenceTranslation: 'By faith Abraham, when tested, offered up Isaac.',
  keyTerms: ['faith', 'offered', 'Abraham', 'Isaac', 'tested'],
  difficulty: 3,
  notes: 'προσενήνοχεν is perfect active indicative 3S from προσφέρω; πειραζόμενος is a present passive participle',
  vocabHelp: 'πίστις = faith; προσφέρω = offer/bring; πειράζω = test/tempt',
  words: [
   { surface: 'πίστει', lemma: 'πίστις', gloss: 'by faith', parsing: { pos: 'noun', case: 'Dative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'προσενήνοχεν', lemma: 'προσφέρω', gloss: 'has offered up', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'Ἀβραὰμ', lemma: 'Ἀβραάμ', gloss: 'Abraham', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'Ἰσαὰκ', lemma: 'Ἰσαάκ', gloss: 'Isaac', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'πειραζόμενος.', lemma: 'πειράζω', gloss: 'being tested', parsing: { pos: 'verb', tense: 'Present', voice: 'Passive', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V5: Rom 5:5 - ἐκκέχυται (perfect passive)
 {
  id: 'h7s6-q5',
  type: 'translation',
  reference: 'Rom 5:5',
  greek: 'ἡ ἀγάπη τοῦ θεοῦ ἐκκέχυται ἐν ταῖς καρδίαις ἡμῶν διὰ πνεύματος ἁγίου.',
  transliteration: 'hē agapē tou theou ekkechutai en tais kardiais hēmōn dia pneumatos hagiou.',
  referenceTranslation: 'The love of God has been poured out in our hearts through the Holy Spirit.',
  keyTerms: ['love', 'God', 'poured out', 'hearts', 'Holy Spirit'],
  difficulty: 2,
  notes: 'ἐκκέχυται is perfect passive indicative 3S from ἐκχέω — the love remains poured out',
  vocabHelp: 'ἀγάπη = love; ἐκχέω = pour out; καρδία = heart; πνεῦμα = Spirit; ἅγιος = holy',
  words: [
   { surface: 'ἡ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἀγάπη', lemma: 'ἀγάπη', gloss: 'love', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'of the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεοῦ', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐκκέχυται', lemma: 'ἐκχέω', gloss: 'has been poured out', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Passive', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἐν', lemma: 'ἐν', gloss: 'in', parsing: { pos: 'preposition' } },
   { surface: 'ταῖς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Dative', gender: 'Feminine', number: 'Plural' } },
   { surface: 'καρδίαις', lemma: 'καρδία', gloss: 'hearts', parsing: { pos: 'noun', case: 'Dative', gender: 'Feminine', number: 'Plural' } },
   { surface: 'ἡμῶν', lemma: 'ἐγώ', gloss: 'our', parsing: { pos: 'pronoun', case: 'Genitive', number: 'Plural' } },
   { surface: 'διὰ', lemma: 'διά', gloss: 'through', parsing: { pos: 'preposition' } },
   { surface: 'πνεύματος', lemma: 'πνεῦμα', gloss: 'Spirit', parsing: { pos: 'noun', case: 'Genitive', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἁγίου.', lemma: 'ἅγιος', gloss: 'Holy', parsing: { pos: 'adjective', case: 'Genitive', gender: 'Neuter', number: 'Singular' } },
  ],
 },

 // V6: John 11:27 - πεπίστευκα (perfect active)
 {
  id: 'h7s6-q6',
  type: 'translation',
  reference: 'John 11:27',
  greek: 'ἐγὼ πεπίστευκα ὅτι σὺ εἶ ὁ χριστὸς ὁ υἱὸς τοῦ θεοῦ.',
  transliteration: 'egō pepisteukaxa hoti su ei ho christos ho huios tou theou.',
  referenceTranslation: 'I have believed that you are the Christ, the Son of God.',
  keyTerms: ['believed', 'Christ', 'Son', 'God'],
  difficulty: 1,
  notes: 'πεπίστευκα is perfect active indicative 1S from πιστεύω — Martha\'s settled conviction',
  vocabHelp: 'πιστεύω = believe; χριστός = Christ/Anointed One; υἱός = Son',
  words: [
   { surface: 'ἐγὼ', lemma: 'ἐγώ', gloss: 'I', parsing: { pos: 'pronoun', case: 'Nominative', number: 'Singular' } },
   { surface: 'πεπίστευκα', lemma: 'πιστεύω', gloss: 'I have believed', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '1st', number: 'Singular' } },
   { surface: 'ὅτι', lemma: 'ὅτι', gloss: 'that', parsing: { pos: 'conjunction' } },
   { surface: 'σὺ', lemma: 'σύ', gloss: 'you', parsing: { pos: 'pronoun', case: 'Nominative', number: 'Singular' } },
   { surface: 'εἶ', lemma: 'εἰμί', gloss: 'are', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '2nd', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'χριστὸς', lemma: 'χριστός', gloss: 'Christ', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'υἱὸς', lemma: 'υἱός', gloss: 'Son', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'of the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεοῦ.', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V7: Mark 5:15 - ἐσχηκότα (perfect active participle)
 {
  id: 'h7s6-q7',
  type: 'translation',
  reference: 'Mark 5:15',
  greek: 'θεωροῦσιν τὸν δαιμονιζόμενον καθήμενον ἱματισμένον καὶ σωφρονοῦντα, τὸν ἐσχηκότα τὸν λεγιῶνα.',
  transliteration: 'theōrousin ton daimonizomenon kathēmenon himatismenon kai sōphronounta, ton eschēkota ton legiōna.',
  referenceTranslation: 'They see the demon-possessed man sitting, clothed, and in his right mind — the one who had had the legion.',
  keyTerms: ['see', 'demon-possessed', 'sitting', 'clothed', 'right mind', 'legion'],
  difficulty: 3,
  notes: 'ἐσχηκότα is perfect active participle (acc sg masc) from ἔχω; ἱματισμένον is perfect passive participle',
  vocabHelp: 'θεωρέω = see/observe; δαιμονίζομαι = be demon-possessed; κάθημαι = sit; ἱματίζω = clothe; σωφρονέω = be in right mind; λεγιών = legion',
  words: [
   { surface: 'θεωροῦσιν', lemma: 'θεωρέω', gloss: 'they see', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'δαιμονιζόμενον', lemma: 'δαιμονίζομαι', gloss: 'demon-possessed man', parsing: { pos: 'verb', tense: 'Present', voice: 'Passive', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καθήμενον', lemma: 'κάθημαι', gloss: 'sitting', parsing: { pos: 'verb', tense: 'Present', voice: 'Middle', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἱματισμένον', lemma: 'ἱματίζω', gloss: 'clothed', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Passive', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'σωφρονοῦντα,', lemma: 'σωφρονέω', gloss: 'being in right mind', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the one', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐσχηκότα', lemma: 'ἔχω', gloss: 'who had had', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'λεγιῶνα.', lemma: 'λεγιών', gloss: 'legion', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
  ],
 },

 // V8: Luke 1:1 - πεπληροφορημένων (perfect passive participle)
 {
  id: 'h7s6-q8',
  type: 'translation',
  reference: 'Luke 1:1',
  greek: 'Ἐπειδήπερ πολλοὶ ἐπεχείρησαν ἀνατάξασθαι διήγησιν περὶ τῶν πεπληροφορημένων ἐν ἡμῖν πραγμάτων.',
  transliteration: 'Epeidēper polloi epecheirēsan anataxasthai diēgēsin peri tōn peplērophorēmenōn en hēmin pragmatōn.',
  referenceTranslation: 'Since many have undertaken to compile an account of the things fully accomplished among us.',
  keyTerms: ['many', 'undertaken', 'compile', 'account', 'accomplished', 'among us'],
  difficulty: 3,
  notes: 'πεπληροφορημένων is perfect passive participle (gen pl neut) from πληροφορέω — things that stand accomplished',
  vocabHelp: 'πολλοί = many; ἐπιχειρέω = undertake; ἀνατάσσομαι = compile; διήγησις = account; πληροφορέω = fully accomplish; πρᾶγμα = thing/matter',
  words: [
   { surface: 'Ἐπειδήπερ', lemma: 'ἐπειδήπερ', gloss: 'since indeed', parsing: { pos: 'conjunction' } },
   { surface: 'πολλοὶ', lemma: 'πολύς', gloss: 'many', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'ἐπεχείρησαν', lemma: 'ἐπιχειρέω', gloss: 'have undertaken', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'ἀνατάξασθαι', lemma: 'ἀνατάσσομαι', gloss: 'to compile', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Infinitive' } },
   { surface: 'διήγησιν', lemma: 'διήγησις', gloss: 'an account', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'περὶ', lemma: 'περί', gloss: 'concerning', parsing: { pos: 'preposition' } },
   { surface: 'τῶν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
   { surface: 'πεπληροφορημένων', lemma: 'πληροφορέω', gloss: 'fully accomplished', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Passive', mood: 'Participle', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
   { surface: 'ἐν', lemma: 'ἐν', gloss: 'among', parsing: { pos: 'preposition' } },
   { surface: 'ἡμῖν', lemma: 'ἐγώ', gloss: 'us', parsing: { pos: 'pronoun', case: 'Dative', number: 'Plural' } },
   { surface: 'πραγμάτων.', lemma: 'πρᾶγμα', gloss: 'things/matters', parsing: { pos: 'noun', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
  ],
 },

 // V9: John 20:23 - subjunctive + perfect passive
 {
  id: 'h7s6-q9',
  type: 'translation',
  reference: 'John 20:23',
  greek: 'ἄν τινων ἀφῆτε τὰς ἁμαρτίας, ἀφέωνται αὐτοῖς.',
  transliteration: 'an tinōn aphēte tas hamartias, apheōntai autois.',
  referenceTranslation: 'If you forgive the sins of any, they have been forgiven them.',
  keyTerms: ['forgive', 'sins', 'forgiven'],
  difficulty: 3,
  notes: 'ἀφῆτε is aorist active subjunctive 2P from ἀφίημι; ἀφέωνται is perfect passive indicative 3P',
  vocabHelp: 'ἀφίημι = forgive/release; ἁμαρτία = sin; τις = anyone',
  words: [
   { surface: 'ἄν', lemma: 'ἄν', gloss: 'if (+ subjunctive)', parsing: { pos: 'particle' } },
   { surface: 'τινων', lemma: 'τις', gloss: 'of any', parsing: { pos: 'pronoun', case: 'Genitive', number: 'Plural' } },
   { surface: 'ἀφῆτε', lemma: 'ἀφίημι', gloss: 'you forgive', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Subjunctive', person: '2nd', number: 'Plural' } },
   { surface: 'τὰς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Feminine', number: 'Plural' } },
   { surface: 'ἁμαρτίας,', lemma: 'ἁμαρτία', gloss: 'sins', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Plural' } },
   { surface: 'ἀφέωνται', lemma: 'ἀφίημι', gloss: 'they have been forgiven', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Passive', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'αὐτοῖς.', lemma: 'αὐτός', gloss: 'them', parsing: { pos: 'pronoun', case: 'Dative', gender: 'Masculine', number: 'Plural' } },
  ],
 },

 // V10: Rev 21:6 - γέγονα (perfect of γίνομαι)
 {
  id: 'h7s6-q10',
  type: 'translation',
  reference: 'Rev 21:6',
  greek: 'γέγοναν. ἐγώ εἰμι τὸ ἄλφα καὶ τὸ ὦ, ἡ ἀρχὴ καὶ τὸ τέλος.',
  transliteration: 'gegonan. egō eimi to alpha kai to ō, hē archē kai to telos.',
  referenceTranslation: 'It is done! I am the Alpha and the Omega, the beginning and the end.',
  keyTerms: ['done', 'Alpha', 'Omega', 'beginning', 'end'],
  difficulty: 1,
  notes: 'γέγοναν is perfect active indicative 3P from γίνομαι — "these things have come to pass and stand completed"',
  vocabHelp: 'γίνομαι = become/happen; ἄλφα = Alpha (first letter); ὦ = Omega (last letter); ἀρχή = beginning; τέλος = end',
  words: [
   { surface: 'γέγοναν.', lemma: 'γίνομαι', gloss: 'they have come to pass / it is done', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'ἐγώ', lemma: 'ἐγώ', gloss: 'I', parsing: { pos: 'pronoun', case: 'Nominative', number: 'Singular' } },
   { surface: 'εἰμι', lemma: 'εἰμί', gloss: 'am', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '1st', number: 'Singular' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἄλφα', lemma: 'ἄλφα', gloss: 'Alpha', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ὦ,', lemma: 'ὦ', gloss: 'Omega', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἡ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἀρχὴ', lemma: 'ἀρχή', gloss: 'beginning', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'τέλος.', lemma: 'τέλος', gloss: 'end', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
  ],
 },
];

// =============================================================================
// EXPORT: Question accessors
// =============================================================================

export function getQuestionsForHW7Section(sectionId: HW7SectionId): HomeworkQuestion[] {
 switch (sectionId) {
  case 1:
   return hw7Section1Questions;
  case 2:
   return hw7Section2Questions;
  case 3:
   return hw7Section3Questions;
  case 4:
   return hw7Section4Questions;
  case 5:
   return hw7Section5Questions;
  case 6:
   return hw7Section6Questions;
  default:
   return [];
 }
}

export function getHW7QuestionById(sectionId: HW7SectionId, questionId: string): HomeworkQuestion | undefined {
 const questions = getQuestionsForHW7Section(sectionId);
 return questions.find(q => q.id === questionId);
}

export function getHW7TotalQuestions(): number {
 return (
  hw7Section1Questions.length +
  hw7Section2Questions.length +
  hw7Section3Questions.length +
  hw7Section4Questions.length +
  hw7Section5Questions.length +
  hw7Section6Questions.length
 );
}
