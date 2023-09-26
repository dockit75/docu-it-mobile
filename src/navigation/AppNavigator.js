import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import WelcomePage from '../screens/WelcomePage';
import OTPVerification from '../screens/OTPVerification';
import ScannerScreen from '../screens/Scanner';
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
import SaveDocumentScreen from '../screens/SaveDocumentScreen';
import CategoryScreen from '../screens/CategoryScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { normalize } from '../utilities/measurement';
import FamilyDoct from '../screens/FamilyDoct';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {
  const navigation = useNavigation();

  const customHeaderOption = {
    gestureEnabled: true,
    headerShown: true,
    headerLeft: () => (
      <TouchableOpacity
        style={{ marginLeft: normalize(20) }}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" color="white" size={normalize(20)} />
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: '#0e9b81',
    },
    headerTintColor: 'white',
    headerTitleAlign: 'center',
    headerTitleStyle: {
      fontSize: 17,
    },
    headerTitleAllowFontScaling: true,
  };
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
        name="CategoryScreen"
        component={CategoryScreen}
        options={{ headerShown: true, title:'Category' }}
        
      />
      <Stack.Screen
        name="SaveDocumentScreen"
        component={SaveDocumentScreen}
        options={{ headerShown: true ,title:'Save Document'}}
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
        //options={{ headerShown: true,title:'Upload Document' }}
        options={({ route }) => ({
          ...customHeaderOption,
          title: route.params.title,
          cardStyleInterpolator:
            CardStyleInterpolators.forFadeFromBottomAndroid,
        })}
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
