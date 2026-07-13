import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { SplashScreen } from './SplashScreen';

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (cb?: () => void) => cb?.(),
    } as unknown as Animated.CompositeAnimation);
    jest.spyOn(Animated, 'spring').mockReturnValue({
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

  it('navega a Home despues del timeout', () => {
    const navigation = {
      replace: jest.fn(),
    } as any;

    render(<SplashScreen navigation={navigation} route={{} as any} />);

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(navigation.replace).toHaveBeenCalledWith('Home');
  });
});
