'use client';

import { useState } from 'react';
import { Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { FinalExamSectionId } from '@/types/homework';

interface SectionData {
  sectionId: FinalExamSectionId;
  title: string;
  questionIds: string[];
  answeredIds: Set<string>;
  flaggedIds: Set<string>;
}

interface ExamQuestionGridProps {
  sections: SectionData[];
  currentSectionId: FinalExamSectionId;
  currentQuestionIndex: number;
  onNavigate: (sectionId: FinalExamSectionId, questionIndex: number) => void;
}

export function ExamQuestionGrid({
  sections,
  currentSectionId,
  currentQuestionIndex,
  onNavigate,
}: ExamQuestionGridProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalAnswered = sections.reduce((sum, s) => sum + s.answeredIds.size, 0);
  const totalQuestions = sections.reduce((sum, s) => sum + s.questionIds.length, 0);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 h-8 text-xs"
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        <span>{totalAnswered}/{totalQuestions}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[320px] sm:w-[400px] bg-background border rounded-lg shadow-lg p-4 space-y-4">
          {sections.map((section) => {
            let globalOffset = 0;
            for (const s of sections) {
              if (s.sectionId === section.sectionId) break;
              globalOffset += s.questionIds.length;
            }

            return (
              <div key={section.sectionId}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {section.title}
                </p>
                <div className="grid grid-cols-10 sm:grid-cols-10 gap-1">
                  {section.questionIds.map((qId, idx) => {
                    const isCurrent = section.sectionId === currentSectionId && idx === currentQuestionIndex;
                    const isAnswered = section.answeredIds.has(qId);
                    const isFlagged = section.flaggedIds.has(qId);

                    return (
                      <button
                        key={qId}
                        onClick={() => {
                          onNavigate(section.sectionId, idx);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'relative w-full aspect-square rounded text-xs font-medium transition-colors',
                          'hover:ring-2 hover:ring-primary/50',
                          isCurrent && 'ring-2 ring-primary',
                          isAnswered && !isCurrent && 'bg-primary/20 text-primary',
                          !isAnswered && !isCurrent && 'bg-muted text-muted-foreground',
                        )}
                      >
                        {globalOffset + idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
