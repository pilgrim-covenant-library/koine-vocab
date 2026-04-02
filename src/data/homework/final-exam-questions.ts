import type { MCQQuestion, TranslationQuestion, HomeworkQuestion } from '@/types/homework';

// Final Exam Section ID type
export type FinalExamSectionId = 1 | 2 | 3;

// =============================================================================
// UTILITY: Shuffle array
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
// SECTION 1: Grammar Understanding — 50 MCQ questions
// Covers all concepts from HW1 through HW8
// =============================================================================

const finalExamSection1Questions: MCQQuestion[] = [
 // ── HW1 CONCEPTS: Alphabet, Transliteration, Grammar Terms, Cases, Articles ──

 {
  id: 'fe-s1-q1',
  type: 'mcq',
  question: 'What is the correct transliteration of θεός?',
  greek: 'θεός',
  options: ['theos', 'deos', 'feos', 'teos'],
  correctIndex: 0,
  explanation: 'θ = th, ε = e, ο = o, ς = s. θεός = "theos" (God).',
  category: 'hw1-transliteration',
 },
 {
  id: 'fe-s1-q2',
  type: 'mcq',
  question: 'Parse τῇ:',
  greek: 'τῇ',
  options: [
   'Nominative singular feminine',
   'Genitive singular feminine',
   'Dative singular feminine',
   'Accusative singular feminine',
  ],
  correctIndex: 2,
  explanation: 'τῇ is the dative singular feminine form of the article. The -ῃ ending marks dative singular feminine in the article pattern.',
  category: 'hw1-article',
 },
 {
  id: 'fe-s1-q3',
  type: 'mcq',
  question: 'Which case is used for the direct object of a verb?',
  options: ['Nominative', 'Genitive', 'Dative', 'Accusative'],
  correctIndex: 3,
  explanation: 'The accusative case marks the direct object: τὸν λόγον (the word) in "I hear the word."',
  category: 'hw1-cases',
 },
 {
  id: 'fe-s1-q4',
  type: 'mcq',
  question: 'Parse the article τῶν:',
  greek: 'τῶν',
  options: ['Genitive plural (all genders)', 'Dative plural masculine', 'Accusative plural neuter', 'Nominative plural feminine'],
  correctIndex: 0,
  explanation: 'τῶν is the genitive plural form of the article, used for all three genders.',
  category: 'hw1-article',
 },
 {
  id: 'fe-s1-q5',
  type: 'mcq',
  question: 'Which case is used for the indirect object and with ἐν (in)?',
  options: ['Nominative', 'Genitive', 'Dative', 'Accusative'],
  correctIndex: 2,
  explanation: 'The dative case marks the indirect object and is used with prepositions like ἐν (in/among).',
  category: 'hw1-cases',
 },

 // ── HW2 CONCEPTS: 1st/2nd Declension Nouns, Personal Pronouns, Prepositions ──

 {
  id: 'fe-s1-q6',
  type: 'mcq',
  question: 'Parse λόγου:',
  greek: 'λόγου',
  options: ['Nominative singular', 'Genitive singular', 'Dative singular', 'Accusative singular'],
  correctIndex: 1,
  explanation: 'λόγου is genitive singular masculine from λόγος (word). The -ου ending is the hallmark of 2nd declension genitive singular.',
  category: 'hw2-noun',
 },
 {
  id: 'fe-s1-q7',
  type: 'mcq',
  question: 'Parse ἀγάπῃ:',
  greek: 'ἀγάπῃ',
  options: ['Nominative singular', 'Genitive singular', 'Dative singular', 'Accusative plural'],
  correctIndex: 2,
  explanation: 'ἀγάπῃ is dative singular feminine from ἀγάπη (love). The -ῃ ending (with iota subscript) marks the 1st declension dative singular.',
  category: 'hw2-noun',
 },
 {
  id: 'fe-s1-q8',
  type: 'mcq',
  question: 'What is special about neuter nouns in the nominative and accusative?',
  options: [
   'They use different endings for each',
   'The nominative and accusative forms are always identical',
   'They only have singular forms',
   'They always take the article τό',
  ],
  correctIndex: 1,
  explanation: 'In ALL declensions, neuter nouns have identical nominative and accusative forms. Neuter plural nom/acc always ends in -α.',
  category: 'hw2-noun',
 },
 {
  id: 'fe-s1-q9',
  type: 'mcq',
  question: 'Parse ἡμῶν:',
  greek: 'ἡμῶν',
  options: ['Nominative plural', 'Genitive plural', 'Dative plural', 'Accusative plural'],
  correctIndex: 1,
  explanation: 'ἡμῶν is genitive plural of the 1st person pronoun ἐγώ: "of us" or "our."',
  category: 'hw2-pronoun',
 },
 {
  id: 'fe-s1-q10',
  type: 'mcq',
  question: 'Which case does the preposition εἰς take?',
  options: ['Genitive only', 'Dative only', 'Accusative only', 'Genitive or accusative'],
  correctIndex: 2,
  explanation: 'εἰς (into, to) always takes the accusative case. Compare with ἐν (in) which always takes the dative.',
  category: 'hw2-preposition',
 },

 // ── HW3 CONCEPTS: Present Active Indicative, Imperfect, εἰμί, 1st Aorist ──

 {
  id: 'fe-s1-q11',
  type: 'mcq',
  question: 'Parse πιστεύομεν:',
  greek: 'πιστεύομεν',
  options: [
   'Present active indicative, 1st person plural',
   'Imperfect active indicative, 1st person plural',
   'Aorist active indicative, 1st person plural',
   'Present passive indicative, 1st person plural',
  ],
  correctIndex: 0,
  explanation: 'πιστεύομεν = πιστευ- (stem) + -ο- (connecting vowel) + -μεν (1st plural ending). Present active indicative: "we believe."',
  category: 'hw3-present',
 },
 {
  id: 'fe-s1-q12',
  type: 'mcq',
  question: 'What three elements identify the imperfect tense?',
  options: [
   'Reduplication + stem + primary endings',
   'Augment (ε-) + present stem + secondary endings',
   'Stem + σα + primary endings',
   'Augment + aorist stem + primary endings',
  ],
  correctIndex: 1,
  explanation: 'The imperfect uses: augment (ε- prefix) + present tense stem + secondary (past) endings. E.g., ἐ-λύ-ο-μεν.',
  category: 'hw3-imperfect',
 },
 {
  id: 'fe-s1-q13',
  type: 'mcq',
  question: 'Parse ἐστίν:',
  greek: 'ἐστίν',
  options: [
   'Present active indicative, 2nd person singular of εἰμί',
   'Present active indicative, 3rd person singular of εἰμί',
   'Imperfect of εἰμί, 3rd person singular',
   'Aorist of εἰμί, 3rd person singular',
  ],
  correctIndex: 1,
  explanation: 'ἐστίν is 3rd person singular present of εἰμί: "he/she/it is." The εἰμί conjugation is irregular.',
  category: 'hw3-eimi',
 },
 {
  id: 'fe-s1-q14',
  type: 'mcq',
  question: 'What morpheme distinguishes the 1st aorist from other tenses?',
  options: ['The augment ε-', 'The σα marker', 'Reduplication', 'The connecting vowel ο/ε'],
  correctIndex: 1,
  explanation: 'The σα (or σ) tense marker is the distinctive sign of the 1st aorist: ἐ-λύ-σα-μεν.',
  category: 'hw3-aorist',
 },
 {
  id: 'fe-s1-q15',
  type: 'mcq',
  question: 'Parse ἔλυσα:',
  greek: 'ἔλυσα',
  options: [
   'Imperfect active indicative, 1st person singular',
   '1st aorist active indicative, 1st person singular',
   'Present active indicative, 1st person singular',
   'Perfect active indicative, 1st person singular',
  ],
  correctIndex: 1,
  explanation: 'ἔλυσα = ἐ- (augment) + λυ- (stem) + σα (1st aorist marker). 1st aorist active indicative: "I loosed."',
  category: 'hw3-aorist',
 },

 // ── HW4 CONCEPTS: Future Active, Participles, Conjunctions ──

 {
  id: 'fe-s1-q16',
  type: 'mcq',
  question: 'Parse λύσομεν:',
  greek: 'λύσομεν',
  options: [
   'Present active indicative, 1st person plural',
   'Future active indicative, 1st person plural',
   '1st aorist active indicative, 1st person plural',
   'Future middle indicative, 1st person plural',
  ],
  correctIndex: 1,
  explanation: 'λύσομεν = λυ- (stem) + σ (future marker) + ομεν (1st plural ending). Future active indicative: "we will loose."',
  category: 'hw4-future',
 },
 {
  id: 'fe-s1-q17',
  type: 'mcq',
  question: 'Parse λύων:',
  greek: 'λύων',
  options: [
   'Present active participle, nominative singular masculine',
   'Present active indicative, 3rd person plural',
   'Aorist active participle, nominative singular masculine',
   'Perfect active participle, nominative singular masculine',
  ],
  correctIndex: 0,
  explanation: 'λύων is the present active participle, nominative singular masculine: "loosing." The -ων ending is characteristic.',
  category: 'hw4-participle',
 },
 {
  id: 'fe-s1-q18',
  type: 'mcq',
  question: 'Parse λύσας:',
  greek: 'λύσας',
  options: [
   'Present active participle, nominative singular masculine',
   '1st aorist active participle, nominative singular masculine',
   'Future active participle, nominative singular masculine',
   '2nd aorist active participle, nominative singular masculine',
  ],
  correctIndex: 1,
  explanation: 'λύσας = λυ- + σ (aorist marker) + -ας (masc nom sg participle ending). 1st aorist active participle: "having loosed."',
  category: 'hw4-participle',
 },
 {
  id: 'fe-s1-q19',
  type: 'mcq',
  question: 'What is the function of a participle in Greek?',
  options: [
   'It replaces the main verb of the sentence',
   'It is a verbal adjective that can modify nouns or express attendant circumstances',
   'It expresses only future actions',
   'It always appears at the beginning of a sentence',
  ],
  correctIndex: 1,
  explanation: 'A participle is a verbal adjective: it has properties of both verbs (tense, voice) and adjectives (case, gender, number).',
  category: 'hw4-participle',
 },
 {
  id: 'fe-s1-q20',
  type: 'mcq',
  question: 'What does the conjunction ἀλλά mean?',
  options: ['"and"', '"but" (strong contrast)', '"or"', '"for/because"'],
  correctIndex: 1,
  explanation: 'ἀλλά means "but" and introduces a strong contrast. Compare with δέ which is a milder "but/and."',
  category: 'hw4-conjunction',
 },

 // ── HW5 CONCEPTS: Middle/Passive Voice, Deponent Verbs, Contract Verbs ──

 {
  id: 'fe-s1-q21',
  type: 'mcq',
  question: 'What is the difference between middle and passive voice in Greek?',
  options: [
   'There is no difference; they are always the same',
   'Middle = subject acts on itself or in its own interest; Passive = subject receives the action',
   'Middle is past tense; Passive is present tense',
   'Middle uses primary endings; Passive uses secondary endings',
  ],
  correctIndex: 1,
  explanation: 'Middle: subject acts on/for itself (λούομαι "I wash myself"). Passive: subject receives the action (λύομαι "I am being loosed").',
  category: 'hw5-voice',
 },
 {
  id: 'fe-s1-q22',
  type: 'mcq',
  question: 'Parse λύεται:',
  greek: 'λύεται',
  options: [
   'Present active indicative, 3rd person singular',
   'Present middle/passive indicative, 3rd person singular',
   'Imperfect middle/passive indicative, 3rd person singular',
   'Aorist middle indicative, 3rd person singular',
  ],
  correctIndex: 1,
  explanation: 'λύεται = λυ- + ε (connecting vowel) + ται (3rd sg middle/passive ending). "He/she/it is being loosed" or "looses for himself."',
  category: 'hw5-voice',
 },
 {
  id: 'fe-s1-q23',
  type: 'mcq',
  question: 'What is a deponent verb?',
  options: [
   'A verb that is always passive in meaning',
   'A verb with middle/passive forms but active meaning',
   'A verb that has no participle form',
   'A verb that only appears in the aorist tense',
  ],
  correctIndex: 1,
  explanation: 'Deponent verbs have middle or passive forms but translate with active meaning. E.g., ἔρχομαι (I come/go) uses middle endings but is active in meaning.',
  category: 'hw5-deponent',
 },
 {
  id: 'fe-s1-q24',
  type: 'mcq',
  question: 'Parse ποιοῦμεν:',
  greek: 'ποιοῦμεν',
  options: [
   'Present active indicative, 1st person plural',
   'Future active indicative, 1st person plural',
   'Present middle/passive indicative, 1st person plural',
   '1st aorist active indicative, 1st person plural',
  ],
  correctIndex: 0,
  explanation: 'ποιοῦμεν comes from ποιέω. ε + ο contract to ου, so ποιέομεν becomes ποιοῦμεν: present active indicative, "we do/make."',
  category: 'hw5-contract',
 },
 {
  id: 'fe-s1-q25',
  type: 'mcq',
  question: 'What are the primary middle/passive personal endings?',
  options: [
   '-ω, -εις, -ει, -ομεν, -ετε, -ουσι(ν)',
   '-μαι, -σαι, -ται, -μεθα, -σθε, -νται',
   '-ον, -ες, -ε, -ομεν, -ετε, -ον',
   '-μι, -ς, -σι, -μεν, -τε, -ασι',
  ],
  correctIndex: 1,
  explanation: 'Primary middle/passive endings: -μαι, -σαι (often → -ῃ), -ται, -μεθα, -σθε, -νται.',
  category: 'hw5-voice',
 },
 {
  id: 'fe-s1-q26',
  type: 'mcq',
  question: 'Parse ἐγένετο:',
  greek: 'ἐγένετο',
  options: [
   'Present middle indicative, 3rd person singular',
   'Imperfect middle indicative, 3rd person singular',
   '2nd aorist middle indicative, 3rd person singular',
   'Perfect middle indicative, 3rd person singular',
  ],
  correctIndex: 2,
  explanation: 'ἐγένετο = ἐ- (augment) + γεν- (2nd aorist stem of γίνομαι) + ετο (3rd sg 2nd aorist middle ending). "It became/happened."',
  category: 'hw5-deponent',
 },

 // ── HW6 CONCEPTS: Demonstratives, Relative Pronouns, Subjunctive, Imperative ──

 {
  id: 'fe-s1-q27',
  type: 'mcq',
  question: 'Parse οὗτος:',
  greek: 'οὗτος',
  options: [
   'Near demonstrative pronoun',
   'Far demonstrative pronoun',
   'Relative pronoun',
   'Interrogative pronoun',
  ],
  correctIndex: 0,
  explanation: 'οὗτος is the near demonstrative pronoun meaning "this." ἐκεῖνος is the far demonstrative meaning "that."',
  category: 'hw6-demonstrative',
 },
 {
  id: 'fe-s1-q28',
  type: 'mcq',
  question: 'What is the key identifier of the relative pronoun ὅς, ἥ, ὅ?',
  greek: 'ὅς, ἥ, ὅ',
  options: [
   'It always has a rough breathing and accent',
   'It uses the same forms as the article without the τ',
   'It always starts with τ',
   'It uses 3rd declension endings only',
  ],
  correctIndex: 0,
  explanation: 'The relative pronoun ὅς, ἥ, ὅ always has a rough breathing mark and an accent, distinguishing it from the article (which loses its τ in some forms).',
  category: 'hw6-relative',
 },
 {
  id: 'fe-s1-q29',
  type: 'mcq',
  question: 'How is the present subjunctive recognized?',
  options: [
   'By the augment ε-',
   'By lengthened connecting vowels (ω/η instead of ο/ε)',
   'By the σα morpheme',
   'By reduplication of the first consonant',
  ],
  correctIndex: 1,
  explanation: 'The subjunctive uses lengthened connecting vowels: ω and η replace the indicative\'s ο and ε. E.g., λύω (indic.) vs. λύω (subj.) — context distinguishes 1st sg.',
  category: 'hw6-subjunctive',
 },
 {
  id: 'fe-s1-q30',
  type: 'mcq',
  question: 'What mood is used for direct commands?',
  options: ['Indicative', 'Subjunctive', 'Imperative', 'Optative'],
  correctIndex: 2,
  explanation: 'The imperative mood expresses direct commands: λῦε! ("Loose!" — present) or λῦσον! ("Loose!" — aorist).',
  category: 'hw6-imperative',
 },
 {
  id: 'fe-s1-q31',
  type: 'mcq',
  question: 'Parse πιστεύητε:',
  greek: 'πιστεύητε',
  options: [
   'Present active indicative, 2nd person plural',
   'Present active subjunctive, 2nd person plural',
   '1st aorist active subjunctive, 2nd person plural',
   'Present middle/passive subjunctive, 2nd person plural',
  ],
  correctIndex: 1,
  explanation: 'πιστεύητε uses the lengthened subjunctive vowel η together with the 2nd plural ending -τε. It is present active subjunctive: "that you may believe."',
  category: 'hw6-subjunctive',
 },
 {
  id: 'fe-s1-q32',
  type: 'mcq',
  question: 'Parse ἐκείνῃ:',
  greek: 'ἐκείνῃ',
  options: [
   'Demonstrative pronoun, nominative singular feminine',
   'Demonstrative pronoun, dative singular feminine',
   'Demonstrative pronoun, genitive singular feminine',
   'Relative pronoun, dative singular feminine',
  ],
  correctIndex: 1,
  explanation: 'ἐκείνῃ is dative singular feminine of ἐκεῖνος. The -ῃ ending marks the dative singular.',
  category: 'hw6-demonstrative',
 },

 // ── HW7 CONCEPTS: Perfect Tense, 2nd Aorist, Passive Voice, Conditional ──

 {
  id: 'fe-s1-q33',
  type: 'mcq',
  question: 'What two features identify the perfect active tense?',
  options: [
   'Augment + σα marker',
   'Reduplication + κα marker',
   'Augment + secondary endings',
   'Reduplication + σ marker',
  ],
  correctIndex: 1,
  explanation: 'The perfect active uses: reduplication (repeating the first consonant + ε) + κα marker. E.g., λέ-λυ-κα.',
  category: 'hw7-perfect',
 },
 {
  id: 'fe-s1-q34',
  type: 'mcq',
  question: 'Parse λέλυκα:',
  greek: 'λέλυκα',
  options: [
   '1st aorist active indicative, 1st person singular',
   'Pluperfect active indicative, 1st person singular',
   'Perfect active indicative, 1st person singular',
   'Future perfect active indicative, 1st person singular',
  ],
  correctIndex: 2,
  explanation: 'λέλυκα = λε- (reduplication) + λυ- (stem) + κα (perfect marker). Perfect active indicative: "I have loosed."',
  category: 'hw7-perfect',
 },
 {
  id: 'fe-s1-q35',
  type: 'mcq',
  question: 'How does the 2nd aorist differ from the 1st aorist in form?',
  options: [
   'It uses a different stem rather than adding the σα morpheme',
   'It adds the σα morpheme to a different stem',
   'It uses primary endings instead of secondary endings',
   'It has no augment',
  ],
  correctIndex: 0,
  explanation: 'The 2nd aorist changes the stem itself (e.g., βαλ- from βάλλω) and uses the same endings as the imperfect, without the σα marker.',
  category: 'hw7-2nd-aorist',
 },
 {
  id: 'fe-s1-q36',
  type: 'mcq',
  question: 'Parse ἐλύθην:',
  greek: 'ἐλύθην',
  options: [
   'Imperfect passive indicative, 1st person singular',
   'Aorist passive indicative, 1st person singular',
   'Perfect passive indicative, 1st person singular',
   'Pluperfect passive indicative, 1st person singular',
  ],
  correctIndex: 1,
  explanation: 'ἐλύθην = ἐ- (augment) + λυ- (stem) + θη (aorist passive marker) + ν (1st sg ending). Aorist passive: "I was loosed."',
  category: 'hw7-passive',
 },
 {
  id: 'fe-s1-q37',
  type: 'mcq',
  question: 'What morpheme marks the aorist passive?',
  options: ['σα', 'κα', 'θη', 'μεν'],
  correctIndex: 2,
  explanation: 'The θη morpheme is the hallmark of the aorist passive: ἐ-λύ-θη-ν. It uses active secondary endings.',
  category: 'hw7-passive',
 },
 {
  id: 'fe-s1-q38',
  type: 'mcq',
  question: 'In a first-class conditional (εἰ + indicative... indicative), what is assumed?',
  options: [
   'The condition is contrary to fact',
   'The condition is a general truth',
   'The condition is a future possibility',
   'The condition is assumed true for the sake of argument',
  ],
  correctIndex: 3,
  explanation: 'A first-class conditional (εἰ + indicative) assumes the condition is true for argument: "If X is true (and it is), then Y."',
  category: 'hw7-conditional',
 },

 // ── HW8 CONCEPTS: 3rd Declension, Pronouns, Adjectives, Infinitives ──

 {
  id: 'fe-s1-q39',
  type: 'mcq',
  question: 'How do you find the stem of a 3rd declension noun?',
  options: [
   'Remove the nominative singular ending',
   'Remove the article',
   'Look at the accusative plural',
   'Remove the ending from the genitive singular form',
  ],
  correctIndex: 3,
  explanation: 'The 3rd declension stem is found by removing -ος from the genitive singular. E.g., σαρκός → σαρκ- (stem of σάρξ).',
  category: 'hw8-3rd-declension',
 },
 {
  id: 'fe-s1-q40',
  type: 'mcq',
  question: 'Parse σαρκός:',
  greek: 'σαρκός',
  options: [
   'Nominative singular',
   'Accusative singular',
   'Dative singular',
   'Genitive singular',
  ],
  correctIndex: 3,
  explanation: 'σαρκός is genitive singular of σάρξ (flesh). The -ος ending marks the 3rd declension genitive singular.',
  category: 'hw8-3rd-declension',
 },
 {
  id: 'fe-s1-q41',
  type: 'mcq',
  question: 'What are the 3rd declension dative plural endings?',
  options: ['-οις/-αις', '-ας/-ους', '-ων', '-σι(ν)'],
  correctIndex: 3,
  explanation: 'The 3rd declension dative plural ending is -σι(ν). When the stem ends in a consonant, consonant changes often occur (e.g., σαρκ + σι → σαρξί).',
  category: 'hw8-3rd-declension',
 },
 {
  id: 'fe-s1-q42',
  type: 'mcq',
  question: 'Parse πνεύματι:',
  greek: 'πνεύματι',
  options: [
   'Nominative singular neuter',
   'Genitive singular neuter',
   'Dative singular neuter',
   'Accusative singular neuter',
  ],
  correctIndex: 2,
  explanation: 'πνεύματι is dative singular of πνεῦμα (spirit). The -ι ending marks the 3rd declension dative singular.',
  category: 'hw8-3rd-declension',
 },
 {
  id: 'fe-s1-q43',
  type: 'mcq',
  question: 'What distinguishes τίς (interrogative) from τις (indefinite)?',
  greek: 'τίς / τις',
  options: [
   'They have completely different endings',
   'They have different genders',
   'The interrogative is 3rd declension; the indefinite is 1st declension',
   'The interrogative τίς has an accent; the indefinite τις is enclitic (unaccented)',
  ],
  correctIndex: 3,
  explanation: 'τίς (who? what?) always has an accent and comes first in its clause. τις (someone, a certain) is enclitic — it leans on the preceding word.',
  category: 'hw8-pronoun',
 },
 {
  id: 'fe-s1-q44',
  type: 'mcq',
  question: 'Parse πᾶσαν:',
  greek: 'πᾶσαν',
  options: [
   'Nominative singular feminine',
   'Genitive singular feminine',
   'Dative singular feminine',
   'Accusative singular feminine',
  ],
  correctIndex: 3,
  explanation: 'πᾶσαν is accusative singular feminine of πᾶς, πᾶσα, πᾶν (all/every). The feminine uses 1st declension endings (-αν for acc sg).',
  category: 'hw8-adjective',
 },
 {
  id: 'fe-s1-q45',
  type: 'mcq',
  question: 'What is unusual about the adjectives πολύς and μέγας?',
  options: [
   'They are indeclinable',
   'They follow 1st declension patterns only',
   'They only appear in the plural',
   'They have two stems: a short stem (nom/acc masc/neut sg) and a long stem (all other forms)',
  ],
  correctIndex: 3,
  explanation: 'πολύς and μέγας use a short stem in nom/acc masculine and neuter singular (πολύ-/μεγα-) and a long stem everywhere else (πολλ-/μεγαλ-).',
  category: 'hw8-adjective',
 },
 {
  id: 'fe-s1-q46',
  type: 'mcq',
  question: 'Parse πολλῶν:',
  greek: 'πολλῶν',
  options: [
   'Nominative plural masculine',
   'Accusative plural feminine',
   'Dative plural neuter',
   'Genitive plural (all genders, "of many")',
  ],
  correctIndex: 3,
  explanation: 'πολλῶν is genitive plural of πολύς (many/much), using the long stem πολλ-. The -ῶν ending marks genitive plural for all genders.',
  category: 'hw8-adjective',
 },
 {
  id: 'fe-s1-q47',
  type: 'mcq',
  question: 'What is the present active infinitive ending?',
  options: ['-σαι', '-σθαι', '-κέναι', '-ειν'],
  correctIndex: 3,
  explanation: 'The present active infinitive ends in -ειν: λύειν, πιστεύειν.',
  category: 'hw8-infinitive',
 },
 {
  id: 'fe-s1-q48',
  type: 'mcq',
  question: 'What is the 1st aorist active infinitive ending?',
  options: ['-σαι', '-ειν', '-κέναι', '-θῆναι'],
  correctIndex: 0,
  explanation: 'The 1st aorist active infinitive ends in -σαι: λῦσαι ("to loose" — once and for all). No augment on infinitives.',
  category: 'hw8-infinitive',
 },
 {
  id: 'fe-s1-q49',
  type: 'mcq',
  question: 'Parse λελυκέναι:',
  greek: 'λελυκέναι',
  options: [
   'Present active infinitive',
   '1st aorist active infinitive',
   'Perfect active infinitive',
   'Future active infinitive',
  ],
  correctIndex: 2,
  explanation: 'λελυκέναι = λε- (reduplication) + λυ- (stem) + κέναι (perfect active infinitive ending). "To have loosed."',
  category: 'hw8-infinitive',
 },
 {
  id: 'fe-s1-q50',
  type: 'mcq',
  question: 'Parse μεγάλη:',
  greek: 'μεγάλη',
  options: [
   'Nominative singular feminine',
   'Genitive singular feminine',
   'Dative singular feminine',
   'Accusative singular feminine',
  ],
  correctIndex: 0,
  explanation: 'μεγάλη is nominative singular feminine of μέγας (great), using the long stem μεγαλ- with the 1st declension feminine ending -η.',
  category: 'hw8-adjective',
 },
];

// =============================================================================
// SECTION 2: Vocabulary — 30 MCQ questions
// Key NT vocabulary across all homework units
// =============================================================================

const finalExamSection2Questions: MCQQuestion[] = [
 {
  id: 'fe-s2-q1',
  type: 'mcq',
  question: 'What does λόγος mean?',
  greek: 'λόγος',
  options: ['God', 'Love', 'Law', 'Word/message/reason'],
  correctIndex: 3,
  explanation: 'λόγος (logos) means "word, message, reason." It appears 330 times in the NT, including the famous John 1:1.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q2',
  type: 'mcq',
  question: 'What does θεός mean?',
  greek: 'θεός',
  options: ['Lord', 'Spirit', 'God', 'Father'],
  correctIndex: 2,
  explanation: 'θεός (theos) means "God" or "god." It appears over 1,300 times in the NT.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q3',
  type: 'mcq',
  question: 'What does κύριος mean?',
  greek: 'κύριος',
  options: ['Lord/master', 'King', 'Priest', 'Prophet'],
  correctIndex: 0,
  explanation: 'κύριος (kyrios) means "Lord, master, sir." It is used as a title for God and Christ throughout the NT.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q4',
  type: 'mcq',
  question: 'What does ἄνθρωπος mean?',
  greek: 'ἄνθρωπος',
  options: ['Angel', 'Disciple', 'Apostle', 'Human being/person'],
  correctIndex: 3,
  explanation: 'ἄνθρωπος (anthropos) means "human being, person, man." It appears 550 times in the NT.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q5',
  type: 'mcq',
  question: 'What does κόσμος mean?',
  greek: 'κόσμος',
  options: ['Church', 'Heaven', 'World/universe', 'Temple'],
  correctIndex: 2,
  explanation: 'κόσμος (kosmos) means "world, universe, order." John uses it extensively (e.g., John 3:16).',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q6',
  type: 'mcq',
  question: 'What does πνεῦμα mean?',
  greek: 'πνεῦμα',
  options: ['Body', 'Soul', 'Spirit/wind/breath', 'Mind'],
  correctIndex: 2,
  explanation: 'πνεῦμα (pneuma) means "spirit, wind, breath." Used for the Holy Spirit (τὸ πνεῦμα τὸ ἅγιον).',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q7',
  type: 'mcq',
  question: 'What does ἁμαρτία mean?',
  greek: 'ἁμαρτία',
  options: ['Sin', 'Righteousness', 'Grace', 'Faith'],
  correctIndex: 0,
  explanation: 'ἁμαρτία (hamartia) means "sin, missing the mark." A central theological term in Paul\'s letters.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q8',
  type: 'mcq',
  question: 'What does πίστις mean?',
  greek: 'πίστις',
  options: ['Hope', 'Love', 'Faith/trust/belief', 'Grace'],
  correctIndex: 2,
  explanation: 'πίστις (pistis) means "faith, trust, belief, faithfulness." 3rd declension noun appearing 243 times in the NT.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q9',
  type: 'mcq',
  question: 'What does χάρις mean?',
  greek: 'χάρις',
  options: ['Sin', 'Law', 'Grace/favor', 'Judgment'],
  correctIndex: 2,
  explanation: 'χάρις (charis) means "grace, favor, gift." A key Pauline term (Eph 2:8: "by grace you have been saved through faith").',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q10',
  type: 'mcq',
  question: 'What does ἐκκλησία mean?',
  greek: 'ἐκκλησία',
  options: ['Synagogue', 'Temple', 'Church/assembly', 'Kingdom'],
  correctIndex: 2,
  explanation: 'ἐκκλησία (ekklesia) means "church, assembly, congregation." From ἐκ (out) + καλέω (to call): "called-out ones."',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q11',
  type: 'mcq',
  question: 'What does βασιλεία mean?',
  greek: 'βασιλεία',
  options: ['King', 'Authority', 'Palace', 'Kingdom/reign'],
  correctIndex: 3,
  explanation: 'βασιλεία (basileia) means "kingdom, reign, royal power." Jesus proclaims the βασιλεία τοῦ θεοῦ (kingdom of God).',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q12',
  type: 'mcq',
  question: 'What does γράφω mean?',
  greek: 'γράφω',
  options: ['I write', 'I speak', 'I read', 'I teach'],
  correctIndex: 0,
  explanation: 'γράφω (grapho) means "I write." Related to γραφή (writing, Scripture) and γράμμα (letter).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q13',
  type: 'mcq',
  question: 'What does λέγω mean?',
  greek: 'λέγω',
  options: ['I write', 'I hear', 'I say/speak', 'I see'],
  correctIndex: 2,
  explanation: 'λέγω (lego) means "I say, speak, tell." The most common verb of speaking in the NT (over 2,350 occurrences).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q14',
  type: 'mcq',
  question: 'What does ἀκούω mean?',
  greek: 'ἀκούω',
  options: ['I see', 'I believe', 'I speak', 'I hear/listen'],
  correctIndex: 3,
  explanation: 'ἀκούω (akouo) means "I hear, listen to." Takes genitive (person heard) or accusative (thing heard).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q15',
  type: 'mcq',
  question: 'What does γινώσκω mean?',
  greek: 'γινώσκω',
  options: ['I know/come to know', 'I become', 'I go', 'I give'],
  correctIndex: 0,
  explanation: 'γινώσκω (ginosko) means "I know, come to know, recognize." Distinguished from οἶδα (intuitive knowledge).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q16',
  type: 'mcq',
  question: 'What does ἔρχομαι mean?',
  greek: 'ἔρχομαι',
  options: ['I go/come', 'I send', 'I take', 'I bring'],
  correctIndex: 0,
  explanation: 'ἔρχομαι (erchomai) means "I come, go." A deponent verb (middle form, active meaning). 2nd aorist: ἦλθον.',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q17',
  type: 'mcq',
  question: 'What does δίδωμι mean?',
  greek: 'δίδωμι',
  options: ['I take', 'I receive', 'I place', 'I give'],
  correctIndex: 3,
  explanation: 'δίδωμι (didomi) means "I give." A μι-verb with an irregular conjugation pattern.',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q18',
  type: 'mcq',
  question: 'What does ἀποστέλλω mean?',
  greek: 'ἀποστέλλω',
  options: ['I send (with a commission)', 'I follow', 'I lead', 'I command'],
  correctIndex: 0,
  explanation: 'ἀποστέλλω (apostello) means "I send" (with a commission or mission). Root of ἀπόστολος (apostle).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q19',
  type: 'mcq',
  question: 'What does σῴζω mean?',
  greek: 'σῴζω',
  options: ['I judge', 'I sanctify', 'I baptize', 'I save/rescue/heal'],
  correctIndex: 3,
  explanation: 'σῴζω (sozo) means "I save, rescue, heal, make whole." Related to σωτηρία (salvation) and σωτήρ (savior).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q20',
  type: 'mcq',
  question: 'What does ἀγαπάω mean?',
  greek: 'ἀγαπάω',
  options: ['I hate', 'I fear', 'I love', 'I worship'],
  correctIndex: 2,
  explanation: 'ἀγαπάω (agapao) means "I love" (selfless, unconditional love). A contract verb (-αω) related to ἀγάπη (love).',
  category: 'vocab-verb',
 },
 {
  id: 'fe-s2-q21',
  type: 'mcq',
  question: 'What does ἅγιος mean?',
  greek: 'ἅγιος',
  options: ['Holy/set apart', 'Righteous', 'Good', 'Faithful'],
  correctIndex: 0,
  explanation: 'ἅγιος (hagios) means "holy, set apart, sacred." Used for the Holy Spirit (τὸ πνεῦμα τὸ ἅγιον) and the saints (οἱ ἅγιοι).',
  category: 'vocab-adjective',
 },
 {
  id: 'fe-s2-q22',
  type: 'mcq',
  question: 'What does δίκαιος mean?',
  greek: 'δίκαιος',
  options: ['Sinful', 'Powerful', 'Merciful', 'Righteous/just'],
  correctIndex: 3,
  explanation: 'δίκαιος (dikaios) means "righteous, just, upright." Related to δικαιοσύνη (righteousness) and δικαιόω (I justify).',
  category: 'vocab-adjective',
 },
 {
  id: 'fe-s2-q23',
  type: 'mcq',
  question: 'What does αἰώνιος mean?',
  greek: 'αἰώνιος',
  options: ['Temporary', 'New', 'Eternal/everlasting', 'Ancient'],
  correctIndex: 2,
  explanation: 'αἰώνιος (aionios) means "eternal, everlasting." From αἰών (age/eternity). Key in ζωὴ αἰώνιος (eternal life).',
  category: 'vocab-adjective',
 },
 {
  id: 'fe-s2-q24',
  type: 'mcq',
  question: 'What does ἀλήθεια mean?',
  greek: 'ἀλήθεια',
  options: ['Falsehood', 'Wisdom', 'Truth', 'Knowledge'],
  correctIndex: 2,
  explanation: 'ἀλήθεια (aletheia) means "truth." Jesus declares: ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή (John 14:6).',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q25',
  type: 'mcq',
  question: 'What does οὐρανός mean?',
  greek: 'οὐρανός',
  options: ['Heaven/sky', 'Sea', 'Earth', 'Temple'],
  correctIndex: 0,
  explanation: 'οὐρανός (ouranos) means "heaven, sky." Used in βασιλεία τῶν οὐρανῶν (kingdom of the heavens) in Matthew.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q26',
  type: 'mcq',
  question: 'What does ἔργον mean?',
  greek: 'ἔργον',
  options: ['Word', 'Prayer', 'Gift', 'Work/deed/action'],
  correctIndex: 3,
  explanation: 'ἔργον (ergon) means "work, deed, action." A 2nd declension neuter noun. Key in faith vs. works discussions.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q27',
  type: 'mcq',
  question: 'What does νόμος mean?',
  greek: 'νόμος',
  options: ['Law', 'Grace', 'Covenant', 'Promise'],
  correctIndex: 0,
  explanation: 'νόμος (nomos) means "law." Frequently refers to the Mosaic Law (ὁ νόμος) in Paul\'s letters.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q28',
  type: 'mcq',
  question: 'What does δόξα mean?',
  greek: 'δόξα',
  options: ['Power', 'Majesty', 'Praise', 'Glory/honor/splendor'],
  correctIndex: 3,
  explanation: 'δόξα (doxa) means "glory, honor, splendor, brightness." Related to δοξάζω (I glorify). 1st declension noun.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q29',
  type: 'mcq',
  question: 'What does καρδία mean?',
  greek: 'καρδία',
  options: ['Heart', 'Mind', 'Spirit', 'Conscience'],
  correctIndex: 0,
  explanation: 'καρδία (kardia) means "heart" — the center of thought, emotion, and will in biblical anthropology.',
  category: 'vocab-noun',
 },
 {
  id: 'fe-s2-q30',
  type: 'mcq',
  question: 'What does ζωή mean?',
  greek: 'ζωή',
  options: ['Death', 'Soul', 'Resurrection', 'Life'],
  correctIndex: 3,
  explanation: 'ζωή (zoe) means "life" — often spiritual or eternal life. Key Johannine term: ζωὴ αἰώνιος (eternal life).',
  category: 'vocab-noun',
 },
];

// =============================================================================
// SECTION 3: Verse Translation — 5 Translation questions
// Curated as the 5 easiest single NT verses (shortest + simplest syntax)
// =============================================================================

const finalExamSection3Questions: TranslationQuestion[] = [
 {
  id: 'fe-s3-q1',
  type: 'translation',
  reference: '1 Thessalonians 5:17',
  greek: 'ἀδιαλείπτως προσεύχεσθε',
  transliteration: 'adialeiptōs proseuchesthe',
  referenceTranslation: 'Pray without ceasing.',
  keyTerms: ['ἀδιαλείπτως = without ceasing', 'προσεύχεσθε = pray'],
  difficulty: 1,
  notes: 'A two-word command with an adverb plus a present imperative.',
 },
 {
  id: 'fe-s3-q2',
  type: 'translation',
  reference: 'Romans 3:23',
  greek: 'πάντες γὰρ ἥμαρτον καὶ ὑστεροῦνται τῆς δόξης τοῦ θεοῦ,',
  transliteration: 'pantes gar hēmarton kai hysterountai tēs doxēs tou theou',
  referenceTranslation: 'For all have sinned and fall short of the glory of God.',
  keyTerms: ['πάντες = all', 'ἥμαρτον = sinned', 'ὑστεροῦνται = fall short', 'δόξης τοῦ θεοῦ = glory of God'],
  difficulty: 2,
  notes: 'Two finite verbs joined by καί; requires recognizing an aorist (ἥμαρτον) and a present middle/passive (ὑστεροῦνται) plus a genitive of separation.',
 },
 {
  id: 'fe-s3-q3',
  type: 'translation',
  reference: 'John 10:30',
  greek: 'ἐγὼ καὶ ὁ πατὴρ ἕν ἐσμεν',
  transliteration: 'egō kai ho patēr hen esmen',
  referenceTranslation: 'I and the Father are one.',
  keyTerms: ['ἐγώ = I', 'πατήρ = Father', 'ἕν = one', 'ἐσμεν = we are'],
  difficulty: 1,
  notes: 'A short equational statement with the verb εἰμί.',
 },
 {
  id: 'fe-s3-q4',
  type: 'translation',
  reference: 'Revelation 22:21',
  greek: 'Ἡ χάρις τοῦ κυρίου Ἰησοῦ μετὰ πάντων',
  transliteration: 'hē charis tou kyriou Iēsou meta pantōn',
  referenceTranslation: 'The grace of the Lord Jesus be with all.',
  keyTerms: ['χάρις = grace', 'κυρίου = of the Lord', 'Ἰησοῦ = of Jesus', 'μετά + gen = with'],
  difficulty: 1,
  notes: 'A short benediction with an implied verb ("be").',
 },
 {
  id: 'fe-s3-q5',
  type: 'translation',
  reference: '2 Corinthians 5:7',
  greek: 'διὰ πίστεως γὰρ περιπατοῦμεν οὐ διὰ εἴδους',
  transliteration: 'dia pisteōs gar peripatoumen ou dia eidous',
  referenceTranslation: 'For we walk by faith, not by sight.',
  keyTerms: ['διὰ πίστεως = by faith', 'περιπατοῦμεν = we walk', 'οὐ = not', 'εἴδους = sight'],
  difficulty: 1,
  notes: 'The repeated διὰ phrase makes the contrast easy to follow.',
 },
];

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/** Get all questions for a given final exam section */
export function getQuestionsForFinalExamSection(sectionId: FinalExamSectionId): HomeworkQuestion[] {
 switch (sectionId) {
  case 1:
   return shuffleArray(finalExamSection1Questions);
  case 2:
   return shuffleArray(finalExamSection2Questions);
  case 3:
   return shuffleArray(finalExamSection3Questions);
  default:
   return [];
 }
}

/** Get a specific question by section and question ID */
export function getFinalExamQuestionById(
 sectionId: FinalExamSectionId,
 questionId: string
): HomeworkQuestion | undefined {
 const allQuestions: Record<FinalExamSectionId, HomeworkQuestion[]> = {
  1: finalExamSection1Questions,
  2: finalExamSection2Questions,
  3: finalExamSection3Questions,
 };
 return allQuestions[sectionId]?.find((q) => q.id === questionId);
}

/** Get total number of questions across all sections */
export function getFinalExamTotalQuestions(): number {
 return (
  finalExamSection1Questions.length +
  finalExamSection2Questions.length +
  finalExamSection3Questions.length
 );
}

/** Section question counts */
export const FINAL_EXAM_SECTION_COUNTS: Record<FinalExamSectionId, number> = {
 1: finalExamSection1Questions.length,
 2: finalExamSection2Questions.length,
 3: finalExamSection3Questions.length,
};
