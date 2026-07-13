import { decryptData, encryptData } from './encryption';

describe('encryption', () => {
  it('encripta y desencripta', () => {
    const payload = { hello: 'world' };
    const encrypted = encryptData(payload);
    const decrypted = decryptData<typeof payload>(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it('lanza error si no se puede desencriptar', () => {
    expect(() => decryptData('invalid')).toThrow('No fue posible desencriptar la informacion.');
  });
});

