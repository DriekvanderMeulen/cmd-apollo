# Deep Linking Configuration

These files enable universal links (iOS) and app links (Android) for the app.

## Files

- `apple-app-site-association` - iOS universal links configuration
- `assetlinks.json` - Android app links configuration

## Setup Instructions

### iOS (apple-app-site-association)

1. When building the app with EAS Build, you'll get a Team ID
2. Update the `TEAM_ID` placeholder in `apple-app-site-association` with your actual Apple Team ID
3. The file format should be: `TEAM_ID.com.apolloview.app` (e.g., `ABC123DEFG.com.apolloview.app`)

### Android (assetlinks.json)

1. When you build the Android app, get the SHA-256 fingerprint of your signing certificate
2. Replace `SHA256_FINGERPRINT_HERE` in `assetlinks.json` with your actual SHA-256 fingerprint
3. You can get the fingerprint using:
   ```bash
   keytool -list -v -keystore your-keystore.jks -alias your-alias
   ```

## Deployment

These files must be accessible at:

- `https://app.apolloview.app/.well-known/apple-app-site-association`
- `https://app.apolloview.app/.well-known/assetlinks.json`

Make sure your Vercel deployment serves these files with the correct headers:

- `Content-Type: application/json` (or no content-type for iOS AASA)
- Accessible without authentication
