/** Respuesta de GET /api/paciente/yo. */
export interface Yo {
  paciente: { id: number; nombre: string; nombreCompleto: string; email: string };
  nutriologo: { nombreCompleto: string };
  consultorio: {
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    /** Zona IANA: las fechas de la app se muestran en ella. */
    zonaHoraria: string;
  };
  consentimiento: { version: string; otorgadoEn: string } | null;
}
