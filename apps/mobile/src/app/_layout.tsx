import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider>
          <ThemeProvider value={DarkTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0a0a0a' },
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="manga/[id]"
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerTransparent: true,
                  headerTintColor: '#ffffff',
                }}
              />
              <Stack.Screen
                name="read"
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerTransparent: true,
                  headerTintColor: '#ffffff',
                }}
              />
            </Stack>
          </ThemeProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
