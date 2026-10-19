export type Rango = 'MES' | 'TRIMESTRE' | 'TODO';

export type Origen = 'CONSULTA' | 'PACIENTE';

export interface Punto {
  /** Día sin hora, en la zona del consultorio. */
  fecha: string;
  pesoKg: number;
  cinturaCm: number | null;
  notas: string | null;
  origen: Origen;
  /** Otro punto del mismo día (la consulta) lo reemplaza en la gráfica. */
  oculto: boolean;
}

export interface Resumen {
  inicioKg: number;
  actualKg: number;
  /** actual − inicio con un decimal; negativo si bajó. */
  cambioKg: number;
  puntos: number;
}

/** Respuesta de GET /api/paciente/progreso. */
export interface Progreso {
  rango: Rango;
  desde: string | null;
  resumen: Resumen | null;
  puntos: Punto[];
}

export interface RegistroPeso {
  pesoKg: number;
  cinturaCm: number | null;
  notas: string | null;
}
