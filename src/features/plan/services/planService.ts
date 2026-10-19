import { httpClient } from '@/api/httpClient';

import { PlanResponse } from '../types';

export const planService = {
  async obtener(): Promise<PlanResponse> {
    const { data } = await httpClient.get<PlanResponse>('/api/paciente/plan');
    return data;
  },
};
