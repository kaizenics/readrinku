import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { MangaCard as MangaCardData } from '@/lib/api';

interface MangaCardProps {
  manga: MangaCardData;
  width?: number;
}

// A single cover-forward manga card. expo-image is styled via `style` (Uniwind's
// className interop only covers react-native core components, not expo-image).
export function MangaCard({ manga, width = 128 }: MangaCardProps) {
  const height = Math.round(width * 1.5);

  return (
    <Pressable className="mr-3" style={{ width }}>
      <View
        className="overflow-hidden rounded-xl bg-neutral-800"
        style={{ width, height }}
      >
        {manga.image ? (
          <Image
            source={{ uri: manga.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="h-full w-full items-center justify-center p-2">
            <Text numberOfLines={4} className="text-center text-xs text-neutral-400">
              {manga.title}
            </Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} className="mt-2 text-sm font-medium text-white">
        {manga.title}
      </Text>
      {manga.lastChapterLabel ? (
        <Text numberOfLines={1} className="mt-0.5 text-xs text-neutral-400">
          {manga.lastChapterLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}
