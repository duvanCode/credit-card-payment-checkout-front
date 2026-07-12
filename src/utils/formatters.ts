export function formatCurrency(amount: number, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function formatCardNumber(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiryValue(value: string) {
  return value.replace(/\D/g, '').slice(0, 2);
}

export function formatCvc(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function maskCardNumber(value: string) {
  const cleaned = value.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

export function formatTransactionDate(value: string) {
  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
