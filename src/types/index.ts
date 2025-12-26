// Semantic Categories for vocabulary organization
export type SemanticCategory =
  | 'name'        // Personal names (Παῦλος, Πέτρος)
  | 'place'       // Geographic locations (Ἰερουσαλήμ, Γαλιλαία)
  | 'theological' // Theological terms (ἁμαρτία, σωτηρία, χάρις)
  | 'body'        // Body parts (χείρ, πούς, ὀφθαλμός)
  | 'time'        // Time-related (ἡμέρα, ὥρα, καιρός)
  | 'family'      // Family relations (πατήρ, μήτηρ, ἀδελφός)
  | 'nature'      // Natural world (θάλασσα, οὐρανός, γῆ)
  | 'abstract'    // Abstract concepts (ἀλήθεια, δόξα, δύναμις)
  | 'emotion'     // Emotional terms (ἀγάπη, φόβος, χαρά)
  | 'religious'   // Religious practice (προσεύχομαι, βαπτίζω, ἱερόν)
  | 'authority'   // Authority/power (βασιλεύς, ἐξουσία, κύριος)
  | 'action'      // Action verbs (λέγω, ποιέω, ἔρχομαι)
  | 'speech'      // Speech/communication (λόγος, φωνή, λαλέω)
  | 'general';    // Default/uncategorized

// Part of Speech type
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'particle' | 'pronoun' | 'article' | 'interjection';

// Vocabulary Types
export interface VocabularyWord {
  id: string;
  greek: string;
  transliteration: string;
  gloss: string;
  definition: string;
  partOfSpeech: PartOfSpeech;
  frequency: number;
  tier: 1 | 2 | 3 | 4 | 5;
  strongs: string;
  examples?: string[];
  morphology?: WordMorphology;
  semanticCategory?: SemanticCategory;
  categories?: SemanticCategory[]; // Allow multiple categories
}

// Morphology Types for Greek Words
export interface WordMorphology {
  // For nouns
  gender?: 'masculine' | 'feminine' | 'neuter';
  declension?: '1st' | '2nd' | '3rd';
  // For verbs
  conjugation?: '1st' | '2nd' | 'irregular';
  principalParts?: string[]; // [present, future, aorist, perfect, perfect-mid/pass, aorist-pass]
  deponent?: boolean;
  // For adjectives
  pattern?: '2-1-2' | '3-1-3' | '2-2' | '3-3';
  // For pronouns
  person?: 1 | 2 | 3;
  // Common
  case?: 'nominative' | 'genitive' | 'dative' | 'accusative' | 'vocative';
  number?: 'singular' | 'plural';
}

// SRS Types
export interface SRSCard {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SRSResult extends SRSCard {
  nextReview: Date;
}

// User Progress Types
export interface WordProgress {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  maxRepetitions: number; // Tracks highest repetition count ever reached (for stable "learned" status)
  nextReview: Date;
  lastReview: Date | null;
  lastQuality: number;
  timesReviewed: number;
  timesCorrect: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  achievements: string[];
  wordsLearned: number;
  wordsInProgress: number;
  totalReviews: number;
  correctReviews: number;
}

// Review Session Types
export type LearningMode = 'flashcard' | 'quiz' | 'typing' | 'translation';

// NT Verse Types
export interface NTBook {
  id: string;
  name: string;
  chapters: number;
}

export interface NTVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  reference: string;
  greek: string;
  transliteration: string;
  referenceTranslation: string;
  keyTerms: string[];
  difficulty: 1 | 2 | 3;
  notes?: string;
}

export interface TranslationResult {
  score: number; // 0-10
  feedback: string;
  keyTermsFound: string[];
  keyTermsMissed: string[];
  suggestions: string[];
}

export interface ReviewSession {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  mode: LearningMode;
  wordsReviewed: number;
  correctCount: number;
  xpEarned: number;
  words: ReviewWord[];
}

export interface ReviewWord {
  wordId: string;
  quality: number; // 0-5
  responseTime: number; // ms
  correct: boolean;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
  condition: AchievementCondition;
  unlockedAt?: Date;
}

export type AchievementCondition =
  | { type: 'words_learned'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'perfect_session' }
  | { type: 'reviews_count'; count: number }
  | { type: 'tier_mastered'; tier: number }
  | { type: 'speed_demon'; reviews: number; minutes: number };

// Quiz Types
export interface QuizQuestion {
  word: VocabularyWord;
  options: string[];
  correctIndex: number;
}

// XP/Level Constants
export const XP_REWARDS = {
  correctFlashcard: 10,
  correctQuiz: 15,
  correctTyping: 20,
  translationBase: 30, // Base XP for translation, multiplied by score/10
  perfectSession: 50,
  dailyGoalMet: 100,
  newWordLearned: 25,
} as const;

// Level thresholds (exponential curve)
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500,
  10000, 13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000,
  70000, 82000, 96000, 112000, 130000, 150000, 173000, 199000, 228000, 260000,
  295000, 335000, 380000, 430000, 485000, 545000, 610000, 682000, 762000, 850000,
  945000, 1050000, 1165000, 1290000, 1425000, 1575000, 1740000, 1920000, 2120000, 2340000,
];

// Frequency tier thresholds
export const TIER_THRESHOLDS = {
  1: { min: 100, label: 'Essential', color: 'emerald' },
  2: { min: 50, label: 'High Frequency', color: 'blue' },
  3: { min: 25, label: 'Medium Frequency', color: 'amber' },
  4: { min: 10, label: 'Lower Frequency', color: 'orange' },
  5: { min: 5, label: 'Advanced', color: 'red' },
} as const;

// Semantic category display info
export const SEMANTIC_CATEGORIES: Record<SemanticCategory, { label: string; color: string; icon: string }> = {
  name: { label: 'Names', color: 'rose', icon: 'User' },
  place: { label: 'Places', color: 'cyan', icon: 'MapPin' },
  theological: { label: 'Theological', color: 'purple', icon: 'Cross' },
  body: { label: 'Body', color: 'orange', icon: 'Heart' },
  time: { label: 'Time', color: 'sky', icon: 'Clock' },
  family: { label: 'Family', color: 'pink', icon: 'Users' },
  nature: { label: 'Nature', color: 'green', icon: 'Leaf' },
  abstract: { label: 'Abstract', color: 'indigo', icon: 'Lightbulb' },
  emotion: { label: 'Emotions', color: 'red', icon: 'Heart' },
  religious: { label: 'Religious', color: 'violet', icon: 'Church' },
  authority: { label: 'Authority', color: 'amber', icon: 'Crown' },
  action: { label: 'Actions', color: 'blue', icon: 'Zap' },
  speech: { label: 'Speech', color: 'teal', icon: 'MessageCircle' },
  general: { label: 'General', color: 'gray', icon: 'Circle' },
} as const;

// Part of Speech display info
export const PART_OF_SPEECH_INFO: Record<PartOfSpeech, { label: string; abbrev: string; color: string }> = {
  noun: { label: 'Noun', abbrev: 'n.', color: 'blue' },
  verb: { label: 'Verb', abbrev: 'v.', color: 'emerald' },
  adjective: { label: 'Adjective', abbrev: 'adj.', color: 'purple' },
  adverb: { label: 'Adverb', abbrev: 'adv.', color: 'amber' },
  preposition: { label: 'Preposition', abbrev: 'prep.', color: 'rose' },
  conjunction: { label: 'Conjunction', abbrev: 'conj.', color: 'cyan' },
  particle: { label: 'Particle', abbrev: 'part.', color: 'orange' },
  pronoun: { label: 'Pronoun', abbrev: 'pron.', color: 'pink' },
  article: { label: 'Article', abbrev: 'art.', color: 'gray' },
  interjection: { label: 'Interjection', abbrev: 'interj.', color: 'red' },
} as const;

// ========================================
// Greek Gems Types - Insights lost in translation
// ========================================

export type GemCategory =
  | 'wordplay'       // Wordplay & puns (Πέτρος/πέτρα)
  | 'tense'          // Verb tense significance (τετέλεσται perfect)
  | 'untranslatable' // Words with no English equivalent (ἀγάπη vs φιλέω)
  | 'chiasm'         // Chiastic literary structures
  | 'emphatic'       // Emphatic constructions (οὐ μή double negative)
  | 'article'        // Definite article nuances (θεός vs ὁ θεός)
  | 'discourse'      // Discourse markers (οὖν, δέ, γάρ)
  | 'double_meaning'; // Words with layered meanings (ἄνωθεν)

export type GemLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface GemSource {
  author: string;
  work: string;
  year?: number;
}

export interface GreekGem {
  id: string;
  category: GemCategory;
  level: GemLevel;
  title: string;
  greek: string;
  transliteration: string;
  reference: string;
  referenceText: string;
  insight: string;
  source: GemSource; // Attribution for the quote
  whyEnglishMisses: string;
  relatedWords?: string[]; // Strong's numbers
  tags: string[];
}

export interface GemCategoryInfo {
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface GemLevelInfo {
  label: string;
  description: string;
  minGems: number;
  color: string;
}

export const GEM_CATEGORIES: Record<GemCategory, GemCategoryInfo> = {
  wordplay: {
    label: 'Wordplay & Puns',
    description: 'Greek wordplay, name meanings, and puns lost in translation',
    icon: 'Sparkles',
    color: 'amber',
  },
  tense: {
    label: 'Verb Tense',
    description: 'How aorist, perfect, and present tenses change meaning',
    icon: 'Clock',
    color: 'blue',
  },
  untranslatable: {
    label: 'Untranslatable Words',
    description: 'Greek words with no single English equivalent',
    icon: 'Languages',
    color: 'purple',
  },
  chiasm: {
    label: 'Chiastic Structures',
    description: 'Literary X-patterns in Greek text',
    icon: 'FlipHorizontal2',
    color: 'emerald',
  },
  emphatic: {
    label: 'Emphatic Forms',
    description: 'Double negatives, intensifiers, and word order',
    icon: 'Volume2',
    color: 'red',
  },
  article: {
    label: 'Article Nuances',
    description: 'Definite article uses English lacks',
    icon: 'FileText',
    color: 'cyan',
  },
  discourse: {
    label: 'Discourse Markers',
    description: 'Words like οὖν, δέ, γάρ that structure arguments',
    icon: 'GitBranch',
    color: 'orange',
  },
  double_meaning: {
    label: 'Double Meanings',
    description: 'Words with layered theological significance',
    icon: 'Layers',
    color: 'pink',
  },
} as const;

export const GEM_LEVELS: Record<GemLevel, GemLevelInfo> = {
  beginner: {
    label: 'Beginner',
    description: 'Vocabulary-level insights accessible to new Greek students',
    minGems: 0,
    color: 'emerald',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Insights requiring knowledge of verb tenses and basic syntax',
    minGems: 5,
    color: 'blue',
  },
  advanced: {
    label: 'Advanced',
    description: 'Article usage, discourse analysis, and complex grammar',
    minGems: 15,
    color: 'amber',
  },
  expert: {
    label: 'Expert',
    description: 'Literary structures, textual criticism, and deep exegesis',
    minGems: 30,
    color: 'purple',
  },
} as const;

// ========================================
// Greek Learning Stories Types - Inspirational stories of how ministers learned Greek
// ========================================

export type StoryEra = 'reformation' | 'puritan' | 'eighteenth' | 'nineteenth' | 'modern';

export interface GreekLearningStory {
  id: string;
  era: StoryEra;
  title: string;
  figure: string;
  years: string;
  summary: string;
  story: string;
  greekMethod: string;
  keyLesson: string;
  quote?: string;
  source: GemSource; // Reuse existing source type
  tags: string[];
}

export interface StoryEraInfo {
  label: string;
  years: string;
  description: string;
  color: string;
}

export const STORY_ERAS: Record<StoryEra, StoryEraInfo> = {
  reformation: {
    label: 'Reformation',
    years: '1500-1600',
    description: 'The recovery of biblical languages and ad fontes scholarship',
    color: 'amber',
  },
  puritan: {
    label: 'Puritan Era',
    years: '1600-1700',
    description: 'Rigorous devotion to original texts and pastoral application',
    color: 'emerald',
  },
  eighteenth: {
    label: '18th Century',
    years: '1700-1800',
    description: 'The Great Awakening and evangelical scholarship',
    color: 'blue',
  },
  nineteenth: {
    label: '19th Century',
    years: '1800-1900',
    description: 'The Prince of Preachers and Princeton theology',
    color: 'purple',
  },
  modern: {
    label: 'Modern Era',
    years: '1900-Present',
    description: 'Defending the faith in a skeptical age',
    color: 'rose',
  },
} as const;
