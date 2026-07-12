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

export function TransactionResultScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const transaction = useAppSelector(state => state.transaction.currentTransaction);
  const status = route.params.status;
  const isApproved = status === 'APPROVED';

  useEffect(() => {
    if (isApproved) {
      dispatch(clearCart());
    }
  }, [dispatch, isApproved]);

  const handleBackToStore = () => {
    dispatch(clearCart());
    dispatch(clearTransaction());
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, isApproved ? styles.successCircle : styles.errorCircle]}>
          <Text style={styles.iconText}>{isApproved ? 'OK' : 'X'}</Text>
        </View>
        <Text style={styles.title}>{isApproved ? 'Pago exitoso' : 'Pago rechazado'}</Text>
        <Text style={styles.subtitle}>
          {isApproved
            ? 'Tu transaccion fue registrada correctamente.'
            : 'El pago no se pudo completar. Puedes volver e intentarlo otra vez.'}
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Transaccion</Text>
            <Text style={styles.value}>{transaction?.transactionId ?? route.params.transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <Text style={[styles.value, isApproved ? styles.successText : styles.errorText]}>
              {status}
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

        {!isApproved ? (
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
    height: scale(90),
    justifyContent: 'center',
    marginBottom: verticalScale(18),
    width: scale(90),
  },
  successCircle: {
    backgroundColor: colors.successSoft,
  },
  errorCircle: {
    backgroundColor: colors.dangerSoft,
  },
  iconText: {
    color: colors.text,
    fontSize: moderateScale(28),
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(20),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    padding: scale(18),
    width: '100%',
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
