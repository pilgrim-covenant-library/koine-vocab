'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit2, BookOpen, ChevronRight, X } from 'lucide-react';
import { useListStore, VocabList } from '@/stores/listStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

const LIST_COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  red: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-700' },
};

export default function ListsPage() {
  const router = useRouter();
  const { lists, createList, deleteList } = useListStore();
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateList = () => {
    if (newListName.trim()) {
      const list = createList(newListName.trim(), newListDescription.trim());
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false);
      router.push(`/lists/${list.id}`);
    }
  };

  const getWordPreview = (wordIds: string[]): VocabularyWord[] => {
    const words = vocabularyData.words as VocabularyWord[];
    return wordIds.slice(0, 3).map(id => words.find(w => w.id === id)).filter(Boolean) as VocabularyWord[];
  };

  if (!mounted) {
    return <ListsSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">My Word Lists</h1>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New List
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {lists.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No lists yet</h2>
            <p className="text-muted-foreground mb-6">
              Create custom lists to organize words you want to study together
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                wordPreview={getWordPreview(list.wordIds)}
                onDelete={() => deleteList(list.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create New List</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Verbs to Review"
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="e.g., Common verbs I keep forgetting"
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateList} disabled={!newListName.trim()} className="flex-1">
                    Create List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

interface ListCardProps {
  list: VocabList;
  wordPreview: VocabularyWord[];
  onDelete: () => void;
}

function ListCard({ list, wordPreview, onDelete }: ListCardProps) {
  const colorClasses = LIST_COLOR_CLASSES[list.color] || LIST_COLOR_CLASSES.blue;

  return (
    <Card className={cn('transition-all hover:shadow-md', colorClasses.border)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/lists/${list.id}`} className="flex-1">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses.bg)}>
                <BookOpen className={cn('w-5 h-5', colorClasses.text)} />
              </div>
              <div>
                <h3 className="font-semibold">{list.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {list.wordIds.length} word{list.wordIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {list.description && (
              <p className="text-sm text-muted-foreground mt-2">{list.description}</p>
            )}
            {wordPreview.length > 0 && (
              <div className="flex gap-2 mt-3">
                {wordPreview.map((word) => (
                  <span
                    key={word.id}
                    className="px-2 py-1 text-xs rounded bg-muted font-greek"
                  >
                    {word.greek}
                  </span>
                ))}
                {list.wordIds.length > 3 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{list.wordIds.length - 3} more
                  </span>
                )}
              </div>
            )}
          </Link>
          <div className="flex items-center gap-1 ml-2">
            <Link href={`/lists/${list.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={(e) => {
                e.preventDefault();
                if (confirm('Delete this list?')) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ListsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded" />
          <div className="h-6 w-32 bg-muted rounded" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </main>
    </div>
  );
}
