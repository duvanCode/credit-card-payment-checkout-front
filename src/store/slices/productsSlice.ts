import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getProductById, getProducts } from '../../services/products.service';
import { Product } from '../../types/product.types';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  return getProducts();
});

export const fetchProductDetail = createAsyncThunk(
  'products/fetchProductDetail',
  async (productId: string) => {
    return getProductById(productId);
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        if (state.selectedProduct) {
          state.selectedProduct =
            action.payload.find(product => product.id === state.selectedProduct?.id) ?? null;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'No fue posible cargar los productos.';
      })
      .addCase(fetchProductDetail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'No fue posible cargar el detalle del producto.';
      });
  },
});

export const { selectProduct, clearSelectedProduct } = productsSlice.actions;

export default productsSlice.reducer;
