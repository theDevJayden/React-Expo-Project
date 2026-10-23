import type { IconName } from '../components/Icon';

export type EntryType = 'income' | 'expense';

export type Entry = {
  id: string;
  type: EntryType;
  amount: number;
  title: string;
  date: string; // YYYY-MM-DD in local time
  categoryId: string | null; // always null for income
  createdAt: string; // ISO timestamp, used for the time label and ordering
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: IconName;
};

export const OTHERS_CATEGORY_ID = 'cat-others';

// PRD default categories (names and colours from the PRD data model), plus Others.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Housing Bills', color: '#3B82F6', icon: 'cottage' },
  { id: 'cat-2', name: 'Medical', color: '#EF4444', icon: 'medical_services' },
  { id: 'cat-3', name: 'Food & Beverages', color: '#10B981', icon: 'restaurant' },
  { id: 'cat-4', name: 'Transport', color: '#F59E0B', icon: 'directions_car' },
  { id: 'cat-5', name: 'Leisure', color: '#8B5CF6', icon: 'headphones' },
  { id: 'cat-6', name: 'Shopping', color: '#EC4899', icon: 'shopping_bag' },
  { id: OTHERS_CATEGORY_ID, name: 'Others', color: '#64748B', icon: 'question_mark' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

// Local date, not toISOString(): UTC would put late-night entries on the wrong day.
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// "22 Oct 2026"
export function formatLongDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function getDayLabel(key: string, now: Date = new Date()): 'Today' | 'Yesterday' | null {
  if (key === toDateKey(now)) return 'Today';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (key === toDateKey(yesterday)) return 'Yesterday';
  return null;
}

// "Today • 22 Oct 2026", or "20 Oct 2026" for older days
export function formatGroupHeader(key: string, now: Date = new Date()): string {
  const label = getDayLabel(key, now);
  const long = formatLongDate(key);
  return label ? `${label} • ${long}` : long;
}

// "Today", "Yesterday", or "20 Oct"
export function formatShortDay(key: string, now: Date = new Date()): string {
  const label = getDayLabel(key, now);
  if (label) return label;
  const d = parseDateKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function sortNewestFirst(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  );
}

export function getMonthTotals(entries: Entry[], now: Date = new Date()) {
  const month = toDateKey(now).slice(0, 7);
  let income = 0;
  let expenses = 0;
  for (const entry of entries) {
    if (!entry.date.startsWith(month)) continue;
    if (entry.type === 'income') income += entry.amount;
    else expenses += entry.amount;
  }
  return { income, expenses, savings: income - expenses };
}

export function getNet(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0);
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Guards for data read back from AsyncStorage.
export function isStoredEntry(value: unknown): value is Entry {
  const e = value as Entry;
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof e.id === 'string' &&
    (e.type === 'income' || e.type === 'expense') &&
    Number.isSafeInteger(e.amount) &&
    e.amount > 0 &&
    typeof e.title === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    (e.categoryId === null || typeof e.categoryId === 'string') &&
    typeof e.createdAt === 'string'
  );
}

