# Apollo Monorepo

Apollo contains the mobile viewer, universal link fallback, and shared CMS utilities that power the QR-to-portfolio experience.

## Structure

- `apps/apollo` – Expo React Native app (QR deep links, offline cache, video-first viewer)
- `apps/apollo-web` – Next.js universal link fallback (smart banner + in-browser playback)
- `apps/cms` – existing CMS dashboard
- `packages/cms` – shared zod schemas, CMS client, mock data, presign helpers
- `packages/ui` – design tokens and primitives reused across web + native
- `packages/eslint-config`, `packages/typescript-config` – linting / TS bases

## Environment Variables

### Shared (server + clients)

- `CMS_BASE_URL` – base HTTPS URL for the CMS API
- `CMS_ACCESS_TOKEN` – optional bearer token for authenticated requests
- `R2_PRESIGN_ENDPOINT` – service that returns `{ url, expiresAt }` for an asset key

### Expo app (`apps/apollo`)

- `EXPO_PUBLIC_CMS_BASE_URL`
- `EXPO_PUBLIC_CMS_ACCESS_TOKEN` *(optional)*
- `EXPO_PUBLIC_R2_PRESIGN_ENDPOINT`
- `EXPO_PUBLIC_UNIVERSAL_LINK_BASE` (e.g. `https://a.example.com`)
- `EXPO_PUBLIC_DEEP_LINK_SCHEME` (e.g. `apollo`)
- `EXPO_PUBLIC_IOS_APP_STORE_URL`, `EXPO_PUBLIC_ANDROID_PLAY_STORE_URL`

### Web fallback (`apps/apollo-web`)

- `NEXT_PUBLIC_IOS_APP_STORE_URL`
- `NEXT_PUBLIC_ANDROID_PLAY_STORE_URL`
- `NEXT_PUBLIC_DEEP_LINK_SCHEME`
- `NEXT_PUBLIC_R2_PRESIGN_ENDPOINT` *(falls back to server-side `R2_PRESIGN_ENDPOINT`)*
- `NEXT_PUBLIC_UNIVERSAL_LINK_BASE`

> Keep the raw R2 asset keys out of logs and analytics. Presign helpers handle encoding and caching.

## Getting Started

1. Install dependencies (the repo uses Bun workspaces):

   ```sh
   bun install
   ```

2. Create `.env` files for the apps you run (values listed above) or export the variables in your shell.

3. Start the desired targets:

   ```sh
   # Expo app
   cd apps/apollo
   bunx expo start

   # Web fallback
   cd apps/apollo-web
   bun dev

   # CMS (optional)
   cd apps/cms
   bun dev
   ```

   You can also filter with Turbo: `bunx turbo run dev --filter=apollo`.

## Testing

- Unit tests run with Vitest:

  ```sh
  bun run test
  ```

- Current coverage:
  - `packages/cms`: presign helper contract + external key detection
  - `apps/apollo`: mobile presign cache behaviour

## Smoke Test Checklist

1. **QR → App**: scan a link to an item with two iterations. Expect Apollo to open, autoplay the first video, reveal details after completion or swipe, and allow left/right navigation.
2. **No app installed**: open the same QR in Safari/Chrome without the app. Confirm the smart banner attempts the deep link, offers “Open in browser”, and shows the correct store link.
3. **Theme contrast**: toggle device/theme (light + dark). Primary red must meet WCAG AA (4.5:1 body, 3:1 large text). Details overlay gradient keeps white text legible on video stills.
4. **Offline revisit**: disable network, reopen the item from the View tab. Metadata and poster remain cached, video failure surfaces the retry + open-on-web actions.

## Useful Commands

- `bun run build` – build all apps and packages
- `bun run check-types` – type-check workspace
- `bun run lint` – lint everything via Turbo
- `bun run test` – execute Vitest suite
