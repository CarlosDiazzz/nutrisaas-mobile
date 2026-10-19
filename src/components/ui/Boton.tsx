import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, medidas, radios, tamanos } from '@/theme';

type Variante = 'primario' | 'secundario' | 'texto' | 'peligro';

interface BotonProps {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  /** Altura de 44 pt en lugar de 50 (botones dentro de tarjetas). */
  compacto?: boolean;
  /** Icono a la izquierda del texto; hereda el color del texto. */
  icono?: (color: string) => ReactNode;
}

const COLORES: Record<Variante, { fondo: string; borde: string; texto: string }> = {
  primario: { fondo: colores.primario, borde: colores.primario, texto: colores.blanco },
  secundario: { fondo: colores.superficie, borde: colores.borde, texto: colores.texto },
  texto: { fondo: 'transparent', borde: 'transparent', texto: colores.primario },
  peligro: { fondo: colores.peligroFondo, borde: colores.peligroBorde, texto: colores.peligro },
};

export default function Boton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  compacto = false,
  icono,
}: BotonProps) {
  const inactivo = deshabilitado || cargando;
  const paleta = COLORES[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: paleta.fondo, borderColor: paleta.borde },
        compacto && estilos.compacto,
        (pressed || inactivo) && estilos.atenuado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={paleta.texto} />
      ) : (
        <View style={estilos.contenido}>
          {icono?.(paleta.texto)}
          <Text style={[estilos.texto, { color: paleta.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: medidas.alturaBoton,
    borderRadius: radios.boton,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  compacto: { minHeight: medidas.alturaBotonCompacto },
  atenuado: { opacity: 0.6 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: fuentes.negrita, fontSize: tamanos.boton },
});
