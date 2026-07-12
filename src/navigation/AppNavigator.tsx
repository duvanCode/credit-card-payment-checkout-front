import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen/CheckoutScreen';
import { TransactionResultScreen } from '../screens/TransactionResultScreen/TransactionResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TransactionResult" component={TransactionResultScreen} />
    </Stack.Navigator>
  );
}
