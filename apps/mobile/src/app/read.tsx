import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Spinner } from 'heroui-native';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useChapterPages } from '@/lib/api';
import { imageSource } from '@/lib/images';

export default function ReaderScreen() {
  const { url, sourceId } = useLocalSearchParams<{
    url: string;
    sourceId?: string;
    title?: string;
  }>();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, refetch } = useChapterPages(url ?? '', sourceId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Spinner />
        <Text className="mt-3 text-sm text-neutral-500">Loading chapter…</Text>
      </View>
    );
  }

  if (isError || !data?.pages?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="text-center text-neutral-300">
          This chapter couldn’t be loaded.
        </Text>
        <Pressable onPress={() => refetch()} className="mt-3 rounded-lg bg-white px-4 py-2">
          <Text className="font-medium text-neutral-950">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={data.pages}
        keyExtractor={(page) => String(page.pageNumber)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const ratio = item.width > 0 ? item.height / item.width : 1.4;
          return (
            <Image
              source={imageSource(item.src)}
              style={{ width, height: Math.round(width * ratio) }}
              contentFit="contain"
            />
          );
        }}
      />
    </View>
  );
}
