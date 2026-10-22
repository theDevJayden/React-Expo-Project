import { Text, View } from 'react-native';
import Icon from './Icon';
import { formatRupiah, formatSignedRupiah } from '../utils/budget';

type MonthlyOverviewCardProps = {
  income: number;
  expenses: number;
  savings: number;
};

// Shared by Home and Expense & Income. Totals are for the current month.
export default function MonthlyOverviewCard({ income, expenses, savings }: MonthlyOverviewCardProps) {
  return (
    <View className="gap-4 rounded-[32px] bg-primary-container p-6 shadow-xl">
      <Text className="font-jakarta-semibold text-[20px] leading-7 tracking-tight text-on-primary">
        Monthly Overview
      </Text>

      <View className="gap-2 pt-1">
        <View className="flex-row items-center justify-between rounded-2xl bg-white/10 p-4">
          <View>
            <Text className="font-jakarta-bold text-[10px] uppercase tracking-wide text-primary-fixed-dim">Income</Text>
            <Text className="mt-0.5 font-jakarta-bold text-[24px] leading-8 tracking-tight text-on-primary">
              {formatRupiah(income)}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary-container/30">
            <Icon name="arrow_upward" size={18} color="#85f8c4" />
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-2xl bg-white/10 p-4">
          <View>
            <Text className="font-jakarta-bold text-[10px] uppercase tracking-wide text-primary-fixed-dim">Expenses</Text>
            <Text className="mt-0.5 font-jakarta-bold text-[24px] leading-8 tracking-tight text-on-primary">
              {expenses > 0 ? `-${formatRupiah(expenses)}` : formatRupiah(0)}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-error-container/40">
            <Icon name="arrow_downward" size={18} color="#ffdad6" />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between rounded-2xl bg-surface-container-lowest p-4 shadow-md">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
            <Icon name="savings" size={20} color="#00714e" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-jakarta-semibold text-[10px] text-on-surface-variant">Monthly Net Savings</Text>
            <Text
              className={`font-jakarta-bold text-[20px] leading-7 ${savings < 0 ? 'text-error' : 'text-secondary'}`}
            >
              {savings === 0 ? formatRupiah(0) : formatSignedRupiah(savings)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
