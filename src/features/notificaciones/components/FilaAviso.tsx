import { CalendarDays, ClipboardList, LucideIcon, TrendingUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, medidas, radios } from '@/theme';

import { Notificacion, TipoNotificacion } from '../types';

const ICONOS: Record<TipoNotificacion, LucideIcon> = {
  CITA: CalendarDays,
  PLAN: ClipboardList,
  PROGRESO: TrendingUp,
};
const TAMANO_ICONO = 18;

interface FilaAvisoProps {
  aviso: Notificacion;
  /** «Hace 2 h», «16 feb»… */
  cuando: string;
  onPress: () => void;
}

/** Un aviso de la bandeja: los no leídos llevan un punto y colores de énfasis. */
export default function FilaAviso({ aviso, cuando, onPress }: FilaAvisoProps) {
  const Icono = ICONOS[aviso.tipo];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${aviso.leida ? '' : 'Sin leer. '}${aviso.titulo}. ${aviso.mensaje}. ${cuando}`}
      onPress={onPress}
      style={estilos.fila}
    >
      <View style={[estilos.icono, aviso.leida && estilos.iconoLeido]}>
        <Icono size={TAMANO_ICONO} color={aviso.leida ? colores.textoSuave : colores.primario} />
      </View>
      <View style={estilos.textos}>
        <Text style={[estilos.titulo, aviso.leida && estilos.tituloLeido]}>{aviso.titulo}</Text>
        <Text style={estilos.mensaje}>{aviso.mensaje}</Text>
        <Text style={estilos.cuando}>{cuando}</Text>
      </View>
      {aviso.leida ? null : <View style={estilos.punto} />}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: 12,
    minHeight: medidas.objetivoTactilMinimo,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: radios.selector,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoLeido: { backgroundColor: colores.insignia.neutro.fondo },
  textos: { flex: 1 },
  titulo: { fontFamily: fuentes.negrita, fontSize: 14.5, color: colores.texto },
  tituloLeido: { color: colores.insignia.neutro.texto },
  mensaje: {
    fontFamily: fuentes.normal,
    fontSize: 13.5,
    lineHeight: 18,
    color: colores.insignia.neutro.texto,
    marginTop: 2,
  },
  cuando: {
    fontFamily: fuentes.normal,
    fontSize: 12,
    color: colores.textoPlaceholder,
    marginTop: 2,
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colores.primario,
    marginTop: 6,
  },
});
