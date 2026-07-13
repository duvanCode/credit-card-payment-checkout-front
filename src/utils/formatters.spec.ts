import {
  formatCardNumber,
  formatCurrency,
  formatCvc,
  formatExpiryValue,
  formatTransactionDate,
  maskCardNumber,
} from './formatters';

describe('formatters', () => {
  it('formatea moneda en COP sin decimales', () => {
    expect(formatCurrency(100000)).toContain('$');
  });

  it('formatea numero de tarjeta con espacios', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('formatea expiracion y cvc', () => {
    expect(formatExpiryValue('12aa')).toBe('12');
    expect(formatCvc('12a34')).toBe('1234');
  });

  it('enmascara tarjeta', () => {
    expect(maskCardNumber('4242 4242 4242 4242')).toBe('**** **** **** 4242');
  });

  it('formatea fecha de transaccion', () => {
    const value = formatTransactionDate('2026-01-01T00:00:00.000Z');
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });
});

