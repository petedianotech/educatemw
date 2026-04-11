# Codemagic Setup Guide

This guide explains how to configure environment variables for the Android APK build in Codemagic.

## Prerequisites

- A Codemagic account (free tier available)
- Your Android keystore file (`.jks` file)
- The following secrets:
  - Keystore file (base64-encoded)
  - Keystore password
  - Key alias
  - Key password

## Step 1: Encode Your Keystore File

Before adding to Codemagic, you must base64-encode your keystore file:

```bash
base64 -i your-keystore.jks -o keystore-base64.txt
```

Or on macOS:
```bash
base64 -i your-keystore.jks > keystore-base64.txt
```

This will create a file with the base64-encoded keystore. Copy the entire contents.

## Step 2: Create Environment Variable Group in Codemagic UI

1. **Log in** to [Codemagic](https://codemagic.io)
2. **Go to** `Teams` → `Environment variables`
3. **Click** `Create new group`
4. **Name the group** exactly: `android_keys` (must match the name in codemagic.yaml)
5. **Add the following variables:**

| Variable Name | Value | Type |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Paste the entire base64-encoded keystore content | String (multiline) |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password | String |
| `ANDROID_KEY_ALIAS` | The alias of your signing key | String |
| `ANDROID_KEY_PASSWORD` | Your key's password | String |

⚠️ **Important:** Make sure to use **String (multiline)** for the `ANDROID_KEYSTORE_BASE64` variable to preserve the full base64 string.

## Step 3: Connect Repository

1. Go to your Codemagic dashboard
2. Click `Create app`
3. Select your GitHub repository (educatemw)
4. Codemagic will automatically detect the `codemagic.yaml` file

## Step 4: Trigger Build

The build will automatically trigger on:
- Push to `main` branch
- Pull requests
- Or manually from the Codemagic dashboard

## Troubleshooting

### Error: "base64: stdin: (null): error decoding base64 input stream"

This error means the base64 string has issues. Try:

1. **Remove extra whitespace:**
   ```bash
   base64 -i your-keystore.jks | tr -d '\n' | tr -d ' '
   ```

2. **Verify the variable is set correctly** in Codemagic:
   - The entire base64 string should be in the `ANDROID_KEYSTORE_BASE64` variable
   - No extra newlines or spaces at the beginning/end
   - Use "String (multiline)" type, not regular string

### Error: "Unrecognized named-value: 'secrets'"

This means the environment variable group wasn't properly imported. Ensure:
- The group name in `codemagic.yaml` is exactly `android_keys`
- The group exists in your Codemagic environment variables
- You've saved your changes and triggered a new build

## Verifying the Setup

Once configured, you can see in the Codemagic build logs:
1. ✅ **Install dependencies** - npm packages installed
2. ✅ **Build Angular** - Angular prod build completes
3. ✅ **Sync Capacitor** - Android platform synced
4. ✅ **Fix Gradle Wrapper** - Gradle updated
5. ✅ **Decode Keystore** - Keystore file created successfully
6. ✅ **Build Signed APK** - APK signed and generated
7. **Artifact: `app-release.apk`** - Available for download

## Getting Your Built APK

After a successful build:
1. Go to the build in Codemagic
2. Click on the `Artifacts` section
3. Download `app-release.apk`
4. Use this APK to distribute your app on Google Play Store

## Need Help?

- [Codemagic Documentation](https://docs.codemagic.io/)
- [Android Signing Guide](https://docs.codemagic.io/knowledge-base/android-code-signing/)
- [Environment Variables Guide](https://docs.codemagic.io/knowledge-base/environment-variables/)
