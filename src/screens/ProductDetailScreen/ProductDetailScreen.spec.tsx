import React from 'react';
import { ActivityIndicator } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchProductDetail, selectProduct } from '../../store/slices/productsSlice';
import { ProductDetailScreen } from './ProductDetailScreen';

jest.mock('../../hooks/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('ProductDetailScreen', () => {
  const dispatch = jest.fn();

  const product = {
    id: 'p1',
    name: 'Producto 1',
    description: 'Descripcion',
    category: 'Categoria',
    imageUrl: 'https://example.com/a.png',
    price: 10000,
    currency: 'COP',
    stock: 2,
  };

  beforeEach(() => {
    dispatch.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
  });

  it('solicita detalle cuando no hay producto seleccionado', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ products: { selectedProduct: null, loading: false } }),
    );

    const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const route = { params: { productId: 'p1' } } as any;
    render(<ProductDetailScreen navigation={navigation} route={route} />);

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('permite ajustar cantidad y comprar', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ products: { selectedProduct: product, loading: false } }),
    );

    const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const route = { params: { productId: 'p1' } } as any;
    const screen = render(<ProductDetailScreen navigation={navigation} route={route} />);

    expect(screen.getByText('Producto 1')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();

    fireEvent.press(screen.getByText('+'));
    fireEvent.press(screen.getByText('+'));
    expect(screen.getByText('2')).toBeTruthy();

    fireEvent.press(screen.getByText('-'));
    fireEvent.press(screen.getByText('-'));
    expect(screen.getByText('1')).toBeTruthy();

    fireEvent.press(screen.getByText('Comprar ahora'));
    expect(dispatch).toHaveBeenCalledWith(selectProduct(product as any));
    expect(dispatch).toHaveBeenCalledWith(addToCart({ product, quantity: 1 } as any));
    expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
  });

  it('muestra loading cuando el producto aun no esta listo', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ products: { selectedProduct: null, loading: true } }),
    );

    const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const route = { params: { productId: 'p1' } } as any;
    const screen = render(<ProductDetailScreen navigation={navigation} route={route} />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('permite volver con el boton superior y no vuelve a pedir detalle si ya coincide', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ products: { selectedProduct: product, loading: false } }),
    );

    const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const route = { params: { productId: 'p1' } } as any;
    const screen = render(<ProductDetailScreen navigation={navigation} route={route} />);

    expect(dispatch).not.toHaveBeenCalledWith(expect.any(Function));
    fireEvent.press(screen.getByText('arrow-back'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
