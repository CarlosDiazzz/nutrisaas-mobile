import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '@/theme';

import Insignia from './Insignia';

export interface AlertaAlimento {
  tipo: 'ALERGIA' | 'INTOLERANCIA';
  /** Texto de la insignia, por ejemplo «Alergia: nuez» o «Lactosa». */
  texto: string;
}

interface FilaAlimentoProps {
  nombre: string;
  /** Cantidad ya multiplicada y en fracciones legibles: «½ taza». */
  cantidad: string;
  alertas?: readonly AlertaAlimento[];
}

export default function FilaAlimento({ nombre, cantidad, alertas = [] }: FilaAlimentoProps) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.nombre}>{nombre}</Text>
      {alertas.map((alerta) => (
        <Insignia
          key={alerta.texto}
          texto={alerta.texto}
          variante={alerta.tipo === 'ALERGIA' ? 'error' : 'aviso'}
        />
      ))}
      <Text style={estilos.cantidad}>{cantidad}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  nombre: { flexShrink: 1, fontFamily: fuentes.normal, fontSize: 14.5, color: colores.texto },
  cantidad: {
    marginLeft: 'auto',
    fontFamily: fuentes.normal,
    fontSize: 13.5,
    color: colores.textoSuave,
  },
});
