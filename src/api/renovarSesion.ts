import axios, { isAxiosError } from 'axios';

import { borrarTokens, guardarTokens, TokensMovil } from '@/auth/sesion';
import { obtenerTokenRenovacion } from '@/auth/tokenStorage';
import { env } from '@/config/env';

const TIMEOUT_MS = 15000;
const HTTP_NO_AUTORIZADO = 401;
export const RUTA_RENOVACION = '/api/auth/movil/refresh';

// Cliente sin interceptores: renovar no debe disparar otra renovación si también recibe un 401.
// Se exporta para que las pruebas le pongan un adaptador falso.
// eslint-disable-next-line import/no-named-as-default-member
export const clienteSinSesion = axios.create({ baseURL: env.apiUrl, timeout: TIMEOUT_MS });

let renovacionEnCurso: Promise<boolean> | null = null;

/**
 * Cambia el token de renovación por tokens nuevos. Si varias peticiones reciben un 401 a la vez, todas
 * comparten la misma renovación: el servidor rota el token en cada uso y una segunda renovación con el
 * token ya usado cerraría toda la sesión.
 * @returns `true` si la sesión quedó renovada; `false` si no hay sesión que renovar o el servidor la rechazó.
 */
export function renovarSesion(): Promise<boolean> {
  renovacionEnCurso ??= ejecutarRenovacion().finally(() => {
    renovacionEnCurso = null;
  });
  return renovacionEnCurso;
}

async function ejecutarRenovacion(): Promise<boolean> {
  const tokenRenovacion = await obtenerTokenRenovacion();
  if (!tokenRenovacion) return false;
  try {
    const { data } = await clienteSinSesion.post<TokensMovil>(RUTA_RENOVACION, {
      refreshToken: tokenRenovacion,
    });
    await guardarTokens(data);
    return true;
  } catch (error) {
    // Un rechazo del servidor invalida la sesión; sin conexión se conserva para reintentar después.
    if (isAxiosError(error) && error.response?.status === HTTP_NO_AUTORIZADO) {
      await borrarTokens();
    }
    return false;
  }
}
