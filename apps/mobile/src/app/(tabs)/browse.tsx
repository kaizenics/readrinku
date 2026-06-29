import { mangaGenres } from '@rinku/core';
import { Spinner } from 'heroui-native';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MangaCard } from '@/components/manga-card';
import { useBrowse } from '@/lib/api';

const COLS = 3;
const GAP = 12;
const PAD = 16;

export default function BrowseScreen() {
  const { width } = useWindowDimensions();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useBrowse({
    q: query || undefined,
    genre,
  });

  const cardWidth = Math.floor((width - PAD * 2 - GAP * (COLS - 1)) / COLS);

  return (
    <View className="flex-1 bg-neutral-950">
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="px-4 pb-2 pt-2">
          <Text className="mb-3 text-2xl font-bold text-white">Browse</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => {
              setQuery(text.trim());
              setGenre(undefined);
            }}
            placeholder="Search titles…"
            placeholderTextColor="#737373"
            returnKeyType="search"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-base text-white"
          />
        </View>

        <View>
          <FlatList
            horizontal
            data={mangaGenres.filter((g) => !g.adult)}
            keyExtractor={(g) => g.slug}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const active = genre === item.slug;
              return (
                <Pressable
                  onPress={() => {
                    setGenre(active ? undefined : item.slug);
                    setQuery('');
                    setText('');
                  }}
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
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Spinner />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-neutral-300">Couldn’t load results.</Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-3 rounded-lg bg-white px-4 py-2">
              <Text className="font-medium text-neutral-950">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={data?.items ?? []}
            keyExtractor={(m) => m.id}
            numColumns={COLS}
            columnWrapperStyle={{ gap: GAP, paddingHorizontal: PAD }}
            contentContainerStyle={{ gap: 16, paddingTop: 4, paddingBottom: 32 }}
            renderItem={({ item }) => <MangaCard manga={item} width={cardWidth} />}
            ListEmptyComponent={
              <Text className="px-4 pt-10 text-center text-neutral-500">
                No titles found.
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
