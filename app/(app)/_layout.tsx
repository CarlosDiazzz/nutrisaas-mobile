import { Stack } from 'expo-router';

import { useAbrirNotificacion, useRegistroPush } from '@/features/notificaciones';

export default function AppLayout() {
  // Solo se monta con sesión: aquí se registra el teléfono para las notificaciones y se atiende su toque.
  useRegistroPush();
  useAbrirNotificacion();
  return <Stack screenOptions={{ headerShown: false }} />;
}
