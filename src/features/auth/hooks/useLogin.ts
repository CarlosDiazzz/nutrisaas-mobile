import { useMutation } from '@tanstack/react-query';

import { useSesion } from './useSesion';

export function useLogin() {
  const { iniciarSesion } = useSesion();
  return useMutation({ mutationFn: iniciarSesion });
}
