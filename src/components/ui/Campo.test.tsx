import { fireEvent, render, screen } from '@testing-library/react-native';

import Campo from './Campo';

describe('Campo', () => {
  it('se identifica por su etiqueta y entrega lo escrito', async () => {
    const alCambiar = jest.fn();
    await render(<Campo etiqueta="Correo electrónico" onChangeText={alCambiar} />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'ana@correo.mx');

    expect(alCambiar).toHaveBeenCalledWith('ana@correo.mx');
  });

  it('muestra la ayuda y la reemplaza por el error', async () => {
    const { rerender } = await render(
      <Campo etiqueta="Contraseña" ayuda="Mínimo 10 caracteres." />,
    );
    expect(screen.getByText('Mínimo 10 caracteres.')).toBeOnTheScreen();

    await rerender(
      <Campo etiqueta="Contraseña" ayuda="Mínimo 10 caracteres." error="Es obligatoria" />,
    );

    expect(screen.queryByText('Mínimo 10 caracteres.')).not.toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent('Es obligatoria');
  });

  it('al enfocar dibuja un borde de 2 pt', async () => {
    await render(<Campo etiqueta="Correo" />);
    const entrada = screen.getByLabelText('Correo');
    expect(entrada).toHaveStyle({ borderWidth: 1 });

    await fireEvent(entrada, 'focus');

    expect(entrada).toHaveStyle({ borderWidth: 2 });
  });
});
