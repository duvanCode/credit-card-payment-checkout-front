import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CreditCardBackdrop } from './CreditCardBackdrop';

describe('CreditCardBackdrop', () => {
  const baseForm = {
    cardNumber: '4242 4242 4242 4242',
    holderName: 'JUAN PEREZ',
    expiryMonth: '12',
    expiryYear: '29',
    cvc: '123',
    email: 'cliente@correo.com',
    fullName: 'Juan Perez',
    phoneNumber: '3001234567',
    legalId: '123456789',
    legalIdType: 'CC',
  };

  it('no renderiza nada cuando visible es false', () => {
    const screen = render(
      <CreditCardBackdrop
        errors={{}}
        form={baseForm as any}
        onChange={() => {}}
        onClose={() => {}}
        onContinue={() => {}}
        visible={false}
      />,
    );
    expect(screen.toJSON()).toBeNull();
  });

  it('permite usar accesos directos y continuar', () => {
    const onChange = jest.fn();
    const onClose = jest.fn();
    const onContinue = jest.fn();

    const screen = render(
      <CreditCardBackdrop
        errors={{}}
        form={baseForm as any}
        onChange={onChange}
        onClose={onClose}
        onContinue={onContinue}
        visible
      />,
    );

    expect(screen.getByText('Detalles de pago')).toBeTruthy();

    fireEvent.press(screen.getByText('check-circle'));
    expect(onChange).toHaveBeenCalledWith('cardNumber', '4242 4242 4242 4242');
    expect(onChange).toHaveBeenCalledWith('expiryMonth', '12');
    expect(onChange).toHaveBeenCalledWith('expiryYear', '29');
    expect(onChange).toHaveBeenCalledWith('cvc', '123');

    fireEvent.changeText(screen.getByPlaceholderText('3001234567'), '30a0');
    expect(onChange).toHaveBeenCalledWith('phoneNumber', '300');

    fireEvent.press(screen.getByText('Continuar'));
    expect(onContinue).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('permite usar tarjeta rechazada y aplica transformaciones', () => {
    const onChange = jest.fn();

    const screen = render(
      <CreditCardBackdrop
        errors={{}}
        form={baseForm as any}
        onChange={onChange}
        onClose={() => {}}
        onContinue={() => {}}
        visible
      />,
    );

    fireEvent.press(screen.getByText('cancel'));
    expect(onChange).toHaveBeenCalledWith('cardNumber', '4111 1111 1111 1111');

    fireEvent.changeText(screen.getByPlaceholderText('JUAN PEREZ'), 'juan');
    expect(onChange).toHaveBeenCalledWith('holderName', 'JUAN');

    fireEvent.changeText(screen.getByPlaceholderText('MM'), '1a2');
    expect(onChange).toHaveBeenCalledWith('expiryMonth', '12');

    fireEvent.changeText(screen.getByPlaceholderText('AA'), '2b9');
    expect(onChange).toHaveBeenCalledWith('expiryYear', '29');

    fireEvent.changeText(screen.getByPlaceholderText('123'), '12a4b');
    expect(onChange).toHaveBeenCalledWith('cvc', '124');

    fireEvent.changeText(screen.getByPlaceholderText('correo@dominio.com'), 'otro@correo.com');
    expect(onChange).toHaveBeenCalledWith('email', 'otro@correo.com');

    fireEvent.changeText(screen.getByPlaceholderText('Nombre del cliente'), 'Juan Cliente');
    expect(onChange).toHaveBeenCalledWith('fullName', 'Juan Cliente');

    fireEvent.changeText(screen.getByPlaceholderText('CC'), 'ce');
    expect(onChange).toHaveBeenCalledWith('legalIdType', 'CE');

    fireEvent.changeText(screen.getByPlaceholderText('123456789'), '12a');
    expect(onChange).toHaveBeenCalledWith('legalId', '12');
  });

  it('muestra errores de validacion cuando existen', () => {
    const screen = render(
      <CreditCardBackdrop
        errors={{
          cardNumber: 'Tarjeta invalida',
          holderName: 'Titular requerido',
          expiry: 'Fecha invalida',
          cvc: 'CVV invalido',
          email: 'Email invalido',
          fullName: 'Nombre invalido',
          phoneNumber: 'Telefono invalido',
          legalIdType: 'Tipo invalido',
          legalId: 'Documento invalido',
        }}
        form={baseForm as any}
        onChange={() => {}}
        onClose={() => {}}
        onContinue={() => {}}
        visible
      />,
    );

    expect(screen.getByText('Tarjeta invalida')).toBeTruthy();
    expect(screen.getByText('Titular requerido')).toBeTruthy();
    expect(screen.getAllByText('Fecha invalida')).toHaveLength(2);
    expect(screen.getByText('CVV invalido')).toBeTruthy();
    expect(screen.getByText('Email invalido')).toBeTruthy();
    expect(screen.getByText('Nombre invalido')).toBeTruthy();
    expect(screen.getByText('Telefono invalido')).toBeTruthy();
    expect(screen.getByText('Tipo invalido')).toBeTruthy();
    expect(screen.getByText('Documento invalido')).toBeTruthy();
  });

  it('deshabilita acciones cuando submitting es true', () => {
    const onClose = jest.fn();
    const onContinue = jest.fn();

    const screen = render(
      <CreditCardBackdrop
        errors={{}}
        form={baseForm as any}
        onChange={() => {}}
        onClose={onClose}
        onContinue={onContinue}
        submitting
        visible
      />,
    );

    fireEvent.press(screen.getByText('close'));
    expect(screen.queryByText('Continuar')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(0);
    expect(onContinue).toHaveBeenCalledTimes(0);
  });
});
