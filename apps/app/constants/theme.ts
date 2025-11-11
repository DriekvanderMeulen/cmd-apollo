/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
	light: {
		text: '#11181C',
		background: '#fff',
		tint: '#81C7B4',
		accent: '#81C7B4',
		icon: '#687076',
		tabIconDefault: '#687076',
		tabIconSelected: '#81C7B4',
	},
	dark: {
		text: '#ECEDEE',
		background: '#151718',
		tint: '#EBBED3',
		accent: '#EBBED3',
		icon: '#9BA1A6',
		tabIconDefault: '#9BA1A6',
		tabIconSelected: '#EBBED3',
	},
}

export const Fonts = {
	sans: 'SFProText-Regular',
	serif: 'SFProText-Regular',
	rounded: 'SFProText-Regular',
	mono: 'SFProText-Regular',
}
