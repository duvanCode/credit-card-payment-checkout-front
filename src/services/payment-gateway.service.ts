import { PAYMENT_GATEWAY_PUBLIC_KEY, PAYMENT_GATEWAY_SANDBOX_URL } from '@env';
import axios from 'axios';

interface TokenizeCardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

const paymentGatewayClient = axios.create({
  baseURL: PAYMENT_GATEWAY_SANDBOX_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function tokenizeCard(input: TokenizeCardInput) {
  if (!PAYMENT_GATEWAY_PUBLIC_KEY) {
    throw new Error('Falta configurar PAYMENT_GATEWAY_PUBLIC_KEY en el frontend.');
  }

  try {
    const response = await paymentGatewayClient.post(
      '/tokens/cards',
      {
        number: input.number,
        cvc: input.cvc,
        exp_month: input.expMonth,
        exp_year: input.expYear,
        card_holder: input.cardHolder,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYMENT_GATEWAY_PUBLIC_KEY}`,
        },
      },
    );

    const cardToken = response.data?.data?.id;

    if (!cardToken) {
      throw new Error('La pasarela no devolvio un token de tarjeta.');
    }

    return cardToken as string;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.reason ??
        error.response?.data?.error?.message ??
        error.response?.data?.message ??
        'No fue posible tokenizar la tarjeta.';

      throw new Error(message);
    }

    throw error instanceof Error
      ? error
      : new Error('No fue posible tokenizar la tarjeta.');
  }
}
