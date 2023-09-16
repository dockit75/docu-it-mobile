import React, { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from '../screens/WelcomePage';
import OTPVerification from '../screens/OTPVerification';
import ScannerScreen from '../screens/Scanner';
import ResultViewerScreen from '../screens/ResultViewerScreen';
import LockScreen from '../screens/LockScreen';
import { retrieveCurrentScreen, retrieveUserSession } from '../storageManager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import { setUser, clearUser } from '../slices/UserSlices';
import RegistrationPage from '../screens/RegistrationPage';
import { StatusBar } from 'react-native'
import { COLORS } from '../utilities/colors';
import HamburgerMenu from '../screens/Drawer';
import User from '../screens/User';
import Profile from '../screens/Profile';
import PinGenerationScreen from '../screens/PinGenerationScreen';
import DocumentScannerScreen from '../screens/DocumentScannerScreen';


const Stack = createStackNavigator();

const AppNavigator = ({currentScreen}) => {
  // const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // const [isAuthenticated, setIsAuthenticated] = useState('');

  // console.log(isAuthenticated === true ,'inis>>>....')
  // {isAuthenticated ? (
  //   {'RegistrationPage' : 'LockScreen'}
  // ) : (
  //   {'LockScreen' : 'RegistrationPage'}
  // )}

  console.log(currentScreen,'isAuthenticated.....');
  return (

    <Stack.Navigator initialRouteName={currentScreen}>
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
      {/* <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ headerShown: true }}
      /> */}
      {/* <Stack.Screen
     name="DocumentScannerScreen"
     component={DocumentScannerScreen}
     options={{ headerShown: true }}
   /> */}
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

  const [currentScreen, setCurrentScreen] = useState('')

  useEffect(() => {
    const fetchCurrentScreen = async () => {
      const data = await retrieveUserSession();
      console.log(data, 'data>>>>>>')
      // setIsAuthenticated(data.isAuthenticated)
       setCurrentScreen(data.isAuthenticated ? 'LockScreen' : 'RegistrationPage')
      

      // console.log(currentScreen, 'appnav current screen');
      // setInitialRouteName(currentScreen); 
    };
    fetchCurrentScreen();
  }, []);

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.transparent} translucent={true} />
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator currentScreen={currentScreen} />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;