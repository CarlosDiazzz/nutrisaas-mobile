import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme';

interface InputProps extends TextInputProps {
  etiqueta: string;
  error?: string;
}

export default function Input({ etiqueta, error, style, ...resto }: InputProps) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSecundario}
        style={[estilos.campo, error ? estilos.campoConError : null, style]}
        {...resto}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espaciado.xs },
  etiqueta: {
    color: colores.texto,
    fontSize: tipografia.tamanoPequeno,
    fontWeight: tipografia.pesoSemibold,
  },
  campo: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.sm,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: tipografia.tamanoCuerpo,
    paddingVertical: espaciado.sm + 2,
    paddingHorizontal: espaciado.sm + 4,
  },
  campoConError: { borderColor: colores.error },
  error: { color: colores.error, fontSize: tipografia.tamanoPequeno },
});
