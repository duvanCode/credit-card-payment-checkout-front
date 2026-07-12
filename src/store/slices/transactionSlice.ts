import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initiateTransaction } from '../../services/transactions.service';
import { encryptData } from '../../utils/encryption';
import { CardData, PaymentPayload, TransactionResponse } from '../../types/transaction.types';

interface TransactionState {
  currentTransaction: TransactionResponse | null;
  cardData: string | null;
  loading: boolean;
  error: string | null;
  status: 'idle' | 'pending' | 'success' | 'failed';
}

const initialState: TransactionState = {
  currentTransaction: null,
  cardData: null,
  loading: false,
  error: null,
  status: 'idle',
};

export const initiatePayment = createAsyncThunk(
  'transaction/initiatePayment',
  async (payload: PaymentPayload) => {
    return initiateTransaction(payload);
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setCardData(state, action: PayloadAction<CardData>) {
      state.cardData = encryptData(action.payload);
    },
    clearTransaction() {
      return initialState;
    },
    resetPaymentStatus(state) {
      state.loading = false;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initiatePayment.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.status = 'pending';
        state.cardData = encryptData(action.meta.arg.cardData);
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status === 'APPROVED' ? 'success' : 'failed';
        state.currentTransaction = action.payload;
        state.error =
          action.payload.status === 'APPROVED'
            ? null
            : 'El pago fue rechazado. Puedes revisar los datos e intentarlo de nuevo.';
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.error.message ?? 'No fue posible procesar el pago.';
      });
  },
});

export const { setCardData, clearTransaction, resetPaymentStatus } = transactionSlice.actions;

export default transactionSlice.reducer;
