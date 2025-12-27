# Play Store Deployment Guide for Koine Greek Vocab

This guide walks you through deploying the Koine Greek Vocab PWA to the Google Play Store using Trusted Web Activity (TWA).

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console/signup

2. **Java Development Kit (JDK) 11+**
   ```bash
   sudo apt install openjdk-11-jdk
   ```

3. **Android SDK** (or Android Studio)
   - Download: https://developer.android.com/studio
   - Or install command-line tools only

4. **Bubblewrap CLI** (already installed)
   ```bash
   npm install -g @bubblewrap/cli
   ```

## Step 1: Set Up Android SDK

```bash
# Set environment variables (add to ~/.bashrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Accept licenses
yes | sdkmanager --licenses
```

## Step 2: Initialize TWA Project

```bash
cd android-twa

# Initialize from the manifest
bubblewrap init --manifest https://koine-vocab.vercel.app/manifest.json

# Or use the local twa-manifest.json
bubblewrap init --manifest ./twa-manifest.json
```

Follow the prompts:
- **Package ID**: com.pilgrimcovenant.koinegreek
- **App name**: Koine Greek Vocab
- **Launcher name**: Koine Greek
- **Theme color**: #16a34a

## Step 3: Create Signing Keystore

```bash
# Generate a new keystore (KEEP THIS SAFE!)
keytool -genkey -v -keystore android.keystore -alias koine-greek -keyalg RSA -keysize 2048 -validity 10000

# Remember your passwords!
```

**IMPORTANT**: Back up your keystore file and passwords securely. You cannot update your app without them!

## Step 4: Build the APK/AAB

```bash
# Build release APK
bubblewrap build

# Or build Android App Bundle (recommended for Play Store)
bubblewrap build --skipSigning
# Then sign manually with bundletool
```

## Step 5: Set Up Digital Asset Links

Create `/.well-known/assetlinks.json` on your web server (in the Next.js public folder):

```bash
# Get your app's SHA-256 fingerprint
keytool -list -v -keystore android.keystore -alias koine-greek
```

Create `/public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pilgrimcovenant.koinegreek",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

## Step 6: Prepare Play Store Listing

### Required Assets

1. **App Icon**: 512x512 PNG (already have: /icons/icon-512.png)
2. **Feature Graphic**: 1024x500 PNG
3. **Screenshots**:
   - Phone: 16:9 or 9:16, min 320px, max 3840px
   - 7" Tablet: Similar ratios
   - 10" Tablet: Similar ratios
   - At least 2 phone screenshots required

### Store Listing Information

- **Title**: Koine Greek Vocab (max 30 chars)
- **Short Description**: Master NT Greek vocabulary with spaced repetition (max 80 chars)
- **Full Description**: (see below)
- **Category**: Education
- **Tags**: Greek, Bible, Vocabulary, Language Learning, Christianity

### Suggested Full Description

```
Master New Testament Greek vocabulary with Koine Greek Vocab - the comprehensive spaced repetition app designed for serious Bible students.

FEATURES:
- 600+ carefully curated vocabulary words from the Greek NT
- Smart spaced repetition system (SRS) for efficient learning
- Multiple study modes: Flashcards, Quiz, Typing Practice
- Passage Translation practice with real NT verses
- Grammar drills: Parse words, study paradigms, practice forms
- Kittel's TDNT theological word studies
- Vine's Expository Dictionary synonym distinctions
- Greek Gems: Insights lost in English translation
- Progress tracking and daily goals
- Works offline once installed

CONTENT:
- Vocabulary organized by frequency (5 tiers)
- 96 Kittel's TDNT theological word studies
- 72 Vine's synonym distinction groups
- Greek NT translation exercises
- Grammar paradigm tables and practice

Perfect for:
- Seminary and Bible college students
- Pastors and teachers wanting to read the Greek NT
- Self-taught Greek learners
- Anyone passionate about understanding Scripture in the original language

Start your journey to reading the Greek New Testament today!
```

## Step 7: Submit to Play Store

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing details
4. Upload your signed AAB file
5. Complete the content questionnaire
6. Submit for review

## Step 8: Post-Launch

After approval:
1. Monitor crash reports and reviews
2. Update the app by incrementing `appVersionCode` and `appVersionName`
3. Rebuild and upload new version

## Troubleshooting

### "Digital Asset Links verification failed"
- Ensure assetlinks.json is accessible at https://koine-vocab.vercel.app/.well-known/assetlinks.json
- Verify SHA-256 fingerprint matches your keystore
- Check for CORS issues

### App shows Chrome browser bar
- Digital Asset Links not verified
- Package name mismatch
- Fingerprint mismatch

### Build errors
```bash
# Clean and rebuild
bubblewrap build --clean
```

## Important Files

- `twa-manifest.json` - TWA configuration
- `android.keystore` - Signing key (KEEP SAFE!)
- `app/build/outputs/` - Generated APK/AAB files

## Version History

| Version | Code | Notes |
|---------|------|-------|
| 1.0.0   | 1    | Initial release |
