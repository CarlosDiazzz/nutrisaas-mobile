import { useQuery } from '@tanstack/react-query';

import { inicioService } from '../services/inicioService';

export const INICIO_KEY = ['paciente', 'inicio'] as const;

export function useInicio() {
  return useQuery({ queryKey: INICIO_KEY, queryFn: inicioService.obtener });
}
