import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types/product.types';
import { calculateProductPricing } from '../../utils/pricing';

interface CartState {
  product: Product | null;
  quantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  product: null,
  quantity: 1,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      state.product = action.payload.product;
      state.quantity = action.payload.quantity;
      state.totalAmount = calculateProductPricing(
        action.payload.product.price,
        action.payload.quantity,
      ).total;
    },
    updateQuantity(state, action: PayloadAction<number>) {
      if (!state.product) {
        return;
      }

      const nextQuantity = Math.min(Math.max(action.payload, 1), state.product.stock);
      state.quantity = nextQuantity;
      state.totalAmount = calculateProductPricing(
        state.product.price,
        nextQuantity,
      ).total;
    },
    clearCart() {
      return initialState;
    },
  },
});

export const { addToCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
