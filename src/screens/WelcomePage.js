import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { clearStorage, retrieveUserSession } from '../storageManager';
import { normalize, normalizeVertical } from '../utilities/measurement';
import { useDispatch } from 'react-redux';
import { clearUser } from '../slices/UserSlices';

const WelcomePage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      //  await AsyncStorage.clear();
      const data = await retrieveUserSession();
      // console.log('***********welcome*******data********',data);
      // if (!data?.token || isJwtExpired(data?.token)) {
      // if (!data.username) {
      //   console.log('InValid');
      // } else {
        
      //   navigation.navigate('WelcomePage');
      // }
      setUsername(data.userName);
      // console.log('------------welcome----------------',data.userName);
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     const data = await retrieveUserSession();
  //     // // if (!data?.token || isJwtExpired(data?.token)) {
  //     // if (!data.username) {
  //     //   console.log('InValid');
  //     // } else {
  //     //   navigation.navigate('WelcomePage');
  //     // }
  //     console.log(data,'###################');
  //     setUsername(data.username);
  //   })();
  // }, []);

  // const userName = useSelector((state) => state.user);
  // console.log('------------welcome-----redux-----------',userName);
  const handleLogout = () => {
    // dispatch(clearUser());
    // clearStorage();
    navigation.navigate('RegistrationPage');
  };
  
  const handlescanner = () => {
    navigation.navigate('Scanner');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the App! {username}</Text>
      <TouchableOpacity style={styles.scannerButton} onPress={handlescanner}>
        <Text style={styles.buttonText}>Go to Scanner</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    gap: normalizeVertical(40),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: 'red',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  scannerButton: {
    backgroundColor: 'blue',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomePage;