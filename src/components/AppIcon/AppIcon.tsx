import React from 'react';
import { TextStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type IconName =
  | 'search'
  | 'more_vert'
  | 'storefront'
  | 'shopping_cart'
  | 'receipt_long'
  | 'arrow_back'
  | 'close'
  | 'lock'
  | 'check_circle'
  | 'cancel';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const iconMap: Record<IconName, string> = {
  search: 'search',
  more_vert: 'more-vert',
  storefront: 'storefront',
  shopping_cart: 'shopping-cart',
  receipt_long: 'receipt-long',
  arrow_back: 'arrow-back',
  close: 'close',
  lock: 'lock',
  check_circle: 'check-circle',
  cancel: 'cancel',
};

export function AppIcon({
  name,
  size = 20,
  color = '#000000',
  style,
}: AppIconProps) {
  return (
    <MaterialIcons
      allowFontScaling={false}
      color={color}
      name={iconMap[name]}
      size={size}
      style={style}
    />
  );
}
