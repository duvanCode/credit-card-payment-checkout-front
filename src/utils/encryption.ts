import CryptoJS from 'crypto-js';

const SECRET_KEY = 'payment-checkout-secret-2024';

export function encryptData<T extends object>(data: T) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData<T>(encrypted: string) {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error('No fue posible desencriptar la informacion.');
  }

  return JSON.parse(decrypted) as T;
}
