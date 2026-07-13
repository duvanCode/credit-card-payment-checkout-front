import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (cb?: () => void) => cb?.(),
    } as unknown as Animated.CompositeAnimation);
    jest.spyOn(Animated, 'parallel').mockReturnValue({
      start: (cb?: () => void) => cb?.(),
    } as unknown as Animated.CompositeAnimation);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('no renderiza nada cuando visible es false', () => {
    const screen = render(
      <Toast message="Hola" onHide={() => {}} type="info" visible={false} />,
    );
    expect(screen.toJSON()).toBeNull();
  });

  it('renderiza el mensaje y oculta luego del duration', () => {
    const onHide = jest.fn();
    const screen = render(
      <Toast
        duration={500}
        message="Mensaje"
        onHide={onHide}
        type="success"
        visible
      />,
    );

    expect(screen.getByText('Mensaje')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('renderiza tipo error', () => {
    const screen = render(
      <Toast message="Error" onHide={() => {}} type="error" visible duration={9999} />,
    );
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('renderiza tipo info', () => {
    const screen = render(
      <Toast message="Info" onHide={() => {}} type="info" visible duration={9999} />,
    );
    expect(screen.getByText('Info')).toBeTruthy();
  });
});
