import { Ionicons } from '@expo/vector-icons';
import type { LibraryStatus } from '@rinku/core';
import { router } from 'expo-router';
import { Spinner } from 'heroui-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MangaCard } from '@/components/manga-card';
import { useAppStore } from '@/providers/app-store';

const FILTERS: { key: LibraryStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'planned', label: 'Plan to read' },
  { key: 'completed', label: 'Completed' },
  { key: 'bookmarked', label: 'Bookmarked' },
];

export default function LibraryScreen() {
  const { hydrated, library } = useAppStore();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<LibraryStatus | 'all'>('all');

  const cardWidth = Math.floor((width - 16 * 2 - 12 * 2) / 3);
  const items = filter === 'all' ? library : library.filter((i) => i.status === filter);

  return (
    <View className="flex-1 bg-neutral-950">
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
          <Text className="text-2xl font-bold text-white">Library</Text>
          <Pressable
            onPress={() => router.push('/history')}
            className="flex-row items-center gap-1 rounded-full bg-neutral-800 px-3 py-1.5">
            <Ionicons name="time-outline" size={16} color="#d4d4d4" />
            <Text className="text-sm text-neutral-300">History</Text>
          </Pressable>
        </View>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <Pressable
                onPress={() => setFilter(item.key)}
                className={
                  active
                    ? 'rounded-full bg-white px-3 py-1.5'
                    : 'rounded-full bg-neutral-800 px-3 py-1.5'
                }>
                <Text
                  className={
                    active
                      ? 'text-sm font-medium text-neutral-950'
                      : 'text-sm text-neutral-300'
                  }>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        {!hydrated ? (
          <View className="flex-1 items-center justify-center">
            <Spinner />
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="bookmark-outline" size={40} color="#525252" />
            <Text className="mt-3 text-center text-neutral-400">Nothing saved yet.</Text>
            <Text className="mt-1 text-center text-sm text-neutral-600">
              Open a title and tap Save to add it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.manga.id}
            numColumns={3}
            columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
            contentContainerStyle={{ gap: 16, paddingTop: 4, paddingBottom: 32 }}
            renderItem={({ item }) => <MangaCard manga={item.manga} width={cardWidth} />}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
