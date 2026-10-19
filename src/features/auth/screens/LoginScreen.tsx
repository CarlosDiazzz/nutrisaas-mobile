import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Boton, Pantalla } from '@/components/ui';
import { colores, fuentes, tamanos } from '@/theme';

import LoginForm from '../components/LoginForm';
import Logo from '../components/Logo';
import { useLogin } from '../hooks/useLogin';

const TITULO_OLVIDE = '¿Olvidaste tu contraseña?';
const MENSAJE_OLVIDE =
  'Pide a tu nutrióloga que restablezca tu acceso; te llegará un código nuevo.';

export default function LoginScreen() {
  const router = useRouter();
  const login = useLogin();

  return (
    <Pantalla>
      <View style={estilos.marca}>
        <Logo />
        <Text accessibilityRole="header" style={estilos.titulo}>
          NutriSaaS
        </Text>
        <Text style={estilos.subtitulo}>Tu plan de alimentación, siempre contigo</Text>
      </View>
      <LoginForm
        onSubmit={(credenciales) => login.mutate(credenciales)}
        cargando={login.isPending}
        errorMensaje={login.error?.message}
      />
      <Boton
        titulo={TITULO_OLVIDE}
        variante="texto"
        onPress={() => Alert.alert(TITULO_OLVIDE, MENSAJE_OLVIDE)}
      />
      <View style={estilos.separador} />
      <Text style={estilos.invitacion}>¿Tu nutrióloga te envió una invitación?</Text>
      <View style={estilos.activar}>
        <Boton
          titulo="Activar mi cuenta con un código"
          variante="secundario"
          onPress={() => router.push('/activar')}
        />
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  marca: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  titulo: {
    fontFamily: fuentes.negrita,
    fontSize: tamanos.titulo,
    color: colores.texto,
    marginTop: 14,
  },
  subtitulo: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.textoSuave,
    marginTop: 6,
    textAlign: 'center',
  },
  separador: { borderTopWidth: 1, borderTopColor: colores.borde, marginTop: 22, marginBottom: 18 },
  invitacion: {
    fontFamily: fuentes.normal,
    fontSize: tamanos.subtitulo,
    color: colores.textoSuave,
    textAlign: 'center',
  },
  activar: { marginTop: 10 },
});
