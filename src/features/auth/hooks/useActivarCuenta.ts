import { useMutation } from '@tanstack/react-query';

import { useSesion } from './useSesion';

export function useActivarCuenta() {
  const { activarCuenta } = useSesion();
  return useMutation({ mutationFn: activarCuenta });
}
