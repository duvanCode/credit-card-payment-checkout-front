export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR'
  | 'VOIDED';

export interface CardData {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

export interface CustomerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
}

export interface PaymentPayload {
  productId: string;
  quantity: number;
  cardData: CardData;
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
  gatewayTransactionId?: string | null;
  status: TransactionStatus;
  product: TransactionProductSummary;
  amount: number;
  currency: string;
  createdAt: string;
}
