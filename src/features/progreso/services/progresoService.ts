import { httpClient } from '@/api/httpClient';

import { Progreso, Rango, RegistroPeso } from '../types';

export const progresoService = {
  async obtener(rango: Rango): Promise<Progreso> {
    const { data } = await httpClient.get<Progreso>('/api/paciente/progreso', {
      params: { rango },
    });
    return data;
  },

  async guardar(fecha: string, registro: RegistroPeso): Promise<void> {
    await httpClient.put(`/api/paciente/registros/${fecha}`, registro);
  },

  async borrar(fecha: string): Promise<void> {
    await httpClient.delete(`/api/paciente/registros/${fecha}`);
  },
};
