# App Privacy and Data safety

Answer both forms from the current build: product ids in `web/js/pro-config.js` are empty, the billing client is not started, and there is no analytics SDK.

## Apple App Privacy

Nutrition label: **Data Not Collected**.

| Category | Collected? |
|---|---|
| Contact Info | No |
| Health & Fitness | No. This is not a HealthKit app. |
| Financial Info | No. Nothing is for sale. If you later enable Pro, payments are processed by Apple and are not data you collect, as long as you still have no receipt server. |
| Location | No |
| Sensitive Info | No |
| Contacts | No |
| User Content | No. The day-21 image is shared only through the system sheet, at the user’s tap. |
| Browsing History | No |
| Search History | No |
| Identifiers | No |
| Purchases | No, for this build. |
| Usage Data | No |
| Diagnostics | No |
| Other Data | No |

Tracking: **No**. Do not answer the tracking questionnaire as “yes”. There is no `NSUserTrackingUsageDescription`, and no ad SDK.

Privacy policy URL: the hosted copy of [privacy-policy.html](privacy-policy.html).

## Google Play Data safety

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | No |
| Is all of the user data collected by your app encrypted in transit? | Not applicable. Nothing is collected. |
| Do you provide a way for users to request that their data be deleted? | Not applicable. There is no account and no server copy. Uninstalling the app, or clearing its storage, removes the only copy. Export is the user’s own file. |
| Committed to the Play Families policy? | No. Do not opt into Designed for Families. |
| Ads | No |

Data types to leave unchecked: location, personal info, financial info, health, messages, photos (the share sheet does not save to the photo library), audio, files, calendar, contacts, app activity, web browsing, app info and performance, device or other ids.

The binary contains Google Play Billing because the Pro scaffold is linked. It is not initialized in this build. Play’s own payment processing, when you turn Pro on later, is Google’s data, not a data type you declare as collected by the app, provided you still do not upload receipts to a server of your own.

## When this answer stops being true

Update both forms before you ship any of these:

- a product id, if you also add a receipt validator or any server
- analytics, crash reporting, or an advertising SDK
- an account, cloud sync you operate, or push notifications from a server

Turning on the local Pro unlock, with no validator URL, does not by itself make the answer “data collected”. Say so in the review notes if a reviewer asks about the billing permission.
