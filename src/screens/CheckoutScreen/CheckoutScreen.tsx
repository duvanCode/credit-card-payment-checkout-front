import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingOverlay } from '../../components/LoadingOverlay/LoadingOverlay';
import { Toast } from '../../components/Toast/Toast';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { RootStackParamList } from '../../navigation/types';
import { clearCart } from '../../store/slices/cartSlice';
import {
  clearTransaction,
  initiatePayment,
  resetPaymentStatus,
  setCardData,
} from '../../store/slices/transactionSlice';
import { detectCardType, validateCardForm } from '../../utils/cardValidation';
import { formatCurrency } from '../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import {
  CreditCardBackdrop,
  CreditCardFormState,
} from './components/CreditCardBackdrop';
import { PaymentSummaryBackdrop } from './components/PaymentSummaryBackdrop';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const initialFormState: CreditCardFormState = {
  cardNumber: '4242 4242 4242 4242',
  holderName: 'JUAN PEREZ',
  expiryMonth: '12',
  expiryYear: '29',
  cvc: '123',
  email: 'cliente@correo.com',
  fullName: 'Juan Perez',
  phoneNumber: '3001234567',
  legalId: '123456789',
  legalIdType: 'CC',
};

export function CheckoutScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const transaction = useAppSelector(state => state.transaction);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [form, setForm] = useState<CreditCardFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const product = cart.product;
  const total = useMemo(() => cart.totalAmount, [cart.totalAmount]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(previous => ({ ...previous, visible: false }));
  };

  const handleChange = (field: keyof CreditCardFormState, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => {
      if (!previous[field] && !(field === 'expiryMonth' || field === 'expiryYear')) {
        return previous;
      }

      const nextErrors = { ...previous };
      delete nextErrors[field];
      if (field === 'expiryMonth' || field === 'expiryYear') {
        delete nextErrors.expiry;
      }
      return nextErrors;
    });
  };

  const handleContinue = () => {
    const nextErrors = validateCardForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    dispatch(
      setCardData({
        number: form.cardNumber.replace(/\D/g, ''),
        holderName: form.holderName.trim(),
        expiryMonth: form.expiryMonth,
        expiryYear: form.expiryYear,
        cvc: form.cvc,
      }),
    );
    setCardModalVisible(false);
    setSummaryVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!product) {
      return;
    }

    try {
      const response = await dispatch(
        initiatePayment({
          productId: product.id,
          quantity: cart.quantity,
          installments: 1,
          cardData: {
            number: form.cardNumber.replace(/\D/g, ''),
            holderName: form.holderName.trim(),
            expiryMonth: form.expiryMonth,
            expiryYear: form.expiryYear,
            cvc: form.cvc,
          },
          customerData: {
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            legalId: form.legalId.trim(),
            legalIdType: form.legalIdType.trim(),
          },
        }),
      ).unwrap();

      if (response.status === 'APPROVED') {
        setSummaryVisible(false);
        showToast('Pago aprobado correctamente.', 'success');
        navigation.replace('TransactionResult', {
          transactionId: response.transactionId,
          status: response.status,
        });
        return;
      }

      showToast('El pago fue rechazado. Puedes intentarlo de nuevo.', 'error');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No fue posible procesar el pago.', 'error');
    }
  };

  const handleBackToStore = () => {
    dispatch(clearCart());
    dispatch(clearTransaction());
    navigation.popToTop();
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay producto seleccionado</Text>
          <Text style={styles.emptyText}>Elige un producto para iniciar el checkout.</Text>
          <Pressable onPress={handleBackToStore} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{strings.backToStore}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Resumen del pedido</Text>
        <Text style={styles.subtitle}>Revisa tu compra antes de confirmar el pago.</Text>

        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Cantidad</Text>
            <Text style={styles.value}>{cart.quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Precio unitario</Text>
            <Text style={styles.value}>{formatCurrency(product.price, product.currency)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, product.currency)}</Text>
          </View>
        </View>

        <Pressable onPress={() => setCardModalVisible(true)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{strings.payWithCard}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            dispatch(resetPaymentStatus());
            setSummaryVisible(false);
            setCardModalVisible(false);
          }}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancelar pago</Text>
        </Pressable>
      </View>

      <CreditCardBackdrop
        errors={errors}
        form={form}
        onChange={handleChange}
        onClose={() => setCardModalVisible(false)}
        onContinue={handleContinue}
        visible={cardModalVisible}
      />

      <PaymentSummaryBackdrop
        cardNumber={form.cardNumber}
        cardType={detectCardType(form.cardNumber)}
        onBack={() => {
          setSummaryVisible(false);
          setCardModalVisible(true);
        }}
        onConfirm={handleConfirmPayment}
        product={product}
        quantity={cart.quantity}
        visible={summaryVisible}
      />

      <LoadingOverlay message={strings.paymentProcessing} visible={transaction.loading} />
      <Toast
        message={toast.message}
        onHide={hideToast}
        type={toast.type}
        visible={toast.visible}
      />
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
    padding: scale(16),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(28),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginBottom: verticalScale(20),
    marginTop: verticalScale(6),
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(22),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    padding: scale(18),
  },
  productName: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  label: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
  },
  value: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: verticalScale(8),
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(10),
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: scale(24),
  },
  emptyTitle: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    marginBottom: verticalScale(16),
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
});
