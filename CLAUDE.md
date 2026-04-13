# Koine Greek Vocabulary App

## Overview

A **Next.js 16** progressive web app (PWA) for learning Koine Greek vocabulary, designed for seminary students. The app uses spaced repetition (SM-2 algorithm), supports multiple learning modes, includes 8 homework assignments + a final exam, and integrates with Firebase for authentication and cloud sync.

**Live URL**: Deployed on Vercel
**Android**: TWA (Trusted Web Activity) APK exists in `android-twa/`
**Package name**: `com.pilgrimcovenant.koinegreek`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack dev) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 (persisted to localStorage) |
| Auth/DB | Firebase 12 (Auth + Firestore) |
| Data fetching | @tanstack/react-query 5 |
| Forms | react-hook-form 7 + zod 4 |
| Icons | lucide-react |
| Testing | Jest 30 + @testing-library/react |
| PWA | @ducanh2912/next-pwa |

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Login/signup (route group)
    achievements/         # Achievement gallery
    api/send-exam-results/  # Email exam results via Resend
    gems/                 # "Greek Gems" - insights lost in translation
    grammar/              # Grammar tools (parser, practice, tables)
    homework/             # HW1-HW8 + final exam + help pages
    kittel/               # Kittel's TDNT theological dictionary
    learn/                # Learning modes (flashcards, quiz, typing, translation, cram, common-vocab)
    progress/             # Analytics dashboard
    privacy/              # Privacy policy
    settings/             # User settings
    stories/              # Inspirational stories of historical Greek learners
    synonyms/             # Vine's Dictionary synonym distinctions
    teacher/              # Teacher dashboard (view student progress)
    vocabulary/           # Full vocabulary browser
  components/
    ui/                   # Reusable primitives (Button, Card)
    homework/             # Homework-specific components
    gems/                 # Gem display components
    kittel/               # Kittel dictionary components
    synonyms/             # Synonym display components
    FlashCard.tsx         # Core flashcard with flip animation
    ReviewButtons.tsx     # Again/Hard/Good/Easy SRS buttons
    XPBar.tsx             # XP progress bar + gain animation
    StreakFire.tsx         # Streak counter with fire animation
    ProgressRing.tsx      # Circular progress indicator
    AudioPlayer.tsx       # Erasmian pronunciation playback
    GreekWord.tsx         # Greek text display with transliteration
    MorphologyDisplay.tsx # Morphological parsing display
    TypingInput.tsx       # Greek typing practice input
    AuthGate.tsx          # Auth-required wrapper
    Onboarding.tsx        # New user onboarding flow
    ThemeToggle.tsx       # Dark/light mode toggle
    ThemeProvider.tsx      # next-themes provider
  data/
    vocabulary.json       # ~1,700 Greek words with frequency/tier/morphology
    nt-verses.json        # NT verses for translation practice
    paradigms.json        # Greek paradigm tables
    greek-gems.json       # Insights lost in English translation
    greek-learning-stories.json  # Historical stories
    vine-synonyms.json    # Vine's Dictionary synonym groups
    kittel-dictionary.json  # TDNT theological entries
    homework/             # HW1-HW8 + final exam question banks (TypeScript)
  lib/
    firebase.ts           # Firebase init, auth, Firestore sync, homework submissions
    srs.ts                # SM-2 spaced repetition algorithm (with learning phase)
    translation.ts        # Translation scoring (key terms, semantic similarity, completeness)
    morphology.ts         # Greek morphology types and display utilities
    erasmian.ts           # Erasmian pronunciation system
    audio.ts              # Text-to-speech for Greek pronunciation
    xp.ts                 # XP/level calculation
    achievements.ts       # Achievement definitions and unlock logic
    commonVocab.ts        # Top 300 most frequent NT words (10 sections of 30)
    wordRelations.ts      # Word family/relation connections
    renderGreekText.tsx   # Greek text rendering utilities
    featureFlags.ts       # Feature flag system
    errorTracking.ts      # Error tracking utilities
    dataValidation.ts     # localStorage data sanitization
    dataRecovery.ts       # Data recovery from corrupted localStorage
    migration.ts          # Data migration between versions
    syncQueue.ts          # Offline-first sync queue
    utils.ts              # Shared utilities (cn, shuffle, generateId)
  stores/
    userStore.ts          # Main store: SRS progress, stats, XP, settings (persisted)
    sessionStore.ts       # Current review session state (persisted)
    authStore.ts          # Firebase auth state (not persisted)
    homeworkStore.ts      # Homework progress for HW1-HW8 + final exam (persisted)
  types/
    index.ts              # Core types (VocabularyWord, SRSCard, UserStats, etc.)
    homework.ts           # Homework types (questions, sections, progress per HW)
```

## Key Architectural Decisions

### State Management

- **Zustand** with `persist` middleware writes to **localStorage** (not Firebase) for the primary user state
- Uses **debounced writes** via `requestIdleCallback` to avoid blocking the UI
- **Granular selectors** (`useUserStats`, `useUserProgress`, etc.) prevent cascading re-renders
- **Action-only selector** (`useUserActions`) groups all action functions to never cause re-renders
- Firebase cloud sync is **secondary** - triggered on session end and debounced during sessions (30s)

### SRS Algorithm (src/lib/srs.ts)

- Based on **SM-2** with a **learning phase** enhancement
- Learning steps: 1min -> 10min -> 1hr -> 4hr (sub-day intervals for new cards)
- After graduating learning phase, enters standard SM-2 (1d -> 6d -> interval * easeFactor)
- Incorrect during learning resets to step 0; incorrect after graduation resets back to learning phase
- **Interval modifier** from SRS mode (aggressive=0.8, normal=1.0, relaxed=1.3)
- Word considered "learned" when `maxRepetitions >= 5` (maxRepetitions tracks highest ever, so a word can't "un-learn")
- **Leech detection**: words reviewed 8+ times with <50% accuracy

### Vocabulary Data (src/data/vocabulary.json)

- ~1,700 words with: id, greek, transliteration, gloss, definition, partOfSpeech, frequency, tier (1-5), strongs, morphology, semanticCategory
- **Tiers** based on NT frequency: 1 (100+), 2 (50+), 3 (25+), 4 (10+), 5 (5+)
- Pre-computed tier word Sets at module load time for O(1) progress lookups

### Homework System

- **8 homework assignments** (hw1-hw8) + **final exam** covering progressive Greek grammar
- HW1: Alphabet, transliteration, grammar terms, cases, article paradigm
- HW2: 2nd declension nouns (masc/fem/neut), personal pronouns, prepositions
- HW3: Present/imperfect/aorist active indicative verbs
- HW4: Future, participles, pronouns, conjunctions, verse translation
- HW5: Imperative, passive voice, deponent verbs, future tense, aorist passive
- HW6: Feminine/neuter participles, demonstrative/reflexive/relative pronouns
- HW7: Middle/passive participles, perfect/pluperfect, subjunctive
- HW8: 3rd declension nouns/pronouns, adjectives, infinitives
- Final exam: 50 grammar MCQ + 30 vocab MCQ + 20 verse translations (password-gated)
- Question types: `transliteration`, `verse`, `mcq`, `translation`
- Each HW has a `homeworkStore.ts` slice, syncs to Firestore on completion
- Teacher dashboard at `/teacher` shows all student submissions

### Authentication & Roles

- Firebase Auth (email/password + Google sign-in)
- Two roles: `student` and `teacher`
- Admin email auto-assigns teacher role (hardcoded in `firebase.ts`)
- Firebase is **optional** - app works fully offline without it
- `isFirebaseAvailable()` check gates all Firebase operations

### Translation Scoring (src/lib/translation.ts)

- Scores verse translations 0-10 based on:
  - Key term coverage (60%) - curated per verse
  - Semantic similarity (15%) - F1-like precision/recall
  - Completeness (25%) - length ratio check
- Includes synonym maps for biblical terms
- Levenshtein distance for typo tolerance
- Stem matching for word form variations

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (webpack)
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Jest tests
npm run test:watch   # Jest in watch mode
```

## Environment Variables

All Firebase config is via `NEXT_PUBLIC_FIREBASE_*` env vars in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `RESEND_API_KEY` (server-side, for emailing exam results)

## Common Patterns

### Adding a New Learning Mode

1. Create page at `src/app/learn/<mode>/page.tsx` (use `'use client'`)
2. Use `useUserStore` for SRS progress and `useSessionStore` for session tracking
3. Call `initializeWord(wordId)` before reviewing, then `reviewWord(wordId, quality)` (quality 0-5)
4. Add link to the dashboard in `src/app/page.tsx` under Learning Modes

### Adding a New Homework Assignment

1. Add types in `src/types/homework.ts` (section IDs, progress interface, section meta)
2. Create question bank in `src/data/homework/hwN-questions.ts`
3. Add store slice in `src/stores/homeworkStore.ts` (follow existing pattern)
4. Create pages: `src/app/homework/hwN/page.tsx`, `section/[id]/page.tsx`, `complete/page.tsx`
5. Add to homework index page at `src/app/homework/page.tsx`

### Adding New Vocabulary Words

Edit `src/data/vocabulary.json`. Each word needs:
```json
{
  "id": "unique-id",
  "greek": "λόγος",
  "transliteration": "logos",
  "gloss": "word, message",
  "definition": "a word, speech, divine Word",
  "partOfSpeech": "noun",
  "frequency": 330,
  "tier": 1,
  "strongs": "G3056",
  "morphology": { "gender": "masculine", "declension": "2nd" },
  "semanticCategory": "speech"
}
```

### Component Patterns

- All pages are `'use client'` (state-heavy app)
- Use `useState(false)` + `useEffect(() => setMounted(true))` for hydration safety
- Show skeleton loaders while `!mounted`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes (wraps `clsx` + `tailwind-merge`)
- Icons from `lucide-react` (import individually)
- Use `<Card>`, `<Button>` from `src/components/ui/`

### Data Flow for Reviews

```
User taps "Good" on flashcard
  -> handleRate(quality=4) in page
  -> reviewWord(wordId, 4) in userStore
    -> updateWordProgress() calculates next SM-2 interval
    -> updateStreak() updates streak
    -> awardXP() adds XP and checks level up
    -> updates studyHistory heatmap
    -> Zustand persist triggers debounced localStorage write
  -> rateCard(quality) in sessionStore
    -> updates session stats (correct count, accuracy)
  -> Cloud sync debounced (30s) if user is authenticated
```

## Gotchas

- **Build uses webpack** (`next build --webpack`) even though dev uses Turbopack - this is intentional for production stability
- **localStorage key**: `koine-user-store` (main), `koine-session-store` (session), `koine-homework-store` (homework)
- **Date serialization**: Dates are stored as ISO strings in localStorage and reconverted on load (see `userStore.ts` storage.getItem)
- **Data validation**: `sanitizeProgress`, `sanitizeUserStats`, `sanitizeStudyHistory` run on every load to fix corrupted data
- **maxRepetitions**: Added later as a "high water mark" for repetitions - old data may not have it, code falls back to `p.maxRepetitions || p.repetitions`
- **Homework store is large** (~28k tokens) - contains progress management for all 8 HWs + final exam in one file
- **Pre-computed tier data**: `TIER_WORD_IDS` and `TIER_TOTALS` are computed at module load in `page.tsx` to avoid filtering 1,700 words on every render
- **Inter font** includes `greek` subset for proper Greek character rendering
