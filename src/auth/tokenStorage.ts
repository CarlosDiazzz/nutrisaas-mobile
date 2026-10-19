import * as SecureStore from 'expo-secure-store';

// El token de renovación es el único dato de sesión que se guarda en el teléfono (cifrado por el sistema).
// El token de acceso vive solo en memoria: ver sesionEnMemoria.ts.
const CLAVE_TOKEN_RENOVACION = 'nutrisaas.refreshToken';

export async function guardarTokenRenovacion(token: string): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_TOKEN_RENOVACION, token);
}

export async function obtenerTokenRenovacion(): Promise<string | null> {
  return SecureStore.getItemAsync(CLAVE_TOKEN_RENOVACION);
}

export async function eliminarTokenRenovacion(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_TOKEN_RENOVACION);
}
