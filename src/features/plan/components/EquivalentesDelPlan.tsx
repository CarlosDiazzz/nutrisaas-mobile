import { StyleSheet, Text, View } from 'react-native';

import { Tarjeta } from '@/components/ui';
import { formatearMiles } from '@/shared/utils/fechas';
import { colores, fuentes, tamanos } from '@/theme';

import { TiempoDeEquivalentes } from '../types';

interface EquivalentesDelPlanProps {
  tiempos: TiempoDeEquivalentes[];
  onPosicionDeTiempo?: (tiempo: string, y: number) => void;
}

/** Tabla por tiempo de comida con los equivalentes de cada subgrupo, para intercambiar alimentos. */
export default function EquivalentesDelPlan({
  tiempos,
  onPosicionDeTiempo,
}: EquivalentesDelPlanProps) {
  return (
    <>
      <Text style={estilos.nota}>
        Puedes cambiar un alimento por otro del mismo subgrupo, respetando los equivalentes.
      </Text>
      {tiempos.map((tiempo) => (
        <View
          key={tiempo.tiempoComida}
          onLayout={(evento) =>
            onPosicionDeTiempo?.(tiempo.tiempoComida, evento.nativeEvent.layout.y)
          }
        >
          <Tarjeta>
            <View style={estilos.cabecera}>
              <Text accessibilityRole="header" style={estilos.nombre}>
                {tiempo.nombre}
              </Text>
              <Text style={estilos.kcal}>{formatearMiles(tiempo.kcal)} kcal</Text>
            </View>
            {tiempo.subgrupos.map((fila) => (
              <View
                key={fila.subgrupo}
                accessible
                accessibilityLabel={`${fila.subgrupo}: ${fila.equivalentes} equivalentes`}
                style={estilos.fila}
              >
                <Text style={estilos.subgrupo}>{fila.subgrupo}</Text>
                <Text style={estilos.cantidad}>{formatearEquivalentes(fila.equivalentes)}</Text>
              </View>
            ))}
          </Tarjeta>
        </View>
      ))}
    </>
  );
}

/** 2 → «2», 0.5 → «½», 1.5 → «1 ½». */
export function formatearEquivalentes(cantidad: number): string {
  const entero = Math.floor(cantidad);
  const mitad = cantidad - entero >= 0.5;
  if (!mitad) return String(entero);
  return entero > 0 ? `${entero} ½` : '½';
}

const estilos = StyleSheet.create({
  nota: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.pequeno,
    color: colores.textoSuave,
    marginBottom: 12,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nombre: { fontFamily: fuentes.negrita, fontSize: tamanos.cuerpo, color: colores.texto },
  kcal: { fontFamily: fuentes.normal, fontSize: 12.5, color: colores.textoSuave },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  subgrupo: { flexShrink: 1, fontFamily: fuentes.normal, fontSize: 14.5, color: colores.texto },
  cantidad: { fontFamily: fuentes.semibold, fontSize: 14.5, color: colores.texto },
});
