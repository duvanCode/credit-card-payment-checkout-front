import axios from 'axios';
import {
  PaymentPayload,
  TransactionResponse,
  TransactionStatus,
} from '../types/transaction.types';
import { api } from './api';

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

export interface InitiateTransactionFailure {
  code?: string;
  details?: unknown;
  message: string;
  status: TransactionStatus;
  transactionId?: string | null;
}

export class InitiateTransactionError extends Error {
  code?: string;
  details?: unknown;
  status: TransactionStatus;
  transactionId?: string | null;

  constructor(payload: InitiateTransactionFailure) {
    super(payload.message);
    this.name = 'InitiateTransactionError';
    this.code = payload.code;
    this.details = payload.details;
    this.status = payload.status;
    this.transactionId = payload.transactionId;
  }
}

export async function initiateTransaction(payload: PaymentPayload) {
  try {
    const response = await api.post('/transactions/initiate', payload, {
      timeout: 30000,
    });

    console.log('[transactions] INITIATE_SUCCESS', {
      status: response.data?.data?.status,
      transactionId: response.data?.data?.transactionId,
    });

    return response.data.data as TransactionResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorPayload = error.response?.data?.error;
      const code = errorPayload?.code as string | undefined;
      const details = errorPayload?.details;
      const message =
        (errorPayload?.message as string | undefined) ??
        error.message ??
        'No fue posible procesar el pago.';
      const status: TransactionStatus =
        code === 'PAYMENT_DECLINED'
          ? 'DECLINED'
          : code === 'PAYMENT_VOIDED'
            ? 'VOIDED'
            : 'ERROR';
      const transactionId =
        (details as { transactionId?: string | null } | undefined)?.transactionId ?? null;

      // #region debug-point B:service-error-mapping
      reportDebugEvent(
        'B',
        'src/services/transactions.service.ts',
        '[DEBUG] Axios error mapped in initiateTransaction',
        {
          code,
          hasDetails: Boolean(details),
          responseStatus: error.response?.status,
          status,
          transactionId,
        },
      );
      // #endregion

      console.error('[transactions] INITIATE_ERROR', {
        code,
        details,
        message,
        responseStatus: error.response?.status,
        status,
        transactionId,
      });

      throw new InitiateTransactionError({
        code,
        details,
        message,
        status,
        transactionId,
      });
    }

    console.error('[transactions] INITIATE_ERROR_UNKNOWN', error);
    throw error;
  }
}

export async function getTransactions(limit = 20) {
  const response = await api.get('/transactions', {
    params: { limit },
  });
  return response.data.data as TransactionResponse[];
}

export async function getTransaction(transactionId: string) {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data.data as TransactionResponse;
}
