import { useRouter } from 'expo-router';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Alerta, Boton, EstadoVacio, Esqueleto, Pantalla, Tarjeta } from '@/components/ui';
import { useYo } from '@/shared/hooks/useYo';
import { formatearHace } from '@/shared/utils/fechas';
import { colores, fuentes, medidas, tamanos } from '@/theme';

import FilaAviso from '../components/FilaAviso';
import { useBandeja, useMarcarLeida, useMarcarTodasLeidas } from '../hooks/useBandeja';
import { destinoDeNotificacion } from '../push/destino';
import { Notificacion } from '../types';

export default function AvisosScreen() {
  const router = useRouter();
  const yo = useYo();
  const bandeja = useBandeja();
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const avisos = bandeja.data?.pages.flatMap((pagina) => pagina.contenido) ?? [];
  const haySinLeer = avisos.some((aviso) => !aviso.leida);
  const zona = yo.data?.consultorio.zonaHoraria ?? 'America/Mexico_City';
  // «Hace 2 h» se cuenta desde el momento en que llegó la bandeja, no desde cada dibujado de la pantalla.
  const ahora = new Date(bandeja.dataUpdatedAt);

  const abrir = (aviso: Notificacion) => {
    if (!aviso.leida) marcarLeida.mutate(aviso.id);
    const destino = destinoDeNotificacion(aviso.tipo);
    if (destino) router.navigate(destino);
  };

  return (
    <Pantalla fija>
      <View style={estilos.encabezado}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          onPress={() => router.back()}
          style={estilos.volver}
        >
          <ChevronLeft size={24} color={colores.texto} />
        </Pressable>
        <Text accessibilityRole="header" style={estilos.titulo}>
          Avisos
        </Text>
        {haySinLeer ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Marcar todo como leído"
            disabled={marcarTodas.isPending}
            onPress={() => marcarTodas.mutate()}
            style={estilos.marcarTodo}
          >
            <Text style={estilos.marcarTodoTexto}>Marcar todo como leído</Text>
          </Pressable>
        ) : null}
      </View>

      {bandeja.isPending ? (
        <>
          <Esqueleto alto={64} radio={16} />
          <Esqueleto alto={64} radio={16} />
          <Esqueleto alto={64} radio={16} />
        </>
      ) : bandeja.isError ? (
        <>
          <Alerta texto={bandeja.error.message} />
          <Boton titulo="Reintentar" onPress={() => bandeja.refetch()} />
        </>
      ) : avisos.length === 0 ? (
        <Tarjeta>
          <EstadoVacio
            icono={Bell}
            titulo="No tienes avisos"
            texto="Aquí verás tus citas, planes nuevos y recordatorios."
          />
        </Tarjeta>
      ) : (
        <Tarjeta style={estilos.lista}>
          <FlatList
            testID="lista-de-avisos"
            data={avisos}
            keyExtractor={(aviso) => String(aviso.id)}
            renderItem={({ item }) => (
              <FilaAviso
                aviso={item}
                cuando={formatearHace(item.creadaEn, ahora, zona)}
                onPress={() => abrir(item)}
              />
            )}
            onEndReached={() => {
              if (bandeja.hasNextPage && !bandeja.isFetchingNextPage) bandeja.fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            refreshing={bandeja.isRefetching && !bandeja.isFetchingNextPage}
            onRefresh={() => bandeja.refetch()}
            ListFooterComponent={
              bandeja.isFetchingNextPage ? <Esqueleto alto={48} radio={12} /> : null
            }
          />
        </Tarjeta>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 },
  volver: {
    width: medidas.objetivoTactilMinimo,
    height: medidas.objetivoTactilMinimo,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  titulo: { flex: 1, fontFamily: fuentes.negrita, fontSize: 20, color: colores.texto },
  marcarTodo: { minHeight: medidas.objetivoTactilMinimo, justifyContent: 'center' },
  marcarTodoTexto: {
    fontFamily: fuentes.semibold,
    fontSize: tamanos.subtitulo,
    color: colores.primario,
  },
  lista: { flex: 1, marginTop: 12, paddingVertical: 2 },
});
