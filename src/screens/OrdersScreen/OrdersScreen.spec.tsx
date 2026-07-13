import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { OrdersScreen } from './OrdersScreen';

jest.mock('../../hooks/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('OrdersScreen', () => {
  const dispatch = jest.fn();

  const makeOrder = (status: string) => ({
    transactionId: `${status}-1`,
    reference: `REF-${status}`,
    createdAt: '2026-01-01T10:00:00.000Z',
    status,
    amount: 15000,
    currency: 'COP',
    product: {
      name: 'Producto 1',
      quantity: 1,
    },
  });

  const setOrdersState = (partial: any) => {
    const state = {
      items: [],
      loading: false,
      error: null,
      ...partial,
    };
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ orders: state }),
    );
  };

  beforeEach(() => {
    dispatch.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
  });

  it('muestra estado de carga', () => {
    setOrdersState({ loading: true });
    const navigation = { goBack: jest.fn() } as any;
    const screen = render(<OrdersScreen navigation={navigation} route={{} as any} />);
    expect(screen.getByText('Cargando ordenes...')).toBeTruthy();
  });

  it('muestra estado de error y reintenta', () => {
    setOrdersState({ error: 'fallo' });
    const navigation = { goBack: jest.fn() } as any;
    const screen = render(<OrdersScreen navigation={navigation} route={{} as any} />);

    expect(screen.getByText('No pudimos cargar las ordenes')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('muestra empty state cuando no hay items', () => {
    setOrdersState({ items: [] });
    const navigation = { goBack: jest.fn() } as any;
    const screen = render(<OrdersScreen navigation={navigation} route={{} as any} />);
    expect(screen.getByText('Aun no hay ordenes')).toBeTruthy();
  });

  it('muestra etiquetas de estado y permite volver', () => {
    setOrdersState({
      items: [
        makeOrder('APPROVED'),
        makeOrder('PENDING'),
        makeOrder('VOIDED'),
        makeOrder('DECLINED'),
        makeOrder('OTHER'),
      ],
    });

    const navigation = { goBack: jest.fn() } as any;
    const screen = render(<OrdersScreen navigation={navigation} route={{} as any} />);

    expect(screen.getByText('APROBADO')).toBeTruthy();
    expect(screen.getByText('PENDIENTE')).toBeTruthy();
    expect(screen.getByText('ANULADO')).toBeTruthy();
    expect(screen.getByText('RECHAZADO')).toBeTruthy();
    expect(screen.getByText('OTHER')).toBeTruthy();

    fireEvent.press(screen.getByText('arrow-back'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
