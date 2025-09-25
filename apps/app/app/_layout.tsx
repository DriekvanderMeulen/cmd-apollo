import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, AppState } from 'react-native';

import { AppThemeProvider, useAppTheme } from '@/components/app-theme-provider'
import { R2CacheProvider } from '@/components/r2-cache-provider'
import './global.css';
import { getMe } from '@/lib/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function LayoutInner() {
  const { navigationTheme } = useAppTheme()
  const router = useRouter();
  const segments = useSegments();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setIsAuthed(Boolean(me?.userId));
      } catch {
        if (!cancelled) setIsAuthed(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh auth when screens gain focus (e.g., after returning from web auth)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const me = await getMe();
          if (!cancelled) setIsAuthed(Boolean(me?.userId));
        } catch {
          if (!cancelled) setIsAuthed(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Also refresh auth when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        (async () => {
          try {
            const me = await getMe();
            setIsAuthed(Boolean(me?.userId));
          } catch {
            setIsAuthed(false);
          }
        })();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const onLoginRoute = segments[0] === 'login';
    if (!isAuthed && !onLoginRoute) {
      router.replace('/login');
    } else if (isAuthed && onLoginRoute) {
      router.replace('/(tabs)');
    }
  }, [authChecked, isAuthed, segments]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {!authChecked ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator />
        </View>
      ) : null}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <R2CacheProvider>
        <LayoutInner />
      </R2CacheProvider>
    </AppThemeProvider>
  )
}
