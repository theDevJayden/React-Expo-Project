import { Pressable, Text, View } from 'react-native';
import Icon from './Icon';
import { formatRupiah } from '../utils/budget';
import type { EntryType } from '../utils/entries';

type TransactionRowProps = {
  type: EntryType;
  title: string;
  meta?: string;
  amount: number;
  onEdit?: () => void;
};

// Shared by Home > Recent Activity and the Expense & Income list.
// Income: green up arrow on light green. Expense: red down arrow on light red, red amount and label.
export default function TransactionRow({ type, title, meta, amount, onEdit }: TransactionRowProps) {
  const isIncome = type === 'income';
  const tone = isIncome ? 'text-secondary' : 'text-red-600';

  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}
        >
          <Icon
            name={isIncome ? 'arrow_upward' : 'arrow_downward'}
            size={20}
            color={isIncome ? '#16a34a' : '#dc2626'}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-jakarta-semibold text-[14px] leading-5 text-on-surface">
            {title}
          </Text>
          {meta ? (
            <Text numberOfLines={1} className="font-sans text-[12px] text-on-surface-variant">
              {meta}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="ml-2 items-end">
        <Text className={`font-jakarta-bold text-[14px] leading-5 ${tone}`}>
          {`${isIncome ? '+' : '-'}${formatRupiah(amount)}`}
        </Text>
        <Text className={`font-jakarta-semibold text-[10px] ${tone}`}>{isIncome ? 'Income' : 'Expense'}</Text>
      </View>
      {onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          onPress={onEdit}
          hitSlop={8}
          className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-surface-container-low"
        >
          <Icon name="edit" size={16} color="#404944" />
        </Pressable>
      ) : null}
    </View>
  );
}
