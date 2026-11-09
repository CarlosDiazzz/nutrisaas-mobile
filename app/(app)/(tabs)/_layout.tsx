import { ClipboardList, Home, TrendingUp, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { colores, fuentes, medidas, tamanos } from '@/theme';

const PESTANAS = [
  { nombre: 'index', titulo: 'Inicio', icono: Home },
  { nombre: 'plan', titulo: 'Mi plan', icono: ClipboardList },
  { nombre: 'progreso', titulo: 'Progreso', icono: TrendingUp },
  { nombre: 'perfil', titulo: 'Perfil', icono: User },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontFamily: fuentes.semibold, fontSize: tamanos.etiquetaPestana },
        tabBarStyle: {
          height: medidas.alturaBarraPestanas,
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          paddingTop: 6,
          paddingBottom: 10,
        },
      }}
    >
      {PESTANAS.map(({ nombre, titulo, icono: Icono }) => (
        <Tabs.Screen
          key={nombre}
          name={nombre}
          options={{
            title: titulo,
            tabBarAccessibilityLabel: titulo,
            tabBarIcon: ({ color }) => <Icono size={medidas.iconoPestana} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
