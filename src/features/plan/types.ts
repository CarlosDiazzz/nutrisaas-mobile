import { TiempoComida } from '@/components/ui/FilaTiempoComida';

export interface AvisoAlergia {
  sustancia: string;
  tipo: 'ALERGIA' | 'INTOLERANCIA';
}

export interface AlimentoDelPlan {
  nombre: string;
  /** Cantidad ya multiplicada por los equivalentes, en fracciones legibles: «½ taza». */
  porcion: string;
  avisos: AvisoAlergia[];
}

export interface TiempoDelMenu {
  tiempoComida: TiempoComida;
  nombre: string;
  kcal: number;
  alimentos: AlimentoDelPlan[];
}

export interface DiaDelPlan {
  /** 1 (lunes) a 7 (domingo). */
  diaSemana: number;
  tiempos: TiempoDelMenu[];
}

export interface EquivalenteDelTiempo {
  subgrupo: string;
  grupo: string;
  equivalentes: number;
}

export interface TiempoDeEquivalentes {
  tiempoComida: TiempoComida;
  nombre: string;
  kcal: number;
  subgrupos: EquivalenteDelTiempo[];
}

export interface Plan {
  id: number;
  nombre: string;
  kcalObjetivo: number;
  proteinaPct: number;
  lipidosPct: number;
  hidratosPct: number;
  vigenteDesde: string;
  vigenteHasta: string | null;
  /** Siempre 7 días; uno sin alimentos trae `tiempos` vacío. */
  dias: DiaDelPlan[];
  equivalentes: TiempoDeEquivalentes[];
}

/** Respuesta de GET /api/paciente/plan: `plan` es nulo sin un plan vigente. */
export interface PlanResponse {
  plan: Plan | null;
}
