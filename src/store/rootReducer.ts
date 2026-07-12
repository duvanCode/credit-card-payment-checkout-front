import { combineReducers } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import transactionReducer from './slices/transactionSlice';

export const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  transaction: transactionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
