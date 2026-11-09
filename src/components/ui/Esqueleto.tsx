import { DimensionValue, StyleSheet, View } from 'react-native';

import { colores } from '@/theme';

interface EsqueletoProps {
  ancho?: DimensionValue;
  alto?: number;
  radio?: number;
}

/** Bloque gris que ocupa el lugar de un contenido mientras carga. */
export default function Esqueleto({ ancho = '100%', alto = 16, radio = 8 }: EsqueletoProps) {
  return (
    <View
      accessible
      accessibilityLabel="Cargando"
      style={[estilos.bloque, { width: ancho, height: alto, borderRadius: radio }]}
    />
  );
}

const estilos = StyleSheet.create({
  bloque: { backgroundColor: colores.linea, marginBottom: 8 },
});
