import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavegadorRaiz, SesionProvider } from '@/features/auth';
import { configurarManejador } from '@/features/notificaciones';

SplashScreen.preventAutoHideAsync();
configurarManejador();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fuentesListas, errorDeFuentes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const listas = fuentesListas || errorDeFuentes !== null;

  useEffect(() => {
    if (listas) SplashScreen.hideAsync();
  }, [listas]);

  if (!listas) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SesionProvider>
          <NavegadorRaiz />
        </SesionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
