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

import { iniciales } from '../components/AvatarIniciales';

import PerfilScreen, { formatearTelefono } from './PerfilScreen';

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

  it('el interruptor de notificaciones está deshabilitado y dice «Disponible pronto»', async () => {
    await renderizarConSesion(<PerfilScreen />);

    expect(await screen.findByText('Disponible pronto')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeDisabled();
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
