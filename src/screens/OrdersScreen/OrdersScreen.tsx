import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { colors } from '../../constants/colors';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { RootStackParamList } from '../../navigation/types';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

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

export function OrdersScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <AppIcon color={colors.primary} name="arrow_back" size={22} />
          </Pressable>
          <View>
            <Text style={styles.topBarTitle}>Ordenes</Text>
            <Text style={styles.subtitle}>Revisa las ordenes registradas recientemente.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.stateText}>Cargando ordenes...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>No pudimos cargar las ordenes</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => dispatch(fetchOrders())} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={items}
            keyExtractor={item => item.transactionId}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.reference}>{item.reference}</Text>
                    <Text style={styles.date}>{formatTransactionDate(item.createdAt)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.status,
                      item.status === 'APPROVED'
                        ? styles.statusApproved
                        : item.status === 'PENDING'
                          ? styles.statusPending
                          : styles.statusRejected,
                    ]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Producto</Text>
                  <Text style={styles.value}>{item.product.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Cantidad</Text>
                  <Text style={styles.value}>{item.product.quantity}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Monto</Text>
                  <Text style={styles.value}>{formatCurrency(item.amount, item.currency)}</Text>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={styles.errorTitle}>Aun no hay ordenes</Text>
                <Text style={styles.stateText}>Cuando completes pagos veras el historial aqui.</Text>
              </View>
            }
          />
        ) : null}
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
    flex: 1,
    padding: scale(16),
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: verticalScale(18),
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
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
  },
  listContent: {
    gap: verticalScale(14),
    paddingBottom: verticalScale(24),
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(18),
    borderWidth: 1,
    padding: scale(16),
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  reference: {
    color: colors.text,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  date: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
  status: {
    borderRadius: scale(999),
    fontSize: moderateScale(11),
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
  statusApproved: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  statusRejected: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  statusPending: {
    backgroundColor: colors.accentSoft,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  label: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
  },
  value: {
    color: colors.text,
    flexShrink: 1,
    fontSize: moderateScale(13),
    fontWeight: '700',
    paddingLeft: scale(16),
    textAlign: 'right',
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  stateText: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: '800',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    marginTop: verticalScale(16),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
  },
  retryText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});
