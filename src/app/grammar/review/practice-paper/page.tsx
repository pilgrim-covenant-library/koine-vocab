'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Check, X, AlertCircle, BookOpen, Trophy, ThumbsUp, Zap, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
import { cn, shuffle } from '@/lib/utils';
import { scoreTranslation } from '@/lib/translation';
import type { NTVerse, TranslationResult } from '@/types';
import {
  grammarQuestions,
  vocabQuestions,
  verseAnalysisQuestions,
  PRACTICE_PAPER_SECTIONS,
  type PracticeMCQ,
  type PracticeVerseAnalysis,
} from '@/data/review/practicePaper';

type SectionId = 1 | 2 | 3;
type QuestionItem = { type: 'mcq'; data: PracticeMCQ; section: SectionId } | { type: 'va'; data: PracticeVerseAnalysis; section: SectionId };

const GRADE_BANDS = [
  { min: 90, label: 'A', color: 'text-emerald-600 dark:text-emerald-400', desc: 'Excellent — ready for the final exam' },
  { min: 80, label: 'B+', color: 'text-blue-600 dark:text-blue-400', desc: 'Very good — minor areas to review' },
  { min: 70, label: 'B', color: 'text-blue-500 dark:text-blue-400', desc: 'Good — review weak areas before the exam' },
  { min: 60, label: 'C', color: 'text-amber-600 dark:text-amber-400', desc: 'Passing — more practice needed' },
  { min: 50, label: 'D', color: 'text-orange-600 dark:text-orange-400', desc: 'Below average — revisit the review weeks' },
  { min: 0, label: 'F', color: 'text-red-600 dark:text-red-400', desc: 'Needs significant review — go back to HW content' },
];

function getGrade(pct: number) {
  return GRADE_BANDS.find(g => pct >= g.min)!;
}

export default function PracticePaperPage() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  // All questions flattened in order
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);

  // MCQ state per question
  const [mcqSelected, setMcqSelected] = useState<Record<string, number>>({});
  const [mcqRevealed, setMcqRevealed] = useState<Record<string, boolean>>({});

  // VA state per question
  const [vaMatching, setVaMatching] = useState<Record<string, Record<string, string>>>({});
  const [vaTranslations, setVaTranslations] = useState<Record<string, string>>({});
  const [vaRevealed, setVaRevealed] = useState<Record<string, boolean>>({});
  const [translationResults, setTranslationResults] = useState<Record<string, TranslationResult>>({});

  // Running score
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const [finished, setFinished] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<SectionId>>(new Set([1, 2, 3]));

  useEffect(() => { setMounted(true); }, []);

  const toggleSection = (id: SectionId) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startPaper = () => {
    const items: QuestionItem[] = [];
    if (selectedSections.has(1)) {
      items.push(...shuffle([...grammarQuestions]).map(q => ({ type: 'mcq' as const, data: q, section: 1 as SectionId })));
    }
    if (selectedSections.has(2)) {
      items.push(...shuffle([...vocabQuestions]).map(q => ({ type: 'mcq' as const, data: q, section: 2 as SectionId })));
    }
    if (selectedSections.has(3)) {
      items.push(...verseAnalysisQuestions.map(q => ({ type: 'va' as const, data: q, section: 3 as SectionId })));
    }
    setAllQuestions(items);
    setMcqSelected({});
    setMcqRevealed({});
    setVaMatching({});
    setVaTranslations({});
    setVaRevealed({});
    setTranslationResults({});
    setCorrectCount(0);
    setAnsweredCount(0);
    setCurrentIdx(0);
    setFinished(false);
    setStarted(true);
  };

  const current = allQuestions[currentIdx];
  const isRevealed = current ? (current.type === 'mcq' ? mcqRevealed[current.data.id] : vaRevealed[current.data.id]) : false;
  const isLast = currentIdx === allQuestions.length - 1;

  // MCQ: select answer
  const handleSelectMCQ = (idx: number) => {
    if (!current || current.type !== 'mcq' || mcqRevealed[current.data.id]) return;
    setMcqSelected(prev => ({ ...prev, [current.data.id]: idx }));
  };

  // MCQ: check answer
  const handleCheckMCQ = () => {
    if (!current || current.type !== 'mcq') return;
    const q = current.data as PracticeMCQ;
    const selected = mcqSelected[q.id];
    if (selected === undefined) return;
    setMcqRevealed(prev => ({ ...prev, [q.id]: true }));
    setAnsweredCount(prev => prev + 1);
    if (selected === q.correctIndex) setCorrectCount(prev => prev + 1);
  };

  // VA: matching change
  const handleMatchingChange = (qId: string, greek: string, category: string) => {
    if (vaRevealed[qId]) return;
    setVaMatching(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), [greek]: category } }));
  };

  // VA: translation change
  const handleTranslationChange = (qId: string, text: string) => {
    if (vaRevealed[qId]) return;
    setVaTranslations(prev => ({ ...prev, [qId]: text }));
  };

  // VA: check answer
  const handleCheckVA = () => {
    if (!current || current.type !== 'va') return;
    const q = current.data as PracticeVerseAnalysis;
    setVaRevealed(prev => ({ ...prev, [q.id]: true }));

    // Score matching
    const m = vaMatching[q.id] || {};
    let matchCorrect = 0;
    for (const pair of q.matchingPairs) {
      if (m[pair.greek] === pair.category) matchCorrect++;
    }
    setAnsweredCount(prev => prev + q.matchingPairs.length + 1); // +1 for translation
    setCorrectCount(prev => prev + matchCorrect);

    // Score translation
    const text = vaTranslations[q.id] || '';
    const verse: NTVerse = {
      id: q.id, book: 'Mark', chapter: 1, verse: 0,
      reference: q.reference, greek: q.greek,
      transliteration: q.transliteration,
      referenceTranslation: q.referenceTranslation,
      keyTerms: q.keyTerms, difficulty: 1,
    };
    const result = scoreTranslation(verse, text);
    setTranslationResults(prev => ({ ...prev, [q.id]: result }));
    // Count translation as correct if >= 7/10
    if (result.score >= 7) setCorrectCount(prev => prev + 1);
  };

  const goNext = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  // Final scores
  const finalScores = useMemo(() => {
    if (!finished) return null;
    const hasGrammar = allQuestions.some(q => q.section === 1);
    const hasVocab = allQuestions.some(q => q.section === 2);
    const hasVA = allQuestions.some(q => q.section === 3);
    let grammarCorrect = 0;
    let vocabCorrect = 0;
    for (const item of allQuestions) {
      if (item.type === 'mcq') {
        const q = item.data as PracticeMCQ;
        if (mcqSelected[q.id] === q.correctIndex) {
          if (item.section === 1) grammarCorrect++;
          else vocabCorrect++;
        }
      }
    }
    const vaInPaper = allQuestions.filter(q => q.section === 3).map(q => q.data as PracticeVerseAnalysis);
    let matchingCorrect = 0;
    let matchingTotal = 0;
    for (const q of vaInPaper) {
      const m = vaMatching[q.id] || {};
      for (const pair of q.matchingPairs) {
        matchingTotal++;
        if (m[pair.greek] === pair.category) matchingCorrect++;
      }
    }
    const translationScores = Object.values(translationResults);
    const translationAvg = translationScores.length > 0
      ? Math.round(translationScores.reduce((s, r) => s + r.score, 0) / translationScores.length * 10) / 10
      : 0;
    const grammarCount = hasGrammar ? grammarQuestions.length : 0;
    const vocabCount = hasVocab ? vocabQuestions.length : 0;
    const rawTotal = grammarCorrect + vocabCorrect + matchingCorrect;
    const rawMax = grammarCount + vocabCount + matchingTotal;
    const pct = rawMax > 0 ? Math.round((rawTotal / rawMax) * 100) : 0;
    return { hasGrammar, hasVocab, hasVA, grammarCorrect, vocabCorrect, matchingCorrect, matchingTotal, translationAvg, rawTotal, rawMax, pct };
  }, [finished, allQuestions, mcqSelected, vaMatching, translationResults]);

  if (!mounted) return null;

  // ─── Start Screen ───
  if (!started) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/grammar/review">
              <Button variant="ghost" size="icon" aria-label="Back"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Practice Paper</h1>
              <p className="text-xs text-muted-foreground">Mark 1 — Final Exam Format</p>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 mb-4">
              <BookOpen className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Mark 1 Practice Paper</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Final exam format with instant feedback after each question.
              All based on Mark chapter 1.
            </p>
          </div>
          <Card className="mb-4">
            <CardContent className="py-4 space-y-2">
              {PRACTICE_PAPER_SECTIONS.map((s) => {
                const sId = s.id as SectionId;
                const selected = selectedSections.has(sId);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(sId)}
                    className={cn(
                      'flex items-center justify-between text-sm w-full p-2 rounded-lg transition-colors text-left',
                      selected ? 'bg-primary/5' : 'opacity-40',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                        selected ? 'bg-primary border-primary' : 'border-muted-foreground/30',
                      )}>
                        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="font-medium">Section {s.id}: {s.title}</span>
                    </div>
                    <span className="text-muted-foreground">{s.questionCount} {s.id === 3 ? 'verses' : 'questions'}</span>
                  </button>
                );
              })}
              <p className="text-xs text-muted-foreground pt-1">Tap to select which sections to practise</p>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardContent className="py-4">
              <h3 className="font-semibold text-sm mb-2">Grading Scale</h3>
              <div className="space-y-1">
                {GRADE_BANDS.map(g => (
                  <div key={g.label} className="flex items-center justify-between text-xs">
                    <span className={cn('font-bold', g.color)}>{g.label} ({g.min}%+)</span>
                    <span className="text-muted-foreground">{g.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full h-14" onClick={startPaper} disabled={selectedSections.size === 0}>
            {selectedSections.size === 3 ? 'Start Full Paper'
              : selectedSections.size === 0 ? 'Select a Section'
              : `Start ${[...selectedSections].sort().map(id => PRACTICE_PAPER_SECTIONS[id - 1].title).join(' & ')}`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </main>
      </div>
    );
  }

  // ─── Results Screen ───
  if (finished && finalScores) {
    const grade = getGrade(finalScores.pct);
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/grammar/review">
              <Button variant="ghost" size="icon" aria-label="Back"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <h1 className="text-lg font-semibold">Practice Paper Results</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-6">
            {finalScores.pct >= 80 ? <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3" />
              : finalScores.pct >= 60 ? <ThumbsUp className="w-16 h-16 text-blue-500 mx-auto mb-3" />
              : <Zap className="w-16 h-16 text-purple-500 mx-auto mb-3" />}
            <p className={cn('text-5xl font-bold', grade.color)}>{grade.label}</p>
            <p className="text-2xl font-bold text-primary mt-1">{finalScores.pct}%</p>
            <p className="text-sm text-muted-foreground mt-1">{grade.desc}</p>
          </div>
          <Card className="mb-6">
            <CardContent className="py-4 space-y-3">
              {finalScores.hasGrammar && (
                <div className="flex justify-between text-sm">
                  <span>Grammar ({grammarQuestions.length} MCQ)</span>
                  <span className="font-medium">{finalScores.grammarCorrect}/{grammarQuestions.length}</span>
                </div>
              )}
              {finalScores.hasVocab && (
                <div className="flex justify-between text-sm">
                  <span>Vocabulary ({vocabQuestions.length} MCQ)</span>
                  <span className="font-medium">{finalScores.vocabCorrect}/{vocabQuestions.length}</span>
                </div>
              )}
              {finalScores.hasVA && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Verse Matching ({finalScores.matchingTotal} pairs)</span>
                    <span className="font-medium">{finalScores.matchingCorrect}/{finalScores.matchingTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span>Translation Average</span>
                    <span className="font-medium">{finalScores.translationAvg}/10</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>Total</span>
                <span>{finalScores.rawTotal}/{finalScores.rawMax} ({finalScores.pct}%)</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={startPaper} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake
            </Button>
            <Link href="/grammar/review" className="flex-1">
              <Button className="w-full">Back to Reviews</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ─── Question Screen ───
  const sectionLabel = current?.section === 1 ? 'Grammar' : current?.section === 2 ? 'Vocabulary' : 'Verse Analysis';
  const globalTotal = allQuestions.length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{sectionLabel}</span>
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-500 font-medium">{correctCount} correct</span>
              <span className="text-muted-foreground">{currentIdx + 1}/{globalTotal}</span>
            </div>
            <Link href="/grammar/review">
              <Button variant="ghost" size="sm">Exit</Button>
            </Link>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIdx + 1) / globalTotal) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl">
        {/* MCQ Question */}
        {current?.type === 'mcq' && (() => {
          const q = current.data as PracticeMCQ;
          const selected = mcqSelected[q.id];
          const revealed = mcqRevealed[q.id];
          return (
            <div>
              <Card className="mb-4">
                <CardContent className="py-5 text-center">
                  <p className="text-base font-medium mb-3">{q.question}</p>
                  {q.greek && <GreekWord greek={q.greek} size="xl" />}
                </CardContent>
              </Card>
              <div className="space-y-2 mb-4">
                {q.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === q.correctIndex;
                  let bg = '';
                  if (revealed) {
                    if (isCorrect) bg = 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500';
                    else if (isSelected && !isCorrect) bg = 'bg-red-100 dark:bg-red-900/30 border-red-500';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectMCQ(idx)}
                      disabled={!!revealed}
                      className={cn(
                        'w-full p-4 rounded-xl border text-left transition-all',
                        isSelected && !revealed && 'border-primary bg-primary/5',
                        revealed && bg,
                        !revealed && !isSelected && 'hover:border-muted-foreground/50',
                        revealed && 'cursor-default',
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className={cn(
                  'p-4 rounded-xl mb-4',
                  selected === q.correctIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
                )}>
                  <p className="font-bold">{selected === q.correctIndex ? 'Correct!' : 'Incorrect'}</p>
                  {selected !== q.correctIndex && (
                    <p className="text-sm mt-1">Correct answer: <strong>{q.options[q.correctIndex]}</strong></p>
                  )}
                  <p className="text-xs mt-2 flex items-start gap-1 opacity-80">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    {q.explanation}
                  </p>
                </div>
              )}
              <div className="w-full">
                {!revealed ? (
                  <Button size="lg" className="w-full" disabled={selected === undefined} onClick={handleCheckMCQ}>
                    Check Answer
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={goNext}>
                    {isLast ? 'See Results' : <>Next <ChevronRight className="w-5 h-5 ml-1" /></>}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Verse Analysis Question */}
        {current?.type === 'va' && (() => {
          const q = current.data as PracticeVerseAnalysis;
          const revealed = vaRevealed[q.id];
          const matching = vaMatching[q.id] || {};
          const translation = vaTranslations[q.id] || '';
          const trResult = translationResults[q.id];

          const categoryOptions = [...new Set([...q.matchingPairs.map(p => p.category), ...q.distractorCategories])].sort();

          const matchingResults = revealed ? q.matchingPairs.map(pair => {
            const student = matching[pair.greek] || '';
            return { greek: pair.greek, correct: pair.category, student, isCorrect: student === pair.category };
          }) : null;

          const matchCorrect = matchingResults?.filter(r => r.isCorrect).length ?? 0;

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{q.reference}</span>
              </div>

              <p className="text-2xl font-serif tracking-wide text-center leading-relaxed">{q.greek}</p>

              {/* Part A: Matching */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Part A: Match each Greek word to its grammatical category</p>
                <div className="space-y-2">
                  {q.matchingPairs.map((pair) => {
                    const studentChoice = matching[pair.greek] || '';
                    const isCorrectMatch = revealed && studentChoice === pair.category;
                    const isWrongMatch = revealed && studentChoice !== '' && studentChoice !== pair.category;
                    return (
                      <div key={pair.greek} className={cn(
                        'flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border',
                        isCorrectMatch && 'bg-green-50 dark:bg-green-900/20 border-green-300',
                        isWrongMatch && 'bg-red-50 dark:bg-red-900/20 border-red-300',
                      )}>
                        <span className="font-serif text-lg shrink-0 min-w-[120px] font-medium">{pair.greek}</span>
                        <span className="text-muted-foreground shrink-0">&rarr;</span>
                        {!revealed ? (
                          <select
                            value={studentChoice}
                            onChange={(e) => handleMatchingChange(q.id, pair.greek, e.target.value)}
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">Select category...</option>
                            {categoryOptions.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                          </select>
                        ) : (
                          <div className="flex-1 text-sm">
                            {isCorrectMatch ? (
                              <span className="flex items-center gap-1 text-green-700 dark:text-green-300"><Check className="w-4 h-4" /> {pair.category}</span>
                            ) : (
                              <div>
                                {studentChoice ? (
                                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><X className="w-4 h-4" /> {studentChoice}</span>
                                ) : (
                                  <span className="text-muted-foreground italic">no answer</span>
                                )}
                                <span className="text-green-600 dark:text-green-400 text-xs block mt-0.5">Correct: {pair.category}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {revealed && matchingResults && (
                  <p className="text-sm font-medium text-muted-foreground">Matching: {matchCorrect}/{q.matchingPairs.length} correct</p>
                )}
              </div>

              {/* Part B: Translation */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-semibold">Part B: Translate the verse into English</p>
                {!revealed ? (
                  <textarea
                    value={translation}
                    onChange={(e) => handleTranslationChange(q.id, e.target.value)}
                    placeholder="Write your English translation..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                ) : (
                  <div className="space-y-3">
                    {trResult && (
                      <div className={cn(
                        'flex items-start gap-3 p-3 rounded-lg text-sm',
                        trResult.score >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : trResult.score >= 5 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
                      )}>
                        {trResult.score >= 5 ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">Translation score: {trResult.score}/10</p>
                          <p className="text-xs mt-1">{trResult.feedback}</p>
                        </div>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium mb-1">Your translation:</p>
                      <p className="text-muted-foreground italic">{translation || 'no answer'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Reference translation:</p>
                      <p className="text-muted-foreground">{q.referenceTranslation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Check / Next */}
              <div className="w-full">
                {!revealed ? (
                  <Button size="lg" className="w-full" onClick={handleCheckVA}>
                    Check Answer
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={goNext}>
                    {isLast ? 'See Results' : <>Next <ChevronRight className="w-5 h-5 ml-1" /></>}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
