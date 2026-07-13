import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { tokenizeCard } from '../../services/payment-gateway.service';
import { CheckoutScreen } from './CheckoutScreen';

jest.mock('../../hooks/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../services/payment-gateway.service', () => ({
  tokenizeCard: jest.fn(),
}));

jest.mock('../../components/Toast/Toast', () => {
  const ReactLocal = require('react');
  const { Pressable: PressableLocal, Text: TextLocal } = require('react-native');
  return {
    Toast: ({ visible, message, onHide }: any) =>
      visible
        ? ReactLocal.createElement(
            PressableLocal,
            { onPress: onHide },
            ReactLocal.createElement(TextLocal, null, message),
          )
        : null,
  };
});

jest.mock('../../components/LoadingOverlay/LoadingOverlay', () => {
  const ReactLocal = require('react');
  const { Text: TextLocal } = require('react-native');
  return {
    LoadingOverlay: ({ visible, message }: any) =>
      visible ? ReactLocal.createElement(TextLocal, null, message) : null,
  };
});

jest.mock('./components/CreditCardBackdrop', () => {
  const ReactLocal = require('react');
  const { Pressable: PressableLocal, Text: TextLocal, View: ViewLocal } = require('react-native');
  return {
    CreditCardBackdrop: ({ visible, onContinue, onClose, onChange }: any) =>
      visible
        ? ReactLocal.createElement(
            ViewLocal,
            null,
            ReactLocal.createElement(
              PressableLocal,
              { onPress: () => onChange('email', 'bad') },
              ReactLocal.createElement(TextLocal, null, 'SET_EMAIL_BAD'),
            ),
            ReactLocal.createElement(
              PressableLocal,
              { onPress: () => onChange('email', 'cliente@correo.com') },
              ReactLocal.createElement(TextLocal, null, 'SET_EMAIL_OK'),
            ),
          ReactLocal.createElement(
            PressableLocal,
            { onPress: () => onChange('expiryMonth', '00') },
            ReactLocal.createElement(TextLocal, null, 'SET_EXPIRY_BAD'),
          ),
          ReactLocal.createElement(
            PressableLocal,
            { onPress: () => onChange('expiryMonth', '12') },
            ReactLocal.createElement(TextLocal, null, 'SET_EXPIRY_OK'),
          ),
            ReactLocal.createElement(
              PressableLocal,
              { onPress: onContinue },
              ReactLocal.createElement(TextLocal, null, 'CONTINUAR_BACKDROP'),
            ),
            ReactLocal.createElement(
              PressableLocal,
              { onPress: onClose },
              ReactLocal.createElement(TextLocal, null, 'CERRAR_BACKDROP'),
            ),
          )
        : null,
  };
});

jest.mock('./components/PaymentSummaryBackdrop', () => {
  const ReactLocal = require('react');
  const { Pressable: PressableLocal, Text: TextLocal, View: ViewLocal } = require('react-native');
  return {
    PaymentSummaryBackdrop: ({ visible, onConfirm, onBack }: any) =>
      visible
        ? ReactLocal.createElement(
            ViewLocal,
            null,
            ReactLocal.createElement(
              PressableLocal,
              { onPress: onBack },
              ReactLocal.createElement(TextLocal, null, 'VOLVER_RESUMEN'),
            ),
            ReactLocal.createElement(
              PressableLocal,
              { onPress: onConfirm },
              ReactLocal.createElement(TextLocal, null, 'CONFIRMAR_RESUMEN'),
            ),
          )
        : null,
  };
});

describe('CheckoutScreen', () => {
  const baseProduct = {
    id: 'p1',
    name: 'Producto 1',
    description: 'Descripcion',
    category: 'Categoria',
    imageUrl: 'https://example.com/a.png',
    price: 10000,
    currency: 'COP',
    stock: 10,
  };

  beforeEach(() => {
    (tokenizeCard as jest.Mock).mockReset();
  });

  it('muestra empty state cuando no hay producto', () => {
    const dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: null, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    expect(screen.getByText('No hay producto seleccionado')).toBeTruthy();
    fireEvent.press(screen.getByText('Volver a la tienda'));
    expect(navigation.popToTop).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('procesa pago aprobado y navega a resultado', async () => {
    const response = { status: 'APPROVED', transactionId: 'trx-1' };
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return { unwrap: async () => response };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    expect(tokenizeCard).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('TransactionResult', {
      transactionId: 'trx-1',
      status: 'APPROVED',
    });
  });

  it('muestra mensaje de stock insuficiente', async () => {
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return {
          unwrap: async () => {
            throw { message: 'sin stock', status: 'ERROR', code: 'INSUFFICIENT_STOCK' };
          },
        };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 10 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    expect(screen.getByText('No hay stock disponible.')).toBeTruthy();
  });

  it('navega a resultado cuando el pago es rechazado', async () => {
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return {
          unwrap: async () => {
            throw { message: 'rechazado', status: 'DECLINED', transactionId: 'trx-2' };
          },
        };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    expect(navigation.replace).toHaveBeenCalledWith('TransactionResult', {
      transactionId: 'trx-2',
      status: 'DECLINED',
    });
  });

  it('valida formulario y permite corregir errores', () => {
    const dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('SET_EMAIL_BAD'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));
    expect(screen.queryByText('CONFIRMAR_RESUMEN')).toBeNull();

    fireEvent.press(screen.getByText('SET_EMAIL_OK'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));
    expect(screen.getByText('CONFIRMAR_RESUMEN')).toBeTruthy();
  });

  it('permite volver del resumen al formulario', () => {
    const dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));
    expect(screen.getByText('CONFIRMAR_RESUMEN')).toBeTruthy();

    fireEvent.press(screen.getByText('VOLVER_RESUMEN'));
    expect(screen.getByText('CONTINUAR_BACKDROP')).toBeTruthy();
  });

  it('permite cerrar el formulario y volver atras desde el top bar', () => {
    const dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('arrow-back'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CERRAR_BACKDROP'));
    expect(screen.queryByText('CONTINUAR_BACKDROP')).toBeNull();
  });

  it('limpia el error de expiracion al corregir el campo', () => {
    const dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('SET_EXPIRY_BAD'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));
    expect(screen.queryByText('CONFIRMAR_RESUMEN')).toBeNull();

    fireEvent.press(screen.getByText('SET_EXPIRY_OK'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));
    expect(screen.getByText('CONFIRMAR_RESUMEN')).toBeTruthy();
  });

  it('muestra toast cuando el status no es aprobado ni pendiente', async () => {
    const response = { status: 'DECLINED', transactionId: 'trx-3' };
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return { unwrap: async () => response };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    const toastMessage = 'El pago fue rechazado. Puedes intentarlo de nuevo.';
    expect(screen.getByText(toastMessage)).toBeTruthy();

    fireEvent.press(screen.getByText(toastMessage));
    expect(screen.queryByText(toastMessage)).toBeNull();
  });

  it('muestra toast con error generico de la API', async () => {
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return {
          unwrap: async () => {
            throw { message: 'Fallo', status: 'ERROR', code: 'OTHER' };
          },
        };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    expect(screen.getByText('Fallo')).toBeTruthy();
  });

  it('maneja errores no tipados', async () => {
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return {
          unwrap: async () => {
            throw 'boom';
          },
        };
      }
      return arg;
    });

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    (tokenizeCard as jest.Mock).mockResolvedValue('tok_1');

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    await act(async () => {
      fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
      await Promise.resolve();
    });

    expect(screen.getByText('No fue posible procesar el pago.')).toBeTruthy();
  });

  it('evita doble submit cuando ya esta enviando', async () => {
    const response = { status: 'APPROVED', transactionId: 'trx-guard' };
    const dispatch = jest.fn((arg: any) => {
      if (typeof arg === 'function') {
        return { unwrap: async () => response };
      }
      return arg;
    });

    let resolveToken: ((value: unknown) => void) | null = null;
    (tokenizeCard as jest.Mock).mockImplementation(
      () =>
        new Promise(res => {
          resolveToken = res;
        }),
    );

    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        cart: { product: baseProduct, quantity: 1 },
        transaction: { loading: false, currentTransaction: null },
      }),
    );

    const navigation = { popToTop: jest.fn(), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() } as any;
    const screen = render(<CheckoutScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Pagar con tarjeta de credito'));
    fireEvent.press(screen.getByText('CONTINUAR_BACKDROP'));

    fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));
    fireEvent.press(screen.getByText('CONFIRMAR_RESUMEN'));

    await act(async () => {
      resolveToken?.('tok_1');
      await Promise.resolve();
    });

    expect(tokenizeCard).toHaveBeenCalledTimes(1);
  });
});
