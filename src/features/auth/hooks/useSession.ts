import { useContext } from 'react';

import { SessionContext } from '../components/SessionProvider';

export function useSession() {
  const sesion = useContext(SessionContext);
  if (!sesion) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return sesion;
}
