import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from './redux';

describe('hooks/redux', () => {
  it('se pueden ejecutar dentro de un Provider', () => {
    function TestComponent() {
      const dispatch = useAppDispatch();
      const cart = useAppSelector(state => state.cart);

      useEffect(() => {
        dispatch({ type: 'TEST_ACTION' });
      }, [dispatch]);

      return <Text>{cart ? 'OK' : 'NO'}</Text>;
    }

    const screen = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    expect(screen.getByText('OK')).toBeTruthy();
  });
});
