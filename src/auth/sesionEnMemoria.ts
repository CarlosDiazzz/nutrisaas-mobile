// Token de acceso: dura 15 minutos y nunca se escribe en disco; al cerrar la app se renueva con el de renovación.
let tokenAcceso: string | null = null;

export function obtenerTokenAcceso(): string | null {
  return tokenAcceso;
}

export function fijarTokenAcceso(token: string | null): void {
  tokenAcceso = token;
}
