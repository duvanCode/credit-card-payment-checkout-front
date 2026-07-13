import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTransactions } from '../../services/transactions.service';
import { TransactionResponse } from '../../types/transaction.types';

interface OrdersState {
  items: TransactionResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  return getTransactions();
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'No fue posible cargar las ordenes.';
      });
  },
});

export default ordersSlice.reducer;
