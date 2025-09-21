/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useAppTheme } from '../components/app-theme-provider'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof mapColorName>
) {
  const { resolvedScheme, colors } = useAppTheme()
  const colorFromProps = resolvedScheme === 'dark' ? props.dark : props.light
  const palette = mapColorName(colors)
  return colorFromProps ? colorFromProps : palette[colorName]
}

function mapColorName(colors: { text: string; background: string; tint: string; icon: string; tabIconDefault: string; tabIconSelected: string; border: string; card: string }) {
  return {
    text: colors.text,
    background: colors.background,
    tint: colors.tint,
    icon: colors.icon,
    tabIconDefault: colors.tabIconDefault,
    tabIconSelected: colors.tabIconSelected,
    border: colors.border,
    card: colors.card,
  } as const
}
