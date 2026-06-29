import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Spinner } from 'heroui-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useMangaDetail, type MangaCard, type MangaDetailChapter } from '@/lib/api';
import { useAppStore } from '@/providers/app-store';

export default function MangaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMangaDetail(id);
  const { libraryStatus, toggleLibrary, recordHistory } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Spinner />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-8">
        <Text className="text-center text-neutral-300">Couldn’t load this title.</Text>
        <Pressable onPress={() => refetch()} className="mt-3 rounded-lg bg-white px-4 py-2">
          <Text className="font-medium text-neutral-950">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const { manga, provider, chapters } = data;

  const snapshot: MangaCard = {
    id: manga.id,
    title: manga.title,
    image: manga.coverImage,
    chapterCount: manga.chapterCount,
    lastChapterLabel: '',
    genres: manga.genres,
    contentRating: manga.contentRating,
    status: manga.status,
    synopsis: manga.synopsis,
  };
  const saved = Boolean(libraryStatus(manga.id));

  const openChapter = (chapter: MangaDetailChapter) => {
    recordHistory(snapshot, {
      title: chapter.title,
      url: chapter.sourceUrl,
      sourceId: provider,
    });
    router.push({
      pathname: '/read',
      params: { url: chapter.sourceUrl, sourceId: provider, title: chapter.title },
    });
  };

  const header = (
    <View>
      <View className="relative">
        {manga.coverImage ? (
          <Image
            source={{ uri: manga.coverImage }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-[300px] bg-neutral-800" />
        )}
        <View className="absolute inset-0 bg-black/50" />
      </View>

      <View className="-mt-20 px-4">
        <View className="flex-row gap-4">
          {manga.coverImage ? (
            <Image
              source={{ uri: manga.coverImage }}
              style={{ width: 110, height: 165, borderRadius: 12 }}
              contentFit="cover"
            />
          ) : null}
          <View className="flex-1 justify-end pb-1">
            <Text className="text-xl font-bold text-white" numberOfLines={3}>
              {manga.title}
            </Text>
            {manga.authors?.length ? (
              <Text className="mt-1 text-sm text-neutral-400" numberOfLines={1}>
                {manga.authors.join(', ')}
              </Text>
            ) : null}
            <Text className="mt-1 text-xs uppercase text-neutral-500">
              {manga.status} · {manga.chapterCount} ch
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => toggleLibrary(snapshot, 'reading')}
          className={
            saved
              ? 'mt-4 flex-row items-center justify-center rounded-xl bg-neutral-800 py-3'
              : 'mt-4 flex-row items-center justify-center rounded-xl bg-white py-3'
          }>
          <Text className={saved ? 'font-semibold text-white' : 'font-semibold text-neutral-950'}>
            {saved ? '✓ In Library' : '+ Add to Library'}
          </Text>
        </Pressable>

        {manga.genres.length ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {manga.genres.map((g) => (
              <View key={g} className="rounded-full bg-neutral-800 px-3 py-1">
                <Text className="text-xs text-neutral-300">{g}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {manga.synopsis ? (
          <Pressable onPress={() => setExpanded((v) => !v)} className="mt-4">
            <Text
              className="text-sm leading-6 text-neutral-300"
              numberOfLines={expanded ? undefined : 4}>
              {manga.synopsis}
            </Text>
            <Text className="mt-1 text-xs font-medium text-neutral-400">
              {expanded ? 'Show less' : 'Show more'}
            </Text>
          </Pressable>
        ) : null}

        <Text className="mb-2 mt-6 text-lg font-semibold text-white">
          Chapters ({chapters.length})
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-950">
      <FlatList
        data={chapters}
        keyExtractor={(ch) => ch.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            disabled={!item.readable}
            onPress={() => openChapter(item)}
            className="mx-4 border-b border-neutral-900 px-1 py-3">
            <Text
              className={item.readable ? 'text-sm text-white' : 'text-sm text-neutral-600'}
              numberOfLines={1}>
              {item.title}
            </Text>
            {item.releaseDate ? (
              <Text className="mt-0.5 text-xs text-neutral-500">
                {new Date(item.releaseDate).toLocaleDateString()}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
