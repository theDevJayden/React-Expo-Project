import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import FriendlyLogo from '../components/FriendlyLogo';
import Icon from '../components/Icon';
import {
  BudgetLevel,
  formatRupiah,
  formatSignedRupiah,
  getBudgetSummary,
  parseBudgetCap,
} from '../utils/budget';

// Sample data (unchanged from the design)
const INCOME = 12450000;
const EXPENSES = 8120000;
const DEFAULT_CAP = 10000000;
const STORAGE_KEY = 'budgetCap';

const SAVINGS = INCOME - EXPENSES;

const RING_RADIUS = 48;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const LEVEL_STYLES: Record<
  BudgetLevel,
  { ring: string; pill: string; text: string; dot: string }
> = {
  ok: { ring: '#006c4a', pill: 'bg-secondary-container', text: 'text-on-secondary-container', dot: 'bg-secondary' },
  warning: { ring: '#f59e0b', pill: 'bg-amber-100', text: 'text-amber-900', dot: 'bg-amber-500' },
  over: { ring: '#ba1a1a', pill: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error' },
};

const QUICK_ACTIONS = [
  {
    icon: 'payments',
    iconColor: '#00714e',
    iconBg: 'bg-secondary-container',
    title: 'Expense & Income',
    subtitle: 'Transaction ledger & all records',
  },
  {
    icon: 'pie_chart',
    iconColor: '#003527',
    iconBg: 'bg-surface-container-high',
    title: 'Category Spending',
    subtitle: 'Breakdown analytics & proportions',
  },
  {
    icon: 'description',
    iconColor: '#004f34',
    iconBg: 'bg-surface-container',
    title: 'Debt Tracker',
    subtitle: 'Payoffs, amortization & loans',
  },
] as const;

const ACTIVITIES = [
  { id: 'tx-1', title: 'Payroll Deposit', meta: 'Today, 9:15 AM', amount: 6200000, type: 'income' },
  { id: 'tx-2', title: 'Whole Foods Market', meta: 'Yesterday • Shopping', amount: 640000, type: 'expense' },
  { id: 'tx-3', title: 'Craft Artisanal Cafe', meta: 'Oct 24 • Food & Beverages', amount: 45000, type: 'expense' },
] as const;

const NAV_ITEMS = [
  { icon: 'account_balance_wallet', label: 'Home', active: true },
  { icon: 'monitoring', label: 'Analytics', active: false },
  { icon: 'receipt_long', label: 'Transactions', active: false },
  { icon: 'manage_accounts', label: 'Settings', active: false },
] as const;

export default function HomeScreen() {
  const [cap, setCap] = useState(DEFAULT_CAP);
  const [modalVisible, setModalVisible] = useState(false);
  const [capInput, setCapInput] = useState('');
  const [capError, setCapError] = useState('');

  // Load the saved cap once on mount. Ignore anything that is not a positive number.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active || stored === null) return;
        const parsed = parseBudgetCap(stored);
        if (parsed !== null) setCap(parsed);
      })
      .catch((error) => console.log('Could not load budget cap:', error));
    return () => {
      active = false;
    };
  }, []);

  const summary = getBudgetSummary(EXPENSES, cap);
  const levelStyle = LEVEL_STYLES[summary.level];

  let pillLabel = 'On Track (≤75% used)';
  if (summary.level === 'warning') {
    pillLabel = `Approaching Limit (${summary.percent}%)`;
  } else if (summary.level === 'over') {
    pillLabel =
      summary.overBy > 0
        ? `Over Budget by ${formatRupiah(summary.overBy)}`
        : 'Budget Limit Reached (100%)';
  }

  function openModal() {
    setCapInput(String(cap));
    setCapError('');
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  async function handleSaveCap() {
    const parsed = parseBudgetCap(capInput);
    if (parsed === null) {
      setCapError('Enter a positive whole number, for example 10000000.');
      return;
    }
    setCap(parsed);
    setModalVisible(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(parsed));
    } catch (error) {
      console.log('Could not save budget cap:', error);
    }
  }

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
              Home
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

      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-4 pb-8 pt-2">
        {/* Overview card */}
        <View className="gap-4 rounded-[32px] bg-primary-container p-6 shadow-xl">
          <Text className="font-jakarta-semibold text-[20px] leading-7 tracking-tight text-on-primary">
            Monthly Overview
          </Text>

          <View className="gap-2 pt-1">
            <View className="flex-row items-center justify-between rounded-2xl bg-white/10 p-4">
              <View>
                <Text className="font-jakarta-bold text-[10px] uppercase tracking-wide text-primary-fixed-dim">Income</Text>
                <Text className="mt-0.5 font-jakarta-bold text-[24px] leading-8 tracking-tight text-on-primary">
                  {formatRupiah(INCOME)}
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
                  {`-${formatRupiah(EXPENSES)}`}
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
                <View className="flex-row flex-wrap items-baseline gap-1.5">
                  <Text className="font-jakarta-bold text-[20px] leading-7 text-secondary">
                    {formatSignedRupiah(SAVINGS)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Budget card */}
        <View className="gap-4 rounded-[32px] bg-surface-container-lowest p-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-jakarta-semibold text-[18px] leading-6 text-on-surface">Monthly Budget Cap</Text>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <Text className="font-sans text-[12px] text-on-surface-variant">Total Cap:</Text>
                <Text className="font-jakarta-bold text-[14px] text-primary">{formatRupiah(cap)}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit monthly budget cap"
              onPress={openModal}
              className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5 active:bg-secondary-container"
            >
              <Icon name="edit" size={16} color="#003527" />
              <Text className="font-jakarta-semibold text-[10px] text-primary">Edit Cap</Text>
            </Pressable>
          </View>

          <View className="items-center py-1">
            <View className="h-44 w-44 items-center justify-center">
              <Svg width={176} height={176} viewBox="0 0 120 120">
                <Circle cx={60} cy={60} r={RING_RADIUS} fill="none" stroke="#e5eeff" strokeWidth={11} />
                <Circle
                  cx={60}
                  cy={60}
                  r={RING_RADIUS}
                  fill="none"
                  stroke={levelStyle.ring}
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - summary.ringFill)}
                  rotation={-90}
                  origin="60, 60"
                />
              </Svg>
              <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center px-6">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-jakarta-bold text-[30px] leading-[38px] text-primary"
                >
                  {`${summary.percent}%`}
                </Text>
                <Text className="mt-0.5 font-jakarta-semibold text-[10px] text-on-surface-variant">Budget Used</Text>
                <Text className="mt-0.5 font-jakarta-semibold text-[12px] text-secondary">{formatRupiah(EXPENSES)}</Text>
              </View>
            </View>

            <View
              accessibilityRole="text"
              className={`mt-2 flex-row items-center gap-1.5 rounded-full px-3 py-1 ${levelStyle.pill}`}
            >
              <View className={`h-2 w-2 rounded-full ${levelStyle.dot}`} />
              <Text className={`font-jakarta-semibold text-[12px] ${levelStyle.text}`}>{pillLabel}</Text>
            </View>
          </View>

          <View className="flex-row gap-2 rounded-2xl bg-surface-container-low p-2">
            <View className="flex-1 items-center">
              <Text className="font-jakarta-bold text-[10px] text-on-surface-variant">Budget Cap</Text>
              <Text numberOfLines={1} className="mt-0.5 font-jakarta-bold text-[12px] text-on-surface">
                {formatRupiah(cap)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="font-jakarta-bold text-[10px] text-on-surface-variant">Spent Total</Text>
              <Text numberOfLines={1} className="mt-0.5 font-jakarta-bold text-[12px] text-primary">
                {formatRupiah(EXPENSES)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="font-jakarta-bold text-[10px] text-on-surface-variant">Remaining</Text>
              <Text
                numberOfLines={1}
                className={`mt-0.5 font-jakarta-bold text-[12px] ${summary.remaining < 0 ? 'text-error' : 'text-secondary'}`}
              >
                {formatSignedRupiah(summary.remaining)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick actions (non-functional for now) */}
        <View className="gap-2">
          <Text className="px-1 font-jakarta-semibold text-[18px] leading-6 text-on-surface">Quick Actions</Text>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.title}
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-2xl bg-surface-container-lowest p-4 shadow-sm active:opacity-80"
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-4">
                <View className={`h-12 w-12 items-center justify-center rounded-full ${action.iconBg}`}>
                  <Icon name={action.icon} size={24} color={action.iconColor} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="font-jakarta-semibold text-[18px] leading-6 text-on-surface">
                    {action.title}
                  </Text>
                  <Text numberOfLines={1} className="font-sans text-[12px] text-on-surface-variant">
                    {action.subtitle}
                  </Text>
                </View>
              </View>
              <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-surface-container-low">
                <Icon name="chevron_right" size={18} color="#404944" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent activity */}
        <View className="gap-4 rounded-[32px] bg-surface-container-lowest p-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-jakarta-semibold text-[18px] leading-6 text-on-surface">Recent Activity</Text>
              <View className="h-5 w-5 items-center justify-center rounded-full bg-secondary-container">
                <Icon name="sentiment_satisfied" size={12} color="#006c4a" />
              </View>
            </View>
            <Pressable accessibilityRole="button">
              <Text className="font-jakarta-semibold text-[12px] text-secondary">See All</Text>
            </Pressable>
          </View>

          <View className="gap-2">
            {ACTIVITIES.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <View key={item.id} className="flex-row items-center justify-between py-1">
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
                        {item.title}
                      </Text>
                      <Text className="font-sans text-[12px] text-on-surface-variant">{item.meta}</Text>
                    </View>
                  </View>
                  <View className="ml-2 items-end">
                    <Text
                      className={`font-jakarta-bold text-[14px] leading-5 ${isIncome ? 'text-secondary' : 'text-on-surface'}`}
                    >
                      {isIncome ? formatSignedRupiah(item.amount) : `-${formatRupiah(item.amount)}`}
                    </Text>
                    <Text
                      className={`font-jakarta-semibold text-[10px] ${isIncome ? 'text-secondary' : 'text-on-surface-variant'}`}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom navigation (non-functional for now) */}
      <View className="h-16 flex-row items-center justify-around bg-surface px-2">
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.active }}
            className="min-h-[44px] min-w-[56px] items-center justify-center gap-0.5"
          >
            <Icon name={item.icon} size={24} color={item.active ? '#003527' : '#404944'} />
            <Text
              className={`text-[10px] ${item.active ? 'font-jakarta-bold text-primary' : 'font-jakarta-bold text-on-surface-variant'}`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Edit cap modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Close dialog"
            onPress={closeModal}
            className="absolute bottom-0 left-0 right-0 top-0 bg-inverse-surface/40"
          />
          <View className="gap-4 rounded-t-[32px] bg-surface-container-lowest p-6 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="font-jakarta-semibold text-[18px] leading-6 text-on-surface">Adjust Budget Cap</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={closeModal}
                className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
              >
                <Icon name="close" size={18} color="#404944" />
              </Pressable>
            </View>

            <Text className="font-sans text-[12px] leading-4 text-on-surface-variant">
              Set your monthly allowable budget. Friendly will calculate live status indicators accordingly.
            </Text>

            <View className="gap-1">
              <Text className="font-jakarta-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                Target Budget Cap (Rp)
              </Text>
              <View
                className={`flex-row items-center rounded-2xl bg-surface-container-low px-4 py-2.5 ${capError ? 'border border-error' : 'border border-transparent'}`}
              >
                <Text className="mr-1 font-jakarta-bold text-[20px] text-primary">Rp</Text>
                <TextInput
                  className="flex-1 p-0 font-jakarta-bold text-[20px] text-primary"
                  value={capInput}
                  onChangeText={(value) => {
                    setCapInput(value);
                    setCapError('');
                  }}
                  keyboardType="number-pad"
                  placeholder="10000000"
                  placeholderTextColor="#707974"
                  accessibilityLabel="Target budget cap in rupiah"
                  autoFocus
                />
              </View>
              {capError !== '' && (
                <Text accessibilityRole="alert" className="font-sans text-[12px] text-error">
                  {capError}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-2 pt-2">
              <Pressable
                accessibilityRole="button"
                onPress={closeModal}
                className="flex-1 items-center rounded-full bg-surface-container py-2.5"
              >
                <Text className="font-jakarta-semibold text-[12px] text-on-surface">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleSaveCap}
                className="flex-1 items-center rounded-full bg-primary py-2.5 active:bg-primary-container"
              >
                <Text className="font-jakarta-semibold text-[12px] text-on-primary">Apply Cap</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
