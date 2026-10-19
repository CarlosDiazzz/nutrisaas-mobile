import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, tamanos } from '@/theme';

import Logo from './Logo';

/** Se muestra mientras la sesión intenta renovarse al abrir la app. */
export default function PantallaCarga() {
  return (
    <View accessibilityLabel="Cargando NutriSaaS" style={estilos.contenedor}>
      <Logo />
      <Text style={estilos.marca}>NutriSaaS</Text>
      <ActivityIndicator color={colores.primario} style={estilos.indicador} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    gap: espaciado.md,
  },
  marca: { fontFamily: fuentes.negrita, fontSize: tamanos.titulo, color: colores.texto },
  indicador: { marginTop: espaciado.sm },
});
