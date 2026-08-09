import { createClient } from '@binoban/react-native';

// Request your credentials and deployment host from support@binoban.io. Never
// commit real keys or non-production hosts — these are placeholders only.
//
// The client lives here rather than in App.tsx because the push background
// message handler (src/push/backgroundHandler.ts) runs outside React, where the
// useBinoban() hook is unavailable and it needs the client directly.
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
  // api.binoban.io for Binoban-hosted accounts; on-prem / white-label
  // deployments use their own host.
  apiHost: 'YOUR_API_HOST',
  debug: true,
  // Optional tuning (values shown are the defaults):
  collectDeviceId: true,
  trackAppLifecycleEvents: true,
  useLifecycleObserver: true,
  trackDeepLinks: true,
  flushAt: 20, // flush after this many queued events
  flushInterval: 30, // flush at least every N seconds
  autoAddSegmentDestination: true,
  disableTelemetry: false, // set true for air-gapped / no SDK telemetry
  // telemetryHost: 'telemetry.your-onprem.io', // route SDK telemetry on-prem
});
