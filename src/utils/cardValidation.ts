export type CardType = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export function validateLuhn(number: string) {
  const cleaned = number.replace(/\D/g, '');

  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = cleaned.length - 1; index >= 0; index -= 1) {
    let digit = Number(cleaned[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\D/g, '');

  if (/^4\d{12,18}$/.test(cleaned)) {
    return 'VISA';
  }

  if (
    /^5[1-5]\d{14}$/.test(cleaned) ||
    /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/.test(cleaned)
  ) {
    return 'MASTERCARD';
  }

  return 'UNKNOWN';
}

export function isExpiryValid(month: string, year: string) {
  if (!/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{2}$/.test(year)) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = Number(String(currentDate.getFullYear()).slice(-2));
  const currentMonth = currentDate.getMonth() + 1;
  const expiryYear = Number(year);
  const expiryMonth = Number(month);

  return expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth);
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateFullName(fullName: string) {
  return fullName.trim().length >= 3;
}

export function validateCardForm(input: {
  cardNumber: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
}) {
  const errors: Record<string, string> = {};
  const cleanedCardNumber = input.cardNumber.replace(/\D/g, '');
  const cardType = detectCardType(cleanedCardNumber);

  if (!cleanedCardNumber || cardType === 'UNKNOWN' || !validateLuhn(cleanedCardNumber)) {
    errors.cardNumber = 'Ingresa una tarjeta VISA o MasterCard valida.';
  }

  if (!validateFullName(input.holderName)) {
    errors.holderName = 'Ingresa el nombre del titular.';
  }

  if (!isExpiryValid(input.expiryMonth, input.expiryYear)) {
    errors.expiry = 'La fecha de expiracion no es valida.';
  }

  if (!/^\d{3,4}$/.test(input.cvc)) {
    errors.cvc = 'El CVV debe tener 3 o 4 digitos.';
  }

  if (!validateEmail(input.email)) {
    errors.email = 'Ingresa un correo valido.';
  }

  if (!validateFullName(input.fullName)) {
    errors.fullName = 'Ingresa el nombre completo del cliente.';
  }

  if (!/^\d{7,15}$/.test(input.phoneNumber.replace(/\D/g, ''))) {
    errors.phoneNumber = 'Ingresa un telefono valido.';
  }

  if (!input.legalId.trim()) {
    errors.legalId = 'Ingresa el documento del cliente.';
  }

  if (!input.legalIdType.trim()) {
    errors.legalIdType = 'Selecciona el tipo de documento.';
  }

  return errors;
}
