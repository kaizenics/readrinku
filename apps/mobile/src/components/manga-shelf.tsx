import { FlatList, Text, View } from 'react-native';

import type { MangaCard as MangaCardData } from '@/lib/api';
import { MangaCard } from './manga-card';

interface MangaShelfProps {
  title: string;
  description?: string;
  manga: MangaCardData[];
  cardWidth?: number;
}

// A horizontally-scrolling row of manga cards (mirrors the web LiveMangaShelf).
export function MangaShelf({ title, description, manga, cardWidth }: MangaShelfProps) {
  if (!manga.length) {
    return null;
  }

  return (
    <View className="mb-7">
      <Text className="px-4 text-lg font-semibold text-white">{title}</Text>
      {description ? (
        <Text className="mb-3 px-4 text-sm text-neutral-400">{description}</Text>
      ) : (
        <View className="mb-3" />
      )}
      <FlatList
        horizontal
        data={manga}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => <MangaCard manga={item} width={cardWidth} />}
      />
    </View>
  );
}
