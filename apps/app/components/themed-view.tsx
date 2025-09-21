import { cssInterop } from 'nativewind';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: 'background' | 'card' | 'border';
};

export function ThemedView({ style, lightColor, darkColor, colorName = 'background', ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

cssInterop(ThemedView, { className: 'style' })
