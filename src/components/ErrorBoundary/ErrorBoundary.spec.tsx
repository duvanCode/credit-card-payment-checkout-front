import React from 'react';
import { Pressable, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import renderer, { act } from 'react-test-renderer';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renderiza children cuando no hay error', () => {
    const screen = render(
      <ErrorBoundary>
        <Text>OK</Text>
      </ErrorBoundary>,
    );

    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('muestra fallback y permite reintentar', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const tree = renderer.create(
      <ErrorBoundary>
        <Text>OK</Text>
      </ErrorBoundary>,
    );

    act(() => {
      (tree.getInstance() as any).setState({ hasError: true });
    });

    expect(tree.root.findByProps({ children: 'Ocurrio un error inesperado' })).toBeTruthy();

    act(() => {
      tree.root.findByType(Pressable).props.onPress();
    });

    expect(tree.root.findByProps({ children: 'OK' })).toBeTruthy();

    consoleError.mockRestore();
  });

  it('deriva estado desde errores', () => {
    expect(ErrorBoundary.getDerivedStateFromError(new Error('boom'))).toEqual({
      hasError: true,
    });
  });
});
