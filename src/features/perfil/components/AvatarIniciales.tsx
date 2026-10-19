import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '@/theme';

const TAMANO = 52;

/** Inicial del nombre y del primer apellido: «Ana López Ruiz» con nombre «Ana» → «AL». */
export function iniciales(nombre: string, nombreCompleto: string): string {
  const apellidos = nombreCompleto.startsWith(nombre)
    ? nombreCompleto.slice(nombre.length).trim()
    : '';
  return (nombre.charAt(0) + apellidos.charAt(0)).toUpperCase();
}

export default function AvatarIniciales({
  nombre,
  nombreCompleto,
}: {
  nombre: string;
  nombreCompleto: string;
}) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={estilos.circulo}>
      <Text style={estilos.texto}>{iniciales(nombre, nombreCompleto)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    width: TAMANO,
    height: TAMANO,
    borderRadius: TAMANO / 2,
    backgroundColor: colores.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.avatarTexto },
});
