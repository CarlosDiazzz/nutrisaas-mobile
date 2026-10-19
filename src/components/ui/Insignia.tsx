import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, radios, tamanos } from '@/theme';

export type VarianteInsignia = keyof typeof colores.insignia;

interface InsigniaProps {
  texto: string;
  variante?: VarianteInsignia;
}

export default function Insignia({ texto, variante = 'neutro' }: InsigniaProps) {
  const paleta = colores.insignia[variante];
  return (
    <View style={[estilos.base, { backgroundColor: paleta.fondo }]}>
      <Text style={[estilos.texto, { color: paleta.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radios.insignia,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  texto: { fontFamily: fuentes.semibold, fontSize: tamanos.insignia },
});
