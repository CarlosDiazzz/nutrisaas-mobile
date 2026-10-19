import { Phone } from 'lucide-react-native';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import {
  Alerta,
  Boton,
  Encabezado,
  Esqueleto,
  EtiquetaSeccion,
  Pantalla,
  Tarjeta,
} from '@/components/ui';
import { useYo } from '@/shared/hooks/useYo';
import { formatearFechaLarga } from '@/shared/utils/fechas';
import { useSesion } from '@/features/auth';
import { colores, fuentes, tamanos } from '@/theme';

import AvatarIniciales from '../components/AvatarIniciales';

const DIGITOS_TELEFONO = 10;

/** 9511002030 → «951 100 2030». Otras longitudes se muestran tal cual. */
export function formatearTelefono(telefono: string): string {
  if (telefono.length !== DIGITOS_TELEFONO) return telefono;
  return `${telefono.slice(0, 3)} ${telefono.slice(3, 6)} ${telefono.slice(6)}`;
}

export default function PerfilScreen() {
  const yo = useYo();
  const { cerrarSesion } = useSesion();

  if (yo.isPending) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Perfil" />
        <Esqueleto alto={80} radio={16} />
        <Esqueleto alto={120} radio={16} />
      </Pantalla>
    );
  }

  if (yo.isError) {
    return (
      <Pantalla fija>
        <Encabezado titulo="Perfil" />
        <Alerta texto={yo.error.message} />
        <Boton titulo="Reintentar" onPress={() => yo.refetch()} />
      </Pantalla>
    );
  }

  const { paciente, nutriologo, consultorio, consentimiento } = yo.data;
  const lugar = [consultorio.nombre, consultorio.direccion].filter(Boolean).join(' · ');

  return (
    <Pantalla>
      <Encabezado titulo="Perfil" />
      <Tarjeta style={estilos.fila}>
        <AvatarIniciales nombre={paciente.nombre} nombreCompleto={paciente.nombreCompleto} />
        <View style={estilos.textos}>
          <Text style={estilos.nombre}>{paciente.nombreCompleto}</Text>
          <Text style={estilos.suave}>{paciente.email}</Text>
        </View>
      </Tarjeta>

      <EtiquetaSeccion texto="Mi nutrióloga" />
      <Tarjeta>
        <Text style={estilos.nombreNutriologo}>{nutriologo.nombreCompleto}</Text>
        <Text style={estilos.suave}>{lugar}</Text>
        {consultorio.telefono ? (
          <View style={estilos.llamar}>
            <Boton
              titulo={`Llamar al ${formatearTelefono(consultorio.telefono)}`}
              variante="secundario"
              compacto
              icono={(color) => <Phone size={16} color={color} />}
              onPress={() => Linking.openURL(`tel:${consultorio.telefono}`)}
            />
          </View>
        ) : null}
      </Tarjeta>

      <EtiquetaSeccion texto="Preferencias" />
      <Tarjeta style={estilos.preferencias}>
        <View style={estilos.preferencia}>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>Notificaciones</Text>
            <Text style={estilos.detalle}>Disponible pronto</Text>
          </View>
          <Switch
            accessibilityLabel="Notificaciones"
            accessibilityState={{ disabled: true }}
            disabled
            value={false}
            trackColor={{ true: colores.primario }}
          />
        </View>
        <View style={[estilos.preferencia, estilos.sinLinea]}>
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>Aviso de privacidad</Text>
            <Text style={estilos.detalle}>
              {consentimiento
                ? `Aceptado el ${formatearFechaLarga(consentimiento.otorgadoEn, consultorio.zonaHoraria)}`
                : 'Sin aviso de privacidad registrado'}
            </Text>
          </View>
        </View>
      </Tarjeta>

      <View style={estilos.cerrar}>
        <Boton titulo="Cerrar sesión" variante="peligro" onPress={() => cerrarSesion()} />
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textos: { flex: 1 },
  nombre: { fontFamily: fuentes.negrita, fontSize: 17, color: colores.texto },
  nombreNutriologo: { fontFamily: fuentes.negrita, fontSize: tamanos.cuerpo, color: colores.texto },
  suave: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.textoSuave,
    marginTop: 2,
  },
  llamar: { marginTop: 12 },
  preferencias: { paddingVertical: 2 },
  preferencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  sinLinea: { borderBottomWidth: 0 },
  titulo: { fontFamily: fuentes.negrita, fontSize: tamanos.cuerpo, color: colores.texto },
  detalle: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.pequeno,
    color: colores.textoSuave,
    marginTop: 2,
  },
  cerrar: { marginTop: 8 },
});
