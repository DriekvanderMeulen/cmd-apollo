# Day 1 Implementation - Test Checklist

## Comparison Summary

**Branch**: `staging` vs `main`
**Files Changed**: 27 files
**Key Changes**:
- Expo app setup with TypeScript, ESLint, Prettier
- TanStack Query with AsyncStorage persistence
- API client wrapper (`src/api/http.ts`)
- Deep linking configuration (universal links + custom scheme)
- CMS public endpoints (`/api/v1/objects/public/*`)
- Web fallback page (`/object/[publicId]`)
- Settings screen with version/build info
- AASA file in CMS (`/public/.well-known/apple-app-site-association`)

## Issues Found

### Critical
1. ❌ **ESLint error in app**: `eslint-config-expo` compatibility issue with ESLint 9.x
2. ❌ **Missing assetlinks.json**: Android Asset Links file not found in `apps/cms/public/.well-known/`
3. ⚠️ **Dual navigation systems**: Both expo-router (`app/`) and React Navigation (`src/`) are present - may cause conflicts

### Warnings
1. ⚠️ **CMS lint warnings**: Several unused imports/variables (non-blocking)
2. ⚠️ **Deep link path mismatch**: App.tsx uses `object/:publicId` but expo-router uses `[publicId]` - may need alignment

## Test Checklist

### Issue 1.1 - Repo Reset and Expo Scaffold
- [ ] **TypeScript compilation**: Run `cd apps/app && npm run typecheck` ✅ (PASSED)
- [ ] **iOS simulator**: Run `npm run ios` - verify app launches
- [ ] **Android simulator**: Run `npm run android` - verify app launches
- [ ] **Prettier check**: Run `npm run format` - verify no formatting issues
- [ ] **ESLint**: Run `npm run lint` - ⚠️ (CURRENTLY FAILING - see Issues)
- [ ] **Screen placeholders**: Verify all 4 screens exist:
  - [ ] `ScanInstructionsScreen` exists
  - [ ] `LibraryScreen` exists
  - [ ] `ItemDetailScreen` exists
  - [ ] `SettingsScreen` exists

### Issue 1.2 - State Management and API Client
- [ ] **TanStack Query installed**: Check `package.json` for `@tanstack/react-query` ✅
- [ ] **AsyncStorage persister**: Check `package.json` for `@tanstack/query-async-storage-persister` ✅
- [ ] **QueryProvider**: Verify `src/providers/QueryProvider.tsx` exists and exports provider ✅
- [ ] **24-hour stale time**: Verify `staleTime: 24 * 60 * 60 * 1000` in QueryClient ✅
- [ ] **API client wrapper**: Verify `src/api/http.ts` exists ✅
- [ ] **Base URL injection**: Verify `EXPO_PUBLIC_CMS_URL` environment variable handling ✅
- [ ] **Read token injection**: Verify `EXPO_PUBLIC_CMS_READ_TOKEN` environment variable handling ✅
- [ ] **GET request support**: Verify `api.get()` function exists ✅
- [ ] **Ping endpoint test**: 
  - [ ] Add `PingStatus` component to a screen (e.g., Library)
  - [ ] Verify it calls `/api/ping` and displays response
  - [ ] Verify data persists across app restarts (close/reopen app)

### Issue 1.3 - Web Fallback Route
- [ ] **Page exists**: Verify `apps/cms/app/object/[publicId]/page.tsx` exists ✅
- [ ] **Fetch object data**: Verify page calls CMS API endpoint ✅
- [ ] **Display title**: Verify title is displayed ✅
- [ ] **Display poster**: Verify poster image is displayed if available ✅
- [ ] **Install banner**: Verify banner with App Store/Play Store links exists ✅
- [ ] **Manual test**: 
  - [ ] Visit `https://cms.apolloview.app/object/<test-publicId>` in mobile browser
  - [ ] Verify page loads and displays content
  - [ ] Verify install banner is visible

### Issue 1.4 - Universal Link Pattern
- [ ] **Deep link config**: Verify `App.tsx` has `linking` configuration ✅
- [ ] **Universal link prefix**: Verify `https://cms.apolloview.app` is in prefixes ✅
- [ ] **Custom scheme**: Verify `apolloview://` is in prefixes ✅
- [ ] **Route pattern**: Verify `object/:publicId` pattern matches ✅
- [ ] **Navigation setup**: Verify `ItemDetail` screen is registered in navigation ✅
- [ ] **Expo Router config**: Verify `app/_layout.tsx` has `[publicId]` route ✅
- [ ] **Manual tests**:
  - [ ] **iOS**: Send universal link via Notes/Safari - verify app opens and navigates
  - [ ] **Android**: Send universal link via Chrome - verify app opens and navigates
  - [ ] **Custom scheme**: Test `apolloview://object/<test-id>` - verify app opens
  - [ ] **Without app**: Test universal link on device without app - verify web fallback opens

### Issue 1.5 - AASA and Asset Links
- [ ] **AASA file exists**: Verify `apps/cms/public/.well-known/apple-app-site-association` exists ✅
- [ ] **AASA JSON valid**: Run `cat apps/cms/public/.well-known/apple-app-site-association | jq .` - verify valid JSON ✅
- [ ] **AASA hosted**: Test `curl https://cms.apolloview.app/.well-known/apple-app-site-association` - verify returns file
- [ ] **AASA content-type**: Verify response has correct headers (no `Content-Type` or `application/json`)
- [ ] **Asset Links file**: ❌ **MISSING** - Create `apps/cms/public/.well-known/assetlinks.json`
- [ ] **Asset Links hosted**: Test `curl https://cms.apolloview.app/.well-known/assetlinks.json` - verify returns file
- [ ] **Bundle ID matches**: Verify AASA `appID` matches `app.json` bundle identifier (format: `TEAM_ID.com.apolloview.app`)
- [ ] **Package name matches**: Verify assetlinks `package_name` matches Android package name
- [ ] **Associated domains**: Verify `app.json` has `associatedDomains: ["applinks:cms.apolloview.app"]` ✅
- [ ] **iOS verification**: 
  - [ ] Install app on iOS device
  - [ ] Long-press universal link - verify no "Open in Browser?" prompt
- [ ] **Android verification**:
  - [ ] Install app on Android device
  - [ ] Tap universal link - verify app opens directly

### Issue 1.6 - Settings Screen
- [ ] **Screen exists**: Verify `src/screens/SettingsScreen.tsx` exists ✅
- [ ] **Version display**: Verify version is displayed (from `Constants.expoConfig?.version`) ✅
- [ ] **Build number display**: Verify build number is displayed ✅
- [ ] **Privacy link**: Verify link to `https://cms.apolloview.app/privacy-terms-conditions` exists ✅
- [ ] **Contact link**: Verify mailto link to `hello@driek.dev` exists ✅
- [ ] **Links clickable**: Test both links - verify they open correctly
- [ ] **Manual test**: Navigate to Settings tab - verify all elements display correctly

### Issue 1.7 - CMS Endpoints Skeleton
- [ ] **List endpoint**: Verify `apps/cms/app/api/v1/objects/public/route.ts` exists ✅
- [ ] **Detail endpoint**: Verify `apps/cms/app/api/v1/objects/public/[publicId]/route.ts` exists ✅
- [ ] **GET /objects query params**: Test endpoint with:
  - [ ] `?public=true` (verify only public items)
  - [ ] `?page=1&pageSize=10` (verify pagination)
  - [ ] `?sort=title:asc` (verify sorting)
  - [ ] `?sort=id:desc` (verify sorting)
  - [ ] `?filter=categoryId:1` (verify filtering)
  - [ ] `?search=test` (verify search)
- [ ] **GET /object/:publicId**: Test endpoint with valid publicId:
  - [ ] Verify returns object data
  - [ ] Verify includes `title`, `description`, `user`, `collection`, `category`
  - [ ] Verify includes `posterUrl` (signed URL)
  - [ ] Verify includes `videoUrl` (signed URL if available)
  - [ ] Verify includes `iterations` array sorted by date ASC ✅
  - [ ] Verify includes `version` field in response ✅
- [ ] **ETag header**: Verify responses include `ETag` header ✅
- [ ] **Version field**: Verify responses include `version` field in JSON body ✅
- [ ] **Bearer token auth**: Verify endpoints require `Authorization: Bearer <token>` header
- [ ] **Public-only filter**: Verify list endpoint only returns `public=true` items ✅
- [ ] **CORS headers**: Verify endpoints include CORS headers for cross-origin requests ✅
- [ ] **Error handling**: Test with invalid publicId - verify 404 response
- [ ] **Manual API tests**:
  ```bash
  # List endpoint
  curl -H "Authorization: Bearer <token>" \
    "https://cms.apolloview.app/api/v1/objects/public?page=1&pageSize=10"
  
  # Detail endpoint
  curl -H "Authorization: Bearer <token>" \
    "https://cms.apolloview.app/api/v1/objects/public/<publicId>"
  ```

## Integration Tests

### End-to-End Flow
- [ ] **QR Code → App**: Generate QR code with `https://cms.apolloview.app/object/<id>`, scan with app installed - verify opens ItemDetail screen
- [ ] **QR Code → Web**: Scan QR code without app installed - verify opens web fallback page
- [ ] **App → API**: Open app, navigate to Library - verify fetches objects from CMS API
- [ ] **App → Detail**: Tap object in Library - verify navigates to ItemDetail with correct publicId
- [ ] **Deep link → Detail**: Send deep link while app is closed - verify app opens directly to ItemDetail

### Cross-Platform
- [ ] **iOS**: Test all features on iOS simulator/device
- [ ] **Android**: Test all features on Android simulator/device

## Build & Deploy Checks

- [ ] **CMS build**: Run `cd apps/cms && npm run build` - verify successful
- [ ] **CMS deploy**: Deploy to Vercel - verify `.well-known` files are accessible
- [ ] **App build**: Run `cd apps/app && npx expo prebuild` - verify no errors
- [ ] **Environment variables**: Verify `EXPO_PUBLIC_CMS_URL` and `EXPO_PUBLIC_CMS_READ_TOKEN` are set

## Recommended Fixes Before Testing

1. **Fix ESLint config**: Update `apps/app/eslint.config.js` to be compatible with ESLint 9.x
2. **Create assetlinks.json**: Add Android Asset Links file to `apps/cms/public/.well-known/`
3. **Clarify navigation**: Decide on expo-router vs React Navigation - currently both exist

