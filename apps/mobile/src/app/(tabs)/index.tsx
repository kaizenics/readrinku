import { Spinner } from 'heroui-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MangaShelf } from '@/components/manga-shelf';
import { useHome } from '@/lib/api';

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useHome();

  return (
    <View className="flex-1 bg-neutral-950">
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="px-4 pb-3 pt-2">
          <Text className="text-2xl font-bold text-white">ReadRinku</Text>
          <Text className="text-sm text-neutral-400">
            Browse live titles from multiple sources
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Spinner />
            <Text className="mt-3 text-sm text-neutral-400">Loading manga…</Text>
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-base text-white">
              Couldn’t reach the manga API.
            </Text>
            <Text className="mt-1 text-center text-sm text-neutral-400">
              Make sure the web app is running and EXPO_PUBLIC_API_URL points to it.
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-4 rounded-lg bg-white px-5 py-2.5"
            >
              <Text className="font-medium text-neutral-950">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <MangaShelf title="Featured" manga={data?.featured ?? []} cardWidth={150} />
            <MangaShelf
              title="Latest comic updates"
              description="Fresh titles and chapter updates."
              manga={data?.latest ?? []}
            />
            <MangaShelf
              title="Source spotlight"
              description="More live picks for current releases."
              manga={data?.spotlight ?? []}
            />
            <MangaShelf title="More comics to explore" manga={data?.archive ?? []} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
