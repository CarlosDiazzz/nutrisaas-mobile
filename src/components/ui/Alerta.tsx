import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, radios } from '@/theme';

interface AlertaProps {
  texto: string;
  variante?: keyof typeof colores.alerta;
}

export default function Alerta({ texto, variante = 'error' }: AlertaProps) {
  const paleta = colores.alerta[variante];
  return (
    <View
      accessible
      accessibilityRole="alert"
      style={[estilos.base, { backgroundColor: paleta.fondo, borderColor: paleta.borde }]}
    >
      <Text style={[estilos.texto, { color: paleta.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: radios.campo,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  texto: { fontFamily: fuentes.normal, fontSize: 14 },
});
