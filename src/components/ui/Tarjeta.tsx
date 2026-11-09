import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colores, espaciado, radios } from '@/theme';

interface TarjetaProps {
  children: ReactNode;
  /** Fondo `primario` con texto blanco (próxima cita). */
  destacada?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Tarjeta({ children, destacada = false, style }: TarjetaProps) {
  return <View style={[estilos.base, destacada && estilos.destacada, style]}>{children}</View>;
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radios.tarjeta,
    paddingVertical: 14,
    paddingHorizontal: espaciado.lg,
    marginBottom: espaciado.md,
  },
  destacada: { backgroundColor: colores.primario, borderColor: colores.primario },
});
