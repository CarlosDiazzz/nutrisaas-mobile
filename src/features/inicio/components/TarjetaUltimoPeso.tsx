import { StyleSheet, Text, View } from 'react-native';

import { Tarjeta } from '@/components/ui';
import { describirDia } from '@/shared/utils/fechas';
import { colores, fuentes, tamanos } from '@/theme';

import { UltimoPeso } from '../types';

interface TarjetaUltimoPesoProps {
  peso: UltimoPeso | null;
  hoy: string;
}

export default function TarjetaUltimoPeso({ peso, hoy }: TarjetaUltimoPesoProps) {
  return (
    <Tarjeta>
      <Text style={estilos.etiqueta}>ÚLTIMO PESO</Text>
      {peso ? (
        <View style={estilos.fila}>
          <Text style={estilos.valor}>{peso.pesoKg.toFixed(1)} kg</Text>
          <Text style={estilos.cuando}>· {describirDia(peso.fecha, hoy)}</Text>
        </View>
      ) : (
        <Text style={estilos.cuando}>Aún no hay pesos registrados.</Text>
      )}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: tamanos.etiquetaSeccion,
    letterSpacing: tamanos.etiquetaSeccion * 0.05,
    color: colores.textoSuave,
    marginBottom: 2,
  },
  fila: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  valor: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.texto },
  cuando: { fontFamily: fuentes.normal, fontSize: tamanos.subtitulo, color: colores.textoSuave },
});
