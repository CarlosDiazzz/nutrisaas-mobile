import { StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuentes, tamanos } from '@/theme';

/** Etiqueta de sección: 12 pt / 700, mayúsculas y espaciado de 0.05 em. */
export default function EtiquetaSeccion({ texto }: { texto: string }) {
  return (
    <Text accessibilityRole="header" style={estilos.texto}>
      {texto.toUpperCase()}
    </Text>
  );
}

const estilos = StyleSheet.create({
  texto: {
    fontFamily: fuentes.negrita,
    fontSize: tamanos.etiquetaSeccion,
    letterSpacing: tamanos.etiquetaSeccion * 0.05,
    color: colores.textoSuave,
    marginTop: espaciado.sm,
    marginBottom: 6,
  },
});
