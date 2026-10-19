import { httpClient } from '@/api/httpClient';
import { TokensMovil } from '@/auth/sesion';

import { CredencialesLogin, DatosActivacion } from '../types';

export const authService = {
  async login(credenciales: CredencialesLogin): Promise<TokensMovil> {
    const { data } = await httpClient.post<TokensMovil>('/api/auth/movil/login', credenciales);
    return data;
  },

  async activar(datos: DatosActivacion): Promise<TokensMovil> {
    const { data } = await httpClient.post<TokensMovil>('/api/auth/movil/activar', datos);
    return data;
  },

  async cerrarSesion(tokenRenovacion: string): Promise<void> {
    await httpClient.post('/api/auth/movil/logout', { refreshToken: tokenRenovacion });
  },
};
