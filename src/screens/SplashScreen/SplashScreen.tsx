import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Home'), 2500);
    return () => clearTimeout(timer);
  }, [navigation, opacity, scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.shimmer} />
      <Animated.View style={[styles.content, { opacity, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>C</Text>
        </View>
        <Text style={styles.title}>PayFlow</Text>
        <Text style={styles.subtitle}>Conectado de forma segura</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotSoft]} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotSoft]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    flex: 1,
    justifyContent: 'center',
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: scale(240),
    height: scale(320),
    position: 'absolute',
    width: scale(320),
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: scale(999),
    elevation: 8,
    height: scale(120),
    justifyContent: 'center',
    marginBottom: verticalScale(20),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: scale(120),
  },
  logoIcon: {
    color: colors.primarySoft,
    fontSize: moderateScale(44),
    fontWeight: '900',
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(32),
    fontWeight: '800',
    letterSpacing: scale(0.2),
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(15),
    marginTop: scale(10),
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: verticalScale(28),
  },
  dot: {
    backgroundColor: colors.white,
    borderRadius: scale(999),
    height: scale(8),
    opacity: 0.75,
    width: scale(8),
  },
  dotSoft: {
    opacity: 0.35,
  },
});
