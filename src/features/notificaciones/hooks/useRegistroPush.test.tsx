import { render, waitFor } from '@testing-library/react-native';

import { ejecutarAntesDeCerrarSesion } from '@/auth/ganchosDeSesion';

import * as preferencia from '../push/preferenciaPush';
import * as registro from '../push/registroPush';

import { useRegistroPush } from './useRegistroPush';

jest.mock('../push/preferenciaPush');
jest.mock('../push/registroPush');

const preferenciaPush = jest.mocked(preferencia);
const registroPush = jest.mocked(registro);

function Sonda() {
  useRegistroPush();
  return null;
}

describe('useRegistroPush', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    registroPush.registrarEsteDispositivo.mockResolvedValue('registrado');
    registroPush.quitarEsteDispositivo.mockResolvedValue();
  });

  it('en el primer inicio de sesión (sin preferencia) registra el teléfono pidiendo el permiso', async () => {
    preferenciaPush.obtenerPreferencia.mockResolvedValue(null);

    await render(<Sonda />);

    await waitFor(() => expect(registroPush.registrarEsteDispositivo).toHaveBeenCalledWith(true));
  });

  it('en los inicios siguientes renueva el registro sin volver a pedir el permiso', async () => {
    preferenciaPush.obtenerPreferencia.mockResolvedValue('activado');

    await render(<Sonda />);

    await waitFor(() => expect(registroPush.registrarEsteDispositivo).toHaveBeenCalledWith(false));
  });

  it('si el paciente apagó las notificaciones no registra nada', async () => {
    preferenciaPush.obtenerPreferencia.mockResolvedValue('desactivado');

    await render(<Sonda />);
    await new Promise<void>((resolver) => setImmediate(() => resolver()));

    expect(registroPush.registrarEsteDispositivo).not.toHaveBeenCalled();
  });

  it('al cerrar la sesión quita el dispositivo antes de que se cierre', async () => {
    preferenciaPush.obtenerPreferencia.mockResolvedValue('activado');
    await render(<Sonda />);

    await ejecutarAntesDeCerrarSesion();

    expect(registroPush.quitarEsteDispositivo).toHaveBeenCalledTimes(1);
  });

  it('al desmontarse (ya sin sesión) retira su tarea previa al cierre', async () => {
    preferenciaPush.obtenerPreferencia.mockResolvedValue('activado');
    const vista = await render(<Sonda />);
    await vista.unmount();

    await ejecutarAntesDeCerrarSesion();

    expect(registroPush.quitarEsteDispositivo).not.toHaveBeenCalled();
  });
});
