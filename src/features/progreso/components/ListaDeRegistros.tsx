import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Insignia, Tarjeta } from '@/components/ui';
import { formatearDia } from '@/shared/utils/fechas';
import { colores, fuentes, medidas, tamanos } from '@/theme';

import { Punto } from '../types';

interface ListaDeRegistrosProps {
  /** Solo los registros del propio paciente, del más reciente al más antiguo. */
  registros: Punto[];
  hoy: string;
  onElegir: (registro: Punto) => void;
}

/** Los registros propios del paciente; tocar uno abre la hoja para editarlo o borrarlo. */
export default function ListaDeRegistros({ registros, hoy, onElegir }: ListaDeRegistrosProps) {
  return (
    <Tarjeta style={estilos.tarjeta}>
      {registros.map((registro, indice) => (
        <Pressable
          key={registro.fecha}
          accessibilityRole="button"
          accessibilityLabel={`Registro de ${registro.pesoKg.toFixed(1)} kilos, ${formatearDia(registro.fecha)}`}
          onPress={() => onElegir(registro)}
          style={[estilos.fila, indice === registros.length - 1 && estilos.sinLinea]}
        >
          <View style={estilos.textos}>
            <Text style={estilos.peso}>{registro.pesoKg.toFixed(1)} kg</Text>
            <Text style={estilos.detalle}>{detalle(registro)}</Text>
          </View>
          {registro.fecha === hoy ? <Insignia texto="Hoy" variante="ok" /> : null}
        </Pressable>
      ))}
    </Tarjeta>
  );
}

function detalle(registro: Punto): string {
  const cintura =
    registro.cinturaCm === null ? '' : ` · cintura ${registro.cinturaCm.toFixed(1)} cm`;
  return `${formatearDia(registro.fecha)}${cintura}`;
}

const estilos = StyleSheet.create({
  tarjeta: { paddingVertical: 2 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: medidas.objetivoTactilMinimo,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  sinLinea: { borderBottomWidth: 0 },
  textos: { flex: 1 },
  peso: { fontFamily: fuentes.negrita, fontSize: tamanos.cuerpo, color: colores.texto },
  detalle: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.pequeno,
    color: colores.textoSuave,
    marginTop: 2,
  },
});
