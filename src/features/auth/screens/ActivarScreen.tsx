import { useRouter } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Pantalla, Tarjeta } from '@/components/ui';
import { colores, fuentes, medidas, tamanos } from '@/theme';

import ActivarForm from '../components/ActivarForm';
import { useActivarCuenta } from '../hooks/useActivarCuenta';

export default function ActivarScreen() {
  const router = useRouter();
  const activar = useActivarCuenta();

  return (
    <Pantalla>
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
          Activar mi cuenta
        </Text>
      </View>
      <Tarjeta style={estilos.indicacion}>
        <View style={estilos.indicacionFila}>
          <Mail size={20} color={colores.primario} />
          <Text style={estilos.indicacionTexto}>
            Escribe el código que tu nutrióloga envió a tu correo. Vence 7 días después del envío.
          </Text>
        </View>
      </Tarjeta>
      <ActivarForm
        onSubmit={({ email, codigo, password }) => activar.mutate({ email, codigo, password })}
        cargando={activar.isPending}
        errorMensaje={activar.error?.message}
      />
      <Text style={estilos.pie}>
        Al activar tu cuenta podrás ver tu plan y registrar tu progreso.
      </Text>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12 },
  volver: {
    width: medidas.objetivoTactilMinimo,
    height: medidas.objetivoTactilMinimo,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  titulo: { fontFamily: fuentes.negrita, fontSize: tamanos.tituloSeccion, color: colores.texto },
  indicacion: { backgroundColor: colores.primarioClaro, borderColor: colores.alerta.exito.borde },
  indicacionFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  indicacionTexto: {
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    lineHeight: 19.6,
    color: colores.texto,
  },
  pie: {
    fontFamily: fuentes.normal,
    fontSize: 12.5,
    color: colores.textoSuave,
    textAlign: 'center',
    marginTop: 12,
  },
});
