import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, tamanos } from '@/theme';

interface EstadoVacioProps {
  icono: LucideIcon;
  titulo: string;
  texto?: string;
}

const TAMANO_ICONO = 40;

export default function EstadoVacio({ icono: Icono, titulo, texto }: EstadoVacioProps) {
  return (
    <View style={estilos.contenedor}>
      <Icono size={TAMANO_ICONO} color={colores.textoPlaceholder} />
      <Text style={estilos.titulo}>{titulo}</Text>
      {texto ? <Text style={estilos.texto}>{texto}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', padding: espaciado.xl, gap: espaciado.sm },
  titulo: {
    fontFamily: fuentes.negrita,
    fontSize: tamanos.tituloSeccion,
    color: colores.texto,
    textAlign: 'center',
  },
  texto: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.textoSuave,
    textAlign: 'center',
  },
});
