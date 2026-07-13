import reducer, { addToCart, clearCart, updateQuantity } from './cartSlice';

describe('cartSlice', () => {
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

  it('agrega producto al carrito y calcula total', () => {
    const state = reducer(undefined, addToCart({ product, quantity: 2 }));
    expect(state.product?.id).toBe('prod-1');
    expect(state.quantity).toBe(2);
    expect(state.totalAmount).toBeGreaterThan(product.price * 2);
  });

  it('actualiza cantidad respetando limites', () => {
    const state1 = reducer(undefined, addToCart({ product, quantity: 1 }));
    const state2 = reducer(state1, updateQuantity(10));
    expect(state2.quantity).toBe(3);

    const state3 = reducer(state2, updateQuantity(0));
    expect(state3.quantity).toBe(1);
  });

  it('no actualiza cantidad si no hay producto', () => {
    const state = reducer(undefined, updateQuantity(2));
    expect(state.quantity).toBe(1);
  });

  it('limpia el carrito', () => {
    const state1 = reducer(undefined, addToCart({ product, quantity: 1 }));
    const state2 = reducer(state1, clearCart());
    expect(state2.product).toBeNull();
    expect(state2.totalAmount).toBe(0);
  });
});

