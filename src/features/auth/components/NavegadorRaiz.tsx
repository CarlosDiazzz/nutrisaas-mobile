import { Stack } from 'expo-router';

import { useSesion } from '../hooks/useSesion';

import PantallaCarga from './PantallaCarga';

/** Con sesión solo se ven las pantallas de la app; sin ella, solo las de acceso. */
export default function NavegadorRaiz() {
  const { cargando, estaAutenticado } = useSesion();

  if (cargando) {
    return <PantallaCarga />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={estaAutenticado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!estaAutenticado}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
