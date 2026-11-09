import { ClipboardList } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { EstadoVacio, EtiquetaSeccion, FilaTiempoComida, Tarjeta } from '@/components/ui';
import { formatearMiles } from '@/shared/utils/fechas';
import { colores, espaciado, fuentes } from '@/theme';

import { MenuDeHoy } from '../types';

interface MenuDeHoyBloqueProps {
  menu: MenuDeHoy | null;
  /** Se llama con el código del tiempo tocado para abrir Mi plan en él. */
  onAbrirTiempo: (tiempo: string) => void;
}

/** «Tu menú de hoy» con sus tiempos de comida; sin plan vigente muestra el estado vacío. */
export default function MenuDeHoyBloque({ menu, onAbrirTiempo }: MenuDeHoyBloqueProps) {
  return (
    <>
      <View style={estilos.cabecera}>
        <EtiquetaSeccion texto="Tu menú de hoy" />
        {menu ? <Text style={estilos.kcal}>{formatearMiles(menu.kcalObjetivo)} kcal</Text> : null}
      </View>
      {menu && menu.tiempos.length > 0 ? (
        <Tarjeta style={estilos.tarjeta}>
          {menu.tiempos.map((tiempo) => (
            <FilaTiempoComida
              key={tiempo.tiempoComida}
              tiempo={tiempo.tiempoComida}
              nombre={tiempo.nombre}
              resumen={tiempo.resumen}
              kcal={tiempo.kcal}
              onPress={() => onAbrirTiempo(tiempo.tiempoComida)}
            />
          ))}
        </Tarjeta>
      ) : (
        <Tarjeta>
          <EstadoVacio
            icono={ClipboardList}
            titulo={
              menu ? 'Hoy no tienes alimentos en tu menú' : 'Tu nutrióloga aún no activa tu plan.'
            }
          />
        </Tarjeta>
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaciado.xs,
  },
  kcal: { fontFamily: fuentes.normal, fontSize: 12.5, color: colores.textoSuave },
  tarjeta: { paddingVertical: espaciado.xs },
});
