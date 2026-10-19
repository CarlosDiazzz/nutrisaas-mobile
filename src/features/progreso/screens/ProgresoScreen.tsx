import { Plus, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Alerta,
  Boton,
  Encabezado,
  Esqueleto,
  EstadoVacio,
  EtiquetaSeccion,
  Pantalla,
  Segmentado,
  Tarjeta,
} from '@/components/ui';
import { useYo } from '@/shared/hooks/useYo';
import { hoyEnZona, nombreDelMes } from '@/shared/utils/fechas';
import { colores, fuentes, medidas } from '@/theme';

import GraficaPeso from '../components/GraficaPeso';
import HojaRegistrarPeso from '../components/HojaRegistrarPeso';
import ListaDeRegistros from '../components/ListaDeRegistros';
import ResumenDePeso from '../components/ResumenDePeso';
import { useProgreso } from '../hooks/useProgreso';
import { Punto, Rango } from '../types';

const RANGOS = [
  { valor: 'MES', etiqueta: '1 mes' },
  { valor: 'TRIMESTRE', etiqueta: '3 meses' },
  { valor: 'TODO', etiqueta: 'Todo' },
] as const;

/** Subtítulo de la pantalla: «Peso de diciembre a marzo» o «Peso de marzo». */
export function subtituloDeRango(puntos: Punto[]): string {
  if (puntos.length === 0) return 'Registra tu peso para ver tu avance';
  const primero = nombreDelMes(puntos[0].fecha);
  const ultimo = nombreDelMes(puntos[puntos.length - 1].fecha);
  return primero === ultimo ? `Peso de ${primero}` : `Peso de ${primero} a ${ultimo}`;
}

export default function ProgresoScreen() {
  const yo = useYo();
  const [rango, setRango] = useState<Rango>('TRIMESTRE');
  const [hoja, setHoja] = useState<{ abierta: boolean; fecha?: string }>({ abierta: false });
  const progreso = useProgreso(rango);
  // Los registros propios salen siempre de la serie completa, sin importar el rango de la gráfica.
  const historial = useProgreso('TODO');

  const hoy = yo.data ? hoyEnZona(yo.data.consultorio.zonaHoraria) : null;
  const abrirHoja = (fecha?: string) => setHoja({ abierta: true, fecha });
  const cerrarHoja = () => setHoja({ abierta: false });

  if (progreso.isPending || yo.isPending) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Mi progreso" />
        <Esqueleto alto={44} radio={10} />
        <Esqueleto alto={64} radio={14} />
        <Esqueleto alto={210} radio={16} />
      </Pantalla>
    );
  }

  if (progreso.isError || yo.isError) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Mi progreso" />
        <Alerta texto={(progreso.error ?? yo.error)?.message ?? ''} />
        <Boton
          titulo="Reintentar"
          onPress={() => {
            progreso.refetch();
            yo.refetch();
          }}
        />
      </Pantalla>
    );
  }

  const datos = progreso.data;
  const propios = (historial.data?.puntos ?? []).filter((p) => p.origen === 'PACIENTE').reverse();
  const visibles = datos.puntos.filter((p) => !p.oculto);

  return (
    <Pantalla onActualizar={() => progreso.refetch()} actualizando={progreso.isRefetching}>
      <Encabezado titulo="Mi progreso" subtitulo={subtituloDeRango(visibles)} />
      <Segmentado opciones={RANGOS} valor={rango} onCambiar={setRango} />
      {datos.resumen ? (
        <>
          <ResumenDePeso resumen={datos.resumen} />
          <Tarjeta style={estilos.grafica}>
            <GraficaPeso puntos={datos.puntos} />
          </Tarjeta>
        </>
      ) : (
        <Tarjeta>
          <EstadoVacio
            icono={TrendingUp}
            titulo="Aún no hay registros"
            texto="Registra tu peso para ver aquí cómo cambia con el tiempo."
          />
        </Tarjeta>
      )}

      <View style={estilos.cabecera}>
        <EtiquetaSeccion texto="Tus registros" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar peso"
          onPress={() => abrirHoja()}
          style={estilos.registrar}
        >
          <Plus size={16} color={colores.primario} />
          <Text style={estilos.registrarTexto}>Registrar</Text>
        </Pressable>
      </View>
      {propios.length > 0 && hoy ? (
        <ListaDeRegistros
          registros={propios}
          hoy={hoy}
          onElegir={(registro) => abrirHoja(registro.fecha)}
        />
      ) : (
        <Tarjeta>
          <Text style={estilos.vacio}>Aún no tienes registros propios.</Text>
        </Tarjeta>
      )}
      <HojaRegistrarPeso visible={hoja.abierta} fechaInicial={hoja.fecha} onCerrar={cerrarHoja} />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  grafica: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  registrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: medidas.objetivoTactilMinimo,
    paddingHorizontal: 4,
  },
  registrarTexto: { fontFamily: fuentes.negrita, fontSize: 14, color: colores.primario },
  vacio: { fontFamily: fuentes.normal, fontSize: 14, color: colores.textoSuave },
});
