import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { obtenerTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion, obtenerTokenRenovacion } from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import LoginScreen from './LoginScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

const TOKENS = { accessToken: 'acceso-1', refreshToken: 'renovacion-1', expiraEn: 900 };

async function escribirYEnviar(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  it('con credenciales correctas guarda los tokens y manda el correo y la contraseña al login móvil', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await renderizarConSesion(<LoginScreen />);

    await escribirYEnviar('ana.lopez@correo.mx', 'Ana-nutrisaas-2027');

    await waitFor(() => expect(llamadas.peticiones).toHaveLength(1));
    expect(llamadas.peticiones[0].url).toBe('/api/auth/movil/login');
    expect(JSON.parse(llamadas.peticiones[0].data)).toEqual({
      email: 'ana.lopez@correo.mx',
      password: 'Ana-nutrisaas-2027',
    });
    await waitFor(async () => expect(await obtenerTokenRenovacion()).toBe('renovacion-1'));
    expect(obtenerTokenAcceso()).toBe('acceso-1');
  });

  it('con credenciales incorrectas muestra el mensaje genérico y no guarda nada', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Correo o contraseña incorrectos.'),
    ).adaptador;
    await renderizarConSesion(<LoginScreen />);

    await escribirYEnviar('ana.lopez@correo.mx', 'incorrecta');

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeOnTheScreen();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('con la cuenta de una nutrióloga muestra el mensaje 403 de la app', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(
        403,
        'Esta aplicación es para pacientes; ingresa a NutriSaaS desde la web.',
        'Acceso denegado',
      ),
    ).adaptador;
    await renderizarConSesion(<LoginScreen />);

    await escribirYEnviar('laura@nutrisalud.mx', 'una-contrasena-larga');

    expect(
      await screen.findByText(
        'Esta aplicación es para pacientes; ingresa a NutriSaaS desde la web.',
      ),
    ).toBeOnTheScreen();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('valida el correo y la contraseña antes de llamar al servidor', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await renderizarConSesion(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('El correo es obligatorio')).toBeOnTheScreen();
    expect(screen.getByText('La contraseña es obligatoria')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'no-es-correo');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Escribe un correo válido')).toBeOnTheScreen();
    expect(llamadas.peticiones).toHaveLength(0);
  });

  it('sin conexión muestra el mensaje de red', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => {
      throw Object.assign(new Error('Network Error'), { isAxiosError: true });
    }).adaptador;
    await renderizarConSesion(<LoginScreen />);

    await escribirYEnviar('ana.lopez@correo.mx', 'Ana-nutrisaas-2027');

    expect(
      await screen.findByText(/No pudimos conectar|Ocurrió un error inesperado/),
    ).toBeOnTheScreen();
  });

  it('«¿Olvidaste tu contraseña?» abre un aviso con lo que debe hacer', async () => {
    const aviso = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderizarConSesion(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));

    expect(aviso).toHaveBeenCalledWith(
      '¿Olvidaste tu contraseña?',
      'Pide a tu nutrióloga que restablezca tu acceso; te llegará un código nuevo.',
    );
  });

  it('el botón de activar lleva a la pantalla de activación', async () => {
    await renderizarConSesion(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Activar mi cuenta con un código' }));

    expect(mockPush).toHaveBeenCalledWith('/activar');
  });
});
