import { notificacionesService } from '../services/notificacionesService';

import {
  borrarTokenGuardado,
  fijarPreferencia,
  guardarToken,
  obtenerTokenGuardado,
} from './preferenciaPush';
import {
  idDelProyecto,
  leerPermiso,
  obtenerTokenDeExpo,
  pedirPermiso,
  plataforma,
  soportePush,
} from './pushNativo';

export type ResultadoRegistro =
  'registrado' | 'sinPermiso' | 'noSoportado' | 'sinProyecto' | 'error';

const ESPERA_ANTES_DE_REINTENTAR_MS = 1500;
const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/** El token de Expo necesita red: se intenta dos veces antes de rendirse (se reintenta en el siguiente inicio). */
async function obtenerTokenConReintento(projectId: string): Promise<string> {
  try {
    return await obtenerTokenDeExpo(projectId);
  } catch {
    await esperar(ESPERA_ANTES_DE_REINTENTAR_MS);
    return obtenerTokenDeExpo(projectId);
  }
}

/**
 * Registra este teléfono para recibir push: permiso (si aún no se pidió y se permite), token con el proyecto de
 * EAS y alta en el servidor. Nunca lanza: el resultado dice qué pasó.
 * @param pedirPermisoSiHaceFalta pedir el permiso si el sistema aún no lo ha preguntado
 */
export async function registrarEsteDispositivo(
  pedirPermisoSiHaceFalta: boolean,
): Promise<ResultadoRegistro> {
  if (soportePush() !== 'si') return 'noSoportado';
  let permiso = await leerPermiso();
  if (permiso === 'sinPreguntar' && pedirPermisoSiHaceFalta) {
    permiso = await pedirPermiso();
  }
  if (permiso !== 'concedido') {
    await fijarPreferencia('desactivado');
    return 'sinPermiso';
  }
  const projectId = idDelProyecto();
  if (!projectId) return 'sinProyecto';
  try {
    const token = await obtenerTokenConReintento(projectId);
    await notificacionesService.registrarDispositivo(token, plataforma());
    await guardarToken(token);
    await fijarPreferencia('activado');
    return 'registrado';
  } catch {
    return 'error';
  }
}

/** Quita este teléfono del servidor y olvida su token. Si el servidor no responde, igual se olvida el token local. */
export async function quitarEsteDispositivo(): Promise<void> {
  const token = await obtenerTokenGuardado();
  if (!token) return;
  try {
    await notificacionesService.quitarDispositivo(token);
  } finally {
    await borrarTokenGuardado();
  }
}
