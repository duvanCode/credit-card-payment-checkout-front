import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { moderateScale, scale } from '../../utils/responsive';

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
      <Animated.View style={{ opacity, transform: [{ scale: scaleAnim }] }}>
        <Text style={styles.title}>Checkout Mobile</Text>
        <Text style={styles.subtitle}>Compra segura y rapida</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(32),
    fontWeight: '800',
    letterSpacing: scale(0.2),
    textAlign: 'center',
  },
  subtitle: {
    color: colors.accentSoft,
    fontSize: moderateScale(15),
    marginTop: scale(10),
    textAlign: 'center',
  },
});
