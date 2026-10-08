import { Stack } from 'expo-router';

import Spinner from '@/shared/components/ui/Spinner';

import { useSession } from '../hooks/useSession';

/** Muestra las pestañas solo con sesión; sin sesión, solo el login. */
export default function NavegadorRaiz() {
  const { cargando, estaAutenticado } = useSession();

  if (cargando) {
    return <Spinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={estaAutenticado}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!estaAutenticado}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
    </Stack>
  );
}
