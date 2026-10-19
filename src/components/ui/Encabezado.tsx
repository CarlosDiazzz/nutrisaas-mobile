import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, tamanos } from '@/theme';

interface EncabezadoProps {
  titulo: string;
  subtitulo?: string;
  /** Elemento a la derecha, como la campana de avisos. */
  accion?: ReactNode;
}

export default function Encabezado({ titulo, subtitulo, accion }: EncabezadoProps) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.textos}>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
        {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {accion}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaciado.sm,
    marginBottom: 14,
  },
  textos: { flex: 1 },
  titulo: { fontFamily: fuentes.negrita, fontSize: tamanos.titulo, color: colores.texto },
  subtitulo: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.textoSuave,
    marginTop: 2,
  },
});
