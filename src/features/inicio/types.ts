import { TiempoComida } from '@/components/ui/FilaTiempoComida';

export interface ProximaCita {
  inicio: string;
  fin: string;
  nutriologo: string;
  consultorio: string;
}

export interface TiempoDeHoy {
  tiempoComida: TiempoComida;
  nombre: string;
  resumen: string;
  kcal: number;
}

export interface MenuDeHoy {
  plan: string;
  kcalObjetivo: number;
  diaSemana: number;
  tiempos: TiempoDeHoy[];
}

export interface UltimoPeso {
  pesoKg: number;
  /** Día sin hora, en la zona del consultorio. */
  fecha: string;
  origen: 'CONSULTA' | 'PACIENTE';
}

/** Respuesta de GET /api/paciente/inicio. Cada bloque es nulo cuando no hay dato. */
export interface Inicio {
  nombre: string;
  hoy: string;
  zonaHoraria: string;
  proximaCita: ProximaCita | null;
  menuHoy: MenuDeHoy | null;
  ultimoPeso: UltimoPeso | null;
  avisosSinLeer: number;
}
