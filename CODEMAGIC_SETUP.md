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

## Step 1: Verify Your Keystore Locally

Before anything else, verify that your keystore credentials are correct on your local machine:

```bash
# List all keys in your keystore
keytool -list -v -keystore your-keystore.jks -storepass YOUR_KEYSTORE_PASSWORD

# Check if your specific key alias exists
keytool -list -keystore your-keystore.jks -storepass YOUR_KEYSTORE_PASSWORD -alias YOUR_KEY_ALIAS

# Verify the key password works
keytool -list -keystore your-keystore.jks -storepass YOUR_KEYSTORE_PASSWORD -alias YOUR_KEY_ALIAS -keypass YOUR_KEY_PASSWORD
```

If any of these commands fail:
- **Wrong keystore password**: The first command will fail
- **Wrong key alias**: The second command will fail and show you which aliases are available
- **Wrong key password**: The third command will fail

Once all three commands succeed, your credentials are correct and ready to use.

## Step 2: Encode Your Keystore File

Before adding to Codemagic, you must base64-encode your keystore file:

```bash
base64 -i your-keystore.jks -o keystore-base64.txt
```

Or on macOS:
```bash
base64 -i your-keystore.jks > keystore-base64.txt
```

This will create a file with the base64-encoded keystore. Copy the entire contents.

## Step 3: Create Environment Variable Group in Codemagic UI

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

## Step 4: Connect Repository

1. Go to your Codemagic dashboard
2. Click `Create app`
3. Select your GitHub repository (educatemw)
4. Codemagic will automatically detect the `codemagic.yaml` file

## Step 5: Trigger Build

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

### Error: "No key with alias '...' found in keystore"

This error means one of your keystore credentials is incorrect. The Codemagic build now includes a validation step that will tell you exactly which credential is wrong:

1. **Check the build logs** in Codemagic for one of these messages:
   - ❌ "Cannot open keystore with the provided ANDROID_KEYSTORE_PASSWORD" → Wrong keystore password
   - ❌ "Key alias ... NOT found in keystore" → Wrong key alias or doesn't exist
   - ❌ "Cannot access key with the provided ANDROID_KEY_PASSWORD" → Wrong key password

2. **Verify your credentials locally:**
   ```bash
   # Test your keystore password
   keytool -list -v -keystore your-keystore.jks -storepass YOUR_KEYSTORE_PASSWORD
   
   # This will show you all available key aliases if the password is correct
   # Check that your ANDROID_KEY_ALIAS matches exactly
   ```

3. **Update the credentials** in Codemagic if they were wrong

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
