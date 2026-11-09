import { fireEvent, render, screen } from '@testing-library/react-native';

import Boton from './Boton';

describe('Boton', () => {
  it('llama a onPress al tocarlo', async () => {
    const alTocar = jest.fn();
    await render(<Boton titulo="Iniciar sesión" onPress={alTocar} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('no responde mientras carga ni cuando está deshabilitado', async () => {
    const alTocar = jest.fn();
    const { rerender } = await render(<Boton titulo="Guardar" onPress={alTocar} cargando />);
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    await rerender(<Boton titulo="Guardar" onPress={alTocar} deshabilitado />);
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(alTocar).not.toHaveBeenCalled();
  });

  it('indica en su estado de accesibilidad que está ocupado', async () => {
    await render(<Boton titulo="Guardar" onPress={() => {}} cargando />);

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeBusy();
  });

  it('mide al menos 44 pt de alto, también en su versión compacta', async () => {
    const { rerender } = await render(<Boton titulo="Normal" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Normal' })).toHaveStyle({ minHeight: 50 });
    await rerender(<Boton titulo="Compacto" onPress={() => {}} compacto />);

    expect(screen.getByRole('button', { name: 'Compacto' })).toHaveStyle({ minHeight: 44 });
  });
});
