import { PaymentPayload, TransactionResponse } from '../types/transaction.types';
import { api } from './api';

export async function initiateTransaction(payload: PaymentPayload) {
  const response = await api.post('/transactions/initiate', payload);
  return response.data.data as TransactionResponse;
}

export async function getTransaction(transactionId: string) {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data.data as TransactionResponse;
}
