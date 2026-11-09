import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '@/theme';

const TAMANO = 64;

/** Marca de NutriSaaS: la «N» sobre un cuadrado redondeado de `primario`. */
export default function Logo() {
  return (
    <View accessibilityRole="image" accessibilityLabel="NutriSaaS" style={estilos.cuadro}>
      <Text style={estilos.letra}>N</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cuadro: {
    width: TAMANO,
    height: TAMANO,
    borderRadius: 18,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontFamily: fuentes.extranegrita, fontSize: 30, color: colores.blanco },
});
