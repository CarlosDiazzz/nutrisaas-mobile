import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, medidas, radios } from '@/theme';

interface Opcion<T extends string> {
  valor: T;
  etiqueta: string;
}

interface SegmentadoProps<T extends string> {
  opciones: readonly Opcion<T>[];
  valor: T;
  onCambiar: (valor: T) => void;
}

/** Control de 2 o 3 opciones (Menú / Equivalentes). */
export default function Segmentado<T extends string>({
  opciones,
  valor,
  onCambiar,
}: SegmentadoProps<T>) {
  return (
    <View accessibilityRole="tablist" style={estilos.contenedor}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            onPress={() => onCambiar(opcion.valor)}
            style={[estilos.opcion, activa && estilos.activa]}
          >
            <Text style={[estilos.texto, activa && estilos.textoActivo]}>{opcion.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: colores.segmentadoFondo,
    borderRadius: radios.selector,
    padding: 3,
    marginBottom: 12,
  },
  opcion: {
    flex: 1,
    minHeight: medidas.objetivoTactilMinimo - 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activa: { backgroundColor: colores.superficie },
  texto: { fontFamily: fuentes.semibold, fontSize: 13, color: colores.textoSuave },
  textoActivo: { color: colores.texto },
});
