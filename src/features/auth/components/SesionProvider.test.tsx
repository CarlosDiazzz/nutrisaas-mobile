import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { obtenerTokenAcceso } from '@/auth/sesionEnMemoria';
import {
  eliminarTokenRenovacion,
  guardarTokenRenovacion,
  obtenerTokenRenovacion,
} from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema, sinConexion } from '@/test/adaptadorFalso';

import { useSesion } from '../hooks/useSesion';

import { SesionProvider } from './SesionProvider';

const TOKENS = { accessToken: 'acceso-1', refreshToken: 'renovacion-1', expiraEn: 900 };
const CREDENCIALES = { email: 'ana.lopez@correo.mx', password: 'Ana-nutrisaas-2027' };

let sesion: ReturnType<typeof useSesion>;
function Sonda() {
  const actual = useSesion();
  useEffect(() => {
    sesion = actual;
  });
  return <Text>{actual.cargando ? 'cargando' : actual.estaAutenticado ? 'dentro' : 'fuera'}</Text>;
}

async function montar() {
  await render(
    <QueryClientProvider client={new QueryClient()}>
      <SesionProvider>
        <Sonda />
      </SesionProvider>
    </QueryClientProvider>,
  );
}

describe('SesionProvider', () => {
  beforeEach(async () => {
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: TOKENS,
    })).adaptador;
  });

  it('sin token guardado abre sin sesión y sin pedir nada al servidor', async () => {
    const renovacion = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    clienteSinSesion.defaults.adapter = renovacion.adaptador;

    await montar();

    expect(await screen.findByText('fuera')).toBeOnTheScreen();
    expect(renovacion.peticiones).toHaveLength(0);
  });

  it('con token guardado intenta renovar al abrir y entra si el servidor acepta', async () => {
    await guardarTokenRenovacion('renovacion-0');

    await montar();

    expect(await screen.findByText('dentro')).toBeOnTheScreen();
    expect(obtenerTokenAcceso()).toBe('acceso-1');
  });

  it('con un token rechazado abre sin sesión y borra el token', async () => {
    await guardarTokenRenovacion('renovacion-0');
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;

    await montar();

    expect(await screen.findByText('fuera')).toBeOnTheScreen();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('iniciarSesion guarda los tokens y deja la sesión abierta', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await montar();
    await screen.findByText('fuera');

    await act(() => sesion.iniciarSesion(CREDENCIALES));

    expect(await screen.findByText('dentro')).toBeOnTheScreen();
    expect(llamadas.peticiones[0].url).toBe('/api/auth/movil/login');
    expect(JSON.parse(llamadas.peticiones[0].data)).toEqual(CREDENCIALES);
    expect(await obtenerTokenRenovacion()).toBe('renovacion-1');
  });

  it('un inicio de sesión rechazado deja el error del servidor y no abre la sesión', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Correo o contraseña incorrectos.'),
    ).adaptador;
    await montar();
    await screen.findByText('fuera');

    await expect(act(() => sesion.iniciarSesion(CREDENCIALES))).rejects.toMatchObject({
      status: 401,
      message: 'Correo o contraseña incorrectos.',
    });

    expect(screen.getByText('fuera')).toBeOnTheScreen();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('activarCuenta manda el código tal como se escribió y abre la sesión', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await montar();
    await screen.findByText('fuera');

    await act(() =>
      sesion.activarCuenta({
        email: CREDENCIALES.email,
        codigo: 'k7qm-4xtp',
        password: 'una-contrasena-larga',
      }),
    );

    expect(await screen.findByText('dentro')).toBeOnTheScreen();
    expect(llamadas.peticiones[0].url).toBe('/api/auth/movil/activar');
    expect(JSON.parse(llamadas.peticiones[0].data).codigo).toBe('k7qm-4xtp');
  });

  it('cerrarSesion avisa al servidor, borra los tokens y vuelve a fuera', async () => {
    await guardarTokenRenovacion('renovacion-0');
    const llamadas = crearAdaptadorFalso(() => ({ status: 204 }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await montar();
    await screen.findByText('dentro');

    await act(() => sesion.cerrarSesion());

    expect(await screen.findByText('fuera')).toBeOnTheScreen();
    expect(llamadas.peticiones[0].url).toBe('/api/auth/movil/logout');
    expect(JSON.parse(llamadas.peticiones[0].data)).toEqual({ refreshToken: 'renovacion-1' });
    expect(obtenerTokenAcceso()).toBeNull();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('cerrarSesion funciona aunque no haya conexión', async () => {
    await guardarTokenRenovacion('renovacion-0');
    await montar();
    await screen.findByText('dentro');
    httpClient.defaults.adapter = crearAdaptadorFalso(sinConexion).adaptador;

    await act(() => sesion.cerrarSesion());

    await waitFor(() => expect(screen.getByText('fuera')).toBeOnTheScreen());
    expect(await obtenerTokenRenovacion()).toBeNull();
  });
});
