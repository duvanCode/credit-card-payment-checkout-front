import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CardNumberInput } from './CardNumberInput';

describe('CardNumberInput', () => {
  it('muestra marca segun numero', () => {
    const screen = render(
      <CardNumberInput onChangeText={() => {}} value="4242 4242 4242 4242" />,
    );
    expect(screen.getByText('VISA')).toBeTruthy();
  });

  it('formatea el numero al escribir', () => {
    const onChangeText = jest.fn();
    const screen = render(<CardNumberInput onChangeText={onChangeText} value="" />);

    fireEvent.changeText(
      screen.getByPlaceholderText('4242 4242 4242 4242'),
      '42424242',
    );

    expect(onChangeText).toHaveBeenCalledWith('4242 4242');
  });

  it('muestra MasterCard cuando aplica', () => {
    const screen = render(
      <CardNumberInput onChangeText={() => {}} value="5555 5555 5555 4444" />,
    );
    expect(screen.getByText('MasterCard')).toBeTruthy();
  });

  it('muestra fallback y error cuando la tarjeta no es reconocida', () => {
    const screen = render(
      <CardNumberInput
        error="Tarjeta invalida"
        onChangeText={() => {}}
        value="1234"
      />,
    );

    expect(screen.getByText('Tarjeta')).toBeTruthy();
    expect(screen.getByText('Tarjeta invalida')).toBeTruthy();
  });
});
