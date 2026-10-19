import { httpClient } from '@/api/httpClient';

import { Notificacion, PaginaDeNotificaciones, Plataforma } from '../types';

export const notificacionesService = {
  async listar(pagina: number): Promise<PaginaDeNotificaciones> {
    const { data } = await httpClient.get<PaginaDeNotificaciones>('/api/paciente/notificaciones', {
      params: { page: pagina, size: 20 },
    });
    return data;
  },

  async marcarLeida(id: number): Promise<Notificacion> {
    const { data } = await httpClient.patch<Notificacion>(
      `/api/paciente/notificaciones/${id}/leida`,
    );
    return data;
  },

  async marcarTodasLeidas(): Promise<void> {
    await httpClient.post('/api/paciente/notificaciones/leer-todas');
  },

  async registrarDispositivo(expoPushToken: string, plataforma: Plataforma): Promise<void> {
    await httpClient.post('/api/paciente/dispositivos', { expoPushToken, plataforma });
  },

  async quitarDispositivo(expoPushToken: string): Promise<void> {
    await httpClient.delete(`/api/paciente/dispositivos/${encodeURIComponent(expoPushToken)}`);
  },
};
