import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '@/theme';

interface EstadisticaProps {
  etiqueta: string;
  valor: string;
}

export default function Estadistica({ etiqueta, valor }: EstadisticaProps) {
  return (
    <View accessible accessibilityLabel={`${etiqueta}: ${valor}`} style={estilos.caja}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  etiqueta: { fontFamily: fuentes.normal, fontSize: 12, color: colores.textoSuave },
  valor: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.texto, marginTop: 2 },
});
