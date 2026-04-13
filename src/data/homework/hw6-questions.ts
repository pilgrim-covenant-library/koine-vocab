import type { MCQQuestion, TranslationQuestion, HomeworkQuestion, VerseWord } from '@/types/homework';

// HW6 Section ID type
export type HW6SectionId = 1 | 2 | 3 | 4 | 5 | 6;

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
// UTILITY: Create demonstrative pronoun question with randomized options
// =============================================================================
const createDemonstrativeQuestion = (
 id: string,
 greek: string,
 grammaticalCase: string,
 number: string,
 gender: string,
 lexicalForm: string,
 meaning: string
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

 return {
  id,
  type: 'mcq',
  question: `Identify the case, number, and gender of this demonstrative pronoun:`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} from ${lexicalForm} (${meaning}).`,
  category: 'demonstrative-pronoun',
 };
};

// =============================================================================
// UTILITY: Create reflexive pronoun question with randomized options
// =============================================================================
const createReflexiveQuestion = (
 id: string,
 greek: string,
 person: string,
 grammaticalCase: string,
 number: string,
 gender: string,
 lexicalForm: string,
 meaning: string
): MCQQuestion => {
 const correctAnswer = `${person} Person ${grammaticalCase} ${number}`;

 const persons = ['1st', '2nd', '3rd'];
 const cases = ['Genitive', 'Dative', 'Accusative']; // No nominative for reflexives
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
  question: `Identify the person, case, and number of this reflexive pronoun:`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is ${person.toLowerCase()} person ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} reflexive pronoun from ${lexicalForm} (${meaning}).`,
  category: 'reflexive-pronoun',
 };
};

// =============================================================================
// UTILITY: Create relative pronoun question with randomized options
// =============================================================================
const createRelativeQuestion = (
 id: string,
 greek: string,
 grammaticalCase: string,
 number: string,
 gender: string,
 lexicalForm: string
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

 return {
  id,
  type: 'mcq',
  question: `Identify the case, number, and gender of this relative pronoun:`,
  greek,
  options,
  correctIndex,
  explanation: `${greek} is ${grammaticalCase.toLowerCase()} ${number.toLowerCase()} ${gender.toLowerCase()} relative pronoun from ${lexicalForm} (who, which, that).`,
  category: 'relative-pronoun',
 };
};

// =============================================================================
// SECTION 1: Present Active Fem & Neut Participles (12 questions)
// =============================================================================

const hw6Section1Questions: MCQQuestion[] = [
 // Q1: Concept — feminine participle endings
 {
  id: 'h6s1-q1',
  type: 'mcq',
  question: 'Which declension pattern do feminine present active participles follow?',
  options: [
   '1st declension (like δόξα — alpha-impure)',
   '2nd declension (like λόγος)',
   '3rd declension (like σάρξ)',
   'A unique participle declension',
  ],
  correctIndex: 0,
  explanation: 'Feminine present active participles (e.g., λύουσα, λυούσης) follow the 1st declension alpha-impure pattern, similar to δόξα. The stem ends in -ουσ- with 1st declension feminine endings.',
  category: 'grammar-concept',
 },

 // Q2: Concept — neuter shares masc in gen/dat
 {
  id: 'h6s1-q2',
  type: 'mcq',
  question: 'In which cases do neuter present active participles share the same forms as the masculine?',
  options: [
   'Genitive and dative (both singular and plural)',
   'Nominative and accusative only',
   'All cases are different',
   'Dative singular only',
  ],
  correctIndex: 0,
  explanation: 'Neuter participles share the masculine forms in the genitive and dative (both singular and plural). They differ from the masculine only in the nominative and accusative, where neuter follows the typical neuter pattern (nom = acc).',
  category: 'grammar-concept',
 },

 // Q3-6: Feminine forms
 createParticipleQuestion('h6s1-q3', 'λύουσα', 'Nominative', 'Singular', 'Present', 'Active', 'Feminine', 'λύω', 'loosing'),
 createParticipleQuestion('h6s1-q4', 'λυούσης', 'Genitive', 'Singular', 'Present', 'Active', 'Feminine', 'λύω', 'of loosing'),
 createParticipleQuestion('h6s1-q5', 'λύουσαν', 'Accusative', 'Singular', 'Present', 'Active', 'Feminine', 'λύω', 'loosing'),
 createParticipleQuestion('h6s1-q6', 'λυούσαις', 'Dative', 'Plural', 'Present', 'Active', 'Feminine', 'λύω', 'to the loosing ones'),

 // Q7-10: Neuter forms
 createParticipleQuestion('h6s1-q7', 'λῦον', 'Nominative', 'Singular', 'Present', 'Active', 'Neuter', 'λύω', 'loosing'),
 createParticipleQuestion('h6s1-q8', 'λύοντος', 'Genitive', 'Singular', 'Present', 'Active', 'Neuter', 'λύω', 'of loosing'),
 createParticipleQuestion('h6s1-q9', 'λύοντα', 'Accusative', 'Plural', 'Present', 'Active', 'Neuter', 'λύω', 'loosing'),
 createParticipleQuestion('h6s1-q10', 'λύουσι(ν)', 'Dative', 'Plural', 'Present', 'Active', 'Neuter', 'λύω', 'to the loosing things'),

 // Q11-12: Biblical verses with fem/neut participles
 {
  id: 'h6s1-q11',
  type: 'mcq',
  question: 'In Acts 5:10, ἡ γυνὴ εἰσελθοῦσα — what gender is the participle εἰσελθοῦσα?',
  greek: 'ἡ γυνὴ **εἰσελθοῦσα**',
  vocabHelp: 'εἰσέρχομαι = I enter; γυνή = woman',
  options: [
   'Feminine — it agrees with γυνή (woman)',
   'Masculine — all participles are masculine',
   'Neuter — it modifies an implied neuter noun',
   'It is not a participle',
  ],
  correctIndex: 0,
  explanation: 'εἰσελθοῦσα is a feminine nominative singular aorist active participle from εἰσέρχομαι. It agrees in gender with γυνή (woman).',
  category: 'biblical-application',
 },
 {
  id: 'h6s1-q12',
  type: 'mcq',
  question: 'In Matt 13:31, κόκκῳ σινάπεως ὃν λαβὼν ἄνθρωπος ἔσπειρεν — if the subject were neuter (τὸ σπέρμα), how would λαβών change?',
  greek: 'ὃν **λαβών** ἄνθρωπος ἔσπειρεν',
  vocabHelp: 'λαμβάνω = I take; σπέρμα = seed (neuter)',
  options: [
   'λαβόν — neuter nominative singular',
   'λαβοῦσα — it would become feminine',
   'λαβών stays the same regardless of subject',
   'λαβόντος — genitive form',
  ],
  correctIndex: 0,
  explanation: 'If the subject were neuter (τὸ σπέρμα), the participle would change from λαβών (masculine) to λαβόν (neuter nominative singular), since participles must agree with their subject in gender, number, and case.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 2: εἰμί Participles (12 questions)
// =============================================================================

const hw6Section2Questions: MCQQuestion[] = [
 // Q1-2: Concept Qs
 {
  id: 'h6s2-q1',
  type: 'mcq',
  question: 'What does the participle of εἰμί (ὤν, οὖσα, ὄν) mean?',
  options: [
   '"being" — it describes a state of existence',
   '"having" — it describes possession',
   '"going" — it describes movement',
   '"seeing" — it describes perception',
  ],
  correctIndex: 0,
  explanation: 'The participle of εἰμί means "being." It is used to describe someone or something in a state of existence, often in periphrastic constructions or as an attributive/circumstantial participle.',
  category: 'grammar-concept',
 },
 {
  id: 'h6s2-q2',
  type: 'mcq',
  question: 'Which declension patterns do the εἰμί participle forms follow?',
  options: [
   'Masculine/neuter = 3rd declension; feminine = 1st declension',
   'All genders follow 2nd declension',
   'All genders follow 3rd declension',
   'Masculine = 1st; feminine = 2nd; neuter = 3rd',
  ],
  correctIndex: 0,
  explanation: 'The εἰμί participle follows the same pattern as other present active participles: masculine (ὤν) and neuter (ὄν) follow 3rd declension, while feminine (οὖσα) follows 1st declension.',
  category: 'grammar-concept',
 },

 // Q3-10: Mixed gender parsing
 createParticipleQuestion('h6s2-q3', 'ὤν', 'Nominative', 'Singular', 'Present', 'Active', 'Masculine', 'εἰμί', 'being'),
 createParticipleQuestion('h6s2-q4', 'ὄντος', 'Genitive', 'Singular', 'Present', 'Active', 'Masculine', 'εἰμί', 'of being'),
 createParticipleQuestion('h6s2-q5', 'οὖσα', 'Nominative', 'Singular', 'Present', 'Active', 'Feminine', 'εἰμί', 'being'),
 createParticipleQuestion('h6s2-q6', 'οὔσης', 'Genitive', 'Singular', 'Present', 'Active', 'Feminine', 'εἰμί', 'of being'),
 createParticipleQuestion('h6s2-q7', 'ὄν', 'Nominative', 'Singular', 'Present', 'Active', 'Neuter', 'εἰμί', 'being'),
 createParticipleQuestion('h6s2-q8', 'ὄντες', 'Nominative', 'Plural', 'Present', 'Active', 'Masculine', 'εἰμί', 'being'),
 createParticipleQuestion('h6s2-q9', 'οὔσαις', 'Dative', 'Plural', 'Present', 'Active', 'Feminine', 'εἰμί', 'to the being ones'),
 createParticipleQuestion('h6s2-q10', 'ὄντα', 'Accusative', 'Plural', 'Present', 'Active', 'Neuter', 'εἰμί', 'being'),

 // Q11-12: Biblical verses
 {
  id: 'h6s2-q11',
  type: 'mcq',
  question: 'In John 1:18, ὁ ὢν εἰς τὸν κόλπον τοῦ πατρός — parse the participle ὤν:',
  greek: 'ὁ **ὢν** εἰς τὸν κόλπον τοῦ πατρός',
  vocabHelp: 'κόλπος = bosom; πατήρ = father',
  options: [
   'Nominative Singular — masculine, "the one being"',
   'Genitive Singular — describing the father',
   'Accusative Singular — object of the preposition',
   'Dative Singular — indirect object',
  ],
  correctIndex: 0,
  explanation: 'ὤν is nominative singular masculine present active participle of εἰμί. With the article ὁ, it forms a substantival participle: "the one who is (in the bosom of the Father)." This refers to the only-begotten Son.',
  category: 'biblical-application',
 },
 {
  id: 'h6s2-q12',
  type: 'mcq',
  question: 'In Romans 13:1, αἱ δὲ οὖσαι ὑπὸ θεοῦ τεταγμέναι εἰσίν — parse οὖσαι:',
  greek: 'αἱ δὲ **οὖσαι** ὑπὸ θεοῦ τεταγμέναι εἰσίν',
  vocabHelp: 'τάσσω = I appoint/order; ὑπό + gen = by',
  options: [
   'Nominative Plural Feminine — "the ones being"',
   'Genitive Singular Feminine — "of the being one"',
   'Dative Plural Feminine — "to the being ones"',
   'Accusative Plural Feminine — "the being ones" (object)',
  ],
  correctIndex: 0,
  explanation: 'οὖσαι is nominative plural feminine present active participle of εἰμί, meaning "the [authorities] being/existing." With the article αἱ, it functions substantivally: "the ones that exist are appointed by God."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 3: Aorist Active Fem & Neut Participles (12 questions)
// =============================================================================

const hw6Section3Questions: MCQQuestion[] = [
 // Q1-2: Concept Qs
 {
  id: 'h6s3-q1',
  type: 'mcq',
  question: 'What marker identifies the 1st aorist active feminine participle?',
  options: [
   'The -σα- marker (e.g., λύσασα)',
   'The -ντ- marker (e.g., λύοντα)',
   'An augment (ε-) prefix',
   'The -θη- marker',
  ],
  correctIndex: 0,
  explanation: 'The 1st aorist active feminine participle is identified by the -σα- marker: λύσασα (nom sg), λυσάσης (gen sg), etc. This -σα- is the aorist tense marker combined with 1st declension feminine endings.',
  category: 'grammar-concept',
 },
 {
  id: 'h6s3-q2',
  type: 'mcq',
  question: 'In which cases do neuter aorist active participles share forms with the masculine?',
  options: [
   'Genitive and dative (singular and plural)',
   'Nominative and accusative only',
   'All cases are identical',
   'They never share forms',
  ],
  correctIndex: 0,
  explanation: 'Just like the present participle, the neuter aorist active participle shares masculine forms in the genitive and dative. The neuter differs only in nominative and accusative, where nom = acc (e.g., λῦσαν nom/acc sg).',
  category: 'grammar-concept',
 },

 // Q3-6: Feminine forms
 createParticipleQuestion('h6s3-q3', 'λύσασα', 'Nominative', 'Singular', 'Aorist', 'Active', 'Feminine', 'λύω', 'having loosed'),
 createParticipleQuestion('h6s3-q4', 'λυσάσης', 'Genitive', 'Singular', 'Aorist', 'Active', 'Feminine', 'λύω', 'of having loosed'),
 createParticipleQuestion('h6s3-q5', 'λύσασαν', 'Accusative', 'Singular', 'Aorist', 'Active', 'Feminine', 'λύω', 'having loosed'),
 createParticipleQuestion('h6s3-q6', 'λυσασῶν', 'Genitive', 'Plural', 'Aorist', 'Active', 'Feminine', 'λύω', 'of the having loosed ones'),

 // Q7-10: Neuter forms
 createParticipleQuestion('h6s3-q7', 'λῦσαν', 'Nominative', 'Singular', 'Aorist', 'Active', 'Neuter', 'λύω', 'having loosed'),
 createParticipleQuestion('h6s3-q8', 'λύσαντος', 'Genitive', 'Singular', 'Aorist', 'Active', 'Neuter', 'λύω', 'of having loosed'),
 createParticipleQuestion('h6s3-q9', 'λύσαντα', 'Accusative', 'Plural', 'Aorist', 'Active', 'Neuter', 'λύω', 'having loosed'),
 createParticipleQuestion('h6s3-q10', 'λύσασι(ν)', 'Dative', 'Plural', 'Aorist', 'Active', 'Neuter', 'λύω', 'to the having loosed things'),

 // Q11-12: Biblical verses
 {
  id: 'h6s3-q11',
  type: 'mcq',
  question: 'In Matt 15:25, ἡ δὲ ἐλθοῦσα προσεκύνει αὐτῷ — parse ἐλθοῦσα:',
  greek: 'ἡ δὲ **ἐλθοῦσα** προσεκύνει αὐτῷ',
  vocabHelp: 'ἔρχομαι = I come (2nd aorist: ἐλθ-); προσκυνέω = I worship',
  options: [
   'Nominative Singular Feminine Aorist — "having come"',
   'Genitive Singular Feminine Present — "of coming"',
   'Nominative Singular Masculine Aorist — "having come"',
   'Accusative Singular Feminine Aorist — "having come"',
  ],
  correctIndex: 0,
  explanation: 'ἐλθοῦσα is nominative singular feminine 2nd aorist active participle from ἔρχομαι. It agrees with the implied feminine subject (ἡ γυνή, the woman), meaning "having come, she worshipped him."',
  category: 'biblical-application',
 },
 {
  id: 'h6s3-q12',
  type: 'mcq',
  question: 'In Luke 2:15, τὸ ῥῆμα τοῦτο τὸ γεγονός — what grammatical feature does γεγονός display?',
  greek: 'τὸ ῥῆμα τοῦτο τὸ **γεγονός**',
  vocabHelp: 'ῥῆμα = word/thing (neuter); γίνομαι = I become/happen',
  options: [
   'It is a neuter participle agreeing with ῥῆμα',
   'It is a masculine participle modifying an implied subject',
   'It is a finite verb in the indicative',
   'It is a feminine participle agreeing with τοῦτο',
  ],
  correctIndex: 0,
  explanation: 'γεγονός is a neuter nominative singular perfect active participle from γίνομαι. It agrees with the neuter noun ῥῆμα. This shows how neuter participles must agree with neuter nouns.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 4: Demonstrative Pronouns (20 questions)
// =============================================================================

const hw6Section4Questions: MCQQuestion[] = [
 // Q1-2: Concept Qs
 {
  id: 'h6s4-q1',
  type: 'mcq',
  question: 'What is the difference between οὗτος and ἐκεῖνος?',
  options: [
   'οὗτος = "this" (near); ἐκεῖνος = "that" (far)',
   'οὗτος = "that" (far); ἐκεῖνος = "this" (near)',
   'They are interchangeable',
   'οὗτος = masculine only; ἐκεῖνος = feminine only',
  ],
  correctIndex: 0,
  explanation: 'οὗτος (this) refers to something near or just mentioned, while ἐκεῖνος (that) refers to something more remote or previously mentioned. This near/far distinction is similar to English "this" vs "that."',
  category: 'grammar-concept',
 },
 {
  id: 'h6s4-q2',
  type: 'mcq',
  question: 'In what syntactic position do demonstrative pronouns appear when modifying a noun?',
  options: [
   'Predicate position (outside the article-noun group)',
   'Attributive position (between article and noun)',
   'They can never modify a noun',
   'They replace the article entirely',
  ],
  correctIndex: 0,
  explanation: 'Demonstrative pronouns stand in the predicate position: οὗτος ὁ ἄνθρωπος or ὁ ἄνθρωπος οὗτος. They are NOT placed between the article and noun (attributive position), which is where adjectives typically go.',
  category: 'grammar-concept',
 },

 // Q3-10: οὗτος forms
 createDemonstrativeQuestion('h6s4-q3', 'οὗτος', 'Nominative', 'Singular', 'Masculine', 'οὗτος', 'this'),
 createDemonstrativeQuestion('h6s4-q4', 'ταύτης', 'Genitive', 'Singular', 'Feminine', 'οὗτος', 'of this'),
 createDemonstrativeQuestion('h6s4-q5', 'τούτῳ', 'Dative', 'Singular', 'Masculine', 'οὗτος', 'to this'),
 createDemonstrativeQuestion('h6s4-q6', 'ταύτην', 'Accusative', 'Singular', 'Feminine', 'οὗτος', 'this'),
 createDemonstrativeQuestion('h6s4-q7', 'τοῦτο', 'Nominative', 'Singular', 'Neuter', 'οὗτος', 'this'),
 createDemonstrativeQuestion('h6s4-q8', 'οὗτοι', 'Nominative', 'Plural', 'Masculine', 'οὗτος', 'these'),
 createDemonstrativeQuestion('h6s4-q9', 'τούτων', 'Genitive', 'Plural', 'Masculine', 'οὗτος', 'of these'),
 createDemonstrativeQuestion('h6s4-q10', 'ταῦτα', 'Nominative', 'Plural', 'Neuter', 'οὗτος', 'these things'),

 // Q11-18: ἐκεῖνος forms
 createDemonstrativeQuestion('h6s4-q11', 'ἐκεῖνος', 'Nominative', 'Singular', 'Masculine', 'ἐκεῖνος', 'that'),
 createDemonstrativeQuestion('h6s4-q12', 'ἐκείνης', 'Genitive', 'Singular', 'Feminine', 'ἐκεῖνος', 'of that'),
 createDemonstrativeQuestion('h6s4-q13', 'ἐκείνῳ', 'Dative', 'Singular', 'Masculine', 'ἐκεῖνος', 'to that'),
 createDemonstrativeQuestion('h6s4-q14', 'ἐκείνην', 'Accusative', 'Singular', 'Feminine', 'ἐκεῖνος', 'that'),
 createDemonstrativeQuestion('h6s4-q15', 'ἐκεῖνο', 'Nominative', 'Singular', 'Neuter', 'ἐκεῖνος', 'that'),
 createDemonstrativeQuestion('h6s4-q16', 'ἐκεῖνοι', 'Nominative', 'Plural', 'Masculine', 'ἐκεῖνος', 'those'),
 createDemonstrativeQuestion('h6s4-q17', 'ἐκείνων', 'Genitive', 'Plural', 'Masculine', 'ἐκεῖνος', 'of those'),
 createDemonstrativeQuestion('h6s4-q18', 'ἐκεῖνα', 'Nominative', 'Plural', 'Neuter', 'ἐκεῖνος', 'those things'),

 // Q19-20: Biblical verses
 {
  id: 'h6s4-q19',
  type: 'mcq',
  question: 'In John 3:16, οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον — what form is οὕτως?',
  greek: '**οὕτως** γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον',
  vocabHelp: 'ἀγαπάω = I love; κόσμος = world',
  options: [
   'Adverb from οὗτος meaning "thus/in this way"',
   'Nominative masculine singular demonstrative pronoun',
   'Genitive neuter singular demonstrative pronoun',
   'A conjunction meaning "because"',
  ],
  correctIndex: 0,
  explanation: 'οὕτως is the adverbial form of the demonstrative pronoun οὗτος, meaning "thus," "in this way," or "so." "For God so loved the world" = "For God loved the world in this way."',
  category: 'biblical-application',
 },
 {
  id: 'h6s4-q20',
  type: 'mcq',
  question: 'In John 19:35, ἐκεῖνος οἶδεν ὅτι ἀληθῆ λέγει — what function does ἐκεῖνος serve?',
  greek: '**ἐκεῖνος** οἶδεν ὅτι ἀληθῆ λέγει',
  vocabHelp: 'οἶδα = I know; ἀληθής = true',
  options: [
   'Substantival use — "that one [himself] knows"',
   'Attributive modifier of an implied noun',
   'Direct object of the verb οἶδεν',
   'Genitive of source — "from that one"',
  ],
  correctIndex: 0,
  explanation: 'ἐκεῖνος here functions substantivally as the subject: "that one knows that he speaks truly." When used alone (without modifying a noun), demonstratives function as pronouns: "this one," "that one."',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 5: Reflexive & Relative Pronouns (14 questions)
// =============================================================================

const hw6Section5Questions: MCQQuestion[] = [
 // Q1-2: Concept Qs
 {
  id: 'h6s5-q1',
  type: 'mcq',
  question: 'What is distinctive about reflexive pronouns compared to personal pronouns?',
  options: [
   'They refer back to the subject and have no nominative form',
   'They only exist in the 3rd person',
   'They are identical to personal pronouns in all forms',
   'They can only be used in questions',
  ],
  correctIndex: 0,
  explanation: 'Reflexive pronouns refer back to the subject of the clause. They have no nominative form because the reflexive can never be the subject — it always refers to the action\'s subject in an oblique case (gen/dat/acc).',
  category: 'grammar-concept',
 },
 {
  id: 'h6s5-q2',
  type: 'mcq',
  question: 'How does the relative pronoun agree with its antecedent?',
  options: [
   'It agrees in gender and number, but takes its case from its function in the relative clause',
   'It agrees in case, gender, and number with its antecedent',
   'It always matches the article of its antecedent',
   'It has no relationship to its antecedent',
  ],
  correctIndex: 0,
  explanation: 'The relative pronoun (ὅς, ἥ, ὅ) agrees with its antecedent in gender and number, but its case is determined by its function within the relative clause. For example, a masculine singular antecedent can have a relative pronoun in the accusative if it\'s the object of the relative clause.',
  category: 'grammar-concept',
 },

 // Q3-6: Reflexive pronoun forms
 createReflexiveQuestion('h6s5-q3', 'ἐμαυτοῦ', '1st', 'Genitive', 'Singular', 'Masculine', 'ἐμαυτοῦ', 'of myself'),
 createReflexiveQuestion('h6s5-q4', 'σεαυτῷ', '2nd', 'Dative', 'Singular', 'Masculine', 'σεαυτοῦ', 'to yourself'),
 createReflexiveQuestion('h6s5-q5', 'ἑαυτόν', '3rd', 'Accusative', 'Singular', 'Masculine', 'ἑαυτοῦ', 'himself'),
 createReflexiveQuestion('h6s5-q6', 'ἑαυτούς', '3rd', 'Accusative', 'Plural', 'Masculine', 'ἑαυτοῦ', 'themselves'),

 // Q7-10: Relative pronoun forms
 createRelativeQuestion('h6s5-q7', 'ὅς', 'Nominative', 'Singular', 'Masculine', 'ὅς'),
 createRelativeQuestion('h6s5-q8', 'ἥν', 'Accusative', 'Singular', 'Feminine', 'ὅς'),
 createRelativeQuestion('h6s5-q9', 'οὗ', 'Genitive', 'Singular', 'Masculine', 'ὅς'),
 createRelativeQuestion('h6s5-q10', 'ἅ', 'Nominative', 'Plural', 'Neuter', 'ὅς'),

 // Q11-14: Biblical verses
 {
  id: 'h6s5-q11',
  type: 'mcq',
  question: 'In Mark 12:33, τὸ ἀγαπᾶν τὸν πλησίον ὡς ἑαυτόν — what does ἑαυτόν refer to?',
  greek: 'τὸ ἀγαπᾶν τὸν πλησίον ὡς **ἑαυτόν**',
  vocabHelp: 'ἀγαπάω = I love; πλησίον = neighbor; ὡς = as',
  options: [
   'The subject — "to love your neighbor as yourself"',
   'The neighbor — "to love your neighbor as him"',
   'God — "to love your neighbor as God"',
   'No specific referent',
  ],
  correctIndex: 0,
  explanation: 'ἑαυτόν is a 3rd person accusative singular masculine reflexive pronoun meaning "himself/oneself." Here it refers back to the implied subject: "to love your neighbor as [you love] yourself."',
  category: 'biblical-application',
 },
 {
  id: 'h6s5-q12',
  type: 'mcq',
  question: 'In John 1:12, ὅσοι δὲ ἔλαβον αὐτόν — what part of speech is ὅσοι?',
  greek: '**ὅσοι** δὲ ἔλαβον αὐτόν',
  vocabHelp: 'λαμβάνω = I receive; αὐτός = him',
  options: [
   'Correlative/relative pronoun meaning "as many as"',
   'Personal pronoun meaning "they"',
   'Demonstrative pronoun meaning "these"',
   'Interrogative pronoun meaning "who?"',
  ],
  correctIndex: 0,
  explanation: 'ὅσοι is a correlative relative pronoun (from ὅσος) meaning "as many as" or "all who." It introduces a relative clause: "But as many as received him, to them he gave..."',
  category: 'biblical-application',
 },
 {
  id: 'h6s5-q13',
  type: 'mcq',
  question: 'In Phil 2:7, ἑαυτὸν ἐκένωσεν — what is the grammatical function of ἑαυτόν?',
  greek: '**ἑαυτὸν** ἐκένωσεν',
  vocabHelp: 'κενόω = I empty',
  options: [
   'Direct object — "he emptied himself"',
   'Subject — "himself emptied"',
   'Indirect object — "he emptied to himself"',
   'Genitive of description — "of himself"',
  ],
  correctIndex: 0,
  explanation: 'ἑαυτόν is accusative singular masculine reflexive pronoun functioning as the direct object of ἐκένωσεν: "he emptied himself." The reflexive shows the subject acting upon himself.',
  category: 'biblical-application',
 },
 {
  id: 'h6s5-q14',
  type: 'mcq',
  question: 'In John 4:14, ὃ δώσω αὐτῷ — parse the relative pronoun ὅ:',
  greek: '**ὃ** δώσω αὐτῷ',
  vocabHelp: 'δίδωμι = I give',
  options: [
   'Accusative Singular Neuter — direct object of δώσω',
   'Nominative Singular Neuter — subject of δώσω',
   'Genitive Singular Masculine — modifying an implied noun',
   'Dative Singular Neuter — indirect object',
  ],
  correctIndex: 0,
  explanation: 'ὅ is accusative singular neuter relative pronoun, functioning as the direct object of δώσω: "which I will give to him." Its neuter gender agrees with its antecedent (τὸ ὕδωρ, "the water"), while its accusative case reflects its role as direct object in the relative clause.',
  category: 'biblical-application',
 },
];

// =============================================================================
// SECTION 6: Verse Practice (10 translation questions)
// =============================================================================

const hw6Section6Questions: TranslationQuestion[] = [
 // V1: Feminine participle
 {
  id: 'h6s6-q1',
  type: 'translation',
  reference: 'Matt 15:25',
  greek: 'ἡ δὲ ἐλθοῦσα προσεκύνει αὐτῷ λέγουσα· κύριε, βοήθει μοι.',
  transliteration: 'hē de elthousa prosekunei autō legousa: kurie, boēthei moi.',
  referenceTranslation: 'But she, having come, was worshipping him, saying, "Lord, help me."',
  keyTerms: ['having come', 'worshipping', 'saying', 'Lord', 'help'],
  difficulty: 2,
  notes: 'Two feminine participles: ἐλθοῦσα (aorist) and λέγουσα (present)',
  vocabHelp: 'ἔρχομαι = come; προσκυνέω = worship; λέγω = say; βοηθέω = help',
  words: [
   { surface: 'ἡ', lemma: 'ὁ', gloss: 'the (she)', parsing: { pos: 'article', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δὲ', lemma: 'δέ', gloss: 'but/and', parsing: { pos: 'conjunction' } },
   { surface: 'ἐλθοῦσα', lemma: 'ἔρχομαι', gloss: 'having come', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'προσεκύνει', lemma: 'προσκυνέω', gloss: 'was worshipping', parsing: { pos: 'verb', tense: 'Imperfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'αὐτῷ', lemma: 'αὐτός', gloss: 'him', parsing: { pos: 'pronoun', case: 'Dative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'λέγουσα·', lemma: 'λέγω', gloss: 'saying', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'κύριε,', lemma: 'κύριος', gloss: 'Lord', parsing: { pos: 'noun', case: 'Vocative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'βοήθει', lemma: 'βοηθέω', gloss: 'help!', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Imperative', person: '2nd', number: 'Singular' } },
   { surface: 'μοι.', lemma: 'ἐγώ', gloss: 'me', parsing: { pos: 'pronoun', case: 'Dative', number: 'Singular' } },
  ],
 },

 // V2: Neuter participle
 {
  id: 'h6s6-q2',
  type: 'translation',
  reference: 'Mark 4:31',
  greek: 'ὡς κόκκῳ σινάπεως, ὃς ὅταν σπαρῇ ἐπὶ τῆς γῆς, μικρότερον ὂν πάντων τῶν σπερμάτων',
  transliteration: 'hōs kokkō sinapeōs, hos hotan sparē epi tēs gēs, mikroteron on pantōn tōn spermatōn',
  referenceTranslation: 'Like a grain of mustard, which, when it is sown on the earth, is smaller than all the seeds',
  keyTerms: ['grain', 'mustard', 'sown', 'earth', 'smaller', 'seeds'],
  difficulty: 3,
  notes: 'ὄν is neuter participle of εἰμί agreeing with κόκκος implied as neuter',
  vocabHelp: 'κόκκος = grain; σίναπι = mustard; σπείρω = sow; γῆ = earth; μικρός = small; σπέρμα = seed',
  words: [
   { surface: 'ὡς', lemma: 'ὡς', gloss: 'like/as', parsing: { pos: 'conjunction' } },
   { surface: 'κόκκῳ', lemma: 'κόκκος', gloss: 'grain', parsing: { pos: 'noun', case: 'Dative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'σινάπεως,', lemma: 'σίναπι', gloss: 'of mustard', parsing: { pos: 'noun', case: 'Genitive', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ὃς', lemma: 'ὅς', gloss: 'which', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὅταν', lemma: 'ὅταν', gloss: 'when', parsing: { pos: 'conjunction' } },
   { surface: 'σπαρῇ', lemma: 'σπείρω', gloss: 'it is sown', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Passive', mood: 'Subjunctive', person: '3rd', number: 'Singular' } },
   { surface: 'ἐπὶ', lemma: 'ἐπί', gloss: 'on', parsing: { pos: 'preposition' } },
   { surface: 'τῆς', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'γῆς,', lemma: 'γῆ', gloss: 'earth', parsing: { pos: 'noun', case: 'Genitive', gender: 'Feminine', number: 'Singular' } },
   { surface: 'μικρότερον', lemma: 'μικρός', gloss: 'smaller', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ὂν', lemma: 'εἰμί', gloss: 'being', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'πάντων', lemma: 'πᾶς', gloss: 'of all', parsing: { pos: 'adjective', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
   { surface: 'τῶν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
   { surface: 'σπερμάτων', lemma: 'σπέρμα', gloss: 'seeds', parsing: { pos: 'noun', case: 'Genitive', gender: 'Neuter', number: 'Plural' } },
  ],
 },

 // V3: εἰμί participle
 {
  id: 'h6s6-q3',
  type: 'translation',
  reference: 'John 1:18',
  greek: 'ὁ μονογενὴς υἱός, ὁ ὢν εἰς τὸν κόλπον τοῦ πατρός, ἐκεῖνος ἐξηγήσατο.',
  transliteration: 'ho monogenēs huios, ho ōn eis ton kolpon tou patros, ekeinos exēgēsato.',
  referenceTranslation: 'The only-begotten Son, the one being in the bosom of the Father, that one has declared him.',
  keyTerms: ['only-begotten', 'Son', 'being', 'bosom', 'Father', 'declared'],
  difficulty: 2,
  notes: 'ὤν = present participle of εἰμί; ἐκεῖνος = "that one" (demonstrative)',
  vocabHelp: 'μονογενής = only-begotten; κόλπος = bosom; πατήρ = father; ἐξηγέομαι = declare/explain',
  words: [
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'μονογενὴς', lemma: 'μονογενής', gloss: 'only-begotten', parsing: { pos: 'adjective', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'υἱός,', lemma: 'υἱός', gloss: 'Son', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the one', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὢν', lemma: 'εἰμί', gloss: 'being', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'εἰς', lemma: 'εἰς', gloss: 'in/into', parsing: { pos: 'preposition' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'κόλπον', lemma: 'κόλπος', gloss: 'bosom', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'the/of the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'πατρός,', lemma: 'πατήρ', gloss: 'Father', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐκεῖνος', lemma: 'ἐκεῖνος', gloss: 'that one', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐξηγήσατο.', lemma: 'ἐξηγέομαι', gloss: 'has declared', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Indicative', person: '3rd', number: 'Singular' } },
  ],
 },

 // V4: οὗτος
 {
  id: 'h6s6-q4',
  type: 'translation',
  reference: 'John 1:2',
  greek: 'οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν.',
  transliteration: 'houtos ēn en archē pros ton theon.',
  referenceTranslation: 'This one was in the beginning with God.',
  keyTerms: ['this one', 'was', 'beginning', 'with', 'God'],
  difficulty: 1,
  notes: 'οὗτος = demonstrative pronoun used substantivally, referring to the Logos',
  vocabHelp: 'ἀρχή = beginning; πρός + acc = with/toward; θεός = God',
  words: [
   { surface: 'οὗτος', lemma: 'οὗτος', gloss: 'this one', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἦν', lemma: 'εἰμί', gloss: 'was', parsing: { pos: 'verb', tense: 'Imperfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἐν', lemma: 'ἐν', gloss: 'in', parsing: { pos: 'preposition' } },
   { surface: 'ἀρχῇ', lemma: 'ἀρχή', gloss: 'beginning', parsing: { pos: 'noun', case: 'Dative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'πρὸς', lemma: 'πρός', gloss: 'with/toward', parsing: { pos: 'preposition' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεόν.', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V5: ἐκεῖνος
 {
  id: 'h6s6-q5',
  type: 'translation',
  reference: 'John 1:8',
  greek: 'οὐκ ἦν ἐκεῖνος τὸ φῶς, ἀλλʼ ἵνα μαρτυρήσῃ περὶ τοῦ φωτός.',
  transliteration: 'ouk ēn ekeinos to phōs, all\' hina marturēsē peri tou phōtos.',
  referenceTranslation: 'That one was not the light, but [came] that he might testify concerning the light.',
  keyTerms: ['not', 'that one', 'light', 'testify', 'concerning'],
  difficulty: 2,
  notes: 'ἐκεῖνος = demonstrative "that one" (referring to John the Baptist)',
  vocabHelp: 'φῶς = light; μαρτυρέω = testify; περί + gen = concerning',
  words: [
   { surface: 'οὐκ', lemma: 'οὐ', gloss: 'not', parsing: { pos: 'adverb' } },
   { surface: 'ἦν', lemma: 'εἰμί', gloss: 'was', parsing: { pos: 'verb', tense: 'Imperfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ἐκεῖνος', lemma: 'ἐκεῖνος', gloss: 'that one', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὸ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'φῶς,', lemma: 'φῶς', gloss: 'light', parsing: { pos: 'noun', case: 'Nominative', gender: 'Neuter', number: 'Singular' } },
   { surface: 'ἀλλʼ', lemma: 'ἀλλά', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'ἵνα', lemma: 'ἵνα', gloss: 'that/in order that', parsing: { pos: 'conjunction' } },
   { surface: 'μαρτυρήσῃ', lemma: 'μαρτυρέω', gloss: 'he might testify', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Subjunctive', person: '3rd', number: 'Singular' } },
   { surface: 'περὶ', lemma: 'περί', gloss: 'concerning', parsing: { pos: 'preposition' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Neuter', number: 'Singular' } },
   { surface: 'φωτός.', lemma: 'φῶς', gloss: 'light', parsing: { pos: 'noun', case: 'Genitive', gender: 'Neuter', number: 'Singular' } },
  ],
 },

 // V6: Relative pronoun
 {
  id: 'h6s6-q6',
  type: 'translation',
  reference: 'John 1:12',
  greek: 'ὅσοι δὲ ἔλαβον αὐτόν, ἔδωκεν αὐτοῖς ἐξουσίαν τέκνα θεοῦ γενέσθαι.',
  transliteration: 'hosoi de elabon auton, edōken autois exousian tekna theou genesthai.',
  referenceTranslation: 'But as many as received him, to them he gave the right to become children of God.',
  keyTerms: ['as many as', 'received', 'gave', 'right', 'children', 'God', 'become'],
  difficulty: 2,
  notes: 'ὅσοι = correlative relative pronoun, "as many as"',
  vocabHelp: 'λαμβάνω = receive; δίδωμι = give; ἐξουσία = authority/right; τέκνον = child; γίνομαι = become',
  words: [
   { surface: 'ὅσοι', lemma: 'ὅσος', gloss: 'as many as', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'δὲ', lemma: 'δέ', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'ἔλαβον', lemma: 'λαμβάνω', gloss: 'received', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Plural' } },
   { surface: 'αὐτόν,', lemma: 'αὐτός', gloss: 'him', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἔδωκεν', lemma: 'δίδωμι', gloss: 'he gave', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'αὐτοῖς', lemma: 'αὐτός', gloss: 'to them', parsing: { pos: 'pronoun', case: 'Dative', gender: 'Masculine', number: 'Plural' } },
   { surface: 'ἐξουσίαν', lemma: 'ἐξουσία', gloss: 'authority/right', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'τέκνα', lemma: 'τέκνον', gloss: 'children', parsing: { pos: 'noun', case: 'Accusative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'θεοῦ', lemma: 'θεός', gloss: 'of God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'γενέσθαι.', lemma: 'γίνομαι', gloss: 'to become', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Middle', mood: 'Infinitive' } },
  ],
 },

 // V7: Reflexive pronoun
 {
  id: 'h6s6-q7',
  type: 'translation',
  reference: 'Phil 2:7',
  greek: 'ἀλλὰ ἑαυτὸν ἐκένωσεν μορφὴν δούλου λαβών.',
  transliteration: 'alla heauton ekenōsen morphēn doulou labōn.',
  referenceTranslation: 'But he emptied himself, taking the form of a servant.',
  keyTerms: ['emptied', 'himself', 'form', 'servant', 'taking'],
  difficulty: 2,
  notes: 'ἑαυτόν = 3rd person reflexive pronoun "himself"; λαβών = masculine aorist participle',
  vocabHelp: 'κενόω = empty; μορφή = form; δοῦλος = servant/slave; λαμβάνω = take',
  words: [
   { surface: 'ἀλλὰ', lemma: 'ἀλλά', gloss: 'but', parsing: { pos: 'conjunction' } },
   { surface: 'ἑαυτὸν', lemma: 'ἑαυτοῦ', gloss: 'himself', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐκένωσεν', lemma: 'κενόω', gloss: 'he emptied', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'μορφὴν', lemma: 'μορφή', gloss: 'form', parsing: { pos: 'noun', case: 'Accusative', gender: 'Feminine', number: 'Singular' } },
   { surface: 'δούλου', lemma: 'δοῦλος', gloss: 'of a servant', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'λαβών.', lemma: 'λαμβάνω', gloss: 'taking/having taken', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V8: Demonstrative + participle
 {
  id: 'h6s6-q8',
  type: 'translation',
  reference: 'John 6:46',
  greek: 'οὐχ ὅτι τὸν πατέρα ἑώρακέν τις, εἰ μὴ ὁ ὢν παρὰ τοῦ θεοῦ, οὗτος ἑώρακεν τὸν πατέρα.',
  transliteration: 'ouch hoti ton patera heōraken tis, ei mē ho ōn para tou theou, houtos heōraken ton patera.',
  referenceTranslation: 'Not that anyone has seen the Father, except the one being from God — this one has seen the Father.',
  keyTerms: ['not', 'Father', 'seen', 'except', 'being', 'from God', 'this one'],
  difficulty: 3,
  notes: 'Combines ὁ ὤν (εἰμί participle with article) and οὗτος (demonstrative)',
  vocabHelp: 'ὁράω = see (perfect: ἑώρακα); τις = anyone; παρά + gen = from',
  words: [
   { surface: 'οὐχ', lemma: 'οὐ', gloss: 'not', parsing: { pos: 'adverb' } },
   { surface: 'ὅτι', lemma: 'ὅτι', gloss: 'that', parsing: { pos: 'conjunction' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'πατέρα', lemma: 'πατήρ', gloss: 'Father', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἑώρακέν', lemma: 'ὁράω', gloss: 'has seen', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'τις,', lemma: 'τις', gloss: 'anyone', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'εἰ', lemma: 'εἰ', gloss: 'if', parsing: { pos: 'conjunction' } },
   { surface: 'μὴ', lemma: 'μή', gloss: 'not (except)', parsing: { pos: 'adverb' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the one', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὢν', lemma: 'εἰμί', gloss: 'being', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'παρὰ', lemma: 'παρά', gloss: 'from', parsing: { pos: 'preposition' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεοῦ,', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'οὗτος', lemma: 'οὗτος', gloss: 'this one', parsing: { pos: 'pronoun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἑώρακεν', lemma: 'ὁράω', gloss: 'has seen', parsing: { pos: 'verb', tense: 'Perfect', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'τὸν', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'πατέρα.', lemma: 'πατήρ', gloss: 'Father', parsing: { pos: 'noun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V9: Relative + participle
 {
  id: 'h6s6-q9',
  type: 'translation',
  reference: 'John 6:51',
  greek: 'ἐγώ εἰμι ὁ ἄρτος ὁ ζῶν ὁ ἐκ τοῦ οὐρανοῦ καταβάς.',
  transliteration: 'egō eimi ho artos ho zōn ho ek tou ouranou katabas.',
  referenceTranslation: 'I am the living bread, the one having come down out of heaven.',
  keyTerms: ['I am', 'bread', 'living', 'come down', 'heaven'],
  difficulty: 2,
  notes: 'ζῶν = present participle "living"; καταβάς = aorist participle "having come down"',
  vocabHelp: 'ἄρτος = bread; ζάω = live; οὐρανός = heaven; καταβαίνω = come down',
  words: [
   { surface: 'ἐγώ', lemma: 'ἐγώ', gloss: 'I', parsing: { pos: 'pronoun', case: 'Nominative', number: 'Singular' } },
   { surface: 'εἰμι', lemma: 'εἰμί', gloss: 'am', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '1st', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἄρτος', lemma: 'ἄρτος', gloss: 'bread', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ζῶν', lemma: 'ζάω', gloss: 'living', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the one', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'ἐκ', lemma: 'ἐκ', gloss: 'out of', parsing: { pos: 'preposition' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'οὐρανοῦ', lemma: 'οὐρανός', gloss: 'heaven', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'καταβάς.', lemma: 'καταβαίνω', gloss: 'having come down', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Participle', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
  ],
 },

 // V10: Multiple HW6 elements (difficulty 3)
 {
  id: 'h6s6-q10',
  type: 'translation',
  reference: 'John 3:34',
  greek: 'ὃν γὰρ ἀπέστειλεν ὁ θεός, τὰ ῥήματα τοῦ θεοῦ λαλεῖ.',
  transliteration: 'hon gar apesteilen ho theos, ta rhēmata tou theou lalei.',
  referenceTranslation: 'For the one whom God sent speaks the words of God.',
  keyTerms: ['whom', 'God', 'sent', 'speaks', 'words'],
  difficulty: 3,
  notes: 'ὅν = relative pronoun (acc masc sg); combines relative clause with substantival use',
  vocabHelp: 'ἀποστέλλω = send; ῥῆμα = word; λαλέω = speak',
  words: [
   { surface: 'ὃν', lemma: 'ὅς', gloss: 'whom', parsing: { pos: 'pronoun', case: 'Accusative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'γὰρ', lemma: 'γάρ', gloss: 'for', parsing: { pos: 'conjunction' } },
   { surface: 'ἀπέστειλεν', lemma: 'ἀποστέλλω', gloss: 'sent', parsing: { pos: 'verb', tense: 'Aorist', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
   { surface: 'ὁ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεός,', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Nominative', gender: 'Masculine', number: 'Singular' } },
   { surface: 'τὰ', lemma: 'ὁ', gloss: 'the', parsing: { pos: 'article', case: 'Accusative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'ῥήματα', lemma: 'ῥῆμα', gloss: 'words', parsing: { pos: 'noun', case: 'Accusative', gender: 'Neuter', number: 'Plural' } },
   { surface: 'τοῦ', lemma: 'ὁ', gloss: 'of the', parsing: { pos: 'article', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'θεοῦ', lemma: 'θεός', gloss: 'God', parsing: { pos: 'noun', case: 'Genitive', gender: 'Masculine', number: 'Singular' } },
   { surface: 'λαλεῖ.', lemma: 'λαλέω', gloss: 'speaks', parsing: { pos: 'verb', tense: 'Present', voice: 'Active', mood: 'Indicative', person: '3rd', number: 'Singular' } },
  ],
 },
];

// =============================================================================
// HELPER: Get questions for a section
// =============================================================================

export function getQuestionsForHW6Section(sectionId: HW6SectionId): HomeworkQuestion[] {
 switch (sectionId) {
  case 1:
   return hw6Section1Questions;
  case 2:
   return hw6Section2Questions;
  case 3:
   return hw6Section3Questions;
  case 4:
   return hw6Section4Questions;
  case 5:
   return hw6Section5Questions;
  case 6:
   return hw6Section6Questions;
  default:
   return [];
 }
}

export function getHW6QuestionById(sectionId: HW6SectionId, questionId: string): HomeworkQuestion | undefined {
 const questions = getQuestionsForHW6Section(sectionId);
 return questions.find(q => q.id === questionId);
}

export function getHW6TotalQuestions(): number {
 return (
  hw6Section1Questions.length +
  hw6Section2Questions.length +
  hw6Section3Questions.length +
  hw6Section4Questions.length +
  hw6Section5Questions.length +
  hw6Section6Questions.length
 );
}
