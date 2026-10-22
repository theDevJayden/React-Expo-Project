import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Category,
  CUSTOM_CATEGORY_ICON,
  createId,
  DEFAULT_CATEGORIES,
  Entry,
  isStoredCategory,
  isStoredEntry,
  sortNewestFirst,
  StoredCategory,
} from '../utils/entries';

const ENTRIES_KEY = 'entries';
const CATEGORIES_KEY = 'customCategories';

type NewEntry = Omit<Entry, 'id' | 'createdAt'>;

type FinanceContextValue = {
  entries: Entry[]; // newest first
  categories: Category[]; // defaults first, then custom
  isLoaded: boolean;
  addEntry: (entry: NewEntry) => void;
  addCategory: (name: string, color: string) => Category;
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

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [customCategories, setCustomCategories] = useState<StoredCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load once. Saving waits for this so an empty first render never overwrites stored data.
  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(ENTRIES_KEY), AsyncStorage.getItem(CATEGORIES_KEY)])
      .then(([rawEntries, rawCategories]) => {
        if (!active) return;
        setEntries(sortNewestFirst(readList(rawEntries, isStoredEntry)));
        setCustomCategories(readList(rawCategories, isStoredCategory));
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

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories)).catch((error) =>
      console.log('Could not save categories:', error),
    );
  }, [customCategories, isLoaded]);

  const addEntry = useCallback((entry: NewEntry) => {
    const created: Entry = { ...entry, id: createId('tx'), createdAt: new Date().toISOString() };
    setEntries((prev) => sortNewestFirst([created, ...prev]));
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const stored: StoredCategory = { id: createId('cat'), name, color };
    setCustomCategories((prev) => [...prev, stored]);
    return { ...stored, icon: CUSTOM_CATEGORY_ICON, isDefault: false };
  }, []);

  const categories = useMemo<Category[]>(
    () => [
      ...DEFAULT_CATEGORIES,
      ...customCategories.map((c) => ({ ...c, icon: CUSTOM_CATEGORY_ICON, isDefault: false })),
    ],
    [customCategories],
  );

  const getCategory = useCallback(
    (id: string | null) => (id === null ? undefined : categories.find((c) => c.id === id)),
    [categories],
  );

  const value = useMemo(
    () => ({ entries, categories, isLoaded, addEntry, addCategory, getCategory }),
    [entries, categories, isLoaded, addEntry, addCategory, getCategory],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
}
