import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '@/theme';

import { Punto } from '../types';

const ANCHO_DE_LA_GRAFICA = 300;
const ALTO_DE_LA_GRAFICA = 150;
const SECCIONES = 3;
const RADIO_CONSULTA = 5;
const RADIO_REGISTRO = 3.5;

interface GraficaPesoProps {
  puntos: Punto[];
}

/** Los puntos que se dibujan: uno por día; el registro que una consulta reemplaza no entra. */
export function puntosVisibles(puntos: Punto[]): Punto[] {
  return puntos.filter((punto) => !punto.oculto);
}

/** Valores de la gráfica: consulta en `lateral` (radio 5) y registro del paciente en `avatar` (radio 3.5). */
export function datosDeLaGrafica(puntos: Punto[]) {
  return puntosVisibles(puntos).map((punto) => {
    const esConsulta = punto.origen === 'CONSULTA';
    const radio = esConsulta ? RADIO_CONSULTA : RADIO_REGISTRO;
    return {
      value: punto.pesoKg,
      customDataPoint: () => (
        <View
          style={{
            width: radio * 2,
            height: radio * 2,
            borderRadius: radio,
            backgroundColor: esConsulta ? colores.lateral : colores.avatar,
            borderWidth: 1.5,
            borderColor: colores.superficie,
          }}
        />
      ),
    };
  });
}

export default function GraficaPeso({ puntos }: GraficaPesoProps) {
  const datos = datosDeLaGrafica(puntos);
  const pesos = datos.map((d) => d.value);
  const minimo = Math.floor(Math.min(...pesos)) - 1;
  const maximo = Math.ceil(Math.max(...pesos)) + 1;
  const espacio = datos.length > 1 ? (ANCHO_DE_LA_GRAFICA - 20) / (datos.length - 1) : 0;

  return (
    <View
      accessible
      accessibilityLabel={`Gráfica de peso con ${datos.length} puntos`}
      style={estilos.contenedor}
    >
      <LineChart
        data={datos}
        width={ANCHO_DE_LA_GRAFICA}
        height={ALTO_DE_LA_GRAFICA}
        spacing={espacio}
        initialSpacing={10}
        endSpacing={10}
        yAxisOffset={minimo}
        maxValue={maximo - minimo}
        noOfSections={SECCIONES}
        color={colores.primario}
        thickness={2.2}
        hideRules={false}
        rulesColor={colores.linea}
        yAxisColor="transparent"
        xAxisColor={colores.linea}
        yAxisTextStyle={estilos.ejeY}
        yAxisLabelWidth={30}
        adjustToWidth={false}
        isAnimated={false}
        disableScroll
      />
      <View style={estilos.leyenda}>
        <Referencia color={colores.lateral} radio={RADIO_CONSULTA} texto="En consulta" />
        <Referencia color={colores.avatar} radio={RADIO_REGISTRO} texto="Tu registro" />
      </View>
    </View>
  );
}

function Referencia({ color, radio, texto }: { color: string; radio: number; texto: string }) {
  return (
    <View style={estilos.referencia}>
      <View
        style={{ width: radio * 2, height: radio * 2, borderRadius: radio, backgroundColor: color }}
      />
      <Text style={estilos.textoLeyenda}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center' },
  ejeY: { fontFamily: fuentes.normal, fontSize: 10, color: colores.textoPlaceholder },
  leyenda: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  referencia: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoLeyenda: { fontFamily: fuentes.normal, fontSize: 12.5, color: '#4b5563' },
});
