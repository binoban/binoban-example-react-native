import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  InfoCard,
  InfoRow,
  MaterialButton,
  NumberedStep,
  SectionHeader,
} from '../ui';
import { isPushEnabled } from './messaging';
import { usePush } from './usePush';

/**
 * Push panel. Two modes:
 *  - `@react-native-firebase/messaging` not installed (the default): shows the
 *    enable steps. No Firebase setup is needed to reach this screen.
 *  - installed: live status — FCM token, permission, and the interactions the
 *    native SDK reported.
 */
const PushPanel = () => (isPushEnabled ? <PushEnabled /> : <PushDisabled />);

const PushDisabled = () => (
  <View>
    <SectionHeader title="Push notifications" />
    <InfoCard
      title="Push is off in this build"
      message={
        'This example does not depend on @react-native-firebase/messaging, so it ' +
        'installs and runs with no Firebase setup. To see the live push ' +
        'integration, enable it in four steps:'
      }
    />
    <NumberedStep
      number={1}
      text={
        'Install the package: yarn add @react-native-firebase/app ' +
        '@react-native-firebase/messaging (then re-run pod install for iOS).'
      }
    />
    <NumberedStep
      number={2}
      text={
        'Add your Firebase config: google-services.json into android/app/, and ' +
        'GoogleService-Info.plist into the iOS target. Both are gitignored — never commit them.'
      }
    />
    <NumberedStep
      number={3}
      text={
        'iOS only: enable the Push Notifications and Background Modes → Remote ' +
        'notifications capabilities. Binoban sends data-only messages, so without ' +
        'Background Modes iOS never wakes the app to display them.'
      }
    />
    <NumberedStep
      number={4}
      text={
        'Rebuild the native app (not just Metro) and run on a physical device — ' +
        'iOS push needs an APNs token, which the simulator does not provide.'
      }
    />
    <InfoCard
      title="What installing the package wires"
      message={
        'The FCM token handed to setDeviceToken (and again on refresh), foreground ' +
        'messages forwarded to notify(), backgrounded messages forwarded from the ' +
        'background handler in index.js, and taps surfaced through ' +
        'onNotificationInteraction plus the cold-start ' +
        'getInitialNotificationInteraction. Mirrors the recipe at ' +
        'docs.binoban.io/developers/engage/mobile-push-react-native.'
      }
    />
  </View>
);

const PushEnabled = () => {
  const {
    token,
    tokenError,
    permission,
    interactions,
    clearInteractions,
    requestPermission,
  } = usePush();

  return (
    <View>
      <SectionHeader title="Push status" />
      <InfoRow label="Messaging package" value="installed" />
      <InfoRow label="Notification permission" value={permission} />
      <InfoRow
        label="FCM token"
        value={token ?? tokenError ?? 'fetching…'}
      />

      <MaterialButton
        label="Request notification permission"
        onPress={() => void requestPermission()}
        style={styles.spaced}
      />

      <SectionHeader title="Recent interactions" />
      <InfoCard
        title="How to test"
        message={
          'Send a test campaign from the Binoban panel. The notification appears, ' +
          'bb_notification_delivered follows, and tapping it produces ' +
          'bb_notification_clicked. Each interaction the SDK reports is mirrored ' +
          'below; SDK tracking happens regardless of this list.'
        }
      />

      {interactions.length === 0 ? (
        <Text style={styles.empty}>
          No interactions yet — send a test push and tap it.
        </Text>
      ) : (
        <View>
          <MaterialButton
            label="Clear"
            variant="outlined"
            onPress={clearInteractions}
          />
          {interactions.map((entry) => (
            <Text key={entry.id} style={styles.entry}>
              {entry.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  spaced: { marginTop: 4 },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    color: colors.outline,
    fontSize: 13,
  },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    color: colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default PushPanel;
