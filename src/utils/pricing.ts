export const IVA_RATE = 0.19;
export const SHIPPING_FEE_COP = 5000;
export const SHIPPING_FEE_IN_CENTS = SHIPPING_FEE_COP * 100;

export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function calculateOrderPricing(subtotal: number): PricingBreakdown {
  const normalizedSubtotal = Math.max(0, subtotal);
  const tax = Math.round(normalizedSubtotal * IVA_RATE);
  const shipping = normalizedSubtotal > 0 ? SHIPPING_FEE_IN_CENTS : 0;

  return {
    subtotal: normalizedSubtotal,
    tax,
    shipping,
    total: normalizedSubtotal + tax + shipping,
  };
}

export function calculateProductPricing(unitPrice: number, quantity: number) {
  return calculateOrderPricing(unitPrice * quantity);
}
