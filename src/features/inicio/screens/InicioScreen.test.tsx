import { fireEvent, screen } from '@testing-library/react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion, guardarTokenRenovacion } from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { Inicio } from '../types';

import InicioScreen from './InicioScreen';

const mockNavigate = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate, push: mockPush }) }));

const INICIO_DE_ANA: Inicio = {
  nombre: 'Ana',
  hoy: '2027-03-15',
  zonaHoraria: 'America/Mexico_City',
  proximaCita: {
    inicio: '2027-03-18T16:00:00Z',
    fin: '2027-03-18T16:45:00Z',
    nutriologo: 'Laura Méndez',
    consultorio: 'NutriSalud',
  },
  menuHoy: {
    plan: 'Plan febrero 2027',
    kcalObjetivo: 1600,
    diaSemana: 1,
    tiempos: [
      {
        tiempoComida: 'DESAYUNO',
        nombre: 'Desayuno',
        resumen: 'Huevo entero, Jitomate y Tortilla de maíz',
        kcal: 440,
      },
      {
        tiempoComida: 'COLACION_MATUTINA',
        nombre: 'Colación matutina',
        resumen: 'Almendras y Manzana',
        kcal: 130,
      },
    ],
  },
  ultimoPeso: { pesoKg: 67.3, fecha: '2027-03-15', origen: 'PACIENTE' },
  avisosSinLeer: 0,
};

const YO = {
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

/** Sin registros: la hoja de registro también pide el historial y se queda en «Guardar registro». */
const PROGRESO_VACIO = { rango: 'TODO', puntos: [], resumen: null };

/** El servidor responde a cada ruta con lo suyo: la hoja de registro también pide /yo y el progreso. */
const datosDe = (url: string | undefined, inicio: Inicio) => {
  if (url === '/api/paciente/yo') return YO;
  if (url === '/api/paciente/progreso') return PROGRESO_VACIO;
  return inicio;
};

function responderCon(inicio: Inicio) {
  httpClient.defaults.adapter = crearAdaptadorFalso((peticion) => ({
    status: 200,
    data: datosDe(peticion.url, inicio),
  })).adaptador;
}

describe('InicioScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  it('muestra el saludo, la fecha de hoy, la próxima cita, el menú y el último peso', async () => {
    responderCon(INICIO_DE_ANA);
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Lunes 15 de marzo')).toBeOnTheScreen();
    expect(screen.getByText('Jueves 18 de marzo · 10:00')).toBeOnTheScreen();
    expect(screen.getByText('Laura Méndez · NutriSalud')).toBeOnTheScreen();
    expect(screen.getByText('1,600 kcal')).toBeOnTheScreen();
    expect(screen.getByText('Desayuno')).toBeOnTheScreen();
    expect(screen.getByText('Huevo entero, Jitomate y Tortilla de maíz')).toBeOnTheScreen();
    expect(screen.getByText('440')).toBeOnTheScreen();
    expect(screen.getByText('130')).toBeOnTheScreen();
    expect(screen.getByText('67.3 kg')).toBeOnTheScreen();
    expect(screen.getByText('· hoy')).toBeOnTheScreen();
  });

  it('muestra la hora de la cita en la zona del consultorio, no en la del teléfono', async () => {
    responderCon({ ...INICIO_DE_ANA, zonaHoraria: 'Asia/Tokyo' });
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Viernes 19 de marzo · 01:00')).toBeOnTheScreen();
  });

  it('sin próxima cita dice «Sin citas próximas»', async () => {
    responderCon({ ...INICIO_DE_ANA, proximaCita: null });
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Sin citas próximas')).toBeOnTheScreen();
    expect(screen.queryByText(/Laura Méndez/)).not.toBeOnTheScreen();
  });

  it('sin plan vigente muestra el estado vacío del menú', async () => {
    responderCon({ ...INICIO_DE_ANA, menuHoy: null });
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Tu nutrióloga aún no activa tu plan.')).toBeOnTheScreen();
  });

  it('sin pesos registrados lo dice', async () => {
    responderCon({ ...INICIO_DE_ANA, ultimoPeso: null });
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Aún no hay pesos registrados.')).toBeOnTheScreen();
  });

  it('un peso de otro día dice cuándo fue', async () => {
    responderCon({
      ...INICIO_DE_ANA,
      ultimoPeso: { pesoKg: 68.5, fecha: '2027-02-22', origen: 'CONSULTA' },
    });
    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('· el 22 de febrero')).toBeOnTheScreen();
  });

  it('tocar un tiempo de comida abre Mi plan en ese tiempo', async () => {
    responderCon(INICIO_DE_ANA);
    await renderizarConSesion(<InicioScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: /Colación matutina/ }));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/plan',
      params: { tiempo: 'COLACION_MATUTINA' },
    });
  });

  it('la campana muestra que hay avisos sin leer solo cuando los hay', async () => {
    responderCon({ ...INICIO_DE_ANA, avisosSinLeer: 2 });
    await renderizarConSesion(<InicioScreen />);
    expect(await screen.findByLabelText('Avisos, hay sin leer')).toBeOnTheScreen();
  });

  it('ante un 401 renueva la sesión una vez, repite la petición y muestra el inicio', async () => {
    await guardarTokenRenovacion('renovacion-1');
    const llamadas = crearAdaptadorFalso((peticion) =>
      peticion.headers.Authorization === 'Bearer acceso-2'
        ? { status: 200, data: datosDe(peticion.url, INICIO_DE_ANA) }
        : { status: 401 },
    );
    httpClient.defaults.adapter = llamadas.adaptador;
    const renovacion = crearAdaptadorFalso(() => ({
      status: 200,
      data: { accessToken: 'acceso-2', refreshToken: 'renovacion-2', expiraEn: 900 },
    }));
    clienteSinSesion.defaults.adapter = renovacion.adaptador;
    fijarTokenAcceso('acceso-vencido');

    await renderizarConSesion(<InicioScreen />);

    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
    expect(llamadas.peticiones.length).toBeGreaterThanOrEqual(2);
    expect(renovacion.peticiones.length).toBeGreaterThanOrEqual(1);
  });

  it('un error del servidor se muestra con «Reintentar», que vuelve a pedir el inicio', async () => {
    let intentos = 0;
    httpClient.defaults.adapter = crearAdaptadorFalso((peticion) => {
      if (peticion.url !== '/api/paciente/inicio') return { status: 200, data: YO };
      intentos += 1;
      return intentos === 1
        ? problema(500, 'Ocurrió un error inesperado. Intenta de nuevo más tarde.')
        : { status: 200, data: INICIO_DE_ANA };
    }).adaptador;
    await renderizarConSesion(<InicioScreen />);

    expect(
      await screen.findByText('Ocurrió un error inesperado. Intenta de nuevo más tarde.'),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
  });

  it('mientras carga muestra esqueletos', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => new Promise(() => {})).adaptador;
    await renderizarConSesion(<InicioScreen />);

    expect(screen.getAllByLabelText('Cargando').length).toBeGreaterThan(0);
  });

  it('tocar la campana abre la bandeja de avisos', async () => {
    responderCon({ ...INICIO_DE_ANA, avisosSinLeer: 3 });
    await renderizarConSesion(<InicioScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Avisos, hay sin leer' }));

    expect(mockPush).toHaveBeenCalledWith('/avisos');
  });

  it('«+ Registrar» abre la hoja «Registrar mi peso»', async () => {
    responderCon(INICIO_DE_ANA);
    await renderizarConSesion(<InicioScreen />);

    expect(screen.queryByText('Registrar mi peso')).not.toBeOnTheScreen();
    await fireEvent.press(await screen.findByRole('button', { name: '+ Registrar' }));

    expect(await screen.findByText('Registrar mi peso')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar registro' })).toBeOnTheScreen();
  });
});
