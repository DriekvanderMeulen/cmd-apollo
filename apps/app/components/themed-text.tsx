import { cssInterop } from 'nativewind';
import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  className,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const defaultColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const variantClass =
    type === 'title'
      ? 'text-[32px] leading-[32px] font-bold'
      : type === 'defaultSemiBold'
      ? 'text-base leading-6 font-semibold'
      : type === 'subtitle'
      ? 'text-[20px] font-bold'
      : type === 'link'
      ? 'text-[16px] leading-[30px]'
      : 'text-base leading-6';

  const colorStyle = { color: type === 'link' ? '#0a7ea4' : defaultColor } as const;

  return (
    <Text className={variantClass + (className ? ` ${className}` : '')} style={[colorStyle, style]} {...rest} />
  );
}

cssInterop(ThemedText, { className: 'style' })
