// Las fechas llegan del servidor en UTC (instantes) o como día sin hora (LocalDate) y se muestran en la zona
// horaria del consultorio, en español, nunca en la del teléfono.
const LOCALE = 'es-MX';

function partes(fecha: Date, zona: string, opciones: Intl.DateTimeFormatOptions) {
  const formato = new Intl.DateTimeFormat(LOCALE, { timeZone: zona, ...opciones });
  return Object.fromEntries(formato.formatToParts(fecha).map(({ type, value }) => [type, value]));
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** «2027-03-15» → un instante a mediodía UTC, que cae en ese mismo día en cualquier zona. */
function deDiaSinHora(dia: string): Date {
  return new Date(`${dia}T12:00:00Z`);
}

/** Día sin hora «2027-03-15» → «Lunes 15 de marzo». */
export function formatearDia(dia: string): string {
  const { weekday, day, month } = partes(deDiaSinHora(dia), 'UTC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return mayuscula(`${weekday} ${day} de ${month}`);
}

/** Instante → «Jueves 18 de marzo · 10:00» en la zona del consultorio. */
export function formatearDiaYHora(instante: string, zona: string): string {
  const fecha = new Date(instante);
  const { weekday, day, month } = partes(fecha, zona, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const { hour, minute } = partes(fecha, zona, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  // Algunos motores escriben la medianoche como «24».
  return `${mayuscula(`${weekday} ${day} de ${month}`)} · ${hour === '24' ? '00' : hour}:${minute}`;
}

/** Instante → «15 de febrero de 2027» en la zona del consultorio. */
export function formatearFechaLarga(instante: string, zona: string): string {
  const { day, month, year } = partes(new Date(instante), zona, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${day} de ${month} de ${year}`;
}

/** Día sin hora → «hoy», «ayer» o «el 22 de febrero», según el «hoy» del consultorio. */
export function describirDia(dia: string, hoy: string): string {
  const milisegundosPorDia = 86_400_000;
  const diferencia = Math.round(
    (deDiaSinHora(hoy).getTime() - deDiaSinHora(dia).getTime()) / milisegundosPorDia,
  );
  if (diferencia === 0) return 'hoy';
  if (diferencia === 1) return 'ayer';
  const { day, month } = partes(deDiaSinHora(dia), 'UTC', { day: 'numeric', month: 'long' });
  return `el ${day} de ${month}`;
}

/** 1600 → «1,600»; sin depender de los datos de idioma del motor de JavaScript. */
export function formatearMiles(numero: number): string {
  return Math.round(numero)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
