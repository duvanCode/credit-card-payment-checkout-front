import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { strings } from '../../../constants/strings';
import { Product } from '../../../types/product.types';
import { CardType } from '../../../utils/cardValidation';
import { formatCurrency, maskCardNumber } from '../../../utils/formatters';
import { calculateProductPricing } from '../../../utils/pricing';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import { AppIcon } from '../../../components/AppIcon/AppIcon';

interface PaymentSummaryBackdropProps {
  visible: boolean;
  product: Product;
  quantity: number;
  cardNumber: string;
  cardType: CardType;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const SHEET_HEIGHT = '80%';

export function PaymentSummaryBackdrop({
  visible,
  product,
  quantity,
  cardNumber,
  cardType,
  onBack,
  onConfirm,
  loading = false,
}: PaymentSummaryBackdropProps) {
  const pricing = calculateProductPricing(product.price, quantity);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable disabled={loading} onPress={onBack} style={styles.backdropHitbox} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Resumen de pago</Text>
              <Text style={styles.subtitle}>Revisa los datos antes de confirmar.</Text>
            </View>
            <Pressable disabled={loading} onPress={onBack} style={styles.closeButton}>
              <AppIcon color={colors.textMuted} name="close" size={18} />
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{formatCurrency(pricing.subtotal, product.currency)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>IVA (19%)</Text>
              <Text style={styles.value}>{formatCurrency(pricing.tax, product.currency)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Envio</Text>
              <Text style={[styles.value, styles.highlightValue]}>
                {formatCurrency(pricing.shipping, product.currency)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Cantidad</Text>
              <Text style={styles.value}>{quantity}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(pricing.total, product.currency)}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Metodo de pago</Text>
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentBrand}>
              <Text style={styles.paymentBrandText}>
                {cardType === 'MASTERCARD' ? 'MC' : 'VISA'}
              </Text>
            </View>
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentMethodTitle}>{maskCardNumber(cardNumber)}</Text>
              <Text style={styles.paymentMethodSubtitle}>{product.name}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable disabled={loading} onPress={onBack} style={[styles.button, styles.secondaryButton, loading ? styles.buttonDisabled : undefined]}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Volver</Text>
            </Pressable>
            <Pressable disabled={loading} onPress={onConfirm} style={[styles.button, loading ? styles.buttonDisabled : undefined]}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{strings.confirmPayment}</Text>
              )}
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingHint}>
              <AppIcon color={colors.textMuted} name="lock" size={13} />
              <Text style={styles.loadingHintText}>Procesando pago de forma segura...</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropHitbox: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    display: 'flex',
    height: SHEET_HEIGHT,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(24),
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: scale(999),
    height: verticalScale(4),
    marginBottom: verticalScale(16),
    width: scale(34),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    marginBottom: verticalScale(18),
    marginTop: verticalScale(4),
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: scale(999),
    height: scale(40),
    justifyContent: 'center',
    width: scale(40),
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
    borderRadius: scale(18),
    borderWidth: 1,
    marginBottom: verticalScale(18),
    padding: scale(16),
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
  highlightValue: {
    color: colors.primary,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: verticalScale(4),
  },
  totalRow: {
    marginBottom: 0,
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
  sectionLabel: {
    color: colors.borderStrong,
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: scale(0.8),
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
  },
  paymentMethodCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
    borderRadius: scale(18),
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: verticalScale(18),
    padding: scale(14),
  },
  paymentBrand: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderRadius: scale(12),
    height: verticalScale(34),
    justifyContent: 'center',
    marginRight: scale(12),
    width: scale(52),
  },
  paymentBrandText: {
    color: colors.primary,
    fontSize: moderateScale(14),
    fontWeight: '900',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  paymentMethodSubtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
  actions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: 'auto',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(16),
    flex: 1,
    paddingVertical: verticalScale(14),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceContainerLow,
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
  loadingHint: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(14),
  },
  loadingHintText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginLeft: scale(6),
  },
});
