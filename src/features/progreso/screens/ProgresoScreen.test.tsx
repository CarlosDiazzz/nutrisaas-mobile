import { fireEvent, screen } from '@testing-library/react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion } from '@/auth/tokenStorage';
import { Yo } from '@/shared/types/paciente';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { Progreso, Punto, Rango } from '../types';

import ProgresoScreen, { subtituloDeRango } from './ProgresoScreen';

let mockDatosGrafica: { value: number }[] = [];
jest.mock('react-native-gifted-charts', () => ({
  LineChart: (props: { data: { value: number }[] }) => {
    mockDatosGrafica = props.data;
    return null;
  },
}));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
}));

const YO: Yo = {
  paciente: {
    id: 15,
    nombre: 'Ana',
    nombreCompleto: 'Ana López Ruiz',
    email: 'ana.lopez@correo.mx',
  },
  nutriologo: { nombreCompleto: 'Laura Méndez Torres' },
  consultorio: {
    nombre: 'NutriSalud',
    telefono: null,
    direccion: null,
    zonaHoraria: 'America/Mexico_City',
  },
  consentimiento: null,
};

const punto = (
  fecha: string,
  pesoKg: number,
  origen: Punto['origen'],
  extra: Partial<Punto> = {},
): Punto => ({
  fecha,
  pesoKg,
  cinturaCm: null,
  notas: null,
  origen,
  oculto: false,
  ...extra,
});

// La serie de Ana (valores de prueba): 12 puntos, 3 de consulta y 9 propios.
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
  punto('2027-03-15', 67.3, 'PACIENTE', { cinturaCm: 78 }),
];

const respuesta = (rango: Rango, puntos: Punto[], cambioKg: number): Progreso => ({
  rango,
  desde: null,
  resumen: puntos.length
    ? {
        inicioKg: puntos[0].pesoKg,
        actualKg: puntos[puntos.length - 1].pesoKg,
        cambioKg,
        puntos: puntos.length,
      }
    : null,
  puntos,
});

function servidor(porRango: Partial<Record<Rango, Progreso>>) {
  const llamadas = crearAdaptadorFalso((peticion) => {
    if (peticion.url === '/api/paciente/yo') return { status: 200, data: YO };
    const rango = peticion.params?.rango as Rango;
    return { status: 200, data: porRango[rango] ?? respuesta(rango, [], 0) };
  });
  httpClient.defaults.adapter = llamadas.adaptador;
  return llamadas;
}

const COMPLETO = {
  TRIMESTRE: respuesta('TRIMESTRE', SERIE, -5.1),
  TODO: respuesta('TODO', SERIE, -5.1),
  MES: respuesta('MES', SERIE.slice(8), -1.2),
};

describe('ProgresoScreen', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    mockDatosGrafica = [];
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2027-03-15T16:00:00Z').getTime());
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  it('abre en 3 meses con las tres estadísticas, la gráfica de 12 puntos y el subtítulo del rango', async () => {
    servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);

    expect(await screen.findByText('Peso de diciembre a marzo')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: '3 meses' })).toBeSelected();
    expect(screen.getByLabelText('Inicio: 72.4 kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Actual: 67.3 kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Cambio: −5.1 kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Gráfica de peso con 12 puntos')).toBeOnTheScreen();
    expect(mockDatosGrafica).toHaveLength(12);
  });

  it('el cambio a la baja va en verde', async () => {
    servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);

    expect(await screen.findByText('−5.1 kg')).toHaveStyle({ color: '#1e6b47' });
  });

  it('al cambiar de rango pide ese rango y actualiza estadísticas y gráfica', async () => {
    const llamadas = servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);
    await screen.findByLabelText('Cambio: −5.1 kg');

    await fireEvent.press(screen.getByRole('tab', { name: '1 mes' }));

    expect(await screen.findByLabelText('Cambio: −1.2 kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Inicio: 68.5 kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Gráfica de peso con 4 puntos')).toBeOnTheScreen();
    expect(llamadas.peticiones.some((p) => p.params?.rango === 'MES')).toBe(true);
  });

  it('lista solo los registros propios, del más reciente al más antiguo, con «Hoy» y la cintura', async () => {
    servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);

    const hoy = await screen.findByRole('button', {
      name: 'Registro de 67.3 kilos, Lunes 15 de marzo',
    });
    expect(hoy).toBeOnTheScreen();
    expect(screen.getByText('Lunes 15 de marzo · cintura 78.0 cm')).toBeOnTheScreen();
    expect(screen.getByText('Hoy')).toBeOnTheScreen();
    expect(screen.getByText('Lunes 8 de marzo')).toBeOnTheScreen();
    // Las consultas del nutriólogo no son registros propios.
    expect(screen.queryByRole('button', { name: /68.5 kilos/ })).not.toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: /^Registro de/ })).toHaveLength(9);
  });

  it('tocar un registro abre la hoja con sus valores para actualizarlo', async () => {
    servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Registro de 67.6 kilos, Lunes 8 de marzo' }),
    );

    expect(await screen.findByText('Registrar mi peso')).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Actualizar registro' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('67.6');
  });

  it('«+ Registrar» abre la hoja en hoy', async () => {
    servidor(COMPLETO);
    await renderizarConSesion(<ProgresoScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Registrar peso' }));

    expect(await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo')).toBeOnTheScreen();
  });

  it('sin registros muestra el estado vacío y la lista vacía', async () => {
    servidor({});
    await renderizarConSesion(<ProgresoScreen />);

    expect(await screen.findByText('Aún no hay registros')).toBeOnTheScreen();
    expect(screen.getByText('Aún no tienes registros propios.')).toBeOnTheScreen();
    expect(screen.getByText('Registra tu peso para ver tu avance')).toBeOnTheScreen();
  });

  it('un error del servidor se muestra con «Reintentar»', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso((peticion) =>
      peticion.url === '/api/paciente/yo'
        ? { status: 200, data: YO }
        : problema(500, 'Algo salió mal.'),
    ).adaptador;
    await renderizarConSesion(<ProgresoScreen />);

    expect(await screen.findByText('Algo salió mal.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });

  it('mientras carga muestra esqueletos', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => new Promise(() => {})).adaptador;
    await renderizarConSesion(<ProgresoScreen />);

    expect(screen.getAllByLabelText('Cargando').length).toBeGreaterThan(0);
  });
});

describe('subtituloDeRango', () => {
  it('nombra el primer y el último mes, o uno solo', () => {
    expect(subtituloDeRango(SERIE)).toBe('Peso de diciembre a marzo');
    expect(subtituloDeRango(SERIE.slice(-2))).toBe('Peso de marzo');
    expect(subtituloDeRango([])).toBe('Registra tu peso para ver tu avance');
  });
});
