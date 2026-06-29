import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/providers/app-store';

export default function LoginScreen() {
  const { login } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit =
    email.includes('@') &&
    password.length > 0 &&
    (mode === 'login' || displayName.trim().length > 0);

  const submit = () => {
    if (!canSubmit) return;
    login({ email, displayName: mode === 'register' ? displayName : undefined });
    router.back();
  };

  return (
    <View className="flex-1 bg-neutral-950 px-6 pt-8">
      <Text className="text-2xl font-bold text-white">
        {mode === 'login' ? 'Welcome back' : 'Create profile'}
      </Text>
      <Text className="mt-1 text-sm text-neutral-400">
        Local demo account — saved on this device only.
      </Text>

      <View className="mt-6 gap-3">
        {mode === 'register' ? (
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor="#737373"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-base text-white"
          />
        ) : null}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#737373"
          autoCapitalize="none"
          keyboardType="email-address"
          className="rounded-xl bg-neutral-900 px-4 py-3 text-base text-white"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#737373"
          secureTextEntry
          className="rounded-xl bg-neutral-900 px-4 py-3 text-base text-white"
        />
      </View>

      <Pressable
        disabled={!canSubmit}
        onPress={submit}
        className={canSubmit ? 'mt-6 rounded-xl bg-white py-3' : 'mt-6 rounded-xl bg-neutral-800 py-3'}>
        <Text
          className={
            canSubmit
              ? 'text-center font-semibold text-neutral-950'
              : 'text-center font-semibold text-neutral-500'
          }>
          {mode === 'login' ? 'Sign in' : 'Create profile'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} className="mt-4">
        <Text className="text-center text-sm text-neutral-400">
          {mode === 'login' ? 'No profile yet? Create one' : 'Have a profile? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}
