import React, { useEffect, useRef, useState } from 'react';
import {
  DrawerLayoutAndroid,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import { Images } from '../assets/images/images';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../utilities/colors';
import Dashboard from './Dashboard';
import { useDispatch } from 'react-redux';
import { clearUser } from '../slices/UserSlices';
import { clearStorage, removeUserSession, retrieveUserSession, storeUserSession } from '../storageManager';

const HamburgerMenu = ({ navigation , route}) => {
  const drawer = useRef(null);
  // const  userData  = route?.params?.userData;
  // console.log(userData,'userData..')
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('')
  const [drawerPosition, setDrawerPosition] = useState('left');
  const [isAuthenticated, setIsAuthenticated] = useState('')
  // const changeDrawerPosition = () => {
  //   if (drawerPosition === 'left') {
  //     setDrawerPosition();
  //   } else {
  //     setDrawerPosition();
  //   }
  // };

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        console.log(data, 'data...,,,?')
        // const id = await DeviceInfo.getUniqueId();
        // setUniqueId(data.deviceId);
        setName(data.name)
        setEmail(data.email)
        setGender(data.gender)
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);



  const handleNavigation = () => {
    try {
    // removeUserSession()
    //   dispatch(clearUser());
    //   clearStorage();
      // storeUserSession({isAuthenticated : false})
      navigation.navigate('LockScreen');
    } catch{

    }
   
  }

  const navigationView = () => (
    <View style={{    backgroundColor: 'transparent',height: screenHeight + insets.top}}>  
      <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: normalize(30) }} >
        <Image source={Images.USER} style={{ width: 100, height: 100 }} resizeMode='center' />
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>{name}</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>{email}</Text>
      </View>
      <View style={styles.viewContainer}>
        <Text style={{  fontSize: 22, color: 'white', marginLeft: 20, fontWeight: 'bold',alignSelf: 'center'}} onPress={() => navigation.navigate('User')}>User</Text>
      </View>
      <View style={styles.viewContainer}>
        <Text style={{  fontSize: 22, color: 'white', marginLeft: 20, fontWeight: 'bold', alignSelf: 'center'}} onPress={() => navigation.navigate('Profile')}>Profile</Text>
      </View>
      <View style={styles.viewContainer1}>
        <Text style={{ fontSize: 22, color: 'white',  fontWeight: 'bold', }} onPress={handleNavigation}>Log out</Text>
      </View>
    </View>
  );

  return (
    // <SafeAreaView >
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth , height: screenHeight + insets.top }}>
        <DrawerLayoutAndroid
          ref={drawer}
          drawerWidth={300}
          drawerPosition={drawerPosition}
          renderNavigationView={navigationView}>
          <View style={{ flexDirection: 'row', justifyContent: "space-between", borderColor: 'black', borderBottomWidth: 1 ,  marginTop: normalize(50)}}>
            <TouchableOpacity onPress={() => drawer.current.openDrawer()}>
              <Image source={Images.MENU} style={styles.hamburgerMenu} />
            </TouchableOpacity>
            <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={styles.Image} />

          </View>
          <Dashboard />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 40, alignItems: 'center', paddingHorizontal: normalize(15), borderTopColor: 'black', borderTopWidth: 0.5 }}>
            <Image source={Images.HOME} style={{ width: 30, height: 30, }} />
            <Image source={Images.TIME} style={{ width: 30, height: 30 }} />
            <Image source={Images.SETTINGS} style={{ width: 30, height: 30 }} />
          </View>
        </DrawerLayoutAndroid>
      </ImageBackground>
  //  </SafeAreaView>
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
    marginTop: 510
  },
  Image: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    marginRight: normalize(10),
  }
});

export default HamburgerMenu;