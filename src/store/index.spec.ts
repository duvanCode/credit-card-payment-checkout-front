import { store } from './index';

describe('store', () => {
  it('crea store con dispatch y getState', () => {
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
  });
});

