import {
  describirDia,
  formatearDia,
  formatearDiaYHora,
  formatearFechaLarga,
  formatearMiles,
} from './fechas';

const ZONA = 'America/Mexico_City';

describe('fechas', () => {
  it('formatea un día sin hora con su día de la semana', () => {
    expect(formatearDia('2027-03-15')).toBe('Lunes 15 de marzo');
  });

  it('formatea un instante en la zona del consultorio, no en la del teléfono', () => {
    expect(formatearDiaYHora('2027-03-18T16:00:00Z', ZONA)).toBe('Jueves 18 de marzo · 10:00');
    expect(formatearDiaYHora('2027-03-18T16:00:00Z', 'Asia/Tokyo')).toBe(
      'Viernes 19 de marzo · 01:00',
    );
  });

  it('una hora cercana a la medianoche cambia de día según la zona', () => {
    expect(formatearDiaYHora('2027-03-10T03:00:00Z', ZONA)).toBe('Martes 9 de marzo · 21:00');
  });

  it('formatea una fecha larga en la zona del consultorio', () => {
    expect(formatearFechaLarga('2027-02-15T16:00:00Z', ZONA)).toBe('15 de febrero de 2027');
    expect(formatearFechaLarga('2027-02-16T03:00:00Z', ZONA)).toBe('15 de febrero de 2027');
  });

  it('describe un día respecto de hoy', () => {
    expect(describirDia('2027-03-15', '2027-03-15')).toBe('hoy');
    expect(describirDia('2027-03-14', '2027-03-15')).toBe('ayer');
    expect(describirDia('2027-02-22', '2027-03-15')).toBe('el 22 de febrero');
  });

  it('separa los miles con coma', () => {
    expect(formatearMiles(1600)).toBe('1,600');
    expect(formatearMiles(440)).toBe('440');
    expect(formatearMiles(117.5)).toBe('118');
    expect(formatearMiles(12000)).toBe('12,000');
  });

  it('un mes por cada nombre: no depende de los nombres de Intl (Hermes los entrega mal)', () => {
    const esperados = [
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
    esperados.forEach((mes, indice) => {
      const dia = `2027-${String(indice + 1).padStart(2, '0')}-10`;
      expect(formatearDia(dia).toLowerCase()).toContain(` 10 de ${mes}`);
    });
  });

  it('la medianoche se escribe 00:00 aunque el motor la entregue como 24', () => {
    expect(formatearDiaYHora('2027-03-16T06:00:00Z', ZONA)).toBe('Martes 16 de marzo · 00:00');
  });
});
