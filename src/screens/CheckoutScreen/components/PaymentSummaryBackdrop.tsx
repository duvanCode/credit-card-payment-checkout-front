import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { strings } from '../../../constants/strings';
import { Product } from '../../../types/product.types';
import { CardType } from '../../../utils/cardValidation';
import { formatCurrency, maskCardNumber } from '../../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';

interface PaymentSummaryBackdropProps {
  visible: boolean;
  product: Product;
  quantity: number;
  cardNumber: string;
  cardType: CardType;
  onBack: () => void;
  onConfirm: () => void;
}

export function PaymentSummaryBackdrop({
  visible,
  product,
  quantity,
  cardNumber,
  cardType,
  onBack,
  onConfirm,
}: PaymentSummaryBackdropProps) {
  const total = product.price * quantity;

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Resumen del pago</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Producto</Text>
            <Text style={styles.value}>{product.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Cantidad</Text>
            <Text style={styles.value}>{quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatCurrency(total, product.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Tarjeta</Text>
            <Text style={styles.value}>
              {cardType === 'UNKNOWN' ? 'Tarjeta' : cardType} {maskCardNumber(cardNumber)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, product.currency)}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={onBack} style={[styles.button, styles.secondaryButton]}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Volver</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.button}>
              <Text style={styles.buttonText}>{strings.confirmPayment}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: scale(20),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: scale(24),
    padding: scale(20),
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(18),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  label: {
    color: colors.textMuted,
    flex: 1,
    fontSize: moderateScale(14),
  },
  value: {
    color: colors.text,
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '700',
    textAlign: 'right',
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: verticalScale(6),
    paddingTop: verticalScale(16),
  },
  totalLabel: {
    color: colors.text,
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  totalValue: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(18),
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    flex: 1,
    paddingVertical: verticalScale(14),
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  secondaryText: {
    color: colors.text,
  },
});
