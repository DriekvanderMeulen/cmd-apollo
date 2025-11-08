import 'dotenv/config'

export default ({ config }: { config: any }) => ({
	...config,
	extra: {
		...config.extra,
		cmsUrl: process.env.EXPO_PUBLIC_CMS_URL,
		cmsReadToken: process.env.EXPO_PUBLIC_CMS_READ_TOKEN,
	},
})
