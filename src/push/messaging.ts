/**
 * Optional access to `@react-native-firebase/messaging`.
 *
 * Push is opt-in, and installing that package is the only switch. It is
 * deliberately **not** a dependency of this example, so the app installs,
 * bundles, and runs with no Firebase setup at all — the Push panel then shows
 * the enable steps.
 *
 * Metro treats a `require()` inside a `try` block as an *optional dependency*:
 * when the package is absent it emits a module that throws on require rather
 * than failing the bundle, and the `catch` below turns that into `null`. Add the
 * package and normal resolution takes over, activating the push path with no
 * code change.
 */

/** The slice of a Firebase `RemoteMessage` this example reads. */
export type RemoteMessage = {
  data?: Record<string, string>;
};

/** The slice of the Firebase Messaging API this example uses. */
export type FirebaseMessaging = {
  getToken(): Promise<string>;
  onTokenRefresh(listener: (token: string) => void): () => void;
  onMessage(
    listener: (message: RemoteMessage) => void | Promise<void>
  ): () => void;
  setBackgroundMessageHandler(
    handler: (message: RemoteMessage) => Promise<void>
  ): void;
  requestPermission(): Promise<number>;
  registerDeviceForRemoteMessages(): Promise<void>;
};

let resolved: (() => FirebaseMessaging) | null = null;

try {
  const mod = require('@react-native-firebase/messaging');
  const candidate = mod?.default ?? mod;
  // Guard on the shape too, so an empty/stubbed module degrades to "off"
  // instead of throwing later at the call site.
  resolved = typeof candidate === 'function' ? candidate : null;
} catch {
  resolved = null;
}

/** `null` when the package is not installed. */
export const messaging = resolved;

/** Whether the push path is active in this build. */
export const isPushEnabled = resolved !== null;
