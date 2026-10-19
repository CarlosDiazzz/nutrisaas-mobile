import { httpClient } from '@/api/httpClient';

import { Yo } from '../types/paciente';

export const pacienteService = {
  async obtenerYo(): Promise<Yo> {
    const { data } = await httpClient.get<Yo>('/api/paciente/yo');
    return data;
  },
};
