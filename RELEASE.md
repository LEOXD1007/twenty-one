# Releasing Twenty-One

You do not need a Mac to enroll, to create the App Store record, or to get a build onto TestFlight. You do need an Apple Developer Program membership, and a macOS build somewhere. The path below uses Codemagic for that Mac. GitHub Actions on `macos-15` is the alternative, with the Fastlane lane in `fastlane/Fastfile`. Xcode on a Mac you control is the same archive, done by hand.

Bundle id, already set in the project: `app.twentyone.nights`  
Version: 1.0 (build 1)  
Display name: Twenty-One, and 廿一 when the device is Chinese  
Privacy policy and support pages to host first: `store/privacy-policy.html`, `store/support.html`

Host them anywhere that serves public HTTPS. GitHub Pages from this repo is enough. Replace `you@example.com` in both files before you submit. Apple and Google will reject a listing with no privacy URL.

## 1. Apple Developer Program

1. Sign in at [developer.apple.com/account](https://developer.apple.com/account) with the Apple ID that will own the app. Any browser, no Mac.
2. Enroll in the Apple Developer Program. For one person, choose Individual. An Organization enrollment needs a D-U-N-S number and takes longer.
3. Pay the yearly fee (USD 99, or the local equivalent). Wait until the account says the membership is active. Individual enrollment is often the same day, and sometimes two days if Apple asks for an ID check.

## 2. App ID and the App Store Connect record

1. [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources) → Identifiers → App IDs → +.
2. Type: App. Description: Twenty-One. Bundle ID: Explicit, `app.twentyone.nights`.
3. Capabilities: leave them off. Local notifications do not need a capability. Push is not used. Sign in with Apple is not used. In-App Purchase does not need a checkbox on the App ID for a non-consumable you add later.
4. Register.
5. [App Store Connect](https://appstoreconnect.apple.com) → Apps → New App.
   - Platforms: iOS
   - Name: Twenty-One
   - Primary language: English (U.S.)
   - Bundle ID: app.twentyone.nights
   - SKU: `twentyone` (any unique string, never shown to users)
   - User access: Full Access
6. Add the Simplified Chinese localization with the copy in `store/listing-zh.md`. English copy is in `store/listing-en.md`.
7. App Information: category Lifestyle, secondary Health & Fitness if you want it. Content rights: this app does not contain third-party content.
8. Age rating: the answers in `store/age-rating.md`. Expected result is 4+.
9. App Privacy: Data Not Collected, from `store/app-privacy.md`.
10. Pricing: free. Availability: United States and the rest of the world. Uncheck any country you do not want.
11. Privacy Policy URL and Support URL: the pages you hosted.

Do not submit yet. There is no build.

## 3. Signing and uploading without a Mac (Codemagic)

Codemagic is the recommendation. It creates the distribution certificate and the provisioning profile from an App Store Connect API key, builds the Xcode project, and uploads to TestFlight. You never open Xcode.

### API key

1. App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys.
2. Generate a key. Name: Twenty-One CI. Access: App Manager.
3. Download the `.p8` once. Store the Issuer ID, the Key ID, and the file somewhere that is not this git repo.

### Codemagic

1. [codemagic.io](https://codemagic.io) → add this repository.
2. Team settings → Integrations → App Store Connect → add the issuer id, key id, and `.p8`. Name the integration `twenty-one-asc`.
3. The workflow in `codemagic.yaml` is `ios-testflight`. Point the workflow’s code signing at that integration, bundle id `app.twentyone.nights`, distribution type App Store. Codemagic’s “automatic code signing” fetches or creates the certificate and profile.
4. Start the workflow. It runs `npm ci`, `npm run sync`, then `xcode-project build-ipa` on `ios/App/App.xcworkspace`, scheme `App`.
5. Publishing is set to upload to TestFlight and not to send the app to review.

The first build’s bundle id must already exist (step 2). If Codemagic says the profile cannot be created, the API key is missing Admin or App Manager, or the membership is not active yet.

### GitHub Actions instead

`workflow_dispatch` only, so it does not run on every push. Add these repository secrets:

| Secret | Value |
|---|---|
| `ASC_KEY_ID` | the key id |
| `ASC_ISSUER_ID` | the issuer id |
| `ASC_KEY_P8_BASE64` | `base64 -i AuthKey_XXXX.p8` |
| `APPLE_TEAM_ID` | the 10-character Team ID from developer.apple.com → Membership |

Then run the “iOS TestFlight” workflow. The lane `ios beta` in `fastlane/Fastfile` creates a distribution certificate with `cert`, a profile with `sigh`, archives, and uploads. The runner is `macos-15`. GitHub’s free macOS minutes are limited. Codemagic is the calmer default for a private repo.

The certificate Fastlane creates lives in the Apple account. Later builds reuse it. If you also sign on a Mac later, export that certificate or you will have two.

## 4. Signing in Xcode, if you have a Mac

1. `npm install && npm run sync`
2. Open `ios/App/App.xcworkspace` (the workspace, not the `xcodeproj` alone, so the Swift package resolves).
3. Target App → Signing & Capabilities → Team: your team. Automatically manage signing: on. Bundle identifier must stay `app.twentyone.nights`.
4. Destination: Any iOS Device (arm64). Product → Archive.
5. Organizer → Distribute App → App Store Connect → Upload. Leave bitcode off (Xcode no longer offers it).
6. Export compliance is already answered in Info.plist: `ITSAppUsesNonExemptEncryption` is false, because the app only uses HTTPS provided by the system.

## 5. TestFlight

1. App Store Connect → TestFlight. Wait until the build finishes processing. The first one can take half an hour, and Apple may email about missing compliance. The plist key above usually skips that.
2. Internal testing is available to App Store Connect users on your team immediately.
3. External testing needs a short Beta App Review. Answer the export-compliance question “No” if it is asked again. What to test: “Check in by holding the center while the window is open. Miss the window and the cycle ends. Star map keeps the history.”
4. Install from the TestFlight app on an iPhone. Confirm: English or Chinese follows the device language, the debug button is absent, a reminder appears in Settings → Notifications → Twenty-One after you turn the switch on, and a day-21 card (you can stage one on a debug web build, export, and import the JSON into TestFlight) shares through the system sheet.

## 6. Submit to the App Store

1. Attach the TestFlight build to the iOS version 1.0.
2. Screenshots: `store/screenshots.md`. English set required. Chinese set if you added that localization.
3. Description, subtitle, keywords: `store/listing-en.md`, `store/listing-zh.md`, `store/keywords.md`.
4. Review notes, paste this:

```
Twenty-One is a 21-day self-discipline check-in. It is not a wrapped website: the UI is bundled in the app, reminders are local notifications, haptics run on check-in, and records are stored in on-device preferences.

No account. Nothing is for sale in this version. The purchase client is not initialized because no product id is configured.

To see a finished cycle without waiting 21 days: on the Star map sheet, use Import with a backup you made, or simply use the app for one check-in. The window is the three hours after the time set on the first screen. Holding the center lights the star only while that window is open.
```

5. Add a demo account only if you create one. You do not have one. Leave it blank.
6. Submit. Review is often a day, sometimes longer for a first app. If the rejection is guideline 4.2, reply with the three native pieces: scheduled local notifications that fire when the app is closed, haptics on the five tiers, and the share sheet for the day-21 card. Do not remove them to “simplify” the binary.

## 7. Google Play

Google Play is a separate account. The Android project is already in `android/` and a debug APK has been produced with `./gradlew assembleDebug` (package `app.twentyone.nights`, versionCode 1).

### Account and the store entry

1. [play.google.com/console](https://play.google.com/console) → create a developer account. The one-time fee is USD 25. Identity verification can take a few days.
2. Create app. App name: Twenty-One. Default language: English (United States). App or game: App. Free. Confirm the declarations.
3. Add the Simplified Chinese store listing from `store/listing-zh.md`.
4. Policy → App content, in this order:
   - Privacy policy: the same URL as Apple.
   - Ads: No.
   - App access: all functionality is available without special access. No login.
   - Content rating: the questionnaire in `store/age-rating.md`. Digital purchases: No, until Pro exists.
   - Target audience: not a children’s app. 18 and older. Do not join Designed for Families.
   - News app: No. COVID-19: No. Data safety: the answers in `store/app-privacy.md`. Government apps: No.
   - Advertising ID: No. The app does not use the advertising id.

### Upload key and the bundle

Play requires an Android App Bundle, signed with an upload key. Let Google hold the app signing key (Play App Signing). You keep the upload key.

```bash
keytool -genkeypair -v \
  -keystore twenty-one-upload.jks \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Put the file outside the repo. `*.jks` is gitignored. Then:

```bash
export ANDROID_KEYSTORE_PATH="$HOME/keys/twenty-one-upload.jks"
export ANDROID_KEYSTORE_PASSWORD="…"
export ANDROID_KEY_ALIAS="upload"
export ANDROID_KEY_PASSWORD="…"
npm run sync
cd android && ./gradlew bundleRelease
```

The artifact is `android/app/build/outputs/bundle/release/app-release.aab`.

Play Console → Test and release → Internal testing → create a release → upload the AAB. Enroll in Play App Signing when asked, and use the key you just made as the upload key. Internal testing is available to the email addresses you list, within an hour or two of the first upload.

Copy the store listing, the 512 icon (`web/icon-512.png`), a 1024×500 feature graphic, and at least two phone screenshots from `store/screenshots.md`.

### Production

Internal testing → promote to Closed testing if you want a wider group, then Production. The first production release goes through review. The same “not a wrapped website” note from the Apple review notes belongs in Play’s review message if there is a field for it.

## 8. After the first version

Bump `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in the Xcode target, and `versionName` / `versionCode` in `android/app/build.gradle`, together. `versionCode` only goes up. Run `npm run sync` before every native build so `www/` is what ships.

Pro, when you are ready, is `store/pro.md`. Do not put a price in the repo.
