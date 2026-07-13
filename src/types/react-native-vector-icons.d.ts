declare module 'react-native-vector-icons/MaterialIcons' {
  import type { ComponentType } from 'react';
  import type { TextStyle, StyleProp } from 'react-native';

  interface MaterialIconsProps {
    allowFontScaling?: boolean;
    color?: string;
    name: string;
    size?: number;
    style?: StyleProp<TextStyle>;
  }

  const MaterialIcons: ComponentType<MaterialIconsProps>;

  export default MaterialIcons;
}
