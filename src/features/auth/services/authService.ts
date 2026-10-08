import { httpClient } from '@/api/httpClient';

import { CredencialesLogin, RespuestaLogin } from '../types';

export const authService = {
  // TODO HU-23: confirmar la ruta y el contrato del login real con el backend.
  async login(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
    const { data } = await httpClient.post<RespuestaLogin>('/api/auth/login', credenciales);
    return data;
  },
};
