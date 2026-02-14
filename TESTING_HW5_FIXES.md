# Homework 5 Bug Fixes - Testing Guide

## Changes Made (Feb 14, 2026)

### 1. Question 16 Next Button Fix (Race Condition)
**File:** `src/app/homework/hw5/section/[id]/page.tsx` (lines 186-212)

**Problem:** Next button remained disabled after submitting answer because:
- `existingAnswer` was a dependency in the `useEffect` hook
- When `submitAnswer5()` updated Zustand store, it triggered re-computation of `existingAnswer`
- This fired the useEffect during navigation, resetting `showFeedback` to false
- Result: `hasAnswered` became false, disabling the Next button

**Solution:**
- Changed useEffect to depend only on `sectionProgress.currentIndex` (true navigation events)
- Look up answers directly from `sectionProgress.answers` inside the effect body
- This prevents the effect from firing on every Zustand store update

**Lines Changed:**
```typescript
// OLD dependency array:
}, [sectionProgress.currentIndex, existingAnswer, currentQuestion?.type]);

// NEW dependency array:
}, [sectionProgress.currentIndex, currentQuestion?.id, currentQuestion?.type, sectionProgress.answers]);

// And lookup answer directly instead of using existingAnswer:
const currentAnswer = sectionProgress.answers.find(
  a => a.questionId === currentQuestion?.id
);
```

### 2. Question 22 Missing Bold Marker
**File:** `src/data/homework/hw5-questions.ts` (line 535)

**Problem:** Question asks about "the underlined verb" but `ἔσται` was not marked with bold markdown.

**Solution:**
```typescript
// OLD:
greek: 'ὃ ἐὰν λύσῃς ἐπὶ τῆς γῆς ἔσται λελυμένον ἐν τοῖς οὐρανοῖς'

// NEW:
greek: 'ὃ ἐὰν λύσῃς ἐπὶ τῆς γῆς **ἔσται** λελυμένον ἐν τοῖς οὐρανοῖς'
```

### 3. Bold Markdown Rendering
**Files:**
- NEW: `src/lib/renderGreekText.tsx` (utility function)
- MODIFIED: `src/app/homework/hw5/section/[id]/page.tsx` (lines 21, 535)

**Problem:** 15+ questions use `**word**` markdown syntax but rendering showed literal asterisks.

**Solution:**
- Created `renderGreekWithBold()` utility that parses `**text**` and converts to `<strong>` with underline
- Updated MCQ Greek text rendering to use the utility
- Words marked with `**` now appear as underlined bold (matching question descriptions)

### 4. Translation Feedback State Ordering
**File:** `src/app/homework/hw5/section/[id]/page.tsx` (lines 245-252)

**Problem:** `setTranslationResult()` and `setShowFeedback()` were called separately, potentially causing intermediate renders.

**Solution:** Grouped related state updates together with explanatory comment:
```typescript
// Set all state together to avoid intermediate renders
setIsCorrect(correct);
setTranslationResult(result);
setShowFeedback(true);
```

## Testing Checklist

### Test 1: Question 16 Next Button (CRITICAL)
1. Navigate to Homework 5 → Section 4 → Question 16
2. Select any answer option (1-4)
3. Click "Check Answer" or press Enter
4. **Immediately** click "Next" (within 500ms) — DO NOT WAIT
5. ✅ **Expected:** Next button should work and navigate to Q17
6. Go back to Q16
7. ✅ **Expected:** Previous answer should be shown with feedback

### Test 2: Question 22 Bold Rendering (CRITICAL)
1. Navigate to Homework 5 → Section 4 → Question 22
2. ✅ **Expected:** The word `ἔσται` should appear **bold and underlined**
3. ✅ **Expected:** NO asterisks (`**`) should be visible

### Test 3: All Bold Rendering (15+ instances)
Check these questions all render bold correctly (no asterisks visible):

**Section 1 (Imperative):**
- Q11: `μετανοεῖτε` should be bold
- Q12: `ἀκουέτω` should be bold

**Section 2 (Passive Voice):**
- Q15: `ἀφίενταί` should be bold
- Q16: `ἡτοιμάσθη` should be bold

**Section 3 (ἔρχομαι):**
- Q15: `ἔρχεται` should be bold
- Q16: Multiple bold words

**Section 4 (Future Tense):**
- Q21: `ἔσεσθε` should be bold
- Q22: `ἔσται` should be bold (our fix)

**Section 5 (Aorist):**
- Q18-Q22: Multiple instances (check at least 3)

✅ **Expected for all:** Bold/underlined rendering, no `**` asterisks

### Test 4: Translation Questions (Section 6)
1. Navigate to Section 6 (any translation question)
2. Enter a translation
3. Click "Submit Translation"
4. ✅ **Expected:** Feedback should appear immediately with:
   - Score out of 5
   - Key terms found/missing
   - Suggestions for improvement
5. Navigate away and return
6. ✅ **Expected:** Answer is preserved (detailed feedback may be simplified but should still show)

### Test 5: Navigation Regression
1. Test Previous button works correctly
2. Test keyboard shortcuts still work:
   - Keys 1-4 for MCQ selection
   - Enter to submit answer
   - Arrow keys for navigation (if implemented)
3. ✅ **Expected:** All navigation should work smoothly

### Test 6: Answer Persistence
1. Answer 3-4 questions in any section
2. Refresh the page (F5)
3. ✅ **Expected:** All answers should be preserved
4. Close browser and reopen
5. ✅ **Expected:** Answers still preserved (synced to Firebase)

### Test 7: Cross-Section Navigation
1. Complete Section 4 entirely
2. Navigate to Section 5
3. Go back to Section 4
4. ✅ **Expected:** All Section 4 answers preserved and feedback showing

## Known Limitations

1. **Translation results not fully persisted:** Detailed score/feedback (key terms, suggestions) is lost when navigating away from a translation question. Only pass/fail status is saved. This is acceptable for MVP.

2. **Debounced sync delay:** 1000ms delay before answers sync to Firebase. If browser crashes in that window, answer could be lost. Consider adding `window.onbeforeunload` handler if this becomes an issue.

3. **Bold rendering in other components:** If Greek text with `**bold**` appears in other components (e.g., review pages, summary screens), those components will need to import and use `renderGreekWithBold()` utility as well.

## Files Modified

1. `src/lib/renderGreekText.tsx` — NEW FILE (utility function)
2. `src/app/homework/hw5/section/[id]/page.tsx` — Updated (useEffect fix, bold rendering, state ordering)
3. `src/data/homework/hw5-questions.ts` — Updated (Q22 bold markers)

## Root Cause Analysis

**Question 16 Bug:** State management anti-pattern where derived values (`existingAnswer`) were used as effect dependencies. When the source of truth (Zustand store) updates, it triggers effects that depend on derived values, causing effects to fire at unexpected times. Solution: depend only on "stable" values (indexes, IDs) and derive everything else inside the effect body.

**Question 22 Bug:** Simple data entry error — forgot to add markdown markers.

**Bold Rendering:** Feature was never implemented. Data was prepared with markdown syntax but no parser existed.

## Performance Notes

- The `renderGreekWithBold()` function is called on every render for MCQ questions
- This is acceptable because:
  - Simple regex split operation (fast)
  - Only called for one question at a time (not a list)
  - Memoization not needed at this scale

- The useEffect fix actually improves performance by reducing unnecessary effect invocations
- Previous version: effect ran on every store update
- New version: effect runs only on navigation (currentIndex change)
