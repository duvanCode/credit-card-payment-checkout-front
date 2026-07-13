import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  clearSelectedProduct,
  fetchProductDetail,
  fetchProducts,
  resetFilters,
  selectProduct,
  setSearchQuery,
  setSelectedCategory,
} from './productsSlice';

jest.mock('../../services/products.service', () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
}));

const { getProducts, getProductById } = jest.requireMock('../../services/products.service');

describe('productsSlice', () => {
  const product = {
    id: 'prod-1',
    name: 'Laptop',
    description: 'desc',
    price: 1000,
    currency: 'COP',
    stock: 3,
    imageUrl: 'http://localhost/img.png',
    category: 'Electronics',
  };

  it('reducers basicos', () => {
    let state = reducer(undefined, setSearchQuery('abc'));
    expect(state.searchQuery).toBe('abc');

    state = reducer(state, setSelectedCategory('Electronics'));
    expect(state.selectedCategory).toBe('Electronics');

    state = reducer(state, selectProduct(product as never));
    expect(state.selectedProduct?.id).toBe('prod-1');

    state = reducer(state, clearSelectedProduct());
    expect(state.selectedProduct).toBeNull();

    state = reducer(state, resetFilters());
    expect(state.searchQuery).toBe('');
    expect(state.selectedCategory).toBe('Todos');
  });

  it('fetchProducts carga items y actualiza selectedProduct si existe', async () => {
    getProducts.mockResolvedValue([product]);

    const store = configureStore({
      reducer: { products: reducer },
    });

    store.dispatch(selectProduct(product as never));
    await store.dispatch(fetchProducts() as never);

    const state = store.getState().products;
    expect(state.items).toHaveLength(1);
    expect(state.selectedProduct?.id).toBe('prod-1');
  });

  it('fetchProducts limpia selectedProduct si ya no existe en el catalogo', async () => {
    getProducts.mockResolvedValue([]);

    const store = configureStore({
      reducer: { products: reducer },
    });

    store.dispatch(selectProduct(product as never));
    await store.dispatch(fetchProducts() as never);

    const state = store.getState().products;
    expect(state.items).toHaveLength(0);
    expect(state.selectedProduct).toBeNull();
  });

  it('fetchProductDetail setea selectedProduct', async () => {
    getProductById.mockResolvedValue(product);

    const store = configureStore({
      reducer: { products: reducer },
    });

    await store.dispatch(fetchProductDetail('prod-1') as never);

    const state = store.getState().products;
    expect(state.selectedProduct?.id).toBe('prod-1');
  });

  it('setea mensajes por defecto cuando rejected no trae message', () => {
    const stateAfterProducts = reducer(undefined, {
      type: fetchProducts.rejected.type,
      error: {},
    });
    expect(stateAfterProducts.error).toBe('No fue posible cargar los productos.');

    const stateAfterDetail = reducer(undefined, {
      type: fetchProductDetail.rejected.type,
      error: {},
    });
    expect(stateAfterDetail.error).toBe('No fue posible cargar el detalle del producto.');
  });
});
