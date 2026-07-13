export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR'
  | 'VOIDED';

export interface CustomerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
}

export interface PaymentItem {
  productId: string;
  quantity: number;
}

export interface PaymentPayload {
  items: PaymentItem[];
  cardToken: string;
  customerData: CustomerData;
  installments?: number;
}

export interface TransactionProductSummary {
  id: string;
  name: string;
  quantity: number;
}

export interface TransactionResponse {
  transactionId: string;
  reference: string;
  gatewayTransactionId?: string | null;
  status: TransactionStatus;
  product: TransactionProductSummary;
  amount: number;
  currency: string;
  itemsCount: number;
  createdAt: string;
}
