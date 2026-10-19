import { useQuery } from '@tanstack/react-query';

import { pacienteService } from '../services/pacienteService';

export const YO_KEY = ['paciente', 'yo'] as const;

export function useYo() {
  return useQuery({ queryKey: YO_KEY, queryFn: pacienteService.obtenerYo });
}
