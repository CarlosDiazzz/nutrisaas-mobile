import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso, obtenerTokenAcceso } from '@/auth/sesionEnMemoria';
import {
  eliminarTokenRenovacion,
  guardarTokenRenovacion,
  obtenerTokenRenovacion,
} from '@/auth/tokenStorage';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';
import { Yo } from '@/shared/types/paciente';

import * as preferencia from '@/features/notificaciones/push/preferenciaPush';
import * as registro from '@/features/notificaciones/push/registroPush';
import * as nativo from '@/features/notificaciones/push/pushNativo';

import { iniciales } from '../components/AvatarIniciales';

import PerfilScreen, { formatearTelefono } from './PerfilScreen';

jest.mock('@/features/notificaciones/push/pushNativo');
jest.mock('@/features/notificaciones/push/preferenciaPush');
jest.mock('@/features/notificaciones/push/registroPush');

const pushNativo = jest.mocked(nativo);
const preferenciaPush = jest.mocked(preferencia);
const registroPush = jest.mocked(registro);

const YO_DE_ANA: Yo = {
  paciente: {
    id: 15,
    nombre: 'Ana',
    nombreCompleto: 'Ana López Ruiz',
    email: 'ana.lopez@correo.mx',
  },
  nutriologo: { nombreCompleto: 'Laura Méndez Torres' },
  consultorio: {
    nombre: 'NutriSalud',
    telefono: '9511002030',
    direccion: 'Calle Macedonio Alcalá 100, Centro, Oaxaca de Juárez',
    zonaHoraria: 'America/Mexico_City',
  },
  consentimiento: { version: '1.0', otorgadoEn: '2027-02-15T16:00:00Z' },
};

describe('PerfilScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    pushNativo.soportePush.mockReturnValue('si');
    preferenciaPush.obtenerPreferencia.mockResolvedValue(null);
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
    httpClient.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: YO_DE_ANA,
    })).adaptador;
  });

  it('muestra los datos de Ana, su nutrióloga y el aviso de privacidad aceptado', async () => {
    await renderizarConSesion(<PerfilScreen />);

    expect(await screen.findByText('Ana López Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('ana.lopez@correo.mx')).toBeOnTheScreen();
    // Las iniciales son decorativas: están ocultas para el lector de pantalla.
    expect(screen.getByText('AL', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('Laura Méndez Torres')).toBeOnTheScreen();
    expect(
      screen.getByText('NutriSalud · Calle Macedonio Alcalá 100, Centro, Oaxaca de Juárez'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Aceptado el 15 de febrero de 2027')).toBeOnTheScreen();
  });

  it('el botón llama al teléfono del consultorio con el formato del diseño', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderizarConSesion(<PerfilScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Llamar al 951 100 2030' }));

    expect(abrir).toHaveBeenCalledWith('tel:9511002030');
  });

  it('sin teléfono no ofrece llamar', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: {
        ...YO_DE_ANA,
        consultorio: { ...YO_DE_ANA.consultorio, telefono: null, direccion: null },
      },
    })).adaptador;
    await renderizarConSesion(<PerfilScreen />);

    expect(await screen.findByText('Ana López Ruiz')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Llamar/ })).not.toBeOnTheScreen();
    expect(screen.getByText('NutriSalud')).toBeOnTheScreen();
  });

  describe('interruptor de notificaciones', () => {
    beforeEach(() => {
      pushNativo.soportePush.mockReturnValue('si');
      preferenciaPush.obtenerPreferencia.mockResolvedValue(null);
      registroPush.registrarEsteDispositivo.mockResolvedValue('registrado');
      registroPush.quitarEsteDispositivo.mockResolvedValue();
    });

    it('arranca apagado, habilitado y con la descripción del diseño', async () => {
      await renderizarConSesion(<PerfilScreen />);

      expect(await screen.findByText('Citas, planes nuevos y recordatorios')).toBeOnTheScreen();
      const interruptor = screen.getByRole('switch', { name: 'Notificaciones' });
      expect(interruptor).toBeEnabled();
      expect(interruptor).not.toBeChecked();
    });

    it('arranca encendido si el teléfono ya estaba registrado', async () => {
      preferenciaPush.obtenerPreferencia.mockResolvedValue('activado');
      await renderizarConSesion(<PerfilScreen />);

      await waitFor(() =>
        expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeChecked(),
      );
    });

    it('encenderlo registra el teléfono (pidiendo el permiso si hace falta)', async () => {
      await renderizarConSesion(<PerfilScreen />);
      await screen.findByText('Citas, planes nuevos y recordatorios');

      await fireEvent(screen.getByRole('switch', { name: 'Notificaciones' }), 'valueChange', true);

      expect(registroPush.registrarEsteDispositivo).toHaveBeenCalledWith(true);
      await waitFor(() =>
        expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeChecked(),
      );
    });

    it('si el permiso está denegado se queda apagado y explica qué hacer', async () => {
      registroPush.registrarEsteDispositivo.mockResolvedValue('sinPermiso');
      await renderizarConSesion(<PerfilScreen />);
      await screen.findByText('Citas, planes nuevos y recordatorios');

      await fireEvent(screen.getByRole('switch', { name: 'Notificaciones' }), 'valueChange', true);

      expect(
        await screen.findByText(
          'Activa las notificaciones de NutriSaaS en los ajustes del teléfono.',
        ),
      ).toBeOnTheScreen();
      expect(screen.getByRole('switch', { name: 'Notificaciones' })).not.toBeChecked();
    });

    it('apagarlo quita el teléfono del servidor y recuerda la preferencia', async () => {
      preferenciaPush.obtenerPreferencia.mockResolvedValue('activado');
      await renderizarConSesion(<PerfilScreen />);
      await waitFor(() =>
        expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeChecked(),
      );

      await fireEvent(screen.getByRole('switch', { name: 'Notificaciones' }), 'valueChange', false);

      await waitFor(() =>
        expect(screen.getByRole('switch', { name: 'Notificaciones' })).not.toBeChecked(),
      );
      expect(registroPush.quitarEsteDispositivo).toHaveBeenCalled();
      expect(preferenciaPush.fijarPreferencia).toHaveBeenCalledWith('desactivado');
    });

    it('en Expo Go de Android está deshabilitado y lo explica', async () => {
      pushNativo.soportePush.mockReturnValue('expoGoAndroid');
      await renderizarConSesion(<PerfilScreen />);

      expect(await screen.findByText('No disponible en Expo Go de Android')).toBeOnTheScreen();
      expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeDisabled();
    });

    it('en un simulador está deshabilitado y lo explica', async () => {
      pushNativo.soportePush.mockReturnValue('sinDispositivo');
      await renderizarConSesion(<PerfilScreen />);

      expect(await screen.findByText('Disponible solo en un teléfono')).toBeOnTheScreen();
      expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeDisabled();
    });
  });

  it('sin consentimiento vigente lo indica', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: { ...YO_DE_ANA, consentimiento: null },
    })).adaptador;
    await renderizarConSesion(<PerfilScreen />);

    expect(await screen.findByText('Sin aviso de privacidad registrado')).toBeOnTheScreen();
  });

  it('cerrar sesión avisa al servidor y borra los tokens del teléfono', async () => {
    await guardarTokenRenovacion('renovacion-1');
    const llamadas = crearAdaptadorFalso((peticion) =>
      peticion.url === '/api/paciente/yo' ? { status: 200, data: YO_DE_ANA } : { status: 204 },
    );
    httpClient.defaults.adapter = llamadas.adaptador;
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() => ({
      status: 200,
      data: { accessToken: 'acceso-1', refreshToken: 'renovacion-1', expiraEn: 900 },
    })).adaptador;
    await renderizarConSesion(<PerfilScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() =>
      expect(llamadas.peticiones.some((p) => p.url === '/api/auth/movil/logout')).toBe(true),
    );
    await waitFor(async () => expect(await obtenerTokenRenovacion()).toBeNull());
    expect(obtenerTokenAcceso()).toBeNull();
  });

  it('un error del servidor se muestra con «Reintentar»', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso(() =>
      problema(500, 'Algo salió mal.'),
    ).adaptador;
    await renderizarConSesion(<PerfilScreen />);

    expect(await screen.findByText('Algo salió mal.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});

describe('formatos del perfil', () => {
  it('agrupa un teléfono de 10 dígitos y deja otros tal cual', () => {
    expect(formatearTelefono('9511002030')).toBe('951 100 2030');
    expect(formatearTelefono('5551')).toBe('5551');
  });

  it('toma la inicial del nombre y la del primer apellido', () => {
    expect(iniciales('Ana', 'Ana López Ruiz')).toBe('AL');
    expect(iniciales('María Fernanda', 'María Fernanda Cruz')).toBe('MC');
    expect(iniciales('Ana', 'Ana')).toBe('A');
  });
});
