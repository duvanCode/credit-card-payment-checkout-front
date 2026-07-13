import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getTransaction } from '../../services/transactions.service';
import { TransactionResultScreen } from './TransactionResultScreen';

jest.mock('../../hooks/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../services/transactions.service', () => ({
  getTransaction: jest.fn(),
}));

describe('TransactionResultScreen', () => {
  const dispatch = jest.fn();

  const transaction = {
    transactionId: 'trx-1',
    reference: 'REF-1',
    status: 'APPROVED',
    amount: 15000,
    currency: 'COP',
    createdAt: '2026-01-01T10:00:00.000Z',
    product: {
      name: 'Producto 1',
      quantity: 1,
    },
  };

  beforeEach(() => {
    dispatch.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (getTransaction as jest.Mock).mockReset();
  });

  it('muestra aprobado y permite volver a la tienda', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: transaction } }),
    );

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'APPROVED', transactionId: 'trx-1' } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('Pago exitoso')).toBeTruthy();
    fireEvent.press(screen.getByText('Volver a la tienda'));
    expect(navigation.popToTop).toHaveBeenCalledTimes(1);
  });

  it('muestra rechazado y permite reintentar', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: transaction } }),
    );

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'DECLINED', transactionId: 'trx-1' } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('Pago rechazado')).toBeTruthy();
    fireEvent.press(screen.getByText('Intentar de nuevo'));
    expect(navigation.replace).toHaveBeenCalledWith('Checkout');
  });

  it('hace polling cuando esta pendiente y actualiza a aprobado', async () => {
    jest.useFakeTimers();
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: null } }),
    );

    (getTransaction as jest.Mock)
      .mockResolvedValueOnce({ ...transaction, status: 'PENDING' })
      .mockResolvedValueOnce({ ...transaction, status: 'APPROVED' });

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'PENDING', transactionId: 'trx-1' } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getTransaction).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Pago pendiente')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(4000);
      await Promise.resolve();
    });

    expect(getTransaction).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Pago exitoso')).toBeTruthy();
    jest.useRealTimers();
  });

  it('muestra estado anulado y fallback del transactionId cuando no hay detalles', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: null } }),
    );

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'VOIDED', transactionId: undefined } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('Pago rechazado')).toBeTruthy();
    expect(screen.getByText('ANULADO')).toBeTruthy();
    expect(screen.getByText('No disponible')).toBeTruthy();
  });

  it('muestra el estado original cuando no existe traduccion', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: null } }),
    );

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'ERROR', transactionId: 'trx-x' } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    expect(screen.getByText('ERROR')).toBeTruthy();
  });

  it('mantiene el polling seguro si se desmonta antes de resolver', async () => {
    jest.useFakeTimers();
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ transaction: { currentTransaction: null } }),
    );

    let resolveRequest: ((value: unknown) => void) | null = null;
    (getTransaction as jest.Mock).mockImplementation(
      () =>
        new Promise(res => {
          resolveRequest = res;
        }),
    );

    const navigation = { popToTop: jest.fn(), replace: jest.fn() } as any;
    const route = { params: { status: 'PENDING', transactionId: 'trx-9' } } as any;

    const screen = render(
      <TransactionResultScreen navigation={navigation} route={route} />,
    );

    screen.unmount();

    await act(async () => {
      resolveRequest?.({ ...transaction, status: 'APPROVED' });
      await Promise.resolve();
    });

    jest.useRealTimers();
  });
});
