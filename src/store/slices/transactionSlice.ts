import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  InitiateTransactionError,
  InitiateTransactionFailure,
  initiateTransaction,
} from '../../services/transactions.service';
import { PaymentPayload, TransactionResponse } from '../../types/transaction.types';

const DEBUG_SERVER_URL = 'http://192.168.1.10:7777/event';
const DEBUG_SESSION_ID = 'rejected-payment-screen';
const DEBUG_RUN_ID = 'post-fix';

function reportDebugEvent(
  hypothesisId: string,
  location: string,
  msg: string,
  data?: Record<string, unknown>,
) {
  void fetch(DEBUG_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: DEBUG_RUN_ID,
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
}

interface TransactionState {
  currentTransaction: TransactionResponse | null;
  loading: boolean;
  error: string | null;
  status: 'idle' | 'pending' | 'success' | 'failed';
}

const initialState: TransactionState = {
  currentTransaction: null,
  loading: false,
  error: null,
  status: 'idle',
};

export const initiatePayment = createAsyncThunk<
  TransactionResponse,
  PaymentPayload,
  { rejectValue: InitiateTransactionFailure }
>(
  'transaction/initiatePayment',
  async (payload: PaymentPayload, { rejectWithValue }) => {
    try {
      return await initiateTransaction(payload);
    } catch (error) {
      if (error instanceof InitiateTransactionError) {
        // #region debug-point A:thunk-reject-payload
        reportDebugEvent(
          'A',
          'src/store/slices/transactionSlice.ts',
          '[DEBUG] RejectWithValue using InitiateTransactionError payload',
          {
            code: error.code,
            status: error.status,
            transactionId: error.transactionId ?? null,
          },
        );
        // #endregion

        return rejectWithValue({
          code: error.code,
          details: error.details,
          message: error.message,
          status: error.status,
          transactionId: error.transactionId,
        } satisfies InitiateTransactionFailure);
      }

      // #region debug-point A:thunk-reject-generic
      reportDebugEvent(
        'A',
        'src/store/slices/transactionSlice.ts',
        '[DEBUG] RejectWithValue using generic error payload',
        {
          isErrorInstance: error instanceof Error,
          message: error instanceof Error ? error.message : null,
        },
      );
      // #endregion

      return rejectWithValue({
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible procesar el pago.',
        status: 'ERROR',
      } satisfies InitiateTransactionFailure);
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
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
      .addCase(initiatePayment.pending, state => {
        state.loading = true;
        state.error = null;
        state.status = 'pending';
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.status =
          action.payload.status === 'APPROVED'
            ? 'success'
            : action.payload.status === 'PENDING'
              ? 'pending'
              : 'failed';
        state.currentTransaction = action.payload;
        state.error =
          action.payload.status === 'APPROVED' || action.payload.status === 'PENDING'
            ? null
            : 'El pago fue rechazado. Puedes revisar los datos e intentarlo de nuevo.';
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error =
          action.payload?.message ??
          action.error.message ??
          'No fue posible procesar el pago.';
      });
  },
});

export const { clearTransaction, resetPaymentStatus } = transactionSlice.actions;

export default transactionSlice.reducer;
