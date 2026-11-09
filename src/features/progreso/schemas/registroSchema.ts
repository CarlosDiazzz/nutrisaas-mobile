import { z } from 'zod';

const PESO_MAXIMO = 500;
const CINTURA_MAXIMA = 300;
const NOTAS_MAXIMAS = 255;

/** «67,3» y «67.3» son el mismo número: el teclado decimal de algunos idiomas escribe coma. */
export function aNumero(texto: string): number {
  return Number(texto.trim().replace(',', '.'));
}

const numeroOpcional = (maximo: number, nombre: string) =>
  z
    .string()
    .trim()
    .refine((valor) => valor === '' || (aNumero(valor) > 0 && aNumero(valor) <= maximo), {
      message: `${nombre} debe estar entre 0 y ${maximo}`,
    });

export const registroSchema = z.object({
  peso: z
    .string()
    .trim()
    .min(1, 'El peso es obligatorio')
    .refine((valor) => Number.isFinite(aNumero(valor)) && aNumero(valor) > 0, {
      message: 'Escribe un peso mayor a 0',
    })
    .refine((valor) => aNumero(valor) < PESO_MAXIMO, {
      message: 'El peso debe ser menor a 500 kg',
    }),
  cintura: numeroOpcional(CINTURA_MAXIMA, 'La cintura'),
  notas: z.string().max(NOTAS_MAXIMAS, 'Las notas no pueden pasar de 255 caracteres'),
});

export type RegistroFormValues = z.infer<typeof registroSchema>;

const DIAS_HACIA_ATRAS = 90;

/** Mensaje si el día no se puede registrar (futuro o de hace más de 90 días); nulo si es válido. */
export function errorDeFecha(dia: string, hoy: string, diaLimite: string): string | null {
  if (dia > hoy) return 'No puedes registrar una fecha futura.';
  if (dia < diaLimite) return `Solo puedes registrar los últimos ${DIAS_HACIA_ATRAS} días.`;
  return null;
}
