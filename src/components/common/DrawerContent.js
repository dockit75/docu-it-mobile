import React, {useEffect, useRef, useState} from 'react';
import {
  DrawerLayoutAndroid,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {Images} from '../../assets/images/images';
import {
  normalize,
  screenHeight,
  screenWidth,
} from '../../utilities/measurement';
import {COLORS} from '../../utilities/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import UserAvatar from 'react-native-user-avatar';
import {useDispatch} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {clearStorage, retrieveUserSession, storeUserDetail, storeUserSession} from '../../storageManager';
import {useNavigation} from '@react-navigation/native';

const drawerOptions = [
  {name: 'Edit Profile', path: 'Profile', icon: 'person'},
  {name: 'Settings', path: 'Settings', icon: 'cog'},
  // {name: 'Invite', path: 'User', icon: 'share-outline'},
]

const DrawerContent = ({route, drawerRef}) => {
  const drawer = useRef(null);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // (async () => {
    //   try {
    //     const data = await retrieveUserSession();
    //     setUserData(data)
    //     setName(data.name);
    //   } catch (error) {
    //     console.error('Error in useEffect:', error);
    //   }
    // })();
    const unsubscribe = navigation.addListener('focus', async () => {
      getUserInfo();
 
    });

    return unsubscribe;
  }, []);

  const getUserInfo = async () => {

    try {
      const data = await retrieveUserSession();
      setUserData(data)
      setName(data.name);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }

  const handleLogout = async () => {
    try {
      drawerRef.current?.close()
      await storeUserSession({ ...userData, isAuthenticated: false})
      await storeUserDetail({ ...userData, isAuthenticated: false })
      navigation.navigate('LockScreen', {signInParam: false});
      // clearStorage();
    } catch (error) {
      console.error('Error in handleNavigation:', error);
    }
  };
  const handleSettings = () => {
    navigation.navigate('Settings')
  };

  const handleUser = () => {
    navigation.navigate('User')
  };

  const handleProfile = () => {
    navigation.navigate('Profile')
  };

  const handleOption = (path) => navigation.navigate(path)

  const renderOption = (item, index) => {
    return <>
      <View style={{borderBottomWidth: 0.5, borderBottomColor: COLORS.lightGray}} />
      <TouchableOpacity style={styles.menuItem} onPress={() => handleOption(item.path)}>
        <Icon name={item.icon} size={24} color={COLORS.black} />
        <Text style={styles.menuText}>{item.name}</Text>
      </TouchableOpacity>
    </>
  }
 
  return (
    <View style={{
      backgroundColor: '#0e9b81', padding: 20, height: '100%',  paddingTop: insets.top// Adjust the z-index to be above other components
      }}>
      <View
        style={{
          flexDirection: 'row',
          marginTop: normalize(insets.top),
          marginHorizontal: normalize(15),
        }}>
        <TouchableOpacity onPress={() => handleOption(drawerOptions[0].path)}>
          <UserAvatar
            size={60}
            name={name.charAt(0)}
            bgColor="#e0ffff"
            textColor="black"
            src={userData?.imageUrl ?? null}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '500',
            color: 'black',
            letterSpacing: 0.5,
            margin: 15,
          }}
          onPress={() => handleOption(drawerOptions[0].path)}
        >
          {name}
        </Text>
      </View>
      <View style={styles.editProfile}>
        {
          drawerOptions.map(renderOption)
        }
      </View>
      <View style={styles.viewContainer}>
        <TouchableOpacity style={[styles.menuItem, {marginVertical: 12}]} onPress={handleLogout}>
          {/* <Image
            source={Images.LOG_OUT}
            style={{width: 22, height: 22, marginTop: normalize(3)}}
          /> */}

          <Icon name={'arrow-back'} size={24} color={COLORS.black} />
          <Text style={styles.menuTextLogout}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default DrawerContent;

const styles = StyleSheet.create({
  viewContainer: {
    width: normalize(250),
    // height: normalize(55),
    alignSelf: 'center',
    backgroundColor: 'rgb(242, 245, 249)',
    borderRadius: 5,
  },
  editProfile: {
    width: normalize(250),
    height: 'auto',
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
  },
});
