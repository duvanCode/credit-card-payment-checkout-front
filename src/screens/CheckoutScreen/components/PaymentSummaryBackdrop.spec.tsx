import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaymentSummaryBackdrop } from './PaymentSummaryBackdrop';

describe('PaymentSummaryBackdrop', () => {
  const product = {
    id: 'p1',
    name: 'Producto 1',
    description: 'Descripcion',
    category: 'Categoria',
    imageUrl: 'https://example.com/a.png',
    price: 10000,
    currency: 'COP',
    stock: 10,
  };

  it('renderiza y permite confirmar', () => {
    const onBack = jest.fn();
    const onConfirm = jest.fn();

    const screen = render(
      <PaymentSummaryBackdrop
        cardNumber="4242 4242 4242 4242"
        cardType="VISA"
        onBack={onBack}
        onConfirm={onConfirm}
        product={product as any}
        quantity={1}
        visible
      />,
    );

    expect(screen.getByText('Resumen de pago')).toBeTruthy();
    fireEvent.press(screen.getByText('Volver'));
    expect(onBack).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Confirmar pago'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('muestra marca MC y bloquea acciones cuando loading es true', () => {
    const onBack = jest.fn();
    const onConfirm = jest.fn();

    const screen = render(
      <PaymentSummaryBackdrop
        cardNumber="5555 5555 5555 4444"
        cardType="MASTERCARD"
        loading
        onBack={onBack}
        onConfirm={onConfirm}
        product={product as any}
        quantity={1}
        visible
      />,
    );

    expect(screen.getByText('MC')).toBeTruthy();
    expect(screen.queryByText('Confirmar pago')).toBeNull();
    fireEvent.press(screen.getByText('Volver'));
    expect(onBack).toHaveBeenCalledTimes(0);
    expect(onConfirm).toHaveBeenCalledTimes(0);
  });
});
