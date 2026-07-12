import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

export function Toast({ message, type, visible, duration = 3000, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide, opacity, translateY, visible]);

  if (!visible) {
    return null;
  }

  const backgroundColor =
    type === 'error' ? colors.danger : type === 'success' ? colors.success : colors.primarySoft;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { backgroundColor, opacity, transform: [{ translateY }] },
      ]}>
      <View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(16),
    bottom: verticalScale(24),
    left: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    position: 'absolute',
    right: scale(16),
    zIndex: 20,
  },
  message: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});
