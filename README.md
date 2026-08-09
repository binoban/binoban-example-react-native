# Binoban React Native SDK — Example App

A minimal React Native reference app showing how to integrate the **Binoban SDK** into a
React Native project via [`@binoban/react-native`](https://www.npmjs.com/package/@binoban/react-native).

Binoban is enterprise CDXP infrastructure for customer data, activation, retail media,
advertising, and decisioning. This example demonstrates the client-side event and
identity APIs you use to send customer signals into a Binoban deployment.

> **Status:** Reference example · tested against Binoban React Native SDK **1.0.0**
> (`@binoban/react-native`), which bridges the Binoban Android (`io.binoban.sdk:sdk-android`)
> and iOS (`binoban`) native SDKs.

## What it shows

| Feature | Description |
|---|---|
| **Track** | Send a named event with custom key-value properties |
| **Identify** | Identify a user by ID with custom traits |
| **Flush** | Immediately dispatch any buffered events to the server |
| **Reset** | Clear the current user identity and reset SDK state |
| **Settings** | Toggle debug logs, adjust `flushAt` & `flushInterval`, view read-only config |
| **JSON display** | See the exact payload sent for each call |
| **Push** | Opt-in Firebase Cloud Messaging integration — token registration, message forwarding (foreground + background), and interaction reporting (tap / dismiss / customData) |
| **Safety harness** | Exercises the bridge's never-throw contract (calls before init, missing credentials, double init, calls after reset) — every call is guarded and returns safely |

The identity/event surface is exposed through the `useBinoban()` hook and a
`BinobanProvider` — see `src/binoban.ts`, `src/App.tsx`, and `src/Home.tsx`.

## Supported environments

- **Node** 20+
- **React Native** 0.83 with the **New Architecture** (TurboModules) enabled
- **Android:** `minSdkVersion 24` (the Binoban Android SDK supports API 21+)
- **iOS:** deployment target **15.1** (the Binoban iOS SDK supports iOS 12+). **Xcode 26**
  is supported — see the fmt note under *iOS* below.
- **Yarn** or **npm**

## Installation

```sh
# 1. Install JS dependencies
yarn install        # or: npm install

# 2. iOS only — install pods
cd ios && bundle install && bundle exec pod install && cd ..
```

The Binoban native SDKs are resolved automatically by React Native autolinking:
`io.binoban.sdk:sdk-android` from Maven Central on Android, and the `binoban` CocoaPods
XCFramework on iOS (pulled in transitively by `@binoban/react-native`'s podspec).

## Usage

1. Request your credentials and deployment host from **support@binoban.io**:
   - **API Key** (`apiKey`)
   - **Source Identifier** (`sourceIdentifier`)
   - **API Host** (`apiHost`) — `api.binoban.io` for Binoban-hosted accounts; on-prem /
     white-label deployments use their own host.

2. In `src/binoban.ts`, replace the placeholders (credentials are per-platform):

```ts
const binobanClient = createClient({
  credentials: {
    android: { apiKey: 'YOUR_ANDROID_API_KEY', sourceIdentifier: 'YOUR_ANDROID_SOURCE_IDENTIFIER' },
    iOS:     { apiKey: 'YOUR_IOS_API_KEY',     sourceIdentifier: 'YOUR_IOS_SOURCE_IDENTIFIER' },
  },
  apiHost: 'YOUR_API_HOST',
  debug: true,
});
```

3. Run it:

```sh
yarn start                 # start the Metro bundler
yarn android               # build & run on an Android emulator/device
yarn ios                   # build & run on an iOS simulator
```

## Push notifications

Push runs on Firebase Cloud Messaging and is **opt-in**. This example does not depend
on `@react-native-firebase/messaging`, so it installs, bundles, and runs with no
Firebase setup at all — the **Push** section of the demo shows the enable steps.
Binoban does not wrap Firebase; that integration stays yours.

> The integration here mirrors the recipe in the public docs:
> [App push in React Native](https://docs.binoban.io/developers/engage/mobile-push-react-native).
> That page is the source of truth — read it for the why behind each step, and
> [Set up Firebase for Binoban push](https://docs.binoban.io/developers/engage/firebase-setup)
> for the service-account and APNs-key setup.

### Enable push in this example

1. **Install the packages.** Installing them is the only switch — no code change:

   ```sh
   yarn add @react-native-firebase/app @react-native-firebase/messaging
   cd ios && bundle exec pod install && cd ..
   ```

   `src/push/messaging.ts` resolves the package through a `require()` inside a `try`
   block. Metro treats that as an **optional dependency**: when the package is absent
   it emits a module that throws on require instead of failing the bundle, and the
   `catch` turns that into "push off". Once installed, normal resolution takes over.

2. **Add your Firebase config.** `google-services.json` into `android/app/`, and
   `GoogleService-Info.plist` into the iOS target. Both are gitignored — never commit
   them.

3. **iOS only — enable the capabilities.** **Push Notifications** and **Background
   Modes → Remote notifications**. Background Modes is required: Binoban's messages
   are data-only, and without it iOS will not wake the app to display them.

4. **Rebuild the native app** (not just Metro) and run on a physical device — iOS push
   needs an APNs token, which the simulator does not provide.

### How the push path is wired

Everything Firebase-facing is confined to `src/push/`, and every effect is a no-op
when the package is absent. The wiring follows the
[documented steps](https://docs.binoban.io/developers/engage/mobile-push-react-native):

1. **Android appearance** (`android/app/src/main/AndroidManifest.xml`) — the channel
   id / name / description meta-data the bridge reads, plus the `POST_NOTIFICATIONS`
   permission requested at runtime from the Push section on Android 13+.

2. **Register the token** (`src/push/usePush.ts`) — `getToken()` at startup and
   `onTokenRefresh` thereafter, both handed to `setDeviceToken`. On iOS this is the
   **FCM registration token**, never the APNs device token.

3. **Forward incoming messages** — two halves, and missing either one loses
   notifications:
   - **Foreground:** `messaging().onMessage` → `notify(remoteMessage.data)`, in
     `usePush.ts`.
   - **Backgrounded:** `messaging().setBackgroundMessageHandler` in
     `src/push/backgroundHandler.ts`, registered from `index.js` *before* the app
     renders. Because Binoban sends data-only messages, a push arriving while the app
     is backgrounded never reaches `onMessage` — without this handler it is silently
     dropped.

     This handler runs outside React, so `useBinoban()` is unavailable. That is why
     `createClient()` lives in `src/binoban.ts` rather than in a component: the
     handler forwards through the exported client.

4. **Handle taps** — `onNotificationInteraction` for live interactions, plus
   `getInitialNotificationInteraction()` once at startup for the tap that cold-started
   the app before JS was listening. Both are surfaced in the Push section. The SDK's
   own tracking happens regardless.

### iOS host forwarding

`@react-native-firebase/messaging` installs its own `UNUserNotificationCenterDelegate`
via Firebase's method swizzling, so this example does not claim that delegate. If your
app owns the delegate instead, forward its callbacks to the bridge —
`willPresentNotification`, `didReceiveNotificationResponse`, and
`didReceiveRemoteNotification` from `useBinoban()`, or the equivalent Swift entry
points from a native `AppDelegate`. See
[iOS host forwarding](https://docs.binoban.io/developers/engage/mobile-push-react-native#5-ios-host-forwarding).

### Verify it worked

1. After launch, your next flushed batch carries a `bb_notification_registered` event
   with the token.
2. Send a test campaign from the Binoban panel. The notification appears,
   `bb_notification_delivered` follows, and tapping it produces
   `bb_notification_clicked` — the Push section mirrors each interaction. On iOS keep
   the app in the foreground for this check: `delivered` is reported from the
   foreground-presentation callback.

The **Show Notification** button is a separate, local check — it calls `notify()`
directly with a synthetic payload, exercising rendering and interaction reporting
without a round trip through FCM. It works whether or not push is enabled.

See [Push events](https://docs.binoban.io/developers/reference/events/push-events) for
the full event list and payload keys.

## iOS — Xcode 26 note

React Native 0.83 pulls in `fmt` 11.0.2 transitively, which fails to compile under
Xcode 16.3+/26 (a broken `consteval` path). `ios/Podfile`'s `post_install` patches
`Pods/fmt/include/fmt/base.h` to disable it (compile-time format-string checking off;
runtime unchanged), re-applied on every `pod install`. This is unrelated to Binoban — it
affects any RN 0.83 project on these toolchains.

## Project layout

```
src/binoban.ts             createClient() — set your credentials here
src/App.tsx                BinobanProvider wiring
src/Home.tsx               the demo UI: Track / Identify / Flush / Reset / JSON
src/ui.tsx                 shared presentational components
src/push/messaging.ts      optional @react-native-firebase/messaging resolution
src/push/usePush.ts        token registration, message forwarding, interactions
src/push/backgroundHandler.ts  backgrounded-push forwarding (registered in index.js)
src/push/PushPanel.tsx     the Push section of the demo UI
src/SafetyHarness.tsx      the never-throw safety scenarios
android/ · ios/            standard React Native app projects (autolink the SDK)
```

## Security

For security issues, do not open a public issue — see [SECURITY.md](SECURITY.md).
This is a public reference app with **placeholder credentials only**.

## License

MIT — see [LICENSE](LICENSE).
