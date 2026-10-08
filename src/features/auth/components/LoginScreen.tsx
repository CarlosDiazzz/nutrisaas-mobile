import { StyleSheet, Text, View } from 'react-native';

import Card from '@/shared/components/ui/Card';
import { colores, espaciado, tipografia } from '@/theme';

import { useLogin } from '../hooks/useLogin';

import LoginForm from './LoginForm';

// TODO HU-23: tras el login exitoso, la navegación a las pestañas la decide NavegadorRaiz.
export default function LoginScreen() {
  const login = useLogin();

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>NutriSaaS</Text>
      <Card>
        <LoginForm
          onSubmit={(credenciales) => login.mutate(credenciales)}
          cargando={login.isPending}
          errorMensaje={login.error?.message}
        />
      </Card>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  titulo: {
    color: colores.primario,
    fontSize: tipografia.tamanoTitulo,
    fontWeight: tipografia.pesoNegrita,
    textAlign: 'center',
  },
});
