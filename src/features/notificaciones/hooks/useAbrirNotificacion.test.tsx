import { render } from '@testing-library/react-native';

import * as nativo from '../push/pushNativo';

import { useAbrirNotificacion } from './useAbrirNotificacion';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate }) }));
jest.mock('../push/pushNativo');

const pushNativo = jest.mocked(nativo);
let escuchador: ((respuesta: nativo.RespuestaDeNotificacion) => void) | null = null;
const quitarEscuchador = jest.fn();

const respuesta = (identificador: string, data: Record<string, unknown>) =>
  ({
    notification: { request: { identifier: identificador, content: { data } } },
  }) as unknown as nativo.RespuestaDeNotificacion;

function Sonda() {
  useAbrirNotificacion();
  return null;
}

describe('useAbrirNotificacion', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    escuchador = null;
    pushNativo.ultimaRespuesta.mockResolvedValue(null);
    pushNativo.alTocarNotificacion.mockImplementation((funcion) => {
      escuchador = funcion;
      return { remove: quitarEscuchador } as never;
    });
  });

  it('tocar un aviso de cita abre el Inicio', async () => {
    await render(<Sonda />);

    escuchador?.(respuesta('a-1', { tipo: 'CITA', id: 7 }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('tocar un aviso de plan nuevo abre Mi plan', async () => {
    await render(<Sonda />);

    escuchador?.(respuesta('a-2', { tipo: 'PLAN', id: 39 }));

    expect(mockNavigate).toHaveBeenCalledWith('/plan');
  });

  it('tocar el recordatorio de peso abre Progreso con la hoja de registrar', async () => {
    await render(<Sonda />);

    escuchador?.(respuesta('a-3', { tipo: 'PROGRESO', id: '' }));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/progreso',
      params: { registrar: expect.stringMatching(/^\d+$/) },
    });
  });

  it('un tipo desconocido no navega', async () => {
    await render(<Sonda />);

    escuchador?.(respuesta('a-4', { tipo: 'OTRO' }));
    escuchador?.(respuesta('a-5', {}));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('si la app estaba cerrada atiende la notificación con la que se abrió, una sola vez', async () => {
    pushNativo.ultimaRespuesta.mockResolvedValue(respuesta('arranque-1', { tipo: 'PLAN', id: 39 }));

    const primera = await render(<Sonda />);
    await new Promise<void>((resolver) => setImmediate(() => resolver()));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/plan');
    await primera.unmount();

    // Al volver a montarse (por ejemplo, tras cerrar y abrir sesión) la misma respuesta no se repite.
    await render(<Sonda />);
    await new Promise<void>((resolver) => setImmediate(() => resolver()));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('la misma notificación tocada dos veces seguidas solo navega una vez', async () => {
    await render(<Sonda />);

    escuchador?.(respuesta('repetida', { tipo: 'CITA' }));
    escuchador?.(respuesta('repetida', { tipo: 'CITA' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('al desmontarse deja de escuchar', async () => {
    const vista = await render(<Sonda />);

    await vista.unmount();

    expect(quitarEscuchador).toHaveBeenCalled();
  });
});
