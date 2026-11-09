import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion } from '@/auth/tokenStorage';
import { Yo } from '@/shared/types/paciente';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { formatearEquivalentes } from '../components/EquivalentesDelPlan';
import { Plan } from '../types';

import PlanScreen from './PlanScreen';

let mockParametros: { tiempo?: string } = {};
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockParametros }));

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

const dia = (diaSemana: number, tiempos: Plan['dias'][number]['tiempos'] = []) => ({
  diaSemana,
  tiempos,
});
const PLAN: Plan = {
  id: 39,
  nombre: 'Plan febrero 2027',
  kcalObjetivo: 1600,
  proteinaPct: 20,
  lipidosPct: 30,
  hidratosPct: 50,
  vigenteDesde: '2027-02-16',
  vigenteHasta: null,
  dias: [
    dia(1, [
      {
        tiempoComida: 'DESAYUNO',
        nombre: 'Desayuno',
        kcal: 440,
        alimentos: [
          { nombre: 'Huevo entero', porcion: '1 pieza', avisos: [] },
          { nombre: 'Tortilla de maíz', porcion: '2 piezas', avisos: [] },
          {
            nombre: 'Leche descremada',
            porcion: '1 taza',
            avisos: [{ sustancia: 'Lactosa', tipo: 'INTOLERANCIA' }],
          },
        ],
      },
      {
        tiempoComida: 'COLACION_MATUTINA',
        nombre: 'Colación matutina',
        kcal: 130,
        alimentos: [
          { nombre: 'Manzana', porcion: '1 pieza', avisos: [] },
          {
            nombre: 'Almendras',
            porcion: '10 piezas',
            avisos: [{ sustancia: 'Nuez', tipo: 'ALERGIA' }],
          },
        ],
      },
    ]),
    dia(2, [
      {
        tiempoComida: 'COMIDA',
        nombre: 'Comida',
        kcal: 550,
        alimentos: [{ nombre: 'Frijoles cocidos', porcion: '½ taza', avisos: [] }],
      },
    ]),
    dia(3),
    dia(4),
    dia(5),
    dia(6),
    dia(7),
  ],
  equivalentes: [
    {
      tiempoComida: 'DESAYUNO',
      nombre: 'Desayuno',
      kcal: 440,
      subgrupos: [
        { subgrupo: 'Verduras', grupo: 'Verduras', equivalentes: 1 },
        { subgrupo: 'Cereales sin grasa', grupo: 'Cereales y tubérculos', equivalentes: 2 },
        { subgrupo: 'Leche descremada', grupo: 'Leche', equivalentes: 0.5 },
      ],
    },
  ],
};

function responder(plan: Plan | null) {
  httpClient.defaults.adapter = crearAdaptadorFalso((peticion) =>
    peticion.url === '/api/paciente/yo'
      ? { status: 200, data: YO }
      : { status: 200, data: { plan } },
  ).adaptador;
}

describe('PlanScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParametros = {};
    // Lunes 15/03/2027 a las 10:00 en Oaxaca.
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2027-03-15T16:00:00Z').getTime());
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('abre en el día de hoy con el menú de ese día, el nombre del plan y sus kcal', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);

    expect(await screen.findByText('Plan febrero 2027 · 1,600 kcal')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Día 15' })).toBeSelected();
    expect(screen.getByText('Desayuno')).toBeOnTheScreen();
    expect(screen.getByText('440 kcal')).toBeOnTheScreen();
    expect(screen.getByText('Tortilla de maíz')).toBeOnTheScreen();
    expect(screen.getByText('2 piezas')).toBeOnTheScreen();
    expect(screen.getByText('Colación matutina')).toBeOnTheScreen();
  });

  it('muestra la semana de hoy con la letra y el número de cada día', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);
    await screen.findByText('Desayuno');

    for (const numero of [15, 16, 17, 18, 19, 20, 21]) {
      expect(screen.getByRole('button', { name: `Día ${numero}` })).toBeOnTheScreen();
    }
  });

  it('muestra las insignias de intolerancia y de alergia', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);

    expect(await screen.findByText('Lactosa')).toHaveStyle({ color: '#8a5a0b' });
    expect(screen.getByText('Alergia: nuez')).toHaveStyle({ color: '#a5281b' });
  });

  it('al cambiar de día muestra el menú de ese día', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);
    await screen.findByText('Desayuno');

    await fireEvent.press(screen.getByRole('button', { name: 'Día 16' }));

    expect(screen.getByRole('button', { name: 'Día 16' })).toBeSelected();
    expect(screen.getByText('Frijoles cocidos')).toBeOnTheScreen();
    expect(screen.getByText('½ taza')).toBeOnTheScreen();
    expect(screen.queryByText('Desayuno')).not.toBeOnTheScreen();
  });

  it('un día sin alimentos muestra su estado vacío', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);
    await screen.findByText('Desayuno');

    await fireEvent.press(screen.getByRole('button', { name: 'Día 17' }));

    expect(screen.getByText('No hay alimentos este día')).toBeOnTheScreen();
  });

  it('el control segmentado cambia a equivalentes y de vuelta al menú', async () => {
    responder(PLAN);
    await renderizarConSesion(<PlanScreen />);
    await screen.findByText('Desayuno');

    await fireEvent.press(screen.getByRole('tab', { name: 'Equivalentes' }));

    expect(screen.getByRole('tab', { name: 'Equivalentes' })).toBeSelected();
    expect(screen.getByText('Cereales sin grasa')).toBeOnTheScreen();
    expect(screen.getByLabelText('Cereales sin grasa: 2 equivalentes')).toBeOnTheScreen();
    expect(screen.getByText('½')).toBeOnTheScreen();
    expect(screen.queryByText('Tortilla de maíz')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Menú' }));
    expect(screen.getByText('Tortilla de maíz')).toBeOnTheScreen();
  });

  it('sin plan vigente muestra «Tu nutrióloga aún no activa tu plan.»', async () => {
    responder(null);
    await renderizarConSesion(<PlanScreen />);

    expect(await screen.findByText('Tu nutrióloga aún no activa tu plan.')).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: 'Menú' })).not.toBeOnTheScreen();
  });

  it('al llegar desde el Inicio con un tiempo, abre en hoy aunque antes se hubiera elegido otro día', async () => {
    responder(PLAN);
    mockParametros = { tiempo: 'COLACION_MATUTINA' };
    await renderizarConSesion(<PlanScreen />);
    await screen.findByText('Colación matutina');

    expect(screen.getByRole('button', { name: 'Día 15' })).toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Día 16' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Día 16' })).toBeSelected());
  });

  it('un error del servidor se muestra con «Reintentar»', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(500, 'Algo salió mal.'),
    ).adaptador;
    await renderizarConSesion(<PlanScreen />);

    expect(await screen.findByText('Algo salió mal.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });

  it('mientras carga muestra esqueletos', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => new Promise(() => {})).adaptador;
    await renderizarConSesion(<PlanScreen />);

    expect(screen.getAllByLabelText('Cargando').length).toBeGreaterThan(0);
  });
});

describe('formatearEquivalentes', () => {
  it('escribe enteros, medios y enteros con medio', () => {
    expect(formatearEquivalentes(2)).toBe('2');
    expect(formatearEquivalentes(0.5)).toBe('½');
    expect(formatearEquivalentes(1.5)).toBe('1 ½');
  });
});
