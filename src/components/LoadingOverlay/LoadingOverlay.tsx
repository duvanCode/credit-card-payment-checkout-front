import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = 'Procesando pago...',
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator color={colors.white} size="large" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(18),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
  },
  message: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '600',
    marginTop: verticalScale(14),
  },
});
