'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Trash2, X, Search, Plus, BookOpen, Edit2, Check } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
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

const LIST_COLORS = Object.keys(LIST_COLOR_CLASSES);

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { getList, updateList, removeWordFromList, addWordToList, deleteList } = useListStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddWords, setShowAddWords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const list = getList(listId);
  const allWords = vocabularyData.words as VocabularyWord[];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (list) {
      setEditName(list.name);
      setEditDescription(list.description);
    }
  }, [list]);

  const listWords = useMemo(() => {
    if (!list) return [];
    return list.wordIds
      .map(id => allWords.find(w => w.id === id))
      .filter(Boolean) as VocabularyWord[];
  }, [list, allWords]);

  const availableWords = useMemo(() => {
    if (!list) return [];
    return allWords
      .filter(w => !list.wordIds.includes(w.id))
      .filter(w => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          w.greek.toLowerCase().includes(query) ||
          w.gloss.toLowerCase().includes(query) ||
          w.transliteration.toLowerCase().includes(query)
        );
      })
      .slice(0, 50);
  }, [list, allWords, searchQuery]);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateList(listId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleColorChange = (color: string) => {
    updateList(listId, { color });
  };

  const handleDeleteList = () => {
    if (confirm('Are you sure you want to delete this list? This cannot be undone.')) {
      deleteList(listId);
      router.push('/lists');
    }
  };

  if (!mounted) {
    return <ListDetailSkeleton />;
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">List not found</h2>
          <p className="text-muted-foreground mb-6">This list may have been deleted.</p>
          <Link href="/lists">
            <Button>Back to Lists</Button>
          </Link>
        </div>
      </div>
    );
  }

  const colorClasses = LIST_COLOR_CLASSES[list.color] || LIST_COLOR_CLASSES.blue;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b-2 border-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClasses.bg)}>
                    <BookOpen className={cn('w-4 h-4', colorClasses.text)} />
                  </div>
                  <h1 className="text-lg font-semibold">{list.name}</h1>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={handleDeleteList}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {LIST_COLORS.map((color) => {
                    const classes = LIST_COLOR_CLASSES[color];
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          classes.bg,
                          list.color === color ? 'ring-2 ring-primary ring-offset-2' : 'border-transparent'
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {list.description && !isEditing && (
          <p className="text-muted-foreground mb-4">{list.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {list.wordIds.length} word{list.wordIds.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddWords(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Words
            </Button>
            {list.wordIds.length > 0 && (
              <Link href={`/learn/cram?listId=${list.id}`}>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Practice
                </Button>
              </Link>
            )}
          </div>
        </div>

        {listWords.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No words yet</h2>
            <p className="text-muted-foreground mb-6">
              Add words from your vocabulary to this list
            </p>
            <Button onClick={() => setShowAddWords(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Words
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {listWords.map((word) => (
              <Card key={word.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <GreekWord
                        greek={word.greek}
                        transliteration={word.transliteration}
                        size="md"
                      />
                      <p className="text-sm text-muted-foreground mt-1">{word.gloss}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => removeWordFromList(list.id, word.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Words Modal */}
      {showAddWords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[80vh] flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add Words to List</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAddWords(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vocabulary..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {availableWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => addWordToList(list.id, word.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <span className="font-greek text-lg">{word.greek}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {word.transliteration}
                      </span>
                      <p className="text-sm text-muted-foreground">{word.gloss}</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
                {availableWords.length === 0 && searchQuery && (
                  <p className="text-center text-muted-foreground py-8">
                    No matching words found
                  </p>
                )}
                {availableWords.length === 0 && !searchQuery && (
                  <p className="text-center text-muted-foreground py-8">
                    All words are already in this list
                  </p>
                )}
              </div>

              <div className="pt-4 border-t mt-4">
                <Button onClick={() => setShowAddWords(false)} className="w-full">
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ListDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded" />
          <div className="h-6 w-48 bg-muted rounded" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </main>
    </div>
  );
}
