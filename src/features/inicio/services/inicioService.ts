import { httpClient } from '@/api/httpClient';

import { Inicio } from '../types';

export const inicioService = {
  async obtener(): Promise<Inicio> {
    const { data } = await httpClient.get<Inicio>('/api/paciente/inicio');
    return data;
  },
};
