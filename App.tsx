import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, Button, TouchableOpacity } from 'react-native';
import './global.css';

type PasswordToggleProps = {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
};

function PasswordToggle({
  showPassword,
  setShowPassword,
}: PasswordToggleProps) {
  return (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Text>
        {showPassword ? 'Hide Password' : 'Show Password'}
      </Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleLogin() {
    setLoading(true);
    setSuccess('');

    const cleanEmail = email.trim();

    if (cleanEmail === '') {
      setError('Email is required');
      setLoading(false);
    } else if (
      !cleanEmail.includes('@') ||
      !cleanEmail.includes('.')
    ) {
      setError('Email is invalid');
      setLoading(false);
    } else if (password === '') {
      setError('Password is required');
      setLoading(false);
    } else {
      setError('');

      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              password: password,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const data = await response.json();

        console.log(data);

        if (data.id) {
          setSuccess('Login successful');
        } else {
          setError('Login failed');
        }

        setLoading(false);
      } catch (error) {
        console.log('API error:', error);
        setError('Something went wrong');
        setLoading(false);
      }
    }
  }

  async function testAPI() {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos/1'
      );

      const data = await response.json();

      console.log(data.title);
    } catch (error) {
      console.log('API error');
    }
  }

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-[32px] font-bold">
        Login
      </Text>

      <TextInput
        className="mt-[15px] h-[50px] w-[300px] rounded-[8px] border border-black px-[10px]"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <View className="mt-[15px] h-[50px] w-[300px] flex-row items-center justify-between rounded-[8px] border border-black px-[10px]">
        <TextInput
          className="h-full flex-1"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <PasswordToggle
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </View>

      {error !== '' && (
        <Text className="mt-[10px] text-[14px]">
          {error}
        </Text>
      )}

      {success !== '' && (
        <Text className="mt-[10px] text-[14px]">
          {success}
        </Text>
      )}

      <View className="mt-[20px]">
        <Button
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
