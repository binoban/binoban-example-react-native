import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { registerPushBackgroundHandler } from './src/push/backgroundHandler';

// Must run before the app renders — a backgrounded data-only push has no
// component tree to deliver into. No-op unless push is enabled.
registerPushBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
