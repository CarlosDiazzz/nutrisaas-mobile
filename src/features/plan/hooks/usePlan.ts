import { useQuery } from '@tanstack/react-query';

import { planService } from '../services/planService';

export const PLAN_KEY = ['paciente', 'plan'] as const;

export function usePlan() {
  return useQuery({ queryKey: PLAN_KEY, queryFn: planService.obtener });
}
