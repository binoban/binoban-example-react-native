import { useBinoban } from '@binoban/react-native';
import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { messaging } from './messaging';

export type InteractionEntry = { id: number; text: string };

type Interaction = {
  notificationUuid: string;
  type: string;
  actionId?: string | null;
  uri?: string | null;
  customData?: Record<string, string> | null;
  reason?: string | null;
};

let entrySeq = 0;

const MAX_ENTRIES = 10;

const describe = (interaction: Interaction): string => {
  const lines = [`${interaction.type} · ${interaction.notificationUuid}`];
  if (interaction.actionId) {
    lines.push(`button: ${interaction.actionId}`);
  }
  if (interaction.uri) {
    lines.push(`uri: ${interaction.uri}`);
  }
  const custom = interaction.customData;
  if (custom && Object.keys(custom).length > 0) {
    const pairs = Object.keys(custom)
      .sort()
      .map((k) => `${k}=${custom[k]}`);
    lines.push(`customData: ${pairs.join(', ')}`);
  }
  if (interaction.reason) {
    lines.push(`reason: ${interaction.reason}`);
  }
  return lines.join('\n');
};

/**
 * Wires the four JS-side steps of the push recipe —
 * [App push in React Native](https://docs.binoban.io/developers/engage/mobile-push-react-native)
 * — and surfaces the results for the Push panel.
 *
 * Every effect is a no-op when `@react-native-firebase/messaging` is absent, so
 * the default build of this example runs untouched.
 */
export function usePush() {
  const {
    setDeviceToken,
    notify,
    onNotificationInteraction,
    getInitialNotificationInteraction,
  } = useBinoban();

  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>('unknown');
  const [interactions, setInteractions] = useState<InteractionEntry[]>([]);

  const record = useCallback((text: string) => {
    setInteractions((prev) =>
      [{ id: (entrySeq += 1), text }, ...prev].slice(0, MAX_ENTRIES)
    );
  }, []);

  const clearInteractions = useCallback(() => setInteractions([]), []);

  // Step 2 — hand the FCM token to Binoban, and again on every refresh.
  // On iOS this is the FCM registration token, never the APNs device token.
  useEffect(() => {
    if (!messaging) {
      return undefined;
    }
    let cancelled = false;

    messaging()
      .getToken()
      .then((value) => {
        if (cancelled) {
          return;
        }
        setToken(value);
        setDeviceToken(value);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setTokenError(error instanceof Error ? error.message : String(error));
        }
      });

    const unsubscribe = messaging().onTokenRefresh((value) => {
      setToken(value);
      setDeviceToken(value);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setDeviceToken]);

  // Step 3 (foreground half) — forward data messages so the SDK displays them.
  // The backgrounded half lives in backgroundHandler.ts, registered from index.js.
  useEffect(() => {
    if (!messaging) {
      return undefined;
    }
    return messaging().onMessage((remoteMessage) => {
      if (remoteMessage?.data?.source === 'binoban') {
        notify(remoteMessage.data);
      }
    });
  }, [notify]);

  // Step 4 — the tap that cold-started the app, then live interactions.
  // This half needs no Firebase: interactions come from the native SDK.
  useEffect(() => {
    let active = true;

    void getInitialNotificationInteraction().then((interaction) => {
      if (active && interaction) {
        record(`(cold start) ${describe(interaction as Interaction)}`);
      }
    });

    const subscription = onNotificationInteraction((interaction) =>
      record(describe(interaction as Interaction))
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, [getInitialNotificationInteraction, onNotificationInteraction, record]);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      // Android 13+ only; on older versions the constant is absent and the
      // permission is granted at install time.
      const permissionId = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
      if (!permissionId) {
        setPermission('granted (pre-Android 13)');
        return;
      }
      const result = await PermissionsAndroid.request(permissionId);
      setPermission(result);
      return;
    }

    if (!messaging) {
      setPermission('unavailable — messaging not installed');
      return;
    }
    // iOS: asks for notification permission and registers with APNs.
    const status = await messaging().requestPermission();
    setPermission(status > 0 ? `authorized (${status})` : 'denied');
  }, []);

  return {
    token,
    tokenError,
    permission,
    interactions,
    clearInteractions,
    requestPermission,
  };
}
