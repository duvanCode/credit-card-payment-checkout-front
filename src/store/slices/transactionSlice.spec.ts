import { configureStore } from '@reduxjs/toolkit';
import reducer, { clearTransaction, initiatePayment, resetPaymentStatus } from './transactionSlice';
import {
  InitiateTransactionError,
  initiateTransaction,
} from '../../services/transactions.service';

jest.mock('../../services/transactions.service', () => {
  const actual = jest.requireActual('../../services/transactions.service');
  return {
    ...actual,
    initiateTransaction: jest.fn(),
  };
});

describe('transactionSlice', () => {
  beforeEach(() => {
    (initiateTransaction as jest.Mock).mockReset();
  });

  it('reducers basicos', () => {
    const state1 = reducer(
      {
        currentTransaction: null,
        loading: true,
        error: 'x',
        status: 'failed',
      },
      resetPaymentStatus(),
    );
    expect(state1.loading).toBe(false);
    expect(state1.status).toBe('idle');

    const state2 = reducer(state1, clearTransaction());
    expect(state2.currentTransaction).toBeNull();
  });

  it('initiatePayment success APPROVED', async () => {
    (initiateTransaction as jest.Mock).mockResolvedValue({
      transactionId: 'trx-1',
      reference: 'TRX-1',
      status: 'APPROVED',
      product: { id: 'prod-1', name: 'Laptop', quantity: 1 },
      amount: 1000,
      currency: 'COP',
      itemsCount: 1,
      createdAt: new Date().toISOString(),
    });

    const store = configureStore({ reducer: { transaction: reducer } });
    await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(store.getState().transaction.status).toBe('success');
  });

  it('initiatePayment success PENDING', async () => {
    (initiateTransaction as jest.Mock).mockResolvedValue({
      transactionId: 'trx-1',
      reference: 'TRX-1',
      status: 'PENDING',
      product: { id: 'prod-1', name: 'Laptop', quantity: 1 },
      amount: 1000,
      currency: 'COP',
      itemsCount: 1,
      createdAt: new Date().toISOString(),
    });

    const store = configureStore({ reducer: { transaction: reducer } });
    await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(store.getState().transaction.status).toBe('pending');
    expect(store.getState().transaction.error).toBeNull();
  });

  it('initiatePayment success DECLINED', async () => {
    (initiateTransaction as jest.Mock).mockResolvedValue({
      transactionId: 'trx-1',
      reference: 'TRX-1',
      status: 'DECLINED',
      product: { id: 'prod-1', name: 'Laptop', quantity: 1 },
      amount: 1000,
      currency: 'COP',
      itemsCount: 1,
      createdAt: new Date().toISOString(),
    });

    const store = configureStore({ reducer: { transaction: reducer } });
    await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(store.getState().transaction.status).toBe('failed');
    expect(store.getState().transaction.error).toBe(
      'El pago fue rechazado. Puedes revisar los datos e intentarlo de nuevo.',
    );
  });

  it('initiatePayment rejected por InitiateTransactionError', async () => {
    (initiateTransaction as jest.Mock).mockRejectedValue(
      new InitiateTransactionError({
        message: 'rechazado',
        status: 'DECLINED',
        code: 'PAYMENT_DECLINED',
        details: {},
        transactionId: 'trx-2',
      }),
    );

    const store = configureStore({ reducer: { transaction: reducer } });
    const action = await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(action.type).toBe(initiatePayment.rejected.type);
    expect(store.getState().transaction.status).toBe('failed');
    expect(store.getState().transaction.error).toBe('rechazado');
  });

  it('initiatePayment rejected por error generico', async () => {
    (initiateTransaction as jest.Mock).mockRejectedValue(new Error('boom'));

    const store = configureStore({ reducer: { transaction: reducer } });
    await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(store.getState().transaction.error).toBe('boom');
  });

  it('initiatePayment rejected cuando error no es instancia de Error', async () => {
    (initiateTransaction as jest.Mock).mockRejectedValue('boom');

    const store = configureStore({ reducer: { transaction: reducer } });
    await store.dispatch(
      initiatePayment({
        items: [{ productId: 'prod-1', quantity: 1 }],
        cardToken: 'tok',
        customerData: {
          email: 'john@example.com',
          fullName: 'John',
          phoneNumber: '300',
          legalId: '123',
          legalIdType: 'CC',
        },
      }) as never,
    );

    expect(store.getState().transaction.error).toBe('No fue posible procesar el pago.');
  });

  it('extraReducers rejected usa action.error.message cuando no hay payload', () => {
    const state = reducer(undefined, {
      type: initiatePayment.rejected.type,
      payload: undefined,
      error: { message: 'x' },
    } as never);

    expect(state.error).toBe('x');
  });

  it('extraReducers rejected usa mensaje por defecto cuando no hay payload ni message', () => {
    const state = reducer(undefined, {
      type: initiatePayment.rejected.type,
      payload: undefined,
      error: {},
    } as never);

    expect(state.error).toBe('No fue posible procesar el pago.');
  });
});
