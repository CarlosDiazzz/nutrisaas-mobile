import { AlertaAlimento } from '@/components/ui/FilaAlimento';

import { AvisoAlergia } from '../types';

/** «Alergia: nuez» para una alergia y «Lactosa» para una intolerancia, como en el diseño. */
export function aAlertas(avisos: AvisoAlergia[]): AlertaAlimento[] {
  return avisos.map((aviso) => ({
    tipo: aviso.tipo,
    texto: aviso.tipo === 'ALERGIA' ? `Alergia: ${aviso.sustancia.toLowerCase()}` : aviso.sustancia,
  }));
}
