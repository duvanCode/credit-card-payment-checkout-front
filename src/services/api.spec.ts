describe('api', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('crea instancia con baseURL y timeout', () => {
    const useMock = jest.fn();
    const instance = {
      interceptors: {
        response: { use: useMock },
      },
      defaults: { baseURL: 'http://localhost:3000' },
    };
    const createMock = jest.fn(() => instance);

    jest.doMock('axios', () => ({
      __esModule: true,
      default: {
        create: createMock,
      },
    }));

    jest.isolateModules(() => {
      const module = require('./api');
      expect(module.api).toBe(instance);
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 15000,
        }),
      );
      expect(typeof createMock.mock.calls[0][0].baseURL).toBe('string');
      expect(createMock.mock.calls[0][0].baseURL.length).toBeGreaterThan(0);
      expect(useMock).toHaveBeenCalledTimes(1);
    });
  });

  it('interceptor mantiene metadata y ajusta message', async () => {
    const useMock = jest.fn();
    const instance = {
      interceptors: {
        response: { use: useMock },
      },
      defaults: { baseURL: 'http://localhost:3000' },
    };

    jest.doMock('axios', () => ({
      __esModule: true,
      default: {
        create: () => instance,
      },
    }));

    jest.isolateModules(() => {
      require('./api');
    });

    const successHandler = useMock.mock.calls[0][0];
    const response = { data: { ok: true } };
    expect(successHandler(response)).toBe(response);

    const errorHandler = useMock.mock.calls[0][1];
    const error = {
      response: { data: { error: { message: 'boom' } } },
      message: 'old',
      custom: 'x',
    };

    await expect(errorHandler(error)).rejects.toEqual(
      expect.objectContaining({
        message: 'boom',
        custom: 'x',
      }),
    );

    const error2 = {
      response: { data: { message: 'msg' } },
      message: 'old',
    };
    await expect(errorHandler(error2)).rejects.toEqual(
      expect.objectContaining({
        message: 'msg',
      }),
    );

    const error3 = {
      message: 'old',
    };
    await expect(errorHandler(error3)).rejects.toEqual(
      expect.objectContaining({
        message: 'No fue posible conectar con el servidor.',
      }),
    );

    await expect(errorHandler('boom')).rejects.toBe('boom');
  });
});
