import { StyleSheet, View } from 'react-native';

import { Estadistica } from '@/components/ui';

import { Resumen } from '../types';

/** 67.3 → «67.3 kg»; el signo menos del cambio es el de la tipografía, no un guion. */
export const formatearKg = (kg: number) => `${kg.toFixed(1).replace('-', '−')} kg`;

export default function ResumenDePeso({ resumen }: { resumen: Resumen }) {
  return (
    <View style={estilos.fila}>
      <Estadistica etiqueta="Inicio" valor={formatearKg(resumen.inicioKg)} />
      <Estadistica etiqueta="Actual" valor={formatearKg(resumen.actualKg)} />
      <Estadistica
        etiqueta="Cambio"
        valor={formatearKg(resumen.cambioKg)}
        tono={resumen.cambioKg < 0 ? 'ok' : 'normal'}
      />
    </View>
  );
}

const estilos = StyleSheet.create({ fila: { flexDirection: 'row', gap: 8, marginBottom: 12 } });
