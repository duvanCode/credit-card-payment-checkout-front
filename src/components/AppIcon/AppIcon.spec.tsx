import React from 'react';
import { render } from '@testing-library/react-native';
import { AppIcon } from './AppIcon';

describe('AppIcon', () => {
  it('renderiza icono de material con el nombre mapeado', () => {
    const screen = render(<AppIcon name="more_vert" />);
    expect(screen.getByText('more-vert')).toBeTruthy();
  });
});

