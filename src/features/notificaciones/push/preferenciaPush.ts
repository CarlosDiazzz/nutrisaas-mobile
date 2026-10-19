import * as SecureStore from 'expo-secure-store';

// Preferencia de este teléfono y token con el que está registrado. No son datos sensibles, pero ya existe un
// almacén cifrado en el proyecto y no se agrega otro (AsyncStorage queda prohibido).
const CLAVE_PREFERENCIA = 'nutrisaas.push.preferencia';
const CLAVE_TOKEN = 'nutrisaas.push.token';

export type PreferenciaPush = 'activado' | 'desactivado';

export async function obtenerPreferencia(): Promise<PreferenciaPush | null> {
  const valor = await SecureStore.getItemAsync(CLAVE_PREFERENCIA);
  return valor === 'activado' || valor === 'desactivado' ? valor : null;
}

export async function fijarPreferencia(preferencia: PreferenciaPush): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_PREFERENCIA, preferencia);
}

export async function obtenerTokenGuardado(): Promise<string | null> {
  return SecureStore.getItemAsync(CLAVE_TOKEN);
}

export async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_TOKEN, token);
}

export async function borrarTokenGuardado(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_TOKEN);
}
