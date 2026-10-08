import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme';

interface ButtonProps {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
}

export default function Button({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
}: ButtonProps) {
  const inactivo = cargando || deshabilitado;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo }}
      disabled={inactivo}
      onPress={onPress}
      style={[estilos.boton, inactivo && estilos.inactivo]}
    >
      {cargando ? (
        <ActivityIndicator color={colores.textoSobrePrimario} />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radios.sm,
    paddingVertical: espaciado.sm + 4,
    paddingHorizontal: espaciado.md,
    alignItems: 'center',
  },
  inactivo: { opacity: 0.6 },
  texto: {
    color: colores.textoSobrePrimario,
    fontSize: tipografia.tamanoCuerpo,
    fontWeight: tipografia.pesoSemibold,
  },
});
