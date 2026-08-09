import { binobanClient } from '../binoban';
import { messaging } from './messaging';

/**
 * Step 3 (background half) of the push recipe —
 * [App push in React Native](https://docs.binoban.io/developers/engage/mobile-push-react-native).
 *
 * Binoban sends **data-only** messages, so `onMessage` only sees a push while the
 * app is foregrounded. A push that arrives while the app is backgrounded or dead
 * runs here instead; without this handler those notifications never appear at all.
 *
 * This runs outside React, so `useBinoban()` is not available — forward through
 * the exported client instead. Registered from `index.js` before the app renders,
 * which is a requirement of `setBackgroundMessageHandler`, not a style choice.
 */
export function registerPushBackgroundHandler() {
  if (!messaging) {
    return;
  }

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // The `source` check is for your branch, not the SDK's safety — notify()
    // ignores non-Binoban payloads by itself. Drop it if this app receives no
    // pushes other than Binoban's.
    if (remoteMessage?.data?.source === 'binoban') {
      binobanClient.notify(remoteMessage.data);
    }
  });
}
