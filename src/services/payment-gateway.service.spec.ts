describe('payment-gateway.service', () => {
  const setup = (options?: {
    env?: { PAYMENT_GATEWAY_PUBLIC_KEY?: string; PAYMENT_GATEWAY_SANDBOX_URL?: string };
  }) => {
    const client = {
      post: jest.fn(),
    };

    const isAxiosError = jest.fn(() => false);

    jest.resetModules();
    const env = options?.env ?? {};
    const envMock = require('../../test/envMock');
    envMock.PAYMENT_GATEWAY_PUBLIC_KEY =
      'PAYMENT_GATEWAY_PUBLIC_KEY' in env ? env.PAYMENT_GATEWAY_PUBLIC_KEY : 'pub_test_123';
    envMock.PAYMENT_GATEWAY_SANDBOX_URL =
      'PAYMENT_GATEWAY_SANDBOX_URL' in env
        ? env.PAYMENT_GATEWAY_SANDBOX_URL
        : 'https://sandbox.example.com';

    const create = jest.fn(() => client);
    jest.doMock('axios', () => ({
      __esModule: true,
      default: {
        create,
        isAxiosError,
      },
    }));

    let tokenizeCard: typeof import('./payment-gateway.service').tokenizeCard;
    jest.isolateModules(() => {
      ({ tokenizeCard } = require('./payment-gateway.service'));
    });

    return { tokenizeCard, client, isAxiosError, create };
  };

  it('tokeniza tarjeta y retorna cardToken', async () => {
    const { tokenizeCard, client } = setup();
    client.post.mockResolvedValue({ data: { data: { id: 'tok_1' } } });
    const result = await tokenizeCard({
      number: '4012888888881881',
      cvc: '123',
      expMonth: '12',
      expYear: '29',
      cardHolder: 'JUAN',
    });
    expect(result).toBe('tok_1');
  });

  it('lanza error si la pasarela no devuelve token', async () => {
    const { tokenizeCard, client } = setup();
    client.post.mockResolvedValue({ data: { data: {} } });
    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('La pasarela no devolvio un token de tarjeta.');
  });

  it('mapea error axios a mensaje user-friendly', async () => {
    const { tokenizeCard, client, isAxiosError } = setup();
    isAxiosError.mockReturnValue(true);
    client.post.mockRejectedValue({
      response: { data: { error: { reason: 'Rechazado' } } },
    });
    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('Rechazado');
  });

  it('mapea error axios con error.message', async () => {
    const { tokenizeCard, client, isAxiosError } = setup();
    isAxiosError.mockReturnValue(true);
    client.post.mockRejectedValue({
      response: { data: { error: { message: 'Mensaje error' } } },
    });

    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('Mensaje error');
  });

  it('mapea error axios con response.data.message', async () => {
    const { tokenizeCard, client, isAxiosError } = setup();
    isAxiosError.mockReturnValue(true);
    client.post.mockRejectedValue({
      response: { data: { message: 'Mensaje root' } },
    });

    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('Mensaje root');
  });

  it('usa mensaje por defecto en error axios cuando no hay payload', async () => {
    const { tokenizeCard, client, isAxiosError } = setup();
    isAxiosError.mockReturnValue(true);
    client.post.mockRejectedValue({});

    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('No fue posible tokenizar la tarjeta.');
  });

  it('propaga Error no-axios', async () => {
    const { tokenizeCard, client } = setup();
    client.post.mockRejectedValue(new Error('boom'));

    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('boom');
  });

  it('mapea error desconocido no-axios a default', async () => {
    const { tokenizeCard, client } = setup();
    client.post.mockRejectedValue('boom');

    await expect(
      tokenizeCard({
        number: '4012888888881881',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'JUAN',
      }),
    ).rejects.toThrow('No fue posible tokenizar la tarjeta.');
  });
});
