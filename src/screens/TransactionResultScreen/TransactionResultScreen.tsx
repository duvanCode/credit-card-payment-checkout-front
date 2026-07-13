import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { RootStackParamList } from '../../navigation/types';
import { clearCart } from '../../store/slices/cartSlice';
import { clearTransaction } from '../../store/slices/transactionSlice';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

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

function getStatusLabel(status: string) {
  if (status === 'APPROVED') {
    return 'APROBADO';
  }

  if (status === 'PENDING') {
    return 'PENDIENTE';
  }

  if (status === 'VOIDED') {
    return 'ANULADO';
  }

  if (status === 'DECLINED') {
    return 'RECHAZADO';
  }

  return status;
}

export function TransactionResultScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const transaction = useAppSelector(state => state.transaction.currentTransaction);
  const status = route.params.status;
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';

  useEffect(() => {
    // #region debug-point E:result-screen-mounted
    reportDebugEvent(
      'E',
      'src/screens/TransactionResultScreen/TransactionResultScreen.tsx',
      '[DEBUG] TransactionResult mounted',
      {
        routeStatus: route.params.status,
        routeTransactionId: route.params.transactionId ?? null,
        storeTransactionId: transaction?.transactionId ?? null,
      },
    );
    // #endregion

    if (isApproved) {
      dispatch(clearCart());
    }
  }, [dispatch, isApproved, route.params.status, route.params.transactionId, transaction?.transactionId]);

  const handleBackToStore = () => {
    dispatch(clearCart());
    dispatch(clearTransaction());
    navigation.popToTop();
  };

  const displayTransactionId =
    transaction?.transactionId ?? route.params.transactionId ?? 'No disponible';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View
          style={[
            styles.iconCircle,
            isApproved ? styles.successCircle : isPending ? styles.pendingCircle : styles.errorCircle,
          ]}>
          <Text style={styles.iconText}>{isApproved ? 'OK' : isPending ? '...' : '!'}</Text>
        </View>
        <Text style={styles.title}>
          {isApproved ? 'Pago exitoso' : isPending ? 'Pago pendiente' : 'Pago rechazado'}
        </Text>
        <Text style={styles.subtitle}>
          {isApproved
            ? 'Tu transaccion fue registrada correctamente.'
            : isPending
              ? 'La pasarela recibio tu pago y estamos esperando la confirmacion final.'
              : 'El pago no se pudo completar. Puedes volver e intentarlo otra vez.'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Detalles de la transaccion</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Transaccion</Text>
            <Text style={styles.value}>{displayTransactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <Text
              style={[
                styles.value,
                isApproved ? styles.successText : isPending ? styles.pendingText : styles.errorText,
              ]}>
              {getStatusLabel(status)}
            </Text>
          </View>
          {transaction ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Producto</Text>
                <Text style={styles.value}>{transaction.product.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cantidad</Text>
                <Text style={styles.value}>{transaction.product.quantity}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Monto</Text>
                <Text style={styles.value}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha</Text>
                <Text style={styles.value}>{formatTransactionDate(transaction.createdAt)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {!isApproved && !isPending ? (
          <Pressable
            onPress={() => navigation.replace('Checkout')}
            style={[styles.button, styles.secondaryButton]}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>{strings.tryAgain}</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={handleBackToStore} style={styles.button}>
          <Text style={styles.buttonText}>{strings.backToStore}</Text>
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
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: scale(20),
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: scale(999),
    height: scale(84),
    justifyContent: 'center',
    marginBottom: verticalScale(18),
    width: scale(84),
  },
  successCircle: {
    backgroundColor: colors.successSoft,
  },
  errorCircle: {
    backgroundColor: colors.dangerSoft,
  },
  pendingCircle: {
    backgroundColor: colors.accentSoft,
  },
  iconText: {
    color: colors.primary,
    fontSize: moderateScale(26),
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(28),
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    marginBottom: verticalScale(20),
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(20),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    padding: scale(18),
    width: '100%',
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: scale(0.8),
    marginBottom: verticalScale(14),
    textTransform: 'uppercase',
  },
  row: {
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
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
  pendingText: {
    color: colors.primary,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(16),
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(15),
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: colors.text,
  },
});
