import { render, screen } from '@testing-library/react-native';

import GraficaPeso, { datosDeLaGrafica, puntosVisibles } from './GraficaPeso';
import { Punto } from '../types';

let datosRecibidos: { value: number }[] = [];
jest.mock('react-native-gifted-charts', () => ({
  LineChart: (props: { data: { value: number }[] }) => {
    datosRecibidos = props.data;
    return null;
  },
}));

const punto = (fecha: string, pesoKg: number, origen: Punto['origen'], oculto = false): Punto => ({
  fecha,
  pesoKg,
  cinturaCm: null,
  notas: null,
  origen,
  oculto,
});

// La serie de Ana (valores de prueba del Sprint 3): 3 consultas y 9 registros propios.
const SERIE: Punto[] = [
  punto('2026-12-14', 72.4, 'CONSULTA'),
  punto('2026-12-22', 72.0, 'PACIENTE'),
  punto('2027-01-05', 71.2, 'PACIENTE'),
  punto('2027-01-12', 70.6, 'PACIENTE'),
  punto('2027-01-18', 70.1, 'CONSULTA'),
  punto('2027-01-25', 69.8, 'PACIENTE'),
  punto('2027-02-01', 69.4, 'PACIENTE'),
  punto('2027-02-08', 69.0, 'PACIENTE'),
  punto('2027-02-15', 68.5, 'CONSULTA'),
  punto('2027-02-22', 68.2, 'PACIENTE'),
  punto('2027-03-08', 67.6, 'PACIENTE'),
  punto('2027-03-15', 67.3, 'PACIENTE'),
];

describe('GraficaPeso', () => {
  beforeEach(() => {
    datosRecibidos = [];
  });

  it('dibuja los 12 puntos de la serie de Ana, en orden', async () => {
    await render(<GraficaPeso puntos={SERIE} />);

    expect(datosRecibidos).toHaveLength(12);
    expect(datosRecibidos.map((d) => d.value)).toEqual(SERIE.map((p) => p.pesoKg));
    expect(screen.getByLabelText('Gráfica de peso con 12 puntos')).toBeOnTheScreen();
  });

  it('un registro oculto (reemplazado por una consulta del mismo día) no se dibuja', async () => {
    const conOculto = [...SERIE, punto('2027-02-15', 68.7, 'PACIENTE', true)];

    await render(<GraficaPeso puntos={conOculto} />);

    expect(puntosVisibles(conOculto)).toHaveLength(12);
    expect(datosRecibidos).toHaveLength(12);
  });

  it('las consultas y los registros del paciente llevan puntos de distinto tamaño y color', () => {
    const [consulta, registro] = datosDeLaGrafica([
      punto('2027-02-15', 68.5, 'CONSULTA'),
      punto('2027-02-22', 68.2, 'PACIENTE'),
    ]);

    const circuloConsulta = consulta.customDataPoint().props.style;
    const circuloRegistro = registro.customDataPoint().props.style;
    expect(circuloConsulta).toMatchObject({ width: 10, height: 10, backgroundColor: '#183d2e' });
    expect(circuloRegistro).toMatchObject({ width: 7, height: 7, backgroundColor: '#5bc28f' });
  });

  it('muestra la leyenda de los dos tipos de punto', async () => {
    await render(<GraficaPeso puntos={SERIE} />);

    expect(screen.getByText('En consulta')).toBeOnTheScreen();
    expect(screen.getByText('Tu registro')).toBeOnTheScreen();
  });
});
