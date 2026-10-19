import { notificacionesService } from '../services/notificacionesService';

import * as preferencia from './preferenciaPush';
import * as nativo from './pushNativo';
import { quitarEsteDispositivo, registrarEsteDispositivo } from './registroPush';

jest.mock('./pushNativo');
jest.mock('./preferenciaPush');
jest.mock('../services/notificacionesService', () => ({
  notificacionesService: { registrarDispositivo: jest.fn(), quitarDispositivo: jest.fn() },
}));

const pushNativo = jest.mocked(nativo);
const preferenciaPush = jest.mocked(preferencia);
const servicio = jest.mocked(notificacionesService);

describe('registrarEsteDispositivo', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    pushNativo.soportePush.mockReturnValue('si');
    pushNativo.leerPermiso.mockResolvedValue('concedido');
    pushNativo.idDelProyecto.mockReturnValue('proyecto-123');
    pushNativo.plataforma.mockReturnValue('ANDROID');
    pushNativo.obtenerTokenDeExpo.mockResolvedValue('ExponentPushToken[abc]');
    servicio.registrarDispositivo.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('con permiso registra el token con el projectId y lo guarda junto con la preferencia', async () => {
    expect(await registrarEsteDispositivo(false)).toBe('registrado');

    expect(pushNativo.obtenerTokenDeExpo).toHaveBeenCalledWith('proyecto-123');
    expect(servicio.registrarDispositivo).toHaveBeenCalledWith('ExponentPushToken[abc]', 'ANDROID');
    expect(preferenciaPush.guardarToken).toHaveBeenCalledWith('ExponentPushToken[abc]');
    expect(preferenciaPush.fijarPreferencia).toHaveBeenCalledWith('activado');
  });

  it('pide el permiso solo si aún no se ha preguntado y se permite preguntar', async () => {
    pushNativo.leerPermiso.mockResolvedValue('sinPreguntar');
    pushNativo.pedirPermiso.mockResolvedValue('concedido');

    expect(await registrarEsteDispositivo(true)).toBe('registrado');
    expect(pushNativo.pedirPermiso).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    pushNativo.leerPermiso.mockResolvedValue('sinPreguntar');
    expect(await registrarEsteDispositivo(false)).toBe('sinPermiso');
    expect(pushNativo.pedirPermiso).not.toHaveBeenCalled();
  });

  it('con el permiso denegado no registra nada y recuerda que está apagado', async () => {
    pushNativo.leerPermiso.mockResolvedValue('sinPreguntar');
    pushNativo.pedirPermiso.mockResolvedValue('denegado');

    expect(await registrarEsteDispositivo(true)).toBe('sinPermiso');

    expect(preferenciaPush.fijarPreferencia).toHaveBeenCalledWith('desactivado');
    expect(servicio.registrarDispositivo).not.toHaveBeenCalled();
  });

  it('en Expo Go de Android o en un simulador no hace nada', async () => {
    pushNativo.soportePush.mockReturnValue('expoGoAndroid');

    expect(await registrarEsteDispositivo(true)).toBe('noSoportado');

    expect(pushNativo.leerPermiso).not.toHaveBeenCalled();
    expect(servicio.registrarDispositivo).not.toHaveBeenCalled();
  });

  it('sin proyecto de EAS no intenta pedir el token', async () => {
    pushNativo.idDelProyecto.mockReturnValue(null);

    expect(await registrarEsteDispositivo(true)).toBe('sinProyecto');

    expect(pushNativo.obtenerTokenDeExpo).not.toHaveBeenCalled();
  });

  it('si el token falla una vez lo reintenta y registra', async () => {
    pushNativo.obtenerTokenDeExpo
      .mockRejectedValueOnce(new Error('sin red'))
      .mockResolvedValueOnce('ExponentPushToken[abc]');

    const resultado = registrarEsteDispositivo(false);
    await jest.advanceTimersByTimeAsync(2000);

    expect(await resultado).toBe('registrado');
    expect(pushNativo.obtenerTokenDeExpo).toHaveBeenCalledTimes(2);
  });

  it('si el token falla las dos veces devuelve error sin lanzar excepción ni registrar', async () => {
    pushNativo.obtenerTokenDeExpo.mockRejectedValue(new Error('sin red'));

    const resultado = registrarEsteDispositivo(false);
    await jest.advanceTimersByTimeAsync(2000);

    expect(await resultado).toBe('error');
    expect(servicio.registrarDispositivo).not.toHaveBeenCalled();
    expect(preferenciaPush.fijarPreferencia).not.toHaveBeenCalled();
  });

  it('si el servidor rechaza el registro devuelve error y no guarda el token', async () => {
    servicio.registrarDispositivo.mockRejectedValue(new Error('500'));

    expect(await registrarEsteDispositivo(false)).toBe('error');

    expect(preferenciaPush.guardarToken).not.toHaveBeenCalled();
  });
});

describe('quitarEsteDispositivo', () => {
  beforeEach(() => jest.resetAllMocks());

  it('quita el token del servidor y lo olvida', async () => {
    preferenciaPush.obtenerTokenGuardado.mockResolvedValue('ExponentPushToken[abc]');
    servicio.quitarDispositivo.mockResolvedValue();

    await quitarEsteDispositivo();

    expect(servicio.quitarDispositivo).toHaveBeenCalledWith('ExponentPushToken[abc]');
    expect(preferenciaPush.borrarTokenGuardado).toHaveBeenCalled();
  });

  it('sin token guardado no llama al servidor', async () => {
    preferenciaPush.obtenerTokenGuardado.mockResolvedValue(null);

    await quitarEsteDispositivo();

    expect(servicio.quitarDispositivo).not.toHaveBeenCalled();
  });

  it('si el servidor falla igual olvida el token local y propaga el error', async () => {
    preferenciaPush.obtenerTokenGuardado.mockResolvedValue('ExponentPushToken[abc]');
    servicio.quitarDispositivo.mockRejectedValue(new Error('sin red'));

    await expect(quitarEsteDispositivo()).rejects.toThrow('sin red');

    expect(preferenciaPush.borrarTokenGuardado).toHaveBeenCalled();
  });
});
