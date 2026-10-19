import { useLocalSearchParams } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';

import {
  Alerta,
  Boton,
  Encabezado,
  EstadoVacio,
  Esqueleto,
  Pantalla,
  Segmentado,
  SelectorDia,
} from '@/components/ui';
import { useYo } from '@/shared/hooks/useYo';
import { diaDeLaSemana, formatearMiles, hoyEnZona, sumarDias } from '@/shared/utils/fechas';

import EquivalentesDelPlan from '../components/EquivalentesDelPlan';
import MenuDelDia from '../components/MenuDelDia';
import { usePlan } from '../hooks/usePlan';

type Vista = 'MENU' | 'EQUIVALENTES';

const LETRAS_DE_LA_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const VISTAS = [
  { valor: 'MENU', etiqueta: 'Menú' },
  { valor: 'EQUIVALENTES', etiqueta: 'Equivalentes' },
] as const;
const MARGEN_SUPERIOR_AL_DESPLAZAR = 8;

export default function PlanScreen() {
  const { tiempo } = useLocalSearchParams<{ tiempo?: string }>();
  const plan = usePlan();
  const yo = useYo();
  const referencia = useRef<ScrollView>(null);
  const posiciones = useRef<Record<string, number>>({});
  const [vista, setVista] = useState<Vista>('MENU');
  // La elección vale solo para el tiempo con el que se abrió la pantalla: un tiempo nuevo vuelve a hoy.
  const [elegido, setElegido] = useState<{ dia: number; paraTiempo?: string } | null>(null);

  const hoy = yo.data ? hoyEnZona(yo.data.consultorio.zonaHoraria) : null;
  const diaDeHoy = hoy ? diaDeLaSemana(hoy) : 1;
  // El día por defecto es hoy, también al llegar desde el Inicio con un tiempo.
  const dia = elegido && elegido.paraTiempo === tiempo ? elegido.dia : diaDeHoy;

  const dias = useMemo(() => {
    if (!hoy) return [];
    const lunes = sumarDias(hoy, -(diaDeLaSemana(hoy) - 1));
    return LETRAS_DE_LA_SEMANA.map((letra, indice) => ({
      clave: String(indice + 1),
      letra,
      numero: Number(sumarDias(lunes, indice).slice(-2)),
    }));
  }, [hoy]);

  const guardarPosicion = useCallback((codigo: string, y: number) => {
    posiciones.current[codigo] = y;
  }, []);

  useEffect(() => {
    // El Inicio abre esta pantalla en un tiempo de comida: se lleva a la vista cuando ya se midió.
    if (!tiempo || !plan.data?.plan) return;
    const y = posiciones.current[tiempo];
    if (y !== undefined) {
      referencia.current?.scrollTo({
        y: Math.max(0, y - MARGEN_SUPERIOR_AL_DESPLAZAR),
        animated: true,
      });
    }
  }, [tiempo, plan.data, vista]);

  if (plan.isPending || yo.isPending) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Mi plan" />
        <Esqueleto alto={56} radio={10} />
        <Esqueleto alto={160} radio={16} />
        <Esqueleto alto={160} radio={16} />
      </Pantalla>
    );
  }

  if (plan.isError || yo.isError) {
    const error = plan.error ?? yo.error;
    return (
      <Pantalla fija>
        <Encabezado titulo="Mi plan" />
        <Alerta texto={error?.message ?? ''} />
        <Boton
          titulo="Reintentar"
          onPress={() => {
            plan.refetch();
            yo.refetch();
          }}
        />
      </Pantalla>
    );
  }

  const actual = plan.data.plan;
  if (!actual) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Mi plan" />
        <EstadoVacio
          icono={ClipboardList}
          titulo="Tu nutrióloga aún no activa tu plan."
          texto="Cuando lo active, lo verás aquí."
        />
      </Pantalla>
    );
  }

  const diaDelPlan = actual.dias.find((d) => d.diaSemana === dia) ?? actual.dias[0];
  return (
    <Pantalla
      referenciaDesplazamiento={referencia}
      onActualizar={() => plan.refetch()}
      actualizando={plan.isRefetching}
    >
      <Encabezado
        titulo="Mi plan"
        subtitulo={`${actual.nombre} · ${formatearMiles(actual.kcalObjetivo)} kcal`}
      />
      <SelectorDia
        dias={dias}
        seleccionado={String(dia)}
        onSeleccionar={(clave) => setElegido({ dia: Number(clave), paraTiempo: tiempo })}
      />
      <Segmentado opciones={VISTAS} valor={vista} onCambiar={setVista} />
      {vista === 'MENU' ? (
        <MenuDelDia dia={diaDelPlan} onPosicionDeTiempo={guardarPosicion} />
      ) : (
        <EquivalentesDelPlan tiempos={actual.equivalentes} onPosicionDeTiempo={guardarPosicion} />
      )}
    </Pantalla>
  );
}
