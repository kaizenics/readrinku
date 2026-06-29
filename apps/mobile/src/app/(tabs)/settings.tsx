import type { ReaderMode, ReaderWidth } from '@rinku/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '@/providers/app-store';

const MODES: { key: ReaderMode; label: string }[] = [
  { key: 'vertical', label: 'Vertical' },
  { key: 'paged', label: 'Single page' },
];

const WIDTHS: { key: ReaderWidth; label: string }[] = [
  { key: 'compact', label: 'Compact' },
  { key: 'comfortable', label: 'Comfortable' },
  { key: 'immersive', label: 'Immersive' },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            className={
              active ? 'rounded-lg bg-white px-3 py-2' : 'rounded-lg bg-neutral-800 px-3 py-2'
            }>
            <Text
              className={
                active
                  ? 'text-sm font-medium text-neutral-950'
                  : 'text-sm text-neutral-300'
              }>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { session, preferences, updatePreferences, logout, clearAll } = useAppStore();

  return (
    <View className="flex-1 bg-neutral-950">
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text className="mb-4 text-2xl font-bold text-white">Settings</Text>

          <Text className="mb-2 text-xs font-semibold uppercase text-neutral-500">Account</Text>
          <View className="mb-6 rounded-xl bg-neutral-900 p-4">
            {session ? (
              <>
                <Text className="text-base text-white">{session.displayName}</Text>
                <Text className="mt-0.5 text-sm text-neutral-400">{session.email}</Text>
                <Pressable
                  onPress={logout}
                  className="mt-3 self-start rounded-lg bg-neutral-800 px-4 py-2">
                  <Text className="text-sm text-white">Sign out</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-sm text-neutral-400">You’re browsing as a guest.</Text>
                <Pressable
                  onPress={() => router.push('/login')}
                  className="mt-3 self-start rounded-lg bg-white px-4 py-2">
                  <Text className="text-sm font-medium text-neutral-950">Sign in</Text>
                </Pressable>
              </>
            )}
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-neutral-500">Reader</Text>
          <View className="mb-6 rounded-xl bg-neutral-900 p-4">
            <Text className="mb-2 text-sm text-neutral-300">Reading mode</Text>
            <Segmented
              value={preferences.mode}
              options={MODES}
              onChange={(mode) => updatePreferences({ mode })}
            />
            <Text className="mb-2 mt-4 text-sm text-neutral-300">Page width</Text>
            <Segmented
              value={preferences.width}
              options={WIDTHS}
              onChange={(width) => updatePreferences({ width })}
            />
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-neutral-500">Data</Text>
          <View className="rounded-xl bg-neutral-900 p-4">
            <Pressable
              onPress={clearAll}
              className="self-start rounded-lg bg-red-500/20 px-4 py-2">
              <Text className="text-sm font-medium text-red-400">
                Clear library, history &amp; settings
              </Text>
            </Pressable>
          </View>

          <Text className="mt-8 text-center text-xs text-neutral-600">ReadRinku · mobile</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
