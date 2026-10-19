import { z } from 'zod';

const LONGITUD_CODIGO = 8;
const MINIMO_CONTRASENA = 10;
const MAXIMO_CONTRASENA = 100;

/** Deja solo letras y números en mayúsculas y lo muestra como XXXX-XXXX mientras se escribe. */
export function formatearCodigo(escrito: string): string {
  const limpio = escrito
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, LONGITUD_CODIGO);
  return limpio.length > 4 ? `${limpio.slice(0, 4)}-${limpio.slice(4)}` : limpio;
}

export const activarSchema = z
  .object({
    email: z.string().trim().min(1, 'El correo es obligatorio').email('Escribe un correo válido'),
    codigo: z.string().refine((valor) => valor.replace('-', '').length === LONGITUD_CODIGO, {
      message: 'El código tiene 8 caracteres',
    }),
    password: z
      .string()
      .min(MINIMO_CONTRASENA, `La contraseña debe tener al menos ${MINIMO_CONTRASENA} caracteres`)
      .max(MAXIMO_CONTRASENA, `La contraseña no puede pasar de ${MAXIMO_CONTRASENA} caracteres`),
    confirmacion: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((datos) => datos.password === datos.confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmacion'],
  });

export type ActivarFormValues = z.infer<typeof activarSchema>;
