// Las fechas llegan del servidor en UTC (instantes) o como día sin hora (LocalDate) y se muestran en la zona
// horaria del consultorio, en español, nunca en la del teléfono.
//
// Hermes (el motor de JavaScript del teléfono) no entrega los nombres de mes y de día de `Intl` de forma
// confiable (un mes llegó como «undefined»). Por eso `Intl` solo se usa para los números de la fecha en la
// zona del consultorio y los nombres en español salen de estas tablas.
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const MILISEGUNDOS_POR_DIA = 86_400_000;

interface Componentes {
  anio: number;
  /** 1 a 12. */
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
}

/** Año, mes, día, hora y minuto del instante en la zona dada. */
function componentes(fecha: Date, zona: string): Componentes {
  const formato = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });
  const partes = Object.fromEntries(
    formato.formatToParts(fecha).map(({ type, value }) => [type, Number(value)]),
  );
  return {
    anio: partes.year,
    mes: partes.month,
    dia: partes.day,
    // Algunos motores escriben la medianoche como 24.
    hora: partes.hour === 24 ? 0 : partes.hour,
    minuto: partes.minute,
  };
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
const dosDigitos = (numero: number) => numero.toString().padStart(2, '0');

function nombreDelDia({ anio, mes, dia }: Componentes): string {
  return DIAS[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];
}

/** «2027-03-15» → sus componentes (no depende de ninguna zona). */
function deDiaSinHora(dia: string): Componentes {
  const [anio, mes, diaDelMes] = dia.split('-').map(Number);
  return { anio, mes, dia: diaDelMes, hora: 0, minuto: 0 };
}

/** Día sin hora «2027-03-15» → «Lunes 15 de marzo». */
export function formatearDia(dia: string): string {
  const c = deDiaSinHora(dia);
  return mayuscula(`${nombreDelDia(c)} ${c.dia} de ${MESES[c.mes - 1]}`);
}

/** Instante → «Jueves 18 de marzo · 10:00» en la zona del consultorio. */
export function formatearDiaYHora(instante: string, zona: string): string {
  const c = componentes(new Date(instante), zona);
  return `${mayuscula(`${nombreDelDia(c)} ${c.dia} de ${MESES[c.mes - 1]}`)} · ${dosDigitos(c.hora)}:${dosDigitos(c.minuto)}`;
}

/** Instante → «15 de febrero de 2027» en la zona del consultorio. */
export function formatearFechaLarga(instante: string, zona: string): string {
  const c = componentes(new Date(instante), zona);
  return `${c.dia} de ${MESES[c.mes - 1]} de ${c.anio}`;
}

/** Día sin hora → «hoy», «ayer» o «el 22 de febrero», según el «hoy» del consultorio. */
export function describirDia(dia: string, hoy: string): string {
  const a = deDiaSinHora(dia);
  const b = deDiaSinHora(hoy);
  const diferencia = Math.round(
    (Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(a.anio, a.mes - 1, a.dia)) /
      MILISEGUNDOS_POR_DIA,
  );
  if (diferencia === 0) return 'hoy';
  if (diferencia === 1) return 'ayer';
  return `el ${a.dia} de ${MESES[a.mes - 1]}`;
}

/** 1600 → «1,600»; sin depender de los datos de idioma del motor de JavaScript. */
export function formatearMiles(numero: number): string {
  return Math.round(numero)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** El día de hoy en la zona del consultorio, como «2027-03-15». */
export function hoyEnZona(zona: string, ahora: Date = new Date(Date.now())): string {
  const c = componentes(ahora, zona);
  return `${c.anio}-${dosDigitos(c.mes)}-${dosDigitos(c.dia)}`;
}

/** Suma (o resta) días a un día sin hora: «2027-03-15» + 3 → «2027-03-18». */
export function sumarDias(dia: string, dias: number): string {
  const c = deDiaSinHora(dia);
  const fecha = new Date(Date.UTC(c.anio, c.mes - 1, c.dia + dias));
  return `${fecha.getUTCFullYear()}-${dosDigitos(fecha.getUTCMonth() + 1)}-${dosDigitos(fecha.getUTCDate())}`;
}

/** 1 (lunes) a 7 (domingo) del día sin hora. */
export function diaDeLaSemana(dia: string): number {
  const c = deDiaSinHora(dia);
  const dow = new Date(Date.UTC(c.anio, c.mes - 1, c.dia)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

/** Día sin hora «2026-12-14» → «diciembre». */
export function nombreDelMes(dia: string): string {
  return MESES[deDiaSinHora(dia).mes - 1];
}

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
const MILISEGUNDOS_POR_MINUTO = 60_000;
const MINUTOS_POR_HORA = 60;
const HORAS_POR_DIA = 24;

/** «Hace 2 h», «Hace 5 min», «Ayer» o «16 feb» (en la zona del consultorio) según cuánto haya pasado. */
export function formatearHace(instante: string, ahora: Date, zona: string): string {
  const minutos = Math.floor(
    (ahora.getTime() - new Date(instante).getTime()) / MILISEGUNDOS_POR_MINUTO,
  );
  if (minutos < 1) return 'Justo ahora';
  if (minutos < MINUTOS_POR_HORA) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / MINUTOS_POR_HORA);
  if (horas < HORAS_POR_DIA) return `Hace ${horas} h`;
  const c = componentes(new Date(instante), zona);
  const hoy = componentes(ahora, zona);
  const ayer = sumarDias(`${hoy.anio}-${dosDigitos(hoy.mes)}-${dosDigitos(hoy.dia)}`, -1);
  if (ayer === `${c.anio}-${dosDigitos(c.mes)}-${dosDigitos(c.dia)}`) return 'Ayer';
  return `${c.dia} ${MESES_CORTOS[c.mes - 1]}`;
}
