# Screenshots

Capture the production app, not a page with `?debug=1`. The debug panel is absent from `www/`, which is what the native apps load. Set the simulator or device language to English for the US set, and to Simplified Chinese for the Chinese set. The layout is portrait and iPhone-only, so you do not need iPad screenshots.

Take them from the iOS Simulator or a device after a TestFlight build. A browser at phone width is a draft, not the file you upload: the status bar and the corners will be wrong.

## Apple sizes

Upload the 6.9-inch set. App Store Connect accepts it for the other iPhone sizes.

| Display | Pixels | Required |
|---|---|---|
| iPhone 6.9" (16 Pro Max, 17 Pro Max) | 1320 × 2868, or 1290 × 2796 | Yes |
| iPhone 6.5" | 1284 × 2778 | Only if you do not upload 6.9" |
| iPad | — | No. The target is iPhone. |

Simulator: iPhone 16 Pro Max, or whichever 6.9-inch device Xcode lists. File → New Screen Shot, or `xcrun simctl io booted screenshot`.

## Google Play

| Asset | Size | Count |
|---|---|---|
| Phone screenshots | 1080 × 1920 or taller, PNG or JPEG | 2 to 8 |
| High-res icon | 512 × 512 | The file `web/icon-512.png` |
| Feature graphic | 1024 × 500 | Make one from the night sky and the word Twenty-One. Do not put a price on it. |

Play does not require a feature video.

## The five frames

Use the same five, in this order, for English and for Chinese.

1. **First night.** The setup screen. The wordmark, the line about twenty-one days, the time field at 22:00, and Begin. This is the empty state.
2. **Window open.** A cycle in progress, a few stars lit, the center glowing, “Hold to light” (长按点亮). This is the main action.
3. **Waiting.** The same sky between windows, with the countdown in the center, so the three-hour rule is visible.
4. **The twenty-first night.** The commemorative card, constellation closed, 21 / 21, the dates, and Share this sky. Reach it with a debug build only while you are staging the data, then install the production build and open Star map to show the card. Do not leave the debug button in the shot.
5. **Star map.** Finished constellations, one interrupted cycle, and the settings rows for the reminder, backup, Pro (“every feature in this version is free”), and privacy.

Do not show a price. There isn’t one. Do not show the debug panel. Crop out desktop chrome.

If you only have time for two, use frames 2 and 4. Those are the ones that show it is not a wrapped website: a hold gesture, a generated sky, and a card.
