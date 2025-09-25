import * as SecureStore from 'expo-secure-store'
import * as Network from 'expo-network'

const KEY_ALLOW_CELLULAR = 'allowCellularData'

export async function getAllowCellularData(): Promise<boolean> {
	const raw = await SecureStore.getItemAsync(KEY_ALLOW_CELLULAR)
	if (raw === 'true') return true
	if (raw === 'false') return false
	return false
}

export async function setAllowCellularData(allow: boolean): Promise<void> {
	await SecureStore.setItemAsync(KEY_ALLOW_CELLULAR, allow ? 'true' : 'false')
}

export async function ensureNetworkAllowed(): Promise<void> {
	const state = await Network.getNetworkStateAsync()
	const allow = await getAllowCellularData()
	if (!state.isConnected || state.isInternetReachable === false) {
		throw new Error('No internet connection')
	}
	if (!allow && state.type === Network.NetworkStateType.CELLULAR) {
		throw new Error('Cellular data usage is disabled')
	}
}


