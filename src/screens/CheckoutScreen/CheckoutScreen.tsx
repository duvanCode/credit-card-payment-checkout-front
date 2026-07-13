import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon/AppIcon';
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
} from '../../store/slices/transactionSlice';
import { InitiateTransactionFailure } from '../../services/transactions.service';
import { tokenizeCard } from '../../services/payment-gateway.service';
import { detectCardType, validateCardForm } from '../../utils/cardValidation';
import { formatCurrency } from '../../utils/formatters';
import { calculateProductPricing } from '../../utils/pricing';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';
import {
  CreditCardBackdrop,
  CreditCardFormState,
} from './components/CreditCardBackdrop';
import { PaymentSummaryBackdrop } from './components/PaymentSummaryBackdrop';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const DEBUG_SERVER_URL = 'http://192.168.1.10:7777/event';
const DEBUG_SESSION_ID = 'rejected-payment-screen';
const DEBUG_RUN_ID = 'post-fix';

function reportDebugEvent(
  hypothesisId: string,
  location: string,
  msg: string,
  data?: Record<string, unknown>,
) {
  void fetch(DEBUG_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: DEBUG_RUN_ID,
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
}

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

function isInitiateTransactionFailure(
  error: unknown,
): error is InitiateTransactionFailure {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'message' in error && 'status' in error;
}

export function CheckoutScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const transaction = useAppSelector(state => state.transaction);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [form, setForm] = useState<CreditCardFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const product = cart.product;
  const pricing = useMemo(() => {
    if (!product) {
      return calculateProductPricing(0, 0);
    }

    return calculateProductPricing(product.price, cart.quantity);
  }, [cart.quantity, product]);

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

    setCardModalVisible(false);
    setSummaryVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!product || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('[checkout] TOKENIZE_CARD_START');
      const cardToken = await tokenizeCard({
        number: form.cardNumber.replace(/\D/g, ''),
        cvc: form.cvc,
        expMonth: form.expiryMonth,
        expYear: form.expiryYear,
        cardHolder: form.holderName.trim(),
      });
      console.log('[checkout] TOKENIZE_CARD_SUCCESS');

      console.log('[checkout] INITIATE_PAYMENT_START', {
        productId: product.id,
        quantity: cart.quantity,
      });
      const response = await dispatch(
        initiatePayment({
          items: [
            {
              productId: product.id,
              quantity: cart.quantity,
            },
          ],
          installments: 1,
          cardToken,
          customerData: {
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            legalId: form.legalId.trim(),
            legalIdType: form.legalIdType.trim(),
          },
        }),
      ).unwrap();

      console.log('[checkout] INITIATE_PAYMENT_RESULT', response);

      if (response.status === 'APPROVED' || response.status === 'PENDING') {
        setSummaryVisible(false);
        showToast(
          response.status === 'APPROVED'
            ? 'Pago aprobado correctamente.'
            : 'Pago enviado. La orden quedo pendiente de confirmacion.',
          response.status === 'APPROVED' ? 'success' : 'info',
        );
        navigation.replace('TransactionResult', {
          transactionId: response.transactionId,
          status: response.status,
        });
        return;
      }

      showToast('El pago fue rechazado. Puedes intentarlo de nuevo.', 'error');
    } catch (error) {
      // #region debug-point C:checkout-catch
      reportDebugEvent(
        'C',
        'src/screens/CheckoutScreen/CheckoutScreen.tsx',
        '[DEBUG] Checkout catch received payment error',
        {
          isInitiateTransactionFailure: isInitiateTransactionFailure(error),
          message:
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error && 'message' in error
                ? String(error.message)
                : null,
          status:
            typeof error === 'object' && error && 'status' in error
              ? String(error.status)
              : null,
          transactionId:
            typeof error === 'object' && error && 'transactionId' in error
              ? String(error.transactionId ?? '')
              : null,
        },
      );
      // #endregion

      console.error('[checkout] INITIATE_PAYMENT_FAILURE', error);

      if (
        isInitiateTransactionFailure(error) &&
        (error.status === 'DECLINED' || error.status === 'VOIDED')
      ) {
        // #region debug-point C:checkout-navigation-rejected
        reportDebugEvent(
          'C',
          'src/screens/CheckoutScreen/CheckoutScreen.tsx',
          '[DEBUG] Checkout navigating to rejected transaction result',
          {
            status: error.status,
            transactionId: error.transactionId ?? null,
          },
        );
        // #endregion

        setSummaryVisible(false);
        navigation.replace('TransactionResult', {
          transactionId: error.transactionId,
          status: error.status,
        });
        return;
      }

      if (isInitiateTransactionFailure(error)) {
        const code =
          typeof error === 'object' && error && 'code' in error
            ? String(error.code ?? '')
            : '';

        if (code === 'INSUFFICIENT_STOCK') {
          setSummaryVisible(false);
          showToast('No hay stock disponible.', 'error');
          return;
        }

        showToast(error.message, 'error');
        return;
      }

      showToast(
        error instanceof Error ? error.message : 'No fue posible procesar el pago.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.emptyText}>Elige un producto para iniciar el proceso de compra.</Text>
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
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <AppIcon color={colors.primary} name="arrow_back" size={22} />
          </Pressable>
          <Text style={styles.topBarTitle}>Proceso de compra</Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Pago</Text>
            <Text style={styles.progressStep}>Paso 2 de 3</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>
        </View>

        <Text style={styles.title}>Finalizar compra</Text>
        <Text style={styles.subtitle}>Revisa tu compra antes de confirmar el pago.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Resumen de orden</Text>
          <View style={styles.summaryHero}>
            <View style={styles.summaryThumb}>
              <Text style={styles.summaryThumbText}>{product.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.summaryHeroContent}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.summaryMeta}>Cantidad: {cart.quantity}</Text>
              <Text style={styles.summaryPrice}>
                Base: {formatCurrency(product.price, product.currency)} c/u
              </Text>
            </View>
          </View>
          <View style={styles.summaryList}>
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
              <Text style={[styles.value, styles.freeValue]}>
                {formatCurrency(pricing.shipping, product.currency)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(pricing.total, product.currency)}</Text>
            </View>
          </View>
        </View>

        {!cardModalVisible ? (
          <Pressable onPress={() => setCardModalVisible(true)} style={[styles.primaryButton, styles.checkoutPayButton]}>
            <Text style={styles.primaryButtonText}>{strings.payWithCard}</Text>
          </Pressable>
        ) : null}
      </View>

      <CreditCardBackdrop
        errors={errors}
        form={form}
        onChange={handleChange}
        onClose={() => setCardModalVisible(false)}
        onContinue={handleContinue}
        submitting={isSubmitting}
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
        loading={isSubmitting}
        visible={summaryVisible}
      />

      <LoadingOverlay
        message={strings.paymentProcessing}
        visible={!summaryVisible && !cardModalVisible && (isSubmitting || transaction.loading)}
      />
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
    paddingBottom: verticalScale(24),
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: verticalScale(8),
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
  progressBlock: {
    marginBottom: verticalScale(12),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  progressLabel: {
    color: colors.primary,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  progressStep: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
  },
  progressTrack: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: scale(999),
    height: verticalScale(4),
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: colors.primary,
    borderRadius: scale(999),
    height: '100%',
    width: '66%',
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(26),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginBottom: verticalScale(16),
    marginTop: verticalScale(6),
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(22),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    padding: scale(18),
  },
  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: scale(0.8),
    marginBottom: verticalScale(14),
    textTransform: 'uppercase',
  },
  summaryHero: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  summaryThumb: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: scale(16),
    height: scale(72),
    justifyContent: 'center',
    marginRight: scale(14),
    width: scale(72),
  },
  summaryThumbText: {
    color: colors.primary,
    fontSize: moderateScale(26),
    fontWeight: '800',
  },
  summaryHeroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    color: colors.text,
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  summaryMeta: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
  },
  summaryPrice: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginTop: verticalScale(6),
  },
  summaryList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: verticalScale(14),
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
  freeValue: {
    color: colors.primary,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
  },
  checkoutPayButton: {
    marginBottom: verticalScale(32),
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
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
