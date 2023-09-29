import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import OTPVerification from '../screens/OTPVerification';
import LockScreen from '../screens/LockScreen';
import { retrieveUserSession } from '../storageManager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import RegistrationPage from '../screens/RegistrationPage';
import { StatusBar, TouchableOpacity } from 'react-native'
import { COLORS } from '../utilities/colors';
import HamburgerMenu from '../screens/Drawer';
import User from '../screens/User';
import Profile from '../screens/Profile';
import PinGenerationScreen from '../screens/PinGenerationScreen';
import DocumentScannerScreen from '../screens/DocumentScannerScreen';
import Settings from '../screens/Settings';
import CategoryScreen from '../screens/CategoryScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { normalize } from '../utilities/measurement';
import FamilyDoct from '../screens/FamilyDoct';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {


  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
 
      <Stack.Screen
        name="RegistrationPage"
        component={RegistrationPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{ headerShown: false, title: 'Category' }}
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
        options={{ headerShown: true, title: 'Upload Document' }}
      />
      <Stack.Screen
        name="FamilyDoct"
        component={FamilyDoct}
        options={{ headerShown: false }}
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const [initialRouteName, setInitialRouteName] = useState('RegistrationPage');

  useEffect(() => {
    const fetchCurrentScreen = async () => {
      const data = await retrieveUserSession();
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
