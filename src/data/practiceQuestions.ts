import {
  getCaseDescription,
  getTenseDescription,
  getVoiceDescription,
  getMoodDescription,
} from '@/lib/morphology';

type QuestionType = 'case' | 'tense' | 'voice' | 'mood';

export interface PracticeQuestionData {
  word: string;
  lexicalForm: string;
  gloss: string;
  questionType: QuestionType;
  correctAnswer: string;
  explanation: string;
}

export const CASE_QUESTIONS: PracticeQuestionData[] = [
  // 2nd declension masculine
  { word: 'λόγου', lexicalForm: 'λόγος', gloss: 'word', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'ἀδελφῷ', lexicalForm: 'ἀδελφός', gloss: 'brother', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'θεόν', lexicalForm: 'θεός', gloss: 'God', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'κύριος', lexicalForm: 'κύριος', gloss: 'Lord', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
  { word: 'υἱοί', lexicalForm: 'υἱός', gloss: 'son', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
  { word: 'λαῶν', lexicalForm: 'λαός', gloss: 'people', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'οὐρανοῖς', lexicalForm: 'οὐρανός', gloss: 'heaven', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'ἀποστόλους', lexicalForm: 'ἀπόστολος', gloss: 'apostle', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  // 1st declension feminine
  { word: 'ἀγάπην', lexicalForm: 'ἀγάπη', gloss: 'love', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'ἀρχῆς', lexicalForm: 'ἀρχή', gloss: 'beginning', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'καρδίᾳ', lexicalForm: 'καρδία', gloss: 'heart', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'δόξαν', lexicalForm: 'δόξα', gloss: 'glory', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'ἐκκλησία', lexicalForm: 'ἐκκλησία', gloss: 'church', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
  { word: 'ἀληθείας', lexicalForm: 'ἀλήθεια', gloss: 'truth', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  // 1st declension masculine
  { word: 'μαθητοῦ', lexicalForm: 'μαθητής', gloss: 'disciple', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'προφήτην', lexicalForm: 'προφήτης', gloss: 'prophet', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  // 3rd declension
  { word: 'πνεύματος', lexicalForm: 'πνεῦμα', gloss: 'spirit', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'ἀνθρώπῳ', lexicalForm: 'ἄνθρωπος', gloss: 'man', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'σάρκα', lexicalForm: 'σάρξ', gloss: 'flesh', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'ὀνόματι', lexicalForm: 'ὄνομα', gloss: 'name', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'σώματος', lexicalForm: 'σῶμα', gloss: 'body', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'πίστεως', lexicalForm: 'πίστις', gloss: 'faith', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'χάριτι', lexicalForm: 'χάρις', gloss: 'grace', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'ἐλπίδα', lexicalForm: 'ἐλπίς', gloss: 'hope', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  // Vocative
  { word: 'κύριε', lexicalForm: 'κύριος', gloss: 'Lord', questionType: 'case', correctAnswer: 'Vocative', explanation: getCaseDescription('vocative') },
  { word: 'πάτερ', lexicalForm: 'πατήρ', gloss: 'father', questionType: 'case', correctAnswer: 'Vocative', explanation: getCaseDescription('vocative') },
  // 2nd declension neuter
  { word: 'ἔργα', lexicalForm: 'ἔργον', gloss: 'work', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
  { word: 'εὐαγγελίου', lexicalForm: 'εὐαγγέλιον', gloss: 'gospel', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
];

export const TENSE_QUESTIONS: PracticeQuestionData[] = [
  // λύω paradigm
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἔλυσα', lexicalForm: 'λύω', gloss: 'I loosed', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'λέλυκα', lexicalForm: 'λύω', gloss: 'I have loosed', questionType: 'tense', correctAnswer: 'Perfect', explanation: getTenseDescription('perfect') },
  { word: 'ἔλυον', lexicalForm: 'λύω', gloss: 'I was loosing', questionType: 'tense', correctAnswer: 'Imperfect', explanation: getTenseDescription('imperfect') },
  { word: 'λύσω', lexicalForm: 'λύω', gloss: 'I will loose', questionType: 'tense', correctAnswer: 'Future', explanation: getTenseDescription('future') },
  { word: 'ἐλελύκειν', lexicalForm: 'λύω', gloss: 'I had loosed', questionType: 'tense', correctAnswer: 'Pluperfect', explanation: getTenseDescription('pluperfect') },
  // πιστεύω
  { word: 'πιστεύω', lexicalForm: 'πιστεύω', gloss: 'I believe', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἐπίστευσα', lexicalForm: 'πιστεύω', gloss: 'I believed', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'πεπίστευκα', lexicalForm: 'πιστεύω', gloss: 'I have believed', questionType: 'tense', correctAnswer: 'Perfect', explanation: getTenseDescription('perfect') },
  // γράφω
  { word: 'γράφω', lexicalForm: 'γράφω', gloss: 'I write', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἔγραψα', lexicalForm: 'γράφω', gloss: 'I wrote', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'ἔγραφον', lexicalForm: 'γράφω', gloss: 'I was writing', questionType: 'tense', correctAnswer: 'Imperfect', explanation: getTenseDescription('imperfect') },
  { word: 'γέγραφα', lexicalForm: 'γράφω', gloss: 'I have written', questionType: 'tense', correctAnswer: 'Perfect', explanation: getTenseDescription('perfect') },
  // ἀκούω
  { word: 'ἀκούω', lexicalForm: 'ἀκούω', gloss: 'I hear', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἤκουσα', lexicalForm: 'ἀκούω', gloss: 'I heard', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'ἤκουον', lexicalForm: 'ἀκούω', gloss: 'I was hearing', questionType: 'tense', correctAnswer: 'Imperfect', explanation: getTenseDescription('imperfect') },
  { word: 'ἀκούσω', lexicalForm: 'ἀκούω', gloss: 'I will hear', questionType: 'tense', correctAnswer: 'Future', explanation: getTenseDescription('future') },
  // 2nd aorist verbs
  { word: 'ἔλαβον', lexicalForm: 'λαμβάνω', gloss: 'I received', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'ἦλθον', lexicalForm: 'ἔρχομαι', gloss: 'I came', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'εἶπον', lexicalForm: 'λέγω', gloss: 'I said', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'εἶδον', lexicalForm: 'ὁράω', gloss: 'I saw', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'ἔγνων', lexicalForm: 'γινώσκω', gloss: 'I knew', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  // Contract verbs
  { word: 'ἀγαπῶ', lexicalForm: 'ἀγαπάω', gloss: 'I love', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἠγάπησα', lexicalForm: 'ἀγαπάω', gloss: 'I loved', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'ἐζήτουν', lexicalForm: 'ζητέω', gloss: 'I was seeking', questionType: 'tense', correctAnswer: 'Imperfect', explanation: getTenseDescription('imperfect') },
  { word: 'πεπλήρωκα', lexicalForm: 'πληρόω', gloss: 'I have fulfilled', questionType: 'tense', correctAnswer: 'Perfect', explanation: getTenseDescription('perfect') },
  // Deponent
  { word: 'ἐρχόμεθα', lexicalForm: 'ἔρχομαι', gloss: 'we come', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἐγενόμην', lexicalForm: 'γίνομαι', gloss: 'I became', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
];

export const VOICE_QUESTIONS: PracticeQuestionData[] = [
  // Active
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'γράφω', lexicalForm: 'γράφω', gloss: 'I write', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'ἀκούει', lexicalForm: 'ἀκούω', gloss: 'he hears', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'ἔλυσαν', lexicalForm: 'λύω', gloss: 'they loosed', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'βλέπομεν', lexicalForm: 'βλέπω', gloss: 'we see', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  // Middle/Passive (present)
  { word: 'λύομαι', lexicalForm: 'λύω', gloss: 'I am loosed / I loose for myself', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
  { word: 'γράφομαι', lexicalForm: 'γράφω', gloss: 'I am written', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
  { word: 'γίνεται', lexicalForm: 'γίνομαι', gloss: 'it becomes', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
  { word: 'ἐργάζεται', lexicalForm: 'ἐργάζομαι', gloss: 'he works', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
  // Passive (aorist — distinct form)
  { word: 'ἐλύθην', lexicalForm: 'λύω', gloss: 'I was loosed', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  { word: 'ἐγράφην', lexicalForm: 'γράφω', gloss: 'I was written', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  { word: 'ἠγέρθη', lexicalForm: 'ἐγείρω', gloss: 'he was raised', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  { word: 'ἐβαπτίσθη', lexicalForm: 'βαπτίζω', gloss: 'he was baptized', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  { word: 'ἐδιδάχθησαν', lexicalForm: 'διδάσκω', gloss: 'they were taught', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  // Middle (aorist — distinct form)
  { word: 'ἐλυσάμην', lexicalForm: 'λύω', gloss: 'I loosed for myself', questionType: 'voice', correctAnswer: 'Middle', explanation: getVoiceDescription('middle') },
  { word: 'ἐγενόμην', lexicalForm: 'γίνομαι', gloss: 'I became', questionType: 'voice', correctAnswer: 'Middle', explanation: getVoiceDescription('middle') },
  { word: 'ἀπεκρίνατο', lexicalForm: 'ἀποκρίνομαι', gloss: 'he answered', questionType: 'voice', correctAnswer: 'Middle', explanation: getVoiceDescription('middle') },
  { word: 'προσηύξατο', lexicalForm: 'προσεύχομαι', gloss: 'he prayed', questionType: 'voice', correctAnswer: 'Middle', explanation: getVoiceDescription('middle') },
];

export const MOOD_QUESTIONS: PracticeQuestionData[] = [
  // Indicative
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'mood', correctAnswer: 'Indicative', explanation: getMoodDescription('indicative') },
  { word: 'πιστεύει', lexicalForm: 'πιστεύω', gloss: 'he believes', questionType: 'mood', correctAnswer: 'Indicative', explanation: getMoodDescription('indicative') },
  { word: 'ἔγραψεν', lexicalForm: 'γράφω', gloss: 'he wrote', questionType: 'mood', correctAnswer: 'Indicative', explanation: getMoodDescription('indicative') },
  // Subjunctive
  { word: 'λύσωμεν', lexicalForm: 'λύω', gloss: 'let us loose', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  { word: 'πιστεύσωμεν', lexicalForm: 'πιστεύω', gloss: 'let us believe', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  { word: 'ἔχωμεν', lexicalForm: 'ἔχω', gloss: 'that we might have', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  { word: 'ἀγαπῶμεν', lexicalForm: 'ἀγαπάω', gloss: 'let us love', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  // Imperative
  { word: 'λῦε', lexicalForm: 'λύω', gloss: 'loose! (keep loosing)', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
  { word: 'πίστευε', lexicalForm: 'πιστεύω', gloss: 'believe!', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
  { word: 'ἀγάπα', lexicalForm: 'ἀγαπάω', gloss: 'love!', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
  { word: 'μετανοεῖτε', lexicalForm: 'μετανοέω', gloss: 'repent!', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
  // Infinitive
  { word: 'λύειν', lexicalForm: 'λύω', gloss: 'to loose (ongoing)', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'λῦσαι', lexicalForm: 'λύω', gloss: 'to loose', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'πιστεύειν', lexicalForm: 'πιστεύω', gloss: 'to believe', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'γράφειν', lexicalForm: 'γράφω', gloss: 'to write', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'λελυκέναι', lexicalForm: 'λύω', gloss: 'to have loosed', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'λυθῆναι', lexicalForm: 'λύω', gloss: 'to be loosed', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  // Participle
  { word: 'λύων', lexicalForm: 'λύω', gloss: 'loosing (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'λύσας', lexicalForm: 'λύω', gloss: 'having loosed (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'λυόμενος', lexicalForm: 'λύω', gloss: 'being loosed (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'λυθείς', lexicalForm: 'λύω', gloss: 'having been loosed (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'λελυκώς', lexicalForm: 'λύω', gloss: 'having loosed (perf, masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'πιστεύων', lexicalForm: 'πιστεύω', gloss: 'believing (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'πιστεύσας', lexicalForm: 'πιστεύω', gloss: 'having believed (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'γράφων', lexicalForm: 'γράφω', gloss: 'writing (masc nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'λέγουσα', lexicalForm: 'λέγω', gloss: 'saying (fem nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  { word: 'ἐρχόμενον', lexicalForm: 'ἔρχομαι', gloss: 'coming (neut nom sg)', questionType: 'mood', correctAnswer: 'Participle', explanation: getMoodDescription('participle') },
  // Optative (rare in NT)
  { word: 'λύσαι', lexicalForm: 'λύω', gloss: 'may he loose', questionType: 'mood', correctAnswer: 'Optative', explanation: getMoodDescription('optative') },
  { word: 'γένοιτο', lexicalForm: 'γίνομαι', gloss: 'may it be (μὴ γένοιτο!)', questionType: 'mood', correctAnswer: 'Optative', explanation: getMoodDescription('optative') },
];
