import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from '../screens/WelcomePage';
import OTPVerification from '../screens/OTPVerification';
import ScannerScreen from '../screens/Scanner';
import LockScreen from '../screens/LockScreen';
import { retrieveUserSession } from '../storageManager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import RegistrationPage from '../screens/RegistrationPage';
import { StatusBar } from 'react-native'
import { COLORS } from '../utilities/colors';
import HamburgerMenu from '../screens/Drawer';
import User from '../screens/User';
import Profile from '../screens/Profile';
import PinGenerationScreen from '../screens/PinGenerationScreen';
import DocumentScannerScreen from '../screens/DocumentScannerScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="WelcomePage"
        component={WelcomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegistrationPage"
        component={RegistrationPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PinGenerationScreen"
        component={PinGenerationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DocumentScannerScreen"
        component={DocumentScannerScreen}
        options={{ headerShown: true,title:'Upload Document' }}
      />
      <Stack.Screen
        name="LockScreen"
        component={LockScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={HamburgerMenu}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="User"
        component={User}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const [initialRouteName, setInitialRouteName] = useState('RegistrationPage');

  useEffect(() => {
    const fetchCurrentScreen = async () => {
      const data = await retrieveUserSession();
      console.log(data, 'data>>>>>>');
      if (data.isAuthenticated) {
        setInitialRouteName('LockScreen');
      }
    };
    fetchCurrentScreen();
  }, []);

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.transparent} translucent={true} />
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator initialRouteName={initialRouteName} />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
