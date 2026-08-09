import { BinobanProvider } from '@binoban/react-native';
import { View } from 'react-native';
import { binobanClient } from './binoban';
import Home from './Home';
import SafetyHarness from './SafetyHarness';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <BinobanProvider client={binobanClient}>
        <Home />
      </BinobanProvider>
      <SafetyHarness />
    </View>
  );
}
