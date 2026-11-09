import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Plataforma } from '../types';

// Lo único que toca los módulos nativos de notificaciones: el resto del feature (y sus pruebas) no los importa.
export const CANAL_ANDROID = 'default';
const COLOR_DEL_CANAL = '#2E7D5B';

export type EstadoPermiso = 'concedido' | 'denegado' | 'sinPreguntar';
export type SoportePush = 'si' | 'sinDispositivo' | 'expoGoAndroid';

/** Con la app abierta la notificación también se muestra (de lo contrario el sistema la oculta). */
export function configurarManejador(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Expo Go ya no recibe push en Android (SDK 53); hace falta una development build. */
export function soportePush(): SoportePush {
  if (!Device.isDevice) return 'sinDispositivo';
  const enExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  return enExpoGo && Platform.OS === 'android' ? 'expoGoAndroid' : 'si';
}

export const plataforma = (): Plataforma => (Platform.OS === 'ios' ? 'IOS' : 'ANDROID');

/** En Android 13+ el permiso solo se puede pedir si ya existe un canal: se crea antes de cualquier otra cosa. */
async function crearCanalDeAndroid(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
    name: 'Avisos',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: COLOR_DEL_CANAL,
  });
}

function aEstado(respuesta: Notifications.NotificationPermissionsStatus): EstadoPermiso {
  if (respuesta.granted) return 'concedido';
  return respuesta.canAskAgain && respuesta.status === Notifications.PermissionStatus.UNDETERMINED
    ? 'sinPreguntar'
    : 'denegado';
}

export async function leerPermiso(): Promise<EstadoPermiso> {
  return aEstado(await Notifications.getPermissionsAsync());
}

export async function pedirPermiso(): Promise<EstadoPermiso> {
  await crearCanalDeAndroid();
  return aEstado(await Notifications.requestPermissionsAsync());
}

/** Identificador del proyecto de EAS (`extra.eas.projectId`); nulo si todavía no se creó con `eas init`. */
export function idDelProyecto(): string | null {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

/** @throws si no hay red o Expo no entrega el token */
export async function obtenerTokenDeExpo(projectId: string): Promise<string> {
  await crearCanalDeAndroid();
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export type RespuestaDeNotificacion = Notifications.NotificationResponse;

export const alTocarNotificacion = (escuchador: (respuesta: RespuestaDeNotificacion) => void) =>
  Notifications.addNotificationResponseReceivedListener(escuchador);

export const ultimaRespuesta = () => Notifications.getLastNotificationResponseAsync();
