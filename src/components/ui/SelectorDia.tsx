import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, medidas, radios } from '@/theme';

export interface DiaSeleccionable {
  /** Identificador estable, por ejemplo la fecha ISO o el número de día del plan. */
  clave: string;
  letra: string;
  numero: number;
}

interface SelectorDiaProps {
  dias: readonly DiaSeleccionable[];
  seleccionado: string;
  onSeleccionar: (clave: string) => void;
}

/** Los 7 días de la semana con su número; el seleccionado va relleno de `primario`. */
export default function SelectorDia({ dias, seleccionado, onSeleccionar }: SelectorDiaProps) {
  return (
    <View style={estilos.fila}>
      {dias.map((dia) => {
        const activo = dia.clave === seleccionado;
        return (
          <Pressable
            key={dia.clave}
            accessibilityRole="button"
            accessibilityLabel={`Día ${dia.numero}`}
            accessibilityState={{ selected: activo }}
            onPress={() => onSeleccionar(dia.clave)}
            style={[estilos.dia, activo && estilos.activo]}
          >
            <Text style={[estilos.letra, activo && estilos.textoActivo]}>{dia.letra}</Text>
            <Text style={[estilos.numero, activo && estilos.numeroActivo]}>{dia.numero}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dia: {
    flex: 1,
    minHeight: medidas.objetivoTactilMinimo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radios.selector,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  activo: { backgroundColor: colores.primario, borderColor: colores.primario },
  letra: { fontFamily: fuentes.semibold, fontSize: 13, color: colores.texto },
  textoActivo: { color: colores.blanco },
  numero: { fontFamily: fuentes.media, fontSize: 11, color: colores.textoSuave },
  numeroActivo: { color: colores.sobrePrimarioSuave },
});
