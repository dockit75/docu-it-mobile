/**
 * @format
 */

import {AppRegistry, LogBox, Text} from 'react-native';
import App from './src/navigation/AppNavigator'
import {name as appName} from './app.json';
// Ignore log notification by message
LogBox.ignoreLogs(['Warning: ...']);

//Ignore all log notifications
LogBox.ignoreAllLogs();

Text.defaultProps = {color: 'black', maxFontSizeMultiplier: 1.5, allowFontScaling: false};
AppRegistry.registerComponent(appName, () => App);
