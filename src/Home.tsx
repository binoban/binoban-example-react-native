import { useBinoban } from '@binoban/react-native';
import { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, MaterialButton, MaterialTextField } from './ui';
import PushPanel from './push/PushPanel';

type EventType = 'Track' | 'Identify';

type FormField = {
  id: number;
  key: string;
  value: string;
};

let fieldSeq = 0;
const newField = (): FormField => ({ id: (fieldSeq += 1), key: '', value: '' });

const Home = () => {
  const {
    track,
    identify,
    flush,
    reset,
    anonymousId,
    userId,
    deviceId,
    notify,
  } = useBinoban();

  const [formType, setFormType] = useState<EventType>('Track');
  const [eventName, setEventName] = useState('');
  const [fields, setFields] = useState<FormField[]>([newField()]);
  const [request, setRequest] = useState('');

  const updateField = useCallback(
    (id: number, prop: 'key' | 'value', text: string) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [prop]: text } : f))
      );
    },
    []
  );

  const addField = useCallback(() => {
    setFields((prev) => [...prev, newField()]);
  }, []);

  const onSend = useCallback(() => {
    const properties: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.key.trim().length > 0) {
        properties[f.key] = f.value;
      }
    });

    if (formType === 'Track') {
      void track(eventName, properties);
    } else {
      void identify(eventName, properties);
    }

    const payload =
      formType === 'Track'
        ? {
            type: 'track',
            event: eventName,
            properties,
            anonymousId: anonymousId() ?? null,
            userId: userId() ?? null,
            deviceId: deviceId() ?? null,
          }
        : {
            type: 'identify',
            userId: eventName,
            traits: properties,
            anonymousId: anonymousId() ?? null,
            deviceId: deviceId() ?? null,
          };

    setRequest(JSON.stringify(payload, null, 2));
  }, [
    fields,
    formType,
    eventName,
    track,
    identify,
    anonymousId,
    userId,
    deviceId,
  ]);

  // Displays a notification locally, without a round trip through FCM — handy
  // for checking the rendering and the interaction reporting on their own. A
  // real push carries the same keys; see the Push section below.
  const onShowNotification = useCallback(() => {
    notify({
      id: 'MESSAGE_ID_TOKEN',
      title: 'Title of Message',
      body: 'Body of Message',
      action: 'https://binoban.io',
      actions:
        '[{"title":"Docs","action":"https://docs.binoban.io"},{"title":"Website","action":"https://binoban.io"}]',
      source: 'binoban',
      customData: '{"url": "value"}',
    });
  }, [notify]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Binoban SDK Demo</Text>
      </View>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.row}>
          <MaterialButton
            label="Track"
            variant={formType === 'Track' ? 'contained' : 'outlined'}
            onPress={() => setFormType('Track')}
            style={styles.flex}
          />
          <View style={styles.gap} />
          <MaterialButton
            label="Identify"
            variant={formType === 'Identify' ? 'contained' : 'outlined'}
            onPress={() => setFormType('Identify')}
            style={styles.flex}
          />
        </View>

        <View style={styles.row}>
          <MaterialButton
            label="Flush"
            onPress={() => void flush()}
            style={styles.flex}
          />
          <View style={styles.gap} />
          <MaterialButton
            label="Reset"
            onPress={() => void reset()}
            style={styles.flex}
          />
        </View>

        <View style={styles.formSection}>
          <MaterialTextField
            label={formType}
            value={eventName}
            onChangeText={setEventName}
          />

          {fields.map((field) => (
            <View key={field.id} style={styles.row}>
              <MaterialTextField
                label="key"
                value={field.key}
                onChangeText={(text) => updateField(field.id, 'key', text)}
                style={styles.flex}
              />
              <View style={styles.gap} />
              <MaterialTextField
                label="value"
                value={field.value}
                onChangeText={(text) => updateField(field.id, 'value', text)}
                style={styles.flex}
              />
            </View>
          ))}

          <MaterialButton
            label="Add Field"
            variant="outlined"
            onPress={addField}
            style={styles.fullButton}
          />
          <MaterialButton
            label={`Send ${formType}`}
            onPress={onSend}
            style={styles.fullButton}
          />
        </View>

        <MaterialTextField
          label="Request"
          value={request}
          editable={false}
          multiline
          style={styles.requestField}
        />

        <MaterialButton
          label="Show Notification"
          onPress={onShowNotification}
          style={styles.fullButton}
        />

        <PushPanel />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  appBar: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  appBarTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  page: { flex: 1 },
  pageContent: { padding: 16, paddingBottom: 48 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  flex: { flex: 1 },
  gap: { width: 12 },
  formSection: { marginTop: 8 },
  fullButton: { marginTop: 12 },
  requestField: { marginTop: 16 },
});

export default Home;
