import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Category,
  createId,
  DEFAULT_CATEGORIES,
  Entry,
  isStoredEntry,
  OTHERS_CATEGORY_ID,
  sortNewestFirst,
} from '../utils/entries';

const ENTRIES_KEY = 'entries';
// Custom categories were removed. This key is only read to delete old saved data.
const LEGACY_CATEGORIES_KEY = 'customCategories';
const KNOWN_CATEGORY_IDS = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

type NewEntry = Omit<Entry, 'id' | 'createdAt'>;

type FinanceContextValue = {
  entries: Entry[]; // newest first
  categories: Category[];
  isLoaded: boolean;
  addEntry: (entry: NewEntry) => void;
  updateEntry: (id: string, entry: NewEntry) => void;
  deleteEntry: (id: string) => void;
  getCategory: (id: string | null) => Category | undefined;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

function readList<T>(raw: string | null, guard: (value: unknown) => value is T): T[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

// Income never has a category. Expenses that used a removed custom category become Others.
function withKnownCategory(entry: Entry): Entry {
  if (entry.type === 'income') return entry.categoryId === null ? entry : { ...entry, categoryId: null };
  if (entry.categoryId !== null && KNOWN_CATEGORY_IDS.has(entry.categoryId)) return entry;
  return { ...entry, categoryId: OTHERS_CATEGORY_ID };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load once. Saving waits for this so an empty first render never overwrites stored data.
  useEffect(() => {
    let active = true;
    AsyncStorage.removeItem(LEGACY_CATEGORIES_KEY).catch(() => undefined);
    AsyncStorage.getItem(ENTRIES_KEY)
      .then((rawEntries) => {
        if (!active) return;
        setEntries(sortNewestFirst(readList(rawEntries, isStoredEntry).map(withKnownCategory)));
      })
      .catch((error) => console.log('Could not load finance data:', error))
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch((error) =>
      console.log('Could not save entries:', error),
    );
  }, [entries, isLoaded]);

  const addEntry = useCallback((entry: NewEntry) => {
    const created: Entry = { ...entry, id: createId('tx'), createdAt: new Date().toISOString() };
    setEntries((prev) => sortNewestFirst([created, ...prev]));
  }, []);

  // Keeps id and createdAt, then re-sorts in case the date changed.
  const updateEntry = useCallback((id: string, entry: NewEntry) => {
    setEntries((prev) => sortNewestFirst(prev.map((e) => (e.id === id ? { ...e, ...entry } : e))));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getCategory = useCallback(
    (id: string | null) => (id === null ? undefined : DEFAULT_CATEGORIES.find((c) => c.id === id)),
    [],
  );

  const value = useMemo(
    () => ({ entries, categories: DEFAULT_CATEGORIES, isLoaded, addEntry, updateEntry, deleteEntry, getCategory }),
    [entries, isLoaded, addEntry, updateEntry, deleteEntry, getCategory],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
}
