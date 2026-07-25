import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { createClient } from '@binoban/react-native';

type Result = { label: string; ok: boolean; note: string };

const validCreds = {
  android: { apiKey: 'demo-android', sourceIdentifier: 'demo-android-src' },
  iOS: { apiKey: 'demo-ios', sourceIdentifier: 'demo-ios-src' },
};

const emptyCreds = {
  android: { apiKey: '', sourceIdentifier: '' },
  iOS: { apiKey: '', sourceIdentifier: '' },
};

// Each scenario runs synchronously and must NOT throw. Reaching the end = pass.
const scenarios: { label: string; run: () => void }[] = [
  {
    label: 'Track before init resolves',
    run: () => {
      const c = createClient({
        apiHost: 'api.binoban.io',
        credentials: validCreds,
      });
      c.track('immediately-after-create');
    },
  },
  {
    label: 'Missing credentials (inert)',
    run: () => {
      const c = createClient({
        apiHost: 'api.binoban.io',
        credentials: emptyCreds,
      });
      c.track('on-inert-client');
      c.identify('u1');
      c.flush();
    },
  },
  {
    label: 'Double init',
    run: () => {
      const cfg = { apiHost: 'api.binoban.io', credentials: validCreds };
      createClient(cfg);
      const c2 = createClient(cfg);
      c2.track('after-double-init');
    },
  },
  {
    label: 'Call after reset',
    run: () => {
      const c = createClient({
        apiHost: 'api.binoban.io',
        credentials: validCreds,
      });
      c.reset();
      c.track('after-reset');
      c.anonymousId();
    },
  },
  {
    label: 'Getters on fresh client',
    run: () => {
      const c = createClient({
        apiHost: 'api.binoban.io',
        credentials: validCreds,
      });
      c.anonymousId();
      c.userId();
      c.deviceId();
    },
  },
];

export default function SafetyHarness() {
  const [results, setResults] = useState<Result[]>([]);

  const runOne = (label: string, run: () => void) => {
    let result: Result;
    try {
      run();
      result = { label, ok: true, note: 'no crash' };
    } catch (e) {
      result = {
        label,
        ok: false,
        note: e instanceof Error ? e.message : String(e),
      };
    }
    setResults((prev) => [result, ...prev].slice(0, 8));
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>SDK Safety Harness</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {scenarios.map((s) => (
          <Pressable
            key={s.label}
            style={styles.btn}
            onPress={() => runOne(s.label, s.run)}
          >
            <Text style={styles.btnText}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {results.map((r, i) => (
        <Text key={i} style={r.ok ? styles.pass : styles.fail}>
          {r.ok ? '✅' : '❌'} {r.label} — {r.note}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    maxHeight: 240,
  },
  title: { fontWeight: '700', marginBottom: 8 },
  btn: {
    backgroundColor: '#263d69',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  btnText: { color: 'white', fontSize: 12 },
  pass: { color: '#366924', marginTop: 4, fontSize: 12 },
  fail: { color: '#b00020', marginTop: 4, fontSize: 12 },
});
