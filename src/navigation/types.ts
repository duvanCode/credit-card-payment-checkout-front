import { TransactionStatus } from '../types/transaction.types';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Orders: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  TransactionResult: { transactionId?: string | null; status: TransactionStatus };
};
