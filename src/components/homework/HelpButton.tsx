'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Book, Type, FileText, Table, ChevronRight, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionId, HW2SectionId, HW3SectionId, HW4SectionId } from '@/types/homework';

interface HelpLink {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// HW1 Help links
const hw1HelpLinks: HelpLink[] = [
  {
    href: '/homework/help/transliteration',
    label: 'Transliteration Guide',
    description: 'Greek alphabet to Latin letters',
    icon: <Type className="w-4 h-4" />,
  },
  {
    href: '/homework/help/grammar-terms',
    label: 'Grammar Terms',
    description: 'Parts of speech definitions',
    icon: <Book className="w-4 h-4" />,
  },
  {
    href: '/homework/help/greek-cases',
    label: 'Greek Cases',
    description: 'The five case functions',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    href: '/homework/help/article-paradigm',
    label: 'Article Paradigm',
    description: 'All forms of the article',
    icon: <Table className="w-4 h-4" />,
  },
];

// HW2 Help links
const hw2HelpLinks: HelpLink[] = [
  {
    href: '/homework/help/noun-paradigms',
    label: 'Noun Paradigms',
    description: 'All noun declension patterns',
    icon: <Table className="w-4 h-4" />,
  },
  {
    href: '/homework/help/pronouns',
    label: 'Personal Pronouns',
    description: '1st, 2nd, and 3rd person forms',
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: '/homework/help/prepositions',
    label: 'Prepositions',
    description: 'Greek prepositions and cases',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    href: '/homework/help/greek-cases',
    label: 'Greek Cases',
    description: 'The five case functions',
    icon: <FileText className="w-4 h-4" />,
  },
];

// Legacy export for backwards compatibility
const helpLinks = hw1HelpLinks;

// Map HW1 sections to most relevant help pages
const hw1SectionHelpMap: Record<SectionId, string[]> = {
  1: ['/homework/help/transliteration'],
  2: ['/homework/help/transliteration'],
  3: ['/homework/help/grammar-terms'],
  4: ['/homework/help/greek-cases'],
  5: ['/homework/help/article-paradigm'],
};

// Map HW2 sections to most relevant help pages
const hw2SectionHelpMap: Record<HW2SectionId, string[]> = {
  1: ['/homework/help/noun-paradigms'],  // Masculine nouns
  2: ['/homework/help/noun-paradigms'],  // Feminine nouns
  3: ['/homework/help/noun-paradigms'],  // Neuter nouns
  4: ['/homework/help/pronouns'],         // Personal pronouns
  5: ['/homework/help/prepositions'],     // Prepositions
};

// HW3 Help links (verb paradigms)
const hw3HelpLinks: HelpLink[] = [
  {
    href: '/homework/help/verb-paradigms',
    label: 'Verb Paradigms',
    description: 'Present, Imperfect, Aorist forms',
    icon: <Table className="w-4 h-4" />,
  },
  {
    href: '/homework/help/grammar-terms',
    label: 'Grammar Terms',
    description: 'Parts of speech definitions',
    icon: <Book className="w-4 h-4" />,
  },
];

// Map HW3 sections to most relevant help pages
const hw3SectionHelpMap: Record<HW3SectionId, string[]> = {
  1: ['/homework/help/verb-paradigms'],  // Present Active Indicative (λύω)
  2: ['/homework/help/verb-paradigms'],  // Imperfect Active Indicative (λύω)
  3: ['/homework/help/verb-paradigms'],  // Present Active Indicative (εἰμί)
  4: ['/homework/help/verb-paradigms'],  // Imperfect Active Indicative (εἰμί)
  5: ['/homework/help/verb-paradigms'],  // First Aorist Active Indicative (λύω)
};

// HW4 Help links (verb paradigms, participles, pronouns, conjunctions)
const hw4HelpLinks: HelpLink[] = [
  {
    href: '/homework/help/verb-paradigms',
    label: 'Verb Paradigms',
    description: 'Future, participle, and other verb forms',
    icon: <Table className="w-4 h-4" />,
  },
  {
    href: '/homework/help/pronouns',
    label: 'Personal Pronouns',
    description: '1st and 2nd person pronoun forms',
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: '/homework/help/grammar-terms',
    label: 'Grammar Terms',
    description: 'Parts of speech definitions',
    icon: <Book className="w-4 h-4" />,
  },
];

// Map HW4 sections to most relevant help pages
const hw4SectionHelpMap: Record<HW4SectionId, string[]> = {
  1: ['/homework/help/verb-paradigms'],   // Future Active Indicative
  2: ['/homework/help/verb-paradigms'],   // Present Active Participles
  3: ['/homework/help/verb-paradigms'],   // Aorist Active Participles
  4: ['/homework/help/pronouns'],         // Pronouns
  5: ['/homework/help/grammar-terms'],    // Conjunctions
  6: ['/homework/help/verb-paradigms', '/homework/help/pronouns'], // Verse Translation
};

// Legacy alias
const sectionHelpMap = hw1SectionHelpMap;

interface HelpButtonProps {
  currentSection?: SectionId | HW2SectionId | HW3SectionId | HW4SectionId;
  homeworkId?: 'hw1' | 'hw2' | 'hw3' | 'hw4';
  className?: string;
}

export function HelpButton({ currentSection, homeworkId = 'hw1', className }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select help links and map based on homework ID
  const currentHelpLinks = homeworkId === 'hw4' ? hw4HelpLinks : homeworkId === 'hw3' ? hw3HelpLinks : homeworkId === 'hw2' ? hw2HelpLinks : hw1HelpLinks;
  const currentSectionHelpMap = homeworkId === 'hw4' ? hw4SectionHelpMap : homeworkId === 'hw3' ? hw3SectionHelpMap : homeworkId === 'hw2' ? hw2SectionHelpMap : hw1SectionHelpMap;

  // Get recommended links based on current section (defensive ?? [] for unknown section IDs)
  const recommendedHrefs = currentSection ? (currentSectionHelpMap[currentSection as SectionId] ?? []) : [];

  // Sort links: recommended first, then others
  const sortedLinks = [...currentHelpLinks].sort((a, b) => {
    const aRecommended = recommendedHrefs.includes(a.href);
    const bRecommended = recommendedHrefs.includes(b.href);
    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return 0;
  });

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isOpen && 'ring-2 ring-primary ring-offset-2'
        )}
        aria-label="Help"
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full right-0 mb-2 w-72',
            'bg-card border border-border rounded-lg shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-200'
          )}
        >
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reference Pages
            </p>
            <div className="space-y-1">
              {sortedLinks.map((link) => {
                const isRecommended = recommendedHrefs.includes(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-2 py-2 rounded-md transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isRecommended && 'bg-primary/10'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-md',
                        isRecommended
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {link.label}
                        {isRecommended && (
                          <span className="ml-2 text-xs text-primary">(Recommended)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed position wrapper for use in pages
export function FloatingHelpButton({
  currentSection,
  homeworkId = 'hw1'
}: {
  currentSection?: SectionId | HW2SectionId | HW3SectionId | HW4SectionId;
  homeworkId?: 'hw1' | 'hw2' | 'hw3' | 'hw4';
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <HelpButton currentSection={currentSection} homeworkId={homeworkId} />
    </div>
  );
}
