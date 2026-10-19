import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colores, espaciado, fuentes, medidas, radios, tamanos } from '@/theme';

interface CampoProps extends Omit<TextInputProps, 'style'> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

/** Campo de texto de 50 pt: borde de 2 pt `primario` al enfocar y `peligro` con error. */
const Campo = forwardRef<TextInput, CampoProps>(function Campo(
  { etiqueta, ayuda, error, onFocus, onBlur, ...resto },
  referencia,
) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        ref={referencia}
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoPlaceholder}
        style={[estilos.entrada, enfocado && estilos.enfocado, error ? estilos.conError : null]}
        onFocus={(evento) => {
          setEnfocado(true);
          onFocus?.(evento);
        }}
        onBlur={(evento) => {
          setEnfocado(false);
          onBlur?.(evento);
        }}
        {...resto}
      />
      {error ? (
        <Text accessibilityRole="alert" style={estilos.error}>
          {error}
        </Text>
      ) : ayuda ? (
        <Text style={estilos.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
});

export default Campo;

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: {
    fontFamily: fuentes.semibold,
    fontSize: 13.5,
    color: colores.etiqueta,
    marginBottom: 6,
  },
  entrada: {
    height: medidas.alturaCampo,
    borderRadius: radios.campo,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    backgroundColor: colores.superficie,
    paddingHorizontal: 14,
    fontFamily: fuentes.normal,
    fontSize: tamanos.campo,
    color: colores.texto,
  },
  enfocado: { borderWidth: 2, borderColor: colores.primario },
  conError: { borderWidth: 2, borderColor: colores.peligro },
  ayuda: {
    fontFamily: fuentes.normal,
    fontSize: 12.5,
    color: colores.textoSuave,
    marginTop: espaciado.xs + 1,
  },
  error: {
    fontFamily: fuentes.normal,
    fontSize: 12.5,
    color: colores.peligro,
    marginTop: espaciado.xs + 1,
  },
});
