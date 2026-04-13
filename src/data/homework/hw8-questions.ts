import type { MCQQuestion, TranslationQuestion, HomeworkQuestion } from '@/types/homework';

// HW8 Section ID type
export type HW8SectionId = 1 | 2 | 3 | 4 | 5 | 6;

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
 grammaticalCase: string,
 number: string,
 gender: string,
 declension: string,
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
  question: `Parse this ${declension} ${gender.toLowerCase()} noun form (case and number):`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} from ${lexicalForm} (${meaning}). This is a ${declension} noun.`,
  category: `${declension}-${gender}`,
 };
};

// =============================================================================
// UTILITY: Create adjective parsing question with randomized options
// =============================================================================
const createAdjectiveQuestion = (
 id: string,
 greek: string,
 grammaticalCase: string,
 number: string,
 gender: string,
 lexicalForm: string,
 meaning: string,
 additionalNote?: string
): MCQQuestion => {
 const correctAnswer = `${grammaticalCase} ${number} ${gender}`;

 const cases = ['Nominative', 'Genitive', 'Dative', 'Accusative'];
 const numbers = ['Singular', 'Plural'];
 const genders = ['Masculine', 'Feminine', 'Neuter'];

 const wrongOptions: string[] = [];
 for (const c of cases) {
  for (const n of numbers) {
   for (const g of genders) {
    const option = `${c} ${n} ${g}`;
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

 const explanation = additionalNote
  ? `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} from ${lexicalForm} (${meaning}). ${additionalNote}`
  : `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} from ${lexicalForm} (${meaning}).`;

 return {
  id,
  type: 'mcq',
  question: `Parse this adjective form (case, number, gender):`,
  greek,
  options,
  correctIndex,
  explanation,
  category: 'adjective',
 };
};

// =============================================================================
// UTILITY: Create infinitive identification question
// =============================================================================
const createInfinitiveQuestion = (
 id: string,
 greek: string,
 tense: string,
 voice: string,
 lexicalForm: string,
 meaning: string
): MCQQuestion => {
 const correctAnswer = `${tense} ${voice} Infinitive`;

 const tenses = ['Present', '1st Aorist', 'Perfect'];
 const voices = ['Active', 'Middle', 'Passive'];

 const wrongOptions: string[] = [];
 for (const t of tenses) {
  for (const v of voices) {
   const option = `${t} ${v} Infinitive`;
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
  question: `Identify the tense and voice of this infinitive:`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is the ${tense.toLowerCase()} ${voice.toLowerCase()} infinitive from ${lexicalForm} (${meaning}).`,
  category: `${tense}-${voice}-infinitive`,
 };
};

// =============================================================================
// SECTION 1: 3rd Declension Nouns — Masculine, Feminine, Neuter (12 questions)
// =============================================================================

const hw8Section1Questions: MCQQuestion[] = [
 // Q1: Concept - recognizing 3rd declension
 {
  id: 'h8s1-q1',
  type: 'mcq',
  question: 'What is the key characteristic that distinguishes 3rd declension nouns from 1st and 2nd declension?',
  options: [
   'They always use the article τό',
   'Their stems end in a consonant (or a vowel other than α/η or ο)',
   'They have no plural forms',
   'They use the same endings as 2nd declension but with different accents',
  ],
  correctIndex: 1,
  explanation: '3rd declension nouns have stems ending in consonants (like -ρ, -ν, -ντ, -κ, -τ) or vowels other than α/η or ο. This creates distinctive ending patterns not seen in 1st or 2nd declension.',
  category: 'concept',
 },
 // Q2: Concept - finding the stem
 {
  id: 'h8s1-q2',
  type: 'mcq',
  question: 'How do you find the stem of a 3rd declension noun?',
  options: [
   'Remove the -ος from the nominative singular',
   'Remove the ending from the genitive singular (-ος)',
   'Remove the -α from the nominative singular',
   'The stem is always the same as the nominative',
  ],
  correctIndex: 1,
  explanation: 'The stem of a 3rd declension noun is found by removing the -ος ending from the genitive singular. For example, σάρξ (nom) → σαρκ-ός (gen) → stem σαρκ-. The nominative singular is often modified and unreliable for finding the stem.',
  category: 'concept',
 },
 // Q3-Q5: Masculine 3rd declension (σάρξ, σαρκός — flesh)
 createNounQuestion('h8s1-q3', 'σάρξ', 'Nominative', 'Singular', 'Feminine', '3rd declension', 'σάρξ, σαρκός', 'flesh'),
 createNounQuestion('h8s1-q4', 'σαρκός', 'Genitive', 'Singular', 'Feminine', '3rd declension', 'σάρξ, σαρκός', 'flesh'),
 createNounQuestion('h8s1-q5', 'σαρκί', 'Dative', 'Singular', 'Feminine', '3rd declension', 'σάρξ, σαρκός', 'flesh'),
 // Q6-Q7: Feminine 3rd declension (ἐλπίς, ἐλπίδος — hope)
 createNounQuestion('h8s1-q6', 'ἐλπίς', 'Nominative', 'Singular', 'Feminine', '3rd declension', 'ἐλπίς, ἐλπίδος', 'hope'),
 createNounQuestion('h8s1-q7', 'ἐλπίδος', 'Genitive', 'Singular', 'Feminine', '3rd declension', 'ἐλπίς, ἐλπίδος', 'hope'),
 // Q8-Q9: Neuter 3rd declension (πνεῦμα, πνεύματος — spirit)
 createNounQuestion('h8s1-q8', 'πνεῦμα', 'Nominative', 'Singular', 'Neuter', '3rd declension', 'πνεῦμα, πνεύματος', 'spirit'),
 createNounQuestion('h8s1-q9', 'πνεύματος', 'Genitive', 'Singular', 'Neuter', '3rd declension', 'πνεῦμα, πνεύματος', 'spirit'),
 // Q10: Neuter 3rd declension (ὄνομα, ὀνόματος — name)
 createNounQuestion('h8s1-q10', 'ὀνόματι', 'Dative', 'Singular', 'Neuter', '3rd declension', 'ὄνομα, ὀνόματος', 'name'),
 // Q11-Q12: Biblical application
 {
  id: 'h8s1-q11',
  type: 'mcq',
  question: 'In John 1:14, ὁ λόγος σὰρξ ἐγένετο — what declension is σάρξ?',
  greek: 'σάρξ',
  options: ['1st declension', '2nd declension', '3rd declension', '4th declension'],
  correctIndex: 2,
  explanation: 'σάρξ (flesh) is a 3rd declension feminine noun (genitive σαρκός). The stem is σαρκ-, found by removing -ός from the genitive. "The Word became flesh" — this 3rd declension noun is one of the most theologically significant in the NT.',
  category: 'biblical-application',
 },
 {
  id: 'h8s1-q12',
  type: 'mcq',
  question: 'In Matt 28:19, βαπτίζοντες αὐτοὺς εἰς τὸ ὄνομα — what case is ὄνομα here?',
  greek: 'ὄνομα',
  options: ['Nominative singular', 'Accusative singular', 'Genitive singular', 'Dative singular'],
  correctIndex: 1,
  explanation: 'ὄνομα here is accusative singular (identical to nominative in neuter 3rd declension nouns). The preposition εἰς takes the accusative case: "baptizing them into the name."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 2: 3rd Declension Pronouns (12 questions)
// =============================================================================

const hw8Section2Questions: MCQQuestion[] = [
 // Q1: Concept - τίς (interrogative)
 {
  id: 'h8s2-q1',
  type: 'mcq',
  question: 'What is the difference between τίς (with accent) and τις (without accent)?',
  options: [
   'They are the same word',
   'τίς is interrogative and τις is indefinite',
   'τίς is masculine and τις is feminine',
   'τίς is singular and τις is plural',
  ],
  correctIndex: 1,
  explanation: 'τίς (accented) is the interrogative pronoun: "who?" or "what?" τις (unaccented/enclitic) is the indefinite pronoun: "someone," "something," "a certain." Both decline the same way as 3rd declension nouns.',
  category: 'concept',
 },
 // Q2: Concept - 3rd declension pronoun pattern
 {
  id: 'h8s2-q2',
  type: 'mcq',
  question: 'Which set of endings does the interrogative/indefinite pronoun τίς/τις follow?',
  options: [
   '1st declension endings (like ὥρα)',
   '2nd declension endings (like λόγος)',
   '3rd declension endings (stem τιν-)',
   'Irregular endings unlike any declension',
  ],
  correctIndex: 2,
  explanation: 'τίς/τις follows 3rd declension endings with the stem τιν-. The genitive is τίνος, dative τίνι, accusative τίνα — all standard 3rd declension patterns.',
  category: 'concept',
 },
 // Q3-Q6: Interrogative pronoun forms (τίς)
 createNounQuestion('h8s2-q3', 'τίς', 'Nominative', 'Singular', 'Masculine/Feminine', '3rd declension', 'τίς', 'who?/what?'),
 createNounQuestion('h8s2-q4', 'τίνος', 'Genitive', 'Singular', 'Masculine/Feminine', '3rd declension', 'τίς', 'who?/what?'),
 createNounQuestion('h8s2-q5', 'τίνι', 'Dative', 'Singular', 'Masculine/Feminine', '3rd declension', 'τίς', 'who?/what?'),
 createNounQuestion('h8s2-q6', 'τίνα', 'Accusative', 'Singular', 'Masculine', '3rd declension', 'τίς', 'who?/what?'),
 // Q7-Q8: Neuter forms
 createNounQuestion('h8s2-q7', 'τί', 'Nominative', 'Singular', 'Neuter', '3rd declension', 'τίς', 'who?/what?'),
 createNounQuestion('h8s2-q8', 'τίνες', 'Nominative', 'Plural', 'Masculine/Feminine', '3rd declension', 'τίς', 'who?/what?'),
 // Q9-Q10: Indefinite pronoun forms (τις)
 {
  id: 'h8s2-q9',
  type: 'mcq',
  question: 'Parse the form τινά (unaccented):',
  greek: 'τινά',
  options: ['Nominative singular masculine', 'Accusative singular masculine (indefinite)', 'Genitive singular neuter', 'Dative singular feminine'],
  correctIndex: 1,
  explanation: 'τινά (unaccented) is the accusative singular masculine/feminine of the indefinite pronoun τις: "someone" or "a certain one." It follows the same 3rd declension pattern as τίς but is enclitic.',
  category: '3rd-declension-pronoun',
 },
 {
  id: 'h8s2-q10',
  type: 'mcq',
  question: 'Parse the form τινός (unaccented):',
  greek: 'τινός',
  options: ['Nominative singular', 'Accusative singular', 'Genitive singular (indefinite)', 'Dative singular'],
  correctIndex: 2,
  explanation: 'τινός (unaccented) is the genitive singular of the indefinite pronoun τις: "of someone" or "of a certain one." Same form as τίνος but without the accent.',
  category: '3rd-declension-pronoun',
 },
 // Q11-Q12: Biblical application
 {
  id: 'h8s2-q11',
  type: 'mcq',
  question: 'In Matt 16:15, ὑμεῖς δὲ τίνα με λέγετε εἶναι; — what kind of pronoun is τίνα?',
  greek: 'τίνα',
  options: ['Indefinite pronoun', 'Relative pronoun', 'Interrogative pronoun', 'Personal pronoun'],
  correctIndex: 2,
  explanation: 'τίνα is the accusative singular masculine of the interrogative pronoun τίς: "But who do you say that I am?" The accent distinguishes it from the indefinite τινά.',
  category: 'biblical-application',
 },
 {
  id: 'h8s2-q12',
  type: 'mcq',
  question: 'In Acts 17:18, τί ἂν θέλοι ὁ σπερμολόγος οὗτος λέγειν; — what form is τί?',
  greek: 'τί',
  options: ['Accusative singular neuter (interrogative: "what?")', 'Nominative singular masculine', 'Dative singular neuter', 'Genitive singular'],
  correctIndex: 0,
  explanation: 'τί is the accusative singular neuter of the interrogative pronoun τίς: "What would this babbler wish to say?" The neuter nominative and accusative forms are identical: τί.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 3: Adjectives of 3rd and 1st Declensions — πᾶς and εἷς (12 questions)
// =============================================================================

const hw8Section3Questions: MCQQuestion[] = [
 // Q1: Concept - 3-1-3 adjective pattern
 {
  id: 'h8s3-q1',
  type: 'mcq',
  question: 'What does the "3-1-3" pattern mean for adjectives like πᾶς (all)?',
  options: [
   'It has 3 forms total',
   'Masculine follows 3rd decl, feminine follows 1st decl, neuter follows 3rd decl',
   'It only appears in 3 cases',
   'It has 3 stems',
  ],
  correctIndex: 1,
  explanation: 'A "3-1-3" adjective uses 3rd declension endings for masculine (πᾶς, παντός) and neuter (πᾶν, παντός), but 1st declension endings for feminine (πᾶσα, πάσης). This is the standard pattern for many important Greek adjectives.',
  category: 'concept',
 },
 // Q2: Concept - εἷς/μία/ἕν
 {
  id: 'h8s3-q2',
  type: 'mcq',
  question: 'The numeral εἷς ("one") has three gender forms. What are they?',
  options: [
   'εἷς, εἷσα, εἷσον',
   'εἷς, μία, ἕν',
   'εἷς, μίη, ἕνα',
   'εἷς, εἷς, εἷς',
  ],
  correctIndex: 1,
  explanation: 'εἷς (masc), μία (fem), ἕν (neut). The feminine μία is completely different from the masculine — this is one of the most irregular "adjectives" in Greek, but the forms are very common in the NT.',
  category: 'concept',
 },
 // Q3-Q6: πᾶς forms
 createAdjectiveQuestion('h8s3-q3', 'πᾶς', 'Nominative', 'Singular', 'Masculine', 'πᾶς, πᾶσα, πᾶν', 'all/every', 'πᾶς follows 3rd declension for masculine, with stem παντ-.'),
 createAdjectiveQuestion('h8s3-q4', 'παντός', 'Genitive', 'Singular', 'Masculine', 'πᾶς, πᾶσα, πᾶν', 'all/every', 'The genitive shows the true stem: παντ- + ος.'),
 createAdjectiveQuestion('h8s3-q5', 'πᾶσα', 'Nominative', 'Singular', 'Feminine', 'πᾶς, πᾶσα, πᾶν', 'all/every', 'The feminine πᾶσα follows 1st declension (alpha-pure pattern).'),
 createAdjectiveQuestion('h8s3-q6', 'πᾶν', 'Nominative', 'Singular', 'Neuter', 'πᾶς, πᾶσα, πᾶν', 'all/every', 'Neuter nominative/accusative singular πᾶν follows 3rd declension.'),
 // Q7-Q8: More πᾶς forms
 createAdjectiveQuestion('h8s3-q7', 'πάντες', 'Nominative', 'Plural', 'Masculine', 'πᾶς, πᾶσα, πᾶν', 'all/every'),
 createAdjectiveQuestion('h8s3-q8', 'πάντων', 'Genitive', 'Plural', 'Masculine', 'πᾶς, πᾶσα, πᾶν', 'all/every'),
 // Q9-Q10: εἷς forms
 createAdjectiveQuestion('h8s3-q9', 'εἷς', 'Nominative', 'Singular', 'Masculine', 'εἷς, μία, ἕν', 'one', 'εἷς has no plural forms (it means "one").'),
 createAdjectiveQuestion('h8s3-q10', 'μία', 'Nominative', 'Singular', 'Feminine', 'εἷς, μία, ἕν', 'one', 'The feminine μία follows 1st declension.'),
 // Q11-Q12: Biblical application
 {
  id: 'h8s3-q11',
  type: 'mcq',
  question: 'In 1 Cor 12:12, τὸ σῶμά ἐστιν ἓν καὶ μέλη πολλὰ ἔχει — parse ἕν:',
  greek: 'ἕν',
  options: ['Nominative singular masculine', 'Nominative/Accusative singular neuter', 'Genitive singular', 'Dative singular'],
  correctIndex: 1,
  explanation: 'ἕν is the nominative singular neuter of εἷς: "the body is one and has many members." The neuter form matches the neuter noun σῶμα.',
  category: 'biblical-application',
 },
 {
  id: 'h8s3-q12',
  type: 'mcq',
  question: 'In Rom 3:23, πάντες γὰρ ἥμαρτον — parse πάντες:',
  greek: 'πάντες',
  options: ['Accusative plural masculine', 'Nominative plural masculine', 'Genitive plural masculine', 'Dative plural masculine'],
  correctIndex: 1,
  explanation: 'πάντες is nominative plural masculine from πᾶς: "for all have sinned." The nominative case makes it the subject of the sentence.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 4: πολύς and μέγας (12 questions)
// =============================================================================

const hw8Section4Questions: MCQQuestion[] = [
 // Q1: Concept - irregular pattern
 {
  id: 'h8s4-q1',
  type: 'mcq',
  question: 'What is unusual about the declension of πολύς (much/many) and μέγας (great/large)?',
  options: [
   'They are completely irregular with no pattern',
   'The nominative and accusative singular use short stems (πολύ-/μεγα-), but all other forms use longer stems (πολλ-/μεγαλ-) and follow standard 2-1-2 patterns',
   'They only have plural forms',
   'They use 1st declension endings throughout',
  ],
  correctIndex: 1,
  explanation: 'πολύς and μέγας are "two-stem" adjectives. The nominative and accusative singular masculine/neuter use short stems (πολύς, πολύ / μέγας, μέγα), but all other forms switch to longer stems (πολλ-, μεγαλ-) and follow regular 2-1-2 adjective patterns.',
  category: 'concept',
 },
 // Q2: Concept - identifying which stem
 {
  id: 'h8s4-q2',
  type: 'mcq',
  question: 'Which forms of πολύς use the short stem πολύ-?',
  options: [
   'All forms',
   'Only the nominative singular masculine and neuter, and accusative singular neuter',
   'All singular forms',
   'Only the plural forms',
  ],
  correctIndex: 1,
  explanation: 'The short stem πολύ- appears only in: nominative singular masculine (πολύς), nominative/accusative singular neuter (πολύ), and accusative singular masculine (πολύν). All other forms use πολλ- (e.g., πολλοῦ, πολλῆς, πολλῶν).',
  category: 'concept',
 },
 // Q3-Q6: πολύς forms
 createAdjectiveQuestion('h8s4-q3', 'πολύς', 'Nominative', 'Singular', 'Masculine', 'πολύς, πολλή, πολύ', 'much/many', 'Short stem form — only nom/acc sg masc/neut.'),
 createAdjectiveQuestion('h8s4-q4', 'πολλοῦ', 'Genitive', 'Singular', 'Masculine', 'πολύς, πολλή, πολύ', 'much/many', 'Long stem πολλ- with regular 2nd decl endings.'),
 createAdjectiveQuestion('h8s4-q5', 'πολλή', 'Nominative', 'Singular', 'Feminine', 'πολύς, πολλή, πολύ', 'much/many', 'Long stem πολλ- with regular 1st decl endings.'),
 createAdjectiveQuestion('h8s4-q6', 'πολλοί', 'Nominative', 'Plural', 'Masculine', 'πολύς, πολλή, πολύ', 'much/many', 'All plural forms use the long stem πολλ-.'),
 // Q7-Q10: μέγας forms
 createAdjectiveQuestion('h8s4-q7', 'μέγας', 'Nominative', 'Singular', 'Masculine', 'μέγας, μεγάλη, μέγα', 'great/large', 'Short stem form — only nom/acc sg masc/neut.'),
 createAdjectiveQuestion('h8s4-q8', 'μεγάλου', 'Genitive', 'Singular', 'Masculine', 'μέγας, μεγάλη, μέγα', 'great/large', 'Long stem μεγαλ- with regular 2nd decl endings.'),
 createAdjectiveQuestion('h8s4-q9', 'μεγάλη', 'Nominative', 'Singular', 'Feminine', 'μέγας, μεγάλη, μέγα', 'great/large', 'Long stem μεγαλ- with regular 1st decl endings.'),
 createAdjectiveQuestion('h8s4-q10', 'μέγα', 'Nominative', 'Singular', 'Neuter', 'μέγας, μεγάλη, μέγα', 'great/large', 'Short stem form (neuter nom/acc singular).'),
 // Q11-Q12: Biblical application
 {
  id: 'h8s4-q11',
  type: 'mcq',
  question: 'In Mark 4:39, ἐγένετο γαλήνη μεγάλη — parse μεγάλη:',
  greek: 'μεγάλη',
  options: ['Nominative singular feminine (long stem)', 'Genitive singular feminine', 'Dative singular feminine', 'Accusative singular feminine'],
  correctIndex: 0,
  explanation: 'μεγάλη is nominative singular feminine from μέγας, using the long stem μεγαλ- with 1st declension ending: "there was a great calm." It agrees with γαλήνη (calm, feminine).',
  category: 'biblical-application',
 },
 {
  id: 'h8s4-q12',
  type: 'mcq',
  question: 'In Luke 1:49, ἐποίησέν μοι μεγάλα ὁ δυνατός — parse μεγάλα:',
  greek: 'μεγάλα',
  options: ['Nominative singular feminine', 'Genitive singular neuter', 'Accusative plural neuter', 'Dative plural neuter'],
  correctIndex: 2,
  explanation: 'μεγάλα is accusative plural neuter from μέγας (using long stem μεγαλ-): "the Mighty One has done great things for me." Neuter plural accusative matches neuter plural nominative.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 5: Infinitive — Present, 1st Aorist, Perfect (12 questions)
// =============================================================================

const hw8Section5Questions: MCQQuestion[] = [
 // Q1: Concept - infinitive overview
 {
  id: 'h8s5-q1',
  type: 'mcq',
  question: 'What is the basic function of the Greek infinitive?',
  options: [
   'To express commands',
   'To express the verbal idea as a noun (a verbal noun — "to loose," "to believe")',
   'To express wishes',
   'To indicate past tense only',
  ],
  correctIndex: 1,
  explanation: 'The infinitive is a verbal noun — it expresses the action of the verb in noun form. λύειν = "to loose" (present), λῦσαι = "to loose" (aorist), λελυκέναι = "to have loosed" (perfect). It has tense and voice but no person or number.',
  category: 'concept',
 },
 // Q2: Concept - identifying infinitive endings
 {
  id: 'h8s5-q2',
  type: 'mcq',
  question: 'Which ending identifies the present active infinitive?',
  options: ['-σαι', '-ειν', '-κέναι', '-σθαι'],
  correctIndex: 1,
  explanation: 'The present active infinitive ends in -ειν: λύ-ειν, πιστεύ-ειν. This is the most common infinitive form in the NT.',
  category: 'concept',
 },
 // Q3-Q5: Present infinitives
 createInfinitiveQuestion('h8s5-q3', 'λύειν', 'Present', 'Active', 'λύω', 'to loose'),
 createInfinitiveQuestion('h8s5-q4', 'λύεσθαι', 'Present', 'Middle/Passive', 'λύω', 'to loose oneself / to be loosed'),
 createInfinitiveQuestion('h8s5-q5', 'πιστεύειν', 'Present', 'Active', 'πιστεύω', 'to believe'),
 // Q6-Q8: 1st Aorist infinitives
 createInfinitiveQuestion('h8s5-q6', 'λῦσαι', '1st Aorist', 'Active', 'λύω', 'to loose'),
 createInfinitiveQuestion('h8s5-q7', 'λύσασθαι', '1st Aorist', 'Middle', 'λύω', 'to loose for oneself'),
 createInfinitiveQuestion('h8s5-q8', 'λυθῆναι', '1st Aorist', 'Passive', 'λύω', 'to be loosed'),
 // Q9-Q10: Perfect infinitives
 createInfinitiveQuestion('h8s5-q9', 'λελυκέναι', 'Perfect', 'Active', 'λύω', 'to have loosed'),
 createInfinitiveQuestion('h8s5-q10', 'λελύσθαι', 'Perfect', 'Middle/Passive', 'λύω', 'to have been loosed'),
 // Q11-Q12: Biblical application
 {
  id: 'h8s5-q11',
  type: 'mcq',
  question: 'In Phil 1:21, ἐμοὶ γὰρ τὸ ζῆν Χριστὸς καὶ τὸ ἀποθανεῖν κέρδος — what tense are the infinitives ζῆν and ἀποθανεῖν?',
  greek: 'τὸ ζῆν... τὸ ἀποθανεῖν',
  options: [
   'Both are present active infinitives',
   'ζῆν is present active, ἀποθανεῖν is 2nd aorist active',
   'Both are aorist active infinitives',
   'ζῆν is perfect, ἀποθανεῖν is present',
  ],
  correctIndex: 1,
  explanation: 'ζῆν is the present active infinitive from ζάω ("to live" — ongoing life), and ἀποθανεῖν is the 2nd aorist active infinitive from ἀποθνῄσκω ("to die" — the event of death). The article τό makes them substantival: "for to me, living [is] Christ and dying [is] gain."',
  category: 'biblical-application',
 },
 {
  id: 'h8s5-q12',
  type: 'mcq',
  question: 'In Luke 24:46, ἔδει παθεῖν τὸν χριστὸν καὶ ἀναστῆναι — what kind of infinitives are παθεῖν and ἀναστῆναι?',
  greek: 'παθεῖν... ἀναστῆναι',
  options: [
   'Present active infinitives',
   '2nd aorist active infinitives',
   'Perfect active infinitives',
   '1st aorist passive infinitives',
  ],
  correctIndex: 1,
  explanation: 'Both παθεῖν (from πάσχω, "to suffer") and ἀναστῆναι (from ἀνίστημι, "to rise") are 2nd aorist active infinitives. They express completed events: "it was necessary for the Christ to suffer and to rise."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 6: Verse Practice (10 translation questions)
// =============================================================================

const hw8Section6Questions: TranslationQuestion[] = [
 // V1: John 1:14 — σάρξ (3rd decl noun), πᾶσα usage
 {
  id: 'h8s6-q1',
  type: 'translation',
  reference: 'John 1:14a',
  greek: 'καὶ ὁ λόγος σὰρξ ἐγένετο καὶ ἐσκήνωσεν ἐν ἡμῖν.',
  transliteration: 'kai ho logos sarx egeneto kai eskēnōsen en hēmin.',
  referenceTranslation: 'And the Word became flesh and dwelt among us.',
  keyTerms: ['Word', 'flesh', 'became', 'dwelt', 'among us'],
  difficulty: 1,
  notes: 'σάρξ is a 3rd declension feminine noun; ἐγένετο is aorist middle deponent of γίνομαι',
  vocabHelp: 'λόγος = Word; σάρξ = flesh; γίνομαι = become; σκηνόω = dwell/tabernacle',
  words: [
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'λόγος', lemma: 'λόγος', gloss: 'Word', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'σὰρξ', lemma: 'σάρξ', gloss: 'flesh', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἐγένετο', lemma: 'γίνομαι', gloss: 'became', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἐσκήνωσεν', lemma: 'σκηνόω', gloss: 'dwelt/tabernacled', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἐν', lemma: 'ἐν', gloss: 'among', parsing: { pos: 'preposition' } },
   { surface: 'ἡμῖν.', lemma: 'ἐγώ', gloss: 'us', parsing: { pos: 'pronoun', case: 'Dative', number: 'Plural' } },
  ],
 },

 // V2: Rom 3:23 — πάντες (all)
 {
  id: 'h8s6-q2',
  type: 'translation',
  reference: 'Rom 3:23',
  greek: 'πάντες γὰρ ἥμαρτον καὶ ὑστεροῦνται τῆς δόξης τοῦ θεοῦ.',
  transliteration: 'pantes gar hēmarton kai hysterountai tēs doxēs tou theou.',
  referenceTranslation: 'For all have sinned and fall short of the glory of God.',
  keyTerms: ['all', 'sinned', 'fall short', 'glory', 'God'],
  difficulty: 1,
  notes: 'πάντες is nominative plural masculine from πᾶς; ἥμαρτον is 2nd aorist active indicative',
  vocabHelp: 'πᾶς = all/every; ἁμαρτάνω = sin; ὑστερέω = fall short; δόξα = glory',
  words: [
   { surface: 'πάντες', lemma: 'πᾶς', gloss: 'all', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'γὰρ', lemma: 'γάρ', gloss: 'for', parsing: { pos: 'conjunction' } },
   { surface: 'ἥμαρτον', lemma: 'ἁμαρτάνω', gloss: 'sinned', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ὑστεροῦνται', lemma: 'ὑστερέω', gloss: 'fall short', parsing: { pos: 'verb', tense: 'Present', voice: 'Middle/Passive', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'τῆς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δόξης', lemma: 'δόξα', gloss: 'glory', parsing: { pos: 'noun', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'of', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεοῦ.', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V3: Eph 4:4-6 — εἷς/μία/ἕν (one)
 {
  id: 'h8s6-q3',
  type: 'translation',
  reference: 'Eph 4:4-5a',
  greek: 'ἓν σῶμα καὶ ἓν πνεῦμα, εἷς κύριος, μία πίστις, ἓν βάπτισμα.',
  transliteration: 'hen sōma kai hen pneuma, heis kyrios, mia pistis, hen baptisma.',
  referenceTranslation: 'One body and one Spirit, one Lord, one faith, one baptism.',
  keyTerms: ['one', 'body', 'Spirit', 'Lord', 'faith', 'baptism'],
  difficulty: 1,
  notes: 'εἷς/μία/ἕν all mean "one" — each form matches the gender of its noun',
  vocabHelp: 'σῶμα = body; πνεῦμα = spirit; κύριος = Lord; πίστις = faith; βάπτισμα = baptism',
  words: [
   { surface: 'ἓν', lemma: 'εἷς', gloss: 'one', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'σῶμα', lemma: 'σῶμα', gloss: 'body', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἓν', lemma: 'εἷς', gloss: 'one', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'πνεῦμα,', lemma: 'πνεῦμα', gloss: 'Spirit', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'εἷς', lemma: 'εἷς', gloss: 'one', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'κύριος,', lemma: 'κύριος', gloss: 'Lord', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'μία', lemma: 'εἷς', gloss: 'one', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'πίστις,', lemma: 'πίστις', gloss: 'faith', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἓν', lemma: 'εἷς', gloss: 'one', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'βάπτισμα.', lemma: 'βάπτισμα', gloss: 'baptism', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
  ],
 },

 // V4: Mark 4:39 — μεγάλη (great)
 {
  id: 'h8s6-q4',
  type: 'translation',
  reference: 'Mark 4:39b',
  greek: 'καὶ ἐκόπασεν ὁ ἄνεμος, καὶ ἐγένετο γαλήνη μεγάλη.',
  transliteration: 'kai ekopasen ho anemos, kai egeneto galēnē megalē.',
  referenceTranslation: 'And the wind ceased, and there was a great calm.',
  keyTerms: ['wind', 'ceased', 'great', 'calm'],
  difficulty: 1,
  notes: 'μεγάλη is nominative singular feminine from μέγας, using the long stem μεγαλ-',
  vocabHelp: 'κοπάζω = cease; ἄνεμος = wind; γίνομαι = become/happen; γαλήνη = calm; μέγας = great',
  words: [
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἐκόπασεν', lemma: 'κοπάζω', gloss: 'ceased', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἄνεμος,', lemma: 'ἄνεμος', gloss: 'wind', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἐγένετο', lemma: 'γίνομαι', gloss: 'there was', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'γαλήνη', lemma: 'γαλήνη', gloss: 'calm', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'μεγάλη.', lemma: 'μέγας', gloss: 'great', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
  ],
 },

 // V5: Phil 1:21 — infinitives ζῆν, ἀποθανεῖν
 {
  id: 'h8s6-q5',
  type: 'translation',
  reference: 'Phil 1:21',
  greek: 'ἐμοὶ γὰρ τὸ ζῆν Χριστὸς καὶ τὸ ἀποθανεῖν κέρδος.',
  transliteration: 'emoi gar to zēn Christos kai to apothanein kerdos.',
  referenceTranslation: 'For to me, to live is Christ and to die is gain.',
  keyTerms: ['live', 'Christ', 'die', 'gain'],
  difficulty: 2,
  notes: 'ζῆν is present active infinitive from ζάω; ἀποθανεῖν is 2nd aorist active infinitive from ἀποθνῄσκω; both are articular infinitives (τὸ + inf)',
  vocabHelp: 'ζάω = live; Χριστός = Christ; ἀποθνῄσκω = die; κέρδος = gain',
  words: [
   { surface: 'ἐμοὶ', lemma: 'ἐγώ', gloss: 'to me', parsing: { pos: 'pronoun', case: 'Dative', number: 'Singular' } },
   { surface: 'γὰρ', lemma: 'γάρ', gloss: 'for', parsing: { pos: 'conjunction' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the (art.)', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ζῆν', lemma: 'ζάω', gloss: 'to live', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Infinitive' } },
   { surface: 'Χριστὸς', lemma: 'Χριστός', gloss: 'Christ', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the (art.)', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἀποθανεῖν', lemma: 'ἀποθνῄσκω', gloss: 'to die', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Infinitive' } },
   { surface: 'κέρδος.', lemma: 'κέρδος', gloss: 'gain', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
  ],
 },

 // V6: Matt 16:15 — τίνα (interrogative pronoun)
 {
  id: 'h8s6-q6',
  type: 'translation',
  reference: 'Matt 16:15',
  greek: 'ὑμεῖς δὲ τίνα με λέγετε εἶναι;',
  transliteration: 'hymeis de tina me legete einai?',
  referenceTranslation: 'But who do you say that I am?',
  keyTerms: ['who', 'you', 'say', 'am'],
  difficulty: 2,
  notes: 'τίνα is accusative singular masculine of the interrogative τίς; εἶναι is present active infinitive of εἰμί in indirect discourse',
  vocabHelp: 'τίς = who?; λέγω = say; εἰμί = am/be',
  words: [
   { surface: 'ὑμεῖς', lemma: 'σύ', gloss: 'you (pl)', parsing: { pos: 'pronoun', case: 'Nominative', number: 'Plural' } },
   { surface: 'δὲ', lemma: 'δέ', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'τίνα', lemma: 'τίς', gloss: 'whom?', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'με', lemma: 'ἐγώ', gloss: 'me', parsing: { pos: 'pronoun', case: 'Accusative', number: 'Singular' } },
   { surface: 'λέγετε', lemma: 'λέγω', gloss: 'do you say', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '2nd', number: 'Plural' } },
   { surface: 'εἶναι;', lemma: 'εἰμί', gloss: 'to be', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Infinitive' } },
  ],
 },

 // V7: 1 Tim 3:16 — μέγα + 3rd decl noun
 {
  id: 'h8s6-q7',
  type: 'translation',
  reference: '1 Tim 3:16a',
  greek: 'μέγα ἐστὶν τὸ τῆς εὐσεβείας μυστήριον.',
  transliteration: 'mega estin to tēs eusebeias mystērion.',
  referenceTranslation: 'Great is the mystery of godliness.',
  keyTerms: ['great', 'mystery', 'godliness'],
  difficulty: 2,
  notes: 'μέγα is nominative singular neuter (short stem) from μέγας; μυστήριον is a 2nd declension neuter noun',
  vocabHelp: 'μέγας = great; εὐσέβεια = godliness/piety; μυστήριον = mystery',
  words: [
   { surface: 'μέγα', lemma: 'μέγας', gloss: 'great', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἐστὶν', lemma: 'εἰμί', gloss: 'is', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'τῆς', lemma: 'ὁ', gloss: 'of the', parsing: { pos: 'article', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'εὐσεβείας', lemma: 'εὐσέβεια', gloss: 'godliness', parsing: { pos: 'noun', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'μυστήριον.', lemma: 'μυστήριον', gloss: 'mystery', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
  ],
 },

 // V8: John 4:24 — πνεῦμα (3rd decl) + infinitive
 {
  id: 'h8s6-q8',
  type: 'translation',
  reference: 'John 4:24',
  greek: 'πνεῦμα ὁ θεός, καὶ τοὺς προσκυνοῦντας αὐτὸν ἐν πνεύματι καὶ ἀληθείᾳ δεῖ προσκυνεῖν.',
  transliteration: 'pneuma ho theos, kai tous proskynountas auton en pneumati kai alētheia dei proskynein.',
  referenceTranslation: 'God is spirit, and those who worship him must worship in spirit and truth.',
  keyTerms: ['spirit', 'God', 'worship', 'truth'],
  difficulty: 3,
  notes: 'πνεῦμα is 3rd declension neuter; δεῖ + infinitive (προσκυνεῖν) = "it is necessary to worship"',
  vocabHelp: 'πνεῦμα = spirit; προσκυνέω = worship; ἀλήθεια = truth; δεῖ = it is necessary',
  words: [
   { surface: 'πνεῦμα', lemma: 'πνεῦμα', gloss: 'spirit', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: '-', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεός,', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'τοὺς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'προσκυνοῦντας', lemma: 'προσκυνέω', gloss: 'worshipping (ones)', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Accusative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'αὐτὸν', lemma: 'αὐτός', gloss: 'him', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐν', lemma: 'ἐν', gloss: 'in', parsing: { pos: 'preposition' } },
   { surface: 'πνεύματι', lemma: 'πνεῦμα', gloss: 'spirit', parsing: { pos: 'noun', case: 'Dative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἀληθείᾳ', lemma: 'ἀλήθεια', gloss: 'truth', parsing: { pos: 'noun', case: 'Dative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δεῖ', lemma: 'δεῖ', gloss: 'it is necessary', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'προσκυνεῖν.', lemma: 'προσκυνέω', gloss: 'to worship', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Infinitive' } },
  ],
 },

 // V9: Luke 1:49 — μεγάλα + πᾶσαι
 {
  id: 'h8s6-q9',
  type: 'translation',
  reference: 'Luke 1:49',
  greek: 'ὅτι ἐποίησέν μοι μεγάλα ὁ δυνατός, καὶ ἅγιον τὸ ὄνομα αὐτοῦ.',
  transliteration: 'hoti epoiēsen moi megala ho dynatos, kai hagion to onoma autou.',
  referenceTranslation: 'For the Mighty One has done great things for me, and holy is his name.',
  keyTerms: ['Mighty One', 'great things', 'done', 'holy', 'name'],
  difficulty: 2,
  notes: 'μεγάλα is accusative plural neuter from μέγας (long stem); ὄνομα is a 3rd declension neuter noun',
  vocabHelp: 'ποιέω = do/make; μέγας = great; δυνατός = mighty/powerful; ἅγιος = holy; ὄνομα = name',
  words: [
   { surface: 'ὅτι', lemma: 'ὅτι', gloss: 'for/because', parsing: { pos: 'conjunction' } },
   { surface: 'ἐποίησέν', lemma: 'ποιέω', gloss: 'has done', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'μοι', lemma: 'ἐγώ', gloss: 'for me', parsing: { pos: 'pronoun', case: 'Dative', number: 'Singular' } },
   { surface: 'μεγάλα', lemma: 'μέγας', gloss: 'great things', parsing: { pos: 'adjective', case: 'Accusative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'δυνατός,', lemma: 'δυνατός', gloss: 'Mighty One', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καὶ', lemma: 'καί', gloss: 'and', parsing: { pos: 'conjunction' } },
   { surface: 'ἅγιον', lemma: 'ἅγιος', gloss: 'holy', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ὄνομα', lemma: 'ὄνομα', gloss: 'name', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'αὐτοῦ.', lemma: 'αὐτός', gloss: 'his', parsing: { pos: 'pronoun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V10: 1 Cor 13:13 — μεγάλη + πάντων + πίστις (3rd decl)
 {
  id: 'h8s6-q10',
  type: 'translation',
  reference: '1 Cor 13:13',
  greek: 'νυνὶ δὲ μένει πίστις, ἐλπίς, ἀγάπη, τὰ τρία ταῦτα· μείζων δὲ τούτων ἡ ἀγάπη.',
  transliteration: 'nyni de menei pistis, elpis, agapē, ta tria tauta; meizōn de toutōn hē agapē.',
  referenceTranslation: 'And now faith, hope, and love remain — these three; but the greatest of these is love.',
  keyTerms: ['faith', 'hope', 'love', 'remain', 'greatest', 'three'],
  difficulty: 2,
  notes: 'πίστις and ἐλπίς are 3rd declension feminine nouns; μείζων is the comparative of μέγας (3rd declension form)',
  vocabHelp: 'μένω = remain; πίστις = faith; ἐλπίς = hope; ἀγάπη = love; μείζων = greater/greatest; τρία = three',
  words: [
   { surface: 'νυνὶ', lemma: 'νυνί', gloss: 'now', parsing: { pos: 'adverb' } },
   { surface: 'δὲ', lemma: 'δέ', gloss: 'and/but', parsing: { pos: 'conjunction' } },
   { surface: 'μένει', lemma: 'μένω', gloss: 'remain', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'πίστις,', lemma: 'πίστις', gloss: 'faith', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἐλπίς,', lemma: 'ἐλπίς', gloss: 'hope', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἀγάπη,', lemma: 'ἀγάπη', gloss: 'love', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'τὰ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'τρία', lemma: 'τρεῖς', gloss: 'three', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'ταῦτα·', lemma: 'οὗτος', gloss: 'these', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'μείζων', lemma: 'μέγας', gloss: 'greatest', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δὲ', lemma: 'δέ', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'τούτων', lemma: 'οὗτος', gloss: 'of these', parsing: { pos: 'pronoun', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
   { surface: 'ἡ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'ἀγάπη.', lemma: 'ἀγάπη', gloss: 'love', parsing: { pos: 'noun', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
  ],
 },
];

// =============================================================================
// EXPORT: Question accessors
// =============================================================================

export function getQuestionsForHW8Section(sectionId: HW8SectionId): HomeworkQuestion[] {
 switch (sectionId) {
  case 1:
   return hw8Section1Questions;
  case 2:
   return hw8Section2Questions;
  case 3:
   return hw8Section3Questions;
  case 4:
   return hw8Section4Questions;
  case 5:
   return hw8Section5Questions;
  case 6:
   return hw8Section6Questions;
  default:
   return [];
 }
}

export function getHW8QuestionById(sectionId: HW8SectionId, questionId: string): HomeworkQuestion | undefined {
 const questions = getQuestionsForHW8Section(sectionId);
 return questions.find(q => q.id === questionId);
}

export function getHW8TotalQuestions(): number {
 return (
  hw8Section1Questions.length +
  hw8Section2Questions.length +
  hw8Section3Questions.length +
  hw8Section4Questions.length +
  hw8Section5Questions.length +
  hw8Section6Questions.length
 );
}
