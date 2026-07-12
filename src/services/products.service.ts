import { Product } from '../types/product.types';
import { api } from './api';

export async function getProducts() {
  console.log('[products] GET', `${api.defaults.baseURL}/products`);
  try {
    const response = await api.get('/products');
    console.log('[products] OK', Array.isArray(response.data.data) ? response.data.data.length : 0);
    return response.data.data as Product[];
  } catch (error) {
    console.log(
      '[products] ERROR',
      error instanceof Error ? error.message : 'Error desconocido al cargar productos',
    );
    throw error;
  }
}

export async function getProductById(productId: string) {
  const response = await api.get(`/products/${productId}`);
  return response.data.data as Product;
}
