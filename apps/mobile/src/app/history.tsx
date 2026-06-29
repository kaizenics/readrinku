import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useAppStore } from '@/providers/app-store';

export default function HistoryScreen() {
  const { history } = useAppStore();

  if (!history.length) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-8">
        <Text className="text-neutral-400">No reading history yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-950">
      <FlatList
        data={history}
        keyExtractor={(item) => `${item.manga.id}:${item.chapterUrl}`}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/read',
                params: {
                  url: item.chapterUrl,
                  sourceId: item.sourceId ?? '',
                  title: item.chapterTitle,
                },
              })
            }
            className="flex-row gap-3">
            {item.manga.image ? (
              <Image
                source={{ uri: item.manga.image }}
                style={{ width: 48, height: 72, borderRadius: 6 }}
                contentFit="cover"
              />
            ) : (
              <View style={{ width: 48, height: 72 }} className="rounded-md bg-neutral-800" />
            )}
            <View className="flex-1 justify-center">
              <Text className="text-sm font-medium text-white" numberOfLines={1}>
                {item.manga.title}
              </Text>
              <Text className="mt-0.5 text-xs text-neutral-400" numberOfLines={1}>
                {item.chapterTitle}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
