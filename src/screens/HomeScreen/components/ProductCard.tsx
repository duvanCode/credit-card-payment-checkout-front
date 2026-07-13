import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { Product } from '../../../types/product.types';
import { formatCurrency } from '../../../utils/formatters';
import { calculateProductPricing } from '../../../utils/pricing';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const lowStock = product.stock < 5;
  const stockLabel = lowStock ? `${product.stock} restantes` : 'Disponible';
  const pricing = calculateProductPricing(product.price, 1);

  return (
    <Pressable onPress={() => onPress(product)} style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image resizeMode="cover" source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={[styles.stockBadge, lowStock ? styles.stockBadgeAlert : styles.stockBadgeNeutral]}>
          <Text style={styles.stockBadgeText}>{stockLabel}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.category}>
          {product.category}
        </Text>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatCurrency(pricing.total, product.currency)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(18),
    borderWidth: 1,
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    width: '48%',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainer,
    width: '100%',
  },
  stockBadge: {
    borderRadius: scale(999),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    position: 'absolute',
    right: scale(10),
    top: verticalScale(10),
  },
  stockBadgeAlert: {
    backgroundColor: colors.primary,
  },
  stockBadgeNeutral: {
    backgroundColor: colors.primarySoft,
  },
  stockBadgeText: {
    color: colors.white,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  body: {
    gap: verticalScale(6),
    padding: scale(12),
  },
  category: {
    color: colors.textMuted,
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: scale(0.7),
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontWeight: '700',
    minHeight: verticalScale(40),
  },
  price: {
    color: colors.primary,
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
});
