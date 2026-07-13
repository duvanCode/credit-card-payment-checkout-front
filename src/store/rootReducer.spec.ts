import { rootReducer } from './rootReducer';

describe('rootReducer', () => {
  it('se inicializa con slices', () => {
    const state = rootReducer(undefined, { type: 'INIT' });
    expect(state.products).toBeDefined();
    expect(state.cart).toBeDefined();
    expect(state.transaction).toBeDefined();
    expect(state.orders).toBeDefined();
  });
});

