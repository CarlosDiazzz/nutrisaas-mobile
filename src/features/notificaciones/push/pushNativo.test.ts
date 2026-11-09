import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  configurarManejador,
  idDelProyecto,
  leerPermiso,
  obtenerTokenDeExpo,
  pedirPermiso,
  plataforma,
  soportePush,
} from './pushNativo';

const notificaciones = jest.mocked(Notifications);
const dispositivo = Device as { isDevice: boolean };

// Constants define sus propiedades como accesores que no se pueden reemplazar: se sustituye el módulo.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'standalone', expoConfig: null, easConfig: null },
  ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
}));

const constantes = Constants as unknown as {
  executionEnvironment: string;
  expoConfig: { extra?: { eas?: { projectId?: string } } } | null;
  easConfig: { projectId?: string } | null;
};
const fijarConstante = <K extends keyof typeof constantes>(
  nombre: K,
  valor: (typeof constantes)[K],
) => {
  constantes[nombre] = valor;
};

describe('pushNativo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    dispositivo.isDevice = true;
    fijarConstante('executionEnvironment', ExecutionEnvironment.Standalone);
    fijarConstante('expoConfig', { extra: { eas: { projectId: 'proyecto-123' } } });
    fijarConstante('easConfig', null);
  });

  it('muestra la notificación como banner y en la lista aunque la app esté abierta', async () => {
    configurarManejador();

    const manejador = notificaciones.setNotificationHandler.mock.calls[0][0];
    expect(await manejador?.handleNotification({} as Notifications.Notification)).toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  it('en Android crea el canal «default» antes de pedir el permiso', async () => {
    const orden: string[] = [];
    notificaciones.setNotificationChannelAsync.mockImplementation(async () => {
      orden.push('canal');
      return null;
    });
    notificaciones.requestPermissionsAsync.mockImplementation(async () => {
      orden.push('permiso');
      return { granted: true, status: 'granted', canAskAgain: true } as never;
    });

    expect(await pedirPermiso()).toBe('concedido');

    expect(orden).toEqual(['canal', 'permiso']);
    expect(notificaciones.setNotificationChannelAsync).toHaveBeenCalledWith(
      'default',
      expect.objectContaining({ name: 'Avisos', importance: 4 }),
    );
  });

  it('en iOS no hay canales', async () => {
    Platform.OS = 'ios';

    await pedirPermiso();

    expect(notificaciones.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('traduce el estado del permiso: sin preguntar, concedido y denegado', async () => {
    notificaciones.getPermissionsAsync.mockResolvedValueOnce({
      granted: false,
      status: 'undetermined',
      canAskAgain: true,
    } as never);
    expect(await leerPermiso()).toBe('sinPreguntar');
    notificaciones.getPermissionsAsync.mockResolvedValueOnce({
      granted: true,
      status: 'granted',
      canAskAgain: true,
    } as never);
    expect(await leerPermiso()).toBe('concedido');
    notificaciones.getPermissionsAsync.mockResolvedValueOnce({
      granted: false,
      status: 'denied',
      canAskAgain: false,
    } as never);
    expect(await leerPermiso()).toBe('denegado');
  });

  it('el token se pide con el projectId y después de crear el canal de Android', async () => {
    const orden: string[] = [];
    notificaciones.setNotificationChannelAsync.mockImplementation(async () => {
      orden.push('canal');
      return null;
    });
    notificaciones.getExpoPushTokenAsync.mockImplementation(async () => {
      orden.push('token');
      return { data: 'ExponentPushToken[xyz]', type: 'expo' } as never;
    });

    expect(await obtenerTokenDeExpo('proyecto-123')).toBe('ExponentPushToken[xyz]');

    expect(orden).toEqual(['canal', 'token']);
    expect(notificaciones.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'proyecto-123',
    });
  });

  it('el projectId sale de extra.eas del app config, o de easConfig, o es nulo', () => {
    expect(idDelProyecto()).toBe('proyecto-123');
    fijarConstante('expoConfig', { extra: {} });
    fijarConstante('easConfig', { projectId: 'del-build' });
    expect(idDelProyecto()).toBe('del-build');
    fijarConstante('easConfig', null);
    expect(idDelProyecto()).toBeNull();
  });

  it('Expo Go en Android no recibe push; un teléfono con la development build sí', () => {
    fijarConstante('executionEnvironment', ExecutionEnvironment.StoreClient);
    expect(soportePush()).toBe('expoGoAndroid');
    fijarConstante('executionEnvironment', ExecutionEnvironment.Standalone);
    expect(soportePush()).toBe('si');
    Platform.OS = 'ios';
    fijarConstante('executionEnvironment', ExecutionEnvironment.StoreClient);
    expect(soportePush()).toBe('si');
  });

  it('un simulador o emulador sin dispositivo físico no soporta push', () => {
    dispositivo.isDevice = false;

    expect(soportePush()).toBe('sinDispositivo');
  });

  it('la plataforma sale del sistema operativo', () => {
    expect(plataforma()).toBe('ANDROID');
    Platform.OS = 'ios';
    expect(plataforma()).toBe('IOS');
  });
});
