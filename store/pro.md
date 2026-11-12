# Pro unlock

Pro is a one-time, non-consumable purchase. It is not for sale in this build. Do not write a price into the app, the listing, or the screenshots. The store is the only place a price should appear, and only after you create the product.

## What is gated

`web/js/pro-config.js`:

- `productIds.ios` and `productIds.android` are empty strings. While they are empty, the billing client is never initialized.
- `features` is an empty list. A feature is locked only if its id is in this list **and** a product id is set **and** the user has not purchased Pro. An empty list means nothing is locked even after you add product ids.
- `planned` is a note of features you might move into `features` later: extra night-sky themes, a home-screen widget, a window length other than 3 hours, extra reminder times. None of those features exist yet. Moving an id into `features` does not build the feature. It only marks it as Pro once you have built it.

The settings row in Star map says that everything in this version is free. When a product id is set and the app is running on a device, the row shows Unlock and Restore, and the price string comes from StoreKit or Play Billing.

## Plugin

The client is `capacitor-plugin-cdv-purchase` (the Capacitor build of cordova-plugin-purchase, StoreKit 2 and Google Play Billing). There is no RevenueCat project and no receipt-validator URL. `transaction.verify()` accepts the purchase locally, and the receipt stays on the device. That is what keeps the privacy answer “data not collected”.

Ownership is also written to Preferences under `abstain21.pro`, because a non-consumable can be reported late on the next launch. Restore asks the store again.

## Turning it on

1. In App Store Connect, the app → In-App Purchases → Non-Consumable. Suggested product id: `twentyone_pro`. Write the display name and the description there. Set the price in App Store Connect. Do not copy that price into the repo.
2. In Play Console, the same id as a one-time product (`twentyone_pro`), status Active. Play will show its own price.
3. Put those ids in `web/js/pro-config.js`. Leave `features` empty until a feature should actually require Pro.
4. `npm run sync`, then ship a new build.
5. On a sandbox Apple ID and on a Play license-test account, buy and restore. Confirm the row says Pro is unlocked, and confirm a second install can restore it.
6. Update the age-rating “digital purchases” answer to Yes on Play. The Apple privacy label stays “not collected” only if you still have no receipt server. If you add a validator URL, update [app-privacy.md](app-privacy.md) and the privacy policy first.

A non-consumable has to be acknowledged. The scaffold calls `transaction.finish()` after verify, which acknowledges it on Play. Do not change that to a consume. Google refunds an unacknowledged purchase after three days.
