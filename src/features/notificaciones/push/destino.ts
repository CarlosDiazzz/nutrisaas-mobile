import { Href } from 'expo-router';

/**
 * Pantalla que abre cada tipo de notificación: cita → Inicio, plan → Mi plan, progreso → la hoja de registrar.
 * El parámetro de progreso es único en cada toque para que la hoja se abra también si ya se había abierto antes.
 */
export function destinoDeNotificacion(tipo: unknown): Href | null {
  switch (tipo) {
    case 'CITA':
      return '/';
    case 'PLAN':
      return '/plan';
    case 'PROGRESO':
      return { pathname: '/progreso', params: { registrar: String(Date.now()) } };
    default:
      return null;
  }
}
