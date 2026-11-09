// Tareas que deben correr justo antes de cerrar la sesión, mientras el token de acceso todavía sirve
// (por ejemplo, quitar el dispositivo de las notificaciones push). Cada feature registra la suya.
type Gancho = () => Promise<void>;

const ganchos = new Set<Gancho>();

/** Registra una tarea previa al cierre de sesión. Devuelve la función que la retira. */
export function registrarAntesDeCerrarSesion(gancho: Gancho): () => void {
  ganchos.add(gancho);
  return () => {
    ganchos.delete(gancho);
  };
}

/** Corre todas las tareas registradas; una que falle no impide cerrar la sesión ni a las demás. */
export async function ejecutarAntesDeCerrarSesion(): Promise<void> {
  await Promise.allSettled([...ganchos].map((gancho) => gancho()));
}
