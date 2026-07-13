import {
  detectCardType,
  isExpiryValid,
  validateCardForm,
  validateEmail,
  validateFullName,
  validateLuhn,
} from './cardValidation';

describe('cardValidation', () => {
  it('valida luhn', () => {
    expect(validateLuhn('4012 8888 8888 1881')).toBe(true);
    expect(validateLuhn('4012 8888 8888 1882')).toBe(false);
  });

  it('detecta tipo de tarjeta', () => {
    expect(detectCardType('4242 4242 4242 4242')).toBe('VISA');
    expect(detectCardType('5555 5555 5555 4444')).toBe('MASTERCARD');
    expect(detectCardType('123')).toBe('UNKNOWN');
  });

  it('valida expiracion con fecha actual', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    expect(isExpiryValid('12', '26')).toBe(true);
    expect(isExpiryValid('01', '25')).toBe(false);
    jest.useRealTimers();
  });

  it('valida email y nombre', () => {
    expect(validateEmail('a@b.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateFullName('ab')).toBe(false);
    expect(validateFullName('Juan')).toBe(true);
  });

  it('valida formulario y retorna errores', () => {
    const errors = validateCardForm({
      cardNumber: '123',
      holderName: '',
      expiryMonth: '00',
      expiryYear: '00',
      cvc: '1',
      email: 'bad',
      fullName: 'a',
      phoneNumber: 'xx',
      legalId: '',
      legalIdType: '',
    });

    expect(errors.cardNumber).toBeDefined();
    expect(errors.holderName).toBeDefined();
    expect(errors.expiry).toBeDefined();
    expect(errors.cvc).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.fullName).toBeDefined();
    expect(errors.phoneNumber).toBeDefined();
    expect(errors.legalId).toBeDefined();
    expect(errors.legalIdType).toBeDefined();
  });
});

