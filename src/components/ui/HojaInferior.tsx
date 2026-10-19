import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, medidas, radios } from '@/theme';

interface HojaInferiorProps {
  visible: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

/** Hoja que sube desde abajo: radio superior de 22 pt, asa de 42 × 5 pt y fondo atenuado. */
export default function HojaInferior({ visible, titulo, onCerrar, children }: HojaInferiorProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <View accessibilityViewIsModal style={estilos.contenedor}>
        <Pressable
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
          style={estilos.fondo}
          onPress={onCerrar}
        />
        <View style={estilos.hoja}>
          <View style={estilos.asa} />
          <Text accessibilityRole="header" style={estilos.titulo}>
            {titulo}
          </Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'flex-end' },
  fondo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colores.fondoAtenuado,
  },
  hoja: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: radios.hoja,
    borderTopRightRadius: radios.hoja,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  asa: {
    width: medidas.asaHoja.ancho,
    height: medidas.asaHoja.alto,
    borderRadius: radios.insignia,
    backgroundColor: colores.asa,
    alignSelf: 'center',
    marginBottom: 14,
  },
  titulo: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.texto, marginBottom: 14 },
});
