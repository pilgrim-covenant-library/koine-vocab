'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Book, Type, FileText, Table, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types/homework';

interface HelpLink {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const helpLinks: HelpLink[] = [
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

// Map sections to most relevant help pages
const sectionHelpMap: Record<SectionId, string[]> = {
  1: ['/homework/help/transliteration'],
  2: ['/homework/help/transliteration'],
  3: ['/homework/help/grammar-terms'],
  4: ['/homework/help/greek-cases'],
  5: ['/homework/help/article-paradigm'],
};

interface HelpButtonProps {
  currentSection?: SectionId;
  className?: string;
}

export function HelpButton({ currentSection, className }: HelpButtonProps) {
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

  // Get recommended links based on current section
  const recommendedHrefs = currentSection ? sectionHelpMap[currentSection] : [];

  // Sort links: recommended first, then others
  const sortedLinks = [...helpLinks].sort((a, b) => {
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
export function FloatingHelpButton({ currentSection }: { currentSection?: SectionId }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <HelpButton currentSection={currentSection} />
    </div>
  );
}
