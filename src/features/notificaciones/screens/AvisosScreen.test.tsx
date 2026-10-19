import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion } from '@/auth/tokenStorage';
import { Yo } from '@/shared/types/paciente';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { Notificacion } from '../types';

import AvisosScreen from './AvisosScreen';

const mockNavigate = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate, back: mockBack }) }));

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

const aviso = (id: number, extra: Partial<Notificacion> = {}): Notificacion => ({
  id,
  tipo: 'CITA',
  titulo: `Aviso ${id}`,
  mensaje: `Mensaje ${id}`,
  referenciaId: null,
  leida: false,
  creadaEn: '2027-03-15T14:00:00Z',
  ...extra,
});

const CITA = aviso(3, {
  titulo: 'Tu cita es mañana',
  mensaje: 'Jueves 18 de marzo a las 10:00 con Laura Méndez en NutriSalud.',
  referenciaId: 7,
});
const PLAN = aviso(2, {
  tipo: 'PLAN',
  titulo: 'Tienes un plan nuevo',
  mensaje: 'Laura Méndez activó tu plan «Plan febrero 2027» desde el 16/02/2027.',
  referenciaId: 39,
  creadaEn: '2027-02-16T16:00:00Z',
});
const PROGRESO = aviso(1, {
  tipo: 'PROGRESO',
  titulo: '¿Ya te pesaste esta semana?',
  mensaje: 'Registra tu peso para que tu nutrióloga vea tu avance.',
  leida: true,
  creadaEn: '2027-03-08T15:00:00Z',
});

const pagina = (contenido: Notificacion[], numero = 0, totalPaginas = 1) => ({
  contenido,
  pagina: numero,
  tamano: 20,
  totalElementos: contenido.length,
  totalPaginas,
});

function servidor(paginas: Notificacion[][]) {
  const llamadas = crearAdaptadorFalso((peticion) => {
    if (peticion.url === '/api/paciente/yo') return { status: 200, data: YO };
    if (peticion.url === '/api/paciente/notificaciones') {
      const numero = Number(peticion.params?.page ?? 0);
      return { status: 200, data: pagina(paginas[numero] ?? [], numero, paginas.length) };
    }
    return { status: 204 };
  });
  httpClient.defaults.adapter = llamadas.adaptador;
  return llamadas;
}

describe('AvisosScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Lunes 15/03/2027 a las 16:00 UTC.
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2027-03-15T16:00:00Z').getTime());
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  afterEach(() => jest.restoreAllMocks());

  it('muestra la bandeja con título, mensaje y cuándo llegó cada aviso', async () => {
    servidor([[CITA, PLAN, PROGRESO]]);
    await renderizarConSesion(<AvisosScreen />);

    expect(await screen.findByText('Tu cita es mañana')).toBeOnTheScreen();
    expect(
      screen.getByText('Jueves 18 de marzo a las 10:00 con Laura Méndez en NutriSalud.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Hace 2 h')).toBeOnTheScreen();
    expect(screen.getByText('16 feb')).toBeOnTheScreen();
    expect(screen.getByText('8 mar')).toBeOnTheScreen();
  });

  it('los no leídos se anuncian «Sin leer» y los leídos no', async () => {
    servidor([[CITA, PROGRESO]]);
    await renderizarConSesion(<AvisosScreen />);

    expect(await screen.findByLabelText(/^Sin leer\. Tu cita es mañana/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^¿Ya te pesaste esta semana\?/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Sin leer\. ¿Ya te pesaste/)).not.toBeOnTheScreen();
  });

  it('tocar un aviso sin leer lo marca como leído y abre su pantalla', async () => {
    const llamadas = servidor([[CITA, PLAN]]);
    await renderizarConSesion(<AvisosScreen />);

    await fireEvent.press(await screen.findByLabelText(/Tienes un plan nuevo/));

    await waitFor(() =>
      expect(
        llamadas.peticiones.some(
          (p) => p.method === 'patch' && p.url === '/api/paciente/notificaciones/2/leida',
        ),
      ).toBe(true),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/plan');
  });

  it('tocar un aviso ya leído solo navega, sin volver a marcarlo', async () => {
    const llamadas = servidor([[PROGRESO]]);
    await renderizarConSesion(<AvisosScreen />);

    await fireEvent.press(await screen.findByLabelText(/¿Ya te pesaste/));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/progreso',
      params: { registrar: expect.any(String) },
    });
    expect(llamadas.peticiones.some((p) => p.method === 'patch')).toBe(false);
  });

  it('«Marcar todo como leído» llama al servidor y la bandeja se vuelve a pedir', async () => {
    const llamadas = servidor([[CITA, PLAN]]);
    await renderizarConSesion(<AvisosScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Marcar todo como leído' }));

    await waitFor(() =>
      expect(
        llamadas.peticiones.some((p) => p.url === '/api/paciente/notificaciones/leer-todas'),
      ).toBe(true),
    );
    await waitFor(() =>
      expect(
        llamadas.peticiones.filter(
          (p) => p.url === '/api/paciente/notificaciones' && p.method === 'get',
        ).length,
      ).toBeGreaterThanOrEqual(2),
    );
  });

  it('sin avisos sin leer no ofrece «Marcar todo como leído»', async () => {
    servidor([[PROGRESO]]);
    await renderizarConSesion(<AvisosScreen />);

    await screen.findByText('¿Ya te pesaste esta semana?');

    expect(screen.queryByRole('button', { name: 'Marcar todo como leído' })).not.toBeOnTheScreen();
  });

  it('la bandeja es paginada: al llegar al final pide la página siguiente', async () => {
    const llamadas = servidor([[CITA], [PLAN]]);
    await renderizarConSesion(<AvisosScreen />);
    await screen.findByText('Tu cita es mañana');
    expect(screen.queryByText('Tienes un plan nuevo')).not.toBeOnTheScreen();

    await fireEvent(screen.getByTestId('lista-de-avisos'), 'endReached');

    expect(await screen.findByText('Tienes un plan nuevo')).toBeOnTheScreen();
    expect(
      llamadas.peticiones
        .filter((p) => p.url === '/api/paciente/notificaciones')
        .map((p) => p.params?.page),
    ).toEqual([0, 1]);
  });

  it('en la última página no pide más', async () => {
    const llamadas = servidor([[CITA]]);
    await renderizarConSesion(<AvisosScreen />);
    await screen.findByText('Tu cita es mañana');

    await fireEvent(screen.getByTestId('lista-de-avisos'), 'endReached');

    expect(
      llamadas.peticiones.filter((p) => p.url === '/api/paciente/notificaciones'),
    ).toHaveLength(1);
  });

  it('sin avisos muestra el estado vacío', async () => {
    servidor([[]]);
    await renderizarConSesion(<AvisosScreen />);

    expect(await screen.findByText('No tienes avisos')).toBeOnTheScreen();
  });

  it('un error se muestra con «Reintentar»', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso((peticion) =>
      peticion.url === '/api/paciente/yo'
        ? { status: 200, data: YO }
        : problema(500, 'Algo salió mal.'),
    ).adaptador;
    await renderizarConSesion(<AvisosScreen />);

    expect(await screen.findByText('Algo salió mal.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });

  it('la flecha regresa a la pantalla anterior', async () => {
    servidor([[CITA]]);
    await renderizarConSesion(<AvisosScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Volver' }));

    expect(mockBack).toHaveBeenCalled();
  });
});
