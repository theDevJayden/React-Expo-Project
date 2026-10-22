import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from './Icon';
import { useFinance } from '../context/FinanceContext';
import { parseAmount } from '../utils/budget';
import {
  CUSTOM_CATEGORY_COLORS,
  EntryType,
  formatLongDate,
  getDayLabel,
  isDarkColor,
  toDateKey,
} from '../utils/entries';

type NewEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
};

type FormErrors = { amount?: string; title?: string; category?: string };

const MAX_TITLE = 60;
const MAX_CATEGORY_NAME = 20;

export default function NewEntrySheet({ visible, onClose }: NewEntrySheetProps) {
  const { categories, addEntry, addCategory } = useFinance();

  const [type, setType] = useState<EntryType>('expense');
  const [amountInput, setAmountInput] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState(CUSTOM_CATEGORY_COLORS[0].value);
  const [customError, setCustomError] = useState('');

  // Start every opening from a clean form, so a cancelled entry is discarded.
  useEffect(() => {
    if (!visible) return;
    setType('expense');
    setAmountInput('');
    setTitle('');
    setDate(new Date());
    setShowPicker(false);
    setCategoryId(null);
    setErrors({});
    setCustomOpen(false);
    setCustomName('');
    setCustomColor(CUSTOM_CATEGORY_COLORS[0].value);
    setCustomError('');
  }, [visible]);

  const isExpense = type === 'expense';
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const dateKey = toDateKey(date);
  const dayLabel = getDayLabel(dateKey);
  const dateText = dayLabel ? `${dayLabel}, ${formatLongDate(dateKey)}` : formatLongDate(dateKey);

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function selectType(next: EntryType) {
    setType(next);
    clearError('category');
    if (next === 'income') setCustomOpen(false);
  }

  function handleCreateCategory() {
    const name = customName.trim();
    if (name === '') {
      setCustomError('Enter a category name.');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCustomError('That category already exists.');
      return;
    }
    const created = addCategory(name, customColor);
    setCategoryId(created.id);
    clearError('category');
    setCustomOpen(false);
    setCustomName('');
    setCustomError('');
  }

  function handleSave() {
    const amount = parseAmount(amountInput);
    const next: FormErrors = {};
    if (amount === null) next.amount = 'Enter a positive whole number, for example 150000.';
    if (title.trim() === '') next.title = 'Enter a description.';
    if (isExpense && !selectedCategory) next.category = 'Choose a category for this expense.';

    if (amount === null || next.title || next.category) {
      setErrors(next);
      return;
    }

    addEntry({
      type,
      amount,
      title: title.trim(),
      date: dateKey,
      categoryId: isExpense ? categoryId : null,
    });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close new entry"
          onPress={onClose}
          className="absolute bottom-0 left-0 right-0 top-0 bg-inverse-surface/40"
        />

        <View className="rounded-t-[32px] bg-surface-container-lowest" style={{ maxHeight: '88%' }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 p-4 pb-8">
            {/* Handle and header */}
            <View className="items-center gap-2">
              <View className="h-1.5 w-12 rounded-full bg-slate-300" />
              <View className="w-full flex-row items-center justify-between pt-1">
                <Text className="font-jakarta-semibold text-[18px] leading-6 text-primary">New Entry</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss sheet"
                  onPress={onClose}
                  className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
                >
                  <Icon name="close" size={18} color="#404944" />
                </Pressable>
              </View>
            </View>

            {/* Expense / Income toggle */}
            <View className="flex-row gap-1 rounded-full bg-surface-container p-1">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isExpense }}
                onPress={() => selectType('expense')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2 ${isExpense ? 'bg-red-600' : ''}`}
              >
                <Icon name="south_east" size={18} color={isExpense ? '#ffffff' : '#404944'} />
                <Text className={`font-jakarta-semibold text-[12px] ${isExpense ? 'text-white' : 'text-on-surface-variant'}`}>
                  Expense
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !isExpense }}
                onPress={() => selectType('income')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2 ${!isExpense ? 'bg-green-600' : ''}`}
              >
                <Icon name="north_east" size={18} color={!isExpense ? '#ffffff' : '#404944'} />
                <Text className={`font-jakarta-semibold text-[12px] ${!isExpense ? 'text-white' : 'text-on-surface-variant'}`}>
                  Income
                </Text>
              </Pressable>
            </View>

            {/* Amount */}
            <View>
              <View
                className={`items-center rounded-2xl bg-surface-container-low px-4 py-2 ${errors.amount ? 'border border-error' : 'border border-transparent'}`}
              >
                <Text className="mb-1 font-jakarta-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Transaction Amount
                </Text>
                <View className="flex-row items-baseline justify-center gap-1">
                  <Text className="font-jakarta-bold text-[20px] text-primary">Rp</Text>
                  <TextInput
                    className="min-w-[120px] p-0 text-center font-jakarta-bold text-[36px] text-primary"
                    value={amountInput}
                    onChangeText={(value) => {
                      setAmountInput(value);
                      clearError('amount');
                    }}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#95d3ba"
                    accessibilityLabel="Transaction amount in rupiah"
                    maxLength={15}
                  />
                </View>
              </View>
              {errors.amount ? (
                <Text accessibilityRole="alert" className="mt-1 font-sans text-[12px] text-error">
                  {errors.amount}
                </Text>
              ) : null}
            </View>

            {/* Description and date */}
            <View className="gap-3">
              <View>
                <View
                  className={`flex-row items-center gap-3 rounded-2xl bg-surface-container-low px-3.5 py-2.5 ${errors.title ? 'border border-error' : 'border border-transparent'}`}
                >
                  <Icon name="edit" size={20} color="#707974" />
                  <View className="flex-1">
                    <Text className="font-jakarta-semibold text-[10px] text-on-surface-variant">Description / Title</Text>
                    <TextInput
                      className="p-0 font-jakarta-semibold text-[15px] text-on-surface"
                      value={title}
                      onChangeText={(value) => {
                        setTitle(value);
                        clearError('title');
                      }}
                      placeholder={isExpense ? 'e.g. Grocery Run' : 'e.g. Monthly Salary'}
                      placeholderTextColor="#707974"
                      accessibilityLabel="Description or title"
                      maxLength={MAX_TITLE}
                    />
                  </View>
                </View>
                {errors.title ? (
                  <Text accessibilityRole="alert" className="mt-1 font-sans text-[12px] text-error">
                    {errors.title}
                  </Text>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Transaction date, ${dateText}`}
                onPress={() => setShowPicker((open) => !open)}
                className="flex-row items-center gap-3 rounded-2xl bg-surface-container-low px-3.5 py-2.5"
              >
                <Icon name="calendar_today" size={20} color="#707974" />
                <View className="flex-1">
                  <Text className="font-jakarta-semibold text-[10px] text-on-surface-variant">Transaction Date</Text>
                  <Text className="font-jakarta-semibold text-[15px] text-on-surface">{dateText}</Text>
                </View>
                <Icon name="schedule" size={18} color="#707974" />
              </Pressable>

              {showPicker ? (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  maximumDate={new Date()}
                  onValueChange={(_event, selected) => {
                    if (Platform.OS !== 'ios') setShowPicker(false);
                    setDate(selected);
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              ) : null}
            </View>

            {/* Category picker (expenses only) */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-jakarta-semibold text-[12px] text-on-surface">Select Category</Text>
                <Text className="font-jakarta-bold text-[10px] text-secondary">
                  {!isExpense ? 'Not used for income' : selectedCategory ? `${selectedCategory.name} selected` : ''}
                </Text>
              </View>

              <View
                className={`flex-row flex-wrap ${isExpense ? '' : 'opacity-40'}`}
                pointerEvents={isExpense ? 'auto' : 'none'}
                accessibilityState={{ disabled: !isExpense }}
              >
                {categories.map((category, index) => {
                  const selected = isExpense && category.id === categoryId;
                  const circleColor = category.isDefault ? (selected ? '#ffffff' : '#f8f9ff') : category.color;
                  const iconColor = category.isDefault
                    ? selected
                      ? '#006c4a'
                      : '#404944'
                    : isDarkColor(category.color)
                      ? '#ffffff'
                      : '#0b1c30';
                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: !isExpense }}
                      disabled={!isExpense}
                      onPress={() => {
                        setCategoryId(category.id);
                        clearError('category');
                      }}
                      style={{ width: '32%', marginRight: index % 3 === 2 ? 0 : '2%' }}
                      className={`mb-2 items-center justify-center gap-1 rounded-2xl p-2.5 ${selected ? 'bg-secondary-container' : 'bg-surface-container-low'}`}
                    >
                      <View
                        className="h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: circleColor }}
                      >
                        <Icon name={category.icon} size={18} color={iconColor} />
                      </View>
                      <Text
                        numberOfLines={2}
                        className={`text-center text-[11px] leading-tight ${selected ? 'font-jakarta-bold text-on-secondary-container' : 'font-jakarta-semibold text-on-surface-variant'}`}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.category ? (
                <Text accessibilityRole="alert" className="font-sans text-[12px] text-error">
                  {errors.category}
                </Text>
              ) : null}
            </View>

            {/* Custom category */}
            <View
              className={`gap-2 rounded-2xl bg-surface-container-low p-3 ${isExpense ? '' : 'opacity-40'}`}
              pointerEvents={isExpense ? 'auto' : 'none'}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon name="palette" size={20} color="#006c4a" />
                  <Text className="font-jakarta-semibold text-[12px] text-on-surface">Custom Category</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={!isExpense}
                  onPress={() => {
                    setCustomOpen((open) => !open);
                    setCustomError('');
                  }}
                >
                  <Text className="font-jakarta-bold text-[10px] text-secondary">
                    {customOpen ? 'Cancel' : '+ Add Custom Category'}
                  </Text>
                </Pressable>
              </View>

              {customOpen ? (
                <View className="gap-3 rounded-xl bg-surface-container-lowest p-3">
                  <View>
                    <View
                      className={`flex-row items-center gap-2 rounded-xl bg-surface-container-low px-3 py-1.5 ${customError ? 'border border-error' : 'border border-transparent'}`}
                    >
                      <TextInput
                        className="flex-1 p-0 font-sans text-[12px] text-on-surface"
                        value={customName}
                        onChangeText={(value) => {
                          setCustomName(value);
                          setCustomError('');
                        }}
                        placeholder="Category name (e.g. Gym, Pets)"
                        placeholderTextColor="#707974"
                        accessibilityLabel="Custom category name"
                        maxLength={MAX_CATEGORY_NAME}
                      />
                      <Icon name="interests" size={18} color="#707974" />
                    </View>
                    {customError ? (
                      <Text accessibilityRole="alert" className="mt-1 font-sans text-[12px] text-error">
                        {customError}
                      </Text>
                    ) : null}
                  </View>

                  <View className="flex-row items-center justify-between px-1">
                    <Text className="font-jakarta-semibold text-[11px] text-on-surface-variant">Badge Tone:</Text>
                    <View className="flex-row items-center gap-2">
                      {CUSTOM_CATEGORY_COLORS.map((tone) => {
                        const selected = tone.value === customColor;
                        return (
                          <Pressable
                            key={tone.value}
                            accessibilityRole="button"
                            accessibilityLabel={`${tone.name} badge tone`}
                            accessibilityState={{ selected }}
                            onPress={() => setCustomColor(tone.value)}
                            className={`h-6 w-6 rounded-full ${selected ? 'border-2 border-primary' : 'border border-transparent'}`}
                            style={{ backgroundColor: tone.value }}
                          />
                        );
                      })}
                    </View>
                  </View>

                  <View className="flex-row justify-end">
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleCreateCategory}
                      className="rounded-full bg-secondary px-3 py-1"
                    >
                      <Text className="font-jakarta-bold text-[10px] text-white">Create Category</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Save */}
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-3.5 active:bg-primary-container"
            >
              <Icon name="check_circle" size={20} color="#ffffff" />
              <Text className="font-jakarta-semibold text-[18px] text-white">Save Transaction</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
