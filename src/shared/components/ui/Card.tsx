import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme';

interface CardProps {
  titulo?: string;
  children: ReactNode;
}

export default function Card({ titulo, children }: CardProps) {
  return (
    <View style={estilos.tarjeta}>
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    gap: espaciado.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.tamanoSubtitulo,
    fontWeight: tipografia.pesoSemibold,
  },
});
