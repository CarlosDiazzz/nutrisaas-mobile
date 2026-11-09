import { Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { EstadoVacio, FilaAlimento, Tarjeta } from '@/components/ui';
import { formatearMiles } from '@/shared/utils/fechas';
import { colores, fuentes, tamanos } from '@/theme';

import { DiaDelPlan } from '../types';

import { aAlertas } from './avisos';

interface MenuDelDiaProps {
  dia: DiaDelPlan;
  /** Se llama con la posición vertical de cada tarjeta, para llevar un tiempo a la vista. */
  onPosicionDeTiempo?: (tiempo: string, y: number) => void;
}

/** Una tarjeta por tiempo de comida con sus alimentos; un día sin alimentos muestra el estado vacío. */
export default function MenuDelDia({ dia, onPosicionDeTiempo }: MenuDelDiaProps) {
  if (dia.tiempos.length === 0) {
    return (
      <Tarjeta>
        <EstadoVacio
          icono={Utensils}
          titulo="No hay alimentos este día"
          texto="Tu nutrióloga no agregó comidas para esta fecha."
        />
      </Tarjeta>
    );
  }
  return (
    <>
      {dia.tiempos.map((tiempo) => (
        <View
          key={tiempo.tiempoComida}
          onLayout={(evento) =>
            onPosicionDeTiempo?.(tiempo.tiempoComida, evento.nativeEvent.layout.y)
          }
        >
          <Tarjeta>
            <View style={estilos.cabecera}>
              <Text accessibilityRole="header" style={estilos.nombre}>
                {tiempo.nombre}
              </Text>
              <Text style={estilos.kcal}>{formatearMiles(tiempo.kcal)} kcal</Text>
            </View>
            {tiempo.alimentos.map((alimento) => (
              <FilaAlimento
                key={alimento.nombre}
                nombre={alimento.nombre}
                cantidad={alimento.porcion}
                alertas={aAlertas(alimento.avisos)}
              />
            ))}
          </Tarjeta>
        </View>
      ))}
    </>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nombre: { fontFamily: fuentes.negrita, fontSize: tamanos.cuerpo, color: colores.texto },
  kcal: { fontFamily: fuentes.normal, fontSize: 12.5, color: colores.textoSuave },
});
