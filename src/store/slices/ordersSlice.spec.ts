import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchOrders } from './ordersSlice';

jest.mock('../../services/transactions.service', () => ({
  getTransactions: jest.fn(),
}));

const { getTransactions } = jest.requireMock('../../services/transactions.service');

describe('ordersSlice', () => {
  it('fetchOrders carga items', async () => {
    getTransactions.mockResolvedValue([
      {
        transactionId: 'trx-1',
        reference: 'TRX-1',
        status: 'APPROVED',
        product: { id: 'prod-1', name: 'Laptop', quantity: 1 },
        amount: 1000,
        currency: 'COP',
        itemsCount: 1,
        createdAt: new Date().toISOString(),
      },
    ]);

    const store = configureStore({
      reducer: { orders: reducer },
    });

    await store.dispatch(fetchOrders() as never);
    expect(store.getState().orders.items).toHaveLength(1);
  });

  it('fetchOrders maneja rejected', () => {
    const action = { type: fetchOrders.rejected.type, error: { message: 'fail' } };
    const state = reducer(undefined, action as never);
    expect(state.error).toBe('fail');
  });

  it('fetchOrders usa mensaje por defecto cuando no hay message', () => {
    const action = { type: fetchOrders.rejected.type, error: {} };
    const state = reducer(undefined, action as never);
    expect(state.error).toBe('No fue posible cargar las ordenes.');
  });
});
