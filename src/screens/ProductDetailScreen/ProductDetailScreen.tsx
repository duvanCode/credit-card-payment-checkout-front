import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { RootStackParamList } from '../../navigation/types';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchProductDetail, selectProduct } from '../../store/slices/productsSlice';
import { formatCurrency } from '../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { productId } = route.params;
  const { selectedProduct, loading } = useAppSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!selectedProduct || selectedProduct.id !== productId) {
      dispatch(fetchProductDetail(productId));
    }
  }, [dispatch, productId, selectedProduct]);

  const product = selectedProduct?.id === productId ? selectedProduct : null;

  const total = useMemo(() => {
    if (!product) {
      return 0;
    }

    return product.price * quantity;
  }, [product, quantity]);

  const handleDecrease = () => setQuantity(current => Math.max(current - 1, 1));
  const handleIncrease = () => {
    if (!product) {
      return;
    }

    setQuantity(current => Math.min(current + 1, product.stock));
  };

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    dispatch(selectProduct(product));
    dispatch(addToCart({ product, quantity }));
    navigation.navigate('Checkout');
  };

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image resizeMode="cover" source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={styles.metaRow}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.stock}>Stock: {product.stock}</Text>
        </View>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price, product.currency)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.quantityCard}>
          <Text style={styles.sectionTitle}>Cantidad</Text>
          <View style={styles.quantityRow}>
            <Pressable onPress={handleDecrease} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable onPress={handleIncrease} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, product.currency)}</Text>
          </View>
        </View>

        <Pressable onPress={handleBuyNow} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>{strings.buyNow}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: scale(16),
    paddingBottom: verticalScale(28),
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    aspectRatio: 1.25,
    backgroundColor: colors.surfaceMuted,
    borderRadius: scale(24),
    marginBottom: verticalScale(16),
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  category: {
    color: colors.accent,
    fontSize: moderateScale(12),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stock: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(28),
    fontWeight: '800',
    marginBottom: verticalScale(8),
  },
  price: {
    color: colors.primary,
    fontSize: moderateScale(24),
    fontWeight: '900',
    marginBottom: verticalScale(16),
  },
  description: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(20),
  },
  quantityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(20),
    borderWidth: 1,
    padding: scale(18),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontWeight: '800',
    marginBottom: verticalScale(14),
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    height: scale(42),
    justifyContent: 'center',
    width: scale(42),
  },
  quantityButtonText: {
    color: colors.white,
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  quantityValue: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginHorizontal: scale(24),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  totalValue: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontWeight: '900',
  },
  buyButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: scale(16),
    marginTop: verticalScale(20),
    paddingVertical: verticalScale(16),
  },
  buyButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
});
