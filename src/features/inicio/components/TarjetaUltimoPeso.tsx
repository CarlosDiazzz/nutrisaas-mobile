import { StyleSheet, Text, View } from 'react-native';

import { Boton, Tarjeta } from '@/components/ui';
import { describirDia } from '@/shared/utils/fechas';
import { colores, fuentes, tamanos } from '@/theme';

import { UltimoPeso } from '../types';

interface TarjetaUltimoPesoProps {
  peso: UltimoPeso | null;
  hoy: string;
  /** Abre la hoja «Registrar mi peso». */
  onRegistrar: () => void;
}

export default function TarjetaUltimoPeso({ peso, hoy, onRegistrar }: TarjetaUltimoPesoProps) {
  return (
    <Tarjeta style={estilos.tarjeta}>
      <View style={estilos.textos}>
        <Text style={estilos.etiqueta}>ÚLTIMO PESO</Text>
        {peso ? (
          <View style={estilos.fila}>
            <Text style={estilos.valor}>{peso.pesoKg.toFixed(1)} kg</Text>
            <Text style={estilos.cuando}>· {describirDia(peso.fecha, hoy)}</Text>
          </View>
        ) : (
          <Text style={estilos.cuando}>Aún no hay pesos registrados.</Text>
        )}
      </View>
      <Boton titulo="+ Registrar" compacto onPress={onRegistrar} />
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textos: { flex: 1 },
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
