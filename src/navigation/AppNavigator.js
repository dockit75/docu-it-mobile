import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import OTPVerification from '../screens/OTPVerification';
import LockScreen from '../screens/LockScreen';
import { retrieveUserSession } from '../storageManager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import RegistrationPage from '../screens/RegistrationPage';
import { AppState, StatusBar, TouchableOpacity } from 'react-native'
import { COLORS } from '../utilities/colors';
import HamburgerMenu from '../screens/home/index';
import User from '../screens/User';
import Profile from '../screens/Profile';
import PinGenerationScreen from '../screens/PinGenerationScreen';
import DocumentScannerScreen from '../screens/documentUpload/index';
import UploadedPreview from '../screens/documentUpload/uploadedPreview';
import UploadedComplete from '../screens/documentUpload/uploadConfirmation';
import Settings from '../screens/Settings';
import CategoryScreen from '../screens/category';
import FamilyDocument from '../screens/FamilyDocument/Family';
import FamilyMember from '../screens/FamilyDocument/Member/FamilyMember';
import PendingUser from '../screens/FamilyDocument/PendingInvites/PendingUser';
import CommonInvite from '../screens/FamilyDocument/CommonInvite';
// import Onboard from '../screens/onboard';
import DocumentFamily from '../screens/documentUpload/documentFamily';
import DocumentMember from '../screens/documentUpload/documentMember';
import DocumentAccordian from '../screens/documentUpload/documentAccordian';
import ChangePin from '../screens/ChangePin';

import { PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {


  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} >
      {/* <Stack.Screen
        name="onBoard"
        component={Onboard}
        options={{ headerShown: false }}
      /> */}
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
        options={{ headerShown: false, title: 'Upload Document' }}
      />
      <Stack.Screen
        name="uploadPreview"
        component={UploadedPreview}
        options={{ headerShown: false, title: 'Upload Preview' }}
      />
      <Stack.Screen
        name="uploadFinished"
        component={UploadedComplete}
        options={{ headerShown: false, title: 'Upload UploadedComplete' }}
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
      <Stack.Screen
       name="FamilyDocument"
       component={FamilyDocument}
       options={{ headerShown: false }}
     />
      <Stack.Screen
       name="FamilyMember"
       component={FamilyMember}
       options={{ headerShown: false }}
     />
  
      <Stack.Screen
       name="PendingUser"
       component={PendingUser}
       options={{ headerShown: false }}
     />
     <Stack.Screen
      name="CommonInvite"
      component={CommonInvite}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentFamily"
      component={DocumentFamily}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentMember"
      component={DocumentMember}
      options={{ headerShown: false }}
    />
     <Stack.Screen
      name="ChangePin"
      component={ChangePin}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentAccordian"
      component={DocumentAccordian}
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
      if (data?.isAuthenticated || data?.phone?.length) {
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
