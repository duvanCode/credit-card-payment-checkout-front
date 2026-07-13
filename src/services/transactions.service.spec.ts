import axios from 'axios';
import {
  getTransaction,
  getTransactions,
  initiateTransaction,
  InitiateTransactionError,
} from './transactions.service';

jest.mock('./api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('axios');

const { api } = jest.requireMock('./api');

describe('transactions.service', () => {
  beforeEach(() => {
    api.post.mockReset();
    api.get.mockReset();
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);
  });

  it('initiateTransaction retorna response', async () => {
    api.post.mockResolvedValue({ data: { data: { transactionId: 'trx-1' } } });
    const result = await initiateTransaction({} as never);
    expect(api.post).toHaveBeenCalledWith('/transactions/initiate', {}, { timeout: 30000 });
    expect(result).toEqual({ transactionId: 'trx-1' });
  });

  it('mapea error axios a InitiateTransactionError DECLINED', async () => {
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.reject(new Error('fail'))) as never;
    api.post.mockRejectedValue({
      message: 'raw',
      response: {
        status: 402,
        data: {
          error: {
            code: 'PAYMENT_DECLINED',
            message: 'Pago rechazado',
            details: { transactionId: 'trx-2' },
          },
        },
      },
    });

    await expect(initiateTransaction({} as never)).rejects.toBeInstanceOf(
      InitiateTransactionError,
    );
    await expect(initiateTransaction({} as never)).rejects.toEqual(
      expect.objectContaining({
        status: 'DECLINED',
        transactionId: 'trx-2',
      }),
    );
    await Promise.resolve();
    global.fetch = originalFetch;
  });

  it('mapea PAYMENT_VOIDED a VOIDED', async () => {
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    api.post.mockRejectedValue({
      message: 'raw',
      response: {
        status: 402,
        data: {
          error: {
            code: 'PAYMENT_VOIDED',
            message: 'Pago anulado',
            details: { transactionId: 'trx-3' },
          },
        },
      },
    });

    await expect(initiateTransaction({} as never)).rejects.toEqual(
      expect.objectContaining({
        status: 'VOIDED',
        transactionId: 'trx-3',
      }),
    );
  });

  it('usa mensaje por defecto cuando no hay message en payload ni en error', async () => {
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    api.post.mockRejectedValue({
      response: {
        status: 500,
        data: {
          error: {
            code: 'OTHER',
          },
        },
      },
    });

    await expect(initiateTransaction({} as never)).rejects.toEqual(
      expect.objectContaining({
        status: 'ERROR',
        message: 'No fue posible procesar el pago.',
        transactionId: null,
      }),
    );
  });

  it('propaga error desconocido', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('fail');
    api.post.mockRejectedValue(error);

    await expect(initiateTransaction({} as never)).rejects.toBe(error);
    expect(consoleError).toHaveBeenCalledWith('[transactions] INITIATE_ERROR_UNKNOWN', error);
    consoleError.mockRestore();
  });

  it('getTransactions consulta lista', async () => {
    api.get.mockResolvedValue({ data: { data: [{ transactionId: 'trx-1' }] } });
    const result = await getTransactions(5);
    expect(api.get).toHaveBeenCalledWith('/transactions', { params: { limit: 5 } });
    expect(result).toEqual([{ transactionId: 'trx-1' }]);
  });

  it('getTransactions usa limit por defecto', async () => {
    api.get.mockResolvedValue({ data: { data: [{ transactionId: 'trx-1' }] } });
    await getTransactions();
    expect(api.get).toHaveBeenCalledWith('/transactions', { params: { limit: 20 } });
  });

  it('getTransaction consulta detalle', async () => {
    api.get.mockResolvedValue({ data: { data: { transactionId: 'trx-9' } } });
    const result = await getTransaction('trx-9');
    expect(api.get).toHaveBeenCalledWith('/transactions/trx-9');
    expect(result).toEqual({ transactionId: 'trx-9' });
  });
});
