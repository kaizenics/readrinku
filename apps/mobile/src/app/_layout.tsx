import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppStoreProvider } from '@/providers/app-store';

const queryClient = new QueryClient();

const darkHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#ffffff',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppStoreProvider>
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
                <Stack.Screen name="history" options={{ ...darkHeader, headerTitle: 'History' }} />
                <Stack.Screen name="login" options={{ ...darkHeader, headerTitle: 'Account' }} />
              </Stack>
            </ThemeProvider>
          </HeroUINativeProvider>
        </AppStoreProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
