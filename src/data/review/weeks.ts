import type { ReviewWeek } from './types';
import { week13InClass, week13Homework } from './week13';
import { week14InClass, week14Homework } from './week14';
import { week15InClass, week15Homework } from './week15';

export const REVIEW_WEEKS: ReviewWeek[] = [
  {
    week: 13,
    title: 'Foundations & Early Verbs',
    subtitle: 'HW 1–3 via Mark 1:1-15',
    description: 'Master cases, article, declensions, pronouns, prepositions, and present/imperfect/aorist tenses — all through Mark 1:1-15 (John the Baptist through Jesus\' proclamation).',
    hwCovered: 'Homework 1, 2 & 3',
    topics: ['Cases', 'Article', 'Declensions', 'Pronouns', 'Prepositions', 'Present', 'Imperfect', 'Aorist', 'εἰμί', 'Deponents', 'Vocabulary'],
    inClass: week13InClass,
    homework: week13Homework,
  },
  {
    week: 14,
    title: 'Intermediate Forms',
    subtitle: 'HW 4–6 via Mark 1:1-45',
    description: 'Drill future tense, all participle forms, imperative mood, passive voice, deponent verbs, and conjunctions — through the full narrative of Mark 1.',
    hwCovered: 'Homework 4, 5 & 6',
    topics: ['Future Tense', 'Participles', 'Imperative', 'Passive Voice', 'Deponent Verbs', 'Conjunctions', 'Demonstrative Pronouns', 'Relative Pronouns', 'Vocabulary'],
    inClass: week14InClass,
    homework: week14Homework,
  },
  {
    week: 15,
    title: 'Advanced Grammar',
    subtitle: 'HW 7–8 via Mark 1:1-45',
    description: 'Master perfect tense, subjunctive mood, 3rd declension nouns, adjective agreement, infinitive forms, and reflexive pronouns — all from Mark 1.',
    hwCovered: 'Homework 7 & 8',
    topics: ['Perfect', 'Subjunctive', '3rd Declension', 'Adjectives', 'Infinitives', 'Participles', 'Reflexive Pronouns', 'Vocabulary'],
    inClass: week15InClass,
    homework: week15Homework,
  },
];
