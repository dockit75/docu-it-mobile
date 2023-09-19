import React, { useEffect, useRef, useState } from 'react';
import {
  DrawerLayoutAndroid,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { Images } from '../assets/images/images';
import { normalize, screenHeight, screenWidth } from '../utilities/measurement';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Dashboard from './Dashboard';
import { useDispatch } from 'react-redux';
import { retrieveUserSession } from '../storageManager';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const HamburgerMenu = ({ navigation, route }) => {
  const drawer = useRef(null);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        console.log(data, 'data...,,,?');
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);

  const handleLogout = () => {
    try {
      navigation.navigate('LockScreen');
    } catch (error) {
      console.error('Error in handleNavigation:', error);
    }
  };

  const handleUpload = () => {
    navigation.navigate('DocumentScannerScreen');
    closeDrawer();
  };

  const handleUser = () => {
    navigation.navigate('User');
    closeDrawer();
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
    closeDrawer();
  };

  const navigationView = () => (
    <>
      <View style={{ backgroundColor: 'transparent', height: screenHeight }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: normalize(30) }}>
          <Image source={Images.USER} style={{ width: 100, height: 100 }} resizeMode='center' />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', letterSpacing: 0.5 }}>{name}</Text>
        </View>
        <View style={styles.viewContainer}>
          <Text style={{ fontSize: 22, color: 'white', marginLeft: 20, fontWeight: 'bold', alignSelf: 'center' }} onPress={handleUser}>User</Text>
        </View>
        <View style={styles.viewContainer}>
          <Text style={{ fontSize: 22, color: 'white', marginLeft: 20, fontWeight: 'bold', alignSelf: 'center' }} onPress={handleProfile}>Profile</Text>
        </View>
        <View style={styles.viewContainer}>
          <Text style={{ fontSize: 22, color: 'white', marginLeft: 20, fontWeight: 'bold', alignSelf: 'center' }} onPress={handleUpload}>Upload</Text>
        </View>
      </View>
      <View style={styles.viewContainer1}>
        <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }} onPress={handleLogout}>Log out</Text>
      </View>
    </>
  );

  const openDrawer = () => {
    drawer.current.openDrawer();
  };

  const closeDrawer = () => {
    drawer.current.closeDrawer();
  };

  return (
    <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={navigationView}>
        <View style={{ flexDirection: 'row', justifyContent: "space-between", borderColor: 'black', borderBottomWidth: 1, marginTop: normalize(50) }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image source={Images.MENU} style={styles.hamburgerMenu} />
          </TouchableOpacity>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={styles.Image} />
        </View>
        <Dashboard />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 40, alignItems: 'center', paddingHorizontal: normalize(15), borderTopColor: 'black', borderTopWidth: 0.5 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={Images.HOME} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <Image source={Images.TIME} style={{ width: 30, height: 30 }} />
          <Image source={Images.SETTINGS} style={{ width: 30, height: 30 }} />
        </View>
      </DrawerLayoutAndroid>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    width: 290,
    height: 50,
    borderColor: 'black',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#0e9b81',
    borderBottomWidth: 1,
    marginVertical: 1
  },
  hamburgerMenu: {
    width: 42,
    height: 42,
    margin: 10,
  },
  viewContainer1: {
    width: 290,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e9b81',
  },
  Image: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    marginRight: normalize(10),
  }
});

export default HamburgerMenu;
