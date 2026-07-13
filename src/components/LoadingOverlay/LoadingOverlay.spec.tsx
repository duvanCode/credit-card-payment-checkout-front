import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('no renderiza nada cuando visible es false', () => {
    const screen = render(<LoadingOverlay visible={false} />);
    expect(screen.toJSON()).toBeNull();
  });

  it('renderiza mensaje por defecto', () => {
    const screen = render(<LoadingOverlay visible />);
    expect(screen.getByText('Procesando pago...')).toBeTruthy();
  });

  it('renderiza mensaje personalizado', () => {
    const screen = render(<LoadingOverlay visible message="Cargando..." />);
    expect(screen.getByText('Cargando...')).toBeTruthy();
  });
});
