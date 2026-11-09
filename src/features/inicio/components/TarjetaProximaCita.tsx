import { StyleSheet, Text } from 'react-native';

import { Tarjeta } from '@/components/ui';
import { formatearDiaYHora } from '@/shared/utils/fechas';
import { colores, fuentes, tamanos } from '@/theme';

import { ProximaCita } from '../types';

interface TarjetaProximaCitaProps {
  cita: ProximaCita | null;
  zonaHoraria: string;
}

/** Tarjeta destacada con la próxima cita; sin cita dice «Sin citas próximas». */
export default function TarjetaProximaCita({ cita, zonaHoraria }: TarjetaProximaCitaProps) {
  return (
    <Tarjeta destacada>
      <Text style={estilos.etiqueta}>PRÓXIMA CITA</Text>
      {cita ? (
        <>
          <Text style={estilos.principal}>{formatearDiaYHora(cita.inicio, zonaHoraria)}</Text>
          <Text style={estilos.detalle}>
            {cita.nutriologo} · {cita.consultorio}
          </Text>
        </>
      ) : (
        <Text style={estilos.principal}>Sin citas próximas</Text>
      )}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: tamanos.etiquetaSeccion,
    letterSpacing: tamanos.etiquetaSeccion * 0.05,
    color: colores.etiquetaSobrePrimario,
    marginBottom: 6,
  },
  principal: { fontFamily: fuentes.negrita, fontSize: 20, color: colores.blanco },
  detalle: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.sobrePrimarioSuave,
    marginTop: 4,
  },
});
