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
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { RootStackParamList } from '../../navigation/types';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchProductDetail, selectProduct } from '../../store/slices/productsSlice';
import { formatCurrency } from '../../utils/formatters';
import { calculateProductPricing } from '../../utils/pricing';
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

  const pricing = useMemo(() => {
    if (!product) {
      return calculateProductPricing(0, 0);
    }

    return calculateProductPricing(product.price, quantity);
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
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <AppIcon color={colors.primary} name="arrow_back" size={22} />
          </Pressable>
          <Text style={styles.topBarTitle}>Proceso de compra</Text>
        </View>

        <View style={styles.heroCard}>
          <Image resizeMode="cover" source={{ uri: product.imageUrl }} style={styles.image} />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Calidad premium</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.titleColumn}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.subtitle}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureChip}>
            <Text style={styles.featureText}>{product.category}</Text>
          </View>
          <View style={styles.featureChip}>
            <Text style={styles.featureText}>{product.stock} disponibles</Text>
          </View>
          <View style={styles.featureChip}>
            <Text style={styles.featureText}>Pago seguro</Text>
          </View>
        </View>

        <View style={styles.quantityCard}>
          <View style={styles.quantityHeader}>
            <View>
              <Text style={styles.sectionTitle}>Cantidad</Text>
              <Text style={styles.sectionHint}>Limite segun stock disponible</Text>
            </View>
            <Text style={styles.stock}>Stock: {product.stock}</Text>
          </View>
          <View style={styles.quantityRow}>
            <Pressable onPress={handleDecrease} style={[styles.quantityButton, styles.quantityButtonMuted]}>
              <Text style={[styles.quantityButtonText, styles.quantityButtonTextMuted]}>-</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable onPress={handleIncrease} style={[styles.quantityButton, styles.quantityButtonPrimary]}>
              <Text style={[styles.quantityButtonText, styles.quantityButtonTextPrimary]}>+</Text>
            </Pressable>
          </View>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatCurrency(pricing.subtotal, product.currency)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>IVA (19%)</Text>
              <Text style={styles.priceValue}>{formatCurrency(pricing.tax, product.currency)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Envio</Text>
              <Text style={styles.priceValue}>{formatCurrency(pricing.shipping, product.currency)}</Text>
            </View>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(pricing.total, product.currency)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <View style={styles.footerPriceBlock}>
          <Text style={styles.footerPriceLabel}>Precio</Text>
          <Text style={styles.footerPrice}>{formatCurrency(pricing.total, product.currency)}</Text>
        </View>
        <Pressable onPress={handleBuyNow} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>{strings.buyNow}</Text>
        </Pressable>
      </View>
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
    paddingBottom: verticalScale(120),
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderRadius: scale(999),
    height: scale(42),
    justifyContent: 'center',
    marginRight: scale(12),
    width: scale(42),
  },
  topBarTitle: {
    color: colors.primary,
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: scale(24),
    marginBottom: verticalScale(18),
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    aspectRatio: 1.25,
    backgroundColor: colors.surfaceMuted,
    width: '100%',
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    position: 'absolute',
    right: scale(16),
    top: verticalScale(16),
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  titleColumn: {
    flex: 1,
    paddingRight: scale(16),
  },
  stock: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(26),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
  },
  descriptionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: scale(18),
    marginBottom: verticalScale(16),
    padding: scale(16),
  },
  description: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(18),
  },
  featureChip: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: scale(999),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
  },
  featureText: {
    color: colors.primary,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  quantityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(20),
    borderWidth: 1,
    padding: scale(18),
  },
  quantityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  priceBreakdown: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: verticalScale(18),
    paddingTop: verticalScale(16),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
  },
  priceValue: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  quantityButton: {
    alignItems: 'center',
    borderRadius: scale(999),
    height: scale(42),
    justifyContent: 'center',
    width: scale(42),
  },
  quantityButtonMuted: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderWidth: 1,
  },
  quantityButtonPrimary: {
    backgroundColor: colors.primary,
  },
  quantityButtonText: {
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  quantityButtonTextMuted: {
    color: colors.primary,
  },
  quantityButtonTextPrimary: {
    color: colors.white,
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
    marginTop: verticalScale(8),
    paddingTop: verticalScale(6),
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
  footerBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(18),
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
  footerPriceBlock: {
    flex: 1,
    paddingRight: scale(12),
  },
  footerPriceLabel: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(4),
  },
  footerPrice: {
    color: colors.primary,
    fontSize: moderateScale(22),
    fontWeight: '900',
  },
  buyButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(16),
    minWidth: scale(156),
    paddingVertical: verticalScale(16),
  },
  buyButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
});
