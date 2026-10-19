import { Coffee, LucideIcon, Moon, Sun, UtensilsCrossed } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatearMiles } from '@/shared/utils/fechas';
import { colores, fuentes, radios } from '@/theme';

export type TiempoComida =
  'DESAYUNO' | 'COLACION_MATUTINA' | 'COMIDA' | 'COLACION_VESPERTINA' | 'CENA';

const ICONOS: Record<TiempoComida, LucideIcon> = {
  DESAYUNO: Sun,
  COLACION_MATUTINA: Coffee,
  COMIDA: UtensilsCrossed,
  COLACION_VESPERTINA: Coffee,
  CENA: Moon,
};
const TAMANO_ICONO = 18;

interface FilaTiempoComidaProps {
  tiempo: TiempoComida;
  nombre: string;
  /** Alimentos de ese tiempo unidos con comas y «y». */
  resumen: string;
  kcal: number;
  onPress?: () => void;
}

export default function FilaTiempoComida({
  tiempo,
  nombre,
  resumen,
  kcal,
  onPress,
}: FilaTiempoComidaProps) {
  const Icono = ICONOS[tiempo];
  const kcalTexto = formatearMiles(kcal);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${nombre}, ${kcalTexto} kilocalorías. ${resumen}`}
      disabled={!onPress}
      onPress={onPress}
      style={estilos.fila}
    >
      <View style={estilos.icono}>
        <Icono size={TAMANO_ICONO} color={colores.primario} />
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.nombre}>{nombre}</Text>
        <Text style={estilos.resumen}>{resumen}</Text>
      </View>
      <Text style={estilos.kcal}>{kcalTexto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: radios.selector,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1 },
  nombre: { fontFamily: fuentes.negrita, fontSize: 15, color: colores.texto },
  resumen: {
    fontFamily: fuentes.normal,
    fontSize: 13,
    lineHeight: 17.5,
    color: colores.textoSuave,
    marginTop: 2,
  },
  kcal: { fontFamily: fuentes.normal, fontSize: 12.5, color: colores.textoSuave },
});
