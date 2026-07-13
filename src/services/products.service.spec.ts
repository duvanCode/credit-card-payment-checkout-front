import { getProductById, getProducts } from './products.service';

jest.mock('./api', () => ({
  api: {
    get: jest.fn(),
    defaults: { baseURL: 'http://localhost:3000' },
  },
}));

const { api } = jest.requireMock('./api');

describe('products.service', () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it('getProducts retorna lista', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'p1' }] } });
    const result = await getProducts();
    expect(api.get).toHaveBeenCalledWith('/products');
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('getProductById retorna detalle', async () => {
    api.get.mockResolvedValue({ data: { data: { id: 'p2' } } });
    const result = await getProductById('p2');
    expect(api.get).toHaveBeenCalledWith('/products/p2');
    expect(result).toEqual({ id: 'p2' });
  });

  it('getProducts soporta data no-array en logs', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    api.get.mockResolvedValue({ data: { data: null } });
    await getProducts();
    expect(consoleLog).toHaveBeenCalledWith('[products] OK', 0);
    consoleLog.mockRestore();
  });

  it('getProducts propaga errores', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const error = new Error('fail');
    api.get.mockRejectedValue(error);

    await expect(getProducts()).rejects.toBe(error);
    expect(consoleLog).toHaveBeenCalledWith('[products] ERROR', 'fail');
    consoleLog.mockRestore();
  });

  it('getProducts soporta errores no-Error en logs', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    api.get.mockRejectedValue('boom');

    await expect(getProducts()).rejects.toBe('boom');
    expect(consoleLog).toHaveBeenCalledWith(
      '[products] ERROR',
      'Error desconocido al cargar productos',
    );
    consoleLog.mockRestore();
  });
});
