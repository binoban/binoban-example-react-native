import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** Shared presentational building blocks used by the Home and Push panels. */

export const colors = {
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

export const MaterialButton = ({
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

export const MaterialTextField = ({
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

/** A labelled read-only value row. */
export const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.infoValue} selectable>
      {value}
    </Text>
  </View>
);

/** A section heading. */
export const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
);

/** A muted explanatory card. */
export const InfoCard = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardBody}>{message}</Text>
  </View>
);

/** A numbered instruction line. */
export const NumberedStep = ({
  number,
  text,
}: {
  number: number;
  text: string;
}) => (
  <View style={styles.step}>
    <Text style={styles.stepNumber}>{number}.</Text>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
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
  infoRow: {
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.disabled,
    paddingBottom: 8,
  },
  infoValue: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: 'monospace',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.outline,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  cardBody: { fontSize: 13, color: colors.disabledText, lineHeight: 19 },
  step: { flexDirection: 'row', marginBottom: 8 },
  stepNumber: {
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
  },
  stepText: { flex: 1, fontSize: 13, color: colors.onSurface, lineHeight: 19 },
});
