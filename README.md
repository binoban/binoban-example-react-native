<img src="https://raw.githubusercontent.com/binoban/.github/63ddb277b487b407613e98205a324d4fc6b1019c/profile/binoban-star-indigo-on-white.png" alt="Binoban indigo star" width="72" height="72">

# Binoban React Native Reference App

Explore customer event tracking, user identification, and optional push integration from one React Native app for Android and iOS.

[Integration guide](https://docs.binoban.io/developers/track-customer-data/sdks/react-native) · [SDK package](https://www.npmjs.com/package/@binoban/react-native) · [Push guide](https://docs.binoban.io/developers/engage/mobile-push-react-native)

## What this repository provides

A reference app that consumes `@binoban/react-native` version `1.0.0`, bridging the Binoban Android and iOS native SDKs. The shared client lives outside React so foreground UI and background push handlers can use the same instance.

## Requirements

| Component | Requirement |
| --- | --- |
| React Native | 0.83.0 with the New Architecture enabled |
| React | 19.2.0, as declared in this project |
| Node | 20.19.4+, required by React Native 0.83.0 |
| Android app target | Android API 24+ |
| iOS app target | iOS 15.1+; macOS and Xcode to build and run |
| Dependency tools | Yarn or npm; Ruby/Bundler for the iOS CocoaPods setup |
| Configuration | Separate Android and iOS source credentials; deployment API host |

The native SDK minimums are Android API 21 and iOS 12. The React Native example has higher app targets. See the Xcode/fmt workaround below when using that toolchain.

## Get started

### 1. Install dependencies

Clone this repository and install its JavaScript dependencies:

```sh
yarn install
```

For iOS, install the Ruby dependencies and pods:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

React Native autolinking resolves the native SDKs through the bridge: Maven Central on Android and the `binoban` CocoaPods XCFramework on iOS.

### 2. Configure your deployment

Request your credentials and API host from [tech@binoban.io](mailto:tech@binoban.io). Replace the placeholders in [src/binoban.ts](src/binoban.ts). Each platform uses its own source:

```ts
export const binobanClient = createClient({
  credentials: {
    android: {
      apiKey: 'YOUR_ANDROID_API_KEY',
      sourceIdentifier: 'YOUR_ANDROID_SOURCE_IDENTIFIER',
    },
    iOS: {
      apiKey: 'YOUR_IOS_API_KEY',
      sourceIdentifier: 'YOUR_IOS_SOURCE_IDENTIFIER',
    },
  },
  apiHost: 'YOUR_API_HOST',
  debug: true,
})
```

The file already imports `createClient` from `@binoban/react-native`. Use the host supplied for your deployment.

### 3. Run the app

Start Metro in one terminal:

```sh
yarn start
```

In another terminal, choose your platform:

```sh
yarn android
# or
yarn ios
```

You can use npm instead: `npm install`, `npm start`, `npm run android`, and `npm run ios`.

## Explore the example

| Feature | What you can explore |
| --- | --- |
| Track | Named events with custom properties |
| Identify | User IDs and custom traits |
| Flush | Request delivery of buffered events |
| Reset | Clear the current identity and reset SDK state |
| Settings | Debug logs, flush thresholds, and configuration |
| JSON display | Inspect the inputs for each call |
| Push | Optional FCM tokens, foreground/background message forwarding, and interactions |
| Safety harness | Check whether selected initialization and reset scenarios throw |

The UI uses `BinobanProvider` and `useBinoban()`. See [src/App.tsx](src/App.tsx), [src/Home.tsx](src/Home.tsx), and [src/binoban.ts](src/binoban.ts).

## Verify your integration

Use **Track**, then **Flush**. Check the SDK logs and confirm event acceptance using the [Developer Quick Start](https://docs.binoban.io/developers/quickstart). The JSON display shows call inputs; it is not a delivery receipt.

Run the safety harness separately. Its results indicate whether each call threw synchronously; they do not prove delivery or every native runtime condition. The harness uses demo credentials and its own host values in [src/SafetyHarness.tsx](src/SafetyHarness.tsx).

If events do not arrive, check the active platform's credentials and `apiHost`. If push is unavailable, check the optional packages and native configuration below.

## Push notifications

Push runs on Firebase Cloud Messaging and is **optional**. This example does not depend
on `@react-native-firebase/messaging`, so it installs, bundles, and runs with no
Firebase setup at all: the **Push** section of the demo shows the enable steps.
Binoban does not wrap Firebase; that integration stays yours.

> The integration here mirrors the recipe in the public docs:
> [App push in React Native](https://docs.binoban.io/developers/engage/mobile-push-react-native).
> That page is the source of truth: read it for the why behind each step, and
> [Set up Firebase for Binoban push](https://docs.binoban.io/developers/engage/firebase-setup)
> for the service-account and APNs-key setup.

### Enable push in this example

1. **Install the packages.** Install the optional packages, then complete the native Firebase configuration below:

   ```sh
   yarn add @react-native-firebase/app @react-native-firebase/messaging
   cd ios && bundle exec pod install && cd ..
   ```

   `src/push/messaging.ts` guards access to the optional messaging package. Once the package is installed and the native Firebase setup is complete, the example uses it for token and message handling.

2. **Complete native Firebase setup.** Follow the [React Native Firebase setup guide](https://rnfirebase.io/) to register your apps and configure the Android Google Services plugin and iOS native project. Place `google-services.json` into `android/app/`, and
   `GoogleService-Info.plist` into the iOS target. Both are gitignored: never commit
   them.

3. **iOS only: enable the capabilities.** **Push Notifications** and **Background
   Modes → Remote notifications**. Background Modes is required: Binoban's messages
   are data-only, and without it iOS will not wake the app to display them.

4. **Rebuild the native app**, including its native dependencies. Use a physical device for end-to-end validation of the iOS APNs and FCM flow.

### How the push path is wired

Everything Firebase-facing is confined to `src/push/`, and every effect is a no-op
when the package is absent. The wiring follows the
[documented steps](https://docs.binoban.io/developers/engage/mobile-push-react-native):

1. **Android appearance** (`android/app/src/main/AndroidManifest.xml`): the channel
   id / name / description meta-data the bridge reads, plus the `POST_NOTIFICATIONS`
   permission requested at runtime from the Push section on Android 13+.

2. **Register the token** (`src/push/usePush.ts`): `getToken()` at startup and
   `onTokenRefresh` thereafter, both handed to `setDeviceToken`. On iOS this is the
   **FCM registration token**, never the APNs device token.

3. **Forward incoming messages**: two halves, and missing either one loses
   notifications:
   - **Foreground:** `messaging().onMessage` → `notify(remoteMessage.data)`, in
     `usePush.ts`.
   - **Backgrounded:** `messaging().setBackgroundMessageHandler` in
     `src/push/backgroundHandler.ts`, registered from `index.js` *before* the app
     renders. Because Binoban sends data-only messages, a push arriving while the app
     is backgrounded never reaches `onMessage`: without this handler it is silently
     dropped.

     This handler runs outside React, so `useBinoban()` is unavailable. That is why
     `createClient()` lives in `src/binoban.ts` rather than in a component: the
     handler forwards through the exported client.

4. **Handle taps**: `onNotificationInteraction` for live interactions, plus
   `getInitialNotificationInteraction()` once at startup for the tap that cold-started
   the app before JS was listening. Both are surfaced in the Push section. The SDK's
   own tracking happens regardless.

### iOS host forwarding

`@react-native-firebase/messaging` installs its own `UNUserNotificationCenterDelegate`
via Firebase's method swizzling, so this example does not claim that delegate. If your
app owns the delegate instead, forward its callbacks to the bridge:
`willPresentNotification`, `didReceiveNotificationResponse`, and
`didReceiveRemoteNotification` from `useBinoban()`, or the equivalent Swift entry
points from a native `AppDelegate`. See
[iOS host forwarding](https://docs.binoban.io/developers/engage/mobile-push-react-native#5-ios-host-forwarding).

### Verify it worked

1. After launch, your next flushed batch carries a `bb_notification_registered` event
   with the token.
2. Send a test campaign from the Binoban panel. The notification appears,
   `bb_notification_delivered` follows, and tapping it produces
   `bb_notification_clicked`: the Push section mirrors each interaction. On iOS keep
   the app in the foreground for this check: `delivered` is reported from the
   foreground-presentation callback.

The **Show Notification** button is a separate, local check: it calls `notify()`
directly with a synthetic payload, exercising rendering and interaction reporting
without a round trip through FCM. It works whether or not push is enabled.

See [Push events](https://docs.binoban.io/developers/reference/events/push-events) for
the full event list and payload keys.

## Troubleshooting: Xcode and fmt

This repository includes a workaround for the `fmt` 11.0.2 `consteval` build issue documented with the checked-in React Native 0.83 project on Xcode 16.3+/26. `ios/Podfile`'s `post_install` patches
`Pods/fmt/include/fmt/base.h` to disable it (compile-time format-string checking off;
runtime unchanged), re-applied on every `pod install`. Keep this workaround in mind when updating React Native, Xcode, or the Podfile.

## Project layout

```
src/binoban.ts             createClient(): set your credentials here
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

## Documentation and support

- [Integration guide](https://docs.binoban.io/developers/track-customer-data/sdks/react-native)
- [Developer Quick Start](https://docs.binoban.io/developers/quickstart)
- [Report a bug or request a feature](https://github.com/binoban/binoban-example-react-native/issues)
- [Contribution guide](CONTRIBUTING.md)
- Deployment access, credentials, and host configuration: [tech@binoban.io](mailto:tech@binoban.io).

## Security

Report vulnerabilities privately through the [security policy](SECURITY.md). Use placeholders when sharing configuration or reproduction steps.

## License

MIT. See [LICENSE](LICENSE).

## About Binoban

Binoban provides enterprise Customer Data Experience Platform (CDXP) infrastructure that connects customer data with prediction, decisioning, and activation across customer engagement, retail media, and advertising.

**Seer. Protector. Builder.** See the signal. Recognize risks and opportunities. Build what comes next.

[Binoban](https://binoban.io) · [Developer documentation](https://docs.binoban.io) · [GitHub organization](https://github.com/binoban)

**Future In Your Hands**
