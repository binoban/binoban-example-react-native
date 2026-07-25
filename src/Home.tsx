import { useBinoban } from '@binoban/react-native';
import { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type EventType = 'Track' | 'Identify';

type FormField = {
  id: number;
  key: string;
  value: string;
};

let fieldSeq = 0;
const newField = (): FormField => ({ id: (fieldSeq += 1), key: '', value: '' });

const colors = {
  primary: '#6200EE',
  background: '#FFFFFF',
  surface: '#F2F0F7',
  onSurface: '#1C1B1F',
  outline: '#79747E',
  disabled: '#E7E0EC',
  disabledText: '#49454F',
  white: '#FFFFFF',
};

type MaterialButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

const MaterialButton = ({
  label,
  onPress,
  variant = 'contained',
  style,
}: MaterialButtonProps) => {
  const outlined = variant === 'outlined';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, outlined && styles.buttonOutlined, style]}
    >
      <Text style={[styles.buttonText, outlined && styles.buttonTextOutlined]}>
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

type MaterialTextFieldProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
};

const MaterialTextField = ({
  label,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  style,
}: MaterialTextFieldProps) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        multiline && styles.fieldInputMultiline,
        !editable && styles.fieldInputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline={multiline}
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={colors.outline}
    />
  </View>
);

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

  const onShowNotification = useCallback(() => {
    notify({
      id: 'MESSAGE_ID_TOKEN',
      title: 'Title of Message',
      body: 'Body of Message',
      action: 'https://binoban.io',
      actions:
        '[{"title":"google","action":"https://google.com"},{"title":"ozone","action":"https://ozone.ir"}]',
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  buttonTextOutlined: { color: colors.primary },
  fullButton: { marginTop: 12 },
  field: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.outline,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.onSurface,
  },
  fieldInputMultiline: {
    minHeight: 180,
    textAlignVertical: 'top',
  },
  fieldInputDisabled: {
    backgroundColor: colors.disabled,
    color: colors.disabledText,
  },
  requestField: { marginTop: 16 },
});

export default Home;
