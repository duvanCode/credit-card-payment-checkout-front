import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { Product } from '../../../types/product.types';
import { formatCurrency } from '../../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const lowStock = product.stock < 5;

  return (
    <Pressable onPress={() => onPress(product)} style={styles.card}>
      <Image resizeMode="cover" source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.category}>
            {product.category}
          </Text>
          {lowStock ? (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Pocas unidades</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatCurrency(product.price, product.currency)}</Text>
        <Text style={styles.stock}>Stock disponible: {product.stock}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(18),
    borderWidth: 1,
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    width: '48%',
  },
  image: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    width: '100%',
  },
  body: {
    gap: verticalScale(6),
    padding: scale(12),
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: colors.accentSoft,
    borderRadius: scale(999),
    color: colors.accent,
    fontSize: moderateScale(11),
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  lowStockBadge: {
    backgroundColor: colors.warning,
    borderRadius: scale(999),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
  },
  lowStockText: {
    color: colors.white,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  name: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontWeight: '700',
    minHeight: verticalScale(40),
  },
  price: {
    color: colors.primary,
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  stock: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
  },
});
