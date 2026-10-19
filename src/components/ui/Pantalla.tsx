import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores, espaciado } from '@/theme';

interface PantallaProps {
  children: ReactNode;
  /** Sin desplazamiento (pantallas con una lista propia o contenido fijo). */
  fija?: boolean;
  /** Si se define, arrastrar hacia abajo actualiza. */
  onActualizar?: () => void;
  actualizando?: boolean;
  /** Ocupa también el borde inferior; las pantallas con barra de pestañas lo dejan a la barra. */
  conBordeInferior?: boolean;
}

/** Área segura con el fondo y el margen lateral de 18 pt del diseño. */
export default function Pantalla({
  children,
  fija = false,
  onActualizar,
  actualizando = false,
  conBordeInferior = false,
}: PantallaProps) {
  const bordes = conBordeInferior ? (['top', 'bottom'] as const) : (['top'] as const);
  return (
    <SafeAreaView style={estilos.area} edges={bordes}>
      <KeyboardAvoidingView
        style={estilos.area}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {fija ? (
          <View style={estilos.contenido}>{children}</View>
        ) : (
          <ScrollView
            contentContainerStyle={estilos.contenido}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onActualizar ? (
                <RefreshControl refreshing={actualizando} onRefresh={onActualizar} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  area: { flex: 1, backgroundColor: colores.fondo },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: espaciado.margenPantalla,
    paddingTop: espaciado.xs,
    paddingBottom: espaciado.margenPantalla,
  },
});
