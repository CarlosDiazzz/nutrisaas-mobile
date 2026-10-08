import { Tabs } from 'expo-router';

import { colores } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colores.primario, headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="plan" options={{ title: 'Mi plan' }} />
      <Tabs.Screen name="progreso" options={{ title: 'Progreso' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
