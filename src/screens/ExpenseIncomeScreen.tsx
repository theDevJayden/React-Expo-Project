import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, SectionList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FriendlyLogo from '../components/FriendlyLogo';
import Icon from '../components/Icon';
import MonthlyOverviewCard from '../components/MonthlyOverviewCard';
import NewEntrySheet from '../components/NewEntrySheet';
import TransactionRow from '../components/TransactionRow';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/budget';
import { Entry, formatGroupHeader, getMonthTotals, getNet } from '../utils/entries';

type Filter = 'all' | 'expense' | 'income';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'expense', label: 'Expenses' },
  { key: 'income', label: 'Income' },
];

// href null = current page or not built yet.
const NAV_ITEMS = [
  { icon: 'account_balance_wallet', label: 'Home', active: false, href: '/home' },
  { icon: 'monitoring', label: 'Analytics', active: false, href: null },
  { icon: 'receipt_long', label: 'Transactions', active: true, href: null },
  { icon: 'manage_accounts', label: 'Settings', active: false, href: null },
] as const;

type Section = { title: string; net: number; data: Entry[] };

function formatNet(net: number): string {
  if (net === 0) return `${formatRupiah(0)} net`;
  return `${net > 0 ? '+' : '-'}${formatRupiah(net)} net`;
}

export default function ExpenseIncomeScreen() {
  const { entries, getCategory, isLoaded } = useFinance();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const totals = getMonthTotals(entries);

  // Entries arrive newest first, so same-day entries are already next to each other.
  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLowerCase();
    const visible = entries.filter((entry) => {
      if (filter !== 'all' && entry.type !== filter) return false;
      if (q === '') return true;
      const category = getCategory(entry.categoryId)?.name ?? '';
      return entry.title.toLowerCase().includes(q) || category.toLowerCase().includes(q);
    });

    const groups: Section[] = [];
    for (const entry of visible) {
      const last = groups[groups.length - 1];
      if (last && last.title === entry.date) last.data.push(entry);
      else groups.push({ title: entry.date, net: 0, data: [entry] });
    }
    return groups.map((group) => ({ ...group, net: getNet(group.data) }));
  }, [entries, filter, query, getCategory]);

  const hasEntries = entries.length > 0;

  const listHeader = (
    <View className="gap-4 pb-2 pt-1">
      <View>
        <Text className="font-jakarta-semibold text-[20px] leading-7 tracking-tight text-primary">Expense & Income</Text>
        <Text className="font-sans text-[12px] text-on-surface-variant">Track, classify & manage cash flows</Text>
      </View>

      <MonthlyOverviewCard income={totals.income} expenses={totals.expenses} savings={totals.savings} />

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-full bg-surface-container-lowest px-4 py-2.5 shadow-sm">
            <Icon name="search" size={20} color="#707974" />
            <TextInput
              className="ml-2 flex-1 p-0 font-sans text-[12px] text-on-surface"
              value={query}
              onChangeText={setQuery}
              placeholder="Search by title or category..."
              placeholderTextColor="#707974"
              accessibilityLabel="Search transactions"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
          {/* Filter options are out of scope: this button does nothing yet. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle filters"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm"
          >
            <Icon name="tune" size={20} color="#003527" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 py-1">
          {FILTERS.map((item) => {
            const active = item.key === filter;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(item.key)}
                className={`rounded-full px-4 py-1.5 ${active ? 'bg-primary' : 'bg-surface-container'}`}
              >
                <Text
                  className={`font-jakarta-semibold text-[12px] ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  const emptyState = isLoaded ? (
    <View className="items-center gap-1 rounded-2xl bg-surface-container-lowest px-4 py-8 shadow-sm">
      <Icon name="receipt_long" size={32} color="#707974" />
      <Text className="mt-1 font-jakarta-semibold text-[15px] text-on-surface">
        {hasEntries ? 'No matching transactions' : 'No transactions yet'}
      </Text>
      <Text className="text-center font-sans text-[12px] text-on-surface-variant">
        {hasEntries
          ? 'Try a different search or filter.'
          : 'Tap Add Entry to record your first income or expense.'}
      </Text>
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="h-16 flex-row items-center justify-between bg-surface px-4">
        <View className="flex-row items-center gap-2">
          <FriendlyLogo size={32} />
          <View>
            <Text className="font-jakarta-semibold text-[18px] leading-[18px] tracking-tight text-primary">
              Friendly
            </Text>
            <Text className="mt-0.5 font-jakarta-bold text-[10px] leading-[10px] text-on-surface-variant">
              Expense & Income
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <Icon name="notifications" size={22} color="#404944" />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-surface bg-error" />
          </Pressable>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={18} color="#ffffff" />
          </View>
        </View>
      </View>

      <View className="flex-1">
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyState}
          renderSectionHeader={({ section }) => (
            <View className="flex-row items-center justify-between pb-2 pt-4">
              <Text className="font-jakarta-semibold text-[12px] text-on-surface-variant">
                {formatGroupHeader(section.title)}
              </Text>
              <Text className="font-jakarta-bold text-[10px] text-on-surface-variant">{formatNet(section.net)}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <View className="rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
              <TransactionRow
                type={item.type}
                title={item.title}
                meta={getCategory(item.categoryId)?.name}
                amount={item.amount}
                onEdit={() => {
                  setEditingEntry(item);
                  setSheetVisible(true);
                }}
              />
            </View>
          )}
        />

        <View className="absolute bottom-4 right-4">
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setEditingEntry(null);
              setSheetVisible(true);
            }}
            className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3.5 shadow-lg active:bg-primary-container"
          >
            <Icon name="add" size={22} color="#ffffff" />
            <Text className="font-jakarta-semibold text-[15px] text-white">Add Entry</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom navigation (only Home and Transactions are wired up for now) */}
      <View className="h-16 flex-row items-center justify-around bg-surface px-2">
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.active }}
            onPress={item.href ? () => router.navigate(item.href) : undefined}
            className="min-h-[44px] min-w-[56px] items-center justify-center gap-0.5"
          >
            <Icon name={item.icon} size={24} color={item.active ? '#003527' : '#404944'} />
            <Text className={`font-jakarta-bold text-[10px] ${item.active ? 'text-primary' : 'text-on-surface-variant'}`}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <NewEntrySheet visible={sheetVisible} entry={editingEntry} onClose={() => setSheetVisible(false)} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
