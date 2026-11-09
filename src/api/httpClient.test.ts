import { fijarTokenAcceso, obtenerTokenAcceso } from '@/auth/sesionEnMemoria';
import { guardarTokenRenovacion, obtenerTokenRenovacion } from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema, sinConexion } from '@/test/adaptadorFalso';

import { ApiError, httpClient, registrarManejadorDeSesion } from './httpClient';
import { clienteSinSesion } from './renovarSesion';

const TOKENS_NUEVOS = { accessToken: 'acceso-2', refreshToken: 'renovacion-2', expiraEn: 900 };

describe('httpClient', () => {
  const alExpirar = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    fijarTokenAcceso('acceso-1');
    await guardarTokenRenovacion('renovacion-1');
    registrarManejadorDeSesion({ alExpirar });
  });

  it('agrega el token de acceso en memoria a cada petición', async () => {
    const { adaptador, peticiones } = crearAdaptadorFalso(() => ({
      status: 200,
      data: { ok: true },
    }));
    httpClient.defaults.adapter = adaptador;

    await httpClient.get('/api/paciente/yo');

    expect(peticiones[0].headers.Authorization).toBe('Bearer acceso-1');
  });

  it('ante un 401 renueva una sola vez con el token guardado y repite la petición', async () => {
    const intentos: string[] = [];
    const { adaptador } = crearAdaptadorFalso((peticion) => {
      intentos.push(String(peticion.headers.Authorization));
      return intentos.length === 1 ? { status: 401 } : { status: 200, data: { nombre: 'Ana' } };
    });
    httpClient.defaults.adapter = adaptador;
    const renovacion = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS_NUEVOS }));
    clienteSinSesion.defaults.adapter = renovacion.adaptador;

    const { data } = await httpClient.get('/api/paciente/yo');

    expect(data).toEqual({ nombre: 'Ana' });
    expect(intentos).toEqual(['Bearer acceso-1', 'Bearer acceso-2']);
    expect(renovacion.peticiones).toHaveLength(1);
    expect(JSON.parse(renovacion.peticiones[0].data)).toEqual({ refreshToken: 'renovacion-1' });
    expect(obtenerTokenAcceso()).toBe('acceso-2');
    expect(await obtenerTokenRenovacion()).toBe('renovacion-2');
    expect(alExpirar).not.toHaveBeenCalled();
  });

  it('varias peticiones con 401 a la vez comparten una sola renovación', async () => {
    const { adaptador } = crearAdaptadorFalso((peticion) =>
      peticion.headers.Authorization === 'Bearer acceso-2'
        ? { status: 200, data: {} }
        : { status: 401 },
    );
    httpClient.defaults.adapter = adaptador;
    const renovacion = crearAdaptadorFalso(async () => {
      await new Promise((resolver) => setTimeout(resolver, 20));
      return { status: 200, data: TOKENS_NUEVOS };
    });
    clienteSinSesion.defaults.adapter = renovacion.adaptador;

    await Promise.all([
      httpClient.get('/api/paciente/yo'),
      httpClient.get('/api/paciente/inicio'),
      httpClient.get('/api/paciente/plan'),
    ]);

    expect(renovacion.peticiones).toHaveLength(1);
  });

  it('si la renovación es rechazada cierra la sesión y devuelve el error', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'No autenticado'),
    ).adaptador;
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Tu sesión expiró. Inicia sesión de nuevo.'),
    ).adaptador;

    await expect(httpClient.get('/api/paciente/yo')).rejects.toMatchObject({ status: 401 });

    expect(alExpirar).toHaveBeenCalledTimes(1);
    expect(obtenerTokenAcceso()).toBeNull();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('sin conexión durante la renovación conserva el token de renovación', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => ({ status: 401 })).adaptador;
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(sinConexion).adaptador;

    await expect(httpClient.get('/api/paciente/yo')).rejects.toBeInstanceOf(ApiError);

    expect(await obtenerTokenRenovacion()).toBe('renovacion-1');
  });

  it('no repite una petición dos veces aunque el segundo intento también dé 401', async () => {
    const { adaptador, peticiones } = crearAdaptadorFalso(() => ({ status: 401 }));
    httpClient.defaults.adapter = adaptador;
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: TOKENS_NUEVOS,
    })).adaptador;

    await expect(httpClient.get('/api/paciente/yo')).rejects.toMatchObject({ status: 401 });

    expect(peticiones).toHaveLength(2);
  });

  it('un 401 del inicio de sesión son credenciales incorrectas: no renueva y muestra el mensaje del servidor', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Correo o contraseña incorrectos.', 'No autenticado'),
    ).adaptador;
    const renovacion = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS_NUEVOS }));
    clienteSinSesion.defaults.adapter = renovacion.adaptador;

    await expect(httpClient.post('/api/auth/movil/login', {})).rejects.toMatchObject({
      status: 401,
      message: 'Correo o contraseña incorrectos.',
    });

    expect(renovacion.peticiones).toHaveLength(0);
    expect(alExpirar).not.toHaveBeenCalled();
  });

  it('convierte un ProblemDetail en un error con el mensaje del servidor', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(
        403,
        'Esta aplicación es para pacientes; ingresa a NutriSaaS desde la web.',
        'Acceso denegado',
      ),
    ).adaptador;

    const error = await httpClient.get('/api/paciente/yo').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 403,
      titulo: 'Acceso denegado',
      message: 'Esta aplicación es para pacientes; ingresa a NutriSaaS desde la web.',
    });
  });

  it('sin conexión responde con el mensaje de red y estado 0', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(sinConexion).adaptador;

    await expect(httpClient.get('/api/paciente/yo')).rejects.toMatchObject({
      status: 0,
      message: 'No pudimos conectar con el servidor. Revisa tu conexión.',
    });
  });

  it('un error sin detalle usa el mensaje genérico', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => ({ status: 500 })).adaptador;

    await expect(httpClient.get('/api/paciente/yo')).rejects.toMatchObject({
      status: 500,
      message: 'Ocurrió un error inesperado. Intenta de nuevo más tarde.',
    });
  });
});
