import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colores, espaciado } from '@/theme';

export default function Spinner() {
  return (
    <View accessibilityLabel="Cargando" style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaciado.md },
});
