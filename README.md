# Twenty-One

廿一. Twenty-one days, twenty-one stars.

A 21-day self-discipline check-in. Once a day, inside a three-hour window that starts at a time you choose, press and hold to light one star. Miss the window and the sky goes dark. Finish all 21 and the app draws a constellation that only your check-in times could have made.

The interface is the original night-sky web app. This repo wraps it in [Capacitor](https://capacitorjs.com/) so the same UI ships as a local bundle inside an iOS app and an Android app, with notifications, haptics, and storage that survive a WebView wipe.

English is the base language. Simplified Chinese is used when the device language is Chinese. The wordmark stays 廿一.

## Run the web app

```bash
npm install
npm run dev
```

Open http://127.0.0.1:47221 . Add `?debug=1` to jump days, open the window, and preview the day-21 finale. That panel is development-only. It is not in the production bundle, and it never appears inside the native app.

```bash
npm run smoke    # setup, check-in, a broken cycle, day 21, and the production flag
npm run build    # writes www/ with the debug panel disabled
```

## Native projects

```bash
npm install
npm run sync     # production www/ copied into ios/ and android/
```

- iOS: open `ios/App/App.xcworkspace` in Xcode on a Mac. The project is iPhone-only, portrait, deployment target iOS 15.
- Android: open `android/` in Android Studio, or `cd android && ./gradlew assembleDebug`.

Bundle id: `app.twentyone.nights`. Display name: **Twenty-One** in English, **廿一** in Chinese.

Shipping steps, signing, TestFlight, and Play Console are in [RELEASE.md](RELEASE.md). Store copy, the privacy policy, and the age-rating answers are in [store/](store/).

## What is native

| | Browser | iOS / Android |
|---|---|---|
| Check-in, sky, history, export | yes | yes, from bundled files |
| Daily reminder | only while the page is open | local notification when the window opens, and 30 minutes before it closes |
| Haptics on the five animation tiers | only if the browser can vibrate | yes |
| Storage | `localStorage` | Capacitor Preferences, migrated from `localStorage` on first launch |
| Day-21 card | download, or the web share sheet | the system share sheet, as a PNG |
| Pro | not for sale | scaffolded, not for sale until product ids are set |

Nothing in the app is locked. `web/js/pro-config.js` lists planned Pro features and ships with an empty `features` array and empty product ids, so the billing client is never started.
