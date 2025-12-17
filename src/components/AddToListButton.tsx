'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ListPlus, Check, Plus } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface AddToListButtonProps {
  wordId: string;
  className?: string;
}

export function AddToListButton({ wordId, className }: AddToListButtonProps) {
  const { lists, addWordToList, removeWordFromList, isWordInList } = useListStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const listsContainingWord = lists.filter(list => isWordInList(list.id, wordId));

  const handleToggleList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWordInList(listId, wordId)) {
      removeWordFromList(listId, wordId);
    } else {
      addWordToList(listId, wordId);
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'h-8',
          listsContainingWord.length > 0 && 'text-primary border-primary'
        )}
      >
        <ListPlus className="w-4 h-4 mr-1" />
        {listsContainingWord.length > 0 ? (
          <>In {listsContainingWord.length} list{listsContainingWord.length !== 1 ? 's' : ''}</>
        ) : (
          <>Add to List</>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {lists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No lists yet</p>
                <Link href="/lists" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Create a List
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {lists.map((list) => {
                  const inList = isWordInList(list.id, wordId);
                  return (
                    <button
                      key={list.id}
                      onClick={(e) => handleToggleList(list.id, e)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors',
                        inList && 'bg-primary/5'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center',
                        inList ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      )}>
                        {inList && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{list.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {list.wordIds.length} word{list.wordIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
                <div className="border-t p-2">
                  <Link href="/lists" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New List
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
