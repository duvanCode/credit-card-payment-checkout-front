import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const baseProduct = {
    id: 'p1',
    name: 'Producto 1',
    description: 'Desc',
    category: 'Cat',
    imageUrl: 'https://example.com/a.png',
    price: 10000,
    currency: 'COP',
    stock: 10,
  };

  it('renderiza y dispara onPress', () => {
    const onPress = jest.fn();
    const screen = render(<ProductCard onPress={onPress} product={baseProduct as any} />);

    expect(screen.getByText('Producto 1')).toBeTruthy();
    fireEvent.press(screen.getByText('Producto 1'));
    expect(onPress).toHaveBeenCalledWith(baseProduct);
  });

  it('muestra badge de stock bajo', () => {
    const onPress = jest.fn();
    const product = { ...baseProduct, stock: 2 };
    const screen = render(<ProductCard onPress={onPress} product={product as any} />);
    expect(screen.getByText('2 restantes')).toBeTruthy();
  });
});
