export type TipoNotificacion = 'CITA' | 'PLAN' | 'PROGRESO';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  referenciaId: number | null;
  leida: boolean;
  creadaEn: string;
}

/** Respuesta paginada de GET /api/paciente/notificaciones. */
export interface PaginaDeNotificaciones {
  contenido: Notificacion[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export type Plataforma = 'ANDROID' | 'IOS';
