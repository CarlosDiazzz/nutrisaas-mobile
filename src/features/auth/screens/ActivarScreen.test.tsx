import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { eliminarTokenRenovacion, obtenerTokenRenovacion } from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { formatearCodigo } from '../schemas/activarSchema';

import ActivarScreen from './ActivarScreen';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: mockBack }) }));

const TOKENS = { accessToken: 'acceso-1', refreshToken: 'renovacion-1', expiraEn: 900 };

interface Datos {
  codigo?: string;
  password?: string;
  confirmacion?: string;
}

async function llenar({
  codigo = 'k7qm4xtp',
  password = 'una-contrasena-larga',
  confirmacion,
}: Datos = {}) {
  const confirmada = confirmacion ?? password;
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'ana.lopez@correo.mx');
  await fireEvent.changeText(screen.getByLabelText('Código de invitación'), codigo);
  await fireEvent.changeText(screen.getByLabelText('Crea una contraseña'), password);
  await fireEvent.changeText(screen.getByLabelText('Confirma la contraseña'), confirmada);
}

describe('formatearCodigo', () => {
  it('pasa a mayúsculas, quita lo que no es letra o número y agrega el guion', () => {
    expect(formatearCodigo('k7qm4xtp')).toBe('K7QM-4XTP');
    expect(formatearCodigo('k7qm-4xtp')).toBe('K7QM-4XTP');
    expect(formatearCodigo(' k7q ')).toBe('K7Q');
    expect(formatearCodigo('k7qm4xtp99')).toBe('K7QM-4XTP');
  });
});

describe('ActivarScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  it('el código escrito en minúsculas se muestra como XXXX-XXXX', async () => {
    await renderizarConSesion(<ActivarScreen />);

    await fireEvent.changeText(screen.getByLabelText('Código de invitación'), 'k7qm4xtp');

    expect(screen.getByLabelText('Código de invitación').props.value).toBe('K7QM-4XTP');
  });

  it('activa la cuenta con el código en minúsculas y abre la sesión', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await renderizarConSesion(<ActivarScreen />);

    await llenar();
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    await waitFor(() => expect(llamadas.peticiones).toHaveLength(1));
    expect(llamadas.peticiones[0].url).toBe('/api/auth/movil/activar');
    expect(JSON.parse(llamadas.peticiones[0].data)).toEqual({
      email: 'ana.lopez@correo.mx',
      codigo: 'K7QM-4XTP',
      password: 'una-contrasena-larga',
    });
    await waitFor(async () => expect(await obtenerTokenRenovacion()).toBe('renovacion-1'));
  });

  it('exige al menos 10 caracteres en la contraseña', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await renderizarConSesion(<ActivarScreen />);

    await llenar({ password: 'corta' });
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 10 caracteres'),
    ).toBeOnTheScreen();
    expect(llamadas.peticiones).toHaveLength(0);
  });

  it('exige que las dos contraseñas coincidan', async () => {
    const llamadas = crearAdaptadorFalso(() => ({ status: 200, data: TOKENS }));
    httpClient.defaults.adapter = llamadas.adaptador;
    await renderizarConSesion(<ActivarScreen />);

    await llenar({ confirmacion: 'otra-contrasena-larga' });
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeOnTheScreen();
    expect(llamadas.peticiones).toHaveLength(0);
  });

  it('exige un código de 8 caracteres', async () => {
    await renderizarConSesion(<ActivarScreen />);

    await llenar({ codigo: 'k7qm' });
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('El código tiene 8 caracteres')).toBeOnTheScreen();
  });

  it('un código inválido muestra el mensaje único del servidor', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(400, 'El código no es válido o ya venció.', 'Solicitud inválida'),
    ).adaptador;
    await renderizarConSesion(<ActivarScreen />);

    await llenar();
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(await screen.findByText('El código no es válido o ya venció.')).toBeOnTheScreen();
    expect(await obtenerTokenRenovacion()).toBeNull();
  });

  it('demasiados intentos muestra el mensaje del límite', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(
        429,
        'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
        'Demasiados intentos',
      ),
    ).adaptador;
    await renderizarConSesion(<ActivarScreen />);

    await llenar();
    await fireEvent.press(screen.getByRole('button', { name: 'Activar cuenta' }));

    expect(
      await screen.findByText('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'),
    ).toBeOnTheScreen();
  });

  it('la flecha regresa a la pantalla anterior', async () => {
    await renderizarConSesion(<ActivarScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(mockBack).toHaveBeenCalled();
  });
});
