import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProducts, selectProduct } from '../../store/slices/productsSlice';
import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types/product.types';
import { ProductCard } from './components/ProductCard';
import { colors } from '../../constants/colors';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleOpenProduct = (product: Product) => {
    dispatch(selectProduct(product));
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Productos destacados</Text>
          <Text style={styles.subtitle}>Selecciona un producto y completa tu checkout.</Text>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.stateText}>Cargando productos...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>No pudimos cargar el catalogo</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => dispatch(fetchProducts())} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.listContent}
            data={items}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => <ProductCard onPress={handleOpenProduct} product={item} />}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  header: {
    paddingBottom: verticalScale(12),
    paddingTop: verticalScale(8),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(28),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(6),
  },
  listContent: {
    paddingBottom: verticalScale(24),
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  stateText: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: '800',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    marginTop: verticalScale(16),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
  },
  retryText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});
