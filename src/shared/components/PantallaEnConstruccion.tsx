import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '@/theme';

import Card from './ui/Card';

interface PantallaEnConstruccionProps {
  titulo: string;
}

/** Marcador temporal para pantallas que se construirán en otras historias. */
export default function PantallaEnConstruccion({ titulo }: PantallaEnConstruccionProps) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Card>
        <Text style={estilos.texto}>Esta sección estará disponible próximamente.</Text>
      </Card>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo, padding: espaciado.md, gap: espaciado.md },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.tamanoTitulo,
    fontWeight: tipografia.pesoNegrita,
  },
  texto: { color: colores.textoSecundario, fontSize: tipografia.tamanoCuerpo },
});
