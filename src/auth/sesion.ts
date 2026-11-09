import { fijarTokenAcceso } from './sesionEnMemoria';
import { eliminarTokenRenovacion, guardarTokenRenovacion } from './tokenStorage';

/** Respuesta de /api/auth/movil/{activar,login,refresh}. `expiraEn` son segundos de vigencia del acceso. */
export interface TokensMovil {
  accessToken: string;
  refreshToken: string;
  expiraEn: number;
}

export async function guardarTokens(tokens: TokensMovil): Promise<void> {
  fijarTokenAcceso(tokens.accessToken);
  await guardarTokenRenovacion(tokens.refreshToken);
}

export async function borrarTokens(): Promise<void> {
  fijarTokenAcceso(null);
  await eliminarTokenRenovacion();
}
