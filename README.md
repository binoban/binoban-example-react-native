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
| **Safety harness** | Exercises the bridge's never-throw contract (calls before init, missing credentials, double init, calls after reset) — every call is guarded and returns safely |

The identity/event surface is exposed through the `useBinoban()` hook and a
`BinobanProvider` — see `src/App.tsx` and `src/Home.tsx`.

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

2. In `src/App.tsx`, replace the placeholders (credentials are per-platform):

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

## iOS — Xcode 26 note

React Native 0.83 pulls in `fmt` 11.0.2 transitively, which fails to compile under
Xcode 16.3+/26 (a broken `consteval` path). `ios/Podfile`'s `post_install` patches
`Pods/fmt/include/fmt/base.h` to disable it (compile-time format-string checking off;
runtime unchanged), re-applied on every `pod install`. This is unrelated to Binoban — it
affects any RN 0.83 project on these toolchains.

## Project layout

```
src/App.tsx            createClient() + BinobanProvider (set your credentials here)
src/Home.tsx           the demo UI: Track / Identify / Flush / Reset / Settings / JSON
src/SafetyHarness.tsx  the never-throw safety scenarios
android/ · ios/        standard React Native app projects (autolink the SDK)
```

## Security

For security issues, do not open a public issue — see [SECURITY.md](SECURITY.md).
This is a public reference app with **placeholder credentials only**.

## License

MIT — see [LICENSE](LICENSE).
