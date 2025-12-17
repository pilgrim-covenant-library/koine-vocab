import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface VocabList {
  id: string;
  name: string;
  description: string;
  wordIds: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
}

interface ListState {
  lists: VocabList[];

  // Actions
  createList: (name: string, description?: string, color?: string) => VocabList;
  updateList: (id: string, updates: Partial<Pick<VocabList, 'name' | 'description' | 'color'>>) => void;
  deleteList: (id: string) => void;
  addWordToList: (listId: string, wordId: string) => void;
  removeWordFromList: (listId: string, wordId: string) => void;
  addWordsToList: (listId: string, wordIds: string[]) => void;
  isWordInList: (listId: string, wordId: string) => boolean;
  getListsForWord: (wordId: string) => VocabList[];
  getList: (id: string) => VocabList | undefined;
}

const LIST_COLORS = [
  'emerald',
  'blue',
  'purple',
  'pink',
  'amber',
  'orange',
  'red',
  'teal',
];

export const useListStore = create<ListState>()(
  persist(
    (set, get) => ({
      lists: [],

      createList: (name, description = '', color) => {
        const newList: VocabList = {
          id: generateId(),
          name,
          description,
          wordIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          color: color || LIST_COLORS[get().lists.length % LIST_COLORS.length],
        };

        set((state) => ({
          lists: [...state.lists, newList],
        }));

        return newList;
      },

      updateList: (id, updates) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id
              ? { ...list, ...updates, updatedAt: new Date().toISOString() }
              : list
          ),
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
        }));
      },

      addWordToList: (listId, wordId) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId && !list.wordIds.includes(wordId)
              ? {
                  ...list,
                  wordIds: [...list.wordIds, wordId],
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },

      removeWordFromList: (listId, wordId) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  wordIds: list.wordIds.filter((id) => id !== wordId),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },

      addWordsToList: (listId, wordIds) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  wordIds: [...new Set([...list.wordIds, ...wordIds])],
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },

      isWordInList: (listId, wordId) => {
        const list = get().lists.find((l) => l.id === listId);
        return list ? list.wordIds.includes(wordId) : false;
      },

      getListsForWord: (wordId) => {
        return get().lists.filter((list) => list.wordIds.includes(wordId));
      },

      getList: (id) => {
        return get().lists.find((list) => list.id === id);
      },
    }),
    {
      name: 'koine-list-store',
    }
  )
);
