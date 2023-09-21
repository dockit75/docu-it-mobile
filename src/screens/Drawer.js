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
import { COLORS } from '../utilities/colors';
import Icon from 'react-native-vector-icons/Ionicons'; // You can use another icon library if you prefer
import UserAvatar from 'react-native-user-avatar';

// const Tab = createBottomTabNavigator();

const HamburgerMenu = ({ navigation, route }) => {
  const drawer = useRef(null);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        console.log(data, 'data...,,,?');
        setName(data.name);
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

  const handleSettings = () => {
  navigation.navigate('Settings')
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
      <View style={{ backgroundColor: '#0e9b81', flex: 1}}>
        <View style={{ flexDirection: 'row', marginTop: normalize(60), marginHorizontal: normalize(15)}}>
        <UserAvatar size={60} name={name.charAt(0)} bgColor="#e0ffff" textColor='black'/>
          <Text style={{ fontSize: 20, fontWeight: '500', color: 'white', letterSpacing: 0.5 , margin: 15}}>{name}</Text>
        </View>
        <View style={styles.editProfile}>
          <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
            <Icon name="person-outline" size={24} color={COLORS.black} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
           <View style={{borderBottomWidth: 0.5, }}/>
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Icon name="cog-outline" size={24} color={COLORS.black} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <View style={{borderBottomWidth: 0.5 }}/>
          <TouchableOpacity style={styles.menuItem} onPress={handleUser}>
            <Icon name="share-outline" size={24} color={COLORS.black} />
            <Text style={styles.menuText}>Invite</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.viewContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color={COLORS.red} />
            <Text style={styles.menuTextLogout}>Log out</Text>
          </TouchableOpacity>
        </View>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 40, alignItems: 'center', paddingHorizontal: normalize(15), borderTopColor: 'black', borderTopWidth: 0.9 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Icon name="home-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity >
            <Icon name="cog-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </DrawerLayoutAndroid>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    width: normalize(260),
    height: normalize(52),
    alignSelf: 'center',
    backgroundColor: 'rgb(242, 245, 249)',
    borderRadius: 5
  },
  editProfile: {
    width: normalize(260),
    height: normalize(158),
    borderColor: 'black',
    alignSelf: 'center',
    backgroundColor: 'rgb(242, 245, 249)',
    marginVertical: 1,
    borderRadius: 10,
    marginVertical: normalize(20),
  },
  menuItem: {
    flexDirection: 'row',
    paddingLeft: 20,
    marginVertical: 16,
  },
  menuText: {
    fontSize: 18,
    color: 'black',
    marginLeft: 20,
    fontWeight: '500',
  },
  menuTextLogout: {
    fontSize: 18,
    color: 'red',
    marginLeft: 20,
    fontWeight: '500',
  },
  hamburgerMenu: {
    width: 38,
    height: 38,
    margin: 10,
  },
  Image: {
    width: 28,
    height: 28,
    alignSelf: 'center',
    marginRight: normalize(10),
  }
});

export default HamburgerMenu;