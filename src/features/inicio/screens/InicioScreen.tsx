import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Alerta, Boton, Encabezado, Esqueleto, Pantalla } from '@/components/ui';
import { formatearDia } from '@/shared/utils/fechas';
import { colores } from '@/theme';

import MenuDeHoyBloque from '../components/MenuDeHoyBloque';
import TarjetaProximaCita from '../components/TarjetaProximaCita';
import TarjetaUltimoPeso from '../components/TarjetaUltimoPeso';
import { useInicio } from '../hooks/useInicio';

const TAMANO_CAMPANA = 18;

export default function InicioScreen() {
  const router = useRouter();
  const inicio = useInicio();

  if (inicio.isPending) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Hola" />
        <Esqueleto alto={96} radio={16} />
        <Esqueleto alto={220} radio={16} />
        <Esqueleto alto={64} radio={16} />
      </Pantalla>
    );
  }

  if (inicio.isError) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Hola" />
        <Alerta texto={inicio.error.message} />
        <Boton titulo="Reintentar" onPress={() => inicio.refetch()} />
      </Pantalla>
    );
  }

  const datos = inicio.data;
  return (
    <Pantalla onActualizar={() => inicio.refetch()} actualizando={inicio.isRefetching}>
      <Encabezado
        titulo={`Hola, ${datos.nombre}`}
        subtitulo={formatearDia(datos.hoy)}
        accion={<Campana conAvisos={datos.avisosSinLeer > 0} />}
      />
      <TarjetaProximaCita cita={datos.proximaCita} zonaHoraria={datos.zonaHoraria} />
      <MenuDeHoyBloque
        menu={datos.menuHoy}
        onAbrirTiempo={(tiempo) => router.navigate({ pathname: '/plan', params: { tiempo } })}
      />
      <TarjetaUltimoPeso peso={datos.ultimoPeso} hoy={datos.hoy} />
    </Pantalla>
  );
}

/** Campana de avisos con un punto si hay sin leer. La bandeja llega en la sección 3E. */
function Campana({ conAvisos }: { conAvisos: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={conAvisos ? 'Avisos, hay sin leer' : 'Avisos'}
      style={estilos.campana}
    >
      <Bell size={TAMANO_CAMPANA} color={colores.texto} />
      {conAvisos ? <View style={estilos.punto} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campana: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colores.peligro,
    borderWidth: 2,
    borderColor: colores.superficie,
  },
});
