import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function EyeIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}>
      <Path
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_URL = 'https://jsonplaceholder.typicode.com/posts';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  function validateEmail(value: string) {
    const clean = value.trim();
    if (clean === '') return 'Email is required';
    if (!EMAIL_REGEX.test(clean)) return 'Email is invalid';
    return '';
  }

  function validatePassword(value: string) {
    if (value === '') return 'Password is required';
    return '';
  }

  async function handleLogin() {
    if (isLoading) return;
    setIsSuccess(false);

    const validationError = validateEmail(email) || validatePassword(password);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      console.log(data);

      if (data.id) {
        setIsSuccess(true);
      } else {
        setErrorMessage('Login failed');
      }
    } catch (error) {
      console.log('API error:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-between gap-4 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          {/* Hero card */}
          <LinearGradient
            colors={['#06533e', '#044733', '#023123']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 16, overflow: 'hidden' }}
          >
            <View className="mb-4 flex-row items-center">
              <Text className="font-jakarta-bold text-xs text-white/95">Friendly</Text>
            </View>

            <View className="mb-5">
              <Text className="mb-1.5 font-jakarta-bold text-[19px] leading-6 text-white">
                {'Your money, in\nclear view.'}
              </Text>
              <Text className="max-w-[280px] font-sans text-[11.5px] leading-4 text-emerald-100/80">
                Cash flow, budgets, and debts in one place. Log in to continue tracking this month.
              </Text>
            </View>

            <View className="flex-row gap-2 border-t border-emerald-500/25 pt-3">
              <View className="flex-1">
                <Text className="mb-0.5 font-jakarta-semibold text-[9.5px] uppercase tracking-wider text-emerald-200/75">
                  Income
                </Text>
                <Text className="font-jakarta-bold text-[12.5px] text-white">Rp 12,4 jt</Text>
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 font-jakarta-semibold text-[9.5px] uppercase tracking-wider text-emerald-200/75">
                  Expenses
                </Text>
                <Text className="font-jakarta-bold text-[12.5px] text-white">Rp 8,1 jt</Text>
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 font-jakarta-semibold text-[9.5px] uppercase tracking-wider text-emerald-200/75">
                  Savings
                </Text>
                <Text className="font-jakarta-bold text-[12.5px] text-emerald-300">+Rp 4,3 jt</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Login form card */}
          <View className="rounded-2xl border border-slate-200 bg-white p-5">
            <View className="mb-4">
              <Text className="font-jakarta-bold text-base text-slate-900">Log in to your account</Text>
              <Text className="mt-0.5 font-sans text-xs text-slate-500">
                Use your registered email and password.
              </Text>
            </View>

            <View>
              <Text className="mb-1 font-jakarta-semibold text-[11.5px] text-slate-700">Email</Text>
              <TextInput
                className="h-10 rounded-lg border border-slate-300 px-3.5 font-sans text-xs text-slate-900"
                placeholder="name@email.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setErrorMessage('');
                  setIsSuccess(false);
                }}
                onBlur={() => {
                  if (email.trim() !== '') setErrorMessage(validateEmail(email));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="mt-3.5">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="font-jakarta-semibold text-[11.5px] text-slate-700">Password</Text>
                <Link href="/forgot-password" asChild>
                  <Text className="font-jakarta-semibold text-[11.5px] text-slate-600">
                    Forgot password?
                  </Text>
                </Link>
              </View>
              <View className="justify-center">
                <TextInput
                  className="h-10 rounded-lg border border-slate-300 pl-3.5 pr-10 font-sans text-xs text-slate-900"
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrorMessage('');
                    setIsSuccess(false);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle password visibility"
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute bottom-0 right-0 top-0 items-center justify-center px-3"
                >
                  <EyeIcon color={showPassword ? '#047857' : '#94a3b8'} />
                </Pressable>
              </View>
            </View>

            {errorMessage !== '' && (
              <Text accessibilityRole="alert" className="mt-3 font-sans text-[11.5px] text-red-600">
                {errorMessage}
              </Text>
            )}

            {isSuccess && (
              <Text className="mt-3 font-sans text-[11.5px] text-emerald-700">Login successful</Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
              disabled={isLoading}
              onPress={handleLogin}
              className={`mt-4 h-10 items-center justify-center rounded-lg bg-[#05533e] active:bg-[#033728] ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="font-jakarta-semibold text-xs text-white">Log in</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center gap-3 pb-2 pt-4">
          <View className="flex-row items-center">
            <Text className="font-sans text-xs text-slate-500">Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Text className="font-jakarta-semibold text-xs text-slate-800">Sign up</Text>
            </Link>
          </View>
          <View className="flex-row items-center gap-1.5">
            <LockIcon />
            <Text className="font-sans text-[10.5px] text-slate-400">
              Your financial data is encrypted and never shared
            </Text>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
