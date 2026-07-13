import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectProduct, setSearchQuery, setSelectedCategory } from '../../store/slices/productsSlice';
import { HomeScreen } from './HomeScreen';

jest.mock('../../hooks/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('HomeScreen', () => {
  const dispatch = jest.fn();

  const baseProduct = {
    id: 'p1',
    name: 'Producto 1',
    description: 'Descripcion',
    category: 'Categoria',
    imageUrl: 'https://example.com/a.png',
    price: 10000,
    currency: 'COP',
    stock: 10,
  };

  const setProductsState = (partial: any) => {
    const state = {
      items: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: 'Todos',
      ...partial,
    };

    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({ products: state }),
    );
  };

  beforeEach(() => {
    dispatch.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
  });

  it('muestra estado de carga', () => {
    setProductsState({ loading: true });
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(<HomeScreen navigation={navigation} route={{} as any} />);
    expect(screen.getByText('Cargando productos...')).toBeTruthy();
  });

  it('muestra estado de error y reintenta', () => {
    setProductsState({ loading: false, error: 'fallo' });
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(<HomeScreen navigation={navigation} route={{} as any} />);

    expect(screen.getByText('No pudimos cargar el catalogo')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('filtra, navega y permite abrir buscador', () => {
    setProductsState({ items: [baseProduct], searchQuery: 'zzz' });
    const navigation = { navigate: jest.fn() } as any;
    const screen = render(<HomeScreen navigation={navigation} route={{} as any} />);

    expect(screen.getByText('No encontramos productos con esos filtros.')).toBeTruthy();

    (useAppSelector as jest.Mock).mockImplementation((selector: any) =>
      selector({
        products: {
          items: [baseProduct],
          loading: false,
          error: null,
          searchQuery: '',
          selectedCategory: 'Todos',
        },
      }),
    );

    screen.rerender(<HomeScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Producto 1'));
    expect(dispatch).toHaveBeenCalledWith(selectProduct(baseProduct as any));
    expect(navigation.navigate).toHaveBeenCalledWith('ProductDetail', { productId: 'p1' });

    fireEvent.press(screen.getByText('Ordenes'));
    expect(navigation.navigate).toHaveBeenCalledWith('Orders');

    fireEvent.press(screen.getAllByText('search')[0]);
    expect(screen.getByPlaceholderText('Buscar productos')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Buscar productos'), 'abc');
    expect(dispatch).toHaveBeenCalledWith(setSearchQuery('abc'));

    fireEvent.press(screen.getAllByText('search')[0]);
    expect(dispatch).toHaveBeenCalledWith(setSearchQuery(''));

    fireEvent.press(screen.getByText('Todos'));
    expect(dispatch).toHaveBeenCalledWith(setSelectedCategory('Todos'));
  });
});
