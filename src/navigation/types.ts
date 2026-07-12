import { TransactionStatus } from '../types/transaction.types';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  TransactionResult: { transactionId: string; status: TransactionStatus };
};
