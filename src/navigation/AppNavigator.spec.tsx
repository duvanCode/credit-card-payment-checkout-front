import React from 'react';
import { render } from '@testing-library/react-native';
import { AppNavigator } from './AppNavigator';

describe('AppNavigator', () => {
  it('renderiza sin crashear', () => {
    render(<AppNavigator />);
  });
});
