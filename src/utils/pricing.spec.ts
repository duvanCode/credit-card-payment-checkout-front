import { calculateOrderPricing, calculateProductPricing, SHIPPING_FEE_IN_CENTS } from './pricing';

describe('pricing', () => {
  it('calcula subtotal, iva, envio y total', () => {
    const result = calculateOrderPricing(1000);
    expect(result.subtotal).toBe(1000);
    expect(result.shipping).toBe(SHIPPING_FEE_IN_CENTS);
    expect(result.total).toBe(result.subtotal + result.tax + result.shipping);
  });

  it('no cobra envio si subtotal es 0 o negativo', () => {
    expect(calculateOrderPricing(0).shipping).toBe(0);
    expect(calculateOrderPricing(-10).shipping).toBe(0);
  });

  it('calcula pricing por producto', () => {
    const result = calculateProductPricing(500, 2);
    expect(result.subtotal).toBe(1000);
  });
});

